-- Safe username lookup for friend requests.
-- The function intentionally returns only non-sensitive profile fields and
-- avoids granting broad SELECT access to public.users.email.

create or replace function public.find_user_profile_by_username(search_username text)
returns table (
  id uuid,
  username text,
  avatar_url text
)
language sql
security definer
set search_path = public
stable
as $$
  select u.id, u.username, u.avatar_url
  from public.users u
  where auth.uid() is not null
    and lower(u.username) = lower(trim(search_username))
  limit 1;
$$;

revoke all on function public.find_user_profile_by_username(text) from public;
revoke all on function public.find_user_profile_by_username(text) from anon;
grant execute on function public.find_user_profile_by_username(text) to authenticated;
