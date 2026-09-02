/**
 * Elimina registros falsos de cartera con period='2026-08' del 05-08-2026
 * Usa la secret key para bypass de RLS
 */
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
    process.env.VITE_SUPABASE_URL || 'https://ovjgsscbmkermglezrcj.supabase.co',
    process.env.SUPABASE_SERVICE_KEY || ''
);

const kpisCartera = [
    'cartera-no-vencida',
    'cartera-mayor-30',
    'recircularizaciones',
    'valor-cartera-venta'
];

// Primero verificar cuántos hay
const { data, error } = await sb
    .from('kpi_updates')
    .select('id, kpi_id, company_id, additional_data, updated_at')
    .in('kpi_id', kpisCartera)
    .eq('additional_data->>period', '2026-08');

if (error) { console.error('❌ Error al consultar:', error); process.exit(1); }

console.log(`📋 Registros a eliminar: ${data.length}`);

if (data.length === 0) {
    console.log('✅ Ya no hay registros falsos de agosto. Nada que hacer.');
    process.exit(0);
}

data.forEach(r => {
    const brand = r.additional_data?.brand || r.company_id;
    console.log(`  ${r.kpi_id} | ${r.company_id} | ${brand} | ${r.updated_at?.substring(0,19)}`);
});

// Eliminar en lotes
const ids = data.map(r => r.id);
const BATCH = 50;
let totalDeleted = 0;

for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);
    const { error: delError } = await sb
        .from('kpi_updates')
        .delete()
        .in('id', batch);

    if (delError) {
        console.error(`❌ Error al eliminar:`, delError);
        process.exit(1);
    }
    totalDeleted += batch.length;
    console.log(`🗑️  Lote ${Math.floor(i/BATCH)+1}: ${batch.length} eliminados (total: ${totalDeleted})`);
}

console.log(`\n✅ Listo. ${totalDeleted} registros falsos de agosto eliminados.`);
console.log('   La analista puede cargar los datos reales de agosto ahora.');
