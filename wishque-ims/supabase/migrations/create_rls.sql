alter table public.profiles enable row level security;
alter table public.inventory_items enable row level security;
alter table public.stock_logs enable row level security;
alter table public.department_bills enable row level security;

create policy "Bakery or admin can read inventory items"
on public.inventory_items
for select
using (
	exists (
		select 1
		from public.profiles p
		where p.id = auth.uid()
			and (
				p.role = 'Admin'
				or p.department = 'Bakery'
				or p.department = inventory_items.department
			)
	)
);

create policy "Bakery or admin can insert inventory items"
on public.inventory_items
for insert
with check (
	exists (
		select 1
		from public.profiles p
		where p.id = auth.uid()
			and (
				p.role = 'Admin'
				or p.department = 'Bakery'
				or p.department = inventory_items.department
			)
	)
);

create policy "Bakery or admin can update inventory items"
on public.inventory_items
for update
using (
	exists (
		select 1
		from public.profiles p
		where p.id = auth.uid()
			and (
				p.role = 'Admin'
				or p.department = 'Bakery'
				or p.department = inventory_items.department
			)
	)
)
with check (
	exists (
		select 1
		from public.profiles p
		where p.id = auth.uid()
			and (
				p.role = 'Admin'
				or p.department = 'Bakery'
				or p.department = inventory_items.department
			)
	)
);

create policy "Bakery or admin can delete inventory items"
on public.inventory_items
for delete
using (
	exists (
		select 1
		from public.profiles p
		where p.id = auth.uid()
			and (
				p.role = 'Admin'
				or p.department = 'Bakery'
				or p.department = inventory_items.department
			)
	)
);