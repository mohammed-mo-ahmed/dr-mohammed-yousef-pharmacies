-- 000_reset.sql
-- Run this FIRST to start with a clean database
-- Deletes all existing data (keeps schema intact)

DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM wishlists;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM customers;
DELETE FROM offers;

-- Re-create categories for the drug database
INSERT INTO categories (id, name_ar, name_en, slug) VALUES
  ('a0c1fd42-1093-4091-b129-39374502cf7c', 'الأدوية والوصفات الطبية', 'Medicines & Rx', 'medicines'),
  ('4c0a1a1c-e6d9-4009-b69b-4a3a78ead84a', 'الصحة العامة والفيتامينات', 'Wellness & Vitamins', 'wellness'),
  ('a49cac23-06d8-47bf-9159-4e879eccd533', 'العناية الشخصية', 'Personal Care', 'personal-care'),
  ('381df44c-14b1-4be2-b960-85f4213c51bf', 'مستحضرات التجميل والعناية بالبشرة', 'Cosmetics & Skin Care', 'cosmetics'),
  ('3b276995-a804-4300-9981-7cec8ca078c4', 'العناية بالطفل', 'Baby Care', 'baby-care');
