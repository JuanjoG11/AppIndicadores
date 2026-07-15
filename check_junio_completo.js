/**
 * Busca TODOS los registros con period=2026-06 sin importar la fecha de updated_at
 * (incluye los cargados en julio como mes vencido)
 */
import { createClient } from '@supabase/supabase-js';
const sb = createClient('https://ovjgsscbmkermglezrcj.supabase.co','sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp');

const { data, error } = await sb.from('kpi_updates')
  .select('kpi_id, cargo, additional_data, updated_at, value, company_id')
  .eq('additional_data->>period', '2026-06')
  .neq('additional_data->>type', 'META_UPDATE')
  .order('cargo', { ascending: true })
  .order('kpi_id', { ascending: true })
  .order('updated_at', { ascending: false });

if (error) { console.error(error); process.exit(1); }

// Metas
const { data: metasData } = await sb.from('kpi_updates')
  .select('kpi_id, additional_data, value, company_id')
  .eq('additional_data->>period', '2026-06')
  .eq('additional_data->>type', 'META_UPDATE')
  .order('updated_at', { ascending: false });

const metas = {};
(metasData || []).forEach(m => {
  const brand = m.additional_data?.brand || m.company_id || 'Global';
  const key = `${m.kpi_id}|${brand}`;
  if (!metas[key]) metas[key] = m.value;
});

// Último valor por kpi+brand+cargo
const ultimos = {};
data.forEach(r => {
  const brand = r.additional_data?.brand || r.company_id || 'Global';
  const key = `${r.kpi_id}|${brand}|${r.cargo}`;
  if (!ultimos[key]) ultimos[key] = r;
});

// Agrupar por cargo
const porcargo = {};
Object.values(ultimos).forEach(r => {
  const cargo = r.cargo || 'SIN CARGO';
  if (!porcargo[cargo]) porcargo[cargo] = [];
  const brand = r.additional_data?.brand || r.company_id || 'Global';
  porcargo[cargo].push({
    kpi: r.kpi_id, brand,
    valor: r.value,
    meta: metas[`${r.kpi_id}|${brand}`] ?? 'N/A',
    fecha: r.updated_at.substring(0, 10),
  });
});

console.log('\n══════════════════════════════════════════════════════════════');
console.log('  TODOS LOS DATOS JUNIO 2026 (incluye cargados en julio)');
console.log('══════════════════════════════════════════════════════════════');
Object.entries(porcargo).sort().forEach(([cargo, regs]) => {
  console.log(`\n📌 ${cargo}`);
  regs.sort((a,b) => a.kpi.localeCompare(b.kpi)).forEach(r => {
    console.log(`   ${r.kpi.padEnd(34)} | ${String(r.brand).padEnd(24)} | valor: ${String(r.valor).padEnd(15)} | meta: ${String(r.meta).padEnd(8)} | ${r.fecha}`);
  });
});

console.log(`\nTotal registros únicos: ${Object.values(ultimos).length}`);
console.log(`Total registros brutos: ${data.length}`);
