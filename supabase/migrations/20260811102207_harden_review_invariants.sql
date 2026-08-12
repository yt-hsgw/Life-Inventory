-- Review history is append-only and may only be written through review_item.
drop policy if exists "item_reviews_insert_own" on public.item_reviews;
revoke insert on public.item_reviews from authenticated;

alter table public.item_reviews
  add column review_session_id uuid;
create unique index item_reviews_user_session_item_unique
  on public.item_reviews (user_id, review_session_id, item_id)
  where review_session_id is not null;

-- UC-03 compares one Ideal row with one same-name/current-category aggregate.
-- Enforce that identity at the database boundary so totals cannot double count.
create unique index ideal_items_user_category_name_unique
  on public.ideal_items (user_id, category_id, lower(btrim(name)));

drop function public.review_item(uuid, text, text);

create function public.review_item(
  p_item_id uuid,
  p_decision text,
  p_session_id uuid,
  p_memo text default null
)
returns public.item_reviews
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_item public.items;
  v_review public.item_reviews;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if p_decision not in ('KEEP', 'MAYBE', 'RELEASE') then
    raise exception 'invalid review decision';
  end if;

  if p_session_id is null then
    raise exception 'invalid review session';
  end if;

  select * into v_item
  from public.items
  where id = p_item_id
    and user_id = v_user_id
    and archived_at is null
  for update;

  if not found then
    raise exception 'item not found';
  end if;

  select * into v_review
  from public.item_reviews as review
  where review.user_id = v_user_id
    and review.item_id = p_item_id
    and review.review_session_id = p_session_id
  order by review.reviewed_at desc
  limit 1;

  if found then
    return v_review;
  end if;

  if not v_item.review_requested and v_item.status <> 'MAYBE' then
    raise exception 'item is not in the review queue';
  end if;

  update public.items
  set status = p_decision,
      review_requested = false
  where id = p_item_id
    and user_id = v_user_id;

  insert into public.item_reviews (
    user_id, item_id, previous_status, decision, review_session_id, memo
  ) values (
    v_user_id, p_item_id, v_item.status, p_decision, p_session_id,
    nullif(trim(p_memo), '')
  ) returning * into v_review;

  return v_review;
end;
$$;

revoke all on function public.review_item(uuid, text, uuid, text)
  from public, anon;
grant execute on function public.review_item(uuid, text, uuid, text)
  to authenticated;

-- MAYBE remains eligible for every new Review session, while Items already
-- decided in the current session are excluded from its remaining queue.
create function public.get_review_queue(
  p_session_id uuid,
  p_limit integer default 500
)
returns setof public.items
language sql
stable
security invoker
set search_path = ''
as $$
  select item.*
  from public.items as item
  where item.user_id = (select auth.uid())
    and item.archived_at is null
    and (item.review_requested = true or item.status = 'MAYBE')
    and not exists (
      select 1
      from public.item_reviews as review
      where review.user_id = item.user_id
        and review.item_id = item.id
        and review.review_session_id = p_session_id
    )
  order by item.updated_at, item.id
  limit greatest(1, least(coalesce(p_limit, 500), 500));
$$;

create function public.get_review_queue_count()
returns bigint
language sql
stable
security invoker
set search_path = ''
as $$
  select count(*)
  from public.items as item
  where item.user_id = (select auth.uid())
    and item.archived_at is null
    and (item.review_requested = true or item.status = 'MAYBE');
$$;

revoke all on function public.get_review_queue(uuid, integer)
  from public, anon;
revoke all on function public.get_review_queue_count() from public, anon;
grant execute on function public.get_review_queue(uuid, integer)
  to authenticated;
grant execute on function public.get_review_queue_count() to authenticated;
