-- 1. Table: profiles (user roles)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  is_admin boolean DEFAULT false,
  favorites uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 2. Table: categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text
);

-- 3. Table: products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  website_url text,
  logo_url text,
  features text[],
  use_cases text[],
  screenshots text[],
  pricing text,
  source text,
  tags text[],
  category_id uuid REFERENCES categories(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  submitted_by uuid REFERENCES profiles(id)
);

-- 4. Index for search
CREATE INDEX IF NOT EXISTS idx_products_name_desc ON products USING gin (to_tsvector('english', name || ' ' || coalesce(description, '')));

-- 5. Insert Marketing category
INSERT INTO categories (name, description) 
VALUES ('Marketing', 'AI tools for marketing strategies, copywriting, and content creation')
ON CONFLICT (name) DO NOTHING; 