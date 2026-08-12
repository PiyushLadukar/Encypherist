-- Encypherist schema — tables, indexes, RLS policies.
-- Run via `npm run db:migrate` (scripts/run-migrations.ts), which applies this
-- file (and any others in this folder, in filename order) against the
-- Postgres connection string in SUPABASE_DB_URL.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- admin_profiles — maps a Supabase Auth user to an admin role.
-- A row here is what grants access to every admin-only policy below.
-- Insert rows manually (via Supabase SQL editor) after creating the auth
-- user for each admin — never expose an endpoint that lets anyone self-elevate.
-- ---------------------------------------------------------------------------
create table if not exists admin_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  created_at timestamptz not null default now()
);

-- RLS on: a signed-in user may read only their own row (used to confirm
-- their own admin status client/server-side). No insert/update/delete
-- policy exists at all, so the only way to grant admin access is a manual
-- SQL insert (e.g. via the Supabase SQL editor) with the service role,
-- which bypasses RLS by design.
alter table admin_profiles enable row level security;

drop policy if exists "admin_profiles self read" on admin_profiles;
create policy "admin_profiles self read" on admin_profiles
  for select using (id = auth.uid());

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from admin_profiles where id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- members
-- ---------------------------------------------------------------------------
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  designation text not null,
  team_group text not null check (team_group in ('final', 'third', 'second', 'history')),
  year_session text not null,
  bio text,
  skills text[] not null default '{}',
  photo_url text,
  socials jsonb not null default '{}'::jsonb,
  is_core boolean not null default false,
  sort_order integer not null default 0,
  published boolean not null default true,
  confidence text not null default 'verified' check (confidence in ('verified', 'likely', 'unverified')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists members_team_group_idx on members (team_group);
create index if not exists members_published_idx on members (published);

drop trigger if exists members_set_updated_at on members;
create trigger members_set_updated_at before update on members
  for each row execute function set_updated_at();

alter table members enable row level security;

drop policy if exists "members public read" on members;
create policy "members public read" on members
  for select using (published = true);

drop policy if exists "members admin all" on members;
create policy "members admin all" on members
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  type text not null default 'other' check (
    type in ('hackathon', 'workshop', 'talk', 'competition', 'seminar', 'donation_drive', 'other')
  ),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  summary text,
  description text,
  start_at timestamptz,
  end_at timestamptz,
  location text,
  poster_url text,
  registration_enabled boolean not null default false,
  registration_deadline timestamptz,
  capacity integer,
  eligibility text,
  rules text,
  schedule jsonb not null default '[]'::jsonb,
  confidence text not null default 'verified' check (confidence in ('verified', 'likely', 'unverified')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_status_idx on events (status);
create index if not exists events_start_at_idx on events (start_at);

drop trigger if exists events_set_updated_at on events;
create trigger events_set_updated_at before update on events
  for each row execute function set_updated_at();

alter table events enable row level security;

drop policy if exists "events public read" on events;
create policy "events public read" on events
  for select using (status = 'published');

drop policy if exists "events admin all" on events;
create policy "events admin all" on events
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- event_registrations — no public select policy at all (default-deny).
-- ---------------------------------------------------------------------------
create table if not exists event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  college text not null,
  branch text,
  year text,
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (event_id, email)
);

create index if not exists event_registrations_event_id_idx on event_registrations (event_id);

alter table event_registrations enable row level security;

drop policy if exists "registrations public insert" on event_registrations;
create policy "registrations public insert" on event_registrations
  for insert with check (true);

drop policy if exists "registrations admin read" on event_registrations;
create policy "registrations admin read" on event_registrations
  for select using (is_admin());

drop policy if exists "registrations admin manage" on event_registrations;
create policy "registrations admin manage" on event_registrations
  for update using (is_admin()) with check (is_admin());

drop policy if exists "registrations admin delete" on event_registrations;
create policy "registrations admin delete" on event_registrations
  for delete using (is_admin());

-- Public-safe aggregate: lets the public UI show "X registered" / capacity
-- without granting a select policy on event_registrations (which stays
-- admin-only, per spec, to protect registrant PII).
create or replace function event_registration_count(p_event_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*) from event_registrations where event_id = p_event_id;
$$;

revoke all on function event_registration_count(uuid) from public;
grant execute on function event_registration_count(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- event_gallery / event_faqs / event_speakers / event_organizers
-- Public read only when the parent event is published.
-- ---------------------------------------------------------------------------
create table if not exists event_gallery (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists event_faqs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order integer not null default 0
);

create table if not exists event_speakers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  name text not null,
  title text,
  photo_url text,
  sort_order integer not null default 0
);

create table if not exists event_organizers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  name text not null,
  role text,
  sort_order integer not null default 0
);

