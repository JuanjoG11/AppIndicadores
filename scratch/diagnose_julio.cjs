const { createClient } = require('@supabase/supabase-js');
const { kpiDefinitions } = require('../src/data/kpiData.js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Replicate the app's period logic
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

async function diagnose() {
    console.log('=== DIAGNÓSTICO DE DATOS JULIO 2026 ===\n');
    
    // 1. Check what the app queries
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString();
    
    console.log('📅 Fecha actual:', now.toISOString());
    console.log('📅 currentMonthStart (query 1 >=):', currentMonthStart);
    console.log('📅 twelveMonthsAgo (query 2 >=):', twelveMonthsAgo);
    console.log('');

    // 2. Query 1: current month data (same as app)
    const { data: currentMonthData, error: err1 } = await supabase
        .from('kpi_updates')
        .select('*')
        .gte('updated_at', currentMonthStart)
        .order('updated_at', { ascending: false })
        .limit(1000);

    console.log(`📦 Query 1 (mes actual >= ${currentMonthStart}): ${currentMonthData?.length ?? 0} registros`);
    if (err1) console.error('ERROR Query 1:', err1);

    // 3. Query 2: historical data (same as app)
    const { data: historicalData, error: err2 } = await supabase
        .from('kpi_updates')
        .select('*')
        .gte('updated_at', twelveMonthsAgo)
        .lt('updated_at', currentMonthStart)
        .order('updated_at', { ascending: false })
        .limit(1000);

    console.log(`📦 Query 2 (histórico < ${currentMonthStart}): ${historicalData?.length ?? 0} registros`);
    if (err2) console.error('ERROR Query 2:', err2);

    const allData = [...(currentMonthData || []), ...(historicalData || [])];
    console.log(`📦 Total combinado: ${allData.length} registros\n`);

    // 4. Filter for July periods specifically
    const julyRecords = allData.filter(u => {
        const period = u.additional_data?.period;
        if (!period) return false;
        const monthKey = toMonthKey(String(period));
        return monthKey === '2026-07';
    });

    console.log(`🎯 Registros con period de Julio (2026-07): ${julyRecords.length}`);

    // 5. Check unique KPIs with July data
    const julyKPIs = new Set(julyRecords.map(r => r.kpi_id));
    console.log(`🎯 KPIs únicos con datos de Julio: ${julyKPIs.size} de ${kpiDefinitions.length} totales`);
    
    // 6. Show sample of July records
    console.log('\n--- Muestra de registros de Julio ---');
    julyRecords.slice(0, 5).forEach(r => {
        console.log(`  KPI: ${r.kpi_id}, period: ${r.additional_data?.period}, company: ${r.additional_data?.company || r.company_id}, brand: ${r.additional_data?.brand}, value: ${r.value}, updated_at: ${r.updated_at}`);
    });

    // 7. Check records that DON'T have a period
    const noPeriodRecords = allData.filter(u => !u.additional_data?.period);
    console.log(`\n⚠️ Registros SIN period en additional_data: ${noPeriodRecords.length}`);
    
    // 8. Check all unique periods
    const allPeriods = new Set();
    allData.forEach(u => {
        if (u.additional_data?.period) allPeriods.add(u.additional_data.period);
    });
    console.log('\n📋 Todos los periodos únicos en los datos:');
    [...allPeriods].sort().forEach(p => {
        const count = allData.filter(u => u.additional_data?.period === p).length;
        const monthKey = toMonthKey(p);
        console.log(`  ${p} → monthKey=${monthKey} (${count} registros)`);
    });

    // 9. Check which KPIs are MISSING July data
    const missingJulyKPIs = kpiDefinitions.filter(k => !julyKPIs.has(k.id));
    if (missingJulyKPIs.length > 0) {
        console.log(`\n❌ KPIs SIN datos de Julio (${missingJulyKPIs.length}):`);
        missingJulyKPIs.forEach(k => console.log(`  - ${k.id} (${k.name}, freq: ${k.frecuencia})`));
    }

    // 10. Check the updated_at timestamps of July records
    if (julyRecords.length > 0) {
        const timestamps = julyRecords.map(r => new Date(r.updated_at));
        const minTime = new Date(Math.min(...timestamps));
        const maxTime = new Date(Math.max(...timestamps));
        console.log(`\n⏰ Rango de updated_at para datos de Julio:`);
        console.log(`  Min: ${minTime.toISOString()}`);
        console.log(`  Max: ${maxTime.toISOString()}`);
        console.log(`  ¿Caen en Query 1 (mes actual)? ${minTime >= new Date(currentMonthStart) ? 'SÍ' : 'NO'}`);
    }

    // 11. Simulate the app's isFromCurrentPeriod logic for each frequency
    console.log('\n=== SIMULACIÓN DE isFromCurrentPeriod ===');
    const frequencies = ['MENSUAL', 'SEMANAL', 'QUINCENAL', 'DIARIO', 'BIMESTRAL'];
    frequencies.forEach(freq => {
        const reportable = getReportablePeriod(freq);
        const reportableMonthKey = toMonthKey(reportable) || reportable;
        console.log(`\n  ${freq}:`);
        console.log(`    Reportable period: ${reportable}`);
        console.log(`    Reportable monthKey: ${reportableMonthKey}`);
        
        // Check which July records match
        const freqKPIs = kpiDefinitions.filter(k => (k.frecuencia || 'MENSUAL').toUpperCase().includes(freq === 'DIARIO' ? 'DIARI' : freq));
        console.log(`    KPIs con esta frecuencia: ${freqKPIs.length}`);
    });
}

// Replicate getReportablePeriod
function getPeriodIndex(date, frequency) {
    const freq = frequency.toUpperCase();
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const monthStr = month.toString().padStart(2, '0');

    if (freq.includes('DIARI')) {
        return `${year}-${monthStr}-${String(day).padStart(2, '0')}`;
    }
    if (freq.includes('SEMANAL')) {
        // ISO week calculation
        const jan4 = new Date(year, 0, 4);
        const dayOfYear = Math.floor((d - new Date(year, 0, 1)) / 86400000) + 1;
        const weekNum = Math.ceil((dayOfYear + jan4.getDay() - 1) / 7);
        return `${year}-W${String(weekNum).padStart(2, '0')}`;
    }
    if (freq.includes('QUINCENAL')) {
        const fortnight = day <= 15 ? 'Q1' : 'Q2';
        return `${year}-${monthStr}-${fortnight}`;
    }
    return `${year}-${monthStr}`;
}

function getReportablePeriod(frequency) {
    const now = new Date();
    const freq = (frequency || 'MENSUAL').toUpperCase();
    if (freq.includes('DIARI')) {
        return getPeriodIndex(now, frequency);
    }
    if (freq.includes('SEMANAL')) {
        const prev = new Date(now);
        prev.setDate(now.getDate() - 7);
        return getPeriodIndex(prev, frequency);
    }
    if (freq.includes('QUINCENAL')) {
        const day = now.getDate();
        if (day <= 15) {
            const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 20);
            return getPeriodIndex(prevMonth, frequency);
        } else {
            const q1 = new Date(now.getFullYear(), now.getMonth(), 1);
            return getPeriodIndex(q1, frequency);
        }
    }
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return getPeriodIndex(prev, frequency);
}

diagnose().catch(console.error);
