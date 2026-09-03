import { createClient } from '@supabase/supabase-js';
import { kpiDefinitions } from '../src/data/kpiData.js';

const sb = createClient(
    'https://ovjgsscbmkermglezrcj.supabase.co',
    'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp'
);

async function run() {
    const comercialKpiIds = kpiDefinitions.filter(k => k.area === 'comercial').map(k => k.id);
    console.log('Comercial KPI IDs:', comercialKpiIds);

    // Fetch all for TYM and comercialKpiIds
    const { data, error } = await sb
        .from('kpi_updates')
        .select('*')
        .eq('company_id', 'TYM')
        .in('kpi_id', comercialKpiIds);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Total TYM comercial records:', data.length);

    const byPeriod = {};
    for (const r of data) {
        const p = r.additional_data?.period || 'NO_PERIOD';
        byPeriod[p] = (byPeriod[p] || 0) + 1;
    }
    console.log('By period:', byPeriod);

    // Filter those with period starting with 2026-08 or period === '2026-08'
    const agostoRecs = data.filter(r => {
        const p = String(r.additional_data?.period || '');
        return p.startsWith('2026-08');
    });

    console.log('\n--- Agosto records (count: ' + agostoRecs.length + ') ---');
    for (const r of agostoRecs) {
        console.log(`id: ${r.id} | kpi: ${r.kpi_id.padEnd(30)} | brand: ${(r.additional_data?.brand || 'Global').padEnd(12)} | period: ${r.additional_data?.period} | val: ${r.value} | cargo: ${r.cargo} | date: ${r.updated_at}`);
    }

    // Also check if there are any records with company_id === null or undefined or empty where brand belongs to TYM (ALPINA, ZENU, FLEISCHMANN)
    const { data: noCompRecs, error: err2 } = await sb
        .from('kpi_updates')
        .select('*')
        .in('kpi_id', comercialKpiIds)
        .eq('additional_data->>period', '2026-08');

    if (err2) console.error('Err2:', err2);
    else {
        console.log('\nAll comercial records with period 2026-08 across all companies:');
        const grouped = {};
        for (const r of noCompRecs) {
            const comp = r.company_id || 'NO_COMPANY';
            grouped[comp] = (grouped[comp] || 0) + 1;
        }
        console.log(grouped);
        for (const r of noCompRecs) {
            if (r.company_id === 'TYM') {
                // already saw
            } else {
                console.log(`Other company: ${r.company_id} | brand: ${r.additional_data?.brand} | kpi: ${r.kpi_id} | id: ${r.id}`);
            }
        }
    }
}

run();
