import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    const kpiIds = ['dias-cierre', 'rotacion-cxc', 'rotacion-cxp', 'activos-conciliados', 'optimizacion-tributaria'];
    
    console.log('--- FETCHING LAST UPDATES FOR THE FIVE KPIs ---');
    for (const kid of kpiIds) {
        console.log(`\n=== KPI: ${kid} ===`);
        const { data, error } = await supabase
            .from('kpi_updates')
            .select('*')
            .eq('kpi_id', kid)
            .order('updated_at', { ascending: false })
            .limit(10);
            
        if (error) {
            console.error('Error fetching:', error);
            continue;
        }
        
        if (!data || data.length === 0) {
            console.log('No updates found.');
            continue;
        }
        
        data.forEach(upd => {
            console.log(`ID: ${upd.id}`);
            console.log(`  Company: ${upd.company_id}, Cargo: ${upd.cargo}`);
            console.log(`  Value: ${upd.value}, Updated At: ${upd.updated_at}`);
            console.log(`  Additional Data: ${JSON.stringify(upd.additional_data)}`);
        });
    }
}

check();
