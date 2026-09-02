const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function remove04And05Periods() {
    console.log('🔍 Buscando registros cuyo period sea exactamente 2026-08-04 o 2026-08-05...\n');

    // Cargar todos los registros para examinar additional_data.period
    let allUpdates = [];
    let page = 0;
    const pageSize = 1000;
    
    while (true) {
        const { data, error } = await supabase
            .from('kpi_updates')
            .select('*')
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error || !data || data.length === 0) break;
        allUpdates = allUpdates.concat(data);
        if (data.length < pageSize) break;
        page++;
    }

    const idsToDelete = allUpdates
        .filter(u => {
            const p = u.additional_data?.period;
            return p === '2026-08-04' || p === '2026-08-05';
        })
        .map(u => u.id);

    console.log(`📦 Encontrados ${idsToDelete.length} registros con periodo '2026-08-04' o '2026-08-05'.`);

    if (idsToDelete.length === 0) {
        console.log(' No hay registros para eliminar.');
        return;
    }

    console.log(`🗑️ Procediendo a eliminar ${idsToDelete.length} registros en bloques de 100...`);

    let deletedCount = 0;
    for (let i = 0; i < idsToDelete.length; i += 100) {
        const chunk = idsToDelete.slice(i, i + 100);
        const { error } = await supabase
            .from('kpi_updates')
            .delete()
            .in('id', chunk);

        if (error) {
            console.error(`Error eliminando bloque ${i}:`, error);
        } else {
            deletedCount += chunk.length;
        }
    }

    console.log(`\n Total de registros eliminados exitosamente: ${deletedCount}/${idsToDelete.length}`);
}

remove04And05Periods();
