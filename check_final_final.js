import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAfterUpdate() {
    console.log('--- FINAL CHECK ---');
    const { data: sample } = await supabase.from('kpi_updates').select('*').limit(1);
    if (sample && sample[0]) {
      console.log('Columns: ' + Object.keys(sample[0]).join(','));
      console.log('Sample company_id: ' + sample[0].company_id);
    }
    
    const { count } = await supabase.from('kpi_updates').select('*', { count: 'exact', head: true });
    console.log('Total Records: ' + count);
    
    const { data: tym } = await supabase.from('kpi_updates').select('id').eq('company_id', 'TYM');
    console.log('TYM Records: ' + tym?.length);
}
checkAfterUpdate();
