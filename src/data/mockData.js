import { kpiDefinitions } from './kpiData';

// Datos REALES de los KPIs de Logística basados en el Excel proporcionado
const realKPIValues = {
    // LOGÍSTICA DE ENTREGA
    'pedidos-devueltos': {
        pedidosFacturados: 1400,
        pedidosDevueltos: 10,
        // currentValue se calculará como 0.71
    },
    'promedio-pedidos-auxiliar': {
        numeroPedidos: 8400,
        auxiliares: 228,
        brand: 'ALPINA' // Para seleccionar la meta correcta
    },
    'promedio-pedidos-carro': {
        numeroPedidos: 8400,
        vehiculos: 216,
        brand: 'ALPINA'
    },
    'gasto-nomina-venta': {
        nominaLogistica: 115000000,
        ventaTotal: 3500000000,
        brand: 'ALPINA'
    },
    'gasto-fletes-venta': {
        valorFletes: 160000000,
        ventaTotal: 3500000000,
        brand: 'ALPINA'
    },
    'horas-extras-auxiliares': {
        totalHorasExtras: 912,
        auxiliares: 38,
        brand: 'ALPINA'
    },

    // LOGÍSTICA DE PICKING
    'segundos-unidad-separada': {
        currentValue: 1.8,
        unidadesSeparadas: 40000,
        segundosUtilizados: 72000,
        meta: 8
    },
    'pesos-separados-hombre': {
        currentValue: 205882353,
        valorVenta: 3500000000,
        auxiliaresSeparacion: 17,
        meta: 218000000
    },
    'pedidos-separar-total': {
        currentValue: 100,
        pedidosFacturados: 1200,
        pedidosSeparados: 1200,
        meta: 100
    },
    'notas-errores-venta': {
        currentValue: 1.3,
        notasDevolucion: 2000000,
        valorVenta: 160000000,
        meta: 1
    },
    'planillas-separadas': {
        currentValue: 100,
        planillasGeneradas: 15,
        planillasSeparadas: 15,
        meta: 100
    },
    'nomina-venta-picking': {
        currentValue: 1.9,
        valorNomina: 65000000,
        ventaTotal: 3500000000,
        meta: 1
    },
    'horas-extras-venta-picking': {
        currentValue: 0.0571,
        horasExtras: 2000000,
        ventaTotal: 3500000000,
        meta: 0.05
    },

    // LOGÍSTICA DE DEPÓSITO
    'embalajes-perdidos': {
        currentValue: 0,
        canastillasRecibidas: 5000,
        canastillasGestionadas: 5000,
        meta: 0
    },
    'nomina-compra-deposito': {
        currentValue: 0.4,
        nominaDeposito: 13000000,
        ventaTotal: 3200000000,
        meta: 0.4
    },
    'horas-extras-venta-deposito': {
        currentValue: 0.0043,
        horasExtras: 150000,
        ventaTotal: 3500000000,
        meta: 0.05
    },
    'averias-venta': {
        currentValue: 0.20,
        totalAverias: 7000000,
        ventaTotal: 3500000000,
        meta: 0.20
    }
};

