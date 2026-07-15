import { createClient } from '@supabase/supabase-js';
import { kpiDefinitions } from '../src/data/kpiData.js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    const { data: rows } = await supabase
        .from('kpi_updates')
        .select('*')
        .gte('updated_at', '2026-06-01T00:00:00Z')
        .order('updated_at', { ascending: false });

    if (!rows) { console.log('No data'); return; }

    const comercialKpis = kpiDefinitions.filter(k => k.area === 'comercial');
    const comercialIds = new Set(comercialKpis.map(k => k.id));

    // TAT brands: UNILEVER, FAMILIA
    const tatRows = rows.filter(r => 
        comercialIds.has(r.kpi_id) && 
        r.additional_data?.type !== 'META_UPDATE' &&
        (r.additional_data?.company === 'TAT' || r.company_id === 'TAT' ||
         ['UNILEVER','FAMILIA'].includes(r.additional_data?.brand?.toUpperCase()))
    );

    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const expectedMonth = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;

    console.log(`Expected period: ${expectedMonth}`);
    console.log(`TAT comercial records found: ${tatRows.length}\n`);

    tatRows.forEach(r => {
        const period = r.additional_data?.period || '';
        const monthKey = period.substring(0, 7);
        const matches = monthKey === expectedMonth;
        console.log(`${matches ? '✅' : '❌'} ${r.kpi_id} | ${r.additional_data?.brand} | ${r.additional_data?.company || r.company_id} | period=${period} | value=${r.value} | at=${r.updated_at.substring(0,10)}`);
    });
}
run();
