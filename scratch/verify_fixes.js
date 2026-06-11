import { isInverseKPI } from '../src/utils/kpiCalculations.js';

// Let's test the calculations we added to fetchInitialData
console.log('--- VERIFYING INITIAL LOAD CALCULATIONS ---');

// Simulation of fetchInitialData logic
function calculateComplianceAndSemaphore(kpiId, meta, value) {
    let compliance = 0;
    let semaphore = 'gray';
    let targetMeta = meta;

    if (typeof targetMeta === 'number') {
        const isInverse = isInverseKPI(kpiId);

        if (targetMeta === 0 && value === 0) {
            compliance = isInverse ? 100 : 0;
        } else if (targetMeta === 0 && value > 0) {
            compliance = isInverse ? 0 : 100;
        } else {
            compliance = isInverse ? (targetMeta / value) * 100 : (value / targetMeta) * 100;
            if (isInverse && value === 0) compliance = 100;
            compliance = Math.min(Math.max(Math.round(compliance || 0), 0), 100);
        }

        const isStrict = ['revision-margenes', 'revision-precios', 'pedidos-facturados', 'impresion-facturas', 'fiabilidad-inventarios', 'planillas-separadas', 'pedidos-separar-total'].includes(kpiId);
        const greenThreshold = isStrict ? 100 : 95;
        const yellowThreshold = isStrict ? 100 : 85;

        if (compliance >= greenThreshold) semaphore = 'green';
        else if (compliance >= yellowThreshold) semaphore = 'yellow';
        else semaphore = 'red';
    }

    return { compliance, semaphore };
}

// Test case 1: Strict KPI at 98% -> Should be yellow (since it requires 100% to be green/yellow)
// Wait! Let's check the yellow threshold for strict KPIs:
// if compliance >= greenThreshold (100) -> green
// else if compliance >= yellowThreshold (100) -> yellow
// else -> red
// So 98% is less than 100% -> should be red! Let's verify.
const res1 = calculateComplianceAndSemaphore('revision-margenes', 100, 98);
console.log(`Strict KPI (revision-margenes) meta=100 value=98: compliance=${res1.compliance} (Expected: 98), semaphore=${res1.semaphore} (Expected: red)`);
if (res1.compliance === 98 && res1.semaphore === 'red') {
    console.log('✅ Test 1 Passed');
} else {
    console.error('❌ Test 1 Failed');
}

// Test case 2: Non-strict KPI at 98% -> Should be green (since green threshold is >= 95)
const res3 = calculateComplianceAndSemaphore('rotacion-personal', 10, 9.6); // inverse (rotacion-personal is inverse)
console.log(`Non-strict KPI (rotacion-personal) meta=10 value=9.6: compliance=${res3.compliance} (Expected: 100), semaphore=${res3.semaphore} (Expected: green)`);
if (res3.compliance === 100 && res3.semaphore === 'green') {
    console.log('✅ Test 2 Passed');
} else {
    console.error('❌ Test 2 Failed');
}

// Test case 3: isManualUpdate logic
console.log('\n--- VERIFYING MANUAL UPDATE / DB SYNC LOGIC ---');

// Simulated newData payload from DB sync / realtime callback
const dbPayload = {
    value: 85,
    updatedAt: '2026-06-11T12:00:00Z',
    manual: true // this flag is saved in DB
};

// Simulated newData payload from local form submission
const formPayload = {
    value: 85,
    // updatedAt is undefined when submitting form
};

const isManualUpdateDb = !dbPayload.updatedAt;
const isManualUpdateForm = !formPayload.updatedAt;

console.log(`DB Sync Payload: isManualUpdate = ${isManualUpdateDb} (Expected: false)`);
console.log(`Form Submission Payload: isManualUpdate = ${isManualUpdateForm} (Expected: true)`);

if (isManualUpdateDb === false && isManualUpdateForm === true) {
    console.log('✅ Test 3 Passed');
} else {
    console.error('❌ Test 3 Failed');
}
