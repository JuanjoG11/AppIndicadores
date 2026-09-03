import { createClient } from '@supabase/supabase-js';
import { kpiDefinitions } from '../src/data/kpiData.js';

const sb = createClient(
    'https://ovjgsscbmkermglezrcj.supabase.co',
    'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp'
);

async function run() {
    const kpisToCheck = kpiDefinitions
        .filter(k => k.area === 'comercial' || k.area === 'administrativo')
        .map(k => k.id);

    const { data } = await sb
        .from('kpi_updates')
        .select('*')
        .in('kpi_id', kpisToCheck);

    const tymData = data.filter(u => {
        const comp = u.company_id || u.additional_data?.company;
        const brand = u.additional_data?.brand;
        return comp === 'TYM' || ['ALPINA', 'ZENU', 'FLEISCHMANN'].includes(brand);
    });

    console.log(`Total TYM records for comercial & administrativo: ${tymData.length}`);

    // Filter by August period
    const augustRecs = tymData.filter(u => {
        const p = String(u.additional_data?.period || '');
        return p.includes('2026-08') || p === '2026-W32';
    });

    console.log(`August period count: ${augustRecs.length}`);

    // Dates of these records:
    const dates = {};
    augustRecs.forEach(r => {
        const d = (r.updated_at || '').slice(0, 10);
        dates[d] = (dates[d] || 0) + 1;
    });
    console.log('Dates of August records:', dates);

    // Also check records with period = 2026-W31
    const w31Recs = tymData.filter(u => String(u.additional_data?.period || '') === '2026-W31');
    console.log(`W31 period count: ${w31Recs.length}`);
    const w31Dates = {};
    w31Recs.forEach(r => {
        const d = (r.updated_at || '').slice(0, 10);
        w31Dates[d] = (w31Dates[d] || 0) + 1;
    });
    console.log('Dates of W31 records:', w31Dates);
}

run();
