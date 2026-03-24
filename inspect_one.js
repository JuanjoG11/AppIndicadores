import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectFirst() {
    const { data, error } = await supabase.from('kpi_updates').select('*').limit(1);
    if (error) {
        console.error('ERROR:', error);
    } else {
        console.log('ROW:', JSON.stringify(data[0]));
    }
}
inspectFirst();
