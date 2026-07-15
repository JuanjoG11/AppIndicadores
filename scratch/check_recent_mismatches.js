import { createClient } from '@supabase/supabase-js';
import { kpiDefinitions } from '../src/data/kpiData.js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    const { data: rows } = await supabase.from('kpi_updates').select('*');
    if (!rows) return;

    let recentMismatches = [];

    rows.forEach(r => {
        const period = r.additional_data?.period;
        const kpiDef = kpiDefinitions.find(k => k.id === r.kpi_id);
        if (!period || !kpiDef) return;

        const date = new Date(r.updated_at);
        const isRecent = date >= new Date('2026-06-01T00:00:00Z');
        if (!isRecent) return;

        const freq = (kpiDef.frecuencia || 'MENSUAL').toUpperCase();
        let isMismatch = false;
        let expected = '';

        if (freq.includes('DIARI')) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(period)) { isMismatch = true; expected = 'YYYY-MM-DD'; }
        } else if (freq.includes('SEMANAL')) {
            if (!/^\d{4}-W\d{2}$/.test(period)) { isMismatch = true; expected = 'YYYY-Www'; }
        } else if (freq.includes('QUINCENAL')) {
            if (!/^\d{4}-\d{2}-Q[12]$/.test(period)) { isMismatch = true; expected = 'YYYY-MM-Q1/Q2'; }
        } else {
            if (!/^\d{4}-\d{2}$/.test(period)) { isMismatch = true; expected = 'YYYY-MM'; }
        }

        if (isMismatch) {
            recentMismatches.push({ row: r, freq, expected });
        }
    });

    console.log(`Recent mismatches (June/July 2026): ${recentMismatches.length}`);
    recentMismatches.forEach(m => {
        console.log(`- KPI: ${m.row.kpi_id} | Freq: ${m.freq} | Got: ${m.row.additional_data?.period} | Expected: ${m.expected} | Company: ${m.row.company_id} | Brand: ${m.row.additional_data?.brand} | UpdatedAt: ${m.row.updated_at}`);
    });
}
run();
