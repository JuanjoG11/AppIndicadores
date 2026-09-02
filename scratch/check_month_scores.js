const { createClient } = require('@supabase/supabase-js');
const { kpiDefinitions } = require('../src/data/kpiData.js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkScores() {
    const { data: updates, error } = await supabase
        .from('kpi_updates')
        .select('*')
        .order('updated_at', { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Total updates fetched: ${updates.length}`);
    
    // Group updates by period/month
    const julyUpdates = updates.filter(u => {
        const period = u.additional_data?.period || '';
        return period.startsWith('2026-07') || period === '2026-W30' || period === '2026-W31';
    });

    const augustUpdates = updates.filter(u => {
        const period = u.additional_data?.period || '';
        return period.startsWith('2026-08') || period === '2026-W32' || period === '2026-W33';
    });

    console.log(`July updates count: ${julyUpdates.length}`);
    console.log(`August updates count: ${augustUpdates.length}`);
}

checkScores();
