const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectSSTAugust() {
    const { data: sstAugust, error } = await supabase
        .from('kpi_updates')
        .select('*')
        .in('kpi_id', ['calificacion-auditoria', 'actividades-cultura', 'tiempo-contratacion']);

    const august = sstAugust.filter(r => (r.additional_data?.period || '').startsWith('2026-08'));
    console.log(`Total August records for SST: ${august.length}`);
    
    // Group by created_at or updated_at
    const dates = {};
    august.forEach(r => {
        const d = r.updated_at || r.created_at;
        dates[d] = (dates[d] || 0) + 1;
    });
    console.log('Timestamps of SST August records:', dates);
    
    console.log('\nSample record:', JSON.stringify(august[0], null, 2));
}

inspectSSTAugust();
