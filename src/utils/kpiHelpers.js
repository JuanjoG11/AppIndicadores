/**
 * Filters KPI data for a specific entity (TYM or TAT)
 * @param {Array} kpiData - The raw KPI data array
 * @param {string} entity - 'TYM' or 'TAT'
 * @returns {Array} - Filtered KPI data with entity-specific values
 */
export const filterKPIsByEntity = (kpiData, entity) => {
    if (!kpiData) return [];

    return kpiData.map(kpi => {
        // Look for keys that start with the selected entity (e.g., "TYM-")
        const entityKeys = kpi.brandValues ? Object.keys(kpi.brandValues).filter(key => key.startsWith(`${entity}-`)) : [];

        // If we have specific data for this entity
        if (entityKeys.length > 0) {
            // Priority: Total/Global for that entity, or first available
            const globalKey = `${entity}-GLOBAL`;
            const mainKey = entityKeys.includes(globalKey) ? globalKey : entityKeys[0];

            return {
                ...kpi,
                ...kpi.brandValues[mainKey],
                hasData: kpi.brandValues[mainKey].hasData !== undefined ? kpi.brandValues[mainKey].hasData : true
            };
        }

        // Fallback: If no specific data in brandValues, check if we need to adjust TARGET only
        let targetMeta = kpi.meta;
        if (typeof kpi.meta === 'object') {
            targetMeta = kpi.meta[entity] || Object.values(kpi.meta)[0] || 0;
        }

        return {
            ...kpi,
            targetMeta,
            hasData: false // Marcar como sin datos si no hay registro específico para esta empresa
        };
    });
};
