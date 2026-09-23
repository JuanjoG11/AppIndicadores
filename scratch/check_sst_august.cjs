const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSSTAugust() {
    const { data: sstAugust, error } = await supabase
        .from('kpi_updates')
        .select('*')
        .in('kpi_id', ['calificacion-auditoria', 'actividades-cultura', 'tiempo-contratacion']);

    const august = sstAugust.filter(r => (r.additional_data?.period || '').startsWith('2026-08'));
    console.log(`Found ${august.length} August records for SST:`);
    august.forEach(r => {
        console.log(`ID: ${r.id} | ${r.kpi_id} | ${r.company_id} | Period: ${r.additional_data?.period} | Val: ${r.value} | Created/Updated: ${r.updated_at}`);
    });
}

checkSSTAugust();
