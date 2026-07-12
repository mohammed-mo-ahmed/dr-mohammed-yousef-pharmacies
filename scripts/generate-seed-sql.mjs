import { readFileSync, mkdirSync, writeFileSync } from 'fs';

const RECORDS_PER_FILE = 2000;
const OUTPUT_DIR = './supabase/database/seed';

// Category ID map (must match 000_reset.sql)
const CAT_IDS = {
  medicines: 'a0c1fd42-1093-4091-b129-39374502cf7c',
  wellness: '4c0a1a1c-e6d9-4009-b69b-4a3a78ead84a',
  'personal-care': 'a49cac23-06d8-47bf-9159-4e879eccd533',
  cosmetics: '381df44c-14b1-4be2-b960-85f4213c51bf',
  'baby-care': '3b276995-a804-4300-9981-7cec8ca078c4',
};

function cleanStr(val, maxLen) {
  if (val === null || val === undefined) return null;
  let s = String(val).replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '').trim();
  if (s.length > maxLen) s = s.substring(0, maxLen);
  return s || null;
}

function cleanPrice(val) {
  if (val === null || val === undefined || val === '') return null;
  const cleaned = String(val).replace(/[^0-9.]/g, '').replace(/\.$/, '');
  const num = parseFloat(cleaned);
  return isNaN(num) || num <= 0 ? null : num;
}

