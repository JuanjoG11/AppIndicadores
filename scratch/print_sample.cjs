const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function printSample() {
    const { data: updates } = await supabase
        .from('kpi_updates')
        .select('*')
        .limit(5);

    console.log(JSON.stringify(updates, null, 2));
}

printSample();
