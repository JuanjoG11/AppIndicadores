const { createClient } = require('@supabase/supabase-js');
const { kpiDefinitions } = require('../src/data/kpiData.js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BRAND_TO_ENTITY = {
    'ALPINA': 'TYM',
    'ZENU': 'TYM',
    'FLEISCHMANN': 'TYM',
    'UNILEVER': 'TAT',
    'FAMILIA': 'TAT',
    'TYM': 'TYM',
    'TAT': 'TAT'
};

async function testFetchAndFilter() {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString();

    const { data: currentMonthData } = await supabase
        .from('kpi_updates')
        .select('*')
        .gte('updated_at', currentMonthStart)
        .order('updated_at', { ascending: false })
        .limit(1000);

    const { data: historicalData } = await supabase
        .from('kpi_updates')
        .select('*')
        .gte('updated_at', twelveMonthsAgo)
        .lt('updated_at', currentMonthStart)
        .order('updated_at', { ascending: false })
        .limit(1000);

    const data = [...(currentMonthData || []), ...(historicalData || [])];
    console.log(`Loaded ${data.length} total updates from Supabase`);

    // Sample updates by kpi
    const tymJulyUpdates = data.filter(u => u.company_id === 'TYM');
    console.log(`TYM updates total: ${tymJulyUpdates.length}`);

    // Print periods of TYM updates
    const periods = {};
    tymJulyUpdates.forEach(u => {
        const p = u.additional_data?.period || 'NO_PERIOD';
        periods[p] = (periods[p] || 0) + 1;
    });
    console.log('TYM updates by period:', periods);
}

testFetchAndFilter();
