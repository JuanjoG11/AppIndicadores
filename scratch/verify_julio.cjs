const { createClient } = require('@supabase/supabase-js');
const { kpiDefinitions } = require('../src/data/kpiData.js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const toMonthKey = (periodOrKey) => {
    if (!periodOrKey) return null;
    const s = String(periodOrKey);
    if (/^\d{4}-\d{2}$/.test(s)) return s;
    if (/^\d{4}-\d{2}[-_]/.test(s)) return s.substring(0, 7);
    const weekMatch = s.match(/^(\d{4})-W(\d{1,2})$/);
    if (weekMatch) {
        const year = parseInt(weekMatch[1]);
        const week = parseInt(weekMatch[2]);
        const simple = new Date(year, 0, 1 + (week - 1) * 7);
        const dow = simple.getDay();
        const isoStart = new Date(simple);
        if (dow <= 4) isoStart.setDate(simple.getDate() - simple.getDay() + 1);
        else isoStart.setDate(simple.getDate() + 8 - simple.getDay());
        isoStart.setDate(isoStart.getDate() + 3);
        return `${isoStart.getFullYear()}-${String(isoStart.getMonth() + 1).padStart(2, '0')}`;
    }
    if (s.length >= 7 && /^\d{4}-\d{2}/.test(s)) return s.substring(0, 7);
    return null;
};

async function verify() {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Same query as the app (Query 1: current month)
    const { data, error } = await supabase
        .from('kpi_updates')
        .select('*')
        .gte('updated_at', currentMonthStart)
        .order('updated_at', { ascending: false })
        .limit(1000);

    if (error) { console.error('Error:', error); return; }

    console.log(`📦 Query 1 trajo: ${data.length} registros`);

    // Filter July period records
    const julyRecords = data.filter(u => {
        const period = u.additional_data?.period;
        if (!period) return false;
        return toMonthKey(String(period)) === '2026-07';
    });

    console.log(`🎯 De esos, con period de JULIO: ${julyRecords.length}`);

    // Check unique KPIs
    const julyKPIs = new Set(julyRecords.map(r => r.kpi_id));
    console.log(`📊 KPIs únicos de julio en Query 1: ${julyKPIs.size} / ${kpiDefinitions.length}`);

    // Check which are missing
    const missing = kpiDefinitions.filter(k => !julyKPIs.has(k.id));
    if (missing.length > 0) {
        console.log(`\n❌ FALTAN ${missing.length} KPIs:`);
        missing.forEach(k => console.log(`  - ${k.id}`));
    } else {
        console.log(`\n✅ ¡TODOS los 66 KPIs tienen datos de JULIO en Query 1!`);
    }

    // Check company coverage
    const tymJuly = julyRecords.filter(r => (r.additional_data?.company || r.company_id) === 'TYM');
    const tatJuly = julyRecords.filter(r => (r.additional_data?.company || r.company_id) === 'TAT');
    console.log(`\n🏢 TYM: ${tymJuly.length} registros de julio`);
    console.log(`🏢 TAT: ${tatJuly.length} registros de julio`);

    // Show period breakdown
    const periodCounts = {};
    julyRecords.forEach(r => {
        const p = r.additional_data?.period || 'unknown';
        periodCounts[p] = (periodCounts[p] || 0) + 1;
    });
    console.log('\n📋 Períodos de julio:');
    Object.entries(periodCounts).sort().forEach(([p, c]) => {
        console.log(`  ${p}: ${c} registros`);
    });
}

verify().catch(console.error);
