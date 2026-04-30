-- ============================================================
-- Drive — Annotations (file pins) + notification read receipts
-- ============================================================

create table if not exists public.drive_annotations (
  id          text primary key,
  file_id     uuid not null references public.drive_files(id) on delete cascade,
  -- Free-text author. Owner's pins use 'Você'; anon shares use 'Cliente'
  -- by default. Anything other than 'Você' fires a notification for the
  -- folder owner.
  author      text not null default 'Cliente',
  -- 0..1 relative coordinates (so pins stay anchored when the image scales).
  x           real not null,
  y           real not null,
  note        text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.drive_annotations enable row level security;

-- Owner of the file's parent folder: full CRUD.
drop policy if exists "Owner manages folder annotations" on public.drive_annotations;
create policy "Owner manages folder annotations"
  on public.drive_annotations for all
  using (
    exists (
      select 1
      from public.drive_files fi
      join public.drive_folders fold on fold.id = fi.folder_id
      where fi.id = drive_annotations.file_id
        and fold.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.drive_files fi
      join public.drive_folders fold on fold.id = fi.folder_id
      where fi.id = drive_annotations.file_id
        and fold.user_id = auth.uid()
    )
  );

-- Anon (via shared link): can read annotations on shared files.
drop policy if exists "Public reads annotations on shared folders" on public.drive_annotations;
create policy "Public reads annotations on shared folders"
  on public.drive_annotations for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.drive_files fi
      join public.drive_shares ds on ds.folder_id = fi.folder_id
      where fi.id = drive_annotations.file_id
        and (ds.expires_at is null or ds.expires_at > now())
    )
  );

-- Anon (via shared link): can leave a comment on a shared file.
drop policy if exists "Public can comment on shared files" on public.drive_annotations;
create policy "Public can comment on shared files"
  on public.drive_annotations for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.drive_files fi
      join public.drive_shares ds on ds.folder_id = fi.folder_id
      where fi.id = drive_annotations.file_id
        and (ds.expires_at is null or ds.expires_at > now())
    )
  );

-- Anon: can update / delete their OWN comment (looser policy — share can't
-- prove identity, so we allow updates within the share window). Keeping
-- this permissive for the MVP; tighten later if abuse appears.
drop policy if exists "Public can update own shared comment" on public.drive_annotations;
create policy "Public can update own shared comment"
  on public.drive_annotations for update
  to anon, authenticated
  using (
    exists (
      select 1
      from public.drive_files fi
      join public.drive_shares ds on ds.folder_id = fi.folder_id
      where fi.id = drive_annotations.file_id
        and (ds.expires_at is null or ds.expires_at > now())
    )
  );

-- ============================================================
-- Read receipts (notification dismissal)
-- ============================================================

create table if not exists public.notification_reads (
  user_id        uuid not null references auth.users(id) on delete cascade,
  annotation_id  text not null references public.drive_annotations(id) on delete cascade,
  read_at        timestamptz not null default now(),
  primary key (user_id, annotation_id)
);

alter table public.notification_reads enable row level security;

drop policy if exists "Users manage own reads" on public.notification_reads;
create policy "Users manage own reads"
  on public.notification_reads for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
