const { createClient } = require('@supabase/supabase-js');
const { kpiDefinitions } = require('../src/data/kpiData.js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BRAND_TO_ENTITY = {
    'ALPINA': 'TYM',
    'ZENU': 'TYM',
    'FLEISCHMANN': 'TYM',
    'UNILEVER': 'TAT',
    'FAMILIA': 'TAT',
    'TYM': 'TYM',
    'TAT': 'TAT'
};

function getPeriodForKPI(kpi) {
    const freq = (kpi.frecuencia || 'MENSUAL').toUpperCase();
    if (freq.includes('DIARI')) return '2026-07-31';
    if (freq.includes('SEMANAL')) return '2026-W30';
    if (freq.includes('QUINCENAL')) return '2026-07-Q2';
    return '2026-07';
}

function getAdditionalDataAndValue(kpiId, brand, company) {
    let ad = { brand, company };
    let val = 0;

    switch (kpiId) {
        case 'promedio-pedidos-auxiliar':
            if (brand === 'ALPINA') { ad.numeroPedidos = 520; ad.auxiliares = 10; val = 52; }
            else if (brand === 'ZENU') { ad.numeroPedidos = 820; ad.auxiliares = 10; val = 82; }
            else { ad.numeroPedidos = 790; ad.auxiliares = 10; val = 79; }
            break;
        case 'promedio-pedidos-carro':
            if (brand === 'ALPINA') { ad.numeroPedidos = 660; ad.vehiculos = 10; val = 66; }
            else if (brand === 'ZENU') { ad.numeroPedidos = 810; ad.vehiculos = 10; val = 81; }
            else { ad.numeroPedidos = 790; ad.vehiculos = 10; val = 79; }
            break;
        case 'gasto-nomina-venta':
            ad.nominaLogistica = 32000000; ad.ventaTotal = 1000000000; val = 3.2;
            break;
        case 'gasto-fletes-venta':
            if (brand === 'ALPINA' || brand === 'FLEISCHMANN') { ad.valorFletes = 42000000; ad.ventaTotal = 1000000000; val = 4.2; }
            else if (brand === 'ZENU') { ad.valorFletes = 31000000; ad.ventaTotal = 1000000000; val = 3.1; }
            else { ad.valorFletes = 39000000; ad.ventaTotal = 1000000000; val = 3.9; }
            break;
        case 'horas-extras-auxiliares':
            ad.totalHorasExtras = 30; ad.auxiliares = 10; val = 0.12;
            break;
        case 'segundos-unidad-separada':
            ad.segundosUtilizados = 75; ad.unidadesSeparadas = 10; val = 7.5;
            break;
        case 'pesos-separados-hombre':
            ad.valorVenta = 2200000000; ad.auxiliaresSeparacion = 10; val = 220000000;
            break;
        case 'pedidos-separar-total':
            ad.pedidosSeparados = 1000; ad.pedidosFacturados = 1000; val = 100;
            break;
        case 'notas-errores-venta':
            ad.notasDevolucion = 8000000; ad.valorVenta = 1000000000; val = 0.8;
            break;
        case 'planillas-separadas':
            ad.planillasSeparadas = 50; ad.planillasGeneradas = 50; val = 100;
            break;
        case 'nomina-venta-picking':
            ad.valorNomina = 9000000; ad.ventaTotal = 1000000000; val = 0.9;
            break;
        case 'horas-extras-venta-picking':
            ad.horasExtras = 8000000; ad.ventaTotal = 1000000000; val = 0.8;
            break;
        case 'embalajes-perdidos':
            ad.canastillasRecibidas = 500; ad.canastillasGestionadas = 500; val = 0;
            break;
        case 'nomina-compra-deposito':
            ad.valorNomina = 3600000; ad.ventaTotal = 1000000000; val = 0.36;
            break;
        case 'horas-extras-venta-deposito':
            ad.horasExtras = 7500000; ad.ventaTotal = 1000000000; val = 0.75;
            break;
        case 'rotacion-personal':
            ad.personalRetirado = 1; ad.promedioEmpleados = 50; val = 2;
            break;
        case 'ausentismo':
            ad.diasPerdidos = 2; ad.diasLaborados = 100; val = 2;
            break;
        case 'calificacion-auditoria':
            ad.actividadesEjecutadas = 94; ad.actividadesProgramadas = 100; val = 94;
            break;
        case 'he-rn-nomina':
            ad.valorHEDHEN = 2500000; ad.totalNomina = 100000000; val = 2.5;
            break;
        case 'gasto-nomina-venta-rrhh':
            ad.valorNomina = 102000000; ad.ventaTotal = 1000000000; val = 10.2;
            break;
        case 'actividades-cultura':
            ad.actividadesEjecutadas = 10; ad.actividadesProgramadas = 10; val = 100;
            break;
        case 'tiempo-contratacion':
            ad.diasVacante = 7; val = 7;
            break;
        case 'arqueos-realizados':
            ad.arqueosRealizados = 4; ad.arqueosProgramados = 4; val = 100;
            break;
        case 'indice-arqueo-caja':
            ad.currentValue = 0; val = 0;
            break;
        case 'planillas-cerradas':
            ad.planillasCerradas = 50; ad.planillasGeneradas = 50; val = 100;
            break;
        case 'vales-descuadres':
            ad.valorVales = 200000; ad.totalCuadreCaja = 50000000; val = 0.4;
            break;
        case 'cartera-no-vencida':
            ad.totalCarteraVencida = 80000000; ad.totalVenta = 1000000000; val = 8;
            break;
        case 'cartera-mayor-30':
            ad.totalMayor30 = 12000000; ad.totalCartera = 300000000; val = 4;
            break;
        case 'recircularizaciones':
            ad.efectuadas = 2; ad.programadas = 2; val = 100;
            break;
        case 'valor-cartera-venta':
            if (company === 'TAT') { ad.carteraTotal = 180000000; ad.ventaTotal = 1000000000; val = 18; }
            else { ad.carteraTotal = 85000000; ad.ventaTotal = 1000000000; val = 8.5; }
            break;
        case 'dias-cierre':
            ad.totalDiasCierre = 10; val = 10;
            break;
        case 'ajustes-posteriores':
            ad.ajustesPosteriores = 1; val = 1;
            break;
        case 'ajustes-revisoria':
            ad.ajustesRevisor = 1; val = 1;
            break;
        case 'rotacion-cxc':
            ad.ventasCredito = 300000000; ad.cxcInicial = 200000000; ad.cxcFinal = 200000000; val = 1.5;
            break;
        case 'rotacion-cxp':
            ad.comprasCredito = 300000000; ad.cxpInicial = 200000000; ad.cxpFinal = 200000000; val = 1.5;
            break;
        case 'conciliaciones-bancarias':
            ad.conciliacionesRealizadas = 8; ad.conciliacionesRequeridas = 8; val = 100;
            break;
        case 'conciliaciones-diarias':
            ad.conciliacionesSistema = 30; ad.conciliacionesBanco = 30; val = 100;
            break;
        case 'activos-conciliados':
            ad.activosConciliados = 96; ad.activosRegistrados = 100; val = 96;
            break;
        case 'multas-sanciones':
            ad.multasSanciones = 50000; ad.ingreso = 100000000; val = 0.05;
            break;
        case 'optimizacion-tributaria':
            ad.impuestosOptimizados = 0; ad.totalImpuestos = 10000000; val = 0;
            break;
        case 'venta-realizada-esperada':
            ad.ventaRealizada = 1020000000; ad.presupuestoVenta = 1000000000; val = 102;
            break;
        case 'primer-margen':
            if (brand === 'ALPINA') { ad.ventas = 1000000000; ad.costoVentas = 870000000; val = 13; }
            else if (brand === 'UNILEVER') { ad.ventas = 1000000000; ad.costoVentas = 910000000; val = 9; }
            else { ad.ventas = 1000000000; ad.costoVentas = 890000000; val = 11; }
            break;
        case 'devoluciones-buen-estado':
            ad.devolucionBuenEstado = 15000000; ad.ventaTotal = 1000000000; val = 1.5;
            break;
        case 'devoluciones-mal-estado-comercial':
            ad.devolucionMalEstado = 4000000; ad.ventaTotal = 1000000000; val = 0.4;
            break;
        case 'promedio-venta-vendedor':
            if (brand === 'ALPINA') { ad.ventasTotales = 630000000; ad.numeroVendedores = 10; val = 63000000; }
            else if (brand === 'UNILEVER') { ad.ventasTotales = 580000000; ad.numeroVendedores = 10; val = 58000000; }
            else { ad.ventasTotales = 520000000; ad.numeroVendedores = 10; val = 52000000; }
            break;
        case 'participacion-venta-credito':
            ad.ventaCredito = 90000000; ad.ventaTotal = 1000000000; val = 9;
            break;
        case 'cobro-optimo-cartera':
            ad.carteraVencida = 75000000; ad.totalCartera = 100000000; val = 75;
            break;
        case 'rotacion-equipo-comercial':
            ad.personalRetirado = 1; ad.promedioEmpleados = 40; val = 2.5;
            break;
        case 'gasto-personal-comercial':
            ad.gastosPersonal = 45000000; ad.ventaTotal = 1000000000; val = 4.5;
            break;
        case 'gasto-viaje-comercial':
            ad.gastosViaje = 1800000; ad.ventaTotal = 1000000000; val = 0.18;
            break;
        case 'dias-inventario-comercial':
            if (brand === 'UNILEVER') { ad.diasInventario = 42; val = 42; }
            else if (brand === 'FAMILIA') { ad.diasInventario = 16; val = 16; }
            else { ad.diasInventario = 6; val = 6; }
            break;
        case 'inventarios-realizados':
            ad.inventariosRealizados = 2; val = 2;
            break;
        case 'fiabilidad-inventarios':
            ad.valorVerificado = 100000000; ad.valorCorrecto = 100000000; val = 100;
            break;
        case 'quiebres-inventario':
            ad.quiebres = 0; ad.totalSku = 500; val = 0;
            break;
        case 'obsolescencia':
            ad.inventarioObsoleto = 0; ad.inventarioTotal = 500000000; val = 0;
            break;
        case 'mermas':
            ad.valorMermas = 0; ad.inventarioTotal = 500000000; val = 0;
            break;
        case 'revision-margenes':
        case 'revision-precios':
            ad.revisionesEjecutadas = 10; ad.revisionesProgramadas = 10; val = 100;
            break;
        case 'pedidos-devueltos':
            ad.pedidosDevueltos = 15; ad.pedidosFacturados = 1000; val = 1.5;
            break;
        case 'averias-venta':
            ad.totalAverias = 1800000; ad.ventaTotal = 1000000000; val = 0.18;
            break;
        case 'pedidos-facturados':
            ad.facturas = 1000; ad.pedidos = 1000; val = 100;
            break;
        case 'impresion-facturas':
            ad.facturasImpresas = 1000; ad.facturasGeneradas = 1000; val = 100;
            break;
        case 'error-facturacion':
            ad.errores = 3; ad.facturas = 1000; val = 0.3;
            break;
        case 'tareas-programadas':
            ad.tareasEjecutadas = 20; ad.tareasProgramadas = 20; val = 100;
            break;
        case 'mantenimiento-equipos':
            ad.currentValue = 3; val = 3;
            break;
        case 'resolucion-incidencias':
            ad.totalIncidencias = 20; ad.incidenciasRecurrentes = 0; val = 100;
            break;
        default:
            val = 100;
            break;
    }

    return { additionalData: ad, value: val };
}

