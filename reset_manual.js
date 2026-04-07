import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function resetData() {
    console.log('Iniciando reseteo manual de datos...');
    const { data, error } = await supabase
        .from('kpi_updates')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (error) {
        console.error('Error al resetear datos:', error);
        process.exit(1);
    } else {
        console.log('✅ Base de datos reseteada con éxito. El facturador ya puede llenar los datos de hoy.');
        process.exit(0);
    }
}

resetData();
