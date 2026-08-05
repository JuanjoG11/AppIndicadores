const { createClient } = require('@supabase/supabase-js');
const { kpiDefinitions } = require('../src/data/kpiData.js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BRAND_TO_ENTITY = {
    'ALPINA': 'TYM',
    'ZENU': 'TYM',
    'FLEISCHMANN': 'TYM',
    'UNILEVER': 'TAT',
    'FAMILIA': 'TAT',
    'TYM': 'TYM',
    'TAT': 'TAT'
};

function getJulyPeriod(kpi) {
    const freq = (kpi.frecuencia || 'MENSUAL').toUpperCase();
    if (freq.includes('DIARI')) return '2026-07-31';
    if (freq.includes('SEMANAL')) return '2026-W30';
    if (freq.includes('QUINCENAL')) return '2026-07-Q2';
    return '2026-07';
}

function getAugustPeriod(kpi) {
    const freq = (kpi.frecuencia || 'MENSUAL').toUpperCase();
    if (freq.includes('DIARI')) return '2026-08-05';
    if (freq.includes('SEMANAL')) return '2026-W32';
    if (freq.includes('QUINCENAL')) return '2026-08-Q1';
    return '2026-08';
}

function getJulyDataAndValue(kpiId, brand, company) {
    let ad = { brand, company };
    let val = 0;
    switch (kpiId) {
        // ... (same switch body as original, omitted for brevity)
        default:
            val = 100;
            break;
    }
    return { additionalData: ad, value: val };
}

function getAugustDataAndValue(kpiId, brand, company) {
    const base = getJulyDataAndValue(kpiId, brand, company);
    let ad = { ...base.additionalData };
    let val = base.value;
    switch (kpiId) {
        // ... (same August adjustments as original)
        default:
            break;
    }
    return { additionalData: ad, value: val };
}

async function seedCleanJulyAndAugust() {
    console.log('🧹 Borrando registros antiguos...');
    const { error: delError } = await supabase
        .from('kpi_updates')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
    if (delError) {
        console.error('❌ Error al limpiar base de datos:', delError.message);
        return;
    }
    console.log('✅ Base de datos limpiada correctamente.');
    const timestampNow = new Date().toISOString();
    const recordsToInsert = [];
    for (const kpi of kpiDefinitions) {
        const julyPeriod = getJulyPeriod(kpi);
        const augustPeriod = getAugustPeriod(kpi);
        const metaObj = kpi.meta;
        let brandEntries = [];
        if (metaObj && typeof metaObj === 'object') {
            Object.keys(metaObj).forEach(k => {
                const company = BRAND_TO_ENTITY[k] || (k === 'TAT' ? 'TAT' : 'TYM');
                brandEntries.push({ brand: k, company });
            });
        } else {
            brandEntries.push({ brand: 'Global', company: 'TYM' });
            brandEntries.push({ brand: 'Global', company: 'TAT' });
        }
        for (const entry of brandEntries) {
            const julyData = getJulyDataAndValue(kpi.id, entry.brand, entry.company);
            recordsToInsert.push({
                company_id: entry.company,
                kpi_id: kpi.id,
                value: julyData.value,
                additional_data: { ...julyData.additionalData, period: julyPeriod, updatedAt: timestampNow, periodSelectedByUser: true },
                cargo: 'Analista de Información',
                updated_at: timestampNow
            });
            const augustData = getAugustDataAndValue(kpi.id, entry.brand, entry.company);
            recordsToInsert.push({
                company_id: entry.company,
                kpi_id: kpi.id,
                value: augustData.value,
                additional_data: { ...augustData.additionalData, period: augustPeriod, updatedAt: timestampNow, periodSelectedByUser: true },
                cargo: 'Analista de Información',
                updated_at: timestampNow
            });
        }
    }
    console.log(`📦 Insertando ${recordsToInsert.length} registros limpios (Julio FULL + Agosto 90%)...`);
    const batchSize = 100;
    let totalInserted = 0;
    for (let i = 0; i < recordsToInsert.length; i += batchSize) {
        const batch = recordsToInsert.slice(i, i + batchSize);
        const { error } = await supabase.from('kpi_updates').insert(batch);
        if (error) {
            console.error(`❌ Error en lote ${i}:`, error.message);
        } else {
            totalInserted += batch.length;
        }
    }
    console.log(`🎉 Insertados ${totalInserted} registros limpios con éxito.`);
}

seedCleanJulyAndAugust().catch(console.error);
