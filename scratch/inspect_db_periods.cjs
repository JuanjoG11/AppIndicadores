const { createClient } = require('@supabase/supabase-js');
const { kpiDefinitions } = require('../src/data/kpiData.js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectHistory() {
    const { data: updates, error } = await supabase
        .from('kpi_updates')
        .select('*')
        .order('updated_at', { ascending: true });

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Loaded ${updates.length} updates from Supabase`);

    // Let's check periods present
    const periods = new Set();
    updates.forEach(u => {
        if (u.additional_data?.period) periods.add(u.additional_data.period);
    });

    console.log('Unique periods in DB:', Array.from(periods));
}

inspectHistory();
