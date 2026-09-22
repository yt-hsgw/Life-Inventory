-- Photos are uploaded first to a user-owned Storage folder, then represented
-- as short-lived drafts. The RPCs below consume those drafts in the same
-- transaction that creates or updates the Item/photo metadata.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) values (
  'item-photos',
  'item-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create table public.item_photo_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null
    check (
      char_length(storage_path) between 38 and 1024
      and storage_path like user_id::text || '/%'
    ),
  content_type text not null
    check (content_type in ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes bigint not null
    check (size_bytes between 1 and 5242880),
  analysis jsonb
    check (analysis is null or pg_column_size(analysis) <= 65536),
  analysis_status text not null default 'pending'
    check (analysis_status in ('pending', 'processing', 'completed', 'failed')),
  analysis_attempts smallint not null default 0
    check (analysis_attempts between 0 and 2),
  analysis_claim_token uuid,
  analysis_claimed_at timestamptz,
  consumed_item_id uuid,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  unique (storage_path),
  constraint item_photo_drafts_consumed_owned_item_fk
    foreign key (consumed_item_id, user_id)
    references public.items (id, user_id)
    on delete restrict,
  constraint item_photo_drafts_analysis_state_check
    check (
      (
        analysis_status = 'pending'
        and analysis is null
        and analysis_claim_token is null
        and analysis_claimed_at is null
      )
      or (
        analysis_status = 'processing'
        and analysis is null
        and analysis_claim_token is not null
        and analysis_claimed_at is not null
      )
      or (
        analysis_status = 'completed'
        and analysis is not null
        and analysis_claim_token is null
        and analysis_claimed_at is null
      )
      or (
        analysis_status = 'failed'
        and analysis is null
        and analysis_claim_token is null
        and analysis_claimed_at is null
      )
    )
);

create index item_photo_drafts_available_user_created_idx
  on public.item_photo_drafts (user_id, created_at, id)
  where consumed_item_id is null;
create index item_photo_drafts_consumed_item_owner_fk_idx
  on public.item_photo_drafts (consumed_item_id, user_id)
  where consumed_item_id is not null;
create index item_photo_drafts_analysis_processing_idx
  on public.item_photo_drafts (analysis_claimed_at, id)
  where consumed_item_id is null and analysis_status = 'processing';

-- Storage deletion cannot be part of a Postgres transaction. Draft removal
-- therefore moves the object path into a private outbox first. A service-role
-- worker deletes Storage and acknowledges the outbox row afterwards.
create table private.item_photo_deletion_queue (
  storage_path text primary key,
  user_id uuid not null,
  reason text not null check (reason in ('user_deleted', 'expired')),
  enqueued_at timestamptz not null default now(),
  claimed_at timestamptz,
  attempts integer not null default 0 check (attempts >= 0)
);

create index item_photo_deletion_queue_available_idx
  on private.item_photo_deletion_queue (claimed_at, enqueued_at, storage_path);

alter table private.item_photo_deletion_queue enable row level security;
revoke all on private.item_photo_deletion_queue from public, anon, authenticated;

-- One row represents one billable AI-analysis attempt. Old rows for a user are
-- pruned while holding that user's advisory lock, bounding this table while
-- preserving a race-safe rolling one-hour quota.
create table private.item_photo_analysis_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  draft_id uuid not null,
  created_at timestamptz not null default now()
);

create index item_photo_analysis_attempts_user_created_idx
  on private.item_photo_analysis_attempts (user_id, created_at);

alter table private.item_photo_analysis_attempts enable row level security;
revoke all on private.item_photo_analysis_attempts from public, anon, authenticated;

create table public.item_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null,
  storage_path text not null
    check (
      char_length(storage_path) between 38 and 1024
      and storage_path like user_id::text || '/%'
    ),
  content_type text not null
    check (content_type in ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes bigint not null
    check (size_bytes between 1 and 5242880),
  analysis jsonb
    check (analysis is null or pg_column_size(analysis) <= 65536),
  display_order smallint not null
    check (display_order between 0 and 9),
  created_at timestamptz not null default now(),
  unique (id, user_id),
  unique (storage_path),
  constraint item_photos_item_display_order_unique
    unique (item_id, display_order)
    deferrable initially immediate,
  constraint item_photos_owned_item_fk
    foreign key (item_id, user_id)
    references public.items (id, user_id)
    on delete cascade
);

