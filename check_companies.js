import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    const { data, error } = await supabase.from('kpi_updates').select('company_id');
    if (error) {
        console.error(error);
        return;
    }
    const counts = {};
    data.forEach(d => {
        counts[d.company_id] = (counts[d.company_id] || 0) + 1;
    });
    console.log('--- Company ID Distribution ---');
    console.log(JSON.stringify(counts, null, 2));
}
check();
