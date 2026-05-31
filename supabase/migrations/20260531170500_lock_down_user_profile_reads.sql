-- Prevent authenticated clients from reading every profile row, especially email.
-- RLS limits rows, not columns, so we also replace table-level SELECT grants with
-- column-level SELECT grants that exclude public.users.email.

drop policy if exists "Authenticated users can find profiles for friend requests"
on public.users;

drop policy if exists "Users can view themselves and accepted friends"
on public.users;

drop policy if exists "users can view public profiles or friends"
on public.users;

drop policy if exists "users can view own public profiles and friends"
on public.users;

create policy "users can view own public profiles and friends"
on public.users
for select
to authenticated
using (
  id = auth.uid()
  or is_public = true
  or public.are_friends(id, auth.uid())
);

revoke select on table public.users from anon;
revoke select on table public.users from authenticated;

grant select (
  id,
  username,
  avatar_url,
  is_public,
  created_at,
  updated_at
) on table public.users to authenticated;
