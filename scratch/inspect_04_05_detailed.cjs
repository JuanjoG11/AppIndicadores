const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function detailedCheck() {
    // Traer todos los kpi_updates (son aprox 1000-2000)
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

    console.log(`Total registros cargados de Supabase: ${allUpdates.length}`);

    // Agrupar por periodo en additional_data y por fecha updated_at
    const periodsCount = {};
    const august4and5Updates = [];

    allUpdates.forEach(u => {
        const p = u.additional_data?.period || 'SIN_PERIODO';
        periodsCount[p] = (periodsCount[p] || 0) + 1;

        const dateStr = u.updated_at ? u.updated_at.substring(0, 10) : '';
        const addDate = String(u.additional_data?.period || u.additional_data?.updatedAt || '');

        if (
            p === '2026-08-04' || p === '2026-08-05' ||
            p === '2026-07-04' || p === '2026-07-05' ||
            dateStr === '2026-08-04' || dateStr === '2026-08-05' ||
            addDate.includes('2026-08-04') || addDate.includes('2026-08-05')
        ) {
            august4and5Updates.push(u);
        }
    });

    console.log('\nPeriodos encontrados y su conteo:');
    console.log(periodsCount);

    console.log(`\nRegistros asociados a los días 04 y 05 (agosto/julio): ${august4and5Updates.length}`);
    if (august4and5Updates.length > 0) {
        console.log('\nDesglose de los registros encontrados del 04 y 05:');
        august4and5Updates.slice(0, 20).forEach(u => {
            console.log(`ID: ${u.id} | KPI: ${u.kpi_id} | Brand: ${u.additional_data?.brand} | Period: ${u.additional_data?.period} | updated_at: ${u.updated_at}`);
        });
    }
}

detailedCheck();
