import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectTable() {
    const { data, error } = await supabase.from('kpi_updates').select('*').limit(1);
    if (error) {
        console.error('Error fetching sample:', error);
    } else if (data && data.length > 0) {
        const row = data[0];
        const keys = Object.keys(row);
        console.log('KEYS:' + keys.join(','));
        keys.forEach(k => {
          console.log(k + ':' + row[k]);
        });
    } else {
        console.log('No data');
    }
}
inspectTable();
