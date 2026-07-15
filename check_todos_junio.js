/**
 * Jala TODOS los registros de junio 2026 de la BD
 * para ver exactamente qué hay por responsable/cargo
 */
import { createClient } from '@supabase/supabase-js';
const sb = createClient('https://ovjgsscbmkermglezrcj.supabase.co','sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp');

// 1. Todos los valores (no metas) de junio
const { data, error } = await sb.from('kpi_updates')
  .select('kpi_id, cargo, additional_data, updated_at, value, company_id')
  .eq('additional_data->>period', '2026-06')
  .neq('additional_data->>type', 'META_UPDATE')
  .order('cargo', { ascending: true })
  .order('kpi_id', { ascending: true })
  .order('updated_at', { ascending: false });

if (error) { console.error(error); process.exit(1); }

// Quedarme con el valor MÁS RECIENTE por kpi+brand+cargo
const ultimos = {};
data.forEach(r => {
  const brand = r.additional_data?.brand || r.company_id || 'Global';
  const key = `${r.kpi_id}|${brand}|${r.cargo}`;
  if (!ultimos[key]) ultimos[key] = r;
});

// 2. Todas las metas de junio
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

// Agrupar por cargo
const porcargo = {};
Object.values(ultimos).forEach(r => {
  const cargo = r.cargo || 'SIN CARGO';
  if (!porcargo[cargo]) porcargo[cargo] = [];
  const brand = r.additional_data?.brand || r.company_id || 'Global';
  porcargo[cargo].push({
    kpi:   r.kpi_id,
    brand,
    valor: r.value,
    meta:  metas[`${r.kpi_id}|${brand}`] ?? 'N/A',
    fecha: r.updated_at.substring(0,10),
  });
});

console.log('\n══════════════════════════════════════════════════════════');
console.log('  DATOS REALES JUNIO 2026 — AGRUPADO POR CARGO');
console.log('══════════════════════════════════════════════════════════');
Object.entries(porcargo).sort().forEach(([cargo, regs]) => {
  console.log(`\n📌 CARGO: ${cargo}`);
  regs.forEach(r => {
    console.log(`   ${r.kpi.padEnd(32)} | Brand: ${String(r.brand).padEnd(22)} | Valor: ${String(r.valor).padEnd(15)} | Meta: ${String(r.meta).padEnd(8)} | ${r.fecha}`);
  });
});

console.log(`\nTotal registros únicos: ${Object.values(ultimos).length}`);
