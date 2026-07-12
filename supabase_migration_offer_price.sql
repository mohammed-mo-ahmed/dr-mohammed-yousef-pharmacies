-- Migration: Add offer_price column and migrate data from old_price
-- Run this in Supabase SQL Editor

-- 1. Add new column
ALTER TABLE products ADD COLUMN IF NOT EXISTS offer_price numeric;

-- 2. Migrate data: where old_price > price, set offer_price = price (the old discounted price) and price = old_price (the original)
-- This inverts the old_price/price semantics into offer_price/price
UPDATE products
SET
  price = old_price,
  offer_price = price
WHERE old_price IS NOT NULL AND old_price > price;

-- 3. Drop the old_price column
ALTER TABLE products DROP COLUMN IF EXISTS old_price;
