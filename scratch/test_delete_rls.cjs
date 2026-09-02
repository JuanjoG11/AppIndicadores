const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDeletePermission() {
    const { data, error } = await supabase
        .from('kpi_updates')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
        .select();

    if (error) {
        console.error("❌ Delete failed:", error);
    } else {
        console.log(`✅ Deleted rows count: ${data ? data.length : 0}`);
    }
}

checkDeletePermission();
