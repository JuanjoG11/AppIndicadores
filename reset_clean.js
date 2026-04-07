import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function clean() {
    console.log('Limpiando registros...');
    const { data: all } = await supabase.from('kpi_updates').select('id');
    if (!all || all.length === 0) {
        console.log('No hay nada que limpiar.');
        return;
    }

    console.log(`Encontrados ${all.length} registros. Borrando...`);
    for (const item of all) {
        await supabase.from('kpi_updates').delete().eq('id', item.id);
    }
    console.log('✅ Base de datos limpia.');
}
clean();
