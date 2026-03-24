import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('--- KPI UPDATES COUNT ---');
    const { count, error } = await supabase
        .from('kpi_updates')
        .select('*', { count: 'exact', head: true });
    
    if (error) console.error('Error:', error);
    else console.log('Total records:', count);

    console.log('\n--- KPI UPDATES BY COMPANY ---');
    const { data: companies } = await supabase.from('kpi_updates').select('company_id');
    const counts = {};
    if (companies) {
        companies.forEach(c => {
            counts[c.company_id] = (counts[c.company_id] || 0) + 1;
        });
        console.log(JSON.stringify(counts, null, 2));
    } else {
        console.log('No companies found.');
    }

    console.log('\n--- SAMPLE LATEST UPDATES ---');
    const { data: latest } = await supabase.from('kpi_updates').select('*').order('updated_at', { ascending: false }).limit(5);
    if (latest) {
        latest.forEach(upd => {
            console.log(`- KPI: ${upd.kpi_id}, Company: ${upd.company_id}, Updated At: ${upd.updated_at}, Value: ${upd.value}`);
        });
    }
}

check();
