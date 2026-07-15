import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    const facturacionKpis = ['pedidos-facturados', 'impresion-facturas', 'error-facturacion'];
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    console.log(`Today: ${today}\n`);

    for (const kpiId of facturacionKpis) {
        const { data: rows } = await supabase
            .from('kpi_updates')
            .select('*')
            .eq('kpi_id', kpiId)
            .order('updated_at', { ascending: false })
            .limit(5);

        if (!rows || rows.length === 0) {
            console.log(`${kpiId}: NO RECORDS`);
            continue;
        }

        const alpina = rows.filter(r => 
            r.additional_data?.brand?.toUpperCase() === 'ALPINA' &&
            r.additional_data?.type !== 'META_UPDATE'
        );

        console.log(`\n${kpiId} - ALPINA (last 3):`);
        alpina.slice(0, 3).forEach(r => {
            const period = r.additional_data?.period || '';
            const isToday = period === today;
            console.log(`  ${isToday ? '✅ TODAY' : '❌ NOT TODAY'} period=${period} | value=${r.value} | at=${r.updated_at.substring(0, 16)}`);
        });
    }
}
run();
