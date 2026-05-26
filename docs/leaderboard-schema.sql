-- Supabase schema for per-level leaderboard entries.
-- Run this in the Supabase SQL editor after creating your project.

create table if not exists public.leaderboard_entries (
  level_id smallint not null check (level_id between 1 and 5),
  player_id uuid not null,
  player_name text not null check (char_length(trim(player_name)) between 1 and 20),
  stars smallint not null check (stars between 0 and 3),
  moves smallint not null check (moves > 0),
  created_at timestamptz not null default now(),
  primary key (level_id, player_id)
);

create index if not exists leaderboard_entries_level_rank_idx
  on public.leaderboard_entries (level_id, stars desc, moves asc, created_at asc);

alter table public.leaderboard_entries enable row level security;

drop policy if exists leaderboard_select_all on public.leaderboard_entries;
create policy leaderboard_select_all
  on public.leaderboard_entries
  for select
  to anon
  using (true);

drop policy if exists leaderboard_insert_all on public.leaderboard_entries;
create policy leaderboard_insert_all
  on public.leaderboard_entries
  for insert
  to anon
  with check (true);

drop policy if exists leaderboard_update_all on public.leaderboard_entries;
create policy leaderboard_update_all
  on public.leaderboard_entries
  for update
  to anon
  using (true)
  with check (true);