create index item_photos_item_owner_order_idx
  on public.item_photos (item_id, user_id, display_order);
create index item_photos_user_created_idx
  on public.item_photos (user_id, created_at desc);

alter table public.item_photo_drafts enable row level security;
alter table public.item_photos enable row level security;

create policy "item_photo_drafts_select_own"
  on public.item_photo_drafts
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "item_photos_select_own"
  on public.item_photos
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- Authenticated clients may only read their own objects. Uploads and deletions
-- are server-only operations performed with the service role.
create policy "item_photos_storage_select_own"
  on storage.objects
  for select to authenticated
  using (
    bucket_id = 'item-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- RPC writes still pass these defense-in-depth checks: a photo must point to
-- an existing object and no Item can exceed ten photos.
create function private.validate_item_photo_storage_object()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from storage.objects as object
    where object.bucket_id = 'item-photos'
      and object.name = new.storage_path
      and object.metadata ->> 'mimetype' = new.content_type
      and object.metadata ->> 'size' = new.size_bytes::text
  ) then
    raise exception 'item photo storage object or metadata not found'
      using errcode = '23503';
  end if;

  return new;
end;
$$;

create trigger item_photo_drafts_validate_storage_object
  before insert or update of storage_path, content_type, size_bytes
  on public.item_photo_drafts
  for each row execute function private.validate_item_photo_storage_object();

create function private.validate_item_photo()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_photo_count integer;
begin
  if not exists (
    select 1
    from storage.objects as object
    where object.bucket_id = 'item-photos'
      and object.name = new.storage_path
      and object.metadata ->> 'mimetype' = new.content_type
      and object.metadata ->> 'size' = new.size_bytes::text
  ) then
    raise exception 'item photo storage object or metadata not found'
      using errcode = '23503';
  end if;

  if tg_op = 'INSERT' or new.item_id is distinct from old.item_id then
    perform 1
    from public.items as item
    where item.id = new.item_id
      and item.user_id = new.user_id
      and item.archived_at is null
    for update;

    if not found then
      raise exception 'active item not found'
        using errcode = '23503';
    end if;

    select count(*)
    into v_photo_count
    from public.item_photos as photo
    where photo.item_id = new.item_id
      and photo.user_id = new.user_id;

    if v_photo_count >= 10 then
      raise exception 'an item can have at most 10 photos'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

create trigger item_photos_validate
  before insert or update of user_id, item_id, storage_path, content_type, size_bytes
  on public.item_photos
  for each row execute function private.validate_item_photo();

create function public.create_item_photo_draft(
  p_storage_path text,
  p_content_type text,
  p_size_bytes bigint
)
returns public.item_photo_drafts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_draft public.item_photo_drafts;
  v_active_count integer;
  v_confirmed_count integer;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if p_storage_path is null
     or char_length(p_storage_path) > 1024
     or p_storage_path not like v_user_id::text || '/drafts/%' then
    raise exception 'invalid photo storage path' using errcode = '22023';
  end if;

  if p_content_type not in ('image/jpeg', 'image/png', 'image/webp')
     or p_size_bytes not between 1 and 5242880 then
    raise exception 'invalid photo metadata' using errcode = '22023';
  end if;

  -- Serialize the per-user active-draft limit across different draft rows.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('item-photo-drafts:' || v_user_id::text, 0)
  );

  select count(*)
  into v_active_count
  from public.item_photo_drafts as draft
  where draft.user_id = v_user_id
    and draft.consumed_item_id is null;

  select count(*)
  into v_confirmed_count
  from public.item_photos as photo
  where photo.user_id = v_user_id;

  if v_active_count >= 50 then
    raise exception 'too many active photo drafts' using errcode = '23514';
  end if;

  if v_confirmed_count + v_active_count >= 500 then
    raise exception 'item photo storage limit exceeded' using errcode = '23514';
  end if;

  insert into public.item_photo_drafts (
    user_id,
    storage_path,
    content_type,
    size_bytes
  ) values (
    v_user_id,
    p_storage_path,
    p_content_type,
    p_size_bytes
  )
  returning * into v_draft;

  return v_draft;
