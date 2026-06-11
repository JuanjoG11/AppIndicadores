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
            // Cuando hay datos reales, marcamos hasData como true para que se muestren en la UI
            hasData = true;
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

            if (targetMeta === 0 && currentValue === 0) {
                compliance = isInverse ? 100 : 0;
            } else if (targetMeta === 0 && currentValue > 0) {
                compliance = isInverse ? 0 : 100;
            } else if (isInverse) {
                compliance = (targetMeta / currentValue) * 100;
            } else {
                compliance = (currentValue / targetMeta) * 100;
            }

            if (compliance >= 95) semaphore = 'green';
            else if (compliance >= 85) semaphore = 'yellow';
            else semaphore = 'red';

            compliance = Math.min(Math.max(compliance || 0, 0), 100);
        }

        // 3. Generar historial para todos los meses y ambas compañías (TYM y TAT)
        const kpiHistory = MONTH_NAMES.map(m => ({
            month: m,
            year: START_YEAR,
            // Asignamos el valor actual a ambas compañías para simplificar el mock
            TYM: currentValue,
            TAT: currentValue,
        }));

        // 3. Generar brandValues para el desglose (Para que el filtro por marca funcione)
        const brandValues = {};
        const allMetaBrands = (kpi.meta && typeof kpi.meta === 'object') ? Object.keys(kpi.meta) : [];

        // Marcas para TYM y TAT + Scopes globales
        const tymBrands = ['ALPINA', 'FLEISCHMANN'];
        const tatBrands = ['UNILEVER', 'FAMILIA'];
        const globalScopes = ['Global', 'TYM', 'TAT'];

        // Poblar datos por marca de forma proporcional al consolidado
        const brandsToPopulate = [...tymBrands, ...tatBrands, ...globalScopes].filter(b => allMetaBrands.includes(b));

        brandsToPopulate.forEach(brand => {
            const entityOfBrand = BRAND_TO_ENTITY[brand];
            const dataKey = `${entityOfBrand}-${brand}`;

            // Inicia en 0 — compliance se calcula correctamente con meta=0
            const brandVal = 0;
            const brandTarget = kpi.meta[brand] !== undefined ? kpi.meta[brand] : targetMeta;

            let brandCompliance = 0;
            const isInv = isInverseKPI(kpi.id);
            if (brandTarget === 0) {
                brandCompliance = isInv ? 100 : 0; // meta 0 + valor 0 → perfecto para inversos
            } else {
                brandCompliance = isInv
                    ? (brandTarget / (brandVal || 1)) * 100
                    : (brandVal / brandTarget) * 100;
            }

            brandValues[dataKey] = {
                currentValue: parseFloat(brandVal.toFixed(2)),
                compliance: Math.min(Math.round(brandCompliance || 0), 100),
                hasData: !!realData // Si hay datos reales, marcamos como disponible
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

    const kpisConDatos = allAreaKPIs.filter(kpi => kpi.hasData);
    if (kpisConDatos.length === 0) return null; // Sin datos = null (no mostrar 0)

    // Numerador: suma del cumplimiento de los cargados
    // Denominador: TOTAL de KPIs del área (los pendientes pesan 0%)
    const totalCompliance = kpisConDatos.reduce((sum, kpi) =>
        sum + (kpi.compliance || 0), 0
    );

    const score = Math.round(totalCompliance / allAreaKPIs.length);
    return Math.min(score, 100);
};

export const calculateOverallScore = (data) => {
    if (data.length === 0) return null;

    const kpisConDatos = data.filter(kpi => kpi.hasData);
    if (kpisConDatos.length === 0) return null;

    // Numerador: suma del cumplimiento de los cargados
    // Denominador: TOTAL de KPIs (los pendientes pesan 0%)
    const totalCompliance = kpisConDatos.reduce((sum, kpi) =>
        sum + (kpi.compliance || 0), 0
    );

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
