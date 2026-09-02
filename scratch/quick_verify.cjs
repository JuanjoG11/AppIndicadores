const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function quickVerify() {
    let allUpdates = [];
    let page = 0;
    const pageSize = 1000;
    
    while (true) {
        const { data, error } = await supabase
            .from('kpi_updates')
            .select('id, additional_data')
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error || !data || data.length === 0) break;
        allUpdates = allUpdates.concat(data);
        if (data.length < pageSize) break;
        page++;
    }

    const count04 = allUpdates.filter(u => u.additional_data?.period === '2026-08-04').length;
    const count05 = allUpdates.filter(u => u.additional_data?.period === '2026-08-05').length;

    console.log(`✅ VERIFICACIÓN DE EXONERACIÓN EN SUPABASE:`);
    console.log(`   - Registros de '2026-08-04': ${count04}`);
    console.log(`   - Registros de '2026-08-05': ${count05}`);
    console.log(`   - Total registros en base de datos: ${allUpdates.length}`);
}

quickVerify();
