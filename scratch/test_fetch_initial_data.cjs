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

async function testFetch() {
    try {
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString();

        console.log("Fetching Query 1...");
        const { data: currentMonthData, error: e1 } = await supabase
            .from('kpi_updates')
            .select('*')
            .gte('updated_at', currentMonthStart)
            .order('updated_at', { ascending: false })
            .limit(1000);

        if (e1) console.error("Query 1 error:", e1);
        console.log(`Query 1 returned ${currentMonthData?.length || 0} rows`);

        console.log("Fetching Query 2...");
        const { data: historicalData, error: e2 } = await supabase
            .from('kpi_updates')
            .select('*')
            .gte('updated_at', twelveMonthsAgo)
            .lt('updated_at', currentMonthStart)
            .order('updated_at', { ascending: false })
            .limit(1000);

        if (e2) console.error("Query 2 error:", e2);
        console.log(`Query 2 returned ${historicalData?.length || 0} rows`);

        const data = [...(currentMonthData || []), ...(historicalData || [])];
        console.log(`Total data loaded: ${data.length} rows`);
    } catch (err) {
        console.error("Test error:", err);
    }
}

testFetch();
