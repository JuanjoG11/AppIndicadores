import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAfterUpdate() {
    console.log('--- Checking table after user SQL execution ---');
    const { data, error } = await supabase.from('kpi_updates').select('*').limit(1);
    if (error) {
        console.error('ERROR:', error);
    } else if (data && data.length > 0) {
        const row = data[0];
        console.log('Available Columns:', Object.keys(row).join(', '));
        console.log('Sample row with company_id:', JSON.stringify(row, null, 2));

        const { count, error: countErr } = await supabase
            .from('kpi_updates')
            .select('*', { count: 'exact', head: true });
        console.log('Total records (verify they are not deleted):', count);

        const { data: tymData } = await supabase.from('kpi_updates').select('id').eq('company_id', 'TYM');
        console.log('Records successfully migrated to TYM:', tymData?.length || 0);

        const { data: nulls } = await supabase.from('kpi_updates').select('id').is('company_id', null);
        console.log('Records still with NULL company_id:', nulls?.length || 0);
    } else {
        console.log('No data found in kpi_updates (Check if deleted!)');
    }
}
checkAfterUpdate();
