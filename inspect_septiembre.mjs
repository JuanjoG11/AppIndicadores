/**
 * inspect_septiembre.mjs
 * Inspecciona el estado actual de los KPIs de Septiembre 2026 en Supabase:
 *  - Qué periodos de septiembre existen
 *  - Qué KPIs x marca ya están cargados
 *  - Cuántos faltan
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://ovjgsscbmkermglezrcj.supabase.co',
    'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp'
);

const BRAND_TO_ENTITY = {
    'ALPINA': 'TYM', 'ZENU': 'TYM', 'FLEISCHMANN': 'TYM',
    'UNILEVER': 'TAT', 'FAMILIA': 'TAT', 'TYM': 'TYM', 'TAT': 'TAT'
};

// ¿Un periodo corresponde a septiembre 2026?
function isSeptember(periodStr) {
    const s = String(periodStr || '');
    if (!s) return false;
    // Mensual / Diario / Quincenal
    if (s.startsWith('2026-09')) return true;
    // Semanal: semanas 36-39 caen en septiembre 2026
    const w = s.match(/^2026-W(\d{1,2})$/);
    if (w) {
        const n = parseInt(w[1], 10);
        return n >= 36 && n <= 39;
    }
    return false;
}

async function main() {
    // Traer todo (excluyendo META_UPDATE) — la tabla no debería ser enorme
    const { data: rows, error } = await supabase
        .from('kpi_updates')
        .select('id, kpi_id, company_id, additional_data, updated_at, value')
        .neq('additional_data->>type', 'META_UPDATE')
        .order('updated_at', { ascending: false })
        .limit(5000);

    if (error) { console.error('Error:', error); return; }

    console.log(`Total registros (no META): ${rows.length}`);

    // Todos los periodos únicos
    const allPeriods = {};
    rows.forEach(r => {
        const p = r.additional_data?.period || '(sin periodo)';
        allPeriods[p] = (allPeriods[p] || 0) + 1;
    });
    console.log('\n══ PERIODOS EXISTENTES (conteo) ══');
    Object.entries(allPeriods).sort().forEach(([p, c]) => {
        const mark = isSeptember(p) ? '  <== SEPTIEMBRE' : '';
        console.log(`  ${p.padEnd(14)} : ${c}${mark}`);
    });

    // Filtrar solo septiembre
    const septRows = rows.filter(r => isSeptember(r.additional_data?.period));
    console.log(`\n══ REGISTROS DE SEPTIEMBRE: ${septRows.length} ══`);

    // Agrupar por periodo
    const byPeriod = {};
    septRows.forEach(r => {
        const p = r.additional_data?.period;
        if (!byPeriod[p]) byPeriod[p] = [];
        byPeriod[p].push(r);
    });
    Object.entries(byPeriod).sort().forEach(([p, recs]) => {
        console.log(`\n  Periodo "${p}" → ${recs.length} registros`);
        recs.forEach(r => {
            const brand = r.additional_data?.brand || 'Global';
            const comp = r.company_id;
            console.log(`    ${r.kpi_id.padEnd(38)} | ${String(comp).padEnd(4)} | ${String(brand).padEnd(12)} | val=${r.value}`);
        });
    });

    // KPIs únicos x marca presentes en septiembre
    const septKeys = new Set();
    septRows.forEach(r => {
        const brand = (r.additional_data?.brand || 'Global').toUpperCase();
        const comp = r.company_id;
        septKeys.add(`${comp}|${r.kpi_id}|${brand}`);
    });
    console.log(`\n══ COMBINACIONES (company|kpi|brand) YA CARGADAS EN SEPTIEMBRE: ${septKeys.size} ══`);
    septKeys.forEach(k => console.log('   ' + k));
}

main();
