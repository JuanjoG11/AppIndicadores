import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    const { data, error } = await supabase
        .from('kpi_updates')
        .select('*')
        .eq('kpi_id', 'participacion-venta-credito')
        .eq('additional_data->>type', 'META_UPDATE')
        .order('updated_at', { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Total META_UPDATEs for participacion-venta-credito: ${data.length}`);
    data.forEach(upd => {
        console.log(`ID: ${upd.id} | Period: ${upd.additional_data?.period} | Freq: ${upd.additional_data?.newFrecuencia} | Meta: ${upd.additional_data?.newMeta} | UpdatedAt: ${upd.updated_at}`);
    });
}
run();
