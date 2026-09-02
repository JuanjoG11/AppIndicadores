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

function toMonthKey(s) {
    if (!s) return null;
    s = String(s);
    if (/^\d{4}-\d{2}$/.test(s)) return s;
    if (/^\d{4}-\d{2}[-_]/.test(s)) return s.substring(0, 7);
    return s.substring(0, 7);
}

async function testBothMonths() {
    const { data } = await supabase
        .from('kpi_updates')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(2000);

    console.log(`Loaded ${data.length} records from Supabase`);

    // Group updates by period
    const julyUpdates = data.filter(u => {
        const p = u.additional_data?.period || '';
        return p === '2026-07' || p === '2026-W30' || p === '2026-07-Q2' || p === '2026-07-31';
    });

    const augustUpdates = data.filter(u => {
        const p = u.additional_data?.period || '';
        return p === '2026-08' || p === '2026-W32' || p === '2026-08-Q1' || p === '2026-08-05';
    });

    console.log(`July updates count: ${julyUpdates.length}`);
    console.log(`August updates count: ${augustUpdates.length}`);
}

testBothMonths();
