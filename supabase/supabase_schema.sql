-- Smart Medical Box Supabase schema
-- Run this script in Supabase SQL Editor.
-- Auth users are managed by Supabase Auth. profiles.id references auth.users(id).

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'User',
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.medicines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  dosage text not null,
  notes text,
  compartment integer not null check (compartment between 1 and 8),
  start_date date not null default current_date,
  end_date date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.medicine_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  medicine_id uuid not null references public.medicines(id) on delete cascade,
  time time not null,
  frequency text not null check (frequency in ('Once daily','Twice daily','Three times daily','Custom')),
  days text[] not null default '{}',
  compartment integer not null check (compartment between 1 and 8),
  reminder_enabled boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.medicine_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  medicine_id uuid references public.medicines(id) on delete set null,
  compartment integer not null check (compartment between 1 and 8),
  scheduled_date date not null,
  scheduled_time time not null,
  taken_at timestamptz,
  status text not null check (status in ('Taken','Pending','Missed','Upcoming')),
  created_at timestamptz not null default now()
);

create table if not exists public.compartments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  number integer not null check (number between 1 and 8),
  medicine_id uuid references public.medicines(id) on delete set null,
  status text not null default 'Empty',
  next_scheduled_time time,
  last_opened timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, number)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.device_status (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id text not null,
  name text not null default 'Smart Medical Box',
  connection text not null default 'Offline',
  wifi text not null default 'Disconnected',
  last_sync timestamptz,
  firmware text,
  battery numeric check (battery between 0 and 100),
  temperature numeric,
  humidity numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, device_id)
);

-- Optional event table for the future ESP32/API integration.
create table if not exists public.device_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  device_id text not null,
  event_type text not null,
  compartment integer check (compartment between 1 and 8),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.medicines enable row level security;
alter table public.medicine_schedules enable row level security;
alter table public.medicine_logs enable row level security;
alter table public.compartments enable row level security;
alter table public.notifications enable row level security;
alter table public.device_status enable row level security;
alter table public.device_events enable row level security;

drop policy if exists "profiles own rows" on public.profiles;
create policy "profiles own rows" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "medicines own rows" on public.medicines;
create policy "medicines own rows" on public.medicines for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "schedules own rows" on public.medicine_schedules;
create policy "schedules own rows" on public.medicine_schedules for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "logs own rows" on public.medicine_logs;
create policy "logs own rows" on public.medicine_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "compartments own rows" on public.compartments;
create policy "compartments own rows" on public.compartments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "notifications own rows" on public.notifications;
create policy "notifications own rows" on public.notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "device status own rows" on public.device_status;
create policy "device status own rows" on public.device_status for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "device events own rows" on public.device_events;
create policy "device events own rows" on public.device_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Create a profile row whenever a new Auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User'), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Future ESP32/API event types can include:
-- heartbeat, temperature, humidity, battery, compartment_opened,
-- medicine_taken, reminder_acknowledged.
