-- Security hardening: RLS policy fixes + privilege trimming
-- Applied: 2026-06-26

-- ── A. Harden friendships UPDATE ─────────────────────────────────────────────
-- Previous policy let the recipient update any column and set any status
-- (including re-opening a rejected request). Restrict so the recipient may
-- only transition from 'pending' → 'accepted' or 'pending' → 'rejected'.

drop policy if exists "friendships_update" on public.friendships;

create policy "friendships_update"
on public.friendships
for update
to authenticated
using (
  recipient_id = auth.uid()
  and status = 'pending'
)
with check (
  recipient_id = auth.uid()
  and status in ('accepted', 'rejected')
);

-- ── B. Revoke anon execute on SECURITY DEFINER probing functions ──────────────
-- are_friends(a, b) and can_view_entry(entry_id, viewer_id) are security-definer
-- helpers. Granting them to anon creates information-disclosure oracles:
--   • are_friends lets an unauthenticated caller probe any two user UUIDs
--   • can_view_entry lets an unauthenticated caller check sharing relationships
-- Neither function is needed by unauthenticated visitors.

revoke execute on function public.are_friends(uuid, uuid) from anon;
revoke execute on function public.can_view_entry(uuid, uuid) from anon;

-- ── C. Trim anon table privileges (defence-in-depth) ─────────────────────────
-- Supabase bootstraps with GRANT ALL … TO anon on every table. RLS already
-- enforces the real boundary, but granting INSERT/UPDATE/DELETE to anon on
-- private tables violates least-privilege. Revoke write access; keep only
-- the SELECT grant on tables that have legitimate anon-readable RLS policies
-- (journal_entries: public profile entries; users: already scoped by migration
-- 20260531170500).

revoke insert, update, delete on table public.journal_entries  from anon;
revoke all                     on table public.messages         from anon;
revoke all                     on table public.friendships      from anon;
revoke all                     on table public.shared_entries   from anon;
revoke all                     on table public.comments         from anon;
revoke all                     on table public.reactions        from anon;
revoke all                     on table public.streaks          from anon;
revoke all                     on table public.ai_reflections   from anon;
