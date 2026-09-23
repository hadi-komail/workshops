-- ============================================================================
-- Snake — Konflikt · Gruppenmodus (team mode)
-- Run this ONCE in the Supabase SQL editor of the site's project
-- (same project as the feedback wall / "Wie weit gehst du?" game:
--  https://yzwikutdhylgybmhmxac.supabase.co).
-- ============================================================================

create table if not exists public.snake_scores (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  room_code  text    not null,
  name       text    not null,
  won        boolean not null default false,
  attacks    integer not null default 0,
  length     integer not null default 0,
  food       integer not null default 0
);

create index if not exists snake_scores_room_idx
  on public.snake_scores (room_code, created_at);

alter table public.snake_scores enable row level security;

-- Players are anonymous (browser uses the publishable/anon key).
-- Allow inserting your own result and reading the room board.
drop policy if exists "snake_scores anon insert" on public.snake_scores;
create policy "snake_scores anon insert"
  on public.snake_scores for insert to anon with check (true);

drop policy if exists "snake_scores anon read" on public.snake_scores;
create policy "snake_scores anon read"
  on public.snake_scores for select to anon using (true);

-- Optional: let a facilitator wipe a room from the browser ("Raum leeren").
-- Leave commented out if you'd rather rooms be immutable and just use a new code.
-- drop policy if exists "snake_scores anon delete" on public.snake_scores;
-- create policy "snake_scores anon delete"
--   on public.snake_scores for delete to anon using (true);
