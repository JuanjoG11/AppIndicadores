import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('--- KPI UPDATES IN JUNE 2026 ---');
    const { data, error } = await supabase
        .from('kpi_updates')
        .select('*')
        .gte('updated_at', '2026-06-01T00:00:00Z')
        .order('updated_at', { ascending: false });
    
    if (error) {
        console.error(error);
        return;
    }
    
    console.log(`Found ${data.length} records in June 2026:`);
    data.forEach(upd => {
        console.log(`- ID: ${upd.id}, KPI: ${upd.kpi_id}, Brand: ${upd.additional_data?.brand}, Company: ${upd.company_id}, Updated: ${upd.updated_at}, Period in additional_data: ${upd.additional_data?.period}, Value: ${upd.value}`);
    });
}

check();
