/**
 * Diagnóstico: datos de comercial TYM en agosto
 */
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
    'https://ovjgsscbmkermglezrcj.supabase.co',
    'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp'
);

const kpisComercial = [
    'venta-realizada-esperada',
    'primer-margen',
    'devoluciones-buen-estado',
    'devoluciones-mal-estado-comercial',
    'ventas-promedio-vendedor',
    'participacion-venta-credito',
    'cobro-optimo-cartera',
    'rotacion-equipo-comercial',
    'gasto-personal-comercial',
    'gasto-viaje-comercial',
    'dias-inventario-comercial'
];

// Todos los registros de comercial TYM con updated_at en agosto
const { data, error } = await sb
    .from('kpi_updates')
    .select('id, kpi_id, company_id, additional_data, updated_at')
    .in('kpi_id', kpisComercial)
    .eq('company_id', 'TYM')
    .gte('updated_at', '2026-08-01T00:00:00')
    .lt('updated_at',  '2026-09-01T00:00:00')
    .order('updated_at', { ascending: false });

if (error) { console.error(error); process.exit(1); }

console.log(`\nRegistros comercial TYM con updated_at en AGOSTO: ${data.length}`);

// Contar por periodo
const byPeriod = {};
data.forEach(r => {
    const p = r.additional_data?.period || '(sin period)';
    byPeriod[p] = (byPeriod[p] || 0) + 1;
});
console.log('\nConteo por period:');
Object.entries(byPeriod).sort().forEach(([p, c]) => console.log(`  ${p}: ${c} registros`));

// Mostrar únicos (más reciente por kpi+brand+period)
console.log('\nDetalle (más reciente por KPI+brand+period):');
const seen = new Set();
data.forEach(r => {
    const period = r.additional_data?.period || '(sin)';
    const brand  = r.additional_data?.brand  || 'Global';
    const tipo   = r.additional_data?.type   || 'DATA';
    const key = `${r.kpi_id}|${brand}|${period}`;
    if (seen.has(key)) return;
    seen.add(key);
    console.log(`  ${r.kpi_id.padEnd(30)} | ${brand.padEnd(14)} | period:${period} | ${tipo} | ${r.updated_at?.substring(0,19)}`);
});
