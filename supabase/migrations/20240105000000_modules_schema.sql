-- Create categories table if it doesn't exist (referenced by modules)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create modules table matching user schema
CREATE TABLE IF NOT EXISTS modules (
  id uuid not null default gen_random_uuid (),
  category_id uuid null,
  name text not null,
  created_at timestamp with time zone null default now(),
  status text null default 'enabled'::text,
  code text null,
  description text null,
  free_tests_limit integer null default 2,
  paid_tests_limit integer null default 3,
  enable_purchase boolean null default false,
  price numeric null default 0,
  icon_url text null,
  image_url text null,
  subject_code text null,
  free_test_limit integer null default 2,
  paid_test_limit integer null default 3,
  constraint modules_pkey primary key (id),
  constraint modules_category_id_fkey foreign KEY (category_id) references categories (id) on delete CASCADE
) TABLESPACE pg_default;

-- Seed initial modules from screenshot
INSERT INTO modules (name, description, free_test_limit, status) VALUES 
('Aerodynamics', 'Targeted practice questions for Aerodynamics.', 2, 'enabled'),
('Aircraft Structures', 'Master aircraft structural components and maintenance.', 4, 'enabled'),
('Propulsion', 'In-depth tests for aircraft propulsion systems.', 0, 'enabled')
ON CONFLICT DO NOTHING;
