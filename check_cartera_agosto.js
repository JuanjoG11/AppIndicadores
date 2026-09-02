import { createClient } from '@supabase/supabase-js';

const sb = createClient(
    process.env.VITE_SUPABASE_URL || 'https://ovjgsscbmkermglezrcj.supabase.co',
    process.env.SUPABASE_SERVICE_KEY || ''
);

const kpisCartera = ['cartera-no-vencida','cartera-mayor-30','recircularizaciones','valor-cartera-venta'];

// Total registros de cartera
const { data: all } = await sb.from('kpi_updates').select('id, kpi_id, additional_data, updated_at').in('kpi_id', kpisCartera).order('updated_at', { ascending: false }).limit(20);

console.log(`\nÚltimos 20 registros de cartera:`);
all?.forEach(r => {
    const period = r.additional_data?.period || '(sin period)';
    const brand  = r.additional_data?.brand  || 'Global';
    console.log(`  ${r.kpi_id.padEnd(22)} | period:${period} | brand:${brand} | ${r.updated_at?.substring(0,19)}`);
});

// Contar por periodo
const { data: all2 } = await sb.from('kpi_updates').select('additional_data').in('kpi_id', kpisCartera);
const counts = {};
all2?.forEach(r => {
    const p = r.additional_data?.period || '(sin period)';
    counts[p] = (counts[p] || 0) + 1;
});
console.log('\nConteo por periodo:');
Object.entries(counts).sort().forEach(([p, c]) => console.log(`  ${p}: ${c} registros`));
