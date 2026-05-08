-- server/sql/share-lists.sql
-- Migration for B.8 share-a-list viral loop (commit d8560a1).
-- Run in the Supabase SQL editor for project wsoqcfwkvvemtlddcgfc.
--
-- Until this is deployed:
--   - shareList()    in app.jsx hits a missing table → silent insert error
--   - fetchSharedList() returns null → recipients see "list not found"
--   - bump_share_view RPC is missing → view counter never increments
--
-- Idempotent: safe to re-run.

create table if not exists public.shared_lists (
  slug            text primary key,
  owner_id        uuid not null references auth.users(id) on delete cascade,
  source_list_id  text not null,
  name            text not null,
  emoji           text default '🗺️',
  venue_ids       text[] not null default '{}',
  view_count      int  not null default 0,
  created_at      timestamptz not null default now()
);

alter table public.shared_lists enable row level security;

-- Anyone (anon) can read a shared list by slug. Snapshots are public-by-design;
-- the URL itself is the access token.
drop policy if exists "shared_lists_anon_read" on public.shared_lists;
create policy "shared_lists_anon_read" on public.shared_lists
  for select using (true);

-- Only the owner can insert their own list.
drop policy if exists "shared_lists_owner_insert" on public.shared_lists;
create policy "shared_lists_owner_insert" on public.shared_lists
  for insert with check (owner_id = auth.uid());

-- Only the owner can delete (no UPDATE for now — snapshots are immutable).
drop policy if exists "shared_lists_owner_delete" on public.shared_lists;
create policy "shared_lists_owner_delete" on public.shared_lists
  for delete using (owner_id = auth.uid());

-- View-count bump callable by anon, but only via this SECURITY DEFINER RPC
-- so anon clients can't write to view_count directly.
create or replace function public.bump_share_view(p_slug text)
  returns void
  language sql
  security definer
  set search_path = public
as $$
  update public.shared_lists set view_count = view_count + 1 where slug = p_slug;
$$;
grant execute on function public.bump_share_view(text) to anon, authenticated;

-- Optional sanity check after running:
-- select tablename, rowsecurity from pg_tables
-- where schemaname = 'public' and tablename in ('shared_lists', 'user_data');
-- both should return rowsecurity = true.
