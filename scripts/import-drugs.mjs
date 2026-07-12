import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// Supabase config from .env.local
const SUPABASE_URL = 'https://ghdhqgwkhunwcaizfegp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoZGhxZ3draHVud2NhaXpmZWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4Mzk3NDAsImV4cCI6MjA5OTQxNTc0MH0.iOBZFLvPmhaNtY5QXDg-tWzr9mMZDWZIyS4apnzyzmA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const BATCH_SIZE = 50;
const DELAY_MS = 500; // delay between batches

function cleanPrice(val) {
  if (val === null || val === undefined || val === '') return null;
  const cleaned = String(val).replace(/[^0-9.]/g, '').replace(/\.$/, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseBool(val) {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') return val.toLowerCase() === 'true' || val === '1';
  return false;
}

function truncate(str, maxLen = 5000) {
  if (!str || typeof str !== 'string') return null;
  const cleaned = str.replace(/\0/g, '').trim();
  return cleaned.length > maxLen ? cleaned.substring(0, maxLen) : cleaned;
}

const CATEGORY_NAMES = {
  'medicines': { ar: 'الأدوية والوصفات الطبية', en: 'Medicines & Rx' },
  'cosmetics': { ar: 'مستحضرات التجميل والعناية بالبشرة', en: 'Cosmetics & Skin Care' },
  'baby-care': { ar: 'العناية بالطفل', en: 'Baby Care' },
  'wellness': { ar: 'الصحة العامة والفيتامينات', en: 'Wellness & Vitamins' },
  'personal-care': { ar: 'العناية الشخصية', en: 'Personal Care' },
};

function guessCategorySlug(drug) {
  const cat = (drug.description || '').toLowerCase().trim();
  const name = (drug.name || '').toLowerCase();
  const active = (drug.active || '').toLowerCase();

  // Medical categories → medicines
  if (cat.includes('antibiotic') || cat.includes('penicillin') || cat.includes('macrolide') ||
      cat.includes('tetracycline') || cat.includes('quinolone') || cat.includes('carbapenem') ||
      cat.includes('glycopeptide') || cat.includes('polymyxin') || cat.includes('cephalosporin') ||
      cat.includes('antiviral') || cat.includes('antifungal') || cat.includes('antiparasitic') ||
      cat.includes('antimalarial') || cat.includes('nsaid') || cat.includes('analgesic') ||
      cat.includes('pain') || cat.includes('antitussive') || cat.includes('expectorant') ||
      cat.includes('mucolytic') || cat.includes('bronchodilator') || cat.includes('asthma') ||
      cat.includes('diabetes') || cat.includes('hypertension') || cat.includes('heart') ||
      cat.includes('peptic') || cat.includes('ppi') || cat.includes('proton pump') ||
      cat.includes('cold') || cat.includes('flu') || cat.includes('cough') ||
      cat.includes('anti-inflammatory') || cat.includes('corticosteroid') || cat.includes('glucocorticoid') ||
      cat.includes('muscle relaxant') || cat.includes('antispasmodic') || cat.includes('diuretic') ||
      cat.includes('thyroid') || cat.includes('hormone') || cat.includes('contraceptiv') ||
      cat.includes('psychiatric') || cat.includes('antidepressant') || cat.includes('antipsychotic') ||
      cat.includes('anxiolytic') || cat.includes('hypnotic') || cat.includes('epilepsy') ||
      cat.includes('anticonvulsant') || cat.includes('parkinson') || cat.includes('alzheimer') ||
      cat.includes('antithrombotic') || cat.includes('anticoagulant') || cat.includes('antiulcer') ||
      cat.includes('laxative') || cat.includes('antidiarrheal') || cat.includes('emetic') ||
      cat.includes('antiemetic') || cat.includes('immunosuppress') || cat.includes('immunomodulat') ||
      cat.includes('chemotherapy') || cat.includes('antineoplastic') || cat.includes('antitumor') ||
      cat.includes('antiepileptic') || cat.includes('narcotic') || cat.includes('opiate') ||
      cat.includes('local anaesthetic') || cat.includes('general anesthetic') || cat.includes('sedative') ||
      cat.includes('cns') || cat.includes('neuroprotect') || cat.includes('nootropic') ||
      cat.includes('dopamine') || cat.includes('serotonin') || cat.includes('adrenergic') ||
      cat.includes('sympathomimetic') || cat.includes('parasympathomimetic') || cat.includes('alpha') ||
      cat.includes('beta blocker') || cat.includes('calcium channel') || cat.includes('ace inhibitor') ||
      cat.includes('antihistamine') || cat.includes('h1') || cat.includes('h2') ||
      cat.includes('leukotriene') || cat.includes('mast cell') || cat.includes('vasodilator') ||
      cat.includes('diabetic') || cat.includes('antidiabetic') || cat.includes('insulin') ||
      cat.includes('anticoag') || cat.includes('thrombo') || cat.includes('platelet') ||
      cat.includes('statin') || cat.includes('lipid') || cat.includes('cholesterol') ||
      cat.includes('antacid') || cat.includes('laxative') || cat.includes('prokinetic') ||
      cat.includes('antiflatulence') || cat.includes('carminative') || cat.includes('spasmolytic') ||
      cat.includes('spastic colon') || cat.includes('hemorrhoid') || cat.includes('anal fissure') ||
      cat.includes('anti') || cat.includes('treatment') || cat.includes('therapy') ||
      cat.includes('agent') || cat.includes('inhibitor') || cat.includes('agonist') ||
      cat.includes('blocker') || cat.includes('antagonist') || cat.includes('modulator') ||
      cat.includes('stimulant') || cat.includes('suppressant') || cat.includes('replacement') ||
      cat.includes('substitute') || cat.includes('supplement') && cat.includes('medicinal') ||
      cat.includes('antiseptic') || cat.includes('disinfectant') || cat.includes('vaccine')) {
    return 'medicines';
  }

  // Wellness / Supplements / Vitamins
  if (cat.includes('vitamin') || cat.includes('multivitamin') || cat.includes('supplement') ||
      cat.includes('dietary') || cat.includes('food supplement') || cat.includes('mineral') ||
      cat.includes('calcium') || cat.includes('iron') || cat.includes('zinc') ||
      cat.includes('omega') || cat.includes('fish oil') || cat.includes('collagen') ||
      cat.includes('probiotic') || cat.includes('prebiotic') || cat.includes('folic acid') ||
      cat.includes('coenzyme') || cat.includes('antioxidant') || cat.includes('glucosamin') ||
      cat.includes('chondroprotective') || cat.includes('joint') || cat.includes('bone') ||
      cat.includes('lactoferrin') || cat.includes('amino acid') || cat.includes('protein') ||
      cat.includes('whey') || cat.includes('brain') || cat.includes('memory') ||
      cat.includes('nootropic') || cat.includes('cognitive') || cat.includes('immune') ||
      cat.includes('immunity') || cat.includes('nerve') || cat.includes('liver support') ||
      cat.includes('kidney') || cat.includes('heart failure') && cat.includes('supplement') ||
      cat.includes('gummies') || cat.includes('b complex') || cat.includes('biotin') ||
      cat.includes('selenium') || cat.includes('magnesium') || cat.includes('potassium') ||
      cat.includes('melatonin') || cat.includes('sleep') || cat.includes('fertility') ||
      cat.includes('prenatal') || cat.includes('pregnancy') && cat.includes('vitamin') ||
      cat.includes('cod liver') || cat.includes('nutraceutical') || cat.includes('herbal') && cat.includes('supplement') ||
      cat.includes('enzyme') && cat.includes('supplement') || cat.includes('premature') && cat.includes('formula') ||
      cat.includes('growing formula') || cat.includes('follow up formula') || cat.includes('infant formula') && cat.includes('supplement')) {
    return 'wellness';
  }

  // Baby care
  if (cat.includes('baby') || cat.includes('infant') || cat.includes('diaper') ||
      cat.includes('nipple') || cat.includes('cereals') || cat.includes('napkin') ||
      cat.includes('breastfeeding') || cat.includes('lactation') && cat.includes('baby')) {
    return 'baby-care';
  }

  // Personal care
  if (cat.includes('hair') || cat.includes('shampoo') || cat.includes('oral care') ||
      cat.includes('deodorant') || cat.includes('soap') || cat.includes('tooth') ||
      cat.includes('mouthwash') || cat.includes('mouth wash') || cat.includes('feminine') ||
      cat.includes('intimate') || cat.includes('body wash') || cat.includes('body cream') ||
      cat.includes('body lotion') || cat.includes('feet care') || cat.includes('nail care') ||
      cat.includes('lip care') || cat.includes('sun block') || cat.includes('sunscreen') && !cat.includes('medical') ||
      cat.includes('conditioner') || cat.includes('hair oil') || cat.includes('hair removal') ||
      cat.includes('massage') && !cat.includes('medical')) {
    return 'personal-care';
  }

  // Cosmetics / Skin care
  if (cat.includes('cosmetic') || cat.includes('cream') || cat.includes('moisturiz') ||
      cat.includes('emollient') || cat.includes('whitening') || cat.includes('anti-aging') ||
      cat.includes('serum') || cat.includes('cleanser') || cat.includes('facial') ||
      cat.includes('skin care') || cat.includes('sun screen') || cat.includes('sunscreen') ||
      cat.includes('exfoliat') || cat.includes('peeling') || cat.includes('rejuvenat') ||
      cat.includes('stretch mark') || cat.includes('firming') || cat.includes('contour') ||
      cat.includes('nourishing') || cat.includes('soothing') && cat.includes('skin') ||
      cat.includes('healing') && cat.includes('cream') || cat.includes('burn') && cat.includes('cream') ||
      cat.includes('scar') || cat.includes('silicon gel') || cat.includes('emulgel') ||
      cat.includes('hydrogel') || cat.includes('calamine') || cat.includes('panthenol') ||
      cat.includes('eczema') || cat.includes('psoriasis') || cat.includes('dermatological') ||
      cat.includes('keratolytic') || cat.includes('collagen cream') || cat.includes('niacinamide') ||
      cat.includes('lightening') || cat.includes('brightening')) {
    return 'cosmetics';
  }

  // Default to medicines
  return 'medicines';
}

async function ensureCategories(drugs) {
  const slugSet = new Set();
  drugs.forEach(d => slugSet.add(guessCategorySlug(d)));
  
  const catMap = {};
  
  for (const slug of slugSet) {
    const names = CATEGORY_NAMES[slug] || { ar: slug, en: slug };
    
    // Try to find existing
    const { data: existing, error: findErr } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    
    if (findErr) {
      console.error(`Error finding category ${slug}:`, findErr.message);
    }
    
    if (existing) {
      catMap[slug] = existing.id;
      console.log(`  Category "${slug}" exists: ${existing.id}`);
    } else {
      const { data: created, error: createErr } = await supabase
        .from('categories')
        .insert({ name_ar: names.ar, name_en: names.en, slug })
        .select('id')
        .single();
      
      if (createErr) {
        console.error(`Error creating category ${slug}:`, createErr.message);
      } else {
        catMap[slug] = created.id;
        console.log(`  Created category "${slug}": ${created.id}`);
      }
    }
  }
  
  return catMap;
}

function guessForm(drug) {
  const name = (drug.name || '').toLowerCase();
  if (name.includes('syrup') || name.includes('شراب')) return 'Syrup';
  if (name.match(/\btab(s)?\b/)) return 'Tablet';
  if (name.match(/\bcap(s)?\b/)) return 'Capsule';
  if (name.includes('cream') || name.includes('كريم')) return 'Cream';
  if (name.includes('drop') || name.includes('نقط')) return 'Drops';
  if (name.includes('vial') || name.includes('فيال')) return 'Vial';
  if (name.includes('inhaler') || name.includes('بخاخ')) return 'Inhaler';
  if (name.includes('spray')) return 'Spray';
  if (name.includes('suspension')) return 'Suspension';
  if (name.includes('ointment') || name.includes('مرهم')) return 'Ointment';
  if (name.includes('sachet') || name.includes('ساشيه')) return 'Sachet';
  if (name.includes('powder') || name.includes('بودرة')) return 'Powder';
  if (name.includes('gel') || name.includes('جل')) return 'Gel';
  if (name.includes('lotion') || name.includes('لوسيون')) return 'Lotion';
  return null;
}

function guessSize(drug) {
  if (drug.units) return String(drug.units).trim().substring(0, 100);
  const name = (drug.name || '').toLowerCase();
  const sizeMatch = name.match(/(\d+\s*(?:mg|ml|g|mcg|iu|unit)[\s\S]{0,20})/i);
  if (sizeMatch) return sizeMatch[1].trim().substring(0, 100);
  return null;
}

function mapDrugToProduct(drug, catMap) {
  const slug = guessCategorySlug(drug);
  return {
    name_ar: truncate(drug.arabic || drug.name, 500) || 'بدون اسم',
    name_en: truncate(drug.name, 500) || 'No Name',
    price: cleanPrice(drug.price) || 0,
    description_ar: truncate(drug.uses_summary || drug.description || '', 2000) || '',
    description_en: truncate(drug.uses_summary_en || drug.description || '', 2000) || '',
    usage_instructions_ar: truncate(drug.uses_summary || '', 2000) || '',
    usage_instructions_en: truncate(drug.uses_summary_en || '', 2000) || '',
    image_url: '',
    category_id: catMap[slug] || null,
    stock: 10,
    is_best_seller: false,
    is_latest: false,
    // Drug-specific fields
    active_ingredients: truncate(drug.active, 1000) || null,
    company: truncate(drug.company, 500) || null,
    barcode: drug.barcode ? String(drug.barcode).trim().substring(0, 100) : null,
    form: guessForm(drug),
    size: guessSize(drug),
    old_price: cleanPrice(drug.oldprice),
    availability: drug.availability ? String(drug.availability).trim().substring(0, 100) : null,
    drug_category: truncate(drug.description, 500) || null,
    uses_summary_ar: truncate(drug.uses_summary, 3000) || null,
    uses_summary_en: truncate(drug.uses_summary_en, 3000) || null,
    warnings_summary_ar: truncate(drug.warnings_summary, 3000) || null,
    warnings_summary_en: truncate(drug.warnings_summary_en, 3000) || null,
    warning_high_bp: parseBool(drug.warning_high_blood_pressure),
    warning_diabetes: parseBool(drug.warning_diabetes),
    warning_pregnancy: parseBool(drug.warning_pregnancy),
    warning_lactation: parseBool(drug.warning_lactation),
    warning_kidney: parseBool(drug.warning_kidney),
    warning_liver: parseBool(drug.warning_liver),
    warning_heart: parseBool(drug.warning_heart),
  };
}

async function main() {
  console.log('=== Egyptian Drug Database Import ===\n');
  
  console.log('1. Reading eg_drugs.json...');
  let raw = readFileSync('./eg-drugs-main/eg-drugs-main/data/eg_drugs.json', 'utf8');
  raw = raw.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');
  
  console.log('2. Parsing JSON...');
  const drugs = JSON.parse(raw);
  console.log(`   Total drugs in file: ${drugs.length}`);
  
  const validDrugs = drugs.filter(d => {
    const price = cleanPrice(d.price);
    return price !== null && price > 0;
  });
  console.log(`   Drugs with valid price: ${validDrugs.length}`);
  
  console.log('\n3. Ensuring categories...');
  const catMap = await ensureCategories(validDrugs);
  console.log('   Category map:', catMap);
  
  // Check for null category IDs
  const nullCats = validDrugs.filter(d => !catMap[guessCategorySlug(d)]);
  if (nullCats.length > 0) {
    console.log(`   WARNING: ${nullCats.length} drugs have no category mapping`);
  }
  
  // Check existing products
  const { count: existingCount, error: countErr } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  
  if (countErr) {
    console.error('   Error counting existing products:', countErr.message);
    console.log('   Check that the migration SQL has been run in Supabase SQL Editor!');
    process.exit(1);
  }
  
  console.log(`\n4. Existing products in DB: ${existingCount || 0}`);
  
  // Get existing names for dedup
  const { data: existingProducts } = await supabase
    .from('products')
    .select('name_en')
    .limit(10000);
  
  const existingNames = new Set(
    (existingProducts || []).map(p => p.name_en?.toLowerCase().trim())
  );
  console.log(`   Known product names for dedup: ${existingNames.size}`);
  
  // Map all drugs to products
  console.log('\n5. Mapping drugs to product schema...');
  const products = validDrugs.map(d => mapDrugToProduct(d, catMap));
  
  // Filter duplicates
  const newProducts = products.filter(p => !existingNames.has(p.name_en?.toLowerCase().trim()));
  console.log(`   New products to insert: ${newProducts.length}`);
  
  // Batch insert
  console.log('\n6. Starting batch insert...\n');
  let inserted = 0;
  let failed = 0;
  const totalBatches = Math.ceil(newProducts.length / BATCH_SIZE);
  
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  for (let i = 0; i < newProducts.length; i += BATCH_SIZE) {
    const batch = newProducts.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    
    // Retry up to 3 times
    let success = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const { data, error } = await supabase
        .from('products')
        .insert(batch)
        .select('id');
      
      if (error) {
        if (attempt < 3) {
          console.log(`  Batch ${batchNum} attempt ${attempt} failed, retrying in 2s...`);
          await sleep(2000);
        } else {
          console.error(`  Batch ${batchNum}/${totalBatches} FAILED after 3 attempts: ${error.message}`);
          // Try one-by-one as last resort
          for (const product of batch) {
            const { error: singleError } = await supabase.from('products').insert([product]);
            if (singleError) {
              failed++;
              if (failed <= 3) console.error(`    Single error: ${singleError.message}`);
            } else {
              inserted++;
            }
          }
        }
      } else {
        inserted += batch.length;
        success = true;
        break;
      }
    }
    
    if (batchNum % 10 === 0 || batchNum === totalBatches) {
      console.log(`  Batch ${batchNum}/${totalBatches} — ${inserted} inserted, ${failed} failed`);
    }
    
    await sleep(DELAY_MS);
  }
  
  console.log('\n=== Import Complete ===');
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total products now: ~${(inserted + (existingCount || 0))}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
