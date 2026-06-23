alter table public.profiles enable row level security;
alter table public.inventory_items enable row level security;
alter table public.stock_logs enable row level security;
alter table public.department_bills enable row level security;

create or replace function public.current_user_department()
returns text
language sql
stable
security definer
set search_path = public
as $$
	select department
	from public.profiles
	where id = auth.uid();
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
	select role
	from public.profiles
	where id = auth.uid();
$$;

create or replace function public.is_admin_or_same_department(row_department text)
returns boolean
language sql
stable
as $$
	select public.current_user_role() = 'Admin'
		 or public.current_user_department() = row_department;
$$;

create or replace function public.is_admin_or_item_department(item_id uuid)
returns boolean
language sql
stable
as $$
	select exists (
		select 1
		from public.inventory_items i
		where i.id = item_id
			and public.is_admin_or_same_department(i.department)
	);
$$;

create policy "Profiles are visible to all authenticated users"
on public.profiles
for select
using (
	auth.role() = 'authenticated'
);

create policy "Profiles are self- or admin-editable"
on public.profiles
for insert
with check (
	id = auth.uid()
	or public.current_user_role() = 'Admin'
);

create policy "Profiles are self- or admin-updatable"
on public.profiles
for update
using (
	id = auth.uid()
	or public.current_user_role() = 'Admin'
)
with check (
	id = auth.uid()
	or public.current_user_role() = 'Admin'
);

create policy "Department users can read inventory items"
on public.inventory_items
for select
using (public.is_admin_or_same_department(department));

create policy "Department users can insert inventory items"
on public.inventory_items
for insert
with check (public.is_admin_or_same_department(department));

create policy "Department users can update inventory items"
on public.inventory_items
for update
using (public.is_admin_or_same_department(department))
with check (public.is_admin_or_same_department(department));

create policy "Department users can delete inventory items"
on public.inventory_items
for delete
using (public.is_admin_or_same_department(department));

create policy "Department users can read stock logs"
on public.stock_logs
for select
using (public.is_admin_or_item_department(item_id));

create policy "Department users can insert stock logs"
on public.stock_logs
for insert
with check (public.is_admin_or_item_department(item_id));

create policy "Department users can update stock logs"
on public.stock_logs
for update
using (public.is_admin_or_item_department(item_id))
with check (public.is_admin_or_item_department(item_id));

create policy "Department users can delete stock logs"
on public.stock_logs
for delete
using (public.is_admin_or_item_department(item_id));

create policy "Department users can read department bills"
on public.department_bills
for select
using (public.is_admin_or_same_department(department));

create policy "Department users can insert department bills"
on public.department_bills
for insert
with check (public.is_admin_or_same_department(department));

create policy "Department users can update department bills"
on public.department_bills
for update
using (public.is_admin_or_same_department(department))
with check (public.is_admin_or_same_department(department));

create policy "Department users can delete department bills"
on public.department_bills
for delete
using (public.is_admin_or_same_department(department));