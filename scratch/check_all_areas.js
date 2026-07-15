import { createClient } from '@supabase/supabase-js';
import { kpiDefinitions } from '../src/data/kpiData.js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const toMonthKey = (period) => {
    if (!period) return null;
    if (/^\d{4}-\d{2}$/.test(period)) return period;
    if (/^\d{4}-\d{2}-/.test(period)) return period.substring(0, 7);
    const wm = period.match(/^(\d{4})-W(\d{1,2})$/);
    if (wm) {
        const y = parseInt(wm[1]), w = parseInt(wm[2]);
        const d = new Date(Date.UTC(y, 0, 1 + (w-1)*7));
        const dow = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dow);
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;
    }
    return null;
};

async function run() {
    const { data: rows } = await supabase
        .from('kpi_updates')
        .select('kpi_id, company_id, additional_data, updated_at, value, cargo')
        .gte('updated_at', '2026-06-01T00:00:00Z')
        .neq('additional_data->>type', 'META_UPDATE')
        .order('updated_at', { ascending: false });

    if (!rows) { console.log('No data'); return; }

    const now = new Date();
    const prevMonth = `${now.getFullYear()}-${String(now.getMonth()).padStart(2,'0')}`; // mes anterior
    const todayKey = now.toISOString().split('T')[0];

    // Group by kpi+company+brand, keep latest
    const latest = {};
    rows.forEach(r => {
        const brand = r.additional_data?.brand || 'Global';
        const company = r.additional_data?.company || r.company_id || 'TYM';
        const key = `${r.kpi_id}|${company}|${brand}`;
        if (!latest[key]) latest[key] = r;
    });

    const issues = [];
    Object.entries(latest).forEach(([key, r]) => {
        const [kpiId, company, brand] = key.split('|');
        const kpiDef = kpiDefinitions.find(k => k.id === kpiId);
        if (!kpiDef) return;
        const freq = (kpiDef.frecuencia || 'MENSUAL').toUpperCase();
        const period = r.additional_data?.period || '';
        const monthKey = toMonthKey(period);

        let expectedMonth = prevMonth;
        // Para DIARIO el esperado es hoy
        if (freq.includes('DIARI')) {
            if (period !== todayKey) {
                issues.push({ type: 'DIARIO_NOT_TODAY', kpiId, company, brand, period, freq });
            }
            return;
        }

        // Para todos los demás: esperamos que el mes sea el anterior
        if (monthKey && monthKey > prevMonth) {
            issues.push({ type: 'FUTURE_MONTH', kpiId, company, brand, period, monthKey, expectedMonth: prevMonth, freq });
        } else if (monthKey && monthKey < prevMonth) {
            issues.push({ type: 'OLD_DATA', kpiId, company, brand, period, monthKey, expectedMonth: prevMonth, freq });
        }
    });

    console.log(`\n=== ISSUES FOUND: ${issues.length} ===\n`);
    
    const futures = issues.filter(i => i.type === 'FUTURE_MONTH');
    const old = issues.filter(i => i.type === 'OLD_DATA');
    const notToday = issues.filter(i => i.type === 'DIARIO_NOT_TODAY');

    if (futures.length) {
        console.log(`FUTURE MONTH (datos de julio que se mostrarán en agosto): ${futures.length}`);
        futures.forEach(i => console.log(`  ❌ ${i.kpiId} | ${i.company} | ${i.brand} | ${i.period} (${i.freq})`));
    }
    if (old.length) {
        console.log(`\nOLD DATA (datos de meses anteriores a junio - SIN CARGAR EN JUNIO): ${old.length}`);
        old.forEach(i => console.log(`  ⚠️  ${i.kpiId} | ${i.company} | ${i.brand} | last: ${i.period} (${i.freq})`));
    }
    if (notToday.length) {
        console.log(`\nDIARIO NOT TODAY (cargaron ayer o antes): ${notToday.length}`);
        notToday.forEach(i => console.log(`  📅 ${i.kpiId} | ${i.company} | ${i.brand} | ${i.period}`));
    }

    if (issues.length === 0) {
        console.log('✅ No issues found - all data is in the correct period');
    }
}
run();
