/**
 * Calculate the historical trend for a set of KPIs.
 * This aggregates the history from multiple KPIs into a single trend.
 */
export const calculateHistoricalTrend = (kpis, company = null) => {
    // Filter by company if provided
    const filteredKpis = company
        ? kpis.filter(kpi => kpi.brandValues && Object.values(kpi.brandValues).some(v => v.company === company))
        : kpis;

    // Use the last 6 months from the first KPI as a template for month names
    if (!kpis[0] || !kpis[0].history) return [];

    const months = kpis[0].history.map(h => h.month);

    return months.map(month => {
        let totalCompliance = 0;
        let count = 0;

        filteredKpis.forEach(kpi => {
            const historyPoint = kpi.history.find(h => h.month === month);
            if (historyPoint && kpi.targetMeta) {
                // Determine if inverse for compliance calculation
                const isInverse = kpi.id.includes('devueltos') ||
                    kpi.id.includes('gasto') ||
                    kpi.id.includes('horas-extras') ||
                    kpi.id.includes('mal-estado') ||
                    kpi.id.includes('vencida') ||
                    kpi.id === 'segundos-unidad-separada' ||
                    kpi.id === 'notas-errores-venta' ||
                    kpi.id.includes('nomina') ||
                    kpi.id === 'rotacion-personal' ||
                    kpi.id === 'ausentismo' ||
                    kpi.id === 'he-rn-nomina' ||
                    kpi.id === 'tiempo-contratacion';

                const targetMeta = (kpi.meta && typeof kpi.meta === 'object')
                    ? (company ? kpi.meta[company] : Object.values(kpi.meta)[0])
                    : kpi.meta;

                let compliance;
                if (isInverse) {
                    compliance = (targetMeta / historyPoint.value) * 100;
                } else {
                    compliance = (historyPoint.value / targetMeta) * 100;
                }

                totalCompliance += Math.min(Math.round(compliance || 0), 100);
                count++;
            }
        });

        return {
            month,
            score: count > 0 ? Math.round(totalCompliance / count) : 0
        };
    });
};

/**
 * Prepares data for a multi-line chart comparing companies
 */
export const getComparisonTrend = (kpis) => {
    const tymTrend = calculateHistoricalTrend(kpis, 'TYM');
    const tatTrend = calculateHistoricalTrend(kpis, 'TAT');

    return tymTrend.map((point, i) => ({
        month: point.month,
        TYM: point.score,
        TAT: tatTrend[i] ? tatTrend[i].score : 0
    }));
};
