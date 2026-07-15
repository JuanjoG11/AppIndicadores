/**
 * Script para generar un Excel con todas las fórmulas de los KPIs
 * Uso: node generar_excel_kpis.mjs
 */

import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ==================== DATOS DE KPIs ====================
const kpiDefinitions = [
    // ========== LOGÍSTICA DE ENTREGA ==========
    {
        id: 'promedio-pedidos-auxiliar',
        name: 'Productividad de Auxiliares por Marca',
        area: 'Logística',
        subArea: 'Logística de Entrega',
        objetivo: 'Mejorar la productividad en la entrega de pedidos',
        formula: 'NUMERO DE PEDIDOS X PROVEEDOR / AUXILIARES',
        formulaCalculo: 'numeroPedidos / auxiliares',
        unit: 'pedidos',
        frecuencia: 'SEMANAL',
        responsable: 'LOGISTICA',
        fuente: 'APP DE FLETES',
        metas: 'ALPINA: 50 | ZENU: 80 | UNILEVER: 80',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'promedio-pedidos-carro',
        name: 'Productividad por Vehículo',
        area: 'Logística',
        subArea: 'Logística de Entrega',
        objetivo: 'Mejorar la productividad en la entrega de pedidos',
        formula: 'NUMERO DE PEDIDOS X PROVEEDOR / VEHICULOS',
        formulaCalculo: 'numeroPedidos / vehiculos',
        unit: 'pedidos',
        frecuencia: 'SEMANAL',
        responsable: 'LOGISTICA',
        fuente: 'APP DE FLETES',
        metas: 'ALPINA: 65 | ZENU: 80 | UNILEVER: 80',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'gasto-nomina-venta',
        name: 'Participación de Nómina en Ventas (Entrega)',
        area: 'Logística',
        subArea: 'Logística de Entrega',
        objetivo: 'Garantizar la Rentabilidad en el proceso de entrega',
        formula: 'NOMINA LOGISTICA / VENTA TOTAL',
        formulaCalculo: '(nominaLogistica / ventaTotal) * 100',
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        fuente: 'SYT / MAN GO',
        metas: 'ALPINA: 3.4% | ZENU: 3.4% | FLEISCHMANN: 3.4% | UNILEVER: 3.4% | FAMILIA: 3.4%',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'gasto-fletes-venta',
        name: 'Participación de Fletes en Ventas',
        area: 'Logística',
        subArea: 'Logística de Entrega',
        objetivo: 'Garantizar la Rentabilidad en el proceso de entrega',
        formula: 'VALOR FLETES / VENTA TOTAL',
        formulaCalculo: '(valorFletes / ventaTotal) * 100',
        unit: '%',
        frecuencia: 'QUINCENAL',
        responsable: 'CONTADOR',
        fuente: 'MEKANO',
        metas: 'ALPINA: 4.5% | ZENU: 3.4% | FLEISCHMANN: 4.5% | UNILEVER: 4.2% | FAMILIA: 4.2%',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'horas-extras-auxiliares',
        name: 'Promedio de Horas Extra por Auxiliar',
        area: 'Logística',
        subArea: 'Logística de Entrega',
        objetivo: 'Garantizar la Rentabilidad en el proceso de entrega',
        formula: '(TOTAL HORAS EXTRAS / AUXILIARES) / 25 DÍAS',
        formulaCalculo: '(totalHorasExtras / auxiliares) / 25',
        unit: 'horas',
        frecuencia: 'QUINCENAL',
        responsable: 'GESTIÓN HUMANA',
        fuente: 'MAN GO',
        metas: 'ALPINA: 1.5 | ZENU: 1 | FLEISCHMANN: 1.5 | UNILEVER: 1 | FAMILIA: 1',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'pedidos-devueltos',
        name: 'Índice de Devoluciones',
        area: 'Logística',
        subArea: 'Logística de Entrega',
        objetivo: 'Garantizar el % mas alto de efectividad en la entrega',
        formula: 'PEDIDOS DEVUELTOS / PEDIDOS FACTURADOS',
        formulaCalculo: '(pedidosDevueltos / pedidosFacturados) * 100',
        unit: '%',
        frecuencia: 'DIARIO',
        responsable: 'LOGISTICA',
        fuente: 'APP DE DEVOLUCIONES',
        metas: 'ALPINA: 1.8% | ZENU: 1.8% | FLEISCHMANN: 1.8% | UNILEVER: 1.8% | FAMILIA: 1.8%',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'averias-venta',
        name: 'Índice de Averías',
        area: 'Logística',
        subArea: 'Logística de Entrega',
        objetivo: 'Optimizar la rentabilidad en la Bodega',
        formula: 'TOTAL AVERIAS / VENTA TOTAL',
        formulaCalculo: '(totalAverias / ventaTotal) * 100',
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'LOGISTICA',
        fuente: 'SYT',
        metas: 'ALPINA: 0.20% | ZENU: 0.20% | FLEISCHMANN: 0.20% | UNILEVER: 0.20% | FAMILIA: 0.20%',
        tipoKPI: 'Inverso (menor es mejor)'
    },

    // ========== LOGÍSTICA DE PICKING ==========
    {
        id: 'segundos-unidad-separada',
        name: 'Tiempo de Separación por Unidad',
        area: 'Logística',
        subArea: 'Logística de Picking',
        objetivo: 'Garantizar la productividad en el picking de productos',
        formula: 'SEGUNDOS UTILIZADOS / UNIDADES SEPARADAS',
        formulaCalculo: 'segundosUtilizados / unidadesSeparadas',
        unit: 'segundos',
        frecuencia: 'DIARIO',
        responsable: 'ANALISTA DE INFORMACIÓN',
        fuente: 'SODISTEC',
        metas: 'ALPINA: 8 seg',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'pesos-separados-hombre',
        name: 'Valor Separado por Operario',
        area: 'Logística',
        subArea: 'Logística de Picking',
        objetivo: 'Garantizar la productividad en el picking de productos',
        formula: 'VALOR VENTA / AUXILIARES DE SEPARACIÓN',
        formulaCalculo: 'valorVenta / auxiliaresSeparacion',
        unit: '$',
        frecuencia: 'MENSUAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        fuente: 'SYT',
        metas: 'ALPINA: $218,000,000',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'pedidos-separar-total',
        name: 'Eficiencia en Separación de Pedidos',
        area: 'Logística',
        subArea: 'Logística de Picking',
        objetivo: 'Garantizar la eficiencia del turno de separación',
        formula: 'PEDIDOS SEPARADOS / PEDIDOS FACTURADOS',
        formulaCalculo: '(pedidosSeparados / pedidosFacturados) * 100',
        unit: '%',
        frecuencia: 'DIARIO',
        responsable: 'ANALISTA DE INFORMACIÓN',
        fuente: 'SODISTEC',
        metas: 'ALPINA: 100%',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'notas-errores-venta',
        name: 'Impacto de Notas por Error',
        area: 'Logística',
        subArea: 'Logística de Picking',
        objetivo: 'Garantizar el % mas bajo de notas por error de venta',
        formula: 'NOTAS X DEVOLUCIÓN / VALOR DE LA VENTA',
        formulaCalculo: '(notasDevolucion / valorVenta) * 100',
        unit: '%',
        frecuencia: 'DIARIO',
        responsable: 'ANALISTA DE INFORMACIÓN',
        fuente: 'SYT',
        metas: 'ALPINA: 1% | FLEISCHMANN: 1% | UNILEVER: 1% | FAMILIA: 1%',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'planillas-separadas',
        name: 'Cumplimiento de Separación de Planillas',
        area: 'Logística',
        subArea: 'Logística de Picking',
        objetivo: 'Garantizar la eficiencia del turno de separación',
        formula: 'PLANILLAS SEPARADAS / PLANILLAS GENERADAS',
        formulaCalculo: '(planillasSeparadas / planillasGeneradas) * 100',
        unit: '%',
        frecuencia: 'DIARIO',
        responsable: 'ANALISTA DE INFORMACIÓN',
        fuente: 'SIDIS',
        metas: 'ALPINA: 100% | FLEISCHMANN: 100% | UNILEVER: 100% | FAMILIA: 100%',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'nomina-venta-picking',
        name: 'Participación de Nómina en Ventas (Picking)',
        area: 'Logística',
        subArea: 'Logística de Picking',
        objetivo: 'Aumentar la rentabilidad del proceso de picking',
        formula: 'VALOR NOMINA / VENTA TOTAL',
        formulaCalculo: '(valorNomina / ventaTotal) * 100',
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        fuente: 'SYT / MAN GO',
        metas: 'ALPINA: 1% | FLEISCHMANN: 1% | UNILEVER: 1% | FAMILIA: 1%',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'horas-extras-venta-picking',
        name: 'Relación Horas Extra vs Ventas (Picking)',
        area: 'Logística',
        subArea: 'Logística de Picking',
        objetivo: 'Aumentar la rentabilidad del proceso de picking',
        formula: 'HORAS EXTRAS / VENTA TOTAL',
        formulaCalculo: '(horasExtras / ventaTotal) * 100',
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'GESTIÓN HUMANA',
        fuente: 'MAN GO',
        metas: 'ALPINA: 1% | FLEISCHMANN: 1%',
        tipoKPI: 'Inverso (menor es mejor)'
    },

    // ========== LOGÍSTICA DE DEPÓSITO ==========
    {
        id: 'embalajes-perdidos',
        name: 'Pérdida de Embalajes',
        area: 'Logística',
        subArea: 'Logística de Depósito',
        objetivo: 'Reducir la perdida de embalajes',
        formula: 'CANASTILLAS RECIBIDAS - CANASTILLAS GESTIONADAS',
        formulaCalculo: 'canastillasRecibidas - canastillasGestionadas',
        unit: 'cantidad',
        frecuencia: 'SEMANAL',
        responsable: 'LOGISTICA',
        fuente: 'CONTROL DE EMBALAJES',
        metas: 'ALPINA: 0 | FLEISCHMANN: 0 | UNILEVER: 0 | FAMILIA: 0',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'nomina-compra-deposito',
        name: 'Participación de Nómina en Ventas (Depósito)',
        area: 'Logística',
        subArea: 'Logística de Depósito',
        objetivo: 'Optimizar la rentabilidad en la Bodega',
        formula: 'NOMINA DEPOSITO / VENTA TOTAL',
        formulaCalculo: '(valorNomina / ventaTotal) * 100',
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        fuente: 'SYT / MAN GO',
        metas: 'ALPINA: 0.4% | UNILEVER: 0.4% | FAMILIA: 0.4%',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'horas-extras-venta-deposito',
        name: 'Relación Horas Extra vs Ventas (Depósito)',
        area: 'Logística',
        subArea: 'Logística de Depósito',
        objetivo: 'Optimizar la rentabilidad en la Bodega',
        formula: 'HORAS EXTRAS / VENTA TOTAL',
        formulaCalculo: '(horasExtras / ventaTotal) * 100',
        unit: '%',
        frecuencia: 'QUINCENAL',
        responsable: 'GESTIÓN HUMANA',
        fuente: 'SYT / MAN GO',
        metas: 'ALPINA: 1% | FLEISCHMANN: 1%',
        tipoKPI: 'Inverso (menor es mejor)'
    },

    // ========== TALENTO HUMANO ==========
    {
        id: 'rotacion-personal',
        name: 'Rotación de Personal',
        area: 'Talento Humano',
        subArea: 'Gestión de Personal',
        objetivo: 'Reducir la rotación de personal en las diferentes áreas',
        formula: '(# DE SALIDAS / PROMEDIO DE EMPLEADOS) × 100',
        formulaCalculo: '(personalRetirado / promedioEmpleados) * 100',
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        fuente: 'MAN GO',
        metas: 'ALPINA: 5% | ZENU: 5% | FLEISCHMANN: 5% | UNILEVER: 5% | FAMILIA: 5%',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'ausentismo',
        name: 'Índice de Ausentismo',
        area: 'Talento Humano',
        subArea: 'Gestión de Personal',
        objetivo: 'Reducir el ausentismo en los equipos',
        formula: 'DÍAS PERDIDOS / DÍAS LABORADOS',
        formulaCalculo: '(diasPerdidos / diasLaborados) * 100',
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        fuente: 'MAN GO',
        metas: 'ALPINA: 2.5% | ZENU: 2.5% | FLEISCHMANN: 2.5% | UNILEVER: 2.5% | FAMILIA: 2.5%',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'he-rn-nomina',
        name: 'Participación de Horas Extra en Nómina',
        area: 'Talento Humano',
        subArea: 'Gestión de Personal',
        objetivo: 'Reducir el pago por H.E-R.N',
        formula: 'VALOR HED HEN / TOTAL NÓMINA',
        formulaCalculo: '(valorHEDHEN / totalNomina) * 100',
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        fuente: 'MAN GO',
        metas: 'ALPINA: 3% | ZENU: 3% | FLEISCHMANN: 3% | UNILEVER: 3% | FAMILIA: 3%',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'gasto-nomina-venta-rrhh',
        name: 'Participación de Nómina en Ventas (RRHH)',
        area: 'Talento Humano',
        subArea: 'Gestión de Personal',
        objetivo: 'Garantizar la rentabilidad de la compañía en la nómina',
        formula: 'VALOR NÓMINA / VENTA TOTAL',
        formulaCalculo: '(valorNomina / ventaTotal) * 100',
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        fuente: 'SYT / MAN GO',
        metas: 'ALPINA: 11% | ZENU: 11% | FLEISCHMANN: 11% | UNILEVER: 11% | FAMILIA: 11%',
        tipoKPI: 'Inverso (menor es mejor)'
    },

    // ========== SST Y CULTURA ==========
    {
        id: 'calificacion-auditoria',
        name: 'Calificación de Auditoría SST',
        area: 'SST / Cultura',
        subArea: 'SST',
        objetivo: 'Ejecutar el Sistema de Gestión SST',
        formula: 'ACTIVIDADES EJECUTADAS / ACTIVIDADES PROGRAMADAS',
        formulaCalculo: '(actividadesEjecutadas / actividadesProgramadas) * 100',
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'SST_CULTURA',
        fuente: 'SYCH',
        metas: 'TYM: 90% | TAT: 90%',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'actividades-cultura',
        name: 'Actividades de Cultura Organizacional',
        area: 'SST / Cultura',
        subArea: 'Cultura',
        objetivo: 'Fortalecer la cultura organizacional por medio de actividades',
        formula: 'ACTIVIDADES EJECUTADAS / ACTIVIDADES PROGRAMADAS',
        formulaCalculo: '(actividadesEjecutadas / actividadesProgramadas) * 100',
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'SST_CULTURA',
        fuente: 'GESTIÓN HUMANA',
        metas: 'TYM: 100% | TAT: 100%',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'tiempo-contratacion',
        name: 'Tiempo de Cobertura de Vacantes',
        area: 'SST / Cultura',
        subArea: 'Cultura',
        objetivo: 'Reducir el tiempo de respuesta en contrataciones',
        formula: 'DÍAS DE RESPUESTA EN CONTRATACIÓN',
        formulaCalculo: 'diasVacante',
        unit: 'días',
        frecuencia: 'QUINCENAL',
        responsable: 'SST_CULTURA',
        fuente: 'GESTIÓN HUMANA',
        metas: 'TYM: 8 días | TAT: 8 días',
        tipoKPI: 'Inverso (menor es mejor)'
    },

    // ========== CAJA ==========
    {
        id: 'arqueos-realizados',
        name: 'Cumplimiento de Arqueos',
        area: 'Contabilidad / Caja',
        subArea: 'Caja',
        objetivo: 'Garantizar el control permanente del efectivo. Comisión: $100.000',
        formula: 'ARQUEOS REALIZADOS / ARQUEOS PROGRAMADOS',
        formulaCalculo: '(arqueosRealizados / arqueosProgramados) * 100',
        unit: 'arqueos',
        frecuencia: 'SEMANAL',
        responsable: 'CAJA',
        fuente: 'CONTABILIDAD',
        metas: 'ALPINA: 4 | ZENU: 4 | FLEISCHMANN: 4 | UNILEVER: 4 | FAMILIA: 4',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'indice-arqueo-caja',
        name: 'Índice de Arqueo en Caja',
        area: 'Contabilidad / Caja',
        subArea: 'Caja',
        objetivo: 'Seguimiento de diferencias en arqueos de caja (Sobra - Faltante)',
        formula: 'NÚMERO DE ARQUEOS CON DIFERENCIA (SOBRA - FALTANTE)',
        formulaCalculo: 'currentValue (ingresado directamente)',
        unit: 'arqueos',
        frecuencia: 'SEMANAL',
        responsable: 'CAJA',
        fuente: 'CONTABILIDAD',
        metas: 'ALPINA: 0 | ZENU: 0 | FLEISCHMANN: 0 | UNILEVER: 0 | FAMILIA: 0',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'planillas-cerradas',
        name: 'Cierre de Planillas',
        area: 'Contabilidad / Caja',
        subArea: 'Caja',
        objetivo: 'Ejecutar el cierre de planillas diario. Comisión: $100.000',
        formula: 'PLANILLAS CERRADAS / PLANILLAS GENERADAS',
        formulaCalculo: '(planillasCerradas / planillasGeneradas) * 100',
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'CAJA',
        fuente: 'CONTABILIDAD',
        metas: 'ALPINA: 100% | ZENU: 100% | FLEISCHMANN: 100% | UNILEVER: 100% | FAMILIA: 100%',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'vales-descuadres',
        name: 'Participación de Vales en Cuadres',
        area: 'Contabilidad / Caja',
        subArea: 'Caja',
        objetivo: 'Reducir el valor de vales generados en caja por descuadres',
        formula: 'VALOR DE VALES / TOTAL CUADRE DE CAJA',
        formulaCalculo: '(valorVales / totalCuadreCaja) * 100',
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'CAJA',
        fuente: 'CONTABILIDAD',
        metas: 'ALPINA: 0.5% | ZENU: 0.5% | FLEISCHMANN: 0.5% | UNILEVER: 0.5% | FAMILIA: 0.5%',
        tipoKPI: 'Inverso (menor es mejor)'
    },

    // ========== CARTERA ==========
    {
        id: 'cartera-no-vencida',
        name: 'Cartera al Día',
        area: 'Cartera',
        subArea: 'Gestión de Cartera',
        objetivo: 'Mejorar la rotación de cartera con los clientes',
        formula: 'TOTAL CARTERA VENCIDA / TOTAL VENTA',
        formulaCalculo: '(carteraNoVencida / carteraTotal) * 100',
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'CARTERA',
        fuente: 'CONTABILIDAD',
        metas: 'ALPINA: 10% | FLEISCHMANN: 10% | UNILEVER: 10% | FAMILIA: 10%',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'cartera-mayor-30',
        name: 'Cartera Mayor a 30 Días',
        area: 'Cartera',
        subArea: 'Gestión de Cartera',
        objetivo: 'Mejorar la rotación de cartera con los clientes',
        formula: 'TOTAL MAYOR A 30 / TOTAL CARTERA',
        formulaCalculo: '(totalMayor30 / totalCartera) * 100',
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'CARTERA',
        fuente: 'CONTABILIDAD',
        metas: 'ALPINA: 5% | FLEISCHMANN: 5% | UNILEVER: 5% | FAMILIA: 5%',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'recircularizaciones',
        name: 'Cumplimiento de Circularizaciones',
        area: 'Cartera',
        subArea: 'Gestión de Cartera',
        objetivo: 'Fortalecer el control interno con la cartera a la calle',
        formula: 'EFECTUADAS / PROGRAMADAS',
        formulaCalculo: '(efectuadas / programadas) * 100',
        unit: 'cantidad',
        frecuencia: 'BIMESTRAL',
        responsable: 'CARTERA',
        fuente: 'CONTABILIDAD',
        metas: 'ALPINA: 2 | FLEISCHMANN: 2 | UNILEVER: 2 | FAMILIA: 2',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'valor-cartera-venta',
        name: 'Relación Cartera vs Ventas',
        area: 'Cartera',
        subArea: 'Gestión de Cartera',
        objetivo: 'Garantizar los Flujos de las compañías',
        formula: 'VENTA CREDITO / TOTAL VENTA',
        formulaCalculo: '(carteraTotal / ventaTotal) * 100',
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'CARTERA',
        fuente: 'CONTABILIDAD',
        metas: 'ALPINA: 10% | FLEISCHMANN: 10% | FAMILIA: 20% | UNILEVER: 20%',
        tipoKPI: 'Inverso (menor es mejor)'
    },

    // ========== CONTABILIDAD ==========
    {
        id: 'dias-cierre',
        name: 'Cumplimiento de Tiempo de Cierre',
        area: 'Contabilidad',
        subArea: 'Cierre Contable',
        objetivo: 'Ejecutar los cierres contables de mes en los tiempos óptimos',
        formula: 'DÍAS PARA EL REPORTE / TOTAL DÍAS AL CIERRE',
        formulaCalculo: 'totalDiasCierre (valor directo)',
        unit: 'días',
        frecuencia: 'MENSUAL',
        responsable: 'CONTADOR',
        fuente: 'CONTABILIDAD',
        metas: 'Meta: 12 días',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'ajustes-posteriores',
        name: 'Ajustes Posteriores al Cierre',
        area: 'Contabilidad',
        subArea: 'Cierre Contable',
        objetivo: 'Garantizar la confiabilidad de los cierres contables',
        formula: 'AJUSTES POSTERIORES (conteo directo)',
        formulaCalculo: 'ajustesPosteriores (valor directo)',
        unit: 'cantidad',
        frecuencia: 'MENSUAL',
        responsable: 'CONTADOR',
        fuente: 'CONTABILIDAD',
        metas: 'Meta: 1',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'ajustes-revisoria',
        name: 'Ajustes por Revisoría Fiscal',
        area: 'Contabilidad',
        subArea: 'Cierre Contable',
        objetivo: 'Garantizar la confiabilidad de los cierres contables',
        formula: 'AJUSTES REVISOR FISCAL (conteo directo)',
        formulaCalculo: 'ajustesRevisor (valor directo)',
        unit: 'cantidad',
        frecuencia: 'MENSUAL',
        responsable: 'CONTADOR',
        fuente: 'CONTABILIDAD',
        metas: 'Meta: 1',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'rotacion-cxc',
        name: 'Rotación de Cuentas por Cobrar',
        area: 'Contabilidad',
        subArea: 'Análisis Financiero',
        objetivo: 'Mejorar la rotación en las cuentas por cobrar a clientes',
        formula: 'VENTAS CRÉDITO / ((CXC INICIAL + CXC FINAL) / 2)',
        formulaCalculo: 'ventasCredito / ((cxcInicial + cxcFinal) / 2)',
        unit: 'veces',
        frecuencia: 'MENSUAL',
        responsable: 'CONTADOR',
        fuente: 'CONTABILIDAD',
        metas: 'TYM: 1.5 veces | TAT: 1.5 veces',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'rotacion-cxp',
        name: 'Rotación de Cuentas por Pagar',
        area: 'Contabilidad',
        subArea: 'Análisis Financiero',
        objetivo: 'Garantizar la rotación en las cuentas por pagar a proveedores',
        formula: 'COMPRAS CRÉDITO / ((CXP INICIAL + CXP FINAL) / 2)',
        formulaCalculo: 'comprasCredito / ((cxpInicial + cxpFinal) / 2)',
        unit: 'veces',
        frecuencia: 'MENSUAL',
        responsable: 'CONTADOR',
        fuente: 'CONTABILIDAD',
        metas: 'TYM: 1.5 veces | TAT: 1.5 veces',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'conciliaciones-bancarias',
        name: 'Cumplimiento de Conciliaciones Bancarias',
        area: 'Contabilidad',
        subArea: 'Control Bancario',
        objetivo: 'Fortalecer el control interno. Comisión: $100.000',
        formula: 'CONCILIACIONES REALIZADAS / CONCILIACIONES REQUERIDAS',
        formulaCalculo: '(conciliacionesRealizadas / conciliacionesRequeridas) * 100',
        unit: 'cantidad',
        frecuencia: 'QUINCENAL',
        responsable: 'CONTADOR',
        fuente: 'CONTABILIDAD',
        metas: 'Meta: 8',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'conciliaciones-diarias',
        name: 'Verificación de Consignaciones',
        area: 'Contabilidad',
        subArea: 'Control Bancario',
        objetivo: 'Asegurar la cuadratura diaria entre sistema y banco',
        formula: 'CONCILIACIONES EN SISTEMA / CONCILIACIONES EN BANCO',
        formulaCalculo: '(conciliacionesSistema / conciliacionesBanco) * 100',
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'CONTADOR',
        fuente: 'CONTABILIDAD',
        metas: 'Meta: 100%',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'activos-conciliados',
        name: 'Conciliación de Activos',
        area: 'Contabilidad',
        subArea: 'Control Bancario',
        objetivo: 'Fortalecer el control interno',
        formula: 'ACTIVOS CONCILIADOS / ACTIVOS REGISTRADOS',
        formulaCalculo: '(activosConciliados / activosRegistrados) * 100',
        unit: '%',
        frecuencia: 'BIMESTRAL',
        responsable: 'CONTADOR',
        fuente: 'CONTABILIDAD',
        metas: 'TYM: 94% | TAT: 94%',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'multas-sanciones',
        name: 'Impacto de Sanciones Tributarias',
        area: 'Contabilidad',
        subArea: 'Control Tributario',
        objetivo: 'Fortalecer el control interno',
        formula: 'MULTAS O SANCIONES / INGRESO',
        formulaCalculo: '(multasSanciones / ingreso) * 100',
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'CONTADOR',
        fuente: 'CONTABILIDAD',
        metas: 'TYM: 0.1% | TAT: 0.1%',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'optimizacion-tributaria',
        name: 'Optimización de Impuestos',
        area: 'Contabilidad',
        subArea: 'Control Tributario',
        objetivo: 'Optimizar la carga tributaria buscando mejores flujos y rentabilidad',
        formula: 'IMPUESTOS OPTIMIZADOS / TOTAL IMPUESTOS',
        formulaCalculo: '(impuestosOptimizados / totalImpuestos) * 100',
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'CONTADOR',
        fuente: 'CONTABILIDAD',
        metas: 'TYM: 0% | TAT: 0%',
        tipoKPI: 'Positivo (mayor es mejor)'
    },

    // ========== COMERCIAL ==========
    {
        id: 'venta-realizada-esperada',
        name: 'Cumplimiento de Ventas',
        area: 'Comercial',
        subArea: 'Gestión de Ventas',
        objetivo: 'Cumplimiento de presupuesto de ventas',
        formula: 'VENTA REALIZADA / PRESUPUESTO DE VENTA',
        formulaCalculo: '(ventaRealizada / presupuestoVenta) * 100',
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        fuente: 'ANALISTA DE INFORMACIÓN',
        metas: 'ALPINA: 100% | ZENU: 100% | FLEISCHMANN: 100%',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'primer-margen',
        name: 'Margen Bruto',
        area: 'Comercial',
        subArea: 'Gestión de Ventas',
        objetivo: 'Optimizar la rentabilidad bruta',
        formula: '(VENTAS - COSTO DE VENTAS) / VENTAS × 100',
        formulaCalculo: '((ventas - costoVentas) / ventas) * 100',
        unit: '%',
        frecuencia: 'QUINCENAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        fuente: 'ANALISTA DE INFORMACIÓN',
        metas: 'ALPINA: 12% | FAMILIA: 10% | UNILEVER: 8% | FLEISCHMANN: 10% | ZENU: 11%',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'devoluciones-buen-estado',
        name: 'Devoluciones en Buen Estado',
        area: 'Comercial',
        subArea: 'Servicio y Devoluciones',
        objetivo: 'Controlar devoluciones aptas para re-venta',
        formula: 'DEVOLUCIÓN BUEN ESTADO / VENTA TOTAL',
        formulaCalculo: '(devolucionBuenEstado / ventaTotal) * 100',
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        fuente: 'ANALISTA DE INFORMACIÓN',
        metas: 'ALPINA: 1.8% | ZENU: 1.8% | FLEISCHMANN: 1.8% | UNILEVER: 1.8% | FAMILIA: 1.8%',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'devoluciones-mal-estado-comercial',
        name: 'Devoluciones en Mal Estado',
        area: 'Comercial',
        subArea: 'Servicio y Devoluciones',
        objetivo: 'Disminuir mermas por devoluciones averiadas',
        formula: 'DEVOLUCIÓN MAL ESTADO / VENTA TOTAL',
        formulaCalculo: '(valorDevolucion / ventaTotal) * 100',
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        fuente: 'ANALISTA DE INFORMACIÓN',
        metas: 'ALPINA: 0.5% | FAMILIA: 0.5% | UNILEVER: 0.5% | ZENU: 0.5%',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'promedio-venta-vendedor',
        name: 'Ventas Promedio por Vendedor',
        area: 'Comercial',
        subArea: 'Gestión de Ventas',
        objetivo: 'Aumentar la productividad de la fuerza comercial',
        formula: 'VENTA TOTAL / VENDEDORES',
        formulaCalculo: 'ventasTotales / numeroVendedores',
        unit: '$',
        frecuencia: 'MENSUAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        fuente: 'ANALISTA DE INFORMACIÓN',
        metas: 'ALPINA: $60M | FAMILIA: $50M | UNILEVER: $55M | FLEISCHMANN: $45M | ZENU: $48M',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'participacion-venta-credito',
        name: 'Participación de Ventas a Crédito',
        area: 'Comercial',
        subArea: 'Cartera y Crédito',
        objetivo: 'Optimizar el recaudo inmediato',
        formula: 'VENTA CREDITO / VENTA TOTAL',
        formulaCalculo: '(ventaCredito / ventaTotal) * 100',
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'CARTERA',
        fuente: 'CARTERA',
        metas: 'ALPINA: 10% | FAMILIA: 12% | UNILEVER: 10% | FLEISCHMANN: 8%',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'cobro-optimo-cartera',
        name: 'Cartera Vencida',
        area: 'Comercial',
        subArea: 'Cartera y Crédito',
        objetivo: 'Reducir la mora en el recaudo',
        formula: 'CARTERA VENCIDA / TOTAL CARTERA',
        formulaCalculo: '(carteraVencida / totalCartera) * 100',
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'CARTERA',
        fuente: 'CARTERA',
        metas: 'UNILEVER: 80% | FAMILIA: 80%',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'rotacion-equipo-comercial',
        name: 'Rotación de Personal Comercial',
        area: 'Comercial',
        subArea: 'Operación y Gastos',
        objetivo: 'Fomentar la estabilidad laboral',
        formula: 'PERSONAL RETIRADO / PROMEDIO DE EMPLEADOS',
        formulaCalculo: '(personalRetirado / promedioEmpleados) * 100',
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        fuente: 'MAN GO',
        metas: 'ALPINA: 3.5% | FAMILIA: 3.5% | UNILEVER: 3.5% | FLEISCHMANN: 3.5% | ZENU: 3.5%',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'gasto-personal-comercial',
        name: 'Participación de Gastos de Personal',
        area: 'Comercial',
        subArea: 'Operación y Gastos',
        objetivo: 'Controlar costos operativos comerciales',
        formula: 'GASTOS DE PERSONAL / TOTAL VENTA',
        formulaCalculo: '(gastosPersonal / ventaTotal) * 100',
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        fuente: 'CONTABILIDAD',
        metas: 'ALPINA: 5% | ZENU: 5% | FLEISCHMANN: 5% | UNILEVER: 5% | FAMILIA: 5%',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'gasto-viaje-comercial',
        name: 'Participación de Gastos de Viaje',
        area: 'Comercial',
        subArea: 'Operación y Gastos',
        objetivo: 'Optimizar gastos de representación y viaje',
        formula: 'GASTOS DE VIAJE / TOTAL VENTA',
        formulaCalculo: '(gastosViaje / ventaTotal) * 100',
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'CONTADOR',
        fuente: 'CONTABILIDAD',
        metas: 'ALPINA: 0.2% | ZENU: 0.2% | FLEISCHMANN: 0.2% | UNILEVER: 0.2% | FAMILIA: 0.2%',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'dias-inventario-comercial',
        name: 'Días Promedio de Inventario',
        area: 'Comercial',
        subArea: 'Operación y Gastos',
        objetivo: 'Optimizar rotación de inventarios para flujo de caja',
        formula: 'DIAS DE INVENTARIO (valor directo)',
        formulaCalculo: 'diasInventario (valor directo)',
        unit: 'días',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        fuente: 'ANALISTA DE INFORMACIÓN',
        metas: 'ALPINA: 7 días | FLEISCHMANN: 7 días | UNILEVER: 45 días | FAMILIA: 18 días | POLAR: 18 días',
        tipoKPI: 'Inverso (menor es mejor)'
    },

    // ========== ADMINISTRATIVO - INVENTARIOS ==========
    {
        id: 'inventarios-realizados',
        name: 'Cumplimiento de Inventarios',
        area: 'Administrativo',
        subArea: 'Control de Inventarios',
        objetivo: 'Garantizar el control físico de existencias',
        formula: 'INVENTARIOS REALIZADOS (conteo directo)',
        formulaCalculo: 'inventariosRealizados (valor directo)',
        unit: 'cantidad',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        fuente: 'ANALISTA DE INFORMACIÓN',
        metas: 'ALPINA: 2 | ZENU: 2 | FLEISCHMANN: 2 | UNILEVER: 2 | FAMILIA: 2',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'fiabilidad-inventarios',
        name: 'Exactitud de Inventario',
        area: 'Administrativo',
        subArea: 'Control de Inventarios',
        objetivo: 'Asegurar la exactitud de los registros contables',
        formula: '(VALOR VERIFICADO / VALOR CORRECTO) × 100',
        formulaCalculo: 'MIN((valorVerificado / valorCorrecto) * 100, 100)',
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        fuente: 'ANALISTA DE INFORMACIÓN',
        metas: 'ALPINA: 100% | ZENU: 100% | FLEISCHMANN: 100% | UNILEVER: 100% | FAMILIA: 100%',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'quiebres-inventario',
        name: 'Quiebres de Inventario',
        area: 'Administrativo',
        subArea: 'Control de Inventarios',
        objetivo: 'Minimizar pedidos no servidos por falta de stock',
        formula: 'QUIEBRES DE INVENTARIO / TOTAL SKU',
        formulaCalculo: '(quiebres / totalSku) * 100',
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        fuente: 'ANALISTA DE INFORMACIÓN',
        metas: 'ALPINA: 0% | ZENU: 0% | FLEISCHMANN: 0% | UNILEVER: 0% | FAMILIA: 0%',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'obsolescencia',
        name: 'Inventario Obsoleto',
        area: 'Administrativo',
        subArea: 'Control de Inventarios',
        objetivo: 'Reducir pérdidas por productos vencidos o sin rotación',
        formula: '(INVENTARIO OBSOLETO / INVENTARIO TOTAL) × 100',
        formulaCalculo: '(inventarioObsoleto / inventarioTotal) * 100',
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        fuente: 'ANALISTA DE INFORMACIÓN',
        metas: 'ALPINA: 0% | ZENU: 0% | FLEISCHMANN: 0% | UNILEVER: 0% | FAMILIA: 0%',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'mermas',
        name: 'Mermas de Inventario',
        area: 'Administrativo',
        subArea: 'Control de Inventarios',
        objetivo: 'Controlar pérdidas físicas de mercancía',
        formula: '(VALOR MERMAS / INVENTARIO TOTAL) × 100',
        formulaCalculo: '(valorMermas / inventarioTotal) * 100',
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        fuente: 'ANALISTA DE INFORMACIÓN',
        metas: 'ALPINA: 0% | ZENU: 0% | FLEISCHMANN: 0% | UNILEVER: 0% | FAMILIA: 0%',
        tipoKPI: 'Inverso (menor es mejor)'
    },
    {
        id: 'revision-margenes',
        name: 'Cumplimiento de Revisión de Márgenes',
        area: 'Administrativo',
        subArea: 'Auditoría y Parámetros',
        objetivo: 'Verificar rentabilidad parametrizada',
        formula: '(REVISIONES EJECUTADAS / REVISIONES PROGRAMADAS) × 100',
        formulaCalculo: '(revisionesEjecutadas / revisionesProgramadas) * 100',
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        fuente: 'ANALISTA DE INFORMACIÓN',
        metas: 'ALPINA: 100% | ZENU: 100% | FLEISCHMANN: 100% | UNILEVER: 100% | FAMILIA: 100%',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'revision-precios',
        name: 'Cumplimiento de Revisión de Precios',
        area: 'Administrativo',
        subArea: 'Auditoría y Parámetros',
        objetivo: 'Evitar errores de facturación al cliente',
        formula: '(REVISIONES EJECUTADAS / REVISIONES PROGRAMADAS) × 100',
        formulaCalculo: '(revisionesEjecutadas / revisionesProgramadas) * 100',
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        fuente: 'ANALISTA DE INFORMACIÓN',
        metas: 'ALPINA: 100% | ZENU: 100% | FLEISCHMANN: 100% | UNILEVER: 100% | FAMILIA: 100%',
        tipoKPI: 'Positivo (mayor es mejor)'
    },

    // ========== FACTURACIÓN ==========
    {
        id: 'pedidos-facturados',
        name: 'Pedidos Facturados',
        area: 'Facturación',
        subArea: 'Operación Facturación',
        objetivo: 'Garantizar que cada pedido tenga su factura correspondiente',
        formula: 'FACTURAS / PEDIDOS',
        formulaCalculo: '(facturas / pedidos) * 100',
        unit: '%',
        frecuencia: 'DIARIO',
        responsable: 'FACTURACION',
        fuente: 'SISTEMA FACTURACIÓN',
        metas: 'ALPINA: 100% | ZENU: 100% | FLEISCHMANN: 100% | UNILEVER: 100% | FAMILIA: 100% | TAT: 100%',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'impresion-facturas',
        name: 'Control Operativo De Facturación',
        area: 'Facturación',
        subArea: 'Operación Facturación',
        objetivo: 'Garantizar que todas las facturas generadas sean impresas',
        formula: 'FACTURAS IMPRESAS / FACTURAS GENERADAS',
        formulaCalculo: '(facturasImpresas / facturasGeneradas) * 100',
        unit: '%',
        frecuencia: 'DIARIO',
        responsable: 'FACTURACION',
        fuente: 'REGISTRO DE IMPRESIÓN',
        metas: 'ALPINA: 100% | ZENU: 100% | FLEISCHMANN: 100% | UNILEVER: 100% | FAMILIA: 100% | TAT: 100%',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'error-facturacion',
        name: 'Error sobre la Facturación',
        area: 'Facturación',
        subArea: 'Operación Facturación',
        objetivo: 'Minimizar errores en el proceso de facturación',
        formula: 'ERRORES / FACTURAS',
        formulaCalculo: '(errores / facturas) * 100',
        unit: '%',
        frecuencia: 'DIARIO',
        responsable: 'FACTURACION',
        fuente: 'REPORTE DE CALIDAD',
        metas: 'ALPINA: 0.5% | ZENU: 0.5% | FLEISCHMANN: 0.5% | UNILEVER: 0.5% | FAMILIA: 0.5% | TAT: 0.5%',
        tipoKPI: 'Inverso (menor es mejor)'
    },

    // ========== SOFTWARE Y TI ==========
    {
        id: 'tareas-programadas',
        name: 'Cumplimiento de Tareas Programadas',
        area: 'Software / TI',
        subArea: 'Gestión Software y TI',
        objetivo: 'Garantizar la ejecución de tareas críticas del sistema',
        formula: '(TAREAS EJECUTADAS / TAREAS PROGRAMADAS) × 100',
        formulaCalculo: '(tareasEjecutadas / tareasProgramadas) * 100',
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'GESTIÓN HUMANA',
        fuente: 'PLATAFORMA DE GESTIÓN',
        metas: 'TYM: 100% | TAT: 100%',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'mantenimiento-equipos',
        name: 'Mantenimiento Preventivo de Equipos',
        area: 'Software / TI',
        subArea: 'Gestión Software y TI',
        objetivo: 'Asegurar la vida útil de los equipos de cómputo',
        formula: 'EQUIPOS MANTENIDOS (valor directo)',
        formulaCalculo: 'currentValue (valor directo)',
        unit: 'mantenimientos',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        fuente: 'BITÁCORA DE SOPORTE',
        metas: 'TYM: 3 | TAT: 3',
        tipoKPI: 'Positivo (mayor es mejor)'
    },
    {
        id: 'resolucion-incidencias',
        name: 'Efectividad en Resolución de Incidencias',
        area: 'Software / TI',
        subArea: 'Gestión Software y TI',
        objetivo: 'Evitar la recurrencia de errores técnicos',
        formula: '(TOTAL INCIDENCIAS - INCIDENCIAS RECURRENTES) / TOTAL INCIDENCIAS × 100',
        formulaCalculo: '((totalIncidencias - incidenciasRecurrentes) / totalIncidencias) * 100',
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'GESTIÓN HUMANA',
        fuente: 'HELPDESK',
        metas: 'TYM: 95% | TAT: 95%',
        tipoKPI: 'Positivo (mayor es mejor)'
    }
];

