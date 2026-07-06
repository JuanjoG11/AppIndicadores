/**
 * test_shared_fields.mjs
 * Prueba la lógica de campos compartidos entre KPIs
 * Verifica que:
 * 1. Al abrir KPI B después de guardar KPI A, el campo compartido viene prellenado
 * 2. Si KPI B ya tiene sus propios datos, NO se sobreescriben con los de A
 * 3. Campos NO compartidos no se propagan
 * 4. Solo se propagan entre misma marca + mismo mes
 */

// ── Réplica exacta de la lógica en KPIDataForm ───────────────────────────────

const SHARED_FIELDS = [
    'ventaTotal', 'valorVenta', 'valorNomina', 'totalNomina',
    'ventaRealizada', 'nominaLogistica', 'auxiliares', 'vehiculos'
];

function getSharedFieldValues(rawUpdates, kpiId, brandName, targetPeriod, userEntity) {
    if (!rawUpdates || !Array.isArray(rawUpdates)) return {};
    const period = targetPeriod || new Date().toISOString().substring(0, 7);
    const shared = {};

    rawUpdates.forEach(upd => {
        if (upd.kpi_id === kpiId) return; // skip el propio KPI
        if (upd.additional_data?.type === 'META_UPDATE') return;
        const updPeriod = upd.additional_data?.period || '';
        const updBrand = upd.additional_data?.brand?.toUpperCase() || '';
        const updCompany = upd.additional_data?.company || upd.company_id || '';
        if (updPeriod.substring(0, 7) !== period.substring(0, 7)) return;
        if (updBrand !== brandName.toUpperCase()) return;
        if (updCompany !== userEntity) return;
        SHARED_FIELDS.forEach(field => {
            if (upd.additional_data?.[field] !== undefined && shared[field] === undefined) {
                shared[field] = upd.additional_data[field];
            }
        });
    });
    return shared;
}

function getInitialBrandData(rawUpdates, kpi, brandName, targetPeriod, userEntity) {
    const period = targetPeriod || new Date().toISOString().substring(0, 7);

    // 1. Buscar datos propios del KPI
    if (rawUpdates && Array.isArray(rawUpdates)) {
        const match = rawUpdates.find(upd =>
            upd.kpi_id === kpi.id &&
            upd.additional_data?.company === userEntity &&
            upd.additional_data?.brand?.toUpperCase() === brandName.toUpperCase() &&
            upd.additional_data?.period === period &&
            upd.additional_data?.type !== 'META_UPDATE'
        );
        if (match?.additional_data) {
            const cleaned = { ...match.additional_data };
            delete cleaned.updatedAt; delete cleaned.period; delete cleaned.timestamp;
            return cleaned;
        }
    }

    // 2. Sin datos propios → campos compartidos de otros KPIs
    return getSharedFieldValues(rawUpdates, kpi.id, brandName, period, userEntity);
}

// ── Datos de prueba ───────────────────────────────────────────────────────────

const currentMonth = (() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
})();
const prevMonth = (() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
})();

// Simula rawUpdates: el usuario ya guardó gasto-nomina-venta con ventaTotal=3500000000
const rawUpdates = [
    {
        kpi_id: 'gasto-nomina-venta',
        company_id: 'TYM',
        additional_data: {
            brand: 'ALPINA', company: 'TYM', period: currentMonth,
            nominaLogistica: 65000000, ventaTotal: 3500000000
        }
    },
    {
        kpi_id: 'gasto-fletes-venta',
        company_id: 'TYM',
        additional_data: {
            brand: 'ALPINA', company: 'TYM', period: currentMonth,
            valorFletes: 8000000, ventaTotal: 3500000000
        }
    },
    // Dato de MES PASADO — NO debe propagarse
    {
        kpi_id: 'nomina-venta-picking',
        company_id: 'TYM',
        additional_data: {
            brand: 'ALPINA', company: 'TYM', period: prevMonth,
            valorNomina: 99999999, ventaTotal: 1111111111
        }
    },
    // Dato de OTRA MARCA — NO debe propagarse
    {
        kpi_id: 'gasto-nomina-venta',
        company_id: 'TYM',
        additional_data: {
            brand: 'ZENU', company: 'TYM', period: currentMonth,
            nominaLogistica: 11111, ventaTotal: 999999
        }
    }
];

