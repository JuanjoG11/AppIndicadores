const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAugustAllKPIs() {
    const { data: augustUpdates, error } = await supabase
        .from('kpi_updates')
        .select('id, kpi_id, company_id, updated_at, additional_data')
        .order('updated_at', { ascending: false })
        .limit(1000);

    if (error) {
        console.error(error);
        return;
    }

    const august = augustUpdates.filter(u => {
        const p = u.additional_data?.period || '';
        return p.startsWith('2026-08') || p === '2026-W32' || p === '2026-W33' || p === '2026-W34' || p === '2026-W35';
    });

    console.log(`Total August updates in top 1000 most recent: ${august.length}`);
    const byKpi = {};
    august.forEach(u => {
        byKpi[u.kpi_id] = (byKpi[u.kpi_id] || 0) + 1;
    });
    console.log('August updates by KPI:', byKpi);
}

checkAugustAllKPIs();
