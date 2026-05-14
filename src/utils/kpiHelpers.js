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
 * Obtiene el responsable adecuado para el KPI según la entidad del usuario
 */
export const getKPIResponsable = (kpi, user) => {
    if (!kpi || !user) return null;
    if (user.company === 'TYM' && kpi.responsableTYM) return kpi.responsableTYM;
    if (user.company === 'TAT' && kpi.responsableTAT) return kpi.responsableTAT;
    return kpi.responsable;
};

/**
 * Obtiene las marcas de una entidad para un KPI, 
 * excluyendo el nombre de la empresa si existen marcas específicas.
 */
export const getEntityBrands = (kpi, entity) => {
    if (!kpi.meta || typeof kpi.meta !== 'object') return [];
    
    const allBrands = Object.keys(kpi.meta);
    const brandsOfEntity = allBrands.filter(b => (BRAND_TO_ENTITY[b] === entity || b === entity) && b !== 'POLAR');
    
    const hasSpecificBrands = brandsOfEntity.some(b => b !== entity && BRAND_TO_ENTITY[b] === entity);
    
    if (hasSpecificBrands) {
        return brandsOfEntity.filter(b => b !== entity);
    }
    
    return brandsOfEntity;
};

/**
 * Filters KPI data for a specific entity (TYM or TAT)
 * @param {Array} kpiData - The raw KPI data array
 * @param {string} entity - 'TYM' or 'TAT'
 * @returns {Array} - Filtered KPI data with entity-specific values
 */
export const filterKPIsByEntity = (kpiData, entity) => {
    if (!kpiData) return [];

    return kpiData.filter(kpi => {
        if (kpi.visibleEnAreas && Array.isArray(kpi.visibleEnAreas)) {
            return true;
        }
        
        // Si no tiene meta definida como objeto, es un KPI global y debe verse siempre
        if (!kpi.meta || typeof kpi.meta !== 'object') {
            return true;
        }

        // Si tiene meta objeto, verificar si tiene alguna marca de la entidad o es 'Global'
        const hasEntityBrand = Object.keys(kpi.meta).some(b => 
            BRAND_TO_ENTITY[b] === entity || 
            b === entity || 
            b?.toUpperCase() === 'GLOBAL'
        );

        return hasEntityBrand;
    }).map(kpi => {
        // 1. Resolver Meta (Target) - Promedio si hay marcas de la misma entidad
        let targetMeta = kpi.meta;
        let entityBrands = [];
        if (kpi.meta && typeof kpi.meta === 'object') {
            entityBrands = getEntityBrands(kpi, entity);
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

            // Determinar qué claves usar para el cálculo:
            // 1) Si existen datos brand-específicos (TYM-ALPINA, TYM-ZENU...) → usar SOLO esos
            // 2) Si no hay brand-específicos pero hay nivel entidad (TYM-TYM) → usar ese
            // Esto evita mezclar ambos niveles y promedios incorrectos
            const brandSpecificKeys = entityBrands.length > 0
                ? entityBrands.map(b => `${entity}-${b}`).filter(k => brandValues[k]?.hasData)
                : [];
            const keysToAggregate = brandSpecificKeys.length > 0
                ? brandSpecificKeys
                : entityKeys.filter(k => brandValues[k]?.hasData);

            // allFilled: todas las marcas definidas tienen datos brand-específicos
            let allFilled = false;
            if (entityBrands.length > 0) {
                allFilled = entityBrands.every(brand => {
                    const key = `${entity}-${brand}`;
                    return brandValues[key] && brandValues[key].hasData;
                });
            } else {
                allFilled = brandValues[`${entity}-${entity}`]?.hasData || brandValues[`${entity}-GLOBAL`]?.hasData || false;
            }

            keysToAggregate.forEach(key => {
                const data = brandValues[key];
                if (data && data.hasData) {
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

            const baseAdditionalData = brandValues[entityKeys[entityKeys.length - 1]].additionalData || {};

            // anyFilled: hay dato si alguna clave usada tiene datos
            const anyFilled = keysToAggregate.length > 0;

            return {
                ...kpi,
                currentValue: parseFloat(avgValue.toFixed(2)),
                compliance: Math.min(Math.round(avgCompliance), 100),
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

        // Si llegamos aquí, es porque no hay datos específicos (brandValues) para esta entidad en este periodo
        const isGlobalKPI = !kpi.meta || typeof kpi.meta !== 'object';
        
        return {
            ...kpi,
            targetMeta,
            hasData: isGlobalKPI ? (kpi.hasData || false) : false,
            currentValue: isGlobalKPI ? (kpi.currentValue || 0) : 0,
            compliance: isGlobalKPI ? (kpi.compliance || 0) : 0,
            semaphore: isGlobalKPI ? (kpi.semaphore || 'gray') : 'gray'
        };
    });
};
