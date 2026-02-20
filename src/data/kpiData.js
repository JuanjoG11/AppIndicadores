// Indicadores REALES de TYM/TAT 2026 basados en el Excel proporcionado
export const kpiDefinitions = [
    // ========== LOGÍSTICA DE ENTREGA ==========
    // ========== LOGÍSTICA DE ENTREGA ==========
    {
        id: 'pedidos-devueltos',
        name: '% De Pedidos Devueltos',
        area: 'logistica',
        subArea: 'Logística de Entrega',
        objetivo: 'Garantizar el % mas alto de efectividad en la entrega',
        meta: 1.80,
        unit: '%',
        frecuencia: 'DIARIO',
        responsable: 'LOGISTICA',
        formula: 'PEDIDOS DEVUELTOS / PEDIDOS FACTURADOS',
        sustentacion: 'SEMANAL',
        fuente: 'APP DE DEVOLUCIONES'
    },
    {
        id: 'promedio-pedidos-auxiliar',
        name: 'Promedio De Pedidos Entregados Por Auxiliar X Marca',
        area: 'logistica',
        subArea: 'Logística de Entrega',
        objetivo: 'Mejorar la productividad en la entrega de pedidos',
        meta: {
            ALPINA: 50,
            UNILEVER: 80,
            POLAR: 75,
            ZENU: 80
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
        name: 'Promedio De Pedidos Entregados Por Carro',
        area: 'logistica',
        subArea: 'Logística de Entrega',
        objetivo: 'Mejorar la productividad en la entrega de pedidos',
        meta: {
            ALPINA: 65,
            UNILEVER: 80,
            POLAR: 75,
            ZENU: 80
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
        name: 'Gasto De Nómina Logística / Venta',
        area: 'logistica',
        subArea: 'Logística de Entrega',
        objetivo: 'Garantizar la Rentabilidad en el proceso de entrega',
        meta: {
            ALPINA: 3.4,
            UNILEVER: 3.4,
            POLAR: 3.4,
            ZENU: 3.4
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
        name: 'Gasto De Fletes / Venta Total',
        area: 'logistica',
        subArea: 'Logística de Entrega',
        objetivo: 'Garantizar la Rentabilidad en el proceso de entrega',
        meta: {
            ALPINA: 4.5,
            UNILEVER: 4.2,
            POLAR: 6,
            ZENU: 3.4
        },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'CONTABILIDAD',
        formula: 'VALOR FLETES / VENTA TOTAL',
        sustentacion: 'SEMANAL',
        fuente: 'MEKANO'
    },
    {
        id: 'horas-extras-auxiliares',
        name: 'Número De Horas Extras Trabajadas En El Periodo / Auxiliares',
        area: 'logistica',
        subArea: 'Logística de Entrega',
        objetivo: 'Garantizar la Rentabilidad en el proceso de entrega',
        meta: {
            ALPINA: 1.5,
            UNILEVER: 1,
            POLAR: 2,
            ZENU: 1
        },
        unit: 'horas',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        formula: 'TOTAL HORAS EXTRAS / AUXILIARES',
        sustentacion: 'SEMANAL',
        fuente: 'MAN GO'
    },

    // ========== LOGÍSTICA DE PICKING ==========
    {
        id: 'segundos-unidad-separada',
        name: 'Segundos Por Unidad Separada',
        area: 'logistica',
        subArea: 'Logística de Picking',
        objetivo: 'Garantizar la productividad en el picking de productos',
        meta: 8,
        unit: 'segundos',
        frecuencia: 'DIARIO',
        responsable: 'INFORMACIÓN/INVENTARIO',
        formula: 'SEGUNDOS UTILIZADOS / UNIDADES SEPARADAS',
        sustentacion: 'SEMANAL',
        fuente: 'SODISTEC'
    },
    {
        id: 'pesos-separados-hombre',
        name: '$ Separados Por Hombre',
        area: 'logistica',
        subArea: 'Logística de Picking',
        objetivo: 'Garantizar la productividad en el picking de productos',
        meta: 218000000,
        unit: '$',
        frecuencia: 'MENSUAL',
        responsable: 'INFORMACIÓN/INVENTARIO',
        formula: 'VALOR VENTA / AUXILIARES DE SEPARACIÓN',
        sustentacion: 'SEMANAL',
        fuente: 'SYT'
    },
    {
        id: 'pedidos-separar-total',
        name: '# Pedidos A Separar / Total Pedidos',
        area: 'logistica',
        subArea: 'Logística de Picking',
        objetivo: 'Garantizar la eficiencia del turno de separación',
        meta: 100,
        unit: '%',
        frecuencia: 'DIARIO',
        responsable: 'INFORMACIÓN/INVENTARIO',
        formula: 'PEDIDOS SEPARADOS / PEDIDOS FACTURADOS',
        sustentacion: 'SEMANAL',
        fuente: 'SODISTEC'
    },
    {
        id: 'notas-errores-venta',
        name: '$ De Notas Generadas Por Errores / Venta',
        area: 'logistica',
        subArea: 'Logística de Picking',
        objetivo: 'Garantizar la eficiencia del turno de separación',
        meta: 1,
        unit: '%',
        frecuencia: 'DIARIO',
        responsable: 'APRENDIZ DEVOLUCIONES',
        formula: 'NOTAS X DEVOLUCIÓN / VALOR DE LA VENTA',
        sustentacion: 'SEMANAL',
        fuente: 'SYT'
    },
    {
        id: 'planillas-separadas',
        name: '# De Planillas Separadas / # Planillas A Separar',
        area: 'logistica',
        subArea: 'Logística de Picking',
        objetivo: 'Garantizar la eficiencia del turno de separación',
        meta: 100,
        unit: '%',
        frecuencia: 'DIARIO',
        responsable: 'INFORMACIÓN/INVENTARIO',
        formula: 'PLANILLAS SEPARADAS / PLANILLAS GENERADAS',
        sustentacion: 'SEMANAL',
        fuente: 'SIDIS'
    },
    {
        id: 'nomina-venta-picking',
        name: '$ Nómina / Total De La Venta',
        area: 'logistica',
        subArea: 'Logística de Picking',
        objetivo: 'Aumentar la rentabilidad del proceso de picking',
        meta: {
            ALPINA: 1,
            FAMILIA: 1,
            UNILEVER: 1
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
        name: '# De Horas Extras Picking / Venta',
        area: 'logistica',
        subArea: 'Logística de Picking',
        objetivo: 'Aumentar la rentabilidad del proceso de picking',
        meta: {
            TYM: 0.05,
            TAT: 0.05
        },
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        formula: 'HORAS EXTRAS / VENTA TOTAL',
        sustentacion: 'SEMANAL',
        fuente: 'MAN GO'
    },

    // ========== LOGÍSTICA DE DEPÓSITO ==========
    {
        id: 'embalajes-perdidos',
        name: '# De Embalajes Por Tamaño Perdidos',
        area: 'logistica',
        subArea: 'Logística de Depósito',
        objetivo: 'Reducir la pérdida de embalajes',
        meta: 0,
        unit: 'cantidad',
        frecuencia: 'SEMANAL',
        responsable: 'LOGISTICA',
        formula: 'CANASTILLAS RECIBIDAS - CANASTILLAS GESTIONADAS',
        sustentacion: 'SEMANAL',
        fuente: 'CONTROL DE EMBALAJES'
    },
    {
        id: 'nomina-compra-deposito',
        name: 'Gasto De Nómina / Total De La Compra',
        area: 'logistica',
        subArea: 'Logística de Depósito',
        objetivo: 'Optimizar la rentabilidad en la Bodega',
        meta: {
            TYM: 0.4,
            TAT: 0.3
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
        name: '# De Horas Extras Depósito / Venta',
        area: 'logistica',
        subArea: 'Logística de Depósito',
        objetivo: 'Optimizar la rentabilidad en la Bodega',
        meta: {
            TYM: 0.05,
            TAT: 0.05
        },
        unit: '%',
        frecuencia: 'QUINCENAL',
        responsable: 'GESTIÓN HUMANA',
        formula: 'HORAS EXTRAS / VENTA TOTAL',
        sustentacion: 'SEMANAL',
        fuente: 'SYT / MAN GO'
    },
    {
        id: 'averias-venta',
        name: '% De Averías Sobre La Venta',
        area: 'logistica',
        subArea: 'Logística de Depósito',
        objetivo: 'Optimizar la rentabilidad en la Bodega',
        meta: 0.20,
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'APRENDIZ DEVOLUCIONES',
        formula: 'TOTAL AVERIAS / VENTA TOTAL',
        sustentacion: 'QUINCENAL',
        fuente: 'SYT'
    },

    // ========== TALENTO HUMANO ==========
    {
        id: 'rotacion-personal',
        name: 'Rotación De Personal',
        area: 'talento-humano',
        objetivo: 'Reducir la rotación de personal en las diferentes áreas',
        meta: {
            TYM: 5,
            TAT: 5
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
        name: 'Ausentismo',
        area: 'talento-humano',
        objetivo: 'Reducir el ausentismo en los equipos',
        meta: {
            TYM: 2.5,
            TAT: 2.5
        },
        brands: ['TYM', 'TAT'],
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'GESTIÓN HUMANA',
        formula: 'Días perdidos / Días laborados',
        sustentacion: 'SEMANAL',
        fuente: 'MAN GO'
    },
    {
        id: 'calificacion-auditoria',
        name: '% Calificación Auditoría',
        area: 'talento-humano',
        objetivo: 'Ejecutar el Sistema de Gestión',
        meta: 90,
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'SST',
        formula: 'Actividades ejecutadas / Actividades programadas',
        sustentacion: 'MENSUAL',
        fuente: 'SYCH'
    },
    {
        id: 'he-rn-nomina',
        name: 'Valor H.E-R.N / Total Nómina',
        area: 'talento-humano',
        objetivo: 'Reducir el pago por H.E-R.N',
        meta: {
            TYM: 3,
            TAT: 3
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
        name: 'Gasto De Nómina RRHH / Venta',
        area: 'talento-humano',
        objetivo: 'Garantizar la rentabilidad de la compañía en la nómina',
        meta: {
            TYM: 11,
            TAT: 11 // Adjusted per user instruction or kept consistent validation needed
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
        name: '# De Actividades / Meta',
        area: 'talento-humano',
        objetivo: 'Fortalecer la cultura organizacional por medio de actividades',
        meta: 100,
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'GESTIÓN HUMANA',
        formula: 'Actividades ejecutadas / Actividades programadas',
        sustentacion: 'MENSUAL',
        fuente: 'GESTIÓN HUMANA'
    },
    {
        id: 'tiempo-contratacion',
        name: '# De Días De Respuesta En Vacantes',
        area: 'talento-humano',
        objetivo: 'Reducir el tiempo de respuesta en contrataciones',
        meta: 8,
        unit: 'días',
        frecuencia: 'QUINCENAL',
        responsable: 'GESTIÓN HUMANA',
        sustentacion: 'QUINCENAL'
    },

    // ========== CAJA ==========
    {
        id: 'arqueos-realizados',
        name: '# De Arqueos Realizados / Meta',
        area: 'caja',
        objetivo: 'Garantizar el control permanente del efectivo',
        meta: 8,
        unit: 'arqueos',
        frecuencia: 'SEMANAL',
        responsable: 'CONTABILIDAD',
        formula: 'ARQUEOS REALIZADOS / ARQUEOS PROGRAMADOS',
        sustentacion: 'SEMANAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'planillas-cerradas',
        name: '# Planillas Cerradas / # Planillas Generadas',
        area: 'caja',
        objetivo: 'Ejecutar el cierre de planillas diario',
        meta: 100,
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'CONTABILIDAD',
        formula: 'PLANILLAS CERRADAS / PLANILLAS GENERADAS',
        sustentacion: 'SEMANAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'vales-descuadres',
        name: 'Valor De Vales Día / Total Cuadre De Caja',
        area: 'caja',
        objetivo: 'Reducir el valor de vales generados en caja por descuadres',
        meta: 0.5,
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'CONTABILIDAD',
        formula: 'VALOR DE VALES / TOTAL CUADRE DE CAJA',
        sustentacion: 'SEMANAL',
        fuente: 'CONTABILIDAD'
    },

    // ========== CARTERA ==========
    {
        id: 'cartera-no-vencida',
        name: '% De Cartera No Vencida',
        area: 'cartera',
        objetivo: 'Mejorar la rotación de cartera con los clientes',
        meta: {
            ALPINA: 10,
            FAMILIA: 10,
            UNILEVER: 10,
            POLAR: 10,
            ZENU: 10
        },
        unit: '%',
        frecuencia: 'QUINCENAL',
        responsable: 'CONTABILIDAD',
        formula: 'TOTAL CARTERA VENCIDA / TOTAL VENTA',
        sustentacion: 'QUINCENAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'cartera-11-30',
        name: '% De Cartera 11-30 Días',
        area: 'cartera',
        objetivo: 'Mejorar la rotación de cartera con los clientes',
        meta: {
            ALPINA: 90,
            FAMILIA: 90,
            UNILEVER: 90,
            POLAR: 90,
            ZENU: 90
        },
        unit: '%',
        frecuencia: 'QUINCENAL',
        responsable: 'CONTABILIDAD',
        formula: 'TOTAL CARTERA 11-30 / TOTAL CARTERA',
        sustentacion: 'QUINCENAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'cartera-31-45',
        name: '% De Cartera 31-45 Días',
        area: 'cartera',
        objetivo: 'Mejorar la rotación de cartera con los clientes',
        meta: {
            ALPINA: 8,
            FAMILIA: 8,
            UNILEVER: 8,
            POLAR: 8,
            ZENU: 8
        },
        unit: '%',
        frecuencia: 'QUINCENAL',
        responsable: 'CONTABILIDAD',
        formula: 'TOTAL CARTERA 31-45 / TOTAL CARTERA',
        sustentacion: 'QUINCENAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'cartera-mayor-45',
        name: '% De Cartera Mayor A 45 Días',
        area: 'cartera',
        objetivo: 'Mejorar la rotación de cartera con los clientes',
        meta: {
            ALPINA: 2,
            FAMILIA: 2,
            UNILEVER: 2,
            POLAR: 2,
            ZENU: 2
        },
        unit: '%',
        frecuencia: 'QUINCENAL',
        responsable: 'CONTABILIDAD',
        formula: 'TOTAL MAYOR A 45 / TOTAL CARTERA',
        sustentacion: 'QUINCENAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'recircularizaciones',
        name: '# Recircularizaciones Efectuadas / Programadas',
        area: 'cartera',
        objetivo: 'Fortalecer el control interno con la cartera a la calle',
        meta: {
            TYM: 2,
            TAT: 2
        },
        unit: 'cantidad',
        frecuencia: 'BIMESTRAL',
        responsable: 'CONTABILIDAD',
        formula: 'EFECTUADAS / PROGRAMADAS',
        sustentacion: 'BIMESTRAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'valor-cartera-venta',
        name: 'Valor De Cartera / Venta',
        area: 'cartera',
        objetivo: 'Garantizar los Flujos de las compañías',
        meta: {
            ALPINA: 10,
            FAMILIA: 20,
            UNILEVER: 20,
            POLAR: 20,
            ZENU: 15
        },
        unit: '%',
        frecuencia: 'QUINCENAL',
        responsable: 'CONTABILIDAD',
        formula: 'VENTA CREDITO / TOTAL VENTA',
        sustentacion: 'QUINCENAL',
        fuente: 'CONTABILIDAD'
    },

    // ========== CONTABILIDAD ==========
    {
        id: 'dias-cierre',
        name: 'Total Días Al Cierre / Meta',
        area: 'contabilidad',
        objetivo: 'Ejecutar los cierres contables de mes en los tiempos óptimos',
        meta: 12,
        unit: 'días',
        frecuencia: 'MENSUAL',
        responsable: 'CONTABILIDAD',
        formula: 'DIAS PARA EL REPORTE / TOTAL DIAS AL CIERRE',
        sustentacion: 'MENSUAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'ajustes-posteriores',
        name: '# De Ajustes Posteriores Al Cierre',
        area: 'contabilidad',
        objetivo: 'Garantizar la confiabilidad de los cierres contables',
        meta: 1,
        unit: 'cantidad',
        frecuencia: 'MENSUAL',
        responsable: 'CONTABILIDAD',
        formula: 'AJUSTES POSTERIORES / TOTAL AJUSTES',
        sustentacion: 'MENSUAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'ajustes-revisoria',
        name: '# De Ajustes Por Revisoría Fiscal',
        area: 'contabilidad',
        objetivo: 'Garantizar la confiabilidad de los cierres contables',
        meta: 1,
        unit: 'cantidad',
        frecuencia: 'MENSUAL',
        responsable: 'CONTABILIDAD',
        formula: 'AJUSTES REVISOR FISCAL / TOTAL AJUSTES',
        sustentacion: 'MENSUAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'rotacion-cxc',
        name: 'Rotación Cuentas Por Cobrar',
        area: 'contabilidad',
        objetivo: 'Mejorar la rotación en las cuentas por cobrar a clientes',
        meta: {
            TYM: 0,
            TAT: 0
        },
        unit: 'veces',
        frecuencia: 'MENSUAL',
        responsable: 'CONTABILIDAD',
        formula: 'VENTAS CREDITO / CUENTAS POR COBRAR',
        sustentacion: 'MENSUAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'rotacion-cxp',
        name: 'Rotación Cuentas Por Pagar',
        area: 'contabilidad',
        objetivo: 'Garantizar la rotación en las cuentas por pagar a proveedores',
        meta: {
            TYM: 0,
            TAT: 0
        },
        unit: 'veces',
        frecuencia: 'MENSUAL',
        responsable: 'CONTABILIDAD',
        formula: 'COMPRAS CREDITO / CUENTAS POR PAGAR',
        sustentacion: 'MENSUAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'conciliaciones-bancarias',
        name: 'Conciliaciones Bancarias / Requeridas',
        area: 'contabilidad',
        objetivo: 'Fortalecer el control interno',
        meta: 2,
        unit: 'cantidad',
        frecuencia: 'QUINCENAL',
        responsable: 'CONTABILIDAD',
        formula: 'CONCILIACIONES REALIZADAS / CONCILIACIONES REQUERIDAS',
        sustentacion: 'QUINCENAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'activos-conciliados',
        name: 'Activos Conciliados / Activos Registrados',
        area: 'contabilidad',
        objetivo: 'Fortalecer el control interno',
        meta: {
            TYM: 94,
            TAT: 94
        },
        unit: '%',
        frecuencia: 'BIMENSUAL',
        responsable: 'CONTABILIDAD',
        formula: 'ACTIVOS CONCILIADOS / ACTIVOS REGISTRADOS',
        sustentacion: 'BIMENSUAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'multas-sanciones',
        name: 'Valor De Multas O Sanciones Tributarias / Ingreso',
        area: 'contabilidad',
        objetivo: 'Fortalecer el control interno',
        meta: {
            TYM: 0.1,
            TAT: 0.1
        },
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'CONTABILIDAD',
        formula: 'MULTAS O SANCIONES / INGRESO',
        sustentacion: 'MENSUAL',
        fuente: 'CONTABILIDAD'
    },
    {
        id: 'optimizacion-tributaria',
        name: 'Optimizar La Carga Tributaria',
        area: 'contabilidad',
        objetivo: 'Optimizar la carga tributaria buscando mejores flujos y rentabilidad',
        meta: {
            TYM: 90,
            TAT: 90
        },
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'CONTABILIDAD',
        formula: '(IMPUESTOS RECUPERADOS + IMPUESTOS OPTIMIZADOS) / TOTAL IMPUESTOS',
        sustentacion: 'MENSUAL',
        fuente: 'CONTABILIDAD'
    },

    // ========== COMERCIAL ==========
    {
        id: 'venta-realizada-esperada',
        name: 'Garantizar La Venta Necesaria Por Mes En Cifras Internas',
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
        name: 'Garantizar El Primer Margen',
        description: '(ventas - costo de ventas) / ventas x 100',
        area: 'comercial',
        objetivo: 'Optimizar la rentabilidad bruta',
        meta: {
            ALPINA: 12,
            FAMILIA: 10,
            UNILEVER: 8,
            FLEISHMANN: 10,
            POLAR: 10,
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
        name: 'Reducir Las Devoluciones En Buen Estado',
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
        name: 'Reducir Las Devoluciones En Mal Estado',
        description: '$ devolucion mal estado / venta',
        area: 'comercial',
        objetivo: 'Disminuir mermas por devoluciones averiadas',
        meta: {
            ALPINA: 0.5,
            FAMILIA: 0.5,
            UNILEVER: 0.5,
            FLEISHMANN: 0.5,
            POLAR: 0.5,
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
        name: 'Garantizar El Promedio De Venta Por Vendedor',
        description: 'Ventas totales / # vendedores',
        area: 'comercial',
        objetivo: 'Aumentar la productividad de la fuerza comercial',
        meta: {
            ALPINA: 60000000,
            FAMILIA: 50000000,
            UNILEVER: 55000000,
            FLEISHMANN: 45000000,
            POLAR: 50000000,
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
        name: 'Disminuir La Participación De La Venta De Crédito',
        description: 'Venta credito / Venta total',
        area: 'comercial',
        objetivo: 'Optimizar el recaudo inmediato',
        meta: {
            ALPINA: 10,
            FAMILIA: 12,
            UNILEVER: 10,
            FLEISHMANN: 8,
            POLAR: 10,
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
        name: 'Ejecutar El Cobro Óptimo De La Cartera',
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
        name: 'Reducir La Rotación Del Equipo A Cargo',
        description: '(# de salidas / promedio empleados) x 100',
        area: 'comercial',
        objetivo: 'Fomentar la estabilidad laboral',
        meta: {
            ALPINA: 3.5,
            FAMILIA: 3.5,
            UNILEVER: 3.5,
            FLEISHMANN: 3.5,
            POLAR: 3.5,
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
        name: 'Disminuir El Gasto Del Equipo Comercial (Nómina)',
        description: 'Gastos de personal / total venta',
        area: 'comercial',
        objetivo: 'Controlar costos operativos comerciales',
        meta: 5,
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
        name: 'Disminuir El Gasto Del Equipo Comercial (Viaje)',
        description: 'Gastos de viaje / total ventas',
        area: 'comercial',
        objetivo: 'Optimizar gastos de representación y viaje',
        meta: 0.2,
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
        name: 'Control Del Gasto Asignado Por Concepto De Fletes',
        description: 'Gastos de fletes / ventas totales',
        area: 'comercial',
        objetivo: 'Eficiencia en el costo logístico comercial',
        meta: {
            ALPINA: 4.5,
            UNILEVER: 4.2,
            POLAR: 6,
            ZENU: 3.4,
            FLEISHMANN: 2.5,
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
        name: 'Garantizar Los Flujos De Caja De Las Operaciones (Inventario)',
        description: 'Dias promedio de inventario / meta',
        area: 'comercial',
        objetivo: 'Optimizar rotación de inventarios para flujo de caja',
        meta: {
            ALPINA: 7,
            FAMILIA: 18,
            UNILEVER: 45,
            FLEISHMANN: 18,
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
        name: 'Ejecutar El Control Interno De Los Inventarios',
        description: '# de inventarios realizados / programados',
        area: 'administrativo',
        objetivo: 'Garantizar el control físico de existencias',
        meta: 16,
        unit: 'cantidad',
        frecuencia: 'SEMANAL',
        responsable: 'INFORMACIÓN/INVENTARIO',
        formula: 'INVENTARIOS REALIZADOS / INVENTARIOS PROGRAMADOS',
        sustentacion: 'ANALISTA DE INVENTARIOS',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },
    {
        id: 'fiabilidad-inventarios',
        name: 'Garantizar La Fiabilidad De Los Inventarios',
        description: '(Valor correcto / valor verificado) x100',
        area: 'administrativo',
        objetivo: 'Asegurar la exactitud de los registros contables',
        meta: 100,
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'INFORMACIÓN/INVENTARIO',
        formula: '(VALOR CORRECTO / VALOR VERIFICADO) * 100',
        sustentacion: 'ANALISTA DE INVENTARIOS',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },
    {
        id: 'quiebres-inventario',
        name: 'Garantizar La Disponibilidad De Inventario',
        description: '# de quiebres de inventario en el periodo',
        area: 'administrativo',
        objetivo: 'Minimizar pedidos no servidos por falta de stock',
        meta: 0,
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'INFORMACIÓN/INVENTARIO',
        formula: 'QUIEBRES DE INVENTARIO / TOTAL SKU',
        sustentacion: 'ANALISTA DE INVENTARIOS',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },
    {
        id: 'obsolescencia',
        name: 'Disminuir La Obsolescencia En Inventarios',
        description: '(Inventario obsoleto / inventario total) x 100',
        area: 'administrativo',
        objetivo: 'Reducir pérdidas por productos vencidos o sin rotación',
        meta: 0,
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'INFORMACIÓN/INVENTARIO',
        formula: '(INVENTARIO OBSOLETO / INVENTARIO TOTAL) * 100',
        sustentacion: 'ANALISTA DE INVENTARIOS',
        frecuenciaSustentacion: 'MENSUAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },
    {
        id: 'mermas',
        name: 'Fortalecer El Control Del Inventario (Mermas)',
        description: '(Valor mermas / inventario total) x 100',
        area: 'administrativo',
        objetivo: 'Controlar pérdidas físicas de mercancía',
        meta: 0,
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'INFORMACIÓN/INVENTARIO',
        formula: '(VALOR MERMAS / INVENTARIO TOTAL) * 100',
        sustentacion: 'ANALISTA DE INVENTARIOS',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },
    {
        id: 'diferencia-inventarios',
        name: 'Disminuir La Diferencia En Los Inventarios',
        description: 'Valor diferencia fisica - valor del inventario',
        area: 'administrativo',
        objetivo: 'Eliminar descuadres entre stock físico y sistema',
        meta: 0,
        unit: '$',
        frecuencia: 'SEMANAL',
        responsable: 'INFORMACIÓN/INVENTARIO',
        formula: 'VALOR DIFERENCIA FISICA - VALOR INVENTARIO',
        sustentacion: 'ANALISTA DE INVENTARIOS',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },
    {
        id: 'revision-margenes',
        name: 'Garantizar Los Márgenes En El Sistema',
        description: 'Cantidad de veces revisados / meta',
        area: 'administrativo',
        objetivo: 'Verificar rentabilidad parametrizada',
        meta: 4,
        unit: 'veces',
        frecuencia: 'SEMANAL',
        responsable: 'INFORMACIÓN/INVENTARIO',
        formula: 'REVISIONES EJECUTADAS / REVISIONES PROGRAMADAS',
        sustentacion: 'ANALISTA DE INVENTARIOS',
        frecuenciaSustentacion: 'SEMANAL',
        fuente: 'ANALISTA DE INFORMACIÓN'
    },
    {
        id: 'revision-precios',
        name: 'Garantizar Los Precios A La Calle (Precio De Lista) Estén Bien',
        description: 'Cantidad de veces revisados / meta',
        area: 'administrativo',
        objetivo: 'Evitar errores de facturación al cliente',
        meta: 4,
        unit: 'veces',
        frecuencia: 'SEMANAL',
        responsable: 'INFORMACIÓN/INVENTARIO',
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
