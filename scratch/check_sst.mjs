import { kpiDefinitions } from '../src/data/kpiData.js';
const kpiData = kpiDefinitions;
import { filterKPIsByEntity, getKPIResponsable, getEntityBrands } from '../src/utils/kpiHelpers.js';
import { getCurrentPeriodKey } from '../src/utils/formatters.js';

const sst_tym = {
    username: 'sst_tym',
    name: 'Salud y Cultura · TYM',
    role: 'Analista',
    cargo: 'SST_CULTURA',
    company: 'TYM',
    allowedAreas: ['sst-cultura']
};

const sst_tat = {
    username: 'sst_tat',
    name: 'Salud y Cultura · TAT',
    role: 'Analista',
    cargo: 'SST_CULTURA',
    company: 'TAT',
    allowedAreas: ['sst-cultura']
};

function testUser(user) {
    console.log(`=== Testing for ${user.username} (${user.company}) ===`);
    const companyKPIsRaw = filterKPIsByEntity(kpiData, user.company);
    console.log(`Total companyKPIsRaw: ${companyKPIsRaw.length}`);
    
    const userAreas = user.authorizedAreas || user.allowedAreas || [];
    const myAccessKPIs = companyKPIsRaw.filter(kpi => {
        const effectiveResponsable = getKPIResponsable(kpi, user);
        return (userAreas.includes('all') ||
            userAreas.includes(kpi.area) ||
            kpi.visibleEnAreas?.some(a => userAreas.includes(a)) ||
            effectiveResponsable === user.cargo) &&
            kpi.isAutoFeed !== true;
    });
    console.log(`myAccessKPIs count: ${myAccessKPIs.length}`);
    myAccessKPIs.forEach(k => {
        const effectiveResponsable = getKPIResponsable(k, user);
        console.log(`  - KPI: ${k.id} (${k.name}) | Area: ${k.area} | Resp: ${effectiveResponsable} (user: ${user.cargo}) | Meta:`, k.meta);
        const effectiveBrands = getEntityBrands(k, user.company);
        console.log(`    EffectiveBrands:`, effectiveBrands);
    });

    const pendingKPIs = myAccessKPIs.filter(k => {
        const effectiveResponsable = getKPIResponsable(k, user);
        if (effectiveResponsable !== user.cargo) return false;

        if (!k.meta || typeof k.meta !== 'object') {
            return !k.hasData;
        }

        const effectiveBrands = getEntityBrands(k, user.company);
        if (effectiveBrands.length === 0) {
            return !k.hasData;
        }

        const currentPeriodKey = getCurrentPeriodKey(k.frecuencia);
        return effectiveBrands.some(brand => {
            const dataKey = `${user.company}-${brand}`;
            const brandData = k.brandValues?.[dataKey];
            const storedPeriod = brandData?.additionalData?.period || '';
            const storedMonthKey = storedPeriod.substring(0, 7).match(/^\d{4}-\d{2}$/)
                ? storedPeriod.substring(0, 7)
                : storedPeriod;
            const hasCurrent = brandData?.hasData === true &&
                (storedPeriod === currentPeriodKey || storedMonthKey === currentPeriodKey);
            return !hasCurrent;
        });
    });

    console.log(`pendingKPIs count: ${pendingKPIs.length}`);
}

testUser(sst_tym);
testUser(sst_tat);
