-- ============================================
-- Migration: Add Admin Role to Profiles
-- Run this in Supabase SQL Editor AFTER the profiles migration
-- ============================================

-- 1. Add role column to profiles (default: 'user')
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- 2. Admin can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
    );

-- 3. Admin can view all orders
CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
    );

-- 4. Admin can update orders
CREATE POLICY "Admins can update orders" ON orders
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
    );

-- 5. Admin can manage products (insert, update, delete)
CREATE POLICY "Admins can insert products" ON products
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can update products" ON products
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can delete products" ON products
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
    );

-- 6. Admin can manage categories
CREATE POLICY "Admins can insert categories" ON categories
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can update categories" ON categories
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can delete categories" ON categories
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
    );

-- 7. Admin can manage offers
CREATE POLICY "Admins can insert offers" ON offers
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can update offers" ON offers
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can delete offers" ON offers
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
    );

-- 8. Public read access for products, categories, offers (for the storefront)
-- These should already exist but adding them if not
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view products' AND tablename = 'products') THEN
        CREATE POLICY "Public can view products" ON products FOR SELECT USING (true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view categories' AND tablename = 'categories') THEN
        CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view offers' AND tablename = 'offers') THEN
        CREATE POLICY "Public can view offers" ON offers FOR SELECT USING (true);
    END IF;
END $$;

-- ============================================
-- After running this migration, promote a user to admin:
-- UPDATE profiles SET role = 'admin' WHERE user_id = '<YOUR_USER_UUID>';
-- Or by email:
-- UPDATE profiles SET role = 'admin' WHERE user_id = (
--     SELECT id FROM auth.users WHERE email = 'moyousefpharmacies@gmail.com'
-- );
-- ============================================
