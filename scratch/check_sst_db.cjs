const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRecentSST() {
    const sstKPIs = ['calificacion-auditoria', 'actividades-cultura', 'tiempo-contratacion', 'cumplimiento-sst', 'cobertura-vacantes'];
    const { data: updates, error } = await supabase
        .from('kpi_updates')
        .select('*')
        .in('kpi_id', sstKPIs)
        .order('updated_at', { ascending: false })
        .limit(25);

    if (error) {
        console.error('Error fetching:', error);
        return;
    }

    console.log(`Top 25 recent SST updates:`);
    updates.forEach(u => {
        console.log(`KPI: ${u.kpi_id} | Co: ${u.company_id} | Brand: ${u.additional_data?.brand} | Period: ${u.additional_data?.period} | Val: ${u.value} | Created: ${u.created_at || u.updated_at}`);
    });
}

checkRecentSST();
