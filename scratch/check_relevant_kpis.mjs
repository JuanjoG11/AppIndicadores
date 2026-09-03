import { kpiDefinitions } from '../src/data/kpiData.js';

const relevant = kpiDefinitions.filter(k => 
    k.area === 'comercial' || 
    k.area === 'administrativo' || 
    k.responsable?.toUpperCase().includes('COMERCIAL') ||
    k.responsable?.toUpperCase().includes('INFORMACIÓN') ||
    k.responsable?.toUpperCase().includes('INFORMACION')
);

console.log(`Found ${relevant.length} KPIs:`);
relevant.forEach(k => {
    console.log(`- id: ${k.id.padEnd(35)} | area: ${k.area.padEnd(15)} | responsable: ${k.responsable.padEnd(25)} | freq: ${k.frecuencia}`);
});
