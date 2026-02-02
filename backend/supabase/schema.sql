-- Supabase SQL schema for GAE backend
-- Run this in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 1) Materials (master components)
create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  item text not null,
  brand text not null,
  series text,
  pole text,
  ka text,
  ampere text,
  detail text,
  unit text not null default 'UNIT',
  international_price numeric not null default 0,
  local_price numeric not null default 0,
  currency text not null default 'IDR' check (currency in ('IDR','USD')),
  man_hour numeric not null default 0,
  vendor text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists tr_materials_updated_at on public.materials;
create trigger tr_materials_updated_at
before update on public.materials
for each row execute function public.set_updated_at();

create index if not exists idx_materials_item on public.materials (item);
create index if not exists idx_materials_brand on public.materials (brand);
create index if not exists idx_materials_detail on public.materials using gin (to_tsvector('simple', coalesce(detail,'')));

-- 2) Product panels (master panels)
create table if not exists public.product_panels (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null,
  base_price numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists tr_product_panels_updated_at on public.product_panels;
create trigger tr_product_panels_updated_at
before update on public.product_panels
for each row execute function public.set_updated_at();

-- 3) Product panel materials (default materials per panel)
create table if not exists public.product_panel_materials (
  id uuid primary key default gen_random_uuid(),
  panel_id uuid not null references public.product_panels(id) on delete cascade,
  material_id uuid references public.materials(id) on delete set null,
  sort_order int not null default 0,
  qty numeric not null default 1,
  factor numeric not null default 1,
  discount numeric not null default 0,

  -- snapshot fields (compatible with current frontend row shape)
  item text,
  brand text,
  series text,
  pole text,
  ka text,
  ampere text,
  detail text,
  unit text,
  international_price numeric not null default 0,
  local_price numeric not null default 0,
  currency text not null default 'IDR' check (currency in ('IDR','USD')),
  man_hour numeric not null default 0,
  vendor text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists tr_product_panel_materials_updated_at on public.product_panel_materials;
create trigger tr_product_panel_materials_updated_at
before update on public.product_panel_materials
for each row execute function public.set_updated_at();

create index if not exists idx_ppm_panel_id on public.product_panel_materials (panel_id);

-- 4) Customers
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  phone text,
  email text,
  address text,
  type text not null default 'Corporate',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists tr_customers_updated_at on public.customers;
create trigger tr_customers_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

create index if not exists idx_customers_name on public.customers (name);

-- 5) Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  job_no text not null unique,
  name text not null,
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text,
  creator text,
  additional_costs jsonb not null default '{}'::jsonb,
  last_edit_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists tr_projects_updated_at on public.projects;
create trigger tr_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

-- 6) Project panels (panels inside a project)
create table if not exists public.project_panels (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  master_panel_id uuid references public.product_panels(id) on delete set null,
  sort_order int not null default 0,
  panel_name text not null,
  qty int not null default 1,
  unit_price numeric not null default 0,
  final_price numeric not null default 0,
  is_custom boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists tr_project_panels_updated_at on public.project_panels;
create trigger tr_project_panels_updated_at
before update on public.project_panels
for each row execute function public.set_updated_at();

create index if not exists idx_project_panels_project_id on public.project_panels (project_id);

-- 7) Project panel materials (materials inside a project panel)
create table if not exists public.project_panel_materials (
  id uuid primary key default gen_random_uuid(),
  project_panel_id uuid not null references public.project_panels(id) on delete cascade,
  material_id uuid references public.materials(id) on delete set null,
  sort_order int not null default 0,
  qty numeric not null default 1,
  factor numeric not null default 1,
  discount numeric not null default 0,

  -- snapshot fields
  item text,
  brand text,
  series text,
  pole text,
  ka text,
  ampere text,
  detail text,
  unit text,
  international_price numeric not null default 0,
  local_price numeric not null default 0,
  currency text not null default 'IDR' check (currency in ('IDR','USD')),
  man_hour numeric not null default 0,
  vendor text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists tr_project_panel_materials_updated_at on public.project_panel_materials;
create trigger tr_project_panel_materials_updated_at
before update on public.project_panel_materials
for each row execute function public.set_updated_at();

create index if not exists idx_project_panel_materials_panel_id on public.project_panel_materials (project_panel_id);

