-- Onboarding completion flag + journal import metadata

alter table public.users
  add column if not exists onboarding_completed_at timestamptz;

alter table public.journal_entries
  add column if not exists source text not null default 'manual';

alter table public.journal_entries
  add column if not exists entry_date date;

-- Existing users with journal history have already onboarded
update public.users u
set onboarding_completed_at = coalesce(u.updated_at, u.created_at, now())
where u.onboarding_completed_at is null
  and exists (
    select 1
    from public.journal_entries je
    where je.user_id = u.id
  );

-- Column-level SELECT on users must include onboarding_completed_at
revoke select on table public.users from authenticated;

grant select (
  id,
  username,
  avatar_url,
  is_public,
  created_at,
  updated_at,
  onboarding_completed_at
) on table public.users to authenticated;
