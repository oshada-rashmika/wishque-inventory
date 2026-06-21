create table if not exists public.inventory_items (
  id uuid primary key,
  name text not null,
  category text,
  department text,
  current_stock numeric,
  minimum_threshold numeric,
  unit text,
  created_at timestamptz not null default now()
);