let passed = 0, failed = 0;
function assert(desc, condition, detail = '') {
    if (condition) { console.log(`  ✅ ${desc}`); passed++; }
    else { console.log(`  ❌ FALLÓ: ${desc}${detail ? `\n     → ${detail}` : ''}`); failed++; }
}

console.log(`\n📅 Mes actual: ${currentMonth}  |  Anterior: ${prevMonth}`);
console.log('═'.repeat(60));

// ── TEST 1: averias-venta no tiene datos propios → debe heredar ventaTotal ────
console.log('\n📋 TEST 1: KPI sin datos propios hereda campo compartido\n');
const averiasKpi = { id: 'averias-venta' };
const result1 = getInitialBrandData(rawUpdates, averiasKpi, 'ALPINA', currentMonth, 'TYM');
assert('ventaTotal propagado a averias-venta', result1.ventaTotal === 3500000000, `valor: ${result1.ventaTotal}`);
assert('nominaLogistica propagado a averias-venta', result1.nominaLogistica === 65000000, `valor: ${result1.nominaLogistica}`);
assert('campo NO compartido (valorFletes) no propagado', result1.valorFletes === undefined, `valor: ${result1.valorFletes}`);

// ── TEST 2: KPI con datos propios NO hereda datos de otro KPI ─────────────────
console.log('\n📋 TEST 2: KPI con datos propios NO se sobreescribe\n');
const gastofletesKpi = { id: 'gasto-fletes-venta' };
const result2 = getInitialBrandData(rawUpdates, gastofletesKpi, 'ALPINA', currentMonth, 'TYM');
assert('KPI con datos propios devuelve sus propios datos', result2.valorFletes === 8000000, `valorFletes: ${result2.valorFletes}`);
assert('ventaTotal propio preserved (no sobreescrito)', result2.ventaTotal === 3500000000, `valor: ${result2.ventaTotal}`);

// ── TEST 3: Mes pasado NO se propaga ─────────────────────────────────────────
console.log('\n📋 TEST 3: Datos de mes pasado NO se propagan\n');
const nominaPickingKpi = { id: 'nomina-venta-picking' };
const result3 = getInitialBrandData(rawUpdates, nominaPickingKpi, 'ALPINA', currentMonth, 'TYM');
// nominaPickingKpi tiene datos en prevMonth pero buscamos currentMonth → debe tomar shared del mes actual
assert('valorNomina del mes pasado NO propagado', result3.valorNomina !== 99999999, `valor: ${result3.valorNomina}`);
// ventaTotal del mes actual SÍ debe propagarse (viene de gasto-nomina-venta del mes actual)
assert('ventaTotal del mes actual SÍ propagado', result3.ventaTotal === 3500000000, `valor: ${result3.ventaTotal}`);

// ── TEST 4: Otra marca NO se propaga ─────────────────────────────────────────
console.log('\n📋 TEST 4: Datos de otra marca NO se propagan\n');
const resultZenu = getInitialBrandData(rawUpdates, averiasKpi, 'ZENU', currentMonth, 'TYM');
// ZENU tiene gasto-nomina-venta con ventaTotal=999999, NO debe recibir el de ALPINA
assert('ZENU recibe su propio ventaTotal (999999)', resultZenu.ventaTotal === 999999, `valor: ${resultZenu.ventaTotal}`);
assert('ALPINA no contamina ZENU', resultZenu.ventaTotal !== 3500000000, `valor: ${resultZenu.ventaTotal}`);

// ── TEST 5: Marca sin ningún dato → campos vacíos ────────────────────────────
console.log('\n📋 TEST 5: Marca sin datos → objeto vacío\n');
const resultFleisch = getInitialBrandData(rawUpdates, averiasKpi, 'FLEISCHMANN', currentMonth, 'TYM');
assert('FLEISCHMANN sin datos → objeto vacío', Object.keys(resultFleisch).length === 0, `keys: ${JSON.stringify(Object.keys(resultFleisch))}`);

// ── RESUMEN ──────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(60));
console.log(`\n📊 ${passed} ✅  |  ${failed} ❌`);
if (failed === 0) console.log('\n🎉 Campos compartidos funcionan correctamente. Es seguro.\n');
else console.log('\n⚠️  Hay problemas. Revisar antes de usar.\n');
