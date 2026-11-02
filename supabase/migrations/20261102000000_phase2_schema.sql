-- Fase 2: Esquema inicial para ZYRVAE Intelligence

create table if not exists prospects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  url text not null,
  industry text not null default 'general',
  status text not null default 'nuevo',
  priority text not null default 'revision',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists audits (
  id uuid default gen_random_uuid() primary key,
  prospect_id uuid references prospects(id) on delete cascade,
  performance_score integer,
  seo_score integer,
  accessibility_score integer,
  load_time numeric,
  has_booking boolean default false,
  has_ota boolean default false,
  has_whatsapp boolean default false,
  raw_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists activity_log (
  id uuid default gen_random_uuid() primary key,
  prospect_id uuid references prospects(id) on delete cascade,
  event_type text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table prospects enable row level security;
alter table audits enable row level security;
alter table activity_log enable row level security;

create policy "Enable all" on prospects for all using (true);
create policy "Enable all" on audits for all using (true);
create policy "Enable all" on activity_log for all using (true);