function sqlStr(val) {
  if (val === null || val === undefined) return 'NULL';
  return "'" + String(val).replace(/'/g, "''") + "'";
}

function sqlBool(val) {
  return val ? 'TRUE' : 'FALSE';
}

function guessCategorySlug(drug) {
  const cat = (drug.description || '').toLowerCase().trim();
  const name = (drug.name || '').toLowerCase();

  // Medicines (drugs, pharma)
  if (cat.includes('antibiotic') || cat.includes('penicillin') || cat.includes('macrolide') ||
      cat.includes('tetracycline') || cat.includes('quinolone') || cat.includes('carbapenem') ||
      cat.includes('antiviral') || cat.includes('antifungal') || cat.includes('nsaid') ||
      cat.includes('analgesic') || cat.includes('pain') || cat.includes('antitussive') ||
      cat.includes('expectorant') || cat.includes('mucolytic') || cat.includes('bronchodilator') ||
      cat.includes('asthma') || cat.includes('diabetes') || cat.includes('hypertension') ||
      cat.includes('heart') || cat.includes('peptic') || cat.includes('ppi') ||
      cat.includes('proton pump') || cat.includes('cold') || cat.includes('flu') ||
      cat.includes('cough') || cat.includes('anti-inflammatory') || cat.includes('corticosteroid') ||
      cat.includes('glucocorticoid') || cat.includes('muscle relaxant') || cat.includes('antispasmodic') ||
      cat.includes('diuretic') || cat.includes('thyroid') || cat.includes('hormone') ||
      cat.includes('contraceptiv') || cat.includes('psychiatric') || cat.includes('antidepressant') ||
      cat.includes('antipsychotic') || cat.includes('anxiolytic') || cat.includes('hypnotic') ||
      cat.includes('anticonvulsant') || cat.includes('parkinson') || cat.includes('alzheimer') ||
      cat.includes('antithrombotic') || cat.includes('anticoagulant') || cat.includes('antiulcer') ||
      cat.includes('laxative') || cat.includes('antidiarrheal') || cat.includes('antiemetic') ||
      cat.includes('immunosuppress') || cat.includes('immunomodulat') || cat.includes('chemotherapy') ||
      cat.includes('antineoplastic') || cat.includes('narcotic') || cat.includes('local anaesthetic') ||
      cat.includes('general anesthetic') || cat.includes('sedative') || cat.includes('cns') ||
      cat.includes('neuroprotect') || cat.includes('nootropic') || cat.includes('dopamine') ||
      cat.includes('adrenergic') || cat.includes('sympathomimetic') || cat.includes('beta blocker') ||
      cat.includes('calcium channel') || cat.includes('ace inhibitor') || cat.includes('antihistamine') ||
      cat.includes('leukotriene') || cat.includes('mast cell') || cat.includes('vasodilator') ||
      cat.includes('diabetic') || cat.includes('antidiabetic') || cat.includes('insulin') ||
      cat.includes('thrombo') || cat.includes('platelet') || cat.includes('statin') ||
      cat.includes('lipid') || cat.includes('antacid') || cat.includes('carminative') ||
      cat.includes('spasmolytic') || cat.includes('spastic colon') || cat.includes('hemorrhoid') ||
      cat.includes('anal fissure') || cat.includes('treatment') || cat.includes('agent') ||
      cat.includes('inhibitor') || cat.includes('agonist') || cat.includes('blocker') ||
      cat.includes('antagonist') || cat.includes('modulator') || cat.includes('stimulant') ||
      cat.includes('antiseptic') || cat.includes('vaccine') || cat.includes('antiparasitic') ||
      cat.includes('antimalarial') || cat.includes('contraception') || cat.includes('fertility') ||
      cat.includes('prostaglandin') || cat.includes('glp-1') || cat.includes('insulin') ||
      cat.includes('epilepsy')) {
    return 'medicines';
  }

  // Wellness
  if (cat.includes('vitamin') || cat.includes('multivitamin') || cat.includes('supplement') ||
      cat.includes('dietary') || cat.includes('food supplement') || cat.includes('mineral') ||
      cat.includes('calcium') || cat.includes('iron') || cat.includes('zinc') ||
      cat.includes('omega') || cat.includes('fish oil') || cat.includes('collagen') ||
      cat.includes('probiotic') || cat.includes('prebiotic') || cat.includes('folic acid') ||
      cat.includes('coenzyme') || cat.includes('antioxidant') || cat.includes('glucosamin') ||
      cat.includes('chondroprotective') || cat.includes('joint') || cat.includes('bone') ||
      cat.includes('lactoferrin') || cat.includes('protein') || cat.includes('whey') ||
      cat.includes('brain') || cat.includes('memory') || cat.includes('cognitive') ||
      cat.includes('immune') || cat.includes('immunity') || cat.includes('nerve') ||
      cat.includes('liver support') || cat.includes('gummies') || cat.includes('b complex') ||
      cat.includes('biotin') || cat.includes('selenium') || cat.includes('magnesium') ||
      cat.includes('melatonin') || cat.includes('sleep') || cat.includes('prenatal') ||
      cat.includes('cod liver') || cat.includes('nutraceutical') || cat.includes('enzyme')) {
    return 'wellness';
  }

  // Baby care
  if (cat.includes('baby') || cat.includes('infant') || cat.includes('diaper') ||
      cat.includes('cereals') || cat.includes('breastfeeding')) {
    return 'baby-care';
  }

  // Personal care
  if (cat.includes('hair') || cat.includes('shampoo') || cat.includes('oral care') ||
      cat.includes('deodorant') || cat.includes('soap') || cat.includes('tooth') ||
      cat.includes('mouthwash') || cat.includes('feminine') || cat.includes('intimate') ||
      cat.includes('body wash') || cat.includes('body lotion') || cat.includes('feet care') ||
      cat.includes('nail care') || cat.includes('lip care') || cat.includes('conditioner') ||
      cat.includes('massage') || cat.includes('contraceptive') && cat.includes('pills')) {
    return 'personal-care';
  }

  // Cosmetics
  if (cat.includes('cosmetic') || cat.includes('cream') || cat.includes('moisturiz') ||
      cat.includes('emollient') || cat.includes('whitening') || cat.includes('anti-aging') ||
      cat.includes('serum') || cat.includes('cleanser') || cat.includes('facial') ||
      cat.includes('skin care') || cat.includes('sunscreen') || cat.includes('sun block') ||
      cat.includes('exfoliat') || cat.includes('peeling') || cat.includes('rejuvenat') ||
      cat.includes('stretch mark') || cat.includes('firming') || cat.includes('nourishing') ||
      cat.includes('soothing') || cat.includes('scar') || cat.includes('emulgel') ||
      cat.includes('panthenol') || cat.includes('eczema') || cat.includes('psoriasis') ||
      cat.includes('dermatological') || cat.includes('keratolytic') || cat.includes('niacinamide') ||
      cat.includes('lightening') || cat.includes('burn') && cat.includes('cream')) {
    return 'cosmetics';
  }

  return 'medicines';
}

function guessForm(drug) {
  const name = (drug.name || '').toLowerCase();
  if (name.includes('syrup') || name.includes('شراب')) return 'syrup';
  if (name.match(/\btab/)) return 'tablet';
  if (name.match(/\bcap/)) return 'capsule';
  if (name.includes('cream') || name.includes('كريم')) return 'cream';
  if (name.includes('drop') || name.includes('نقط')) return 'drops';
  if (name.includes('vial') || name.includes('فيال')) return 'vial';
  if (name.includes('inhaler') || name.includes('بخاخ')) return 'inhaler';
  if (name.includes('spray')) return 'spray';
  if (name.includes('suspension')) return 'suspension';
  if (name.includes('ointment') || name.includes('مرهم')) return 'ointment';
  if (name.includes('sachet') || name.includes('ساشيه')) return 'sachet';
  if (name.includes('powder') || name.includes('بودرة')) return 'powder';
  if (name.includes('gel') || name.includes('جل')) return 'gel';
  if (name.includes('lotion') || name.includes('لوسيون')) return 'lotion';
  if (name.includes('shampoo')) return 'shampoo';
  if (name.includes('soap')) return 'soap';
  return null;
}

function guessSize(drug) {
  if (drug.units) return cleanStr(drug.units, 100);
  const name = (drug.name || '').toLowerCase();
  const m = name.match(/(\d+\s*(?:mg|ml|g|mcg|iu|unit)[\s\S]{0,20})/i);
  return m ? cleanStr(m[1], 100) : null;
}

function escapeSQL(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  // Escape single quotes and backslashes
  return "E'" + String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

function buildProductRow(drug, idx) {
  const slug = guessCategorySlug(drug);
  const catId = CAT_IDS[slug];

  const nameEn = cleanStr(drug.name, 500) || 'No Name';
  const nameAr = cleanStr(drug.arabic, 500) || 'بدون اسم';
  const price = cleanPrice(drug.price) || 0;
  const activeArr = Array.isArray(drug.active) ? drug.active.join(', ') : (drug.active || null);

  return {
    id_val: null, // let uuid_generate_v4() handle it
    name_ar: nameAr,
    name_en: nameEn,
    price,
    description_ar: cleanStr(drug.uses_summary || drug.description, 2000),
    description_en: cleanStr(drug.uses_summary_en || drug.description, 2000),
    usage_instructions_ar: cleanStr(drug.uses_summary, 2000),
    usage_instructions_en: cleanStr(drug.uses_summary_en, 2000),
    image_url: '',
    category_id: catId,
    stock: 10,
    is_best_seller: false,
    is_latest: false,
    active_ingredients: cleanStr(activeArr, 1000),
    company: cleanStr(drug.company, 500),
    barcode: cleanStr(drug.barcode, 100),
    form: guessForm(drug),
    size: guessSize(drug),
    old_price: cleanPrice(drug.oldprice),
    availability: cleanStr(drug.availability, 100),
    drug_category: cleanStr(drug.description, 500),
    uses_summary_ar: cleanStr(drug.uses_summary, 3000),
    uses_summary_en: cleanStr(drug.uses_summary_en, 3000),
    warnings_summary_ar: cleanStr(drug.warnings_summary, 3000),
    warnings_summary_en: cleanStr(drug.warnings_summary_en, 3000),
    warning_high_bp: drug.warning_high_blood_pressure === true || drug.warning_high_blood_pressure === 'true',
    warning_diabetes: drug.warning_diabetes === true || drug.warning_diabetes === 'true',
    warning_pregnancy: drug.warning_pregnancy === true || drug.warning_pregnancy === 'true',
    warning_lactation: drug.warning_lactation === true || drug.warning_lactation === 'true',
    warning_kidney: drug.warning_kidney === true || drug.warning_kidney === 'true',
    warning_liver: drug.warning_liver === true || drug.warning_liver === 'true',
    warning_heart: drug.warning_heart === true || drug.warning_heart === 'true',
  };
}

function generateInsertSQL(rows) {
  const columns = [
    'name_ar', 'name_en', 'price', 'description_ar', 'description_en',
    'usage_instructions_ar', 'usage_instructions_en', 'image_url', 'category_id',
    'stock', 'is_best_seller', 'is_latest', 'active_ingredients', 'company',
    'barcode', 'form', 'size', 'old_price', 'availability', 'drug_category',
    'uses_summary_ar', 'uses_summary_en', 'warnings_summary_ar', 'warnings_summary_en',
    'warning_high_bp', 'warning_diabetes', 'warning_pregnancy', 'warning_lactation',
    'warning_kidney', 'warning_liver', 'warning_heart'
  ];

  const lines = rows.map(row => {
    const vals = columns.map(col => {
      const v = row[col];
      if (v === null || v === undefined) return 'NULL';
      if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
      if (typeof v === 'number') return String(v);
      return escapeSQL(v);
    });
    return `(${vals.join(', ')})`;
  });

  return `INSERT INTO products (${columns.join(', ')}) VALUES\n${lines.join(',\n')};`;
}

// ---- MAIN ----
console.log('Reading eg_drugs.json...');
let raw = readFileSync('./eg-drugs-main/eg-drugs-main/data/eg_drugs.json', 'utf8');
raw = raw.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');
const drugs = JSON.parse(raw);
console.log(`Total drugs: ${drugs.length}`);

// Filter to valid price
const valid = drugs.filter(d => cleanPrice(d.price) !== null);
console.log(`With valid price: ${valid.length}`);

// Map to product rows
console.log('Mapping to product schema...');
const products = valid.map((d, i) => buildProductRow(d, i));
console.log(`Mapped: ${products.length} products`);

// Ensure output dir
mkdirSync(OUTPUT_DIR, { recursive: true });

// Split into files
const totalFiles = Math.ceil(products.length / RECORDS_PER_FILE);
console.log(`Splitting into ${totalFiles} files (${RECORDS_PER_FILE} records each)...\n`);

for (let fileIdx = 0; fileIdx < totalFiles; fileIdx++) {
  const start = fileIdx * RECORDS_PER_FILE;
  const end = Math.min(start + RECORDS_PER_FILE, products.length);
  const chunk = products.slice(start, end);

  const fileName = `${String(fileIdx + 1).padStart(3, '0')}_products.sql`;
  const filePath = `${OUTPUT_DIR}/${fileName}`;

  const sql = generateInsertSQL(chunk);
  writeFileSync(filePath, sql, 'utf8');

  const sizeMB = (Buffer.byteLength(sql) / 1024 / 1024).toFixed(2);
  console.log(`  ${fileName} — ${chunk.length} records (${sizeMB} MB)`);
}

console.log(`\nDone! ${products.length} products → ${totalFiles} SQL files in ${OUTPUT_DIR}/`);
console.log('Run 000_reset.sql first, then 001_products.sql through the last file.');
