import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
    const { data, error } = await supabase.from('kpi_updates').select('*').limit(1);
    if (error) {
        console.error('ERROR:', error);
        return;
    }
    const row = data[0];
    console.log('--- KEYS ---');
    Object.keys(row).forEach(k => console.log(k));
    console.log('--- CONTENT ---');
    Object.keys(row).forEach(k => {
        console.log(`KEY: ${k}`);
        console.log(`VAL: ${JSON.stringify(row[k])}`);
    });
}
inspect();
