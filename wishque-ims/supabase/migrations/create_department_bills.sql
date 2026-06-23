create table if not exists public.department_bills (
  id uuid primary key,
  department text not null,
  billing_month text not null,
  calculated_cost numeric not null,
  status text not null,
  created_at timestamptz not null default now()
);