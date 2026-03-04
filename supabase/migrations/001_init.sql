-- Supabase initial schema for family flow

-- Table for people (nodes)
create table if not exists people (
  id text primary key,
  name text,
  title text,
  birth text,
  death text,
  photo_url text,
  information text,
  position jsonb,
  data jsonb,
  created_at timestamptz default now()
);

-- Table for relations (edges)
create table if not exists relations (
  id text primary key,
  source text references people(id) on delete cascade,
  target text references people(id) on delete cascade,
  label text,
  data jsonb,
  created_at timestamptz default now()
);

-- Optional: flow metadata
create table if not exists flows (
  id text primary key,
  name text,
  meta jsonb,
  created_at timestamptz default now()
);

-- Indexes to speed up lookups
create index if not exists idx_people_name on people (lower(name));
create index if not exists idx_relations_source on relations (source);
create index if not exists idx_relations_target on relations (target);

-- Backfill note: existing code writes `information` into `data->>'information'`.
-- When applying this migration to an existing DB, you may want to backfill
-- the `information` column using:
-- UPDATE people SET information = (data->>'information') WHERE information IS NULL AND data IS NOT NULL;
