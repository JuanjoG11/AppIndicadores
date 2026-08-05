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

function getJulyPeriod(kpi) {
    const freq = (kpi.frecuencia || 'MENSUAL').toUpperCase();
    if (freq.includes('DIARI')) return '2026-07-31';
    if (freq.includes('SEMANAL')) return '2026-W30';
    if (freq.includes('QUINCENAL')) return '2026-07-Q2';
    return '2026-07';
}

function getAugustPeriod(kpi) {
    const freq = (kpi.frecuencia || 'MENSUAL').toUpperCase();
    if (freq.includes('DIARI')) return '2026-08-05';
    if (freq.includes('SEMANAL')) return '2026-W32';
    if (freq.includes('QUINCENAL')) return '2026-08-Q1';
    return '2026-08';
}

// Genera datos para Julio (FULL 98-100%)
function getJulyDataAndValue(kpiId, brand, company) {
    let ad = { brand, company };
    let val = 0;

    switch (kpiId) {
        // LOGÍSTICA DE ENTREGA
        case 'promedio-pedidos-auxiliar':
            if (brand === 'ALPINA') { ad.numeroPedidos = 530; ad.auxiliares = 10; val = 53; }
            else if (brand === 'ZENU') { ad.numeroPedidos = 840; ad.auxiliares = 10; val = 84; }
            else { ad.numeroPedidos = 830; ad.auxiliares = 10; val = 83; }
            break;
        case 'promedio-pedidos-carro':
            if (brand === 'ALPINA') { ad.numeroPedidos = 680; ad.vehiculos = 10; val = 68; }
            else if (brand === 'ZENU') { ad.numeroPedidos = 840; ad.vehiculos = 10; val = 84; }
            else { ad.numeroPedidos = 830; ad.vehiculos = 10; val = 83; }
            break;
        case 'gasto-nomina-venta':
            ad.nominaLogistica = 28000000; ad.ventaTotal = 1000000000; val = 2.8;
            break;
        case 'gasto-fletes-venta':
            ad.valorFletes = 28000000; ad.ventaTotal = 1000000000; val = 2.8;
            break;
        case 'horas-extras-auxiliares':
            ad.totalHorasExtras = 10; ad.auxiliares = 10; val = 0.04;
            break;
        case 'segundos-unidad-separada':
            ad.segundosUtilizados = 60; ad.unidadesSeparadas = 10; val = 6.0;
            break;
        case 'pesos-separados-hombre':
            ad.valorVenta = 2300000000; ad.auxiliaresSeparacion = 10; val = 230000000;
            break;
        case 'pedidos-separar-total':
            ad.pedidosSeparados = 1000; ad.pedidosFacturados = 1000; val = 100;
            break;
        case 'notas-errores-venta':
            ad.notasDevolucion = 4000000; ad.valorVenta = 1000000000; val = 0.4;
            break;
        case 'planillas-separadas':
            ad.planillasSeparadas = 50; ad.planillasGeneradas = 50; val = 100;
            break;
        case 'nomina-venta-picking':
            ad.valorNomina = 7000000; ad.ventaTotal = 1000000000; val = 0.7;
            break;
        case 'horas-extras-venta-picking':
            ad.horasExtras = 4000000; ad.ventaTotal = 1000000000; val = 0.4;
            break;
        case 'embalajes-perdidos':
            ad.canastillasRecibidas = 500; ad.canastillasGestionadas = 500; val = 0;
            break;
        case 'nomina-compra-deposito':
            ad.valorNomina = 2800000; ad.ventaTotal = 1000000000; val = 0.28;
            break;
        case 'horas-extras-venta-deposito':
            ad.horasExtras = 4000000; ad.ventaTotal = 1000000000; val = 0.4;
            break;

        // Devoluciones/Averías
        case 'pedidos-devueltos':
            ad.pedidosDevueltos = 8; ad.pedidosFacturados = 1000; val = 0.8;
            break;
        case 'averias-venta':
            ad.totalAverias = 800000; ad.ventaTotal = 1000000000; val = 0.08;
            break;

        // TALENTO HUMANO & SST
        case 'rotacion-personal':
            ad.personalRetirado = 1; ad.promedioEmpleados = 50; val = 2.0;
            break;
        case 'ausentismo':
            ad.diasPerdidos = 1; ad.diasLaborados = 100; val = 1.0;
            break;
        case 'calificacion-auditoria':
            ad.actividadesEjecutadas = 98; ad.actividadesProgramadas = 100; val = 98;
            break;
        case 'he-rn-nomina':
            ad.valorHEDHEN = 1500000; ad.totalNomina = 100000000; val = 1.5;
            break;
        case 'gasto-nomina-venta-rrhh':
            ad.valorNomina = 85000000; ad.ventaTotal = 1000000000; val = 8.5;
            break;
        case 'actividades-cultura':
            ad.actividadesEjecutadas = 10; ad.actividadesProgramadas = 10; val = 100;
            break;
        case 'tiempo-contratacion':
            ad.diasVacante = 4; val = 4;
            break;

        // CAJA
        case 'arqueos-realizados':
            ad.arqueosRealizados = 4; ad.arqueosProgramados = 4; val = 4;
            break;
        case 'indice-arqueo-caja':
            ad.currentValue = 0; val = 0;
            break;
        case 'planillas-cerradas':
            ad.planillasCerradas = 50; ad.planillasGeneradas = 50; val = 100;
            break;
        case 'vales-descuadres':
            ad.valorVales = 0; ad.totalCuadreCaja = 50000000; val = 0;
            break;

        // CARTERA
        case 'cartera-no-vencida':
            ad.totalCarteraVencida = 30000000; ad.totalVenta = 1000000000; val = 3.0;
            break;
        case 'cartera-mayor-30':
            ad.totalMayor30 = 3000000; ad.totalCartera = 300000000; val = 1.0;
            break;
        case 'recircularizaciones':
            ad.efectuadas = 2; ad.programadas = 2; val = 100;
            break;
        case 'valor-cartera-venta':
            if (company === 'TAT') { ad.carteraTotal = 100000000; ad.ventaTotal = 1000000000; val = 10; }
            else { ad.carteraTotal = 40000000; ad.ventaTotal = 1000000000; val = 4.0; }
            break;

        // CONTABILIDAD
        case 'dias-cierre':
            ad.totalDiasCierre = 8; val = 8;
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
            ad.activosConciliados = 99; ad.activosRegistrados = 100; val = 99;
            break;
        case 'multas-sanciones':
            ad.multasSanciones = 0; ad.ingreso = 100000000; val = 0;
            break;
        case 'optimizacion-tributaria':
            ad.impuestosOptimizados = 10; ad.totalImpuestos = 10; val = 100;
            break;

        // COMERCIAL
        case 'venta-realizada-esperada':
            ad.ventaRealizada = 1060000000; ad.presupuestoVenta = 1000000000; val = 106;
            break;
        case 'primer-margen':
            if (brand === 'ALPINA') { ad.ventas = 1000000000; ad.costoVentas = 840000000; val = 16; }
            else if (brand === 'UNILEVER') { ad.ventas = 1000000000; ad.costoVentas = 870000000; val = 13; }
            else { ad.ventas = 1000000000; ad.costoVentas = 860000000; val = 14; }
            break;
        case 'devoluciones-buen-estado':
            ad.devolucionBuenEstado = 8000000; ad.ventaTotal = 1000000000; val = 0.8;
            break;
        case 'devoluciones-mal-estado-comercial':
            ad.devolucionMalEstado = 1500000; ad.ventaTotal = 1000000000; val = 0.15;
            break;
        case 'promedio-venta-vendedor':
            if (brand === 'ALPINA') { ad.ventasTotales = 680000000; ad.numeroVendedores = 10; val = 68000000; }
            else if (brand === 'UNILEVER') { ad.ventasTotales = 630000000; ad.numeroVendedores = 10; val = 63000000; }
            else { ad.ventasTotales = 590000000; ad.numeroVendedores = 10; val = 59000000; }
            break;
        case 'participacion-venta-credito':
            ad.ventaCredito = 40000000; ad.ventaTotal = 1000000000; val = 4.0;
            break;
        case 'cobro-optimo-cartera':
            ad.carteraVencida = 40000000; ad.totalCartera = 100000000; val = 40;
            break;
        case 'rotacion-equipo-comercial':
            ad.personalRetirado = 1; ad.promedioEmpleados = 50; val = 2.0;
            break;
        case 'gasto-personal-comercial':
            ad.gastosPersonal = 30000000; ad.ventaTotal = 1000000000; val = 3.0;
            break;
        case 'gasto-viaje-comercial':
            ad.gastosViaje = 1000000; ad.ventaTotal = 1000000000; val = 0.10;
            break;
        case 'dias-inventario-comercial':
            ad.diasInventario = 5; val = 5;
            break;

        // INVENTARIOS & FACTURACIÓN & TI
        case 'inventarios-realizados':
            ad.inventariosRealizados = 10; val = 10;
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
        case 'pedidos-facturados':
            ad.facturas = 1000; ad.pedidos = 1000; val = 100;
            break;
        case 'impresion-facturas':
            ad.facturasImpresas = 1000; ad.facturasGeneradas = 1000; val = 100;
            break;
        case 'error-facturacion':
            ad.errores = 0; ad.facturas = 1000; val = 0;
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

// Genera datos para Agosto (PROMEDIO GLOBAL ~90.0% DE CUMPLIMIENTO)
function getAugustDataAndValue(kpiId, brand, company) {
    const base = getJulyDataAndValue(kpiId, brand, company);
    let ad = { ...base.additionalData };
    let val = base.value;

    switch (kpiId) {
        // Logística
        case 'promedio-pedidos-auxiliar':
            val = brand === 'ALPINA' ? 36 : 60;
            break;
        case 'promedio-pedidos-carro':
            val = brand === 'ALPINA' ? 48 : 60;
            break;
        case 'gasto-nomina-venta':
            ad.nominaLogistica = 42000000; val = 4.2;
            break;
        case 'gasto-fletes-venta':
            ad.valorFletes = 55000000; val = 5.5;
            break;
        case 'horas-extras-auxiliares':
            ad.totalHorasExtras = 50; val = 0.20;
            break;
        case 'segundos-unidad-separada':
            ad.segundosUtilizados = 80; val = 8.0;
            break;
        case 'pesos-separados-hombre':
            ad.valorVenta = 1600000000; val = 160000000; // 70%
            break;
        case 'pedidos-separar-total':
            ad.pedidosSeparados = 850; val = 85; // 85%
            break;
        case 'planillas-separadas':
            ad.planillasSeparadas = 42; val = 84; // 84%
            break;
        case 'notas-errores-venta':
            ad.notasDevolucion = 15000000; val = 1.5;
            break;

        // Devoluciones / TH
        case 'pedidos-devueltos':
            ad.pedidosDevueltos = 30; val = 3.0;
            break;
        case 'averias-venta':
            ad.totalAverias = 2500000; val = 0.25;
            break;
        case 'rotacion-personal':
            ad.personalRetirado = 3; val = 6.0;
            break;
        case 'ausentismo':
            ad.diasPerdidos = 4; val = 4.0;
            break;
        case 'calificacion-auditoria':
            ad.actividadesEjecutadas = 85; val = 85;
            break;
        case 'he-rn-nomina':
            ad.valorHEDHEN = 3000000; val = 3.0;
            break;
        case 'gasto-nomina-venta-rrhh':
            ad.valorNomina = 120000000; val = 12.0; // 70%
            break;
        case 'actividades-cultura':
            ad.actividadesEjecutadas = 7; val = 70; // 70%
            break;
        case 'tiempo-contratacion':
            ad.diasVacante = 8; val = 8; // 50%
            break;

        // Comercial / Cartera
        case 'venta-realizada-esperada':
            ad.ventaRealizada = 880000000; val = 88;
            break;
        case 'primer-margen':
            val = brand === 'ALPINA' ? 12 : 10;
            break;
        case 'devoluciones-buen-estado':
            ad.devolucionBuenEstado = 16000000; val = 1.6; // 50%
            break;
        case 'devoluciones-mal-estado-comercial':
            ad.devolucionMalEstado = 4000000; val = 0.4; // 37%
            break;
        case 'promedio-venta-vendedor':
            val = brand === 'ALPINA' ? 52000000 : 45000000;
            break;
        case 'participacion-venta-credito':
            val = 6.0;
            break;
        case 'cobro-optimo-cartera':
            val = 55;
            break;
        case 'rotacion-equipo-comercial':
            val = 4.0;
            break;
        case 'cartera-mayor-30':
            val = 4.0;
            break;
        case 'cartera-no-vencida':
            val = 6.0;
            break;

        // Contabilidad / Inventarios / Facturación / TI
        case 'dias-cierre':
            val = 11;
            break;
        case 'rotacion-cxc':
            val = 2.2;
            break;
        case 'rotacion-cxp':
            val = 2.2;
            break;
        case 'activos-conciliados':
            ad.activosConciliados = 88; val = 88;
            break;
        case 'fiabilidad-inventarios':
            ad.valorVerificado = 90000000; val = 90; // 90%
            break;
        case 'inventarios-realizados':
            ad.inventariosRealizados = 8; val = 8; // 80%
            break;
        case 'pedidos-facturados':
            ad.facturas = 900; val = 90; // 90%
            break;
        case 'impresion-facturas':
            ad.facturasImpresas = 900; val = 90; // 90%
            break;
        case 'tareas-programadas':
            ad.tareasEjecutadas = 17; val = 85; // 85%
            break;

        default:
            break;
    }

    return { additionalData: ad, value: val };
}

async function seedCleanJulyAndAugust() {
    console.log("🧹 Borrando registros antiguos...");
    const { error: delError } = await supabase
        .from('kpi_updates')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (delError) {
        console.error("❌ Error al limpiar base de datos:", delError.message);
        return;
    }
    console.log("✅ Base de datos limpiada correctamente.");

    const timestampNow = new Date().toISOString();
    const recordsToInsert = [];

    for (const kpi of kpiDefinitions) {
        const julyPeriod = getJulyPeriod(kpi);
        const augustPeriod = getAugustPeriod(kpi);
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
            // Registros de JULIO (FULL 98-100%)
            const julyData = getJulyDataAndValue(kpi.id, entry.brand, entry.company);
            recordsToInsert.push({
                company_id: entry.company,
                kpi_id: kpi.id,
                value: julyData.value,
                additional_data: {
                    ...julyData.additionalData,
                    period: julyPeriod,
                    updatedAt: timestampNow,
                    periodSelectedByUser: true
                },
                cargo: 'Analista de Información',
                updated_at: timestampNow
            });

            // Registros de AGOSTO (AL 90%)
            const augustData = getAugustDataAndValue(kpi.id, entry.brand, entry.company);
            recordsToInsert.push({
                company_id: entry.company,
                kpi_id: kpi.id,
                value: augustData.value,
                additional_data: {
                    ...augustData.additionalData,
                    period: augustPeriod,
                    updatedAt: timestampNow,
                    periodSelectedByUser: true
                },
                cargo: 'Analista de Información',
                updated_at: timestampNow
            });
        }
    }

    console.log(`📦 Insertando ${recordsToInsert.length} registros limpios (Julio FULL + Agosto 90%)...`);
    
    const batchSize = 100;
    let totalInserted = 0;
    for (let i = 0; i < recordsToInsert.length; i += batchSize) {
        const batch = recordsToInsert.slice(i, i + batchSize);
        const { error } = await supabase.from('kpi_updates').insert(batch);
        if (error) {
            console.error(`❌ Error en lote ${i}:`, error.message);
        } else {
            totalInserted += batch.length;
        }
    }
    
    console.log(`🎉 Insertados ${totalInserted} registros limpios con éxito.`);
}

seedCleanJulyAndAugust().catch(console.error);
