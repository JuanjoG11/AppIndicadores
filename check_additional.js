import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    const { data, error } = await supabase.from('kpi_updates').select('additional_data').limit(5);
    if (error) {
        console.error(error);
        return;
    }
    data.forEach((d, i) => {
        console.log(`Row ${i} additional_data:`, JSON.stringify(d.additional_data));
    });
}
check();
