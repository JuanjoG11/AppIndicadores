import { createClient } from '@supabase/supabase-js';
import { kpiDefinitions } from '../src/data/kpiData.js';

const sb = createClient(
    'https://ovjgsscbmkermglezrcj.supabase.co',
    'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp'
);

async function run() {
    const comercialKpis = kpiDefinitions.filter(k => k.area === 'comercial').map(k => k.id);

    const { data, error } = await sb
        .from('kpi_updates')
        .select('*')
        .in('kpi_id', comercialKpis);

    if (error) {
        console.error(error);
        return;
    }

    const tymRecs = data.filter(r => {
        const c = r.company_id;
        const b = r.additional_data?.brand;
        return c === 'TYM' || b === 'ALPINA' || b === 'ZENU' || b === 'FLEISCHMANN';
    });

    console.log('--- Breakdown by KPI, period, brand, and date ---');
    const summary = {};
    for (const r of tymRecs) {
        const p = r.additional_data?.period || 'NO_PERIOD';
        const date = (r.updated_at || '').slice(0, 10);
        const brand = r.additional_data?.brand || r.company_id;
        const key = `${r.kpi_id} | period: ${p} | date: ${date} | brand: ${brand}`;
        summary[key] = (summary[key] || 0) + 1;
    }

    // Filter keys related to August period or August date
    for (const [k, count] of Object.entries(summary).sort()) {
        if (k.includes('2026-08')) {
            console.log(`${k} -> ${count} rows`);
        }
    }
}

run();
