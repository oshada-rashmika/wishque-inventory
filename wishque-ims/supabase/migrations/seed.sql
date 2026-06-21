create extension if not exists pgcrypto;

insert into public.inventory_items (
  id,
  name,
  category,
  department,
  current_stock,
  minimum_threshold,
  unit,
  created_at
)
values
  (gen_random_uuid(), 'Oreos', 'Bakery', 'Bakery', 0, 0, 'pieces', now()),
  (gen_random_uuid(), 'Strawberries', 'Bakery', 'Bakery', 0, 0, 'kg', now()),
  (gen_random_uuid(), 'Flour', 'Bakery', 'Bakery', 0, 0, 'kg', now()),
  (gen_random_uuid(), 'Sugar', 'Bakery', 'Bakery', 0, 0, 'kg', now()),
  (gen_random_uuid(), 'Butter', 'Bakery', 'Bakery', 0, 0, 'kg', now()),
  (gen_random_uuid(), 'Vanilla', 'Bakery', 'Bakery', 0, 0, 'ml', now()),
  (gen_random_uuid(), 'Gebera', 'Floral', 'Floral', 0, 0, 'stems', now()),
  (gen_random_uuid(), 'Chrysanthemum', 'Floral', 'Floral', 0, 0, 'stems', now()),
  (gen_random_uuid(), 'Roses Red', 'Floral', 'Floral', 0, 0, 'stems', now()),
  (gen_random_uuid(), 'Roses Pink', 'Floral', 'Floral', 0, 0, 'stems', now()),
  (gen_random_uuid(), 'Roses White', 'Floral', 'Floral', 0, 0, 'stems', now()),
  (gen_random_uuid(), 'Michael', 'Floral', 'Floral', 0, 0, 'stems', now()),
  (gen_random_uuid(), 'Pens', 'Stationery', 'Stationery', 0, 0, 'pieces', now()),
  (gen_random_uuid(), 'Notebooks', 'Stationery', 'Stationery', 0, 0, 'pieces', now()),
  (gen_random_uuid(), 'A4 Paper', 'Stationery', 'Stationery', 0, 0, 'reams', now()),
  (gen_random_uuid(), 'Tape', 'Stationery', 'Stationery', 0, 0, 'rolls', now()),
  (gen_random_uuid(), 'Dish Soap', 'Cleaning', 'Cleaning', 0, 0, 'bottles', now()),
  (gen_random_uuid(), 'Disinfectant', 'Cleaning', 'Cleaning', 0, 0, 'bottles', now()),
  (gen_random_uuid(), 'Laundry Detergent', 'Cleaning', 'Cleaning', 0, 0, 'bottles', now()),
  (gen_random_uuid(), 'Trash Bags', 'Cleaning', 'Cleaning', 0, 0, 'rolls', now());