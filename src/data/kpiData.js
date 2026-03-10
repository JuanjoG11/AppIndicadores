// Indicadores REALES de TYM/TAT 2026 basados en el Excel proporcionado
export const kpiDefinitions = [
    // ========== LOGÍSTICA DE ENTREGA ==========
    {
        id: 'pedidos-devueltos',
        name: 'Índice de Devoluciones',
        area: 'logistica',
        subArea: 'Logística de Entrega',
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
        responsable: 'LOGISTICA',
        formula: 'PEDIDOS DEVUELTOS / PEDIDOS FACTURADOS',
        sustentacion: 'SEMANAL',
        fuente: 'APP DE DEVOLUCIONES'
    },
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
        name: 'Participación de Nómina en Ventas',
        area: 'logistica',
        subArea: 'Logística de Entrega',
        objetivo: 'Garantizar la Rentabilidad en el proceso de entrega',
        meta: {
            ALPINA: 3.4,
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
        frecuencia: 'SEMANAL',
        responsable: 'CONTADOR',
        formula: 'VALOR FLETES / VENTA TOTAL',
        sustentacion: 'SEMANAL',
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
        formula: 'TOTAL HORAS EXTRAS / AUXILIARES',
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
            ZENU: 1,
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
        name: 'Participación de Nómina en Ventas',
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
            ALPINA: 1
        },
        unit: 'valor',
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
            ALPINA: 0
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
        name: 'Participación de Nómina en Venta',
        area: 'logistica',
        subArea: 'Logística de Depósito',
        objetivo: 'Optimizar la rentabilidad en la Bodega',
        meta: {
            ALPINA: 0.4,
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
            ALPINA: 1
        },
        unit: 'valor',
        frecuencia: 'QUINCENAL',
        responsable: 'GESTIÓN HUMANA',
        formula: 'HORAS EXTRAS / VENTA TOTAL',
        sustentacion: 'SEMANAL',
        fuente: 'SYT / MAN GO'
    },
    {
        id: 'averias-venta',
        name: 'Índice de Averías',
        area: 'logistica',
        subArea: 'Logística de Depósito',
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
        responsable: 'LOGISTICA',
        formula: 'TOTAL AVERIAS / VENTA TOTAL',
        sustentacion: 'QUINCENAL',
        fuente: 'SYT'
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
        name: 'Cumplimiento de Auditoría (SST/SGC)',
        area: 'talento-humano',
        objetivo: 'Ejecutar el Sistema de Gestión',
        meta: {
            ALPINA: 90,
            ZENU: 90,
            FLEISCHMANN: 90,
            UNILEVER: 90,
            FAMILIA: 90
        },
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
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
        area: 'talento-humano',
        objetivo: 'Fortalecer la cultura organizacional por medio de actividades',
        meta: {
            ALPINA: 100,
            ZENU: 100,
            FLEISCHMANN: 100,
            UNILEVER: 100,
            FAMILIA: 100
        },
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        formula: 'Actividades ejecutadas / Actividades programadas',
        sustentacion: 'MENSUAL',
        fuente: 'GESTIÓN HUMANA'
    },
    {
        id: 'tiempo-contratacion',
        name: 'Tiempo de Cobertura de Vacantes',
        area: 'talento-humano',
        objetivo: 'Reducir el tiempo de respuesta en contrataciones',
        meta: {
            ALPINA: 8,
            ZENU: 8,
            FLEISCHMANN: 8,
            UNILEVER: 8,
            FAMILIA: 8
        },
        unit: 'días',
        frecuencia: 'QUINCENAL',
        responsable: 'GESTIÓN HUMANA',
        sustentacion: 'QUINCENAL'
    },

    // ========== CAJA ==========
    {
        id: 'arqueos-realizados',
        name: 'Cumplimiento de Arqueos',
        area: 'caja',
        objetivo: 'Garantizar el control permanente del efectivo',
        meta: {
            ALPINA: 8,
            ZENU: 8,
            FLEISCHMANN: 8,
            UNILEVER: 8,
            FAMILIA: 8
        },
        unit: 'arqueos',
        frecuencia: 'SEMANAL',
        responsable: 'CONTADOR',
        formula: 'ARQUEOS REALIZADOS / ARQUEOS PROGRAMADOS',
        sustentacion: 'SEMANAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'planillas-cerradas',
        name: 'Cierre de Planillas',
        area: 'caja',
        objetivo: 'Ejecutar el cierre de planillas diario',
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
        formula: 'PLANILLAS CERRADAS / PLANILLAS GENERADAS',
        sustentacion: 'SEMANAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'vales-descuadres',
        name: 'Participación de Vales en Caja',
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
        formula: 'VALOR DE VALES / TOTAL CUADRE DE CAJA',
        sustentacion: 'SEMANAL',
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
        responsable: 'CONTADOR',
        formula: 'TOTAL CARTERA VENCIDA / TOTAL VENTA',
        sustentacion: 'QUINCENAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'cartera-11-30',
        name: 'Cartera 11 a 30 Días',
        area: 'cartera',
        objetivo: 'Mejorar la rotación de cartera con los clientes',
        meta: {
            ALPINA: 90,
            ZENU: 90,
            FLEISCHMANN: 90,
            UNILEVER: 90,
            FAMILIA: 90
        },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'CONTADOR',
        formula: 'TOTAL CARTERA 11-30 / TOTAL CARTERA',
        sustentacion: 'QUINCENAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'cartera-31-45',
        name: 'Cartera 31 a 45 Días',
        area: 'cartera',
        objetivo: 'Mejorar la rotación de cartera con los clientes',
        meta: {
            ALPINA: 8,
            ZENU: 8,
            FLEISCHMANN: 8,
            UNILEVER: 8,
            FAMILIA: 8
        },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'CONTADOR',
        formula: 'TOTAL CARTERA 31-45 / TOTAL CARTERA',
        sustentacion: 'QUINCENAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'cartera-mayor-45',
        name: 'Cartera Mayor a 45 Días',
        area: 'cartera',
        objetivo: 'Mejorar la rotación de cartera con los clientes',
        meta: {
            ALPINA: 2,
            ZENU: 2,
            FLEISCHMANN: 2,
            UNILEVER: 2,
            FAMILIA: 2
        },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'CONTADOR',
        formula: 'TOTAL MAYOR A 45 / TOTAL CARTERA',
        sustentacion: 'QUINCENAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'recircularizaciones',
        name: 'Cumplimiento de Recircularizaciones',
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
        responsable: 'CONTADOR',
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
            FAMILIA: 20,
            UNILEVER: 20,
            ZENU: 15
        },
        unit: '%',
        frecuencia: 'QUINCENAL',
        responsable: 'CONTADOR',
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
        formula: 'AJUSTES POSTERIORES / TOTAL AJUSTES',
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
        formula: 'AJUSTES REVISOR FISCAL / TOTAL AJUSTES',
        sustentacion: 'MENSUAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'rotacion-cxc',
        name: 'Rotación de Cuentas por Cobrar',
        area: 'contabilidad',
        objetivo: 'Mejorar la rotación en las cuentas por cobrar a clientes',
        meta: {
            TYM: 0,
            TAT: 0
        },
        unit: 'veces',
        frecuencia: 'MENSUAL',
        responsable: 'CONTADOR',
        formula: 'VENTAS CREDITO / CUENTAS POR COBRAR',
        sustentacion: 'MENSUAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'rotacion-cxp',
        name: 'Rotación de Cuentas por Pagar',
        area: 'contabilidad',
        objetivo: 'Garantizar la rotación en las cuentas por pagar a proveedores',
        meta: {
            TYM: 0,
            TAT: 0
        },
        unit: 'veces',
        frecuencia: 'MENSUAL',
        responsable: 'CONTADOR',
        formula: 'COMPRAS CREDITO / CUENTAS POR PAGAR',
        sustentacion: 'MENSUAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'conciliaciones-bancarias',
        name: 'Cumplimiento de Conciliaciones Bancarias',
        area: 'contabilidad',
        objetivo: 'Fortalecer el control interno',
        meta: 2,
        unit: 'cantidad',
        frecuencia: 'QUINCENAL',
        responsable: 'CONTADOR',
        formula: 'CONCILIACIONES REALIZADAS / CONCILIACIONES REQUERIDAS',
        sustentacion: 'QUINCENAL',
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
            TYM: 90,
            TAT: 90
        },
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'CONTADOR',
        formula: '(IMPUESTOS RECUPERADOS + IMPUESTOS OPTIMIZADOS) / TOTAL IMPUESTOS',
        sustentacion: 'MENSUAL',
        fuente: 'CONTABILIDAD'
    },

    // ========== COMERCIAL ==========
    {
        id: 'venta-realizada-esperada',
        name: 'Cumplimiento de Ventas',
        description: 'Venta realizada / esperada',
        area: 'comercial',
        objetivo: 'Cumplimiento de presupuesto de ventas',
        meta: 100,
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
        objetivo: 'Controlar devoluciones aptas para re-venta',
        meta: 1.8,
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
        objetivo: 'Optimizar el recaudo inmediato',
        meta: {
            ALPINA: 10,
            FAMILIA: 12,
            UNILEVER: 10,
            FLEISCHMANN: 8,
            ZENU: 12
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
        id: 'gasto-fletes-comercial',
        name: 'Participación de Gastos de Fletes',
        description: 'Gastos de fletes / ventas totales',
        area: 'comercial',
        objetivo: 'Eficiencia en el costo logístico comercial',
        meta: {
            ALPINA: 4.5,
            UNILEVER: 4.2,
            POLAR: 6,
            ZENU: 3.4,
            FLEISCHMANN: 2.5,
            FAMILIA: 1.8
        },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'CONTADOR',
        formula: 'GASTOS DE FLETES / TOTAL VENTA',
        sustentacion: 'COMERCIAL',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'dias-inventario-comercial',
        name: 'Días Promedio de Inventario',
        description: 'Dias promedio de inventario / meta',
        area: 'comercial',
        objetivo: 'Optimizar rotación de inventarios para flujo de caja',
        meta: {
            ALPINA: 7,
            ZENU: 7,
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
        objetivo: 'Garantizar el control físico de existencias',
        meta: {
            ALPINA: 16,
            ZENU: 16,
            FLEISCHMANN: 16,
            UNILEVER: 16,
            FAMILIA: 16
        },
        unit: 'cantidad',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        formula: 'INVENTARIOS REALIZADOS / INVENTARIOS PROGRAMADOS',
        sustentacion: 'ANALISTA DE INVENTARIOS',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },
    {
        id: 'fiabilidad-inventarios',
        name: 'Exactitud de Inventario',
        description: '(Valor correcto / valor verificado) x100',
        area: 'administrativo',
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
        formula: '(VALOR CORRECTO / VALOR VERIFICADO) * 100',
        sustentacion: 'ANALISTA DE INVENTARIOS',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },
    {
        id: 'quiebres-inventario',
        name: 'Quiebres de Inventario',
        description: '# de quiebres de inventario en el periodo',
        area: 'administrativo',
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
        id: 'diferencia-inventarios',
        name: 'Diferencia de Inventario',
        description: 'Valor diferencia fisica - valor del inventario',
        area: 'administrativo',
        objetivo: 'Eliminar descuadres entre stock físico y sistema',
        meta: {
            ALPINA: 0,
            ZENU: 0,
            FLEISCHMANN: 0,
            UNILEVER: 0,
            FAMILIA: 0
        },
        unit: '$',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        formula: 'VALOR DIFERENCIA FISICA - VALOR INVENTARIO',
        sustentacion: 'ANALISTA DE INVENTARIOS',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },
    {
        id: 'revision-margenes',
        name: 'Cumplimiento de Revisiones',
        description: 'Cantidad de veces revisados / meta',
        area: 'administrativo',
        objetivo: 'Verificar rentabilidad parametrizada',
        meta: {
            ALPINA: 4,
            ZENU: 4,
            FLEISCHMANN: 4,
            UNILEVER: 4,
            FAMILIA: 4
        },
        unit: 'veces',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        formula: 'REVISIONES EJECUTADAS / REVISIONES PROGRAMADAS',
        sustentacion: 'ANALISTA DE INVENTARIOS',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },
    {
        id: 'revision-precios',
        name: 'Cumplimiento de Revisiones',
        description: 'Cantidad de veces revisados / meta',
        area: 'administrativo',
        objetivo: 'Evitar errores de facturación al cliente',
        meta: {
            ALPINA: 4,
            ZENU: 4,
            FLEISCHMANN: 4,
            UNILEVER: 4,
            FAMILIA: 4
        },
        unit: 'veces',
        frecuencia: 'SEMANAL',
        responsable: 'ANALISTA DE INFORMACIÓN',
        formula: 'REVISIONES EJECUTADAS / REVISIONES PROGRAMADAS',
        sustentacion: 'ANALISTA DE INVENTARIOS',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },
];

export const getKPIsByArea = (areaId) =>
    kpiDefinitions.filter(kpi => kpi.area === areaId);

export const getKPIById = (id) =>
    kpiDefinitions.find(kpi => kpi.id === id);
