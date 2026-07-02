/**
 * inspect_periodos.js
 * Muestra el detalle completo de los 73 registros para decidir si son mayo o junio legítimos.
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://ovjgsscbmkermglezrcj.supabase.co',
    'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp'
);

async function main() {
    const { data: rows, error } = await supabase
        .from('kpi_updates')
        .select('id, kpi_id, company_id, cargo, additional_data, updated_at, value')
        .gte('updated_at', '2026-06-01T00:00:00.000Z')
        .lte('updated_at', '2026-06-30T23:59:59.999Z')
        .eq('additional_data->>period', '2026-06')
        .neq('additional_data->>type', 'META_UPDATE')
        .order('updated_at', { ascending: true });

    if (error) { console.error(error); return; }

    // Agrupar por día de updated_at para ver distribución temporal
    const byDay = {};
    rows.forEach(r => {
        const day = r.updated_at.substring(0, 10); // YYYY-MM-DD
        if (!byDay[day]) byDay[day] = [];
        byDay[day].push(r);
    });

    console.log('\n══ DISTRIBUCIÓN POR DÍA ══');
    Object.entries(byDay).sort().forEach(([day, recs]) => {
        console.log(`  ${day}: ${recs.length} registros`);
    });

    console.log('\n══ DETALLE COMPLETO ══');
    console.log('updated_at (local)          | kpi_id                        | cargo                  | brand      | value');
    console.log('─'.repeat(110));
    rows.forEach(r => {
        const fecha = new Date(r.updated_at).toLocaleString('es-CO', { 
            timeZone: 'America/Bogota',
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        const kpi   = (r.kpi_id || '').padEnd(30);
        const cargo = (r.cargo || '').padEnd(22);
        const brand = (r.additional_data?.brand || 'Global').padEnd(10);
        const val   = String(r.value ?? '').padEnd(10);
        console.log(`${fecha} | ${kpi} | ${cargo} | ${brand} | ${val}`);
    });

    console.log(`\nTotal: ${rows.length} registros`);

    // Verificar si existe algún registro de junio con period='2026-06' PERO 
    // que tenga updated_at posterior al día 25 de junio (probablemente junio real)
    const posibleJunio = rows.filter(r => r.updated_at >= '2026-06-25T00:00:00.000Z');
    if (posibleJunio.length > 0) {
        console.log('\n⚠️  REGISTROS DEL 25-30 DE JUNIO (podrían ser junio real):');
        posibleJunio.forEach(r => {
            console.log(`  ${r.updated_at} | ${r.kpi_id} | ${r.cargo} | value: ${r.value}`);
        });
    } else {
        console.log('\n✅ Ningún registro fue guardado después del 25 de junio.');
        console.log('   → Todos son probablemente datos de mayo cargados retroactivamente.');
    }
}

main();
