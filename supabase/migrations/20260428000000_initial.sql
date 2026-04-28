-- ============================================================
-- EDIS — Initial Schema
-- ============================================================

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Drive — Folders
-- ============================================================
create table if not exists public.drive_folders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  month       text not null default '',
  year        int  not null default extract(year from now())::int,
  description text,
  created_at  timestamptz default now() not null
);

alter table public.drive_folders enable row level security;

create policy "Users manage own folders"
  on public.drive_folders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- Drive — Files
-- ============================================================
create table if not exists public.drive_files (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  folder_id     uuid references public.drive_folders(id) on delete cascade,
  name          text not null,
  size          bigint not null default 0,
  kind          text not null default 'other', -- 'image' | 'video' | 'other'
  thumbnail_url text,
  storage_path  text,
  created_at    timestamptz default now() not null
);

alter table public.drive_files enable row level security;

create policy "Users manage own files"
  on public.drive_files for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- Aulas — Progress
-- ============================================================
create table if not exists public.aulas_progress (
  user_id      uuid not null references auth.users(id) on delete cascade,
  lesson_id    text not null,
  completed_at timestamptz default now() not null,
  primary key (user_id, lesson_id)
);

alter table public.aulas_progress enable row level security;

create policy "Users manage own progress"
  on public.aulas_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- Ad Generations
-- ============================================================
create table if not exists public.ad_generations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  briefing   jsonb not null default '{}',
  phase      int  not null default 1,
  status     text not null default 'draft', -- 'draft' | 'generating' | 'done'
  created_at timestamptz default now() not null
);

alter table public.ad_generations enable row level security;

create policy "Users manage own generations"
  on public.ad_generations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
