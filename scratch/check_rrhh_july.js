import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    const kpis = ['rotacion-personal', 'ausentismo', 'he-rn-nomina', 'gasto-nomina-venta-rrhh'];
    
    for (const kpiId of kpis) {
        const { data: rows } = await supabase
            .from('kpi_updates')
            .select('kpi_id, company_id, additional_data, updated_at, value')
            .eq('kpi_id', kpiId)
            .gte('updated_at', '2026-07-01T00:00:00Z')
            .order('updated_at', { ascending: false })
            .limit(5);

        if (rows && rows.length > 0) {
            console.log(`\n${kpiId}:`);
            rows.forEach(r => {
                console.log(`  period: ${r.additional_data?.period} | brand: ${r.additional_data?.brand} | value: ${r.value} | at: ${r.updated_at.substring(0,16)}`);
            });
        }
    }
}
run();
