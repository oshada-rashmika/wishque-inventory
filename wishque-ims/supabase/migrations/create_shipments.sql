create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.inventory_items(id) not null,
  item_name text not null,
  quantity numeric not null,
  price numeric not null,
  department text not null,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.shipments enable row level security;

-- Create policy so authenticated users can insert and select
create policy "Shipments are visible to authenticated users"
on public.shipments for select
using (auth.role() = 'authenticated');

create policy "Shipments can be inserted by authenticated users"
on public.shipments for insert
with check (auth.role() = 'authenticated');
