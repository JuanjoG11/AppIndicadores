const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDeleteSingle() {
    const testId = 'bdf10d20-8bb7-4389-bce7-e5ec28e61957';
    const { data, error, count } = await supabase
        .from('kpi_updates')
        .delete({ count: 'exact' })
        .eq('id', testId);

    console.log('Delete result data:', data);
    console.log('Delete result error:', error);
    console.log('Delete count:', count);
}

testDeleteSingle();
