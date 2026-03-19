-- Enable RLS on modules and categories
ALTER TABLE IF EXISTS public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.test_sets ENABLE ROW LEVEL SECURITY;

-- Allow public access to view modules
CREATE POLICY "Allow public select on modules" 
ON public.modules FOR SELECT 
TO anon, authenticated 
USING (status = 'enabled');

-- Allow public access to view categories
CREATE POLICY "Allow public select on categories" 
ON public.categories FOR SELECT 
TO anon, authenticated 
USING (true);

-- Allow public access to view test_sets (basic info)
CREATE POLICY "Allow public select on test_sets" 
ON public.test_sets FOR SELECT 
TO anon, authenticated 
USING (is_hidden = false);

-- Ensure anon user can see counts and other basics
-- Note: test_questions and other sensitive tables might need their own policies
-- but for the home page modules, this is sufficient.
