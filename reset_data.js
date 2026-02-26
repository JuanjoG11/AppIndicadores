
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function resetData() {
    console.log('Iniciando reseteo de datos...');
    const { data, error } = await supabase
        .from('kpi_updates')
        .delete()
        .neq('id', 0); // Delete all rows where id is not 0 (effectively all)

    if (error) {
        console.error('Error al resetear datos:', error);
        process.exit(1);
    } else {
        console.log('✅ Todos los indicadores han sido reseteados a 0.');
        process.exit(0);
    }
}

resetData();
