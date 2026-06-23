create table if not exists public.stock_logs (
  id uuid primary key,
  item_id uuid not null references public.inventory_items(id),
  quantity_changed numeric not null,
  type text not null,
  user_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);