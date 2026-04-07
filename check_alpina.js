import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkFacturador() {
    console.log('--- Checking Alpina Facturador records ---');
    const { data: alpinaData, error } = await supabase
        .from('kpi_updates')
        .select('*')
        .or('company_id.eq.ALPINA,company_id.eq.TYM,company_id.eq.TAT'); // Facturador might be under TYM or TAT too
    
    if (error) {
        console.error('Error:', error);
        return;
    }

    if (alpinaData && alpinaData.length > 0) {
        alpinaData.forEach(d => {
            console.log(`ID: ${d.id}, KPI: ${d.kpi_id}, Company: ${d.company_id}, Date: ${d.updated_at}, Value: ${d.value}`);
        });
    } else {
        console.log('No relevant data found.');
    }
}
checkFacturador();
