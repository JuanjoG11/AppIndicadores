/**
 * check_comercial.js
 * Muestra todos los registros del area comercial para ver qué periodos tienen
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://ovjgsscbmkermglezrcj.supabase.co',
    'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp'
);

const COMERCIAL_KPIS = [
    'venta-realizada-esperada',
    'devoluciones-buen-estado',
    'devoluciones-mal-estado-comercial',
    'participacion-venta-credito',
    'cobro-optimo-cartera',
    'rotacion-equipo-comercial',
    'gasto-personal-comercial',
    'gasto-viaje-comercial',
    'promedio-venta-vendedor',
    'dias-inventario-comercial',
    'primer-margen',
    'cartera-vencida-total',
    'cartera-11-30',
    'valor-cartera-venta',
    'cartera-no-vencida',
    'cartera-mayor-30'
];

async function main() {
    const { data: rows, error } = await supabase
        .from('kpi_updates')
        .select('id, kpi_id, company_id, cargo, additional_data, updated_at, value')
        .in('kpi_id', COMERCIAL_KPIS)
        .neq('additional_data->>type', 'META_UPDATE')
        .order('kpi_id', { ascending: true })
        .order('updated_at', { ascending: false });

    if (error) { console.error(error); return; }

    console.log('\n══ DATOS COMERCIAL EN SUPABASE ══');
    console.log('kpi_id                         | period    | updated_at (BOG)          | brand              | cargo              | value');
    console.log('─'.repeat(130));

    rows.forEach(r => {
        const fecha = new Date(r.updated_at).toLocaleString('es-CO', { 
            timeZone: 'America/Bogota',
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        const kpi    = (r.kpi_id || '').padEnd(30);
        const period = (r.additional_data?.period || '?').padEnd(10);
        const brand  = (r.additional_data?.brand || 'Global').padEnd(18);
        const cargo  = (r.cargo || '').padEnd(18);
        const val    = String(r.value ?? '').padEnd(12);
        console.log(`${kpi} | ${period} | ${fecha} | ${brand} | ${cargo} | ${val}`);
    });

    // Agrupar por periodo para ver claramente
    console.log('\n══ RESUMEN POR PERIODO ══');
    const byPeriod = {};
    rows.forEach(r => {
        const p = r.additional_data?.period || '?';
        if (!byPeriod[p]) byPeriod[p] = 0;
        byPeriod[p]++;
    });
    Object.entries(byPeriod).sort().forEach(([p, count]) => {
        console.log(`  ${p}: ${count} registros`);
    });

    console.log(`\nTotal: ${rows.length} registros`);
}

main();
