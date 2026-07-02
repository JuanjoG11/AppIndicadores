/**
 * fix_periodos_mayo.js
 * 
 * Corrige registros guardados en junio 2026 cuyo additional_data.period
 * dice '2026-06' pero el usuario quería cargar datos de mayo ('2026-05').
 * 
 * Modo DRY-RUN por defecto: muestra los cambios sin ejecutarlos.
 * Para aplicar los cambios: node fix_periodos_mayo.js --apply
 * 
 * Uso:
 *   node fix_periodos_mayo.js           ← solo muestra qué cambiaría
 *   node fix_periodos_mayo.js --apply   ← aplica los cambios en Supabase
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ovjgsscbmkermglezrcj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DRY_RUN = !process.argv.includes('--apply');

// ── Configuración del problema ────────────────────────────────────────────────
// Registros guardados en junio con period = '2026-06' que en realidad son de mayo.
// La forma de identificarlos: updated_at en junio 2026 Y period = '2026-06'
// Y el usuario quería cargar mayo → period debería ser '2026-05'.
//
// IMPORTANTE: Solo tocamos registros que el usuario marcó explícitamente como
// "manual: true" para no afectar datos de junio legítimos.
//
// Si quieres filtrar solo ciertos KPIs o usuarios, ajusta TARGET_KPI_IDS / TARGET_CARGOS.
const TARGET_PERIOD_WRONG  = '2026-06'; // period que está mal guardado
const TARGET_PERIOD_CORRECT = '2026-05'; // period correcto (mayo)
const JUNE_START = '2026-06-01T00:00:00.000Z';
const JUNE_END   = '2026-06-13T23:59:59.999Z'; // Solo del 10-12 junio (mayo retroactivo seguro)
                                                 // Los del 16 y 24 jun se revisan manualmente

// Dejar vacío para corregir todos los KPIs/usuarios, o poner IDs específicos:
const TARGET_KPI_IDS = []; // ej: ['pedidos-devueltos', 'rotacion-personal']
const TARGET_CARGOS  = []; // ej: ['Coordinador Logística', 'Analista Comercial']
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
    console.log('');
    console.log('══════════════════════════════════════════════════');
    console.log('  CORRECCIÓN DE PERIODOS: Junio → Mayo 2026');
    console.log(`  Modo: ${DRY_RUN ? '🔍 DRY-RUN (sin cambios)' : '⚠️  APLICANDO CAMBIOS'}`);
    console.log('══════════════════════════════════════════════════');
    console.log('');

    // 1. Traer todos los registros de junio 2026
    let query = supabase
        .from('kpi_updates')
        .select('id, kpi_id, company_id, cargo, additional_data, updated_at, value')
        .gte('updated_at', JUNE_START)
        .lte('updated_at', JUNE_END)
        .eq('additional_data->>period', TARGET_PERIOD_WRONG)
        .neq('additional_data->>type', 'META_UPDATE');

    if (TARGET_KPI_IDS.length > 0) {
        query = query.in('kpi_id', TARGET_KPI_IDS);
    }

    const { data: rows, error } = await query;

    if (error) {
        console.error('❌ Error consultando Supabase:', error.message);
        process.exit(1);
    }

    if (!rows || rows.length === 0) {
        console.log('✅ No se encontraron registros con el problema descrito.');
        console.log('   (period = 2026-06 en registros de junio)');
        console.log('');
        console.log('   Posibles causas:');
        console.log('   • Los registros ya fueron corregidos anteriormente.');
        console.log('   • El period estaba guardado de otra forma.');
        console.log('');
        return;
    }

    // 2. Filtrar por cargo si se especificó
    const targets = TARGET_CARGOS.length > 0
        ? rows.filter(r => TARGET_CARGOS.includes(r.cargo))
        : rows;

    console.log(`📋 Registros encontrados con period='${TARGET_PERIOD_WRONG}' en junio: ${rows.length}`);
    if (TARGET_CARGOS.length > 0) {
        console.log(`   → Filtrados por cargo: ${targets.length}`);
    }
    console.log('');

    if (targets.length === 0) {
        console.log('ℹ️  Ningún registro coincide con los filtros de cargo especificados.');
        return;
    }

    // 3. Mostrar detalle
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ id          │ kpi_id               │ cargo     │ period │');
    console.log('├─────────────────────────────────────────────────────────┤');
    targets.forEach(r => {
        const id = r.id.toString().substring(0, 8).padEnd(11);
        const kpi = (r.kpi_id || '').substring(0, 20).padEnd(20);
        const cargo = (r.cargo || '').substring(0, 10).padEnd(10);
        const period = r.additional_data?.period || '?';
        console.log(`│ ${id} │ ${kpi} │ ${cargo} │ ${period} │`);
    });
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log('');
    console.log(`   Cambio: period '${TARGET_PERIOD_WRONG}' → '${TARGET_PERIOD_CORRECT}'`);
    console.log('');

    if (DRY_RUN) {
        console.log('ℹ️  DRY-RUN: No se realizaron cambios.');
        console.log('   Para aplicar los cambios ejecuta:');
        console.log('   node fix_periodos_mayo.js --apply');
        console.log('');
        return;
    }

    // 4. Separar entre los que ya tienen un registro en mayo (eliminar) y los que no (mover)
    console.log('⏳ Verificando conflictos con registros existentes en mayo...');
    const toDelete = [];
    const toMove = [];

    for (const row of targets) {
        const brand = row.additional_data?.brand || 'Global';
        const { data: existing } = await supabase
            .from('kpi_updates')
            .select('id')
            .eq('kpi_id', row.kpi_id)
            .eq('company_id', row.company_id)
            .eq('additional_data->>brand', brand)
            .eq('additional_data->>period', TARGET_PERIOD_CORRECT)
            .neq('additional_data->>type', 'META_UPDATE')
            .limit(1);

        if (existing && existing.length > 0) {
            toDelete.push(row); // Ya hay dato correcto en mayo → este es duplicado, eliminar
        } else {
            toMove.push(row);   // No hay dato en mayo → mover el period
        }
    }

    console.log(`   → ${toMove.length} registros se moverán a mayo (sin conflicto)`);
    console.log(`   → ${toDelete.length} registros se eliminarán (ya existe versión correcta en mayo)`);
    console.log('');

    // 5. Eliminar los duplicados
    let deleted = 0, moved = 0, failed = 0;

    for (const row of toDelete) {
        const { error: delError } = await supabase
            .from('kpi_updates')
            .delete()
            .eq('id', row.id);
        if (delError) {
            console.error(`   ❌ Error eliminando id=${row.id}: ${delError.message}`);
            failed++;
        } else {
            console.log(`   🗑️  Eliminado id=${row.id} | ${row.kpi_id} | ${row.additional_data?.brand} (duplicado de mayo)`);
            deleted++;
        }
    }

    // 6. Mover los que no tienen conflicto
    for (const row of toMove) {
        const newAdditionalData = { ...row.additional_data, period: TARGET_PERIOD_CORRECT };
        const { error: updateError } = await supabase
            .from('kpi_updates')
            .update({ additional_data: newAdditionalData })
            .eq('id', row.id);
        if (updateError) {
            console.error(`   ❌ Error moviendo id=${row.id}: ${updateError.message}`);
            failed++;
        } else {
            console.log(`   ✅ Movido  id=${row.id} | ${row.kpi_id} | ${row.additional_data?.brand} → period: 2026-05`);
            moved++;
        }
    }

    console.log('');
    console.log('══════════════════════════════════════════════════');
    console.log(`  Resultado: ${moved} movidos a mayo, ${deleted} duplicados eliminados, ${failed} errores`);
    console.log('══════════════════════════════════════════════════');
    if (moved + deleted > 0) {
        console.log('\n✅ Corrección aplicada. Recarga la app para ver los cambios.');
    }
}

main().catch(err => {
    console.error('Error fatal:', err);
    process.exit(1);
});
