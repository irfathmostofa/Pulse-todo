-- Pulse: daily todo + mood + pomodoro tracker
-- Multi-user: anyone can sign up (email + password via Supabase Auth), and
-- every row is scoped to its owner. RLS makes sure one user can never see
-- or touch another user's data.

create extension if not exists pgcrypto;

-- Templates for recurring tasks. A task instance is created per day in `tasks`.
create table if not exists recurring_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  title text not null,
  type text not null default 'new' check (type in ('new', 'recurring')),
  status text not null default 'pending' check (status in ('pending', 'done')),
  priority integer not null default 0,
  recurring_id uuid references recurring_tasks(id) on delete cascade,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_tasks_user_date on tasks(user_id, date);
create index if not exists idx_tasks_recurring_id on tasks(recurring_id);

create table if not exists mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  mood text not null check (mood in ('energetic', 'happy', 'neutral', 'tired', 'stressed')),
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  type text not null check (type in ('focus', 'short_break', 'long_break')),
  duration_minutes integer not null,
  completed boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_pomodoro_user_date on pomodoro_sessions(user_id, date);
create index if not exists idx_pomodoro_type on pomodoro_sessions(type);

-- RLS: every table is scoped to auth.uid(), so each signed-in user only ever
-- sees and modifies their own rows. Sign-up is open (anyone can create an
-- account); data is still fully separated per account.
alter table recurring_tasks enable row level security;
alter table tasks enable row level security;
alter table mood_entries enable row level security;
alter table pomodoro_sessions enable row level security;

create policy "owner access" on recurring_tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner access" on tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner access" on mood_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner access" on pomodoro_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
