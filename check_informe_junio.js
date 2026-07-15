/**
 * Extrae todos los valores reales de junio para los KPIs del informe de bonificaciones
 */
import { createClient } from '@supabase/supabase-js';
const sb = createClient('https://ovjgsscbmkermglezrcj.supabase.co','sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp');

// KPIs relevantes para el informe
const kpisInforme = [
  'impresion-facturas', 'error-facturacion', 'pedidos-facturados',
  'revision-precios', 'cumplimiento-inventarios', 'revision-margenes', 'exactitud-inventarios',
  'cartera-no-vencida', 'cartera-mayor-30', 'valor-cartera-venta',
  'conciliaciones-bancarias', 'arqueos-realizados', 'planillas-cerradas', 'indice-arqueo-caja',
  'pedidos-devueltos', 'promedio-pedidos-auxiliar', 'promedio-pedidos-carro', 'gasto-fletes-venta',
  'tiempo-contratacion', 'calificacion-auditoria', 'actividades-cultura',
  'planillas-cerradas', 'vales-descuadres', 'indice-arqueo-caja',
  'mantenimiento-equipos', 'cumplimiento-tareas', 'efectividad-resolucion'
];

const { data, error } = await sb.from('kpi_updates')
  .select('id, kpi_id, cargo, additional_data, updated_at, value, company_id')
  .eq('additional_data->>period','2026-06')
  .neq('additional_data->>type','META_UPDATE')
  .order('kpi_id', { ascending: true });

if (error) { console.error(error); process.exit(1); }

// Obtener el valor más reciente por kpi_id + brand + cargo
const ultimos = {};
data.forEach(r => {
  const brand = r.additional_data?.brand || r.company_id || 'Global';
  const key = `${r.kpi_id}|${brand}|${r.cargo}`;
  if (!ultimos[key] || r.updated_at > ultimos[key].updated_at) {
    ultimos[key] = r;
  }
});

// Obtener también metas
const { data: metas, error: eM } = await sb.from('kpi_updates')
  .select('kpi_id, additional_data, value, updated_at, company_id, cargo')
  .eq('additional_data->>type','META_UPDATE')
  .eq('additional_data->>period','2026-06')
  .order('updated_at', { ascending: false });

const ultimasMetas = {};
(metas || []).forEach(m => {
  const brand = m.additional_data?.brand || m.company_id || 'Global';
  const key = `${m.kpi_id}|${brand}`;
  if (!ultimasMetas[key]) ultimasMetas[key] = m;
});

console.log('\n══════════════════════════════════════════════════');
console.log('  VALORES REALES JUNIO 2026 — INFORME BONIFICACIONES');
console.log('══════════════════════════════════════════════════\n');

const grupos = {};
Object.values(ultimos).forEach(r => {
  const brand = r.additional_data?.brand || r.company_id || 'Global';
  if (!grupos[r.kpi_id]) grupos[r.kpi_id] = [];
  grupos[r.kpi_id].push({ brand, cargo: r.cargo, value: r.value, fecha: r.updated_at.substring(0,10) });
});

// Mostrar agrupado por KPI
Object.entries(grupos).sort().forEach(([kpiId, vals]) => {
  console.log(`\n📌 ${kpiId}`);
  vals.forEach(v => {
    const metaKey = `${kpiId}|${v.brand}`;
    const meta = ultimasMetas[metaKey];
    console.log(`   Brand: ${v.brand.padEnd(20)} | Cargo: ${v.cargo.padEnd(25)} | Valor: ${String(v.value).padEnd(12)} | Meta: ${meta ? meta.value : 'N/A'} | Fecha: ${v.fecha}`);
  });
});

console.log('\n\n══ SOLO FACTURACIÓN (impresion-facturas, error-facturacion, pedidos-facturados) ══');
['impresion-facturas','error-facturacion','pedidos-facturados'].forEach(kid => {
  const vals = grupos[kid] || [];
  console.log(`\n${kid}:`);
  vals.forEach(v => {
    const metaKey = `${kid}|${v.brand}`;
    const meta = ultimasMetas[metaKey];
    console.log(`  ${v.brand.padEnd(20)} | valor: ${String(v.value).padEnd(12)} | meta: ${meta ? meta.value : 'N/A'}`);
  });
});
