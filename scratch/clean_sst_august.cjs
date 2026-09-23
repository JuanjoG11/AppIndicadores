const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function backupAndDeleteSSTAugust() {
    const sstKPIs = ['calificacion-auditoria', 'actividades-cultura', 'tiempo-contratacion'];
    
    // 1. Fetch records
    const { data: allSST, error: fetchErr } = await supabase
        .from('kpi_updates')
        .select('*')
        .in('kpi_id', sstKPIs);

    if (fetchErr) {
        console.error('Error fetching SST records:', fetchErr);
        return;
    }

    const augustRecords = allSST.filter(r => (r.additional_data?.period || '').startsWith('2026-08'));
    console.log(`Found ${augustRecords.length} August records to clean up.`);

    if (augustRecords.length === 0) {
        console.log('No August records found.');
        return;
    }

    // 2. Save backup
    const backupPath = path.join(__dirname, '..', 'backups', 'sst_august_backup_2026-09-09.json');
    fs.writeFileSync(backupPath, JSON.stringify(augustRecords, null, 2), 'utf-8');
    console.log(`Backup saved successfully to: ${backupPath}`);

    // 3. Delete by IDs
    const idsToDelete = augustRecords.map(r => r.id);
    const { error: deleteErr } = await supabase
        .from('kpi_updates')
        .delete()
        .in('id', idsToDelete);

    if (deleteErr) {
        console.error('Error deleting records:', deleteErr);
        return;
    }

    console.log(`Successfully deleted ${idsToDelete.length} August records for SST.`);

    // 4. Verify July and earlier are untouched
    const { data: remaining, error: remErr } = await supabase
        .from('kpi_updates')
        .select('*')
        .in('kpi_id', sstKPIs);

    if (remErr) {
        console.error('Error verifying remaining:', remErr);
        return;
    }

    const remainingAugust = remaining.filter(r => (r.additional_data?.period || '').startsWith('2026-08'));
    console.log(`Remaining SST records total: ${remaining.length}`);
    console.log(`Remaining August SST records: ${remainingAugust.length}`);
}

backupAndDeleteSSTAugust();
