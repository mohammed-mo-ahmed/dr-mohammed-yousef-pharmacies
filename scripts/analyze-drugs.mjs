import { readFileSync } from 'fs';
// Read raw bytes and fix control characters
let raw = readFileSync('./eg-drugs-main/eg-drugs-main/data/eg_drugs.json', 'utf8');
// Replace bad control chars but keep \r\n as literal text
raw = raw.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');
const data = JSON.parse(raw);

// Unique drug categories
const cats = [...new Set(data.map(r => r.description).filter(Boolean))].sort();
console.log('Total drugs:', data.length);
console.log('Unique drug categories:', cats.length);
console.log('Categories:\n' + cats.join('\n'));

// Price analysis
const prices = data.map(r => parseFloat(String(r.price).replace(/[^0-9.]/g, ''))).filter(p => !isNaN(p) && p > 0);
console.log('\nPrice stats: min=', Math.min(...prices), 'max=', Math.max(...prices), 'avg=', (prices.reduce((a,b)=>a+b,0)/prices.length).toFixed(2));

// Form analysis from names
const forms = new Set();
data.forEach(r => {
  const n = r.name.toLowerCase();
  if (n.includes('syrup') || n.includes('شراب')) forms.add('syrup');
  if (n.includes('tab')) forms.add('tablet');
  if (n.includes('cap')) forms.add('capsule');
  if (n.includes('cream') || n.includes('كريم')) forms.add('cream');
  if (n.includes('drop') || n.includes('نقط')) forms.add('drops');
  if (n.includes('gel') || n.includes('جل')) forms.add('gel');
  if (n.includes('vial') || n.includes('فيال')) forms.add('vial');
  if (n.includes('inhaler') || n.includes('بخاخ')) forms.add('inhaler');
  if (n.includes('spray')) forms.add('spray');
  if (n.includes('lotion') || n.includes('لوسيون')) forms.add('lotion');
  if (n.includes('suspension')) forms.add('suspension');
  if (n.includes('ointment') || n.includes('مرهم')) forms.add('ointment');
});
console.log('\nDetected forms:', [...forms].sort());
