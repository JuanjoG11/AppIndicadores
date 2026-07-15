import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    const { data, error } = await supabase
        .from('kpi_updates')
        .select('*')
        .eq('kpi_id', 'participacion-venta-credito')
        .order('updated_at', { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Total updates for participacion-venta-credito: ${data.length}`);
    data.forEach(upd => {
        console.log(`ID: ${upd.id} | Company: ${upd.company_id} | Brand: ${upd.additional_data?.brand} | Period: ${upd.additional_data?.period} | Type: ${upd.additional_data?.type} | Freq: ${upd.additional_data?.newFrecuencia} | Meta: ${upd.additional_data?.newMeta}`);
    });
}
run();
