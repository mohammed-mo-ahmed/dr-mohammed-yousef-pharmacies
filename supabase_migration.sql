-- Migration: Add new columns to products table for Egyptian drug database
-- Run this in Supabase SQL Editor BEFORE importing data

-- Add new columns to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS active_ingredients TEXT,
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS barcode TEXT,
  ADD COLUMN IF NOT EXISTS form TEXT,
  ADD COLUMN IF NOT EXISTS size TEXT,
  ADD COLUMN IF NOT EXISTS old_price NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS availability TEXT,
  ADD COLUMN IF NOT EXISTS drug_category TEXT,
  ADD COLUMN IF NOT EXISTS uses_summary_ar TEXT,
  ADD COLUMN IF NOT EXISTS uses_summary_en TEXT,
  ADD COLUMN IF NOT EXISTS warnings_summary_ar TEXT,
  ADD COLUMN IF NOT EXISTS warnings_summary_en TEXT,
  ADD COLUMN IF NOT EXISTS warning_high_bp BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS warning_diabetes BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS warning_pregnancy BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS warning_lactation BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS warning_kidney BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS warning_liver BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS warning_heart BOOLEAN DEFAULT false;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_company ON products(company);
CREATE INDEX IF NOT EXISTS idx_products_form ON products(form);
CREATE INDEX IF NOT EXISTS idx_products_drug_category ON products(drug_category);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_name_en_trgm ON products USING gin(name_en gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_name_ar_trgm ON products USING gin(name_ar gin_trgm_ops);

-- Enable pg_trgm for trigram search (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Allow public inserts for the import (remove after import)
-- The import script uses the anon key, so we need temporary public write access
DROP POLICY IF EXISTS "Allow auth write on products" ON products;
CREATE POLICY "Allow public write on products" ON products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow auth write on categories" ON categories;
CREATE POLICY "Allow public write on categories" ON categories FOR ALL USING (true) WITH CHECK (true);
