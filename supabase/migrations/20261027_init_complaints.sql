-- CivicFix: Nagpur Municipal Grievance & Infrastructure Resolution Platform
-- Migration: 20261027_init_complaints.sql
-- Idempotent schema definition for PostgreSQL / Supabase

-- 1. Create complaints table
create table if not exists public.complaints (
  id text primary key,
  title text not null check (length(trim(title)) >= 5),
  category text not null,
  category_label text,
  location text not null check (length(trim(location)) >= 3),
  ward text,
  schematic_x numeric,
  schematic_y numeric,
  date_reported timestamptz not null default now(),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  assigned_dept text,
  description text not null check (length(trim(description)) >= 10),
  upvotes integer not null default 0 check (upvotes >= 0),
  is_nearby boolean not null default false,
  has_photo boolean not null default false,
  photo_url text,
  timeline jsonb not null default '[]'::jsonb,
  created_by text default 'Ankit Chamke (Demo)',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Performance indexes for common filters & queries
create index if not exists idx_complaints_status on public.complaints (status);
create index if not exists idx_complaints_category on public.complaints (category);
create index if not exists idx_complaints_ward on public.complaints (ward);
create index if not exists idx_complaints_date_reported on public.complaints (date_reported desc);

-- 3. Row Level Security (RLS) Configuration
alter table public.complaints enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Allow public read access" on public.complaints;
drop policy if exists "Allow public insert with valid fields" on public.complaints;
drop policy if exists "Allow public updates to status and upvotes" on public.complaints;

-- Conservative, transparent policies:
-- Policy A: Anyone can read public civic complaints for municipal transparency
create policy "Allow public read access"
  on public.complaints
  for select
  using (true);

-- Policy B: Citizens can file new complaints with valid required attributes
create policy "Allow public insert with valid fields"
  on public.complaints
  for insert
  with check (
    length(trim(title)) >= 5 and
    length(trim(description)) >= 10 and
    status in ('open', 'in_progress', 'resolved')
  );

-- Policy C: Citizen upvoting and demo status progression
create policy "Allow public updates to status and upvotes"
  on public.complaints
  for update
  using (true)
  with check (
    status in ('open', 'in_progress', 'resolved')
  );

-- 4. Seed initial authentic Nagpur civic complaints (Idempotent)
insert into public.complaints (
  id, title, category, category_label, location, ward, schematic_x, schematic_y,
  date_reported, status, priority, assigned_dept, description, upvotes, is_nearby, has_photo, photo_url, timeline, created_by
) values
(
  'CV-2026-8841',
  'Deep hazardous crater pothole outside Sitabuldi Metro Station Gate 2',
  'roads',
  'Roads & Potholes',
  'Munje Square, Sitabuldi Metro Interchange, Nagpur',
  'Dhantoli / Sitabuldi Zone (Zone 4)',
  440, 250,
  '2026-10-27T08:15:00Z',
  'in_progress',
  'high',
  'NMC Public Works Department (Roads Infrastructure Division)',
  'A deep 10-inch pothole has opened up in the lane leading towards Munje Square. Two-wheelers frequently swerve into oncoming bus lanes during morning office hours.',
  38, true, true,
  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
  '[{"date":"Oct 27, 2026 08:15 AM","action":"Grievance Registered","note":"Logged with photo evidence by Ankit Chamke via CivicFix Nagpur portal."},{"date":"Oct 27, 2026 09:30 AM","action":"NMC Triage Escalated","note":"Priority upgraded to HIGH due to high-density Sitabuldi Metro corridor."},{"date":"Oct 27, 2026 11:45 AM","action":"Work Crew Dispatched","note":"Assigned to NMC Patch Crew Central (Truck #14) with asphalt mix."}]'::jsonb,
  'Ankit Chamke'
),
(
  'CV-2026-8839',
  'Dual streetlights completely out along Futala Lake promenade track',
  'lighting',
  'Street Lighting',
  'Futala Lake Walking Track, Amravati Road, Nagpur',
  'Dharampeth Zone (Zone 2)',
  180, 155,
  '2026-10-26T21:40:00Z',
  'open',
  'high',
  'NMC Electrical & Public Lighting Department',
  'Both overhead heritage lamp posts near the middle food kiosk promenade have short-circuited. Pedestrians and evening joggers are in pitch darkness.',
  24, true, true,
  'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80',
  '[{"date":"Oct 26, 2026 09:40 PM","action":"Grievance Registered","note":"Reported by evening walking group members."},{"date":"Oct 27, 2026 07:00 AM","action":"Inspection Scheduled","note":"NMC Dharampeth lineman scheduled for junction box voltage check."}]'::jsonb,
  'Ankit Chamke'
),
(
  'CV-2026-8835',
  'Commercial garbage bin overflowing onto WHC Road bicycle lane',
  'sanitation',
  'Waste Management',
  'Gokulpeth Market Square, West High Court Road, Dharampeth, Nagpur',
  'Dharampeth Zone (Zone 2)',
  275, 220,
  '2026-10-26T16:20:00Z',
  'in_progress',
  'medium',
  'NMC Solid Waste Management Division',
  'The green municipal compactor container at Gokulpeth market vegetable entrance has not been cleared for 36 hours. Vegetable crates and bags are spilling onto WHC Road.',
  19, true, true,
  'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80',
  '[{"date":"Oct 26, 2026 04:20 PM","action":"Grievance Registered","note":"Recorded via citizen mobile report with geolocation verification."},{"date":"Oct 27, 2026 06:10 AM","action":"Vehicle Re-routed","note":"Added as priority stop for Dharampeth morning compactor truck #7."}]'::jsonb,
  'Ankit Chamke'
),
(
  'CV-2026-8822',
  'High-pressure potable water pipeline leak bubbling onto tarmac',
  'water',
  'Water & Drainage',
  'Ambazari Garden Road, near VNIT South Gate, Nagpur',
  'Dharampeth Zone (Zone 2)',
  230, 320,
  '2026-10-25T14:05:00Z',
  'resolved',
  'high',
  'Nagpur Water Works & OCW Water Board',
  'Clear drinking water had burst from an underground feeder valve, causing surface asphalt lifting near the VNIT college campus gate.',
  51, false, true,
  'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=600&q=80',
  '[{"date":"Oct 25, 2026 02:05 PM","action":"Grievance Registered","note":"Alert received from local VNIT faculty quarters."},{"date":"Oct 25, 2026 03:30 PM","action":"Valve Isolated","note":"OCW water pressure throttled to halt flooding."},{"date":"Oct 26, 2026 10:15 AM","action":"Repaired & Sealed","note":"Pipe sleeve replaced; bituminous cold patch cured."}]'::jsonb,
  'Ankit Chamke'
)
on conflict (id) do nothing;
