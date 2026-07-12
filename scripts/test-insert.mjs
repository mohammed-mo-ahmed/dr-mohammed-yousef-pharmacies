import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ghdhqgwkhunwcaizfegp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoZGhxZ3draHVud2NhaXpmZWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4Mzk3NDAsImV4cCI6MjA5OTQxNTc0MH0.iOBZFLvPmhaNtY5QXDg-tWzr9mMZDWZIyS4apnzyzmA'
);

// Test 1: Insert 1 product
console.log('Test 1: Insert 1 product...');
const { data, error } = await supabase.from('products').insert([{
  name_ar: 'test',
  name_en: 'test-product-' + Date.now(),
  price: 10,
  description_ar: '',
  description_en: '',
  usage_instructions_ar: '',
  usage_instructions_en: '',
  image_url: '',
  category_id: null,
  stock: 10,
  is_best_seller: false,
  is_latest: false
}]).select('id');

if (error) {
  console.error('Single insert FAILED:', error.message, error);
} else {
  console.log('Single insert OK:', data?.[0]?.id);
  
  // Cleanup
  if (data?.[0]?.id) {
    await supabase.from('products').delete().eq('id', data[0].id);
    console.log('Cleaned up test row');
  }
}

// Test 2: Insert 10 products
console.log('\nTest 2: Insert 10 products...');
const batch10 = Array.from({ length: 10 }, (_, i) => ({
  name_ar: 'اختبار',
  name_en: `test-batch-${Date.now()}-${i}`,
  price: 10 + i,
  description_ar: 'اختبار',
  description_en: 'test',
  usage_instructions_ar: '',
  usage_instructions_en: '',
  image_url: '',
  category_id: null,
  stock: 5,
  is_best_seller: false,
  is_latest: false
}));

const { data: d2, error: e2 } = await supabase.from('products').insert(batch10).select('id');
if (e2) {
  console.error('Batch 10 FAILED:', e2.message);
} else {
  console.log('Batch 10 OK:', d2?.length, 'rows');
  // Cleanup
  const ids = d2?.map(r => r.id) || [];
  if (ids.length) await supabase.from('products').delete().in('id', ids);
  console.log('Cleaned up');
}

// Test 3: Count existing
const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
console.log('\nCurrent product count:', count);
