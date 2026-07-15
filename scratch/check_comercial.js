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

    // Filter comercial KPIs
    const comercialKpis = kpiDefinitions.filter(k => k.area === 'comercial');
    const comercialIds = new Set(comercialKpis.map(k => k.id));

    const comercialRows = rows.filter(r => comercialIds.has(r.kpi_id) && r.additional_data?.type !== 'META_UPDATE');

    // Expected reportable period
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const expectedMonth = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;

    console.log(`\nExpected period: ${expectedMonth}\n`);
    console.log('COMERCIAL RECORDS (June+):');

    // Group by kpi+brand
    const groups = {};
    comercialRows.forEach(r => {
        const brand = r.additional_data?.brand || 'Global';
        const company = r.additional_data?.company || r.company_id || '?';
        if (company !== 'TYM') return; // focus on TYM
        const key = `${r.kpi_id}|${brand}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(r);
    });

    Object.entries(groups).forEach(([key, recs]) => {
        const [kpiId, brand] = key.split('|');
        const latest = recs[0];
        const period = latest.additional_data?.period || '';
        const monthKey = period.substring(0, 7);
        const matches = monthKey === expectedMonth || 
            (period.startsWith('2026-W') && (() => {
                const w = parseInt(period.split('-W')[1]);
                const d = new Date(Date.UTC(2026, 0, 1 + (w-1)*7));
                const dow = d.getUTCDay() || 7;
                d.setUTCDate(d.getUTCDate() + 4 - dow);
                return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}` === expectedMonth;
            })());
        const status = matches ? '✅' : '❌ WRONG PERIOD';
        console.log(`${status} ${kpiId} | ${brand} | period=${period} | value=${latest.value} | at=${latest.updated_at.substring(0,10)}`);
    });

    // Show which comercial KPIs have NO records for expected month
    console.log('\nMISSING for TYM in expected period:');
    comercialKpis.forEach(kpi => {
        const brands = Object.keys(kpi.meta || {}).filter(b => 
            ['ALPINA','ZENU','FLEISCHMANN'].includes(b)
        );
        brands.forEach(brand => {
            const key = `${kpi.id}|${brand}`;
            const recs = groups[key] || [];
            const hasExpected = recs.some(r => {
                const p = r.additional_data?.period || '';
                return p.substring(0,7) === expectedMonth || p === expectedMonth;
            });
            if (!hasExpected && recs.length > 0) {
                console.log(`  ⚠️  ${kpi.id} | ${brand} — latest period: ${recs[0].additional_data?.period}`);
            }
        });
    });
}
run();
