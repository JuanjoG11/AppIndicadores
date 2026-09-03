import { createClient } from '@supabase/supabase-js';
import { kpiDefinitions } from '../src/data/kpiData.js';

const sb = createClient(
    'https://ovjgsscbmkermglezrcj.supabase.co',
    'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp'
);

async function run() {
    const comercialKpiIds = kpiDefinitions.filter(k => k.area === 'comercial').map(k => k.id);

    // Records for TYM in comercialKpiIds
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

    // Filter by period 2026-08
    const agosto = data.filter(r => {
        const p = String(r.additional_data?.period || '');
        return p === '2026-08' || p.startsWith('2026-08');
    });

    console.log('Agosto count for TYM Comercial:', agosto.length);

    // Group by kpi_id, brand
    const grouped = {};
    for (const r of agosto) {
        const key = `${r.kpi_id} | brand: ${r.additional_data?.brand}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(r);
    }

    for (const [key, rows] of Object.entries(grouped)) {
        console.log(`${key}: ${rows.length} rows (dates: ${rows.map(x => x.updated_at.slice(0, 10)).join(', ')})`);
    }

    // Check if there are any other periods or dates in August
    const updatedInAgosto = data.filter(r => (r.updated_at || '').startsWith('2026-08'));
    console.log('Records with updated_at in August:', updatedInAgosto.length);

    // Check if there are any September records for comercial TYM
    const sept = data.filter(r => (r.updated_at || '').startsWith('2026-09') || (r.additional_data?.period || '').startsWith('2026-09'));
    console.log('Records in September for Comercial TYM:', sept.length);
    for (const r of sept) {
        console.log('SEPT:', r.id, r.kpi_id, r.additional_data?.brand, r.additional_data?.period, r.updated_at);
    }
}

run();
