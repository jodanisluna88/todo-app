-- Run this in Supabase Dashboard > SQL Editor

create table if not exists public.todos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid()
              references auth.users (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 500),
  is_complete boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists todos_user_id_created_at_idx
  on public.todos (user_id, created_at desc);

-- Enable RLS (deny-by-default until policies exist)
alter table public.todos enable row level security;
alter table public.todos force row level security;

-- Explicit per-operation policies, scoped to signed-in users
create policy "todos_select_own" on public.todos
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "todos_insert_own" on public.todos
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "todos_update_own" on public.todos
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "todos_delete_own" on public.todos
  for delete to authenticated
  using ((select auth.uid()) = user_id);
