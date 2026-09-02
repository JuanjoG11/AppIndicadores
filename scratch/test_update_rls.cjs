const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpdate() {
    // Try updating old rows' updated_at to 2025-01-01
    const oldTimestamp = '2025-01-01T00:00:00.000Z';
    const { data, error } = await supabase
        .from('kpi_updates')
        .update({ updated_at: oldTimestamp })
        .lt('updated_at', '2026-08-05T00:00:00.000Z')
        .select('id');

    if (error) {
        console.error("❌ Update failed:", error);
    } else {
        console.log(`✅ Updated rows count: ${data ? data.length : 0}`);
    }
}

testUpdate();
