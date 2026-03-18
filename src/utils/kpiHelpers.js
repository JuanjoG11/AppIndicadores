/**
 * Entity mapping for brands
 */
export const BRAND_TO_ENTITY = {
    'ALPINA': 'TYM',
    'ZENU': 'TYM',
    'FLEISCHMANN': 'TYM',
    'UNILEVER': 'TAT',
    'FAMILIA': 'TAT',
    'TYM': 'TYM',
    'TAT': 'TAT'
};

export const getBrandEntity = (brand) => BRAND_TO_ENTITY[brand?.toUpperCase()] || null;

/**
 * Filters KPI data for a specific entity (TYM or TAT)
 * @param {Array} kpiData - The raw KPI data array
 * @param {string} entity - 'TYM' or 'TAT'
 * @returns {Array} - Filtered KPI data with entity-specific values
 */
export const filterKPIsByEntity = (kpiData, entity) => {
    if (!kpiData) return [];

    return kpiData.filter(kpi => {
        // Include if the KPI has visibleEnAreas (it's cross-area visible)
        if (kpi.visibleEnAreas && Array.isArray(kpi.visibleEnAreas)) {
            return true; // Will be filtered by area access in the dashboard
        }
        if (kpi.meta && typeof kpi.meta === 'object') {
            const hasEntityBrand = Object.keys(kpi.meta).some(b => BRAND_TO_ENTITY[b] === entity || b === entity);
            if (!hasEntityBrand) return false;
        }
        return true;
    }).map(kpi => {
        // 1. Resolver Meta (Target) - Promedio si hay marcas de la misma entidad
        let targetMeta = kpi.meta;
        let entityBrands = [];
        if (kpi.meta && typeof kpi.meta === 'object') {
            entityBrands = Object.keys(kpi.meta).filter(b => BRAND_TO_ENTITY[b] === entity || b === entity);
            if (entityBrands.length > 0) {
                const totalMeta = entityBrands.reduce((sum, b) => sum + (kpi.meta[b] || 0), 0);
                targetMeta = parseFloat((totalMeta / entityBrands.length).toFixed(2));
            } else {
                targetMeta = Object.values(kpi.meta)[0] || 0;
            }
        }

        // 2. Resolver Datos Agregados para la Entidad
        const brandValues = kpi.brandValues || {};
        const entityKeys = Object.keys(brandValues).filter(key => key.startsWith(`${entity}-`));

        if (entityKeys.length > 0) {
            let totalValue = 0;
            let totalCompliance = 0;
            let filledCount = 0;

            // Requisito: Si tiene marcas definidas en meta, deben estar todas en brandValues para decir hasData: true
            let allFilled = false;
            if (entityBrands.length > 0) {
                allFilled = entityBrands.every(brand => {
                    const key = `${entity}-${brand}`;
                    return brandValues[key] && brandValues[key].hasData;
                });
            } else {
                allFilled = brandValues[`${entity}-${entity}`]?.hasData || brandValues[`${entity}-GLOBAL`]?.hasData || false;
            }

            entityKeys.forEach(key => {
                const data = brandValues[key];
                if (data.hasData) {
                    totalValue += (data.currentValue || 0);
                    totalCompliance += (data.compliance || 0);
                    filledCount++;
                }
            });

            const avgValue = filledCount > 0 ? totalValue / filledCount : 0;
            const avgCompliance = filledCount > 0 ? totalCompliance / filledCount : 0;

            let semaphore = 'gray';
            if (filledCount > 0) {
                if (avgCompliance >= 95) semaphore = 'green';
                else if (avgCompliance >= 85) semaphore = 'yellow';
                else semaphore = 'red';
            }

            // Si hay múltiples marcas, la marca en additionalData debe reflejar el consolidado
            const baseAdditionalData = brandValues[entityKeys[entityKeys.length - 1]].additionalData || {};

            const anyFilled = entityBrands.length > 0
                ? entityBrands.some(brand => brandValues[`${entity}-${brand}`]?.hasData)
                : entityKeys.some(key => brandValues[key].hasData);

            return {
                ...kpi,
                currentValue: parseFloat(avgValue.toFixed(2)),
                compliance: Math.round(avgCompliance),
                semaphore: semaphore,
                targetMeta,
                hasData: anyFilled,
                isComplete: allFilled,
                additionalData: {
                    ...baseAdditionalData,
                    brand: entityBrands.length === 1 ? entityBrands[0] : (entity === 'TYM' ? 'Tiendas y Marcas' : 'TAT Distribuciones')
                }
            };
        }

        return {
            ...kpi,
            targetMeta,
            hasData: kpi.hasData || false,
            currentValue: 0,
            compliance: 0,
            semaphore: 'gray'
        };
    });
};
