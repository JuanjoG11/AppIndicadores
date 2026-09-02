const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCleanup() {
    const { count, error } = await supabase
        .from('kpi_updates')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error("Error fetching count:", error);
        return;
    }

    console.log(`Current total rows in kpi_updates: ${count}`);
}

testCleanup();
