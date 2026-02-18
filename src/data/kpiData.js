// Indicadores REALES de TYM/TAT 2026 basados en el Excel proporcionado
export const kpiDefinitions = [
    // ========== LOGÍSTICA DE ENTREGA ==========
    // ========== LOGÍSTICA DE ENTREGA ==========
    {
        id: 'pedidos-devueltos',
        name: '% de pedidos devueltos',
        area: 'logistica-entrega',
        objetivo: 'Garantizar el % mas alto de efectividad en la entrega',
        meta: 1.80,
        unit: '%',
        frecuencia: 'DIARIO',
        responsable: 'DEVOLUCIONES',
        formula: 'PEDIDOS DEVUELTOS / PEDIDOS FACTURADOS',
        sustentacion: 'SEMANAL',
        fuente: 'APP DE DEVOLUCIONES'
    },
    {
        id: 'promedio-pedidos-auxiliar',
        name: 'Promedio de pedidos entregados por AUXILIAR x marca',
        area: 'logistica-entrega',
        objetivo: 'Mejorar la productividad en la entrega de pedidos',
        meta: {
            ALPINA: 50,
            UNILEVER: 80,
            POLAR: 75,
            ZENU: 80
        },
        unit: 'pedidos',
        frecuencia: 'SEMANAL',
        responsable: 'DEVOLUCIONES',
        formula: 'NUMERO DE PEDIDOS X PROVEEDOR / AUXILIARES',
        sustentacion: 'SEMANAL',
        fuente: 'APP DE FLETES'
    },
    {
        id: 'promedio-pedidos-carro',
        name: 'Promedio de pedidos entregados por CARRO',
        area: 'logistica-entrega',
        objetivo: 'Mejorar la productividad en la entrega de pedidos',
        meta: {
            ALPINA: 65,
            UNILEVER: 80,
            POLAR: 75,
            ZENU: 80
        },
        unit: 'pedidos',
        frecuencia: 'SEMANAL',
        responsable: 'DEVOLUCIONES',
        formula: 'NUMERO DE PEDIDOS X PROVEEDOR / VEHICULOS',
        sustentacion: 'SEMANAL',
        fuente: 'APP DE FLETES'
    },
    {
        id: 'gasto-nomina-venta',
        name: '(Gasto de nomina /Venta total)',
        area: 'logistica-entrega',
        objetivo: 'Garantizar la Rentabilidad en el proceso de entrega',
        meta: {
            ALPINA: 3.4,
            UNILEVER: 3.4,
            POLAR: 3.4,
            ZENU: 3.4
        },
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'GESTION HUMANA',
        formula: 'NOMINA LOGISTICA / VENTA TOTAL',
        sustentacion: 'MENSUAL',
        fuente: 'SYT / MAN GO'
    },
    {
        id: 'gasto-fletes-venta',
        name: '(Gasto de Fletes / Venta total)',
        area: 'logistica-entrega',
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
        name: 'Numero de horas extras trabajadas en el periodo / Auxiliares',
        area: 'logistica-entrega',
        objetivo: 'Garantizar la Rentabilidad en el proceso de entrega',
        meta: {
            ALPINA: 1.5,
            UNILEVER: 1,
            POLAR: 2,
            ZENU: 1
        },
        unit: 'horas',
        frecuencia: 'QUINCENAL',
        responsable: 'GESTIÓN HUMANA',
        formula: 'TOTAL HORAS EXTRAS / AUXILIARES',
        sustentacion: 'SEMANAL',
        fuente: 'MAN GO'
    },

    // ========== LOGÍSTICA DE PICKING ==========
    {
        id: 'segundos-unidad-separada',
        name: 'Segundos por unidad separada',
        area: 'logistica-picking',
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
        name: '$ Separados por hombre',
        area: 'logistica-picking',
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
        name: '# Pedidos a separar / Total pedidos',
        area: 'logistica-picking',
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
        name: '$ de notas generadas por errores / Venta',
        area: 'logistica-picking',
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
        name: '# de planillas separadas / # planillas a separar',
        area: 'logistica-picking',
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
        name: '$ Nómina / Total de la venta',
        area: 'logistica-picking',
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
        name: '# De horas extras trabajada / Venta',
        area: 'logistica-picking',
        objetivo: 'Aumentar la rentabilidad del proceso de picking',
        meta: {
            TYM: 0.05,
            TAT: 0.05
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
        name: '# de embalajes por tamaño perdidos',
        area: 'logistica-deposito',
        objetivo: 'Reducir la pérdida de embalajes',
        meta: 0,
        unit: 'cantidad',
        frecuencia: 'SEMANAL',
        responsable: 'LOGISTICA INVERSA',
        formula: 'CANASTILLAS RECIBIDAS - CANASTILLAS GESTIONADAS',
        sustentacion: 'SEMANAL',
        fuente: 'CONTROL DE EMBALAJES'
    },
    {
        id: 'nomina-compra-deposito',
        name: 'Gasto de nómina / Total de la compra',
        area: 'logistica-deposito',
        objetivo: 'Optimizar la rentabilidad en la Bodega',
        meta: {
            TYM: 0.4,
            TAT: 0.4
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
        name: '# De horas extras trabajada / Venta',
        area: 'logistica-deposito',
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
        name: '% de averías sobre la venta',
        area: 'logistica-deposito',
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
        name: 'Rotación de personal',
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
        name: '% de ausentismo',
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
        name: '% calificación auditoría',
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
        name: 'Valor H.E-R.N / total nómina',
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
        name: 'Gasto de Nómina / venta',
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
        name: '# de actividades / meta',
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
        name: '# de días de respuesta en vacantes',
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
        name: '# de arqueos realizados / meta',
        area: 'caja',
        objetivo: 'Garantizar el control permanente del efectivo',
        meta: 8,
        unit: 'arqueos',
        frecuencia: 'SEMANAL',
        responsable: 'CAJA',
        sustentacion: 'SEMANAL'
    },
    {
        id: 'planillas-cerradas',
        name: '# planillas cerradas / # planillas generadas',
        area: 'caja',
        objetivo: 'Ejecutar el cierre de planillas diario',
        meta: 100,
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'CAJA',
        sustentacion: 'SEMANAL'
    },
    {
        id: 'vales-descuadres',
        name: 'Valor de vales día / total cuadre de caja',
        area: 'caja',
        objetivo: 'Reducir el valor de vales generados en caja por descuadres',
        meta: 0,
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'CAJA',
        sustentacion: 'SEMANAL'
    },

    // ========== CARTERA ==========
    {
        id: 'cartera-no-vencida',
        name: '% de cartera No vencida',
        area: 'cartera',
        objetivo: 'Mejorar la rotación de cartera con los clientes',
        meta: {
            ALPINA: 90,
            FAMILIA: 85,
            UNILEVER: 88,
            POLAR: 85,
            ZENU: 90
        },
        unit: '%',
        frecuencia: 'QUINCENAL',
        responsable: 'CARTERA',
        formula: 'CARTERA NO VENCIDA / CARTERA TOTAL',
        sustentacion: 'QUINCENAL'
    },
    {
        id: 'cartera-11-30',
        name: '% de cartera 11-30 días',
        area: 'cartera',
        objetivo: 'Mejorar la rotación de cartera con los clientes',
        meta: {
            ALPINA: 5,
            FAMILIA: 8,
            UNILEVER: 6,
            POLAR: 8,
            ZENU: 5
        },
        unit: '%',
        frecuencia: 'QUINCENAL',
        responsable: 'CARTERA',
        formula: 'CARTERA 11-30 DIAS / CARTERA TOTAL',
        sustentacion: 'QUINCENAL'
    },
    {
        id: 'cartera-31-45',
        name: '% de cartera 31-45 días',
        area: 'cartera',
        objetivo: 'Mejorar la rotación de cartera con los clientes',
        meta: 'ALPINA / FAMILIA / UNILEVER',
        unit: '%',
        frecuencia: 'QUINCENAL',
        responsable: 'CARTERA',
        sustentacion: 'QUINCENAL'
    },
    {
        id: 'cartera-mayor-45',
        name: '% de cartera mayor a 45 días',
        area: 'cartera',
        objetivo: 'Mejorar la rotación de cartera con los clientes',
        meta: 'ALPINA / FAMILIA / UNILEVER',
        unit: '%',
        frecuencia: 'QUINCENAL',
        responsable: 'CARTERA',
        sustentacion: 'QUINCENAL'
    },
    {
        id: 'recircularizaciones',
        name: '# recircularizaciones efectuadas / programadas',
        area: 'cartera',
        objetivo: 'Fortalecer el control interno con la cartera a la calle',
        meta: 'TYM: 2 | TAT: 2',
        unit: 'cantidad',
        frecuencia: 'BIMENSUAL',
        responsable: 'CARTERA',
        sustentacion: 'BIMENSUAL'
    },
    {
        id: 'valor-cartera-venta',
        name: 'Valor de cartera / venta',
        area: 'cartera',
        objetivo: 'Garantizar los Flujos de las compañías',
        meta: {
            ALPINA: 15,
            FAMILIA: 20,
            UNILEVER: 18,
            POLAR: 20,
            ZENU: 15
        },
        unit: '%',
        frecuencia: 'QUINCENAL',
        responsable: 'CARTERA',
        formula: 'VALOR TOTAL CARTERA / VENTA TOTAL',
        sustentacion: 'QUINCENAL'
    },

    // ========== CONTABILIDAD ==========
    {
        id: 'dias-cierre',
        name: 'Total días al cierre / meta',
        area: 'contabilidad',
        objetivo: 'Ejecutar los cierres contables de mes en los tiempos óptimos',
        meta: 12,
        unit: 'días',
        frecuencia: 'MENSUAL',
        responsable: 'CONTABILIDAD',
        sustentacion: 'MENSUAL'
    },
    {
        id: 'ajustes-posteriores',
        name: '# de ajustes posteriores al cierre',
        area: 'contabilidad',
        objetivo: 'Garantizar la confiabilidad de los cierres contables',
        meta: 0,
        unit: 'cantidad',
        frecuencia: 'MENSUAL',
        responsable: 'CONTABILIDAD',
        sustentacion: 'MENSUAL'
    },
    {
        id: 'ajustes-revisoria',
        name: '# de ajustes por revisoría fiscal',
        area: 'contabilidad',
        objetivo: 'Garantizar la confiabilidad de los cierres contables',
        meta: 0,
        unit: 'cantidad',
        frecuencia: 'MENSUAL',
        responsable: 'CONTABILIDAD',
        sustentacion: 'MENSUAL'
    },
    {
        id: 'rotacion-cxc',
        name: 'Rotación cuentas por cobrar',
        area: 'contabilidad',
        objetivo: 'Mejorar la rotación en las cuentas por cobrar a clientes',
        meta: 'TYM / TAT',
        unit: 'veces',
        frecuencia: 'MENSUAL',
        responsable: 'CONTABILIDAD',
        formula: 'Ventas de crédito / cuentas por cobrar promedio',
        sustentacion: 'MENSUAL'
    },
    {
        id: 'rotacion-cxp',
        name: 'Rotación cuentas por pagar',
        area: 'contabilidad',
        objetivo: 'Garantizar la rotación en las cuentas por pagar a proveedores',
        meta: 'TYM / TAT',
        unit: 'veces',
        frecuencia: 'MENSUAL',
        responsable: 'CONTABILIDAD',
        formula: 'Compras a crédito / cuentas por pagar promedio',
        sustentacion: 'MENSUAL'
    },
    {
        id: 'conciliaciones-bancarias',
        name: 'Conciliaciones bancarias / requeridas',
        area: 'contabilidad',
        objetivo: 'Fortalecer el control interno',
        meta: 2,
        unit: 'cantidad',
        frecuencia: 'QUINCENAL',
        responsable: 'CONTABILIDAD',
        sustentacion: 'QUINCENAL'
    },
    {
        id: 'activos-conciliados',
        name: 'Activos conciliados / activos registrados',
        area: 'contabilidad',
        objetivo: 'Fortalecer el control interno',
        meta: 'TYM: 94% | TAT: 94%',
        unit: '%',
        frecuencia: 'BIMENSUAL',
        responsable: 'CONTABILIDAD',
        sustentacion: 'BIMENSUAL'
    },

    // ========== COMERCIAL ==========
    {
        id: 'venta-realizada-esperada',
        name: 'Venta realizada / esperada',
        area: 'comercial',
        objetivo: 'Garantizar la venta necesaria por mes en cifras internas',
        meta: 100,
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'COORDINADOR POR MARCA',
        sustentacion: 'SEMANAL'
    },
    {
        id: 'primer-margen',
        name: 'Primer margen',
        area: 'comercial',
        objetivo: 'Garantizar el primer margen',
        meta: {
            ALPINA: 12,
            UNILEVER: 8,
            POLAR: 10,
            ZENU: 11
        },
        unit: '%',
        frecuencia: 'QUINCENAL',
        responsable: 'COORDINADOR POR MARCA',
        formula: '(VENTAS - COSTO DE VENTAS) / VENTAS X 100',
        sustentacion: 'QUINCENAL'
    },
    {
        id: 'devoluciones-buen-estado',
        name: '$ devolución buen estado / total venta',
        area: 'comercial',
        objetivo: 'Reducir las devoluciones en Buen estado',
        meta: 1.80,
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'COORDINADOR POR MARCA',
        sustentacion: 'SEMANAL'
    },
    {
        id: 'devoluciones-mal-estado',
        name: '$ devolución mal estado / venta',
        area: 'comercial',
        objetivo: 'Reducir las devoluciones en mal estado',
        meta: {
            ALPINA: 0.5,
            UNILEVER: 0.3,
            POLAR: 0.4,
            ZENU: 0.5
        },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'COORDINADOR POR MARCA',
        formula: 'VALOR DEVOLUCION MAL ESTADO / VENTA TOTAL',
        sustentacion: 'SEMANAL'
    },
    {
        id: 'promedio-venta-vendedor',
        name: 'Ventas totales / # vendedores',
        area: 'comercial',
        objetivo: 'Garantizar el promedio de venta por vendedor',
        meta: {
            ALPINA: 45000000,
            UNILEVER: 55000000,
            POLAR: 50000000,
            ZENU: 48000000
        },
        unit: '$',
        frecuencia: 'QUINCENAL',
        responsable: 'COORDINADOR POR MARCA',
        formula: 'VENTAS TOTALES / NUMERO VENDEDORES',
        sustentacion: 'QUINCENAL'
    },
    {
        id: 'venta-credito-total',
        name: 'Venta crédito / venta total',
        area: 'comercial',
        objetivo: 'Disminuir la participación de la venta de crédito',
        meta: {
            ALPINA: 15,
            UNILEVER: 10,
            POLAR: 12,
            ZENU: 15
        },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'COORDINADOR POR MARCA',
        formula: 'VENTA CREDITO / VENTA TOTAL',
        sustentacion: 'SEMANAL'
    },
    {
        id: 'cartera-vencida-total',
        name: 'Cartera vencida / total de cartera',
        area: 'comercial',
        objetivo: 'Ejecutar el cobro óptimo de la cartera',
        meta: {
            ALPINA: 2,
            UNILEVER: 1.5,
            POLAR: 2,
            ZENU: 2
        },
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'COORDINADOR POR MARCA',
        formula: 'CARTERA VENCIDA / TOTAL CARTERA',
        sustentacion: 'SEMANAL'
    },

    // ========== ADMINISTRATIVO ==========
    {
        id: 'inventarios-realizados',
        name: '# de inventarios realizados / programados',
        area: 'administrativo',
        objetivo: 'Ejecutar el control interno de los inventarios',
        meta: 16,
        unit: 'cantidad',
        frecuencia: 'SEMANAL',
        responsable: 'INFORMACIÓN/INVENTARIO',
        sustentacion: 'SEMANAL'
    },
    {
        id: 'fiabilidad-inventarios',
        name: '(Valor correcto / valor verificado) x100',
        area: 'administrativo',
        objetivo: 'Garantizar la fiabilidad de los inventarios',
        meta: 100,
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'INFORMACIÓN/INVENTARIO',
        sustentacion: 'SEMANAL'
    },
    {
        id: 'quiebres-inventario',
        name: '# de quiebres de inventario en el período',
        area: 'administrativo',
        objetivo: 'Garantizar la disponibilidad de inventario',
        meta: 0,
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'INFORMACIÓN/INVENTARIO',
        sustentacion: 'SEMANAL'
    },
    {
        id: 'obsolescencia',
        name: '(Inventario obsoleto / inventario total) x 100',
        area: 'administrativo',
        objetivo: 'Disminuir la obsolescencia en inventarios',
        meta: 0,
        unit: '%',
        frecuencia: 'MENSUAL',
        responsable: 'INFORMACIÓN/INVENTARIO',
        sustentacion: 'MENSUAL'
    },
    {
        id: 'mermas',
        name: '(Valor mermas / inventario total) x100',
        area: 'administrativo',
        objetivo: 'Fortalecer el control del inventario',
        meta: 0,
        unit: '%',
        frecuencia: 'SEMANAL',
        responsable: 'INFORMACIÓN/INVENTARIO',
        sustentacion: 'SEMANAL'
    },
    {
        id: 'diferencia-inventarios',
        name: 'Valor diferencia física - valor del inventario',
        area: 'administrativo',
        objetivo: 'Disminuir la diferencia en los inventarios',
        meta: 0,
        unit: '$',
        frecuencia: 'SEMANAL',
        responsable: 'INFORMACIÓN/INVENTARIO',
        sustentacion: 'SEMANAL'
    },
    {
        id: 'revision-margenes',
        name: 'Cantidad de veces revisados / meta',
        area: 'administrativo',
        objetivo: 'Garantizar los márgenes en el sistema',
        meta: 4,
        unit: 'veces',
        frecuencia: 'SEMANAL',
        responsable: 'INFORMACIÓN/INVENTARIO',
        sustentacion: 'SEMANAL'
    },
    {
        id: 'revision-precios',
        name: 'Cantidad de veces revisados / meta',
        area: 'administrativo',
        objetivo: 'Garantizar los precios a la calle (precio de lista) estén bien',
        meta: 4,
        unit: 'veces',
        frecuencia: 'SEMANAL',
        responsable: 'INFORMACIÓN/INVENTARIO',
        sustentacion: 'SEMANAL'
    }
];

export const getKPIsByArea = (areaId) =>
    kpiDefinitions.filter(kpi => kpi.area === areaId);

export const getKPIById = (id) =>
    kpiDefinitions.find(kpi => kpi.id === id);
