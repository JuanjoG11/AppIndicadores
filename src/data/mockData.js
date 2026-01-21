import { kpiDefinitions } from './kpiData';

// Datos REALES de los KPIs de Logística basados en el Excel proporcionado
const realKPIValues = {
    // LOGÍSTICA DE ENTREGA
    'pedidos-devueltos': {
        currentValue: 0.71,
        pedidosFacturados: 1400,
        pedidosDevueltos: 10,
        meta: 1.80
    },
    'promedio-pedidos-auxiliar': {
        currentValue: 36.8,
        numeroPedidos: 8400,
        auxiliares: 228,
        meta: 50 // ALPINA
    },
    'promedio-pedidos-carro': {
        currentValue: 38.9,
        numeroPedidos: 8400,
        vehiculos: 216,
        meta: 65 // ALPINA
    },
    'gasto-nomina-venta': {
        currentValue: 3.3,
        nominaLogistica: 115000000,
        ventaTotal: 3500000000,
        meta: 3.4
    },
    'gasto-fletes-venta': {
        currentValue: 4.6,
        valorFletes: 160000000,
        ventaTotal: 3500000000,
        meta: 4.5 // ALPINA
    },
    'horas-extras-auxiliares': {
        currentValue: 24.0, // 912 horas / 38 auxiliares
        totalHorasExtras: 912,
        auxiliares: 38,
        meta: 1.5 // ALPINA
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
            currentValue = realData.currentValue;
            hasData = true;
            additionalData = { ...realData };
        }

        // Calcular semáforo basado en meta
        let semaphore = 'gray';
        let compliance = null;

        if (hasData && currentValue !== null && typeof kpi.meta === 'number') {
            // Para indicadores donde menor es mejor
            const isInverse = kpi.id.includes('devueltos') || kpi.id.includes('perdidos') ||
                kpi.id.includes('averias') || kpi.id.includes('ajustes') ||
                kpi.id.includes('quiebres') || kpi.id.includes('mermas') ||
                kpi.id.includes('gasto') || kpi.id.includes('nomina') ||
                kpi.id.includes('fletes') || kpi.id.includes('horas-extras') ||
                kpi.id.includes('notas-errores');

            if (isInverse) {
                // Para indicadores inversos, menor es mejor
                compliance = (kpi.meta / currentValue) * 100;
                if (compliance > 100) compliance = 100; // Cap at 100%
            } else {
                // Para indicadores normales, mayor es mejor
                compliance = (currentValue / kpi.meta) * 100;
            }

            // Determinar semáforo
            if (compliance >= 95) semaphore = 'green';
            else if (compliance >= 85) semaphore = 'yellow';
            else semaphore = 'red';
        }

        return {
            ...kpi,
            currentValue,
            hasData,
            compliance,
            semaphore,
            additionalData,
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
