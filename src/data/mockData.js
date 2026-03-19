import { kpiDefinitions } from './kpiData';
import { BRAND_TO_ENTITY } from '../utils/kpiHelpers';
import { isInverseKPI } from '../utils/kpiCalculations';

// Datos REALES de los KPIs (Inicia vacío para producción)
const realKPIValues = {};

// Nombres de meses en español
const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const START_YEAR = 2026;
const START_MONTH = 1; // Febrero

export const generateRealHistory = () => {
    const now = new Date();
    const history = [];
    let y = START_YEAR;
    let m = START_MONTH;
    while (y < now.getFullYear() || (y === now.getFullYear() && m <= now.getMonth())) {
        history.push({ month: MONTH_NAMES[m], year: y, TYM: null, TAT: null });
        m++;
        if (m > 11) { m = 0; y++; }
    }
    return history;
};

export const getMonthKey = (date) => {
    const d = date ? new Date(date) : new Date();
    return MONTH_NAMES[d.getMonth()];
};

export const generateMockData = () => {
    return kpiDefinitions.map(kpi => {
        const realData = realKPIValues[kpi.id];

        let currentValue = null;
        let hasData = false;
        let additionalData = {};

        if (realData) {
            // SIEMPRE empezamos en false para que el analista deba cargar la información manualmente
            hasData = false;
            additionalData = { ...realData };

            if (kpi.id === 'pedidos-devueltos') {
                currentValue = (realData.pedidosDevueltos / realData.pedidosFacturados) * 100;
            } else if (kpi.id === 'promedio-pedidos-auxiliar') {
                currentValue = realData.numeroPedidos / realData.auxiliares;
            } else if (kpi.id === 'promedio-pedidos-carro') {
                currentValue = realData.numeroPedidos / realData.vehiculos;
            } else if (kpi.id === 'gasto-nomina-venta') {
                currentValue = (realData.nominaLogistica / realData.ventaTotal) * 100;
            } else if (kpi.id === 'gasto-fletes-venta') {
                currentValue = (realData.valorFletes / realData.ventaTotal) * 100;
            } else if (kpi.id === 'horas-extras-auxiliares') {
                currentValue = (realData.totalHorasExtras / realData.auxiliares) / 25;
            } else {
                currentValue = realData.currentValue;
            }

            currentValue = parseFloat(currentValue.toFixed(2));
        }

        let targetMeta = kpi.meta;
        if (kpi.meta && typeof kpi.meta === 'object') {
            const brand = realData?.brand || 'ALPINA';
            const entity = BRAND_TO_ENTITY[brand] || 'TYM';
            const brandKey = brand && kpi.meta[brand] ? brand : Object.keys(kpi.meta).find(b => BRAND_TO_ENTITY[b] === entity);
            targetMeta = brandKey ? kpi.meta[brandKey] : (kpi.meta[entity] || Object.values(kpi.meta)[0] || 0);
        }

        let semaphore = 'gray';
        let compliance = null;

        if (hasData && currentValue !== null && typeof targetMeta === 'number') {
            const isInverse = isInverseKPI(kpi.id);

            if (isInverse) {
                compliance = (targetMeta / currentValue) * 100;
            } else {
                compliance = (currentValue / targetMeta) * 100;
            }

            if (compliance >= 95) semaphore = 'green';
            else if (compliance >= 85) semaphore = 'yellow';
            else semaphore = 'red';

            compliance = Math.min(Math.round(compliance), 100);
        }

        const currentMonth = getMonthKey();
        const kpiHistory = generateRealHistory().map(h => {
            if (h.month === currentMonth) {
                // Si realData tiene brand, inferimos la empresa (ALPINA -> TYM, UNILEVER -> TAT)
                const entity = realData?.brand ? (BRAND_TO_ENTITY[realData.brand] || 'TYM') : 'TYM';
                return { ...h, [entity]: currentValue };
            }
            return h;
        });

        // 3. Generar brandValues para el desglose (Para que el filtro por marca funcione)
        const brandValues = {};
        const allMetaBrands = (kpi.meta && typeof kpi.meta === 'object') ? Object.keys(kpi.meta) : [];

        // Marcas para TYM y TAT + Scopes globales
        const tymBrands = ['ALPINA', 'ZENU', 'FLEISCHMANN'];
        const tatBrands = ['UNILEVER', 'FAMILIA'];
        const globalScopes = ['Global', 'TYM', 'TAT'];

        // Poblar datos por marca de forma proporcional al consolidado
        const brandsToPopulate = [...tymBrands, ...tatBrands, ...globalScopes].filter(b => allMetaBrands.includes(b));

        brandsToPopulate.forEach(brand => {
            const entityOfBrand = BRAND_TO_ENTITY[brand];
            const dataKey = `${entityOfBrand}-${brand}`;

            // Variación ligera por marca deshabilitada para producción (inicia en 0)
            const brandVal = 0;
            const brandTarget = kpi.meta[brand] || targetMeta;

            let brandCompliance = null;
            if (brandVal !== null) {
                brandCompliance = isInverseKPI(kpi.id) ? (brandTarget / brandVal) * 100 : (brandVal / brandTarget) * 100;
            }

            brandValues[dataKey] = {
                currentValue: parseFloat(brandVal.toFixed(2)),
                compliance: Math.min(Math.round(brandCompliance || 0), 100),
                hasData: false // No simulamos datos, deben ser cargados manualmente
            };
        });

        return {
            ...kpi,
            currentValue,
            hasData,
            compliance,
            semaphore,
            additionalData,
            targetMeta,
            brandValues,
            history: kpiHistory
        };
    });
};

