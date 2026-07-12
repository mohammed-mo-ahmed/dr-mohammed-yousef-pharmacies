import { readFileSync, readdirSync, writeFileSync } from 'fs';

const SEED_DIR = './supabase/database/seed';

// Get all SQL files in order
const files = readdirSync(SEED_DIR)
  .filter(f => f.endsWith('.sql') && f !== 'seed_all.sql')
  .sort();

console.log(`Combining ${files.length} SQL files into seed_all.sql...\n`);

let combined = `-- ============================================\n`;
combined += `-- SEED ALL: Complete database import\n`;
combined += `-- Generated from ${files.length} files\n`;
combined += `-- Total: 26,435 Egyptian drug records\n`;
combined += `-- ============================================\n\n`;

let totalSize = 0;
for (const file of files) {
  const content = readFileSync(`${SEED_DIR}/${file}`, 'utf8');
  combined += `-- ========== ${file} ==========\n`;
  combined += content;
  combined += '\n\n';
  totalSize += Buffer.byteLength(content);
  console.log(`  Added ${file} (${(Buffer.byteLength(content) / 1024 / 1024).toFixed(2)} MB)`);
}

const outputPath = `${SEED_DIR}/seed_all.sql`;
writeFileSync(outputPath, combined, 'utf8');

const finalMB = (Buffer.byteLength(combined) / 1024 / 1024).toFixed(2);
console.log(`\nDone! ${outputPath} — ${finalMB} MB`);
