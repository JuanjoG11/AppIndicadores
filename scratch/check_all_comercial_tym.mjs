import { createClient } from '@supabase/supabase-js';
import { kpiDefinitions } from '../src/data/kpiData.js';

const sb = createClient(
    'https://ovjgsscbmkermglezrcj.supabase.co',
    'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp'
);

async function run() {
    const comercialKpis = kpiDefinitions.filter(k => k.area === 'comercial').map(k => k.id);
    
    // Check any records where company_id is TYM, or brand is ALPINA, ZENU, FLEISCHMANN
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

    console.log('Total TYM comercial records across all periods:', tymRecs.length);

    // Let's filter for anything with period 2026-08 OR updated_at in August
    const ago = tymRecs.filter(r => {
        const p = String(r.additional_data?.period || '');
        const u = String(r.updated_at || '');
        return p.startsWith('2026-08') || u.startsWith('2026-08');
    });

    console.log('Agosto related records:', ago.length);
    const byKpi = {};
    for (const r of ago) {
        byKpi[r.kpi_id] = (byKpi[r.kpi_id] || 0) + 1;
    }
    console.log('By KPI:', byKpi);

    // Also check if any record has updated_at in September for TYM Comercial
    const sep = tymRecs.filter(r => {
        const u = String(r.updated_at || '');
        return u.startsWith('2026-09');
    });
    console.log('September records:', sep.length);
}

run();
