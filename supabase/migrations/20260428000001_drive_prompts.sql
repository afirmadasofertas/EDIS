-- ============================================================
-- Drive — Prompts (separate kind of asset from folders/files)
-- ============================================================
create table if not exists public.drive_prompts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  description text,
  prompt      text not null,
  file_types  text[] not null default '{}',
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

alter table public.drive_prompts enable row level security;

create policy "Users manage own prompts"
  on public.drive_prompts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
