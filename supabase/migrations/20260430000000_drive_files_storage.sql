-- ============================================================
-- Drive — Storage bucket + RLS policies
-- ============================================================
-- Bucket layout: {user_id}/{folder_id}/{filename}
-- Files belong to a user_id and a folder_id, mirrored in the
-- public.drive_files table.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'drive-files',
  'drive-files',
  false,
  104857600, -- 100 MB cap per object
  null       -- accept any mime
)
on conflict (id) do nothing;

-- Storage RLS — scope every object to its owner.
-- Path is `{user_id}/...`, so the first folder segment must match auth.uid().
drop policy if exists "Users read own drive files" on storage.objects;
create policy "Users read own drive files"
  on storage.objects for select
  using (
    bucket_id = 'drive-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users insert own drive files" on storage.objects;
create policy "Users insert own drive files"
  on storage.objects for insert
  with check (
    bucket_id = 'drive-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users update own drive files" on storage.objects;
create policy "Users update own drive files"
  on storage.objects for update
  using (
    bucket_id = 'drive-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users delete own drive files" on storage.objects;
create policy "Users delete own drive files"
  on storage.objects for delete
  using (
    bucket_id = 'drive-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
