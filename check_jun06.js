import { createClient } from '@supabase/supabase-js';
const sb = createClient('https://ovjgsscbmkermglezrcj.supabase.co','sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp');

const { data, error } = await sb.from('kpi_updates')
  .select('id, kpi_id, cargo, additional_data, updated_at, value')
  .eq('additional_data->>period','2026-06')
  .neq('additional_data->>type','META_UPDATE')
  .order('updated_at', { ascending: true });

if (error) { console.error(error); process.exit(1); }

console.log('Registros con period=2026-06 que QUEDAN en Supabase:', data.length);
console.log('');
data.forEach(r => {
  const fecha = new Date(r.updated_at).toLocaleString('es-CO', { 
    timeZone: 'America/Bogota', day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' 
  });
  console.log(fecha + ' | ' + r.kpi_id.padEnd(30) + ' | ' + (r.additional_data?.brand||'').padEnd(12) + ' | ' + r.cargo);
});
