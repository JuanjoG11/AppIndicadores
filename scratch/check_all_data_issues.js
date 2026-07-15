import { createClient } from '@supabase/supabase-js';
import { kpiDefinitions } from '../src/data/kpiData.js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    console.log('Fetching all records from supabase...');
    const { data: rows, error } = await supabase
        .from('kpi_updates')
        .select('*');

    if (error) {
        console.error('Error fetching records:', error);
        return;
    }

    console.log(`Fetched ${rows.length} records.`);
    
    let undefinedPeriods = [];
    let nullCompany = [];
    let formatMismatches = [];
    let noKpiDef = [];

    rows.forEach(r => {
        const period = r.additional_data?.period;
        const company = r.company_id || r.additional_data?.company;
        const kpiDef = kpiDefinitions.find(k => k.id === r.kpi_id);
        
        if (!r.company_id) {
            nullCompany.push(r);
        }

        if (!period || period === 'undefined') {
            undefinedPeriods.push(r);
            return;
        }

        if (!kpiDef) {
            noKpiDef.push(r);
            return;
        }

        const freq = (kpiDef.frecuencia || 'MENSUAL').toUpperCase();
        // Check formats
        if (freq.includes('DIARI')) {
            // Should be YYYY-MM-DD (length 10)
            if (!/^\d{4}-\d{2}-\d{2}$/.test(period)) {
                formatMismatches.push({ row: r, freq, expected: 'YYYY-MM-DD' });
            }
        } else if (freq.includes('SEMANAL')) {
            // Should be YYYY-Www (length 8)
            if (!/^\d{4}-W\d{2}$/.test(period)) {
                formatMismatches.push({ row: r, freq, expected: 'YYYY-Www' });
            }
        } else if (freq.includes('QUINCENAL')) {
            // Should be YYYY-MM-Q1 or YYYY-MM-Q2 (length 10)
            if (!/^\d{4}-\d{2}-Q[12]$/.test(period)) {
                formatMismatches.push({ row: r, freq, expected: 'YYYY-MM-Q1/Q2' });
            }
        } else {
            // Monthly, etc. Should be YYYY-MM (length 7)
            if (!/^\d{4}-\d{2}$/.test(period)) {
                formatMismatches.push({ row: r, freq, expected: 'YYYY-MM' });
            }
        }
    });

    console.log(`\n=== RESULTS ===`);
    console.log(`Records with null company_id column: ${nullCompany.length}`);
    if (nullCompany.length > 0) {
        console.log('Sample null companies:', nullCompany.slice(0, 5).map(r => r.id));
    }

    console.log(`\nRecords with undefined/missing period: ${undefinedPeriods.length}`);
    if (undefinedPeriods.length > 0) {
        undefinedPeriods.forEach(r => {
            console.log(`- ID: ${r.id} | KPI: ${r.kpi_id} | Brand: ${r.additional_data?.brand} | UpdatedAt: ${r.updated_at}`);
        });
    }

    console.log(`\nRecords with no KPI definition in code: ${noKpiDef.length}`);
    if (noKpiDef.length > 0) {
        const uniqueKpis = [...new Set(noKpiDef.map(r => r.kpi_id))];
        console.log('Unknown KPI IDs:', uniqueKpis);
    }

    console.log(`\nPeriod format mismatches: ${formatMismatches.length}`);
    if (formatMismatches.length > 0) {
        console.log('Sample mismatches (first 15):');
        formatMismatches.slice(0, 15).forEach(m => {
            console.log(`- KPI: ${m.row.kpi_id} | Freq: ${m.freq} | Got: ${m.row.additional_data?.period} | Expected: ${m.expected} | Brand: ${m.row.additional_data?.brand} | UpdatedAt: ${m.row.updated_at}`);
        });
    }
}
run();
