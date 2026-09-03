import { createClient } from '@supabase/supabase-js';
import { kpiDefinitions } from '../src/data/kpiData.js';

const sb = createClient(
    'https://ovjgsscbmkermglezrcj.supabase.co',
    'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp'
);

async function run() {
    const comercialKpiDefs = kpiDefinitions.filter(k => k.area === 'comercial');
    const comercialKpiIds = comercialKpiDefs.map(k => k.id);

    console.log('Comercial KPIs:', comercialKpiDefs.map(k => `${k.id} (${k.frecuencia})`));

    const { data, error } = await sb
        .from('kpi_updates')
        .select('*')
        .in('kpi_id', comercialKpiIds)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    // Filter by company TYM
    const tymData = data.filter(r => {
        const c = r.company_id || r.additional_data?.company;
        const b = r.additional_data?.brand;
        return c === 'TYM' || b === 'ALPINA' || b === 'ZENU' || b === 'FLEISCHMANN';
    });

    console.log(`Total records for TYM commercial: ${tymData.length}`);

    // Group by (period, date, kpi_id)
    const byDateAndPeriod = {};
    for (const r of tymData) {
        const d = (r.updated_at || '').slice(0, 10);
        const p = r.additional_data?.period || 'NO_PERIOD';
        const key = `date: ${d} | period: ${p}`;
        if (!byDateAndPeriod[key]) byDateAndPeriod[key] = [];
        byDateAndPeriod[key].push(r);
    }

    for (const [k, rows] of Object.entries(byDateAndPeriod).sort()) {
        const kpisInGroup = [...new Set(rows.map(r => r.kpi_id))];
        console.log(`${k} -> ${rows.length} rows. KPIs: ${kpisInGroup.join(', ')}`);
    }
}

run();
