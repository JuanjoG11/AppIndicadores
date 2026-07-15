import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPlanillas() {
    console.log('--- Inspecting planillas-cerradas records ---');
    const { data, error } = await supabase
        .from('kpi_updates')
        .select('*')
        .eq('kpi_id', 'planillas-cerradas');
    
    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${data.length} records.`);
    data.forEach(d => {
        console.log({
            id: d.id,
            company_id: d.company_id,
            value: d.value,
            cargo: d.cargo,
            additional_brand: d.additional_data?.brand,
            additional_company: d.additional_data?.company,
            additional_period: d.additional_data?.period,
            planillasCerradas: d.additional_data?.planillasCerradas,
            planillasGeneradas: d.additional_data?.planillasGeneradas,
            updated_at: d.updated_at
        });
    });
}
checkPlanillas();
