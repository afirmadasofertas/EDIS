-- ============================================================
-- Drive — Public folder shares
-- ============================================================
-- Each folder can have at most ONE active share at a time. The share id
-- is a short text token (8-10 chars) used as the URL slug at /s/<id>.
-- Shares can have an explicit expiry; null means the link never expires.

create table if not exists public.drive_shares (
  id              text primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  folder_id       uuid not null references public.drive_folders(id) on delete cascade,
  expires_at      timestamptz,
  download_count  int  not null default 0,
  created_at      timestamptz not null default now(),
  unique (folder_id)
);

alter table public.drive_shares enable row level security;

-- Owner: full CRUD on their own shares.
drop policy if exists "Owner manages own shares" on public.drive_shares;
create policy "Owner manages own shares"
  on public.drive_shares for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Public: anyone can read a share row IF it hasn't expired. This is what
-- powers the /s/<id> page — the anon key resolves the share, the folder,
-- and its files via the policies below.
drop policy if exists "Public reads active shares" on public.drive_shares;
create policy "Public reads active shares"
  on public.drive_shares for select
  to anon, authenticated
  using (expires_at is null or expires_at > now());

-- ============================================================
-- Public reads on related tables when a share covers them.
-- ============================================================

-- Folders: anyone can SELECT a folder if it has an active share. The
-- existing owner-RLS policy already covers the authed-owner path.
drop policy if exists "Public reads shared folders" on public.drive_folders;
create policy "Public reads shared folders"
  on public.drive_folders for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.drive_shares ds
      where ds.folder_id = drive_folders.id
        and (ds.expires_at is null or ds.expires_at > now())
    )
  );

-- Files: anyone can SELECT a file if its parent folder has an active share.
drop policy if exists "Public reads files of shared folders" on public.drive_files;
create policy "Public reads files of shared folders"
  on public.drive_files for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.drive_shares ds
      where ds.folder_id = drive_files.folder_id
        and (ds.expires_at is null or ds.expires_at > now())
    )
  );

-- Storage: anyone can read a drive-files object if its folder is shared.
-- Object path is `{user_id}/{folder_id}/{filename}`, so foldername(name)[2]
-- is the folder uuid as text.
drop policy if exists "Public reads shared drive objects" on storage.objects;
create policy "Public reads shared drive objects"
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id = 'drive-files'
    and exists (
      select 1
      from public.drive_shares ds
      where ds.folder_id::text = (storage.foldername(name))[2]
        and (ds.expires_at is null or ds.expires_at > now())
    )
  );

-- ============================================================
-- RPC: bump download_count atomically. Anyone with the share id can
-- call this; we don't trust the client-supplied count.
-- ============================================================
create or replace function public.increment_share_downloads(p_share_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.drive_shares
  set download_count = download_count + 1
  where id = p_share_id
    and (expires_at is null or expires_at > now());
end;
$$;

grant execute on function public.increment_share_downloads(text) to anon, authenticated;
