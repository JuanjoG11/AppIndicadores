const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectTableStructure() {
    const { data, error } = await supabase
        .from('kpi_updates')
        .select('*')
        .limit(3);

    if (error) {
        console.error(error);
        return;
    }

    console.log('Fila de muestra en kpi_updates:');
    console.log(JSON.stringify(data[0], null, 2));
}

inspectTableStructure();
