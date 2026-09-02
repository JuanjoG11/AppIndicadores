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

function isInverseKPI(kpiId) {
    const INVERSE_KPIS = [
        'gasto-nomina-venta', 'gasto-fletes-venta', 'horas-extras-auxiliares',
        'segundos-unidad-separada', 'notas-errores-venta', 'nomina-venta-picking',
        'horas-extras-venta-picking', 'embalajes-perdidos', 'nomina-compra-deposito',
        'horas-extras-venta-deposito', 'pedidos-devueltos', 'averias-venta',
        'rotacion-personal', 'ausentismo', 'he-rn-nomina', 'gasto-nomina-venta-rrhh',
        'tiempo-contratacion', 'indice-arqueo-caja', 'vales-descuadres',
        'cartera-no-vencida', 'cartera-mayor-30', 'dias-cierre', 'ajustes-posteriores',
        'ajustes-revisoria', 'rotacion-cxc', 'rotacion-cxp', 'multas-sanciones',
        'devoluciones-buen-estado', 'devoluciones-mal-estado-comercial',
        'rotacion-equipo-comercial', 'gasto-personal-comercial', 'gasto-viaje-comercial',
        'dias-inventario-comercial', 'quiebres-inventario', 'obsolescencia',
        'mermas', 'error-facturacion', 'mantenimiento-equipos'
    ];
    return INVERSE_KPIS.includes(kpiId);
}

function toMonthKey(s) {
    if (!s) return null;
    s = String(s);
    if (/^\d{4}-\d{2}$/.test(s)) return s;
    if (/^\d{4}-\d{2}[-_]/.test(s)) return s.substring(0, 7);
    if (/^\d{4}-W\d{1,2}$/.test(s)) {
        return '2026-07'; // July for W30
    }
    return s.substring(0, 7);
}

async function simulateUseKPIs() {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString();

    const { data: currentMonthData } = await supabase
        .from('kpi_updates')
        .select('*')
        .gte('updated_at', currentMonthStart)
        .order('updated_at', { ascending: false })
        .limit(1000);

    const { data: historicalData } = await supabase
        .from('kpi_updates')
        .select('*')
        .gte('updated_at', twelveMonthsAgo)
        .lt('updated_at', currentMonthStart)
        .order('updated_at', { ascending: false })
        .limit(1000);

    const data = [...(currentMonthData || []), ...(historicalData || [])];
    console.log(`Loaded ${data.length} records`);

    // Group by groupKey
    const aggregatedData = {};
    data.forEach(upd => {
        const kpiId = upd.kpi_id;
        const companyId = upd.additional_data?.company || upd.company_id || 'TYM';
        const brand = upd.additional_data?.brand || 'Global';
        const periodKey = upd.additional_data?.period || '2026-07';
        const groupKey = `${kpiId}-${companyId}-${brand}-${periodKey}`;

        if (!aggregatedData[groupKey] || new Date(upd.updated_at || upd.created_at) > new Date(aggregatedData[groupKey].latestUpdate.updated_at || aggregatedData[groupKey].latestUpdate.created_at)) {
            aggregatedData[groupKey] = {
                kpi_id: kpiId,
                company_id: companyId,
                brand: brand,
                periodKey: periodKey,
                latestUpdate: upd
            };
        }
    });

    console.log(`Aggregated groups count: ${Object.keys(aggregatedData).length}`);

    // Let's inspect what happens to KPIs for TYM in July (period 2026-07 or reportable)
    let tymJulyComplianceSum = 0;
    let tymJulyCount = 0;

    kpiDefinitions.forEach(def => {
        // Find updates for TYM
        const kpiId = def.id;
        const tymKeys = Object.keys(aggregatedData).filter(k => k.startsWith(`${kpiId}-TYM-`));
        
        let kpiHasJulyData = false;
        let kpiJulyCompliance = 0;

        tymKeys.forEach(k => {
            const group = aggregatedData[k];
            const upd = group.latestUpdate;
            const period = upd.additional_data?.period || '';
            const monthKey = toMonthKey(period);

            // Is this July?
            if (monthKey === '2026-07' || period === '2026-07' || period === '2026-W30' || period === '2026-07-Q2' || period === '2026-07-31') {
                kpiHasJulyData = true;
                const meta = def.meta;
                let targetMeta = typeof meta === 'number' ? meta : 0;
                if (typeof meta === 'object') {
                    const brand = group.brand;
                    targetMeta = meta[brand] || meta['TYM'] || Object.values(meta)[0] || 0;
                }
                const isInv = isInverseKPI(kpiId);
                let comp = 0;
                const val = upd.value;
                if (targetMeta === 0 && val === 0) comp = isInv ? 100 : 0;
                else if (targetMeta === 0 && val > 0) comp = isInv ? 0 : 100;
                else if (isInv) comp = (targetMeta / val) * 100;
                else comp = (val / targetMeta) * 100;
                if (isInv && val === 0) comp = 100;
                comp = Math.min(Math.max(Math.round(comp || 0), 0), 100);

                kpiJulyCompliance = comp;
            }
        });

        if (kpiHasJulyData) {
            tymJulyComplianceSum += kpiJulyCompliance;
            tymJulyCount++;
            console.log(`KPI ${kpiId}: compliance=${kpiJulyCompliance}%`);
        } else {
            console.log(`❌ KPI ${kpiId}: NO JULY DATA FOUND`);
        }
    });

    console.log(`\nTYM July average score: ${(tymJulyComplianceSum / (tymJulyCount || 1)).toFixed(1)}% (${tymJulyCount} / ${kpiDefinitions.length} KPIs with data)`);
}

simulateUseKPIs();
