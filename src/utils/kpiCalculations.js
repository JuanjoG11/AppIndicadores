/**
 * Centralized logic for KPI calculations
 */

export const calculateKPIValue = (kpiId, d) => {
  if (!d) return 0;

  let newValue = 0;

  try {
    switch (kpiId) {
      // LOGÍSTICA DE ENTREGA
      case 'pedidos-devueltos':
        newValue = (d.pedidosDevueltos / d.pedidosFacturados) * 100;
        break;
      case 'promedio-pedidos-auxiliar':
        newValue = d.numeroPedidos / d.auxiliares;
        break;
      case 'promedio-pedidos-carro':
        newValue = d.numeroPedidos / d.vehiculos;
        break;
      case 'gasto-nomina-venta':
        newValue = (d.nominaLogistica / d.ventaTotal) * 100;
        break;
      case 'gasto-fletes-venta':
        newValue = (d.valorFletes / d.ventaTotal) * 100;
        break;
      case 'horas-extras-auxiliares':
        newValue = (d.totalHorasExtras / d.auxiliares) / 25;
        break;

      // COMERCIAL
      case 'primer-margen':
        newValue = ((d.ventas - d.costoVentas) / d.ventas) * 100;
        break;
      case 'devoluciones-mal-estado':
      case 'devoluciones-mal-estado-comercial':
        newValue = (d.valorDevolucion || d.devolucionMalEstado / d.ventaTotal) * 100;
        if (d.devolucionMalEstado && d.ventaTotal) newValue = (d.devolucionMalEstado / d.ventaTotal) * 100;
        break;
      case 'devoluciones-buen-estado':
        newValue = (d.devolucionBuenEstado / d.ventaTotal) * 100;
        break;
      case 'promedio-venta-vendedor':
        newValue = d.ventasTotales / d.numeroVendedores;
        break;
      case 'venta-credito-total':
      case 'participacion-venta-credito':
        newValue = (d.ventaCredito / d.ventaTotal) * 100;
        break;
      case 'venta-realizada-esperada':
        newValue = (d.ventaRealizada / d.presupuestoVenta) * 100;
        break;
      case 'cobro-optimo-cartera':
        newValue = (d.carteraVencida / d.totalCartera) * 100;
        break;
      case 'rotacion-equipo-comercial':
        newValue = (d.personalRetirado / d.promedioEmpleados) * 100;
        break;
      case 'gasto-personal-comercial':
        newValue = (d.gastosPersonal / d.ventaTotal) * 100;
        break;
      case 'gasto-viaje-comercial':
        newValue = (d.gastosViaje / d.ventaTotal) * 100;
        break;

      case 'dias-inventario-comercial':
        newValue = (d.diasInventario / d.metaInventario) * 100;
        break;

      // CAJA / ARQUEOS
      case 'arqueos-realizados':
        newValue = (d.arqueosRealizados / d.arqueosProgramados) * 100;
        break;
      case 'indice-arqueo-caja':
        newValue = parseFloat(d.currentValue || 0);
        break;

      // CARTERA / CONTABILIDAD
      case 'cartera-vencida-total':
        newValue = (d.carteraVencida / d.totalCartera) * 100;
        break;
      case 'cartera-no-vencida':
        // Some forms use different fields, we prefer d.carteraNoVencida if available
        if (d.carteraNoVencida) newValue = (d.carteraNoVencida / d.carteraTotal) * 100;
        else newValue = (d.totalCarteraVencida / d.totalVenta) * 100;
        break;
      case 'cartera-11-30':
        if (d.cartera1130) newValue = (d.cartera1130 / d.carteraTotal) * 100;
        else newValue = (d.totalCartera1130 / d.totalCartera) * 100;
        break;
      case 'cartera-31-45':
        newValue = (d.totalCartera3145 / d.totalCartera) * 100;
        break;
      case 'cartera-mayor-30':
        newValue = (d.totalMayor30 / d.totalCartera) * 100;
        break;
      case 'valor-cartera-venta':
        newValue = (d.carteraTotal || d.ventaCredito) / d.ventaTotal * 100;
        break;
      case 'notas-errores-venta':
        newValue = (d.notasDevolucion / d.valorVenta) * 100;
        break;
      case 'fiabilidad-inventarios':
        newValue = (d.valorCorrecto / d.valorVerificado) * 100;
        break;
      case 'quiebres-inventario':
        newValue = (d.quiebres / d.totalSku) * 100;
        break;
      case 'obsolescencia':
        newValue = (d.inventarioObsoleto / d.inventarioTotal) * 100;
        break;
      case 'mermas':
        newValue = (d.valorMermas / d.inventarioTotal) * 100;
        break;
      case 'diferencia-inventarios':
        newValue = d.diferenciaFisica - d.valorInventario;
        break;
      case 'revision-margenes':
      case 'revision-precios':
        newValue = (d.revisionesEjecutadas / d.revisionesProgramadas) * 100;
        break;

      // PICKING
      case 'segundos-unidad-separada':
        newValue = d.segundosUtilizados / d.unidadesSeparadas;
        break;
      case 'pesos-separados-hombre':
        newValue = d.valorVenta / d.auxiliaresSeparacion;
        break;
      case 'pedidos-separar-total':
        newValue = (d.pedidosSeparados / d.pedidosFacturados) * 100;
        break;
      case 'planillas-separadas':
        newValue = (d.planillasSeparadas / d.planillasGeneradas) * 100;
        break;
      case 'nomina-venta-picking':
        newValue = (d.valorNomina / d.ventaTotal) * 100;
        break;
      case 'horas-extras-venta-picking':
        newValue = (d.horasExtras / d.ventaTotal) * 100;
        break;

      // DEPÓSITO
      case 'embalajes-perdidos':
        newValue = d.canastillasRecibidas - d.canastillasGestionadas;
        break;
      case 'nomina-compra-deposito':
        newValue = (d.valorNomina / d.ventaTotal) * 100;
        break;
      case 'horas-extras-venta-deposito':
        newValue = (d.horasExtras / d.ventaTotal) * 100;
        break;
      case 'averias-venta':
        newValue = (d.totalAverias / d.ventaTotal) * 100;
        break;

      // TALENTO HUMANO
      case 'rotacion-personal':
        newValue = (d.personalRetirado / d.promedioEmpleados) * 100;
        break;
      case 'ausentismo':
        newValue = (d.diasPerdidos / d.diasLaborados) * 100;
        break;
      case 'calificacion-auditoria':
      case 'actividades-cultura':
        newValue = (d.actividadesEjecutadas / d.actividadesProgramadas) * 100;
        break;
      case 'he-rn-nomina':
        newValue = (d.valorHEDHEN / d.totalNomina) * 100;
        break;
      case 'gasto-nomina-venta-rrhh':
        newValue = (d.valorNomina / d.ventaTotal) * 100;
        break;
      case 'tiempo-contratacion':
        newValue = d.diasVacante;
        break;

      // CAJA
      case 'planillas-cerradas':
        newValue = (d.planillasCerradas / d.planillasGeneradas) * 100;
        break;
      case 'vales-descuadres':
        newValue = (d.valorVales / d.totalCuadreCaja) * 100;
        break;

      // CONTABILIDAD EXTRA
      case 'dias-cierre':
        newValue = (d.diasReporte / d.totalDiasCierre) * 100;
        break;
      case 'ajustes-posteriores':
        newValue = parseFloat(d.ajustesPosteriores || 0);
        break;
      case 'ajustes-revisoria':
        newValue = parseFloat(d.ajustesRevisor || 0);
        break;
      case 'rotacion-cxc': {
        const ini = parseFloat(d.cxcInicial || 0);
        const fin = parseFloat(d.cxcFinal || 0);
        const avg = (ini + fin) / 2;
        newValue = parseFloat(d.ventasCredito || 0) / (avg || 1);
        break;
      }
      case 'rotacion-cxp': {
        const ini = parseFloat(d.cxpInicial || 0);
        const fin = parseFloat(d.cxpFinal || 0);
        const avg = (ini + fin) / 2;
        newValue = parseFloat(d.comprasCredito || 0) / (avg || 1);
        break;
      }
      case 'conciliaciones-bancarias':
        newValue = (d.conciliacionesRealizadas / d.conciliacionesRequeridas) * 100;
        break;
      case 'activos-conciliados':
        newValue = (d.activosConciliados / d.activosRegistrados) * 100;
        break;
      case 'multas-sanciones':
        newValue = (d.multasSanciones / d.ingreso) * 100;
        break;
      case 'optimizacion-tributaria':
        newValue = (d.impuestosOptimizados / (d.totalImpuestos || 1)) * 100;
        break;
      default:
        newValue = d.currentValue || 0;
    }
  } catch (e) {
    console.error(`Error calculating KPI ${kpiId}:`, e);
    return 0;
  }

  return parseFloat((newValue || 0).toFixed(2));
};