async function seedJulio() {
    console.log('🌱 Seed script para Julio 2026 ejecutado.');
    const recordsToInsert = [];
    const timestampJulio = '2026-07-31T18:00:00.000Z';

    for (const kpi of kpiDefinitions) {
        const periodKey = getPeriodForKPI(kpi);
        const metaObj = kpi.meta;

        let brandEntries = [];
        if (metaObj && typeof metaObj === 'object') {
            const keys = Object.keys(metaObj);
            keys.forEach(k => {
                const company = BRAND_TO_ENTITY[k] || (k === 'TAT' ? 'TAT' : 'TYM');
                brandEntries.push({ brand: k, company });
            });
        } else {
            brandEntries.push({ brand: 'Global', company: 'TYM' });
            brandEntries.push({ brand: 'Global', company: 'TAT' });
        }

        for (const entry of brandEntries) {
            const { additionalData, value } = getAdditionalDataAndValue(kpi.id, entry.brand, entry.company);
            const fullAdditionalData = {
                ...additionalData,
                period: periodKey,
                updatedAt: timestampJulio,
                periodSelectedByUser: true
            };

            recordsToInsert.push({
                company_id: entry.company,
                kpi_id: kpi.id,
                value: value,
                additional_data: fullAdditionalData,
                cargo: 'Analista de Información',
                updated_at: timestampJulio
            });
        }
    }

    const batchSize = 50;
    for (let i = 0; i < recordsToInsert.length; i += batchSize) {
        const batch = recordsToInsert.slice(i, i + batchSize);
        await supabase.from('kpi_updates').insert(batch);
    }
    console.log('✅ Seed completado.');
}

seedJulio();
