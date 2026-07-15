/**
 * Revisa datos reales de junio para cartera, SST, abastecimientos y facturación
 */
import { createClient } from '@supabase/supabase-js';
const sb = createClient('https://ovjgsscbmkermglezrcj.supabase.co','sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp');

const kpisARevisar = [
  // Cartera (Diana García)
  'cartera-no-vencida', 'cartera-mayor-30', 'valor-cartera-venta',
  // SST y Cultura (Karina Taba, María José Franco)
  'calificacion-auditoria', 'actividades-cultura', 'tiempo-contratacion',
  // Abastecimientos (Anyi Mosquera)
  'revision-precios', 'cumplimiento-inventarios', 'revision-margenes', 'exactitud-inventarios',
  // Facturación (Mariana Gallego - error-facturacion)
  'impresion-facturas', 'error-facturacion', 'pedidos-facturados',
];

// Traer TODOS los registros de junio (sin filtro de tipo para ver también metas)
const { data, error } = await sb.from('kpi_updates')
  .select('id, kpi_id, cargo, additional_data, updated_at, value, company_id')
  .eq('additional_data->>period', '2026-06')
  .in('kpi_id', kpisARevisar)
  .order('kpi_id', { ascending: true })
  .order('updated_at', { ascending: true });

if (error) { console.error(error); process.exit(1); }

// Separar metas y valores reales
const metas  = data.filter(r => r.additional_data?.type === 'META_UPDATE');
const valores = data.filter(r => r.additional_data?.type !== 'META_UPDATE');

// Agrupar valores — quedarse con el MÁS RECIENTE por kpi+brand
const ultimoValor = {};
valores.forEach(r => {
  const brand = r.additional_data?.brand || r.company_id || 'Global';
  const key = `${r.kpi_id}|${brand}`;
  if (!ultimoValor[key] || r.updated_at > ultimoValor[key].updated_at) {
    ultimoValor[key] = r;
  }
});

const ultimaMeta = {};
metas.forEach(r => {
  const brand = r.additional_data?.brand || r.company_id || 'Global';
  const key = `${r.kpi_id}|${brand}`;
  if (!ultimaMeta[key] || r.updated_at > ultimaMeta[key].updated_at) {
    ultimaMeta[key] = r;
  }
});

const grupos = {};
Object.values(ultimoValor).forEach(r => {
  if (!grupos[r.kpi_id]) grupos[r.kpi_id] = [];
  const brand = r.additional_data?.brand || r.company_id || 'Global';
  const metaKey = `${r.kpi_id}|${brand}`;
  grupos[r.kpi_id].push({
    brand,
    cargo: r.cargo,
    valor: r.value,
    meta: ultimaMeta[metaKey]?.value ?? 'N/A',
    fecha: r.updated_at.substring(0,10),
  });
});

console.log('\n════════════════════════════════════════════════════════');
console.log('  REVISIÓN JUNIO 2026 — CARTERA, SST, ABAST, FACT');
console.log('════════════════════════════════════════════════════════');

const orden = [
  ['CARTERA', ['cartera-no-vencida','cartera-mayor-30','valor-cartera-venta']],
  ['SST / CULTURA', ['calificacion-auditoria','actividades-cultura','tiempo-contratacion']],
  ['ABASTECIMIENTOS', ['revision-precios','cumplimiento-inventarios','revision-margenes','exactitud-inventarios']],
  ['FACTURACIÓN', ['impresion-facturas','error-facturacion','pedidos-facturados']],
];

orden.forEach(([titulo, ids]) => {
  console.log(`\n── ${titulo} ──`);
  ids.forEach(id => {
    const regs = grupos[id] || [];
    if (regs.length === 0) {
      console.log(`  ${id}: ⚠️  SIN DATO EN BD`);
    } else {
      regs.forEach(r => {
        console.log(`  ${id.padEnd(28)} | Brand: ${String(r.brand).padEnd(22)} | Valor: ${String(r.valor).padEnd(15)} | Meta: ${String(r.meta).padEnd(10)} | ${r.fecha}`);
      });
    }
  });
});

// Mostrar TODOS los registros (no solo último) para ver historial
console.log('\n\n════ HISTORIAL COMPLETO (todos los registros, sin filtrar último) ════');
['cartera-no-vencida','cartera-mayor-30','valor-cartera-venta',
 'calificacion-auditoria','actividades-cultura','tiempo-contratacion',
 'exactitud-inventarios','error-facturacion'].forEach(id => {
  const regs = valores.filter(r => r.kpi_id === id);
  if (regs.length > 0) {
    console.log(`\n${id}:`);
    regs.forEach(r => {
      const brand = r.additional_data?.brand || r.company_id || 'Global';
      const tipo  = r.additional_data?.type || 'valor';
      console.log(`  ${r.updated_at.substring(0,10)} | ${String(brand).padEnd(20)} | valor: ${String(r.value).padEnd(12)} | cargo: ${r.cargo} | tipo: ${tipo}`);
    });
  }
});
