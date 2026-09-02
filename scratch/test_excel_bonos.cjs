const { kpiDefinitions } = require('../src/data/kpiData.js');

console.log('🔍 Verificando estructura de KPIs y mapa de bonificaciones para Excel...');
console.log(`Total KPIs en kpiDefinitions: ${kpiDefinitions.length}`);

// Simular el cálculo de bonificaciones
const PERSONAS = [
    { nombre: 'David Aguirre', cargo: 'Líder Logístico', kpiIds: ['indice-devoluciones','promedio-pedidos-auxiliar','promedio-pedidos-carro','gasto-fletes-venta'], company: 'TYM' },
    { nombre: 'Carlos Enrique Díaz', cargo: 'Auxiliar de Facturación', kpiIds: ['impresion-facturas','error-facturacion','pedidos-facturados'], company: 'TYM' },
    { nombre: 'Anyi Mosquera', cargo: 'Analista de Abastecimientos', kpiIds: ['revision-precios','fiabilidad-inventarios','revision-margenes','exactitud-inventarios'], company: 'TYM' },
];

PERSONAS.forEach(p => {
    const totalKpis = p.kpiIds.length;
    const unitario = totalKpis >= 4 ? 75000 : 100000;
    const maxBono = totalKpis * unitario;
    console.log(`👤 ${p.nombre} (${p.cargo}): ${totalKpis} KPIs -> $${unitario.toLocaleString()} c/u (Máx bono: $${maxBono.toLocaleString()})`);
});