// ==================== GENERAR EXCEL ====================
async function generarExcel() {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AppIndicadores TYM/TAT';
    workbook.created = new Date();
    workbook.modified = new Date();

    // ==================== HOJA 1: RESUMEN COMPLETO ====================
    const wsMain = workbook.addWorksheet('Fórmulas KPIs', {
        pageSetup: { paperSize: 9, orientation: 'landscape' }
    });

    // Colores corporativos
    const COLOR_HEADER_BG = '1E3A5F';
    const COLOR_HEADER_FONT = 'FFFFFF';
    const COLOR_SUBHEADER_BG = '2E86AB';
    const COLOR_LOGISTICA = 'E8F4FD';
    const COLOR_TALENTO = 'E8F8E8';
    const COLOR_CONTABILIDAD = 'FFF8E1';
    const COLOR_COMERCIAL = 'FCE4EC';
    const COLOR_ADMIN = 'F3E5F5';
    const COLOR_FACTURACION = 'E0F2F1';
    const COLOR_SOFTWARE = 'FFF3E0';
    const COLOR_SST = 'E8EAF6';
    const COLOR_INVERSO = 'FFCDD2';
    const COLOR_POSITIVO = 'C8E6C9';

    const areaColors = {
        'Logística': COLOR_LOGISTICA,
        'Talento Humano': COLOR_TALENTO,
        'Contabilidad': COLOR_CONTABILIDAD,
        'Contabilidad / Caja': COLOR_CONTABILIDAD,
        'Cartera': COLOR_CONTABILIDAD,
        'Comercial': COLOR_COMERCIAL,
        'Administrativo': COLOR_ADMIN,
        'Facturación': COLOR_FACTURACION,
        'Software / TI': COLOR_SOFTWARE,
        'SST / Cultura': COLOR_SST
    };

    // Título principal
    wsMain.mergeCells('A1:L1');
    const titleCell = wsMain.getCell('A1');
    titleCell.value = 'FÓRMULAS DE KPIs — TYM / TAT 2026';
    titleCell.font = { name: 'Calibri', bold: true, size: 18, color: { argb: COLOR_HEADER_FONT } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_BG } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    wsMain.getRow(1).height = 36;

    // Subtítulo fecha
    wsMain.mergeCells('A2:L2');
    const subTitle = wsMain.getCell('A2');
    subTitle.value = `Generado: ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}`;
    subTitle.font = { name: 'Calibri', italic: true, size: 11, color: { argb: '555555' } };
    subTitle.alignment = { horizontal: 'center' };
    wsMain.getRow(2).height = 20;

    // Encabezados de columnas
    const headers = [
        { header: '#', key: 'num', width: 5 },
        { header: 'ID del KPI', key: 'id', width: 30 },
        { header: 'Nombre del KPI', key: 'name', width: 38 },
        { header: 'Área', key: 'area', width: 20 },
        { header: 'Sub-Área', key: 'subArea', width: 26 },
        { header: 'Fórmula de Cálculo', key: 'formula', width: 50 },
        { header: 'Variables (código)', key: 'formulaCalculo', width: 45 },
        { header: 'Unidad', key: 'unit', width: 14 },
        { header: 'Frecuencia', key: 'frecuencia', width: 14 },
        { header: 'Responsable', key: 'responsable', width: 22 },
        { header: 'Fuente de Datos', key: 'fuente', width: 26 },
        { header: 'Metas por Proveedor', key: 'metas', width: 55 },
        { header: 'Tipo de KPI', key: 'tipoKPI', width: 28 },
        { header: 'Objetivo', key: 'objetivo', width: 50 },
    ];

    wsMain.columns = headers.map(h => ({ key: h.key, width: h.width }));

    // Fila de encabezados (fila 3)
    const headerRow = wsMain.getRow(3);
    headers.forEach((h, i) => {
        const cell = headerRow.getCell(i + 1);
        cell.value = h.header;
        cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLOR_HEADER_FONT } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_SUBHEADER_BG } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
            top: { style: 'medium', color: { argb: COLOR_HEADER_BG } },
            bottom: { style: 'medium', color: { argb: COLOR_HEADER_BG } },
            left: { style: 'thin', color: { argb: 'AAAAAA' } },
            right: { style: 'thin', color: { argb: 'AAAAAA' } }
        };
    });
    headerRow.height = 30;

    // Datos
    let currentArea = '';
    kpiDefinitions.forEach((kpi, index) => {
        const rowNum = index + 4;
        const row = wsMain.getRow(rowNum);
        const bgColor = areaColors[kpi.area] || 'FFFFFF';
        const isInverso = kpi.tipoKPI.includes('Inverso');

        // Si cambia el área, insertar separador visual (color de fondo más fuerte en la columna de área)
        if (kpi.area !== currentArea) {
            currentArea = kpi.area;
        }

        const values = [
            index + 1,
            kpi.id,
            kpi.name,
            kpi.area,
            kpi.subArea,
            kpi.formula,
            kpi.formulaCalculo,
            kpi.unit,
            kpi.frecuencia,
            kpi.responsable,
            kpi.fuente,
            kpi.metas,
            kpi.tipoKPI,
            kpi.objetivo
        ];

        values.forEach((val, colIdx) => {
            const cell = row.getCell(colIdx + 1);
            cell.value = val;
            cell.font = { name: 'Calibri', size: 10 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor.replace('#', '') } };
            cell.alignment = { vertical: 'middle', wrapText: true, horizontal: colIdx === 0 ? 'center' : 'left' };
            cell.border = {
                top: { style: 'hair', color: { argb: 'CCCCCC' } },
                bottom: { style: 'hair', color: { argb: 'CCCCCC' } },
                left: { style: 'thin', color: { argb: 'CCCCCC' } },
                right: { style: 'thin', color: { argb: 'CCCCCC' } }
            };

            // Colorear la columna "Tipo de KPI"
            if (colIdx === 12) {
                cell.fill = {
                    type: 'pattern', pattern: 'solid',
                    fgColor: { argb: isInverso ? COLOR_INVERSO : COLOR_POSITIVO }
                };
                cell.font = { name: 'Calibri', size: 10, bold: true };
            }

            // Negrita para nombre y fórmula
            if (colIdx === 2 || colIdx === 5) {
                cell.font = { name: 'Calibri', size: 10, bold: colIdx === 2 };
            }
        });

        row.height = 42;
    });

    // Congelar paneles
    wsMain.views = [{ state: 'frozen', xSplit: 3, ySplit: 3, activeCell: 'D4' }];

    // Autofilter
    wsMain.autoFilter = { from: 'A3', to: 'N3' };


    // ==================== HOJA 2: POR ÁREA ====================
    const areas = [...new Set(kpiDefinitions.map(k => k.area))];

    areas.forEach(areaName => {
        const safeSheetName = areaName.replace(/\//g, '-').replace(/[*?[\]:]/g, '').substring(0, 31);
        const ws = workbook.addWorksheet(safeSheetName, {
            pageSetup: { paperSize: 9, orientation: 'landscape' }
        });
        const bgColor = (areaColors[areaName] || 'FFFFFF').replace('#', '');
        const kpisArea = kpiDefinitions.filter(k => k.area === areaName);

        // Título
        ws.mergeCells('A1:J1');
        const t = ws.getCell('A1');
        t.value = `KPIs — ${areaName.toUpperCase()}`;
        t.font = { name: 'Calibri', bold: true, size: 16, color: { argb: 'FFFFFF' } };
        t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER_BG } };
        t.alignment = { horizontal: 'center', vertical: 'middle' };
        ws.getRow(1).height = 32;

        ws.columns = [
            { key: 'name', width: 38 },
            { key: 'subArea', width: 26 },
            { key: 'formula', width: 50 },
            { key: 'formulaCalculo', width: 45 },
            { key: 'unit', width: 12 },
            { key: 'frecuencia', width: 14 },
            { key: 'responsable', width: 22 },
            { key: 'fuente', width: 22 },
            { key: 'metas', width: 55 },
            { key: 'tipoKPI', width: 26 }
        ];

        const hdrs2 = ['Nombre KPI', 'Sub-Área', 'Fórmula', 'Variables Código', 'Unidad', 'Frecuencia', 'Responsable', 'Fuente', 'Metas por Proveedor', 'Tipo KPI'];
        const hRow = ws.getRow(2);
        hdrs2.forEach((h, i) => {
            const c = hRow.getCell(i + 1);
            c.value = h;
            c.font = { name: 'Calibri', bold: true, size: 11, color: { argb: 'FFFFFF' } };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_SUBHEADER_BG } };
            c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            c.border = { bottom: { style: 'medium', color: { argb: COLOR_HEADER_BG } } };
        });
        hRow.height = 28;

        kpisArea.forEach((kpi, idx) => {
            const r = ws.getRow(idx + 3);
            const isInverso = kpi.tipoKPI.includes('Inverso');
            const vals = [kpi.name, kpi.subArea, kpi.formula, kpi.formulaCalculo, kpi.unit, kpi.frecuencia, kpi.responsable, kpi.fuente, kpi.metas, kpi.tipoKPI];
            vals.forEach((v, ci) => {
                const cell = r.getCell(ci + 1);
                cell.value = v;
                cell.font = { name: 'Calibri', size: 10 };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
                cell.alignment = { vertical: 'middle', wrapText: true };
                cell.border = {
                    top: { style: 'hair', color: { argb: 'CCCCCC' } },
                    bottom: { style: 'hair', color: { argb: 'CCCCCC' } },
                    left: { style: 'thin', color: { argb: 'CCCCCC' } },
                    right: { style: 'thin', color: { argb: 'CCCCCC' } }
                };
                if (ci === 9) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isInverso ? COLOR_INVERSO : COLOR_POSITIVO } };
                    cell.font = { name: 'Calibri', size: 10, bold: true };
                }
            });
            r.height = 40;
        });

        ws.views = [{ state: 'frozen', ySplit: 2, activeCell: 'A3' }];
        ws.autoFilter = { from: 'A2', to: 'J2' };
    });

    // ==================== GUARDAR ====================
    const outputPath = path.join(__dirname, 'Formulas_KPIs_TYM_TAT.xlsx');
    await workbook.xlsx.writeFile(outputPath);
    console.log(`\n✅ Excel generado exitosamente: ${outputPath}`);
    console.log(`📊 Total de KPIs exportados: ${kpiDefinitions.length}`);
    console.log(`📋 Hojas creadas: Fórmulas KPIs + ${areas.length} hojas por área`);
}

generarExcel().catch(err => {
    console.error('❌ Error generando Excel:', err);
    process.exit(1);
});
