import pg from "pg"

const { Client } = pg

const raw = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
// strip sslmode so pg uses our ssl object (rejectUnauthorized: false)
const connectionString = raw.replace(/[?&]sslmode=[^&]*/g, "")

const SQL = `
-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

-- Life Cards
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  category text,
  description text,
  progress integer default 0,
  status text default 'active',
  created_at timestamptz default now()
);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references public.cards(id) on delete cascade,
  text text,
  is_done boolean default false,
  created_at timestamptz default now()
);

-- Reflections
create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  content text,
  created_at timestamptz default now()
);

-- Avatar state
create table if not exists public.avatar_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  mood text,
  energy_level integer,
  style text,
  avatar_config jsonb default '{}',
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.cards enable row level security;
alter table public.tasks enable row level security;
alter table public.reflections enable row level security;
alter table public.avatar_state enable row level security;

-- Profiles policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Cards policies
drop policy if exists "cards_select_own" on public.cards;
create policy "cards_select_own" on public.cards for select using (auth.uid() = user_id);
drop policy if exists "cards_insert_own" on public.cards;
create policy "cards_insert_own" on public.cards for insert with check (auth.uid() = user_id);
drop policy if exists "cards_update_own" on public.cards;
create policy "cards_update_own" on public.cards for update using (auth.uid() = user_id);
drop policy if exists "cards_delete_own" on public.cards;
create policy "cards_delete_own" on public.cards for delete using (auth.uid() = user_id);

-- Tasks policies (scoped via parent card ownership)
drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own" on public.tasks for select using (
  exists (select 1 from public.cards c where c.id = tasks.card_id and c.user_id = auth.uid())
);
drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own" on public.tasks for insert with check (
  exists (select 1 from public.cards c where c.id = tasks.card_id and c.user_id = auth.uid())
);
drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own" on public.tasks for update using (
  exists (select 1 from public.cards c where c.id = tasks.card_id and c.user_id = auth.uid())
);
drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own" on public.tasks for delete using (
  exists (select 1 from public.cards c where c.id = tasks.card_id and c.user_id = auth.uid())
);

-- Reflections policies
drop policy if exists "reflections_select_own" on public.reflections;
create policy "reflections_select_own" on public.reflections for select using (auth.uid() = user_id);
drop policy if exists "reflections_insert_own" on public.reflections;
create policy "reflections_insert_own" on public.reflections for insert with check (auth.uid() = user_id);
drop policy if exists "reflections_delete_own" on public.reflections;
create policy "reflections_delete_own" on public.reflections for delete using (auth.uid() = user_id);

-- Avatar state policies
drop policy if exists "avatar_select_own" on public.avatar_state;
create policy "avatar_select_own" on public.avatar_state for select using (auth.uid() = user_id);
drop policy if exists "avatar_insert_own" on public.avatar_state;
create policy "avatar_insert_own" on public.avatar_state for insert with check (auth.uid() = user_id);
drop policy if exists "avatar_update_own" on public.avatar_state;
create policy "avatar_update_own" on public.avatar_state for update using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
`

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()
  await client.query(SQL)
  console.log("[v0] Schema setup complete")
} catch (err) {
  console.error("[v0] Schema setup failed:", err)
  process.exit(1)
} finally {
  await client.end()
}