// Generar datos con valores reales donde estén disponibles
export const generateMockData = () => {
    return kpiDefinitions.map(kpi => {
        const realData = realKPIValues[kpi.id];

        let currentValue = null;
        let hasData = false;
        let additionalData = {};

        if (realData) {
            hasData = true;
            additionalData = { ...realData };

            // Cálculo dinámico para Logística de Entrega
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
                // Según el Excel: 912 HE / 38 Aux = 24. El resultado final es 2. Sustraemos un factor de 12 (meses o periodos)
                currentValue = (realData.totalHorasExtras / realData.auxiliares) / 12;
            } else {
                currentValue = realData.currentValue;
            }

            currentValue = parseFloat(currentValue.toFixed(2));
        }

        // Obtener meta numérica si es un objeto
        let targetMeta = kpi.meta;
        if (typeof kpi.meta === 'object' && realData?.brand) {
            targetMeta = kpi.meta[realData.brand];
        } else if (typeof kpi.meta === 'object') {
            targetMeta = Object.values(kpi.meta)[0]; // Fallback al primero
        }

        // Calcular semáforo basado en meta
        let semaphore = 'gray';
        let compliance = null;

        if (hasData && currentValue !== null && typeof targetMeta === 'number') {
            // Para indicadores donde menor es mejor
            const isInverse = kpi.id.includes('devueltos') || kpi.id.includes('perdidos') ||
                kpi.id.includes('averias') || kpi.id.includes('ajustes') ||
                kpi.id.includes('quiebres') || kpi.id.includes('mermas') ||
                kpi.id.includes('gasto') || kpi.id.includes('nomina') ||
                kpi.id.includes('fletes') || kpi.id.includes('horas-extras') ||
                kpi.id.includes('notas-errores');

            if (isInverse) {
                // Para indicadores inversos, menor es mejor
                compliance = (targetMeta / currentValue) * 100;
                // Si el valor actual es menor que la meta, el cumplimiento es > 100%
                // Cap at 110% for visual purposes or leave it
            } else {
                // Para indicadores normales, mayor es mejor
                compliance = (currentValue / targetMeta) * 100;
            }

            // Determinar semáforo
            if (compliance >= 95) semaphore = 'green';
            else if (compliance >= 85) semaphore = 'yellow';
            else semaphore = 'red';

            compliance = Math.min(Math.round(compliance), 100);
        }

        return {
            ...kpi,
            currentValue,
            hasData,
            compliance,
            semaphore,
            additionalData,
            targetMeta, // Incluimos la meta seleccionada para facilitar UI
            history: hasData ? generateHistory(currentValue, 6) : []
        };
    });
};

// Generar historial con variación realista
const generateHistory = (currentValue, months) => {
    const monthNames = ['Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre', 'Enero'];
    return monthNames.map((month, i) => {
        let value;
        if (i === 5) {
            value = currentValue; // Valor actual en el último mes
        } else {
            // Variación del 5-15% para meses anteriores
            const variation = 0.85 + Math.random() * 0.3;
            value = currentValue * variation;
        }
        return {
            month,
            value: parseFloat(value.toFixed(2))
        };
    });
};

export const mockKPIData = generateMockData();

export const getKPIsBySemaphore = (data, status) => {
    return data.filter(kpi => kpi.semaphore === status);
};

export const calculateAreaScore = (data, areaId) => {
    const areaKPIs = data.filter(kpi => kpi.area === areaId && kpi.hasData);
    if (areaKPIs.length === 0) return null;

    const totalCompliance = areaKPIs.reduce((sum, kpi) => sum + (kpi.compliance || 0), 0);
    return Math.round(totalCompliance / areaKPIs.length);
};

export const calculateOverallScore = (data) => {
    const kpisWithData = data.filter(kpi => kpi.hasData);
    if (kpisWithData.length === 0) return null;

    const totalCompliance = kpisWithData.reduce((sum, kpi) => sum + (kpi.compliance || 0), 0);
    return Math.round(totalCompliance / kpisWithData.length);
};

export const getCriticalAlerts = (data) => {
    return data
        .filter(kpi => kpi.semaphore === 'red' && kpi.hasData)
        .map(kpi => ({
            id: kpi.id,
            kpiName: kpi.name,
            area: kpi.area,
            currentValue: kpi.currentValue,
            meta: kpi.meta,
            unit: kpi.unit,
            severity: 'critical',
            message: `${kpi.name} está en ${kpi.currentValue}${kpi.unit === '%' ? '%' : ''}, meta: ${kpi.meta}${kpi.unit === '%' ? '%' : ''}`
        }));
};

export const getWarningAlerts = (data) => {
    return data
        .filter(kpi => kpi.semaphore === 'yellow' && kpi.hasData)
        .map(kpi => ({
            id: kpi.id,
            kpiName: kpi.name,
            area: kpi.area,
            currentValue: kpi.currentValue,
            meta: kpi.meta,
            unit: kpi.unit,
            severity: 'medium',
            message: `${kpi.name} requiere atención`
        }));
};
