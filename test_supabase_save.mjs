import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ovjgsscbmkermglezrcj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const now = new Date();
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
const prevMonth = (() => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
})();

const TEST_KPI_ID = '__TEST_PERIODO_FIX__';
const TEST_COMPANY = 'TYM';
const TEST_BRAND = 'TEST_BRAND';

function toMonthKey(p) {
    if (!p) return null;
    return String(p).substring(0, 7);
}

// Lógica exacta de persistUpdate (nueva versión)
function findExisting(rows, periodToStore, granular = false) {
    return rows?.find(row => {
        const rowPeriod = row.additional_data?.period || '';
        const rowUpdatedAt = row.updated_at || '';
        const rowMonthFromUpdate = rowUpdatedAt.substring(0, 7);
        const targetMonth = toMonthKey(periodToStore);
        if (granular) {
            return rowPeriod === periodToStore;
        }
        return toMonthKey(rowPeriod) === targetMonth || rowMonthFromUpdate === targetMonth;
    });
}

let passed = 0, failed = 0;
function assert(desc, condition, detail = '') {
    if (condition) { console.log(`  ✅ ${desc}`); passed++; }
    else { console.log(`  ❌ FALLÓ: ${desc}${detail ? `\n     → ${detail}` : ''}`); failed++; }
}

console.log(`\n📅 Mes actual: ${currentMonth}  |  Mes anterior: ${prevMonth}`);
console.log('═'.repeat(55));

// Limpiar
await supabase.from('kpi_updates').delete().eq('kpi_id', TEST_KPI_ID);

// ── ESCENARIO 1: Registro legacy (period=junio, updated_at=julio) ─────────────
console.log('\n📋 ESC 1: Registro con period=junio pero updated_at=julio\n');

const { data: ins1, error: e1 } = await supabase
    .from('kpi_updates')
    .insert({
        company_id: TEST_COMPANY, kpi_id: TEST_KPI_ID, value: 100, cargo: 'TEST',
        additional_data: { brand: TEST_BRAND, period: prevMonth, company: TEST_COMPANY }
    })
    .select().single();
assert('INSERT legacy exitoso', !e1, e1?.message);

// Simular que updated_at es de julio (ya lo es porque insertamos ahora en julio)
console.log(`  → updated_at del registro: ${ins1?.updated_at?.substring(0,7)}`);

const { data: rows1 } = await supabase
    .from('kpi_updates').select('id, additional_data, updated_at')
    .eq('kpi_id', TEST_KPI_ID).eq('company_id', TEST_COMPANY)
    .eq('additional_data->>brand', TEST_BRAND)
    .order('updated_at', { ascending: false }).limit(20);

const found1 = findExisting(rows1, currentMonth, false);
assert(
    `Registro legacy (period=${prevMonth}, updated_at=${ins1?.updated_at?.substring(0,7)}) encontrado para mes ${currentMonth}`,
    !!found1,
    `rows: ${rows1?.length}, rowUpdatedAt: ${rows1?.[0]?.updated_at?.substring(0,7)}`
);

if (found1) {
    const { error: updErr } = await supabase
        .from('kpi_updates')
        .update({ value: 200, additional_data: { brand: TEST_BRAND, period: currentMonth, company: TEST_COMPANY }, cargo: 'TEST' })
        .eq('id', found1.id);
    assert('UPDATE del legacy exitoso', !updErr, updErr?.message);

    const { data: v1 } = await supabase.from('kpi_updates').select('value, additional_data').eq('id', found1.id).single();
    assert(`Period corregido a ${currentMonth}`, v1?.additional_data?.period === currentMonth, `period: ${v1?.additional_data?.period}`);
    assert('Valor actualizado a 200', v1?.value === 200, `valor: ${v1?.value}`);
}

// ── ESCENARIO 2: Registro normal del mes actual ───────────────────────────────
console.log('\n📋 ESC 2: Registro normal del mes actual\n');
await supabase.from('kpi_updates').delete().eq('kpi_id', TEST_KPI_ID);

const { data: ins2, error: e2 } = await supabase
    .from('kpi_updates')
    .insert({
        company_id: TEST_COMPANY, kpi_id: TEST_KPI_ID, value: 150, cargo: 'TEST',
        additional_data: { brand: TEST_BRAND, period: currentMonth, company: TEST_COMPANY }
    })
    .select().single();
assert('INSERT normal exitoso', !e2, e2?.message);

const { data: rows2 } = await supabase
    .from('kpi_updates').select('id, additional_data, updated_at')
    .eq('kpi_id', TEST_KPI_ID).eq('company_id', TEST_COMPANY)
    .eq('additional_data->>brand', TEST_BRAND)
    .order('updated_at', { ascending: false }).limit(20);

const found2 = findExisting(rows2, currentMonth, false);
assert('Registro normal encontrado', !!found2, `rows: ${rows2?.length}`);

// ── ESCENARIO 3: No duplicar al guardar dos veces ─────────────────────────────
console.log('\n📋 ESC 3: Segundo guardado — debe UPDATE, no INSERT duplicado\n');

if (found2) {
    await supabase.from('kpi_updates')
        .update({ value: 300, additional_data: { brand: TEST_BRAND, period: currentMonth, company: TEST_COMPANY }, cargo: 'TEST' })
        .eq('id', found2.id);
}

const { data: rows3 } = await supabase
    .from('kpi_updates').select('id').eq('kpi_id', TEST_KPI_ID).eq('company_id', TEST_COMPANY);
assert('Solo 1 registro (no duplicados)', rows3?.length === 1, `registros: ${rows3?.length}`);

// Limpieza
await supabase.from('kpi_updates').delete().eq('kpi_id', TEST_KPI_ID);
console.log('\n  🧹 Limpio');

console.log('\n' + '═'.repeat(55));
console.log(`\n📊 ${passed} ✅  |  ${failed} ❌`);
if (failed === 0) console.log('\n🎉 Todo funciona. El fix es correcto en Supabase.\n');
else console.log('\n⚠️  Hay problemas. No usar en producción todavía.\n');
