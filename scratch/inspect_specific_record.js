import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    const { data, error } = await supabase
        .from('kpi_updates')
        .select('*')
        .eq('id', 'da31e642-6db9-4ca6-8dc1-b59f71f3926b');

    if (error) {
        console.error(error);
        return;
    }

    console.log(JSON.stringify(data[0], null, 2));
}
run();
