create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name varchar(50) not null check (char_length(trim(name)) between 1 and 50),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create unique index categories_user_name_unique
  on public.categories (user_id, lower(name));
create index categories_user_sort_idx
  on public.categories (user_id, sort_order, name);

create table public.sub_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null,
  name varchar(50) not null check (char_length(trim(name)) between 1 and 50),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (id, category_id, user_id),
  constraint sub_categories_owned_category_fk
    foreign key (category_id, user_id)
    references public.categories (id, user_id)
    on delete restrict
);

create unique index sub_categories_user_category_name_unique
  on public.sub_categories (user_id, category_id, lower(name));
create index sub_categories_user_category_sort_idx
  on public.sub_categories (user_id, category_id, sort_order, name);
create index sub_categories_category_owner_fk_idx
  on public.sub_categories (category_id, user_id);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null,
  sub_category_id uuid,
  name varchar(100) not null check (char_length(trim(name)) between 1 and 100),
  quantity integer not null default 1 check (quantity >= 1 and quantity <= 1000000),
  color varchar(50) check (color is null or char_length(color) <= 50),
  size varchar(50) check (size is null or char_length(size) <= 50),
  purpose varchar(255) check (purpose is null or char_length(purpose) <= 255),
  product_url text check (product_url is null or char_length(product_url) <= 2048),
  purchase_price integer check (purchase_price is null or purchase_price >= 0),
  purchased_at date,
  last_used_at date,
  status text not null default 'KEEP' check (status in ('KEEP', 'MAYBE', 'RELEASE')),
  review_requested boolean not null default false,
  memo text check (memo is null or char_length(memo) <= 5000),
  archived_at timestamptz,
  release_reason varchar(255) check (release_reason is null or char_length(release_reason) <= 255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  constraint items_owned_category_fk
    foreign key (category_id, user_id)
    references public.categories (id, user_id)
    on delete restrict,
  constraint items_owned_sub_category_fk
    foreign key (sub_category_id, category_id, user_id)
    references public.sub_categories (id, category_id, user_id)
    on delete restrict
);

create index items_active_user_created_idx
  on public.items (user_id, created_at desc)
  where archived_at is null;
create index items_archived_user_date_idx
  on public.items (user_id, archived_at desc)
  where archived_at is not null;
create index items_user_category_idx on public.items (user_id, category_id);
create index items_category_owner_fk_idx on public.items (category_id, user_id);
create index items_sub_category_owner_fk_idx
  on public.items (sub_category_id, category_id, user_id);
create index items_user_status_idx on public.items (user_id, status);
create index items_review_queue_idx
  on public.items (user_id, updated_at)
  where archived_at is null and (status = 'MAYBE' or review_requested = true);

create table public.item_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null,
  previous_status text not null check (previous_status in ('KEEP', 'MAYBE', 'RELEASE')),
  decision text not null check (decision in ('KEEP', 'MAYBE', 'RELEASE')),
  reviewed_at timestamptz not null default now(),
  memo text check (memo is null or char_length(memo) <= 1000),
  constraint item_reviews_owned_item_fk
    foreign key (item_id, user_id)
    references public.items (id, user_id)
    on delete cascade
);

create index item_reviews_user_date_idx
  on public.item_reviews (user_id, reviewed_at desc);
create index item_reviews_item_date_idx
  on public.item_reviews (item_id, reviewed_at desc);
create index item_reviews_item_owner_fk_idx
  on public.item_reviews (item_id, user_id);

create table public.ideal_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null,
  sub_category_id uuid,
  name varchar(100) not null check (char_length(trim(name)) between 1 and 100),
  target_quantity integer not null check (target_quantity >= 0 and target_quantity <= 1000000),
  estimated_price integer check (estimated_price is null or estimated_price >= 0),
  priority text check (priority is null or priority in ('LOW', 'MEDIUM', 'HIGH')),
  memo text check (memo is null or char_length(memo) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ideal_items_owned_category_fk
    foreign key (category_id, user_id)
    references public.categories (id, user_id)
    on delete restrict,
  constraint ideal_items_owned_sub_category_fk
    foreign key (sub_category_id, category_id, user_id)
    references public.sub_categories (id, category_id, user_id)
    on delete restrict
);

