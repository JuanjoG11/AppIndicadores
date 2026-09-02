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

async function testFix() {
    // Fetch all updates from DB
    const { data } = await supabase
        .from('kpi_updates')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(2000);

    console.log(`Loaded ${data.length} records`);

    // Let's simulate the hook behavior with the fix:
    // If an update is for July (reportable period), update brandValues.
    // If an update is for August/other, DO NOT overwrite brandValues!

    const kpisMap = {};
    kpiDefinitions.forEach(def => {
        kpisMap[def.id] = {
            ...def,
            brandValues: {},
            history: []
        };
    });

    // Sort data chronologically so oldest first or newest first
    // Actually in hook, initial fetch processes array of updates
    data.forEach(upd => {
        const kpi = kpisMap[upd.kpi_id];
        if (!kpi) return;

        const period = upd.additional_data?.period || '';
        const brand = upd.additional_data?.brand || 'Global';
        const company = upd.additional_data?.company || upd.company_id || 'TYM';
        const dataKey = `${company}-${brand.toUpperCase()}`;

        const isJuly = period === '2026-07' || period === '2026-W30' || period === '2026-07-Q2' || period === '2026-07-31';

        if (isJuly) {
            kpi.brandValues[dataKey] = {
                currentValue: upd.value,
                hasData: true,
                compliance: 100, // simplify for test
                additionalData: upd.additional_data
            };
        }
    });

    // Check count of TYM KPIs with hasData: true for July
    let filledCount = 0;
    kpiDefinitions.forEach(def => {
        const kpi = kpisMap[def.id];
        const keys = Object.keys(kpi.brandValues).filter(k => k.startsWith('TYM-') && kpi.brandValues[k].hasData);
        if (keys.length > 0) filledCount++;
    });

    console.log(`TYM KPIs with July data: ${filledCount} / ${kpiDefinitions.length}`);
}

testFix();
