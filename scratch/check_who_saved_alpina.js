import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    const { data: rows } = await supabase
        .from('kpi_updates')
        .select('*')
        .in('kpi_id', ['pedidos-facturados', 'impresion-facturas', 'error-facturacion'])
        .gte('updated_at', '2026-07-09T00:00:00Z')
        .lte('updated_at', '2026-07-09T06:00:00Z')
        .order('updated_at', { ascending: true });

    if (!rows || rows.length === 0) {
        console.log('No records found in that time window');
        return;
    }

    console.log(`Records saved 2026-07-09 between 00:00-06:00:\n`);
    rows.forEach(r => {
        console.log(`kpi: ${r.kpi_id}`);
        console.log(`  cargo: ${r.cargo}`);
        console.log(`  brand: ${r.additional_data?.brand}`);
        console.log(`  company: ${r.additional_data?.company || r.company_id}`);
        console.log(`  period: ${r.additional_data?.period}`);
        console.log(`  value: ${r.value}`);
        console.log(`  at: ${r.updated_at}`);
        console.log('');
    });
}
run();