export const mockKPIData = generateMockData();

export const getKPIsBySemaphore = (data, status) => {
    return data.filter(kpi => kpi.semaphore === status);
};

export const calculateAreaScore = (data, areaId) => {
    const allAreaKPIs = data.filter(kpi => kpi.area === areaId);
    if (allAreaKPIs.length === 0) return null;

    // Sumamos el cumplimiento de los que tienen datos (los que no tienen suman 0%)
    const totalCompliance = allAreaKPIs.reduce((sum, kpi) =>
        sum + (kpi.hasData ? (kpi.compliance || 0) : 0), 0
    );

    // El divisor es el total de indicadores existentes para esa área
    const score = Math.round(totalCompliance / allAreaKPIs.length);
    return Math.min(score, 100);
};

export const calculateOverallScore = (data) => {
    if (data.length === 0) return null;

    // Sumamos cumplimiento de lo cargado (lo pendiente pesa 0%)
    const totalCompliance = data.reduce((sum, kpi) =>
        sum + (kpi.hasData ? (kpi.compliance || 0) : 0), 0
    );

    // El divisor es el total de indicadores de la entidad seleccionada
    const score = Math.round(totalCompliance / data.length);
    return Math.min(score, 100);
};

export const getCriticalAlerts = (data, entity = 'TYM') => {
    const alerts = [];
    data.filter(kpi => kpi.semaphore === 'red' && kpi.hasData).forEach(kpi => {
        let metaDisplay = kpi.targetMeta || (typeof kpi.meta === 'number' ? kpi.meta : 0);
        alerts.push({
            id: kpi.id,
            kpiName: kpi.name,
            area: kpi.area,
            currentValue: kpi.currentValue,
            meta: metaDisplay,
            unit: kpi.unit,
            severity: 'critical',
            type: 'compliance',
            message: `${entity} - ${kpi.name} bajo desempeño: ${kpi.currentValue}${kpi.unit === '%' ? '%' : ''} vs Meta ${metaDisplay}`
        });
    });
    return alerts;
};

export const getWarningAlerts = (data, entity = 'TYM') => {
    return data
        .filter(kpi => kpi.semaphore === 'yellow' && kpi.hasData)
        .map(kpi => {
            let metaDisplay = kpi.targetMeta || (typeof kpi.meta === 'number' ? kpi.meta : 0);
            return {
                id: kpi.id,
                kpiName: kpi.name,
                area: kpi.area,
                currentValue: kpi.currentValue,
                meta: metaDisplay,
                unit: kpi.unit,
                severity: 'medium',
                message: `${entity} - ${kpi.name} requiere atención (Meta: ${metaDisplay}${kpi.unit === '%' ? '%' : ''})`
            };
        });
};
