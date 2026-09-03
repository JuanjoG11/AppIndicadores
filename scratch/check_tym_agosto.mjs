import { createClient } from '@supabase/supabase-js';

const sb = createClient(
    'https://ovjgsscbmkermglezrcj.supabase.co',
    'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp'
);

async function run() {
    const { data, error } = await sb
        .from('kpi_updates')
        .select('id, kpi_id, company_id, cargo, additional_data, updated_at, value')
        .eq('company_id', 'TYM')
        .eq('additional_data->>period', '2026-08');

    if (error) {
        console.error(error);
        return;
    }

    console.log('Total TYM records with period 2026-08:', data.length);

    const byKpi = {};
    for (const r of data) {
        if (!byKpi[r.kpi_id]) byKpi[r.kpi_id] = [];
        byKpi[r.kpi_id].push(r);
    }

    for (const [kpi, rows] of Object.entries(byKpi)) {
        console.log(`\nKPI: ${kpi} (${rows.length} rows)`);
        for (const r of rows) {
            console.log(`  id: ${r.id} | brand: ${r.additional_data?.brand} | cargo: ${r.cargo} | val: ${r.value} | type: ${r.additional_data?.type} | date: ${r.updated_at}`);
        }
    }
}

run();
