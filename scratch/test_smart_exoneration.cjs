const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSmartExoneration() {
    let allUpdates = [];
    let page = 0;
    while (true) {
        const { data, error } = await supabase
            .from('kpi_updates')
            .select('*')
            .range(page * 1000, (page + 1) * 1000 - 1);
        if (error || !data || data.length === 0) break;
        allUpdates = allUpdates.concat(data);
        if (data.length < 1000) break;
        page++;
    }

    console.log(`Total registros en Supabase: ${allUpdates.length}`);

    // Exonerar únicamente registros asignados a los periodos o cargas diarias del 04 y 05 de agosto,
    // preservando todos los registros de Julio (2026-07, 2026-07-31, 2026-W30, 2026-07-Q2, etc.)
    const isExoneratedUpdate = (u) => {
        if (!u) return false;
        const period = String(u.additional_data?.period || u.period || '');
        
        // Si el periodo asignado es explícitamente 04 u 05 de agosto
        if (period === '2026-08-04' || period === '2026-08-05') return true;

        return false;
    };

    const validUpdates = allUpdates.filter(u => !isExoneratedUpdate(u));
    const exonerated = allUpdates.filter(isExoneratedUpdate);

    console.log(`🚫 Registros exonerados (días de carga 04 y 05 de agosto): ${exonerated.length}`);
    console.log(`✅ Registros válidos conservados: ${validUpdates.length}`);

    // Verificar cuántos registros de Julio 2026 quedan presentes
    const julyRecords = validUpdates.filter(u => {
        const p = String(u.additional_data?.period || u.period || '');
        return p.includes('2026-07');
    });

    console.log(`📅 Total de registros conservados para Julio 2026: ${julyRecords.length}`);
}

testSmartExoneration();
