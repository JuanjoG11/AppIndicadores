const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectAndRemove() {
    console.log('🔍 Buscando registros de los días 04 y 05 en kpi_updates...\n');

    // 1. Buscar por periodo que contenga -04 o -05 de Agosto / Julio / etc.
    const { data: periodRecords, error: err1 } = await supabase
        .from('kpi_updates')
        .select('*')
        .or('period.eq.2026-08-04,period.eq.2026-08-05,period.eq.2026-07-04,period.eq.2026-07-05');

    if (err1) {
        console.error('Error buscando por periodo:', err1);
    } else {
        console.log(`📋 Encontrados por periodo (2026-08-04, 2026-08-05, 2026-07-04, 2026-07-05): ${periodRecords?.length || 0} registros`);
    }

    // 2. Buscar por updated_at en el rango de fechas 2026-08-04 T00:00:00Z a 2026-08-05 T23:59:59Z
    const { data: dateRecords, error: err2 } = await supabase
        .from('kpi_updates')
        .select('*')
        .gte('updated_at', '2026-08-04T00:00:00')
        .lte('updated_at', '2026-08-05T23:59:59');

    if (err2) {
        console.error('Error buscando por updated_at:', err2);
    } else {
        console.log(`📅 Encontrados por fecha updated_at (4 y 5 de Agosto 2026): ${dateRecords?.length || 0} registros`);
    }

    // 3. Imprimir resumen de lo encontrado
    const allMatching = Array.from(new Set([...(periodRecords || []), ...(dateRecords || [])]));
    console.log(`\n📊 TOTAL REGISTROS IDENTIFICADOS PARA EXONERACIÓN/ELIMINACIÓN: ${allMatching.length}`);

    if (allMatching.length > 0) {
        console.log('\nMuestra de registros a eliminar:');
        allMatching.slice(0, 10).forEach(r => {
            console.log(` - ID: ${r.id} | KPI: ${r.kpi_id} | Period: ${r.period} | Brand: ${r.brand} | Fecha: ${r.updated_at}`);
        });
    }
}

inspectAndRemove();