create index if not exists event_gallery_event_id_idx on event_gallery (event_id);
create index if not exists event_faqs_event_id_idx on event_faqs (event_id);
create index if not exists event_speakers_event_id_idx on event_speakers (event_id);
create index if not exists event_organizers_event_id_idx on event_organizers (event_id);

alter table event_gallery enable row level security;
alter table event_faqs enable row level security;
alter table event_speakers enable row level security;
alter table event_organizers enable row level security;

drop policy if exists "event_gallery public read" on event_gallery;
create policy "event_gallery public read" on event_gallery
  for select using (exists (select 1 from events e where e.id = event_id and e.status = 'published'));
drop policy if exists "event_gallery admin all" on event_gallery;
create policy "event_gallery admin all" on event_gallery
  for all using (is_admin()) with check (is_admin());

drop policy if exists "event_faqs public read" on event_faqs;
create policy "event_faqs public read" on event_faqs
  for select using (exists (select 1 from events e where e.id = event_id and e.status = 'published'));
drop policy if exists "event_faqs admin all" on event_faqs;
create policy "event_faqs admin all" on event_faqs
  for all using (is_admin()) with check (is_admin());

drop policy if exists "event_speakers public read" on event_speakers;
create policy "event_speakers public read" on event_speakers
  for select using (exists (select 1 from events e where e.id = event_id and e.status = 'published'));
drop policy if exists "event_speakers admin all" on event_speakers;
create policy "event_speakers admin all" on event_speakers
  for all using (is_admin()) with check (is_admin());

drop policy if exists "event_organizers public read" on event_organizers;
create policy "event_organizers public read" on event_organizers
  for select using (exists (select 1 from events e where e.id = event_id and e.status = 'published'));
drop policy if exists "event_organizers admin all" on event_organizers;
create policy "event_organizers admin all" on event_organizers
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  status text not null default 'in_development' check (
    status in ('active', 'in_development', 'deployed', 'archived')
  ),
  summary text,
  problem text,
  solution text,
  tech_stack text[] not null default '{}',
  contributors text[] not null default '{}',
  link_url text,
  repo_url text,
  image_url text,
  published boolean not null default true,
  sort_order integer not null default 0,
  confidence text not null default 'verified' check (confidence in ('verified', 'likely', 'unverified')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_published_idx on projects (published);

drop trigger if exists projects_set_updated_at on projects;
create trigger projects_set_updated_at before update on projects
  for each row execute function set_updated_at();

alter table projects enable row level security;

drop policy if exists "projects public read" on projects;
create policy "projects public read" on projects
  for select using (published = true);

drop policy if exists "projects admin all" on projects;
create policy "projects admin all" on projects
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- site_settings — singleton row
-- ---------------------------------------------------------------------------
create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique,
  name text not null,
  tagline text,
  description text,
  contact_email text,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (singleton = true)
);

drop trigger if exists site_settings_set_updated_at on site_settings;
create trigger site_settings_set_updated_at before update on site_settings
  for each row execute function set_updated_at();

alter table site_settings enable row level security;

drop policy if exists "site_settings public read" on site_settings;
create policy "site_settings public read" on site_settings
  for select using (true);

drop policy if exists "site_settings admin write" on site_settings;
create policy "site_settings admin write" on site_settings
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- social_links
-- ---------------------------------------------------------------------------
create table if not exists social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null unique,
  url text not null,
  visible boolean not null default true,
  sort_order integer not null default 0
);

alter table social_links enable row level security;

drop policy if exists "social_links public read" on social_links;
create policy "social_links public read" on social_links
  for select using (visible = true);

drop policy if exists "social_links admin all" on social_links;
create policy "social_links admin all" on social_links
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- storage buckets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('forum-assets', 'forum-assets', true),
  ('member-images', 'member-images', true),
  ('event-posters', 'event-posters', true),
  ('event-gallery', 'event-gallery', true)
on conflict (id) do nothing;

drop policy if exists "public read forum assets" on storage.objects;
create policy "public read forum assets" on storage.objects
  for select using (bucket_id in ('forum-assets', 'member-images', 'event-posters', 'event-gallery'));

drop policy if exists "admin write forum assets" on storage.objects;
create policy "admin write forum assets" on storage.objects
  for insert with check (
    bucket_id in ('forum-assets', 'member-images', 'event-posters', 'event-gallery') and is_admin()
  );

drop policy if exists "admin update forum assets" on storage.objects;
create policy "admin update forum assets" on storage.objects
  for update using (
    bucket_id in ('forum-assets', 'member-images', 'event-posters', 'event-gallery') and is_admin()
  );

drop policy if exists "admin delete forum assets" on storage.objects;
create policy "admin delete forum assets" on storage.objects
  for delete using (
    bucket_id in ('forum-assets', 'member-images', 'event-posters', 'event-gallery') and is_admin()
  );
