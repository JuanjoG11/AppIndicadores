import { createClient } from '@supabase/supabase-js';

const sb = createClient(
    'https://ovjgsscbmkermglezrcj.supabase.co',
    'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp'
);

async function testUpdate() {
    // Try updating our test insert row
    const { data, error } = await sb
        .from('kpi_updates')
        .update({ value: 999 })
        .eq('id', '529696a1-e125-4d47-b9f0-24a7ca70559c')
        .select();

    console.log('Update result: error =', error, 'data =', data);
}

testUpdate();
