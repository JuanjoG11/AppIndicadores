import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    const { data: rows } = await supabase
        .from('kpi_updates')
        .select('*')
        .eq('kpi_id', 'pesos-separados-hombre')
        .order('updated_at', { ascending: false })
        .limit(10);

    if (!rows || rows.length === 0) {
        console.log('No records found for pesos-separados-hombre');
        return;
    }

    console.log(`Found ${rows.length} records:`);
    rows.forEach(r => {
        console.log(`  - period: ${r.additional_data?.period}`);
        console.log(`    brand: ${r.additional_data?.brand}`);
        console.log(`    company: ${r.additional_data?.company || r.company_id}`);
        console.log(`    value: ${r.value}`);
        console.log(`    updated_at: ${r.updated_at}`);
        console.log(`    type: ${r.additional_data?.type || 'DATA_UPDATE'}`);
        console.log('');
    });

    // Verificar qué periodo reportable esperaría el sistema ahora
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const expectedPeriod = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
    console.log(`Expected reportable period (mes anterior): ${expectedPeriod}`);
    
    rows.forEach(r => {
        const p = r.additional_data?.period;
        console.log(`Record period "${p}" matches expected: ${p === expectedPeriod}`);
    });
}
run();
