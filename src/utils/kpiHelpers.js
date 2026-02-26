/**
 * Entity mapping for brands
 */
export const BRAND_TO_ENTITY = {
    'ALPINA': 'TYM',
    'POLAR': 'TYM',
    'ZENU': 'TYM',
    'FLEISCHMANN': 'TYM',
    'UNILEVER': 'TAT',
    'FAMILIA': 'TAT'
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
        // If meta is an object, it MUST contain at least one brand from this entity or the entity name itself
        if (typeof kpi.meta === 'object') {
            const hasEntityBrand = Object.keys(kpi.meta).some(b => BRAND_TO_ENTITY[b] === entity || b === entity);
            if (!hasEntityBrand) return false;
        }
        return true;
    }).map(kpi => {
        // 1. Resolve Meta (Target)
        let targetMeta = kpi.meta;
        if (typeof kpi.meta === 'object') {
            // Find the first brand in the meta object that belongs to this entity
            const brandKey = Object.keys(kpi.meta).find(b => BRAND_TO_ENTITY[b] === entity || b === entity);
            targetMeta = brandKey ? kpi.meta[brandKey] : Object.values(kpi.meta)[0] || 0;
        }

        // 2. Resolve Current Data from brandValues if available
        const entityKeys = kpi.brandValues ? Object.keys(kpi.brandValues).filter(key => key.startsWith(`${entity}-`)) : [];

        if (entityKeys.length > 0) {
            const globalKey = `${entity}-GLOBAL`;
            const mainKey = entityKeys.includes(globalKey) ? globalKey : entityKeys[0];

            return {
                ...kpi,
                ...kpi.brandValues[mainKey],
                targetMeta,
                hasData: kpi.brandValues[mainKey].hasData !== undefined ? kpi.brandValues[mainKey].hasData : true
            };
        }

        return {
            ...kpi,
            targetMeta,
            hasData: false
        };
    });
};
