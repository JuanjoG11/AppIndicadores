const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testExoneratedFilter() {
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

    console.log(`Total registros en Supabase: ${allUpdates.length}`);

    const isExoneratedDate = (u) => {
        const period = u.additional_data?.period;
        if (period === '2026-08-04' || period === '2026-08-05') return true;
        
        const updatedDate = (u.updated_at || u.created_at || '').substring(0, 10);
        if (updatedDate === '2026-08-04' || updatedDate === '2026-08-05') return true;

        return false;
    };

    const exonerated = allUpdates.filter(isExoneratedDate);
    const kept = allUpdates.filter(u => !isExoneratedDate(u));

    console.log(`🚫 Registros exonerados (04 y 05 de agosto): ${exonerated.length}`);
    console.log(`✅ Registros conservados (demás fechas): ${kept.length}`);

    console.log('\nDesglose de fechas updated_at conservadas en kept:');
    const datesCount = {};
    kept.forEach(u => {
        const d = (u.updated_at || u.created_at || '').substring(0, 10);
        datesCount[d] = (datesCount[d] || 0) + 1;
    });
    console.log(datesCount);
}

testExoneratedFilter();
