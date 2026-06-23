-- Create Products Table (Finished Sellable Goods)
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g., 'Cakes', 'Cup cakes', 'Short eats'
    department TEXT NOT NULL, -- e.g., 'Bakery', 'Floral'
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Product Recipes Table (Junction mapping products to ingredients)
CREATE TABLE public.product_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    required_quantity NUMERIC(10, 2) NOT NULL, -- e.g., 0.25 kg of flour
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Mock Products for Bakery
INSERT INTO public.products (id, name, category, department, price) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Signature Chocolate Cake', 'Cakes', 'Bakery', 4500.00),
  ('b2222222-2222-2222-2222-222222222222', 'Oreo Strawberry Cupcake', 'Cup cakes', 'Bakery', 450.00);

-- Map Products to existing Ingredients (Assuming database IDs match seed data criteria)
-- Connecting 'Signature Chocolate Cake' to Flour, Sugar, Butter, Cocoa
INSERT INTO public.product_recipes (product_id, ingredient_id, required_quantity)
SELECT 
  'a1111111-1111-1111-1111-111111111111'::uuid, 
  id, 
  CASE name 
    WHEN 'Flour' THEN 0.50 
    WHEN 'Sugar' THEN 0.30
    WHEN 'Butter' THEN 0.25
    WHEN 'Cocoa' THEN 0.10
    ELSE 1.00
  END
FROM public.inventory_items 
WHERE department = 'Bakery' AND name IN ('Flour', 'Sugar', 'Butter', 'Cocoa');

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_recipes ENABLE ROW LEVEL SECURITY;

-- Dynamic Policies matching user profile department metrics
CREATE POLICY "Allow department matching view profiles" ON public.products
    FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE department = products.department OR role = 'Admin'));

CREATE POLICY "Allow department matching view recipes" ON public.product_recipes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products p
            WHERE p.id = product_recipes.product_id
              AND (auth.uid() IN (SELECT id FROM profiles WHERE department = p.department OR role = 'Admin'))
        )
    );