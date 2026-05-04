// Indicadores REALES de TYM/TAT 2026 basados en el Excel proporcionado
export const kpiDefinitions = [
    // ========== LOGÍSTICA DE ENTREGA ==========
    {
        id: 'promedio-pedidos-auxiliar',
        name: 'Productividad de Auxiliares por Marca',
        area: 'logistica',
        subArea: 'Logística de Entrega',
        objetivo: 'Mejorar la productividad en la entrega de pedidos',
        meta: {
            ALPINA: 50,
            ZENU: 80,
            UNILEVER: 80
        },
        unit: 'pedidos',
        frecuencia: 'SEMANAL',
        responsable: 'LOGISTICA',
        formula: 'NUMERO DE PEDIDOS X PROVEEDOR / AUXILIARES',
        sustentacion: 'SEMANAL',
        fuente: 'APP DE FLETES'
    },
    {
        id: 'promedio-pedidos-carro',
        name: 'Productividad por Vehículo',
        area: 'logistica',
        subArea: 'Logística de Entrega',
        objetivo: 'Mejorar la productividad en la entrega de pedidos',
        meta: {
            ALPINA: 65,
            ZENU: 80,
            UNILEVER: 80
        },
        unit: 'pedidos',
        frecuencia: 'SEMANAL',
        responsable: 'LOGISTICA',
        formula: 'NUMERO DE PEDIDOS X PROVEEDOR / VEHICULOS',
        sustentacion: 'SEMANAL',
        fuente: 'APP DE FLETES'
    },
    {
        id: 'gasto-nomina-venta',
        name: 'Participación de Nómina en Ventas (Entrega)',
        area: 'logistica',
        subArea: 'Logística de Entrega',
        objetivo: 'Garantizar la Rentabilidad en el proceso de entrega',
        meta: {
            ALPINA: 3.4,
            ZENU: 3.4,
            FLEISCHMANN: 3.4,
            UNILEVER: 3.4,
            FAMILIA: 3.4
        },
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        formula: 'NOMINA LOGISTICA / VENTA TOTAL',
        sustentacion: 'MENSUAL',
        fuente: 'SYT / MAN GO'
    },
    {
        id: 'gasto-fletes-venta',
        name: 'Participación de Fletes en Ventas',
        area: 'logistica',
        subArea: 'Logística de Entrega',
        objetivo: 'Garantizar la Rentabilidad en el proceso de entrega',
        meta: {
            ALPINA: 4.5,
            ZENU: 3.4,
            FLEISCHMANN: 4.5,
            UNILEVER: 4.2,
            FAMILIA: 4.2
        },
        unit: '%',
        frecuencia: 'QUINCENAL',
        responsable: 'CONTADOR',
        responsableTYM: 'CRISTIAN',
        formula: 'VALOR FLETES / VENTA TOTAL',
        sustentacion: 'QUINCENAL',
        fuente: 'MEKANO'
    },
    {
        id: 'horas-extras-auxiliares',
        name: 'Promedio de Horas Extra por Auxiliar',
        area: 'logistica',
        subArea: 'Logística de Entrega',
        objetivo: 'Garantizar la Rentabilidad en el proceso de entrega',
        meta: {
            ALPINA: 1.5,
            ZENU: 1,
            FLEISCHMANN: 1.5,
            UNILEVER: 1,
            FAMILIA: 1
        },
        unit: 'horas',
        frecuencia: 'QUINCENAL',
        responsable: 'GESTIÓN HUMANA',
        formula: '(TOTAL HORAS EXTRAS / AUXILIARES) / 25 DÍAS',
        sustentacion: 'SEMANAL',
        fuente: 'MAN GO'
    },
    {
        id: 'segundos-unidad-separada',
        name: 'Tiempo de Separación por Unidad',
        area: 'logistica',
        subArea: 'Logística de Picking',
        objetivo: 'Garantizar la productividad en el picking de productos',
        meta: {
            ALPINA: 8
        },
        unit: 'segundos',
        frecuencia: 'DIARIO',
        responsable: 'ANALISTA DE INFORMACIÓN',
        formula: 'SEGUNDOS UTILIZADOS / UNIDADES SEPARADAS',
        sustentacion: 'SEMANAL',
        fuente: 'SODISTEC'
    },
    {
        id: 'pesos-separados-hombre',
        name: 'Valor Separado por Operario',
        area: 'logistica',
        subArea: 'Logística de Picking',
        objetivo: 'Garantizar la productividad en le piking de productos',
        meta: {
            ALPINA: 218000000
        },
        unit: '$',
        frecuencia: 'MENSUAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        formula: 'VALOR VENTA / AUXILIARES DE SEPARACIÓN',
        sustentacion: 'SEMANAL',
        fuente: 'SYT'
    },
    {
        id: 'pedidos-separar-total',
        name: 'Eficiencia en Separación de Pedidos',
        area: 'logistica',
        subArea: 'Logística de Picking',
        objetivo: 'Garantizar la eficiencia del turno de separacion',
        meta: {
            ALPINA: 100
        },
        unit: '%',
        frecuencia: 'DIARIO',
        responsable: 'ANALISTA DE INFORMACIÓN',
        formula: 'PEDIDOS SEPARADOS / PEDIDOS FACTURADOS',
        sustentacion: 'SEMANAL',
        fuente: 'SODISTEC'
    },
    {
        id: 'notas-errores-venta',
        name: 'Impacto de Notas por Error',
        area: 'logistica',
        subArea: 'Logística de Picking',
        objetivo: 'Garantizar el % mas bajo de notas por error de venta',
        meta: {
            ALPINA: 1,
            FLEISCHMANN: 1,
            UNILEVER: 1,
            FAMILIA: 1
        },
        unit: '%',
        frecuencia: 'DIARIO',
        responsable: 'ANALISTA DE INFORMACIÓN',
        formula: 'NOTAS X DEVOLUCIÓN / VALOR DE LA VENTA',
        sustentacion: 'SEMANAL',
        fuente: 'SYT'
    },
    {
        id: 'planillas-separadas',
        name: 'Cumplimiento de Separación de Planillas',
        area: 'logistica',
        subArea: 'Logística de Picking',
        objetivo: 'Garantizar la eficiencia del turno de separacion',
        meta: {
            ALPINA: 100,
            FLEISCHMANN: 100,
            UNILEVER: 100,
            FAMILIA: 100
        },
        unit: '%',
        frecuencia: 'DIARIO',
        responsable: 'ANALISTA DE INFORMACIÓN',
        formula: 'PLANILLAS SEPARADAS / PLANILLAS GENERADAS',
        sustentacion: 'SEMANAL',
        fuente: 'SIDIS'
    },
    {
        id: 'nomina-venta-picking',
        name: 'Participación de Nómina en Ventas (Picking)',
        area: 'logistica',
        subArea: 'Logística de Picking',
        objetivo: 'Aumentar la rentabilidad del proceso de picking',
        meta: {
            ALPINA: 1,
            FLEISCHMANN: 1,
            UNILEVER: 1,
            FAMILIA: 1
        },
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        formula: 'VALOR NOMINA / VENTA TOTAL',
        sustentacion: 'MENSUAL',
        fuente: 'SYT / MAN GO'
    },
    {
        id: 'horas-extras-venta-picking',
        name: 'Relación Horas Extra vs Ventas',
        area: 'logistica',
        subArea: 'Logística de Picking',
        objetivo: 'Aumentar la rentabilidad del proceso de picking',
        meta: {
            ALPINA: 1,
            FLEISCHMANN: 1
        },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'GESTIÓN HUMANA',
        formula: 'HORAS EXTRAS / VENTA TOTAL',
        sustentacion: 'SEMANAL',
        fuente: 'MAN GO'
    },

    // ========== LOGÍSTICA DE DEPÓSITO ==========
    {
        id: 'embalajes-perdidos',
        name: 'Pérdida de Embalajes',
        area: 'logistica',
        subArea: 'Logística de Depósito',
        objetivo: 'Reducir la perdida de embalajes',
        meta: {
            ALPINA: 0,
            ZENU: 0,
            FLEISCHMANN: 0,
            UNILEVER: 0,
            FAMILIA: 0
        },
        unit: 'cantidad',
        frecuencia: 'SEMANAL',
        responsable: 'LOGISTICA',
        formula: 'CANASTILLAS RECIBIDAS - CANASTILLAS GESTIONADAS',
        sustentacion: 'SEMANAL',
        fuente: 'CONTROL DE EMBALAJES'
    },
    {
        id: 'nomina-compra-deposito',
        name: 'Participación de Nómina en Ventas (Depósito)',
        area: 'logistica',
        subArea: 'Logística de Depósito',
        objetivo: 'Optimizar la rentabilidad en la Bodega',
        meta: {
            ALPINA: 0.4,
            ZENU: 0.4,
            FLEISCHMANN: 0.4,
            UNILEVER: 0.4,
            FAMILIA: 0.4
        },
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        formula: 'NOMINA DEPOSITO / VENTA TOTAL',
        sustentacion: 'MENSUAL',
        fuente: 'SYT / MAN GO'
    },
    {
        id: 'horas-extras-venta-deposito',
        name: 'Relación Horas Extra vs Ventas',
        area: 'logistica',
        subArea: 'Logística de Depósito',
        objetivo: 'Optimizar la rentabilidad en la Bodega',
        meta: {
            ALPINA: 1,
            ZENU: 1,
            FLEISCHMANN: 1
        },
        unit: '%',
        frecuencia: 'QUINCENAL',
        responsable: 'GESTIÓN HUMANA',
        formula: 'HORAS EXTRAS / VENTA TOTAL',
        sustentacion: 'SEMANAL',
        fuente: 'SYT / MAN GO'
    },

    // ========== TALENTO HUMANO ==========
    {
        id: 'rotacion-personal',
        name: 'Rotación de Personal',
        area: 'talento-humano',
        objetivo: 'Reducir la rotación de personal en las diferentes áreas',
        meta: {
            ALPINA: 5,
            ZENU: 5,
            FLEISCHMANN: 5,
            UNILEVER: 5,
            FAMILIA: 5
        },
        brands: ['TYM', 'TAT'],
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        formula: '(# de salidas / promedio empleados) x 100',
        sustentacion: 'MENSUAL',
        fuente: 'MAN GO'
    },
    {
        id: 'ausentismo',
        name: 'Índice de Ausentismo',
        area: 'talento-humano',
        objetivo: 'Reducir el ausentismo en los equipos',
        meta: {
            ALPINA: 2.5,
            ZENU: 2.5,
            FLEISCHMANN: 2.5,
            UNILEVER: 2.5,
            FAMILIA: 2.5
        },
        brands: ['TYM', 'TAT'],
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        formula: 'Días perdidos / Días laborados',
        sustentacion: 'SEMANAL',
        fuente: 'MAN GO'
    },
    {
        id: 'calificacion-auditoria',
        name: 'Cumplimiento SST',
        area: 'sst-cultura',
        objetivo: 'Ejecutar el Sistema de Gestión SST',
        meta: {
            TYM: 90,
            TAT: 90
        },
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'SST_CULTURA',
        formula: 'Actividades ejecutadas / Actividades programadas',
        sustentacion: 'MENSUAL',
        fuente: 'SYCH'
    },
    {
        id: 'he-rn-nomina',
        name: 'Participación de Horas Extra en Nómina',
        area: 'talento-humano',
        objetivo: 'Reducir el pago por H.E-R.N',
        meta: {
            ALPINA: 3,
            ZENU: 3,
            FLEISCHMANN: 3,
            UNILEVER: 3,
            FAMILIA: 3
        },
        brands: ['TYM', 'TAT'],
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        formula: 'Valor HED HEN / Total nómina',
        sustentacion: 'MENSUAL',
        fuente: 'MAN GO'
    },
    {
        id: 'gasto-nomina-venta-rrhh',
        name: 'Participación de Nómina en Ventas',
        area: 'talento-humano',
        objetivo: 'Garantizar la rentabilidad de la compañía en la nómina',
        meta: {
            ALPINA: 11,
            ZENU: 11,
            FLEISCHMANN: 11,
            UNILEVER: 11,
            FAMILIA: 11
        },
        brands: ['TYM', 'TAT'],
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        formula: 'Valor Nomina / Venta total',
        sustentacion: 'MENSUAL',
        fuente: 'SYT / MAN GO'
    },
    {
        id: 'actividades-cultura',
        name: 'Actividades de Cultura Organizacional',
        area: 'sst-cultura',
        objetivo: 'Fortalecer la cultura organizacional por medio de actividades',
        meta: {
            TYM: 100,
            TAT: 100
        },
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'SST_CULTURA',
        formula: 'Actividades ejecutadas / Actividades programadas',
        sustentacion: 'MENSUAL',
        fuente: 'GESTIÓN HUMANA'
    },
    {
        id: 'tiempo-contratacion',
        name: 'Tiempo de Cobertura de Vacantes',
        area: 'sst-cultura',
        objetivo: 'Reducir el tiempo de respuesta en contrataciones',
        meta: {
            TYM: 8,
            TAT: 8
        },
        unit: 'días',
        frecuencia: 'QUINCENAL',
        responsable: 'SST_CULTURA',
        formula: 'Días de respuesta en contratación',
        sustentacion: 'QUINCENAL'
    },

    // ========== CAJA ==========
    {
        id: 'arqueos-realizados',
        name: 'Cumplimiento de Arqueos',
        area: 'contabilidad',
        objetivo: 'Garantizar el control permanente del efectivo. Comisión: $100.000',
        meta: {
            TYM: 4,
            TAT: 4
        },
        brands: ['TYM', 'TAT'],
        unit: 'arqueos',
        frecuencia: 'SEMANAL',
        responsable: 'CONTADOR',
        responsableTYM: 'CRISTIAN',
        formula: 'ARQUEOS REALIZADOS / ARQUEOS PROGRAMADOS (Incluye reporte de Sobras/Faltantes)',
        sustentacion: 'SEMANAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'indice-arqueo-caja',
        name: 'Índice de Arqueo en Caja',
        area: 'contabilidad',
        objetivo: 'Seguimiento de diferencias en arqueos de caja (Sobra - Faltante)',
        meta: {
            TYM: 0,
            TAT: 0
        },
        brands: ['TYM', 'TAT'],
        unit: 'arqueos',
        frecuencia: 'SEMANAL',
        responsable: 'CONTADOR',
        responsableTYM: 'CRISTIAN',
        formula: 'Número de arqueos con diferencia (Sobra - Faltante)',
        sustentacion: 'SEMANAL',
        fuente: 'CONTABILIDAD',
        visibleEnAreas: ['caja', 'contabilidad']
    },
    {
        id: 'planillas-cerradas',
        name: 'Cierre de Planillas',
        area: 'caja',
        objetivo: 'Ejecutar el cierre de planillas diario. Comisión: $100.000',
        meta: {
            ALPINA: 100,
            ZENU: 100,
            FLEISCHMANN: 100,
            UNILEVER: 100,
            FAMILIA: 100
        },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'CONTADOR',
        responsableTYM: 'CRISTIAN',
        formula: 'PLANILLAS CERRADAS / PLANILLAS GENERADAS',
        sustentacion: 'SEMANAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'vales-descuadres',
        name: 'Participación de Vales en Cuadres',
        area: 'caja',
        objetivo: 'Reducir el valor de vales generados en caja por descuadres',
        meta: {
            ALPINA: 0.5,
            ZENU: 0.5,
            FLEISCHMANN: 0.5,
            UNILEVER: 0.5,
            FAMILIA: 0.5
        },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'CONTADOR',
        responsableTYM: 'CRISTIAN',
        formula: 'VALOR DE VALES / TOTAL CUADRE DE CAJA',
        sustentacion: 'VIERNES',
        fuente: 'CONTABILIDAD'
    },

    // ========== CARTERA ==========
    {
        id: 'cartera-no-vencida',
        name: 'Cartera al Día',
        area: 'cartera',
        objetivo: 'Mejorar la rotación de cartera con los clientes',
        meta: {
            ALPINA: 10,
            ZENU: 10,
            FLEISCHMANN: 10,
            UNILEVER: 10,
            FAMILIA: 10
        },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'CARTERA',
        formula: 'TOTAL CARTERA VENCIDA / TOTAL VENTA',
        sustentacion: 'QUINCENAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'cartera-mayor-30',
        name: 'Cartera Mayor a 30 Días',
        area: 'cartera',
        objetivo: 'Mejorar la rotación de cartera con los clientes',
        meta: {
            ALPINA: 5,
            ZENU: 5,
            FLEISCHMANN: 5,
            UNILEVER: 5,
            FAMILIA: 5
        },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'CARTERA',
        formula: 'TOTAL MAYOR A 30 / TOTAL CARTERA',
        sustentacion: 'QUINCENAL',
        fuente: 'CONTABILIDAD'
    },

    {
        id: 'recircularizaciones',
        name: 'Cumplimiento de Circularizaciones',
        area: 'cartera',
        objetivo: 'Fortalecer el control interno con la cartera a la calle',
        meta: {
            ALPINA: 2,
            ZENU: 2,
            FLEISCHMANN: 2,
            UNILEVER: 2,
            FAMILIA: 2
        },
        unit: 'cantidad',
        frecuencia: 'BIMESTRAL',
        responsable: 'CARTERA',
        formula: 'EFECTUADAS / PROGRAMADAS',
        sustentacion: 'BIMESTRAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'valor-cartera-venta',
        name: 'Relación Cartera vs Ventas',
        area: 'cartera',
        objetivo: 'Garantizar los Flujos de las compañías',
        meta: {
            ALPINA: 10,
            ZENU: 10,
            FLEISCHMANN: 10,
            FAMILIA: 20,
            UNILEVER: 20
        },
        unit: '%',
        frecuencia: 'QUINCENAL',
        responsable: 'CARTERA',
        formula: 'VENTA CREDITO / TOTAL VENTA',
        sustentacion: 'QUINCENAL',
        fuente: 'CONTABILIDAD'
    },

    // ========== CONTABILIDAD ==========
    {
        id: 'dias-cierre',
        name: 'Cumplimiento de Tiempo de Cierre',
        area: 'contabilidad',
        objetivo: 'Ejecutar los cierres contables de mes en los tiempos óptimos',
        meta: 12,
        unit: 'días',
        frecuencia: 'MENSUAL',
        responsable: 'CONTADOR',
        responsableTYM: 'JULIANA',
        formula: 'DIAS PARA EL REPORTE / TOTAL DIAS AL CIERRE',
        sustentacion: 'MENSUAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'ajustes-posteriores',
        name: 'Ajustes Posteriores al Cierre',
        area: 'contabilidad',
        objetivo: 'Garantizar la confiabilidad de los cierres contables',
        meta: 1,
        unit: 'cantidad',
        frecuencia: 'MENSUAL',
        responsable: 'CONTADOR',
        responsableTYM: 'JULIANA',
        formula: 'AJUSTES POSTERIORES',
        sustentacion: 'MENSUAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'ajustes-revisoria',
        name: 'Ajustes por Revisoría Fiscal',
        area: 'contabilidad',
        objetivo: 'Garantizar la confiabilidad de los cierres contables',
        meta: 1,
        unit: 'cantidad',
        frecuencia: 'MENSUAL',
        responsable: 'CONTADOR',
        responsableTYM: 'JULIANA',
        formula: 'AJUSTES REVISOR FISCAL',
        sustentacion: 'MENSUAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'rotacion-cxc',
        name: 'Rotación de Cuentas por Cobrar',
        area: 'contabilidad',
        objetivo: 'Mejorar la rotación en las cuentas por cobrar a clientes',
        meta: {
            TYM: 1.5,
            TAT: 1.5
        },
        unit: 'veces',
        frecuencia: 'MENSUAL',
        responsable: 'CONTADOR',
        responsableTYM: 'JULIANA',
        formula: '360 / (VENTAS CREDITO / ((CXC INICIAL + CXC FINAL) / 2))',
        sustentacion: 'MENSUAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'rotacion-cxp',
        name: 'Rotación de Cuentas por Pagar',
        area: 'contabilidad',
        objetivo: 'Garantizar la rotación en las cuentas por pagar a proveedores',
        meta: {
            TYM: 1.5,
            TAT: 1.5
        },
        unit: 'veces',
        frecuencia: 'MENSUAL',
        responsable: 'CONTADOR',
        responsableTYM: 'JULIANA',
        formula: '360 / (COMPRAS CREDITO / ((CXP INICIAL + CXP FINAL) / 2))',
        sustentacion: 'MENSUAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'conciliaciones-bancarias',
        name: 'Cumplimiento de Conciliaciones Bancarias',
        area: 'contabilidad',
        objetivo: 'Fortalecer el control interno. Comisión: $100.000',
        meta: 8,
        unit: 'cantidad',
        frecuencia: 'QUINCENAL',
        responsable: 'CONTADOR',
        responsableTYM: 'JULIANA',
        formula: 'CONCILIACIONES REALIZADAS / CONCILIACIONES REQUERIDAS',
        sustentacion: 'QUINCENAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'conciliaciones-diarias',
        name: 'Verificación de Consignaciones',
        area: 'contabilidad',
        objetivo: 'Asegurar la cuadratura diaria entre sistema y banco',
        meta: 100,
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'CONTADOR',
        responsableTYM: 'CRISTIAN',
        formula: 'CONCILIACIONES EN SISTEMA / CONCILIACIONES EN BANCO',
        sustentacion: 'VIERNES',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'activos-conciliados',
        name: 'Conciliación de Activos',
        area: 'contabilidad',
        objetivo: 'Fortalecer el control interno',
        meta: {
            TYM: 94,
            TAT: 94
        },
        unit: '%',
        frecuencia: 'BIMESTRAL',
        responsable: 'CONTADOR',
        responsableTYM: 'JULIANA',
        formula: 'ACTIVOS CONCILIADOS / ACTIVOS REGISTRADOS',
        sustentacion: 'BIMENSUAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'multas-sanciones',
        name: 'Impacto de Sanciones Tributarias',
        area: 'contabilidad',
        objetivo: 'Fortalecer el control interno',
        meta: {
            TYM: 0.1,
            TAT: 0.1
        },
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'CONTADOR',
        responsableTYM: 'JULIANA',
        formula: 'MULTAS O SANCIONES / INGRESO',
        sustentacion: 'MENSUAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'optimizacion-tributaria',
        name: 'Optimización de Impuestos',
        area: 'contabilidad',
        objetivo: 'Optimizar la carga tributaria buscando mejores flujos y rentabilidad',
        meta: {
            TYM: 0,
            TAT: 0
        },
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'CONTADOR',
        responsableTYM: 'JULIANA',
        formula: 'IMPUESTOS OPTIMIZADOS / TOTAL IMPUESTOS',
        sustentacion: 'MENSUAL',
        fuente: 'CONTABILIDAD'
    },

    // ========== COMERCIAL ==========
    {
        id: 'venta-realizada-esperada',
        name: 'Cumplimiento de Ventas',
        description: 'Venta realizada / esperada',
        area: 'comercial',
        subArea: 'Gestión de Ventas',
        objetivo: 'Cumplimiento de presupuesto de ventas',
        meta: {
            ALPINA: 100,
            ZENU: 100,
            FLEISCHMANN: 100
        },
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        formula: 'VENTA REALIZADA / PRESUPUESTO DE VENTA',
        sustentacion: 'COMERCIAL',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },
    {
        id: 'primer-margen',
        name: 'Margen Bruto',
        description: '(ventas - costo de ventas) / ventas x 100',
        area: 'comercial',
        subArea: 'Gestión de Ventas',
        objetivo: 'Optimizar la rentabilidad bruta',
        meta: {
            ALPINA: 12,
            FAMILIA: 10,
            UNILEVER: 8,
            FLEISCHMANN: 10,
            ZENU: 11
        },
        unit: '%',
        frecuencia: 'QUINCENAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        formula: '(VENTAS - COSTO DE VENTAS) / VENTAS X 100',
        sustentacion: 'COMERCIAL',
        frecuenciaSustentacion: 'QUINCENAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },
    {
        id: 'devoluciones-buen-estado',
        name: 'Devoluciones en Buen Estado',
        description: '$ devolucion buen estado / total de la venta',
        area: 'comercial',
        subArea: 'Servicio y Devoluciones',
        objetivo: 'Controlar devoluciones aptas para re-venta',
        meta: {
            ALPINA: 1.8,
            ZENU: 1.8,
            FLEISCHMANN: 1.8,
            UNILEVER: 1.8,
            FAMILIA: 1.8
        },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        formula: 'DEVOLUCIÓN BUEN ESTADO / VENTA TOTAL',
        sustentacion: 'COMERCIAL',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },
    {
        id: 'devoluciones-mal-estado-comercial',
        name: 'Devoluciones en Mal Estado',
        description: '$ devolucion mal estado / venta',
        area: 'comercial',
        subArea: 'Servicio y Devoluciones',
        objetivo: 'Disminuir mermas por devoluciones averiadas',
        meta: {
            ALPINA: 0.5,
            FAMILIA: 0.5,
            UNILEVER: 0.5,
            FLEISCHMANN: 0.5,
            ZENU: 0.5
        },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        formula: 'DEVOLUCIÓN MAL ESTADO / VENTA TOTAL',
        sustentacion: 'COMERCIAL',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },
    {
        id: 'promedio-venta-vendedor',
        name: 'Ventas Promedio por Vendedor',
        description: 'Ventas totales / # vendedores',
        area: 'comercial',
        subArea: 'Gestión de Ventas',
        objetivo: 'Aumentar la productividad de la fuerza comercial',
        meta: {
            ALPINA: 60000000,
            FAMILIA: 50000000,
            UNILEVER: 55000000,
            FLEISCHMANN: 45000000,
            ZENU: 48000000
        },
        unit: '$',
        frecuencia: 'MENSUAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        formula: 'VENTA TOTAL / VENDEDORES',
        sustentacion: 'COMERCIAL',
        frecuenciaSustentacion: 'MENSUAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },
    {
        id: 'participacion-venta-credito',
        name: 'Participación de Ventas a Crédito',
        description: 'Venta credito / Venta total',
        area: 'comercial',
        subArea: 'Cartera y Crédito',
        objetivo: 'Optimizar el recaudo inmediato',
        meta: {
            ALPINA: 10,
            ZENU: 10,
            FAMILIA: 12,
            UNILEVER: 10,
            FLEISCHMANN: 8
        },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'CARTERA',
        formula: 'VENTA CREDITO / VENTA TOTAL',
        sustentacion: 'COMERCIAL',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'CARTERA'
    },
    {
        id: 'cobro-optimo-cartera',
        name: 'Cartera Vencida',
        description: 'Cartera vencida / Total de cartera',
        area: 'comercial',
        subArea: 'Cartera y Crédito',
        objetivo: 'Reducir la mora en el recaudo',
        meta: 80,
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'CARTERA',
        formula: 'CARTERA VENCIDA / TOTAL CARTERA',
        sustentacion: 'COMERCIAL',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'CARTERA'
    },
    {
        id: 'rotacion-equipo-comercial',
        name: 'Rotación de Personal',
        description: '(# de salidas / promedio empleados) x 100',
        area: 'comercial',
        subArea: 'Operación y Gastos',
        objetivo: 'Fomentar la estabilidad laboral',
        meta: {
            ALPINA: 3.5,
            FAMILIA: 3.5,
            UNILEVER: 3.5,
            FLEISCHMANN: 3.5,
            ZENU: 3.5
        },
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        formula: 'PERSONAL RETIRADO / PROMEDIO DE EMPLEADOS',
        sustentacion: 'COMERCIAL',
        frecuenciaSustentacion: 'MENSUAL',
        fuente: 'MAN GO'
    },
    {
        id: 'gasto-personal-comercial',
        name: 'Participación de Gastos de Personal',
        description: 'Gastos de personal / total venta',
        area: 'comercial',
        subArea: 'Operación y Gastos',
        objetivo: 'Controlar costos operativos comerciales',
        meta: {
            ALPINA: 5,
            ZENU: 5,
            FLEISCHMANN: 5,
            UNILEVER: 5,
            FAMILIA: 5
        },
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        formula: 'GASTOS DE PERSONAL / TOTAL VENTA',
        sustentacion: 'COMERCIAL',
        frecuenciaSustentacion: 'MENSUAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'gasto-viaje-comercial',
        name: 'Participación de Gastos de Viaje',
        description: 'Gastos de viaje / total ventas',
        area: 'comercial',
        subArea: 'Operación y Gastos',
        objetivo: 'Optimizar gastos de representación y viaje',
        meta: {
            ALPINA: 0.2,
            ZENU: 0.2,
            FLEISCHMANN: 0.2,
            UNILEVER: 0.2,
            FAMILIA: 0.2
        },
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'CONTADOR',
        formula: 'GASTOS DE VIAJE / TOTAL VENTA',
        sustentacion: 'COMERCIAL',
        frecuenciaSustentacion: 'QUINCENAL',
        fuente: 'CONTABILIDAD'
    },

    {
        id: 'dias-inventario-comercial',
        name: 'Días Promedio de Inventario',
        description: 'Dias promedio de inventario / meta',
        area: 'comercial',
        subArea: 'Operación y Gastos',
        objetivo: 'Optimizar rotación de inventarios para flujo de caja',
        meta: {
            ALPINA: 7,
            FLEISCHMANN: 7,
            UNILEVER: 45,
            FAMILIA: 18,
            POLAR: 18
        },
        unit: 'días',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        formula: 'DIAS DE INVENTARIO / META',
        sustentacion: 'COMERCIAL',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },

    // ========== ADMINISTRATIVO (INFORMACIÓN / INVENTARIO) ==========
    {
        id: 'inventarios-realizados',
        name: 'Cumplimiento de Inventarios',
        description: '# de inventarios realizados / programados',
        area: 'administrativo',
        subArea: 'Control de Inventarios',
        objetivo: 'Garantizar el control físico de existencias',
        meta: {
            ALPINA: 2,
            ZENU: 2,
            FLEISCHMANN: 2,
            UNILEVER: 2,
            FAMILIA: 2
        },
        unit: 'cantidad',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        formula: 'INVENTARIOS REALIZADOS',
        sustentacion: 'ANALISTA DE INVENTARIOS',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },
    {
        id: 'fiabilidad-inventarios',
        name: 'Exactitud de Inventario',
        description: '(Valor verificado / valor correcto) x 100',
        area: 'administrativo',
        subArea: 'Control de Inventarios',
        objetivo: 'Asegurar la exactitud de los registros contables',
        meta: {
            ALPINA: 100,
            ZENU: 100,
            FLEISCHMANN: 100,
            UNILEVER: 100,
            FAMILIA: 100
        },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        formula: '(VALOR VERIFICADO / VALOR CORRECTO) * 100',
        sustentacion: 'ANALISTA DE INVENTARIOS',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },
    {
        id: 'quiebres-inventario',
        name: 'Quiebres de Inventario',
        description: '# de quiebres de inventario en le periodo',
        area: 'administrativo',
        subArea: 'Control de Inventarios',
        objetivo: 'Minimizar pedidos no servidos por falta de stock',
        meta: {
            ALPINA: 0,
            ZENU: 0,
            FLEISCHMANN: 0,
            UNILEVER: 0,
            FAMILIA: 0
        },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        formula: 'QUIEBRES DE INVENTARIO / TOTAL SKU',
        sustentacion: 'ANALISTA DE INVENTARIOS',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },
    {
        id: 'obsolescencia',
        name: 'Inventario Obsoleto',
        description: '(Inventario obsoleto / inventario total) x 100',
        area: 'administrativo',
        subArea: 'Control de Inventarios',
        objetivo: 'Reducir pérdidas por productos vencidos o sin rotación',
        meta: {
            ALPINA: 0,
            ZENU: 0,
            FLEISCHMANN: 0,
            UNILEVER: 0,
            FAMILIA: 0
        },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        formula: '(INVENTARIO OBSOLETO / INVENTARIO TOTAL) * 100',
        sustentacion: 'ANALISTA DE INVENTARIOS',
        frecuenciaSustentacion: 'MENSUAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },
    {
        id: 'mermas',
        name: 'Mermas de Inventario',
        description: '(Valor mermas / inventario total) x 100',
        area: 'administrativo',
        subArea: 'Control de Inventarios',
        objetivo: 'Controlar pérdidas físicas de mercancía',
        meta: {
            ALPINA: 0,
            ZENU: 0,
            FLEISCHMANN: 0,
            UNILEVER: 0,
            FAMILIA: 0
        },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        formula: '(VALOR MERMAS / INVENTARIO TOTAL) * 100',
        sustentacion: 'ANALISTA DE INVENTARIOS',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },

    {
        id: 'revision-margenes',
        name: 'Cumplimiento de Revisión de Márgenes',
        description: '(Ejecutadas / Programadas) * 100',
        area: 'administrativo',
        subArea: 'Auditoría y Parámetros',
        objetivo: 'Verificar rentabilidad parametrizada',
        meta: {
            ALPINA: 100,
            ZENU: 100,
            FLEISCHMANN: 100,
            UNILEVER: 100,
            FAMILIA: 100
        },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        formula: '(REVISIONES EJECUTADAS / REVISIONES PROGRAMADAS) * 100',
        sustentacion: 'ANALISTA DE INVENTARIOS',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },
    {
        id: 'revision-precios',
        name: 'Cumplimiento de Revisión de Precios',
        description: '(Ejecutadas / Programadas) * 100',
        area: 'administrativo',
        subArea: 'Auditoría y Parámetros',
        objetivo: 'Evitar errores de facturación al cliente',
        meta: {
            ALPINA: 100,
            ZENU: 100,
            FLEISCHMANN: 100,
            UNILEVER: 100,
            FAMILIA: 100
        },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        formula: '(REVISIONES EJECUTADAS / REVISIONES PROGRAMADAS) * 100',
        sustentacion: 'ANALISTA DE INVENTARIOS',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },
    // ========== FACTURACIÓN ==========
    {
        id: 'pedidos-devueltos',
        name: 'Índice de Devoluciones',
        area: 'facturacion',
        subArea: 'Operación Facturación',
        objetivo: 'Garantizar el % mas alto de efectividad en la entrega',
        meta: {
            ALPINA: 1.80,
            ZENU: 1.80,
            FLEISCHMANN: 1.80,
            UNILEVER: 1.80,
            FAMILIA: 1.80
        },
        unit: '%',
        frecuencia: 'DIARIO',
        responsable: 'FACTURACION',
        formula: 'PEDIDOS DEVUELTOS / PEDIDOS FACTURADOS',
        sustentacion: 'SEMANAL',
        fuente: 'APP DE DEVOLUCIONES'
    },
    {
        id: 'averias-venta',
        name: 'Índice de Averías',
        area: 'facturacion',
        subArea: 'Operación Facturación',
        objetivo: 'Optimizar la rentabilidad en la Bodega',
        meta: {
            ALPINA: 0.20,
            ZENU: 0.20,
            FLEISCHMANN: 0.20,
            UNILEVER: 0.20,
            FAMILIA: 0.20
        },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'FACTURACION',
        formula: 'TOTAL AVERIAS / VENTA TOTAL',
        sustentacion: 'QUINCENAL',
        fuente: 'SYT'
    },
    {
        id: 'pedidos-facturados',
        name: 'Pedidos Facturados',
        area: 'facturacion',
        subArea: 'Operación Facturación',
        objetivo: 'Garantizar que cada pedido tenga su factura correspondiente',
        meta: {
            ALPINA: 100,
            ZENU: 100,
            FLEISCHMANN: 100,
            UNILEVER: 100,
            FAMILIA: 100,
            TAT: 100
        },
        unit: '%',
        frecuencia: 'DIARIO',
        responsable: 'FACTURACION',
        formula: 'FACTURAS / PEDIDOS',
        sustentacion: 'SEMANAL',
        fuente: 'SISTEMA FACTURACIÓN'
    },
    {
        id: 'impresion-facturas',
        name: 'Control Operativo De Facturación',
        area: 'facturacion',
        subArea: 'Operación Facturación',
        objetivo: 'Garantizar que todas las facturas generadas sean impresas',
        meta: {
            ALPINA: 100,
            ZENU: 100,
            FLEISCHMANN: 100,
            UNILEVER: 100,
            FAMILIA: 100,
            TAT: 100
        },
        unit: '%',
        frecuencia: 'DIARIO',
        responsable: 'FACTURACION',
        formula: 'FACTURAS IMPRESAS / FACTURAS GENERADAS',
        sustentacion: 'SEMANAL',
        fuente: 'REGISTRO DE IMPRESIÓN'
    },
    {
        id: 'error-facturacion',
        name: 'Error sobre la Facturación',
        area: 'facturacion',
        subArea: 'Operación Facturación',
        objetivo: 'Minimizar errores en el proceso de facturación',
        meta: {
            ALPINA: 0.5,
            ZENU: 0.5,
            FLEISCHMANN: 0.5,
            UNILEVER: 0.5,
            FAMILIA: 0.5,
            TAT: 0.5
        },
        unit: '%',
        frecuencia: 'DIARIO',
        responsable: 'LOGISTICA',
        formula: 'ERRORES / FACTURAS',
        sustentacion: 'SEMANAL',
        fuente: 'REPORTE DE CALIDAD'
    },

    // ========== SOFTWARE Y TI ==========
    {
        id: 'tareas-programadas',
        name: 'Cumplimiento de Tareas Programadas',
        area: 'software',
        subArea: 'Gestión Software y TI',
        objetivo: 'Garantizar la ejecución de tareas críticas del sistema',
        meta: { TYM: 100, TAT: 100 },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'GESTIÓN HUMANA',
        formula: '(TAREAS EJECUTADAS / TAREAS PROGRAMADAS) * 100',
        sustentacion: 'REPORTE TI',
        fuente: 'PLATAFORMA DE GESTIÓN',
        visibleEnAreas: ['software', 'talento-humano']
    },
    {
        id: 'mantenimiento-equipos',
        name: 'Mantenimiento Preventivo de Equipos',
        area: 'software',
        subArea: 'Gestión Software y TI',
        objetivo: 'Asegurar la vida útil de los equipos de cómputo',
        meta: { TYM: 3, TAT: 3 },
        unit: 'mantenimientos',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        formula: 'EQUIPOS MANTENIDOS',
        sustentacion: 'REPORTE TI',
        fuente: 'BITÁCORA DE SOPORTE',
        visibleEnAreas: ['software', 'talento-humano']
    },
    {
        id: 'resolucion-incidencias',
        name: 'Efectividad en Resolución de Incidencias',
        area: 'software',
        subArea: 'Gestión Software y TI',
        objetivo: 'Evitar la recurrencia de errores técnicos',
        meta: { TYM: 95, TAT: 95 },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'GESTIÓN HUMANA',
        formula: '(TOTAL INCIDENCIAS - INCIDENCIAS RECURRENTES) / TOTAL INCIDENCIAS * 100',
        sustentacion: 'REPORTE TI',
        fuente: 'HELPDESK',
        visibleEnAreas: ['software', 'talento-humano']
    }
];

export const getKPIsByArea = (areaId) =>
    kpiDefinitions.filter(kpi => kpi.area === areaId);

export const getKPIById = (id) =>
    kpiDefinitions.find(kpi => kpi.id === id);