create index ideal_items_user_category_idx
  on public.ideal_items (user_id, category_id, name);
create index ideal_items_category_owner_fk_idx
  on public.ideal_items (category_id, user_id);
create index ideal_items_sub_category_owner_fk_idx
  on public.ideal_items (sub_category_id, category_id, user_id);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name varchar(100) not null check (char_length(trim(name)) between 1 and 100),
  category text not null check (category in ('HOUSING', 'UTILITIES', 'COMMUNICATION', 'SUBSCRIPTION', 'DEBT', 'OTHER')),
  amount integer not null check (amount >= 0 and amount <= 1000000000),
  billing_cycle text not null check (billing_cycle in ('MONTHLY', 'YEARLY')),
  billing_month smallint check (billing_month is null or billing_month between 1 and 12),
  memo text check (memo is null or char_length(memo) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index expenses_user_category_idx
  on public.expenses (user_id, category, name);

create function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger categories_set_updated_at before update on public.categories
  for each row execute function private.set_updated_at();
create trigger sub_categories_set_updated_at before update on public.sub_categories
  for each row execute function private.set_updated_at();
create trigger items_set_updated_at before update on public.items
  for each row execute function private.set_updated_at();
create trigger ideal_items_set_updated_at before update on public.ideal_items
  for each row execute function private.set_updated_at();
create trigger expenses_set_updated_at before update on public.expenses
  for each row execute function private.set_updated_at();

alter table public.categories enable row level security;
alter table public.sub_categories enable row level security;
alter table public.items enable row level security;
alter table public.item_reviews enable row level security;
alter table public.ideal_items enable row level security;
alter table public.expenses enable row level security;

create policy "categories_select_own" on public.categories
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "categories_insert_own" on public.categories
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "categories_update_own" on public.categories
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "categories_delete_own" on public.categories
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "sub_categories_select_own" on public.sub_categories
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "sub_categories_insert_own" on public.sub_categories
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "sub_categories_update_own" on public.sub_categories
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "sub_categories_delete_own" on public.sub_categories
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "items_select_own" on public.items
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "items_insert_own" on public.items
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "items_update_own" on public.items
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "item_reviews_select_own" on public.item_reviews
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "item_reviews_insert_own" on public.item_reviews
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "ideal_items_select_own" on public.ideal_items
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "ideal_items_insert_own" on public.ideal_items
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "ideal_items_update_own" on public.ideal_items
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "ideal_items_delete_own" on public.ideal_items
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "expenses_select_own" on public.expenses
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "expenses_insert_own" on public.expenses
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "expenses_update_own" on public.expenses
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "expenses_delete_own" on public.expenses
  for delete to authenticated using ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.sub_categories to authenticated;
grant select, insert, update on public.items to authenticated;
grant select, insert on public.item_reviews to authenticated;
grant select, insert, update, delete on public.ideal_items to authenticated;
grant select, insert, update, delete on public.expenses to authenticated;

create function public.review_item(
  p_item_id uuid,
  p_decision text,
  p_memo text default null
)
returns public.item_reviews
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_item public.items;
  v_review public.item_reviews;
begin
  if p_decision not in ('KEEP', 'MAYBE', 'RELEASE') then
    raise exception 'invalid review decision';
  end if;

  select * into v_item
  from public.items
  where id = p_item_id
    and user_id = (select auth.uid())
    and archived_at is null
  for update;

  if not found then
    raise exception 'item not found';
  end if;

  update public.items
  set status = p_decision,
      review_requested = false
  where id = p_item_id
    and user_id = (select auth.uid());

  insert into public.item_reviews (
    user_id, item_id, previous_status, decision, memo
  ) values (
    (select auth.uid()), p_item_id, v_item.status, p_decision, nullif(trim(p_memo), '')
  ) returning * into v_review;

  return v_review;
end;
$$;

revoke all on function public.review_item(uuid, text, text) from public, anon;
grant execute on function public.review_item(uuid, text, text) to authenticated;
