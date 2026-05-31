-- Harden social, messaging, comments/reactions, and storage policies.

-- Friend requests: keep only the strict insert policy. The broad duplicate lets
-- a requester forge accepted friendships.
drop policy if exists "users create friend requests" on public.friendships;

drop policy if exists "Users can send friend requests as themselves"
on public.friendships;

create policy "Users can send friend requests as themselves"
on public.friendships
for insert
to authenticated
with check (
  requester_id = auth.uid()
  and recipient_id <> auth.uid()
  and status = 'pending'
);

-- Messages: sending is only allowed between accepted friends.
drop policy if exists "Users can send messages" on public.messages;

create policy "friends can send messages"
on public.messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and receiver_id <> auth.uid()
  and public.are_friends(sender_id, receiver_id)
);

-- Message read receipts: avoid table UPDATE access from clients. Receivers
-- should only mark messages as read through this narrow RPC.
drop policy if exists "Users can mark messages read" on public.messages;

create or replace function public.mark_messages_read(partner_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.messages
  set read_at = now()
  where sender_id = partner_id
    and receiver_id = auth.uid()
    and read_at is null;
$$;

revoke all on function public.mark_messages_read(uuid) from public;
revoke all on function public.mark_messages_read(uuid) from anon;
grant execute on function public.mark_messages_read(uuid) to authenticated;

-- Shared entries: users may only share their own entries with accepted friends.
drop policy if exists "shared_entries_insert" on public.shared_entries;

create policy "users can share own entries with friends"
on public.shared_entries
for insert
to authenticated
with check (
  shared_by = auth.uid()
  and shared_with <> auth.uid()
  and public.are_friends(shared_by, shared_with)
  and exists (
    select 1
    from public.journal_entries e
    where e.id = shared_entries.entry_id
      and e.user_id = auth.uid()
  )
);

-- Comments and reactions: remove broad FOR ALL policies that weaken the
-- visible-shared-entry checks for inserts.
drop policy if exists "users manage own comments" on public.comments;
drop policy if exists "users manage own reactions" on public.reactions;

-- Storage: entry images are private to the owner path. Shared-entry image
-- access should be served later through signed URLs after an entry visibility
-- check, not by public bucket reads.
update storage.buckets
set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[]
where id = 'entry-images';

update storage.buckets
set
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[]
where id = 'avatars';

drop policy if exists "Entry images are publicly readable" on storage.objects;

drop policy if exists "Users can view their own entry images" on storage.objects;

create policy "Users can view their own entry images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'entry-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage uploads: enforce owner folder, MIME type, and size at the storage
-- policy layer. Client-side checks are still useful UX, but not a boundary.
drop policy if exists "Users can upload their own avatar" on storage.objects;
drop policy if exists "Users can upload their own entry images" on storage.objects;
drop policy if exists "Users can update their own avatar" on storage.objects;

create policy "Users can upload safe avatars"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
  and lower(coalesce(metadata->>'mimetype', '')) in (
    'image/jpeg',
    'image/png',
    'image/webp'
  )
  and coalesce((metadata->>'size')::bigint, 0) <= 5242880
);

create policy "Users can update safe avatars"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
  and lower(coalesce(metadata->>'mimetype', '')) in (
    'image/jpeg',
    'image/png',
    'image/webp'
  )
  and coalesce((metadata->>'size')::bigint, 0) <= 5242880
);

create policy "Users can upload safe entry images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'entry-images'
  and auth.uid()::text = (storage.foldername(name))[1]
  and lower(coalesce(metadata->>'mimetype', '')) in (
    'image/jpeg',
    'image/png',
    'image/webp'
  )
  and coalesce((metadata->>'size')::bigint, 0) <= 5242880
);
