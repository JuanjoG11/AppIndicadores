import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://ovjgsscbmkermglezrcj.supabase.co',
    'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp'
);

const SST_KPI_IDS = ['calificacion-auditoria', 'actividades-cultura', 'tiempo-contratacion'];

async function check() {
    const { data, error } = await supabase
        .from('kpi_updates')
        .select('id, kpi_id, company_id, additional_data, updated_at, cargo')
        .in('kpi_id', SST_KPI_IDS)
        .order('updated_at', { ascending: false });

    if (error) { console.error(error); return; }

    console.log(`Total registros SST: ${data.length}\n`);
    data.forEach(r => {
        console.log(`KPI: ${r.kpi_id} | Empresa: ${r.company_id} | Período: ${r.additional_data?.period} | Brand: ${r.additional_data?.brand} | Cargo: ${r.cargo} | Fecha: ${r.updated_at?.substring(0,19)}`);
    });
}
check();
