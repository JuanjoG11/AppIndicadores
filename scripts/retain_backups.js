import { readdir, unlink, mkdir } from 'fs/promises';
import { join } from 'path';

const BACKUP_DIR = process.env.BACKUP_DIR ?? join(__dirname, '..', 'backups');
const RETENTION_MONTHS = Number(process.env.RETENTION_MONTHS ?? 12); // keep last 12 months

function dateFromFile(name) {
  const m = name.match(/_(\d{4})-(\d{2})-(\d{2})_/);
  return m ? new Date(`${m[1]}-${m[2]}-${m[3]}`) : null;
}

(async () => {
  try {
    await mkdir(BACKUP_DIR, { recursive: true });
    const files = await readdir(BACKUP_DIR);
    const now = Date.now();
    for (const f of files) {
      const fDate = dateFromFile(f);
      if (!fDate) continue;
      const ageMonths = (now - fDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (ageMonths > RETENTION_MONTHS) {
        await unlink(join(BACKUP_DIR, f));
        console.log(`🗑️  Deleted old backup: ${f}`);
      }
    }
    console.log('✅ Retention cleanup completed.');
  } catch (e) {
    console.error('❌ Retention script error:', e);
    process.exit(1);
  }
})();
