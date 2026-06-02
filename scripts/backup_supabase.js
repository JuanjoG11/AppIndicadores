import { config } from 'dotenv';
config();
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
import { writeFile, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BACKUP_DIR = process.env.BACKUP_DIR ?? join(__dirname, '..', 'backups');
const TABLES = (process.env.BACKUP_TABLES ?? 'kpi_updates').split(',');
const FORMAT = process.env.BACKUP_FORMAT === 'csv' ? 'csv' : 'json';

async function exportTable(tableName) {
  console.log(`🔁 Exportando tabla ${tableName}…`);
  const { data, error } = await supabase.from(tableName).select('*');
  if (error) {
    console.error(`❌ Error al leer ${tableName}:`, error.message);
    throw error;
  }

  await mkdir(BACKUP_DIR, { recursive: true });
  const ts = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .replace('Z', '');
  const ext = FORMAT === 'json' ? 'json' : 'csv';
  const fileName = `${tableName}_${ts}.${ext}`;
  const filePath = join(BACKUP_DIR, fileName);

  const content =
    FORMAT === 'json'
      ? JSON.stringify(data, null, 2)
      : data.map(row => Object.values(row).join(',')).join('\n');

  await writeFile(filePath, content, 'utf8');
  console.log(`✅ Backup guardado en ${filePath}`);
}

(async () => {
  try {
    for (const tbl of TABLES) {
      await exportTable(tbl.trim());
    }
    console.log('🎉 Todos los backups completados.');
  } catch (e) {
    console.error('❌ Falló el proceso de backup:', e);
    process.exit(1);
  }
})();
