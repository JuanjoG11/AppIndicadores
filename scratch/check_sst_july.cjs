const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSSTJuly() {
    const { data: sst, error } = await supabase
        .from('kpi_updates')
        .select('*')
        .in('kpi_id', ['calificacion-auditoria', 'actividades-cultura', 'tiempo-contratacion']);

    const july = sst.filter(r => (r.additional_data?.period || '').startsWith('2026-07'));
    console.log(`July records for SST: ${july.length}`);
}

checkSSTJuly();
