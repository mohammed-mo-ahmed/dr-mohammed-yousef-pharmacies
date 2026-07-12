import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ghdhqgwkhunwcaizfegp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoZGhxZ3draHVud2NhaXpmZWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4Mzk3NDAsImV4cCI6MjA5OTQxNTc0MH0.iOBZFLvPmhaNtY5QXDg-tWzr9mMZDWZIyS4apnzyzmA'
);

const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
console.log('Product count:', count);

const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
console.log('Category count:', catCount);

// Sample a few
const { data } = await supabase.from('products').select('name_en, name_ar, price, form, company, drug_category').limit(5);
console.log('\nSample products:');
data?.forEach(p => console.log(`  ${p.name_en} | ${p.price} | ${p.form} | ${p.company} | ${p.drug_category}`));
