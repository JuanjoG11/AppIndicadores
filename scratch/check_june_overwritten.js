import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    const { data: rows } = await supabase
        .from('kpi_updates')
        .select('kpi_id, company_id, additional_data, updated_at, value')
        .gte('updated_at', '2026-06-01T00:00:00Z')
        .neq('additional_data->>type', 'META_UPDATE')
        .order('updated_at', { ascending: true });

    if (!rows) { console.log('No data'); return; }

    // Group by kpi+company+brand
    const groups = {};
    rows.forEach(r => {
        const brand = r.additional_data?.brand || 'Global';
        const company = r.additional_data?.company || r.company_id || 'TYM';
        const period = r.additional_data?.period || '';
        const key = `${r.kpi_id}|${company}|${brand}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push({ period, value: r.value, updated_at: r.updated_at });
    });

    // Find groups that have BOTH june (2026-06) AND a later period (2026-07 or 2026-07-xx)
    let affected = 0;
    Object.entries(groups).forEach(([key, records]) => {
        const hasJune = records.some(r => r.period === '2026-06');
        const hasLater = records.some(r => r.period && r.period > '2026-06' && !r.period.startsWith('2026-06'));
        if (hasJune && hasLater) {
            affected++;
            const [kpiId, company, brand] = key.split('|');
            const juneRec = records.filter(r => r.period === '2026-06').sort((a,b) => b.updated_at.localeCompare(a.updated_at))[0];
            const laterRec = records.filter(r => r.period && r.period > '2026-06').sort((a,b) => b.updated_at.localeCompare(a.updated_at))[0];
            console.log(`⚠️  ${kpiId} | ${company} | ${brand}`);
            console.log(`   June: ${juneRec.period} val=${juneRec.value} at=${juneRec.updated_at.substring(0,10)}`);
            console.log(`   Later: ${laterRec.period} val=${laterRec.value} at=${laterRec.updated_at.substring(0,10)}`);
        }
    });

    console.log(`\nTotal affected KPI/brand combos: ${affected}`);
}
run();
