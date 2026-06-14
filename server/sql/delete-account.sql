-- server/sql/delete-account.sql
-- Account deletion for App Store Guideline 5.1.1(v) (mandatory — app is
-- rejected without an in-app "delete account" path).
--
-- HOW TO DEPLOY (one time):
--   1. Open the Supabase dashboard for project wsoqcfwkvvemtlddcgfc.
--   2. SQL Editor → New query.
--   3. Paste this entire file and click Run.
--   4. Verify: the function appears under Database → Functions as `delete_user`.
--   5. (Optional) Test from the SQL editor while impersonating a user, or just
--      sign in on the live app and use Profile → Delete account.
--
-- Until this is deployed, the client's supabase.rpc('delete_user') call returns
-- a "function not found" error; app.jsx catches it and shows a graceful
-- "deletion isn't available yet — email us" message instead of crashing.
--
-- Idempotent: safe to re-run (create or replace + revoke/grant).

-- Deletes the CALLING user's account and all their data, then removes the auth
-- row itself. SECURITY DEFINER so it can touch auth.users (owned by the
-- supabase_auth_admin role); it only ever acts on auth.uid(), so a caller can
-- never delete anyone but themselves.
create or replace function public.delete_user()
  returns void
  language plpgsql
  security definer
  set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  -- Must be an authenticated caller. auth.uid() is null for the anon role.
  if uid is null then
    raise exception 'not authenticated';
  end if;

  -- 1. Cloud-synced blob (wishlists / lists / alerts / trips / profile).
  delete from public.user_data   where user_id  = uid;

  -- 2. Any lists this user shared (the B.8 viral-loop snapshots).
  delete from public.shared_lists where owner_id = uid;

  -- 3. The auth identity itself. This cascades to anything FK-referencing
  --    auth.users(id) with on delete cascade (e.g. shared_lists already
  --    handled above). After this the user's magic-link session is dead.
  delete from auth.users where id = uid;
end;
$$;

-- Only signed-in users may call it; anon role must not. (The function is a
-- self-service delete keyed on auth.uid(), so anon has nothing to act on
-- anyway, but revoke from anon/public to be explicit.)
revoke all on function public.delete_user() from public, anon;
grant execute on function public.delete_user() to authenticated;

-- Optional sanity check after running:
--   select proname, prosecdef from pg_proc where proname = 'delete_user';
--   -- prosecdef should be true (SECURITY DEFINER).