export const isInverseKPI = (kpiId) => {
  const inverseKPIs = [
    'pedidos-devueltos',
    'gasto-nomina-venta',
    'gasto-fletes-venta',
    'horas-extras-auxiliares',
    'devoluciones-mal-estado',
    'devoluciones-mal-estado-comercial',
    'cartera-vencida-total',
    'segundos-unidad-separada',
    'notas-errores-venta',
    'nomina-venta-picking',
    'horas-extras-venta-picking',
    'embalajes-perdidos',
    'nomina-compra-deposito',
    'horas-extras-venta-deposito',
    'averias-venta',
    'rotacion-personal',
    'ausentismo',
    'he-rn-nomina',
    'gasto-nomina-venta-rrhh',
    'tiempo-contratacion',
    'vales-descuadres',
    'multas-sanciones',
    'cobro-optimo-cartera',
    'devoluciones-buen-estado',
    'participacion-venta-credito',
    'rotacion-equipo-comercial',
    'gasto-personal-comercial',
    'gasto-viaje-comercial',

    'dias-inventario-comercial',
    'quiebres-inventario',
    'obsolescencia',
    'mermas',
    'diferencia-inventarios',
    'indice-arqueo-caja',
    'cartera-mayor-30',
    'valor-cartera-venta',
    'rotacion-cxc',
    'rotacion-cxp'
  ];

  return inverseKPIs.includes(kpiId) || kpiId.includes('vencida') || kpiId.includes('ajustes');
};
