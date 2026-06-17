import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectTable() {
    const { data, error } = await supabase.from('kpi_updates')
        .select('id, kpi_id, updated_at, value, additional_data, company_id')
        .eq('kpi_id', 'pedidos-facturados')
        .order('updated_at', { ascending: false })
        .limit(20);
    if (error) {
        console.error('Error fetching sample:', error);
    } else if (data && data.length > 0) {
        data.forEach(row => {
          console.log(`ID: ${row.id} | Date: ${row.updated_at} | Company: ${row.company_id} | Value: ${row.value} | AD: ${JSON.stringify(row.additional_data)}`);
        });
    } else {
        console.log('No data');
    }
}
inspectTable();