end;
$$;

create function public.queue_item_photo_draft_deletion(p_draft_id uuid)
returns table(storage_path text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_draft public.item_photo_drafts;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select draft.*
  into v_draft
  from public.item_photo_drafts as draft
  where draft.id = p_draft_id
    and draft.user_id = v_user_id
    and draft.consumed_item_id is null
  for update;

  if not found then
    raise exception 'photo draft not found' using errcode = 'P0002';
  end if;

  if v_draft.analysis_status = 'processing'
     and v_draft.analysis_claimed_at >= now() - interval '5 minutes' then
    raise exception 'photo analysis is still processing' using errcode = '55000';
  end if;

  insert into private.item_photo_deletion_queue as queue (
    storage_path,
    user_id,
    reason,
    claimed_at,
    attempts
  ) values (
    v_draft.storage_path,
    v_user_id,
    'user_deleted',
    now(),
    1
  )
  on conflict on constraint item_photo_deletion_queue_pkey do update
  set claimed_at = excluded.claimed_at,
      attempts = queue.attempts + 1;

  delete from public.item_photo_drafts as draft
  where draft.id = v_draft.id
    and draft.user_id = v_user_id;

  return query select v_draft.storage_path;
end;
$$;

create function public.queue_expired_item_photo_drafts(
  p_limit integer default 50,
  p_expired_before timestamptz default (now() - interval '24 hours')
)
returns table(storage_path text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_draft record;
  v_cutoff timestamptz := least(p_expired_before, now() - interval '24 hours');
begin
  if p_limit not between 1 and 100 or p_expired_before is null then
    raise exception 'invalid cleanup request' using errcode = '22023';
  end if;

  for v_draft in
    select draft.id, draft.user_id, draft.storage_path
    from public.item_photo_drafts as draft
    where draft.consumed_item_id is null
      and draft.created_at <= v_cutoff
      and (
        draft.analysis_status <> 'processing'
        or draft.analysis_claimed_at < now() - interval '5 minutes'
      )
    order by draft.created_at, draft.id
    for update skip locked
    limit p_limit
  loop
    insert into private.item_photo_deletion_queue as queue (
      storage_path,
      user_id,
      reason,
      claimed_at,
      attempts
    ) values (
      v_draft.storage_path,
      v_draft.user_id,
      'expired',
      now(),
      1
    )
    on conflict on constraint item_photo_deletion_queue_pkey do update
    set claimed_at = excluded.claimed_at,
        attempts = queue.attempts + 1;

    delete from public.item_photo_drafts as draft
    where draft.id = v_draft.id
      and draft.user_id = v_draft.user_id
      and draft.consumed_item_id is null;

    if found then
      storage_path := v_draft.storage_path;
      return next;
    end if;
  end loop;
end;
$$;

create function public.claim_item_photo_deletion_queue(
  p_limit integer default 50
)
returns table(storage_path text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_limit not between 1 and 100 then
    raise exception 'invalid queue claim limit' using errcode = '22023';
  end if;

  return query
  with available as (
    select queue.storage_path
    from private.item_photo_deletion_queue as queue
    where queue.claimed_at is null
       or queue.claimed_at < now() - interval '5 minutes'
    order by queue.enqueued_at, queue.storage_path
    for update skip locked
    limit p_limit
  )
  update private.item_photo_deletion_queue as queue
  set claimed_at = now(),
      attempts = queue.attempts + 1
  from available
  where queue.storage_path = available.storage_path
  returning queue.storage_path;
end;
$$;

create function public.complete_item_photo_deletion(p_storage_path text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted_count integer;
begin
  delete from private.item_photo_deletion_queue as queue
  where queue.storage_path = p_storage_path;
  get diagnostics v_deleted_count = row_count;
  return v_deleted_count = 1;
end;
$$;

create function public.claim_item_photo_draft_analysis(p_draft_id uuid)
returns table(
  draft_id uuid,
  storage_path text,
  content_type text,
  size_bytes bigint,
  analysis jsonb,
  analysis_status text,
  claim_token uuid,
  attempt_no smallint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_draft public.item_photo_drafts;
  v_hourly_attempts integer;
  v_claim_token uuid;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  -- Claims for different drafts belonging to the same user must share one
  -- quota lock; the draft row lock alone cannot make the hourly count atomic.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('item-photo-analysis:' || v_user_id::text, 0)
  );

  select draft.*
  into v_draft
  from public.item_photo_drafts as draft
  where draft.id = p_draft_id
    and draft.user_id = v_user_id
    and draft.consumed_item_id is null
  for update;

  if not found then
    raise exception 'photo draft not found' using errcode = 'P0002';
  end if;

  if v_draft.analysis_status = 'completed' then
    return query select
      v_draft.id,
      v_draft.storage_path,
      v_draft.content_type,
      v_draft.size_bytes,
      v_draft.analysis,
      v_draft.analysis_status,
      null::uuid,
      v_draft.analysis_attempts;
    return;
  end if;

  if v_draft.analysis_status = 'processing'
     and v_draft.analysis_claimed_at >= now() - interval '5 minutes' then
    return query select
      v_draft.id,
      v_draft.storage_path,
      v_draft.content_type,
      v_draft.size_bytes,
      null::jsonb,
      v_draft.analysis_status,
      null::uuid,
      v_draft.analysis_attempts;
    return;
  end if;

  if v_draft.analysis_attempts >= 2 then
    update public.item_photo_drafts as draft
    set analysis_status = 'failed',
        analysis_claim_token = null,
        analysis_claimed_at = null
    where draft.id = v_draft.id
    returning * into v_draft;

    return query select
      v_draft.id,
      v_draft.storage_path,
      v_draft.content_type,
      v_draft.size_bytes,
      null::jsonb,
      v_draft.analysis_status,
      null::uuid,
      v_draft.analysis_attempts;
    return;
  end if;

  delete from private.item_photo_analysis_attempts as attempt
  where attempt.user_id = v_user_id
    and attempt.created_at <= now() - interval '1 hour';

  select count(*)
  into v_hourly_attempts
  from private.item_photo_analysis_attempts as attempt
  where attempt.user_id = v_user_id
    and attempt.created_at > now() - interval '1 hour';

  if v_hourly_attempts >= 20 then
    raise exception 'photo analysis hourly limit exceeded' using errcode = 'P0001';
  end if;

  v_claim_token := gen_random_uuid();

  update public.item_photo_drafts as draft
  set analysis_status = 'processing',
      analysis_attempts = draft.analysis_attempts + 1,
      analysis_claim_token = v_claim_token,
      analysis_claimed_at = now()
  where draft.id = v_draft.id
  returning * into v_draft;

  insert into private.item_photo_analysis_attempts (user_id, draft_id)
  values (v_user_id, v_draft.id);

  return query select
    v_draft.id,
    v_draft.storage_path,
    v_draft.content_type,
    v_draft.size_bytes,
    null::jsonb,
    v_draft.analysis_status,
    v_claim_token,
    v_draft.analysis_attempts;
end;
$$;

create function public.complete_item_photo_draft_analysis(
  p_draft_id uuid,
  p_claim_token uuid,
  p_analysis jsonb
)
returns public.item_photo_drafts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_draft public.item_photo_drafts;
begin
  if p_claim_token is null
     or p_analysis is null
     or jsonb_typeof(p_analysis) <> 'object'
     or pg_column_size(p_analysis) > 65536 then
    raise exception 'invalid photo analysis result' using errcode = '22023';
  end if;

  update public.item_photo_drafts as draft
  set analysis = p_analysis,
      analysis_status = 'completed',
      analysis_claim_token = null,
      analysis_claimed_at = null
  where draft.id = p_draft_id
    and draft.consumed_item_id is null
    and draft.analysis_status = 'processing'
    and draft.analysis_claim_token = p_claim_token
  returning * into v_draft;

  if not found then
    raise exception 'photo analysis claim not found' using errcode = 'P0002';
  end if;

  return v_draft;
end;
$$;

create function public.fail_item_photo_draft_analysis(
  p_draft_id uuid,
  p_claim_token uuid
)
returns public.item_photo_drafts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_draft public.item_photo_drafts;
begin
  update public.item_photo_drafts as draft
  set analysis_status = case
        when draft.analysis_attempts >= 2 then 'failed'
        else 'pending'
      end,
      analysis_claim_token = null,
      analysis_claimed_at = null
  where draft.id = p_draft_id
    and draft.consumed_item_id is null
    and draft.analysis_status = 'processing'
    and draft.analysis_claim_token = p_claim_token
  returning * into v_draft;

  if not found then
    raise exception 'photo analysis claim not found' using errcode = 'P0002';
  end if;

  return v_draft;
end;
$$;

create function public.attach_item_photo_drafts(
  p_item_id uuid,
  p_photo_draft_ids uuid[]
)
returns setof public.item_photos
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_draft_ids uuid[] := coalesce(p_photo_draft_ids, '{}'::uuid[]);
  v_draft_count integer;
  v_existing_count integer;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if cardinality(v_draft_ids) > 10
     or array_position(v_draft_ids, null) is not null
     or (
       select count(distinct draft_id)
       from unnest(v_draft_ids) as input(draft_id)
     ) <> cardinality(v_draft_ids) then
    raise exception 'provide at most 10 unique photo draft ids'
      using errcode = '22023';
  end if;

  perform 1
  from public.items as item
  where item.id = p_item_id
    and item.user_id = v_user_id
    and item.archived_at is null
  for update;

  if not found then
    raise exception 'active item not found' using errcode = 'P0002';
  end if;

  perform 1
  from public.item_photo_drafts as draft
  where draft.user_id = v_user_id
    and draft.id = any(v_draft_ids)
    and draft.consumed_item_id is null
  order by draft.id
  for update;
  get diagnostics v_draft_count = row_count;

  if v_draft_count <> cardinality(v_draft_ids) then
    raise exception 'photo draft not found' using errcode = 'P0002';
  end if;

  if exists (
    select 1
    from public.item_photo_drafts as draft
    where draft.user_id = v_user_id
      and draft.id = any(v_draft_ids)
      and draft.analysis_status = 'processing'
  ) then
    raise exception 'photo analysis is still processing' using errcode = '55000';
  end if;

  select count(*)
  into v_existing_count
  from public.item_photos as photo
  where photo.item_id = p_item_id
    and photo.user_id = v_user_id;

  if v_existing_count + v_draft_count > 10 then
    raise exception 'an item can have at most 10 photos'
      using errcode = '23514';
  end if;

  if v_draft_count > 0 then
    set constraints public.item_photos_item_display_order_unique deferred;

    with ordered_photos as (
      select
        photo.id,
        (row_number() over (
          order by photo.display_order, photo.created_at, photo.id
        ) - 1)::smallint as next_display_order
      from public.item_photos as photo
      where photo.item_id = p_item_id
        and photo.user_id = v_user_id
    )
    update public.item_photos as photo
    set display_order = ordered.next_display_order
    from ordered_photos as ordered
    where photo.id = ordered.id;

    insert into public.item_photos (
      user_id,
      item_id,
      storage_path,
      content_type,
      size_bytes,
      analysis,
      display_order
    )
    select
      v_user_id,
      p_item_id,
      draft.storage_path,
      draft.content_type,
      draft.size_bytes,
      draft.analysis,
      (v_existing_count + input.ordinality - 1)::smallint
    from unnest(v_draft_ids) with ordinality as input(draft_id, ordinality)
    join public.item_photo_drafts as draft
      on draft.id = input.draft_id
     and draft.user_id = v_user_id
     and draft.consumed_item_id is null
    order by input.ordinality;

    update public.item_photo_drafts as draft
    set consumed_item_id = p_item_id
    where draft.user_id = v_user_id
      and draft.id = any(v_draft_ids)
      and draft.consumed_item_id is null;
  end if;

  return query
  select photo.*
  from public.item_photos as photo
  where photo.item_id = p_item_id
    and photo.user_id = v_user_id
  order by photo.display_order, photo.id;
end;
$$;

create function public.create_item_with_photo_drafts(
  p_name text,
  p_category_id uuid,
  p_quantity integer,
  p_photo_draft_ids uuid[] default '{}'::uuid[],
  p_sub_category_id uuid default null,
  p_color text default null,
  p_size text default null,
  p_purpose text default null,
  p_product_url text default null,
  p_purchase_price integer default null,
  p_purchased_at date default null,
  p_last_used_at date default null,
  p_status text default 'KEEP',
  p_review_requested boolean default false,
  p_memo text default null
)
returns public.items
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_item public.items;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if nullif(btrim(p_name), '') is null then
    raise exception 'item name is required' using errcode = '22023';
  end if;

  if p_color is not null
     and nullif(btrim(p_color), '') is not null
     and btrim(p_color) !~ '^#[0-9A-Fa-f]{6}$' then
    raise exception 'invalid item color' using errcode = '22023';
  end if;

  if p_product_url is not null
     and nullif(btrim(p_product_url), '') is not null
     and btrim(p_product_url) !~* '^https?://' then
    raise exception 'item URL must use http or https' using errcode = '22023';
  end if;

  insert into public.items (
    user_id,
    category_id,
    sub_category_id,
    name,
    quantity,
    color,
    size,
    purpose,
    product_url,
    purchase_price,
    purchased_at,
    last_used_at,
    status,
    review_requested,
    memo
  ) values (
    v_user_id,
    p_category_id,
    p_sub_category_id,
    btrim(p_name),
    p_quantity,
    case
      when nullif(btrim(p_color), '') is null then null
      else upper(btrim(p_color))
    end,
    nullif(btrim(p_size), ''),
    nullif(btrim(p_purpose), ''),
    nullif(btrim(p_product_url), ''),
    p_purchase_price,
    p_purchased_at,
    p_last_used_at,
    p_status,
    p_review_requested,
    nullif(btrim(p_memo), '')
  )
  returning * into v_item;

  perform public.attach_item_photo_drafts(v_item.id, p_photo_draft_ids);

  return v_item;
end;
$$;

revoke all on function private.validate_item_photo_storage_object()
  from public, anon, authenticated;
revoke all on function private.validate_item_photo()
  from public, anon, authenticated;

revoke all on function public.create_item_photo_draft(text, text, bigint)
  from public, anon, authenticated;
revoke all on function public.queue_item_photo_draft_deletion(uuid)
  from public, anon, authenticated;
revoke all on function public.queue_expired_item_photo_drafts(integer, timestamptz)
  from public, anon, authenticated;
revoke all on function public.claim_item_photo_deletion_queue(integer)
  from public, anon, authenticated;
revoke all on function public.complete_item_photo_deletion(text)
  from public, anon, authenticated;
revoke all on function public.claim_item_photo_draft_analysis(uuid)
  from public, anon, authenticated;
revoke all on function public.complete_item_photo_draft_analysis(uuid, uuid, jsonb)
  from public, anon, authenticated;
revoke all on function public.fail_item_photo_draft_analysis(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.attach_item_photo_drafts(uuid, uuid[])
  from public, anon, authenticated;
revoke all on function public.create_item_with_photo_drafts(
  text, uuid, integer, uuid[], uuid, text, text, text, text, integer,
  date, date, text, boolean, text
) from public, anon, authenticated;

grant usage on schema public to authenticated;
grant select
  on public.item_photo_drafts, public.item_photos
  to authenticated;
-- The server-only role may inspect/update draft lifecycle fields for recovery;
-- browser-authenticated roles remain read-only and all normal writes use RPCs.
grant select, update on public.item_photo_drafts to service_role;
grant execute on function public.create_item_photo_draft(text, text, bigint)
  to authenticated;
grant execute on function public.queue_item_photo_draft_deletion(uuid)
  to authenticated;
grant execute on function public.claim_item_photo_draft_analysis(uuid)
  to authenticated;
grant execute on function public.attach_item_photo_drafts(uuid, uuid[])
  to authenticated;
grant execute on function public.create_item_with_photo_drafts(
  text, uuid, integer, uuid[], uuid, text, text, text, text, integer,
  date, date, text, boolean, text
) to authenticated;

grant execute on function public.queue_expired_item_photo_drafts(integer, timestamptz)
  to service_role;
grant execute on function public.claim_item_photo_deletion_queue(integer)
  to service_role;
grant execute on function public.complete_item_photo_deletion(text)
  to service_role;
grant execute on function public.complete_item_photo_draft_analysis(uuid, uuid, jsonb)
  to service_role;
grant execute on function public.fail_item_photo_draft_analysis(uuid, uuid)
  to service_role;
