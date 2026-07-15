import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    const { data, error } = await supabase
        .from('kpi_updates')
        .select('*')
        .eq('additional_data->>type', 'META_UPDATE')
        .order('updated_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Top 20 recent META_UPDATEs:`);
    data.forEach(upd => {
        console.log(`ID: ${upd.id} | KPI: ${upd.kpi_id} | Company: ${upd.company_id} | Brand: ${upd.additional_data?.brand} | Period: ${upd.additional_data?.period} | Freq: ${upd.additional_data?.newFrecuencia} | Meta: ${upd.additional_data?.newMeta} | UpdatedAt: ${upd.updated_at}`);
    });
}
run();
