/**
 * Entity mapping for brands
 */
export const BRAND_TO_ENTITY = {
    'ALPINA': 'TYM',
    'ZENU': 'TYM',
    'FLEISCHMANN': 'TYM',
    'UNILEVER': 'TAT',
    'FAMILIA': 'TAT',
    'TYM': 'TYM',
    'TAT': 'TAT'
};

export const getBrandEntity = (brand) => BRAND_TO_ENTITY[brand?.toUpperCase()] || null;

/**
 * Obtiene el responsable adecuado para el KPI según la entidad del usuario
 */
export const getKPIResponsable = (kpi, user) => {
    if (!kpi || !user) return null;
    if (user.company === 'TYM' && kpi.responsableTYM) return kpi.responsableTYM;
    if (user.company === 'TAT' && kpi.responsableTAT) {
        // Si el usuario es el responsable alternativo TAT, devolver ese cargo
        if (kpi.responsableTATAlt && kpi.responsableTATAlt === user.cargo) return kpi.responsableTATAlt;
        return kpi.responsableTAT;
    }
    return kpi.responsable;
};

/**
 * Obtiene las marcas de una entidad para un KPI, 
 * excluyendo el nombre de la empresa si existen marcas específicas.
 */
export const getEntityBrands = (kpi, entity) => {
    if (!kpi.meta || typeof kpi.meta !== 'object') return [];
    
    const allBrands = Object.keys(kpi.meta);
    const brandsOfEntity = allBrands.filter(b => (BRAND_TO_ENTITY[b] === entity || b === entity) && b !== 'POLAR');
    
    const hasSpecificBrands = brandsOfEntity.some(b => b !== entity && BRAND_TO_ENTITY[b] === entity);
    
    if (hasSpecificBrands) {
        return brandsOfEntity.filter(b => b !== entity);
    }
    
    return brandsOfEntity;
};

/**
 * Filters KPI data for a specific entity (TYM or TAT)
 * @param {Array} kpiData - The raw KPI data array
 * @param {string} entity - 'TYM' or 'TAT'
 * @returns {Array} - Filtered KPI data with entity-specific values
 */
export const filterKPIsByEntity = (kpiData, entity) => {
    if (!kpiData) return [];

    return kpiData.filter(kpi => {
        if (kpi.visibleEnAreas && Array.isArray(kpi.visibleEnAreas)) {
            return true;
        }
        
        // Si no tiene meta definida como objeto, es un KPI global y debe verse siempre
        if (!kpi.meta || typeof kpi.meta !== 'object') {
            return true;
        }

        // Si tiene meta objeto, verificar si tiene alguna marca de la entidad o es 'Global'
        const hasEntityBrand = Object.keys(kpi.meta).some(b => 
            BRAND_TO_ENTITY[b] === entity || 
            b === entity || 
            b?.toUpperCase() === 'GLOBAL'
        );

        return hasEntityBrand;
    }).map(kpi => {
        // 1. Resolver Meta (Target) - Promedio si hay marcas de la misma entidad
        let targetMeta = kpi.meta;
        let entityBrands = [];
        if (kpi.meta && typeof kpi.meta === 'object') {
            entityBrands = getEntityBrands(kpi, entity);
            if (entityBrands.length > 0) {
                const totalMeta = entityBrands.reduce((sum, b) => sum + (kpi.meta[b] || 0), 0);
                targetMeta = parseFloat((totalMeta / entityBrands.length).toFixed(2));
            } else {
                targetMeta = Object.values(kpi.meta)[0] || 0;
            }
        }

        // 2. Resolver Datos Agregados para la Entidad
        const brandValues = kpi.brandValues || {};
        const entityKeys = Object.keys(brandValues).filter(key => key.startsWith(`${entity}-`));

        if (entityKeys.length > 0) {
            let totalValue = 0;
            let totalCompliance = 0;
            let filledCount = 0;

            // Determinar qué claves usar para el cálculo:
            // 1) Si existen datos brand-específicos (TYM-ALPINA, TYM-ZENU...) → usar SOLO esos
            // 2) Si no hay brand-específicos pero hay nivel entidad (TYM-TYM) → usar ese
            // Esto evita mezclar ambos niveles y promedios incorrectos
            const brandSpecificKeys = entityBrands.length > 0
                ? entityBrands.map(b => `${entity}-${b}`).filter(k => brandValues[k]?.hasData)
                : [];
            const keysToAggregate = brandSpecificKeys.length > 0
                ? brandSpecificKeys
                : entityKeys.filter(k => brandValues[k]?.hasData);

            // allFilled: todas las marcas definidas tienen datos brand-específicos
            let allFilled = false;
            if (entityBrands.length > 0) {
                allFilled = entityBrands.every(brand => {
                    const key = `${entity}-${brand}`;
                    return brandValues[key] && brandValues[key].hasData;
                });
            } else {
                allFilled = brandValues[`${entity}-${entity}`]?.hasData || brandValues[`${entity}-GLOBAL`]?.hasData || false;
            }

            keysToAggregate.forEach(key => {
                const data = brandValues[key];
                if (data && data.hasData) {
                    totalValue += (data.currentValue || 0);
                    totalCompliance += (data.compliance || 0);
                    filledCount++;
                }
            });

            const avgValue = filledCount > 0 ? totalValue / filledCount : 0;
            const avgCompliance = filledCount > 0 ? totalCompliance / filledCount : 0;

            let semaphore = 'gray';
            if (filledCount > 0) {
                if (avgCompliance >= 95) semaphore = 'green';
                else if (avgCompliance >= 85) semaphore = 'yellow';
                else semaphore = 'red';
            }

            // Usar el additionalData del brandValue con hasData:true y updatedAt más reciente.
            // Si ninguno tiene hasData, usar el más reciente de todos.
            const keysWithData = entityKeys.filter(k => brandValues[k]?.hasData);
            const keysForAdditional = keysWithData.length > 0 ? keysWithData : entityKeys;
            const mostRecentKey = keysForAdditional.reduce((best, key) => {
                const t = brandValues[key]?.additionalData?.updatedAt || 0;
                const bestT = brandValues[best]?.additionalData?.updatedAt || 0;
                return t > bestT ? key : best;
            }, keysForAdditional[0]);
            const baseAdditionalData = brandValues[mostRecentKey]?.additionalData || {};

            // anyFilled: hay dato si alguna clave usada tiene datos
            const anyFilled = keysToAggregate.length > 0;

            return {
                ...kpi,
                currentValue: parseFloat(avgValue.toFixed(2)),
                compliance: Math.min(Math.round(avgCompliance), 100),
                semaphore: semaphore,
                targetMeta,
                hasData: anyFilled,
                isComplete: allFilled,
                additionalData: {
                    ...baseAdditionalData,
                    brand: entityBrands.length === 1 ? entityBrands[0] : (entity === 'TYM' ? 'Tiendas y Marcas' : 'TAT Distribuciones')
                }
            };
        }

        // Si llegamos aquí, es porque no hay datos específicos (brandValues) para esta entidad en este periodo
        const isGlobalKPI = !kpi.meta || typeof kpi.meta !== 'object';
        
        return {
            ...kpi,
            targetMeta,
            hasData: isGlobalKPI ? (kpi.hasData || false) : false,
            currentValue: isGlobalKPI ? (kpi.currentValue || 0) : 0,
            compliance: isGlobalKPI ? (kpi.compliance || 0) : 0,
            semaphore: isGlobalKPI ? (kpi.semaphore || 'gray') : 'gray'
        };
    });
};

/**
 * Mapeo de campos requeridos por fórmula para cada KPI
 */
export const getKPIFormulaFields = (kpiId) => {
    const fieldMappings = {
        'pedidos-devueltos': [
            { name: 'pedidosFacturados', label: 'Pedidos Facturados', type: 'number', placeholder: 'Eje: 1500' },
            { name: 'pedidosDevueltos', label: 'Pedidos Devueltos', type: 'number', placeholder: 'Eje: 25' }
        ],
        'promedio-pedidos-auxiliar': [
            { name: 'numeroPedidos', label: 'Número de Pedidos', type: 'number', placeholder: 'Eje: 450' },
            { name: 'auxiliares', label: 'Número de Auxiliares', type: 'number', placeholder: 'Eje: 6' }
        ],
        'promedio-pedidos-carro': [
            { name: 'numeroPedidos', label: 'Número de Pedidos', type: 'number', placeholder: 'Eje: 450' },
            { name: 'vehiculos', label: 'Número de Vehículos', type: 'number', placeholder: 'Eje: 6' }
        ],
        'gasto-nomina-venta': [
            { name: 'nominaLogistica', label: 'Nómina Logística ($)', type: 'number', placeholder: 'Eje: 5000000' },
            { name: 'ventaTotal', label: 'Venta Total ($)', type: 'number', placeholder: 'Eje: 150000000' }
        ],
        'gasto-fletes-venta': [
            { name: 'valorFletes', label: 'Valor Fletes ($)', type: 'number', placeholder: 'Eje: 8000000' },
            { name: 'ventaTotal', label: 'Venta Total ($)', type: 'number', placeholder: 'Eje: 150000000' }
        ],
        'horas-extras-auxiliares': [
            { name: 'totalHorasExtras', label: 'Total Horas Extras', type: 'number', placeholder: 'Eje: 48' },
            { name: 'auxiliares', label: 'Número de Auxiliares', type: 'number', placeholder: 'Eje: 6' }
        ],
        'primer-margen': [
            { name: 'ventas', label: 'Ventas Totales ($)', type: 'number', placeholder: 'Eje: 20000000' },
            { name: 'costoVentas', label: 'Costo de Ventas ($)', type: 'number', placeholder: 'Eje: 15000000' }
        ],
        'devoluciones-mal-estado': [
            { name: 'valorDevolucion', label: 'Valor Dev. Mal Estado ($)', type: 'number', placeholder: 'Eje: 500000' },
            { name: 'ventaTotal', label: 'Venta Total ($)', type: 'number', placeholder: 'Eje: 100000000' }
        ],
        'promedio-venta-vendedor': [
            { name: 'ventasTotales', label: 'Ventas Totales ($)', type: 'number', placeholder: 'Eje: 500000000' },
            { name: 'numeroVendedores', label: 'Número de Vendedores', type: 'number', placeholder: 'Eje: 10' }
        ],
        'venta-credito-total': [
            { name: 'ventaCredito', label: 'Venta a Crédito ($)', type: 'number', placeholder: 'Eje: 20000000' },
            { name: 'ventaTotal', label: 'Venta Total ($)', type: 'number', placeholder: 'Eje: 100000000' }
        ],
        'cartera-vencida-total': [
            { name: 'carteraVencida', label: 'Cartera Vencida ($)', type: 'number', placeholder: 'Eje: 5000000' },
            { name: 'totalCartera', label: 'Cartera Total ($)', type: 'number', placeholder: 'Eje: 100000000' }
        ],
        'venta-realizada-esperada': [
            { name: 'ventaRealizada', label: 'Venta Realizada ($)', type: 'number' },
            { name: 'presupuestoVenta', label: 'Presupuesto de Venta ($)', type: 'number' }
        ],
        'devoluciones-buen-estado': [
            { name: 'devolucionBuenEstado', label: 'Devolución Buen Estado ($)', type: 'number' },
            { name: 'ventaTotal', label: 'Venta Total ($)', type: 'number' }
        ],
        'devoluciones-mal-estado-comercial': [
            { name: 'devolucionMalEstado', label: 'Devolución Mal Estado ($)', type: 'number' },
            { name: 'ventaTotal', label: 'Venta Total ($)', type: 'number' }
        ],
        'participacion-venta-credito': [
            { name: 'ventaCredito', label: 'Venta Crédito ($)', type: 'number' },
            { name: 'ventaTotal', label: 'Venta Total ($)', type: 'number' }
        ],
        'cobro-optimo-cartera': [
            { name: 'carteraVencida', label: 'Cartera Vencida ($)', type: 'number' },
            { name: 'totalCartera', label: 'Total Cartera ($)', type: 'number' }
        ],
        'rotacion-equipo-comercial': [
            { name: 'personalRetirado', label: 'Personal Retirado', type: 'number' },
            { name: 'promedioEmpleados', label: 'Promedio de Empleados', type: 'number' }
        ],
        'gasto-personal-comercial': [
            { name: 'gastosPersonal', label: 'Gastos de Personal ($)', type: 'number' },
            { name: 'ventaTotal', label: 'Total Venta ($)', type: 'number' }
        ],
        'gasto-viaje-comercial': [
            { name: 'gastosViaje', label: 'Gastos de Viaje ($)', type: 'number' },
            { name: 'ventaTotal', label: 'Total Venta ($)', type: 'number' }
        ],
        'dias-inventario-comercial': [
            { name: 'diasInventario', label: 'Días de Inventario', type: 'number' }
        ],
        'cartera-11-30': [
            { name: 'cartera1130', label: 'Cartera 11-30 días ($)', type: 'number', placeholder: 'Eje: 5000000' },
            { name: 'carteraTotal', label: 'Cartera Total ($)', type: 'number', placeholder: 'Eje: 100000000' }
        ],
        'valor-cartera-venta': [
            { name: 'carteraTotal', label: 'Cartera Total ($)', type: 'number', placeholder: 'Eje: 100000000' },
            { name: 'ventaTotal', label: 'Venta Total ($)', type: 'number', placeholder: 'Eje: 500000000' }
        ],
        'notas-errores-venta': [
            { name: 'notasDevolucion', label: 'Notas x Devolución ($)', type: 'number' },
            { name: 'valorVenta', label: 'Valor de la Venta ($)', type: 'number' }
        ],
        'fiabilidad-inventarios': [
            { name: 'valorVerificado', label: 'Valor Verificado ($)', type: 'number' },
            { name: 'valorCorrecto', label: 'Valor Correcto ($)', type: 'number' }
        ],
        'obsolescencia': [
            { name: 'inventarioObsoleto', label: 'Inventario Obsoleto ($)', type: 'number' },
            { name: 'inventarioTotal', label: 'Inventario Total ($)', type: 'number' }
        ],
        'mermas': [
            { name: 'valorMermas', label: 'Valor Mermas ($)', type: 'number' },
            { name: 'inventarioTotal', label: 'Inventario Total ($)', type: 'number' }
        ],
        'revision-margenes': [
            { name: 'revisionesEjecutadas', label: 'Revisiones Ejecutadas', type: 'number' },
            { name: 'revisionesProgramadas', label: 'Revisiones Programadas', type: 'number' }
        ],
        'revision-precios': [
            { name: 'revisionesEjecutadas', label: 'Revisiones Ejecutadas', type: 'number' },
            { name: 'revisionesProgramadas', label: 'Revisiones Programadas', type: 'number' }
        ],
        'segundos-unidad-separada': [
            { name: 'unidadesSeparadas', label: 'Unidades Separadas', type: 'number', placeholder: 'Eje: 40000' },
            { name: 'segundosUtilizados', label: 'Segundos Utilizados', type: 'number', placeholder: 'Eje: 72000' }
        ],
        'pesos-separados-hombre': [
            { name: 'valorVenta', label: 'Valor Venta ($)', type: 'number', placeholder: 'Eje: 3500000000' },
            { name: 'auxiliaresSeparacion', label: 'Auxiliares de Separación', type: 'number', placeholder: 'Eje: 17' }
        ],
        'pedidos-separar-total': [
            { name: 'pedidosFacturados', label: 'Pedidos Facturados', type: 'number', placeholder: 'Eje: 1200' },
            { name: 'pedidosSeparados', label: 'Pedidos Separados', type: 'number', placeholder: 'Eje: 1200' }
        ],
        'planillas-separadas': [
            { name: 'planillasGeneradas', label: 'Planillas Generadas', type: 'number', placeholder: 'Eje: 15' },
            { name: 'planillasSeparadas', label: 'Planillas Separadas', type: 'number', placeholder: 'Eje: 15' }
        ],
        'nomina-venta-picking': [
            { name: 'valorNomina', label: 'Valor Nómina ($)', type: 'number', placeholder: 'Eje: 65000000' },
            { name: 'ventaTotal', label: 'Venta Total ($)', type: 'number', placeholder: 'Eje: 3500000000' }
        ],
        'horas-extras-venta-picking': [
            { name: 'horasExtras', label: 'Valor Horas Extras ($)', type: 'number', placeholder: 'Eje: 2000000' },
            { name: 'ventaTotal', label: 'Venta Total ($)', type: 'number', placeholder: 'Eje: 3500000000' }
        ],
        'embalajes-perdidos': [
            { name: 'canastillasRecibidas', label: 'Canastillas Recibidas', type: 'number', placeholder: 'Eje: 5000' },
            { name: 'canastillasGestionadas', label: 'Canastillas Gestionadas', type: 'number', placeholder: 'Eje: 5000' }
        ],
        'nomina-compra-deposito': [
            { name: 'valorNomina', label: 'Valor Nómina ($)', type: 'number', placeholder: 'Eje: 13000000' },
            { name: 'ventaTotal', label: 'Venta Total ($)', type: 'number', placeholder: 'Eje: 3200000000' }
        ],
        'horas-extras-venta-deposito': [
            { name: 'horasExtras', label: 'Valor Horas Extras ($)', type: 'number', placeholder: 'Eje: 150000' },
            { name: 'ventaTotal', label: 'Venta Total ($)', type: 'number', placeholder: 'Eje: 3500000000' }
        ],
        'averias-venta': [
            { name: 'totalAverias', label: 'Total Averías ($)', type: 'number', placeholder: 'Eje: 7000000' },
            { name: 'ventaTotal', label: 'Venta Total ($)', type: 'number', placeholder: 'Eje: 3500000000' }
        ],
        'rotacion-personal': [
            { name: 'personalRetirado', label: 'Personal Retirado', type: 'number', placeholder: 'Eje: 8' },
            { name: 'promedioEmpleados', label: 'Promedio Empleados', type: 'number', placeholder: 'Eje: 160' }
        ],
        'ausentismo': [
            { name: 'diasPerdidos', label: 'Días Perdidos', type: 'number', placeholder: 'Eje: 150' },
            { name: 'diasLaborados', label: 'Días Laborados', type: 'number', placeholder: 'Eje: 4000' }
        ],
        'calificacion-auditoria': [
            { name: 'actividadesEjecutadas', label: 'Actividades Ejecutadas', type: 'number', placeholder: 'Eje: 9' },
            { name: 'actividadesProgramadas', label: 'Actividades Programadas', type: 'number', placeholder: 'Eje: 10' }
        ],
        'he-rn-nomina': [
            { name: 'valorHEDHEN', label: 'Valor HED/HEN ($)', type: 'number', placeholder: 'Eje: 15000000' },
            { name: 'totalNomina', label: 'Total Nómina ($)', type: 'number', placeholder: 'Eje: 400000000' }
        ],
        'gasto-nomina-venta-rrhh': [
            { name: 'valorNomina', label: 'Valor Nómina ($)', type: 'number', placeholder: 'Eje: 613000000' },
            { name: 'ventaTotal', label: 'Venta Total ($)', type: 'number', placeholder: 'Eje: 5200000000' }
        ],
        'actividades-cultura': [
            { name: 'actividadesEjecutadas', label: 'Actividades Ejecutadas', type: 'number', placeholder: 'Eje: 12' },
            { name: 'actividadesProgramadas', label: 'Actividades Programadas', type: 'number', placeholder: 'Eje: 12' }
        ],
        'tiempo-contratacion': [
            { name: 'diasVacante', label: 'Días de Respuesta', type: 'number', placeholder: 'Eje: 7' }
        ],
        'arqueos-realizados': [
            { name: 'arqueosProgramados', label: 'Arqueos Programados', type: 'number', placeholder: 'Eje: 8' },
            { name: 'arqueosRealizados', label: 'Arqueos Realizados', type: 'number', placeholder: 'Eje: 8' },
            { name: 'valorSobra', label: 'Sobra Detectada ($)', type: 'number', placeholder: 'Eje: 5000' },
            { name: 'valorFaltante', label: 'Faltante Detectado ($)', type: 'number', placeholder: 'Eje: 2000' }
        ],
        'indice-arqueo-caja': [
            { name: 'currentValue', label: 'N° de Arqueos con Diferencia', type: 'number', placeholder: 'Eje: 2' }
        ],
        'planillas-cerradas': [
            { name: 'planillasGeneradas', label: 'Planillas Generadas', type: 'number', placeholder: 'Eje: 40' },
            { name: 'planillasCerradas', label: 'Planillas Cerradas', type: 'number', placeholder: 'Eje: 40' }
        ],
        'vales-descuadres': [
            { name: 'totalCuadreCaja', label: 'Total Cuadre de Caja ($)', type: 'number', placeholder: 'Eje: 150000000' },
            { name: 'valorVales', label: 'Valor de Vales ($)', type: 'number', placeholder: 'Eje: 750000' }
        ],
        'cartera-no-vencida': [
            { name: 'totalVenta', label: 'Total Venta ($)', type: 'number', placeholder: 'Eje: 1500000000' },
            { name: 'totalCarteraVencida', label: 'Total Cartera Vencida ($)', type: 'number', placeholder: 'Eje: 140000000' }
        ],
        'cartera-mayor-30': [
            { name: 'totalCartera', label: 'Total Cartera ($)', type: 'number', placeholder: 'Eje: 140000000' },
            { name: 'totalMayor30', label: 'Total Mayor a 30 días ($)', type: 'number', placeholder: 'Eje: 7000000' }
        ],
        'recircularizaciones': [
            { name: 'programadas', label: 'Programadas', type: 'number', placeholder: 'Eje: 2' },
            { name: 'efectuadas', label: 'Efectuadas', type: 'number', placeholder: 'Eje: 2' }
        ],
        'dias-cierre': [
            { name: 'totalDiasCierre', label: 'Total Días al Cierre', type: 'number', placeholder: 'Eje: 12' },
            { name: 'diasReporte', label: 'Días para el Reporte', type: 'number', placeholder: 'Eje: 13' }
        ],
        'ajustes-posteriores': [
            { name: 'ajustesPosteriores', label: 'Cantidad de Ajustes', type: 'number', placeholder: 'Eje: 1' }
        ],
        'ajustes-revisoria': [
            { name: 'ajustesRevisor', label: 'Cantidad de Ajustes', type: 'number', placeholder: 'Eje: 1' }
        ],
        'quiebres-inventario': [
            { name: 'quiebres', label: 'Número de Quiebres', type: 'number', placeholder: 'Eje: 5' },
            { name: 'totalSku', label: 'Total SKUs', type: 'number', placeholder: 'Eje: 500' }
        ],
        'rotacion-cxc': [
            { name: 'ventasCredito', label: 'Ventas a Crédito ($)', type: 'number', placeholder: 'Eje: 350000000' },
            { name: 'cxcInicial', label: 'CxC Inicial ($)', type: 'number', placeholder: 'Eje: 100000000' },
            { name: 'cxcFinal', label: 'CxC Final ($)', type: 'number', placeholder: 'Eje: 120000000' }
        ],
        'rotacion-cxp': [
            { name: 'comprasCredito', label: 'Compras a Crédito ($)', type: 'number', placeholder: 'Eje: 350000000' },
            { name: 'cxpInicial', label: 'CxP Inicial ($)', type: 'number', placeholder: 'Eje: 80000000' },
            { name: 'cxpFinal', label: 'CxP Final ($)', type: 'number', placeholder: 'Eje: 90000000' }
        ],
        'conciliaciones-bancarias': [
            { name: 'conciliacionesRequeridas', label: 'Conciliaciones Requeridas', type: 'number', placeholder: 'Eje: 2' },
            { name: 'conciliacionesRealizadas', label: 'Conciliaciones Realizadas', type: 'number', placeholder: 'Eje: 1' }
        ],
        'conciliaciones-diarias': [
            { name: 'conciliacionesSistema', label: 'Conciliaciones en Sistema', type: 'number', placeholder: 'Eje: 10' },
            { name: 'conciliacionesBanco', label: 'Conciliaciones en Banco', type: 'number', placeholder: 'Eje: 10' }
        ],
        'activos-conciliados': [
            { name: 'activosRegistrados', label: 'Activos Registrados', type: 'number', placeholder: 'Eje: 250' },
            { name: 'activosConciliados', label: 'Activos Conciliados', type: 'number', placeholder: 'Eje: 245' }
        ],
        'multas-sanciones': [
            { name: 'multasSanciones', label: 'Multas o Sanciones ($)', type: 'number', placeholder: 'Eje: 2500000' },
            { name: 'ingreso', label: 'Ingreso Total ($)', type: 'number', placeholder: 'Eje: 3600000000' }
        ],
        'optimizacion-tributaria': [
            { name: 'impuestosOptimizados', label: 'Impuestos Optimizados ($)', type: 'number', placeholder: 'Eje: 70000000' },
            { name: 'totalImpuestos', label: 'Total de Impuestos ($)', type: 'number', placeholder: 'Eje: 150000000' }
        ],
        'pedidos-facturados': [
            { name: 'pedidos', label: 'Número de Pedidos', type: 'number', placeholder: 'Eje: 1500' },
            { name: 'facturas', label: 'Pedidos Facturados', type: 'number', placeholder: 'Eje: 1500' }
        ],
        'impresion-facturas': [
            { name: 'facturasImpresas', label: 'Facturas Impresas', type: 'number', placeholder: 'Eje: 800' },
            { name: 'facturasGeneradas', label: 'Facturas Generadas', type: 'number', placeholder: 'Eje: 800' }
        ],
        'error-facturacion': [
            { name: 'errores', label: 'Errores en Facturación', type: 'number', placeholder: 'Eje: 5' },
            { name: 'facturas', label: 'Total Facturas', type: 'number', placeholder: 'Eje: 1500' }
        ],
        'tareas-programadas': [
            { name: 'tareasEjecutadas', label: 'Tareas Ejecutadas', type: 'number', placeholder: 'Eje: 10' },
            { name: 'tareasProgramadas', label: 'Tareas Programadas', type: 'number', placeholder: 'Eje: 10' }
        ],
        'mantenimiento-equipos': [
            { name: 'currentValue', label: 'Equipos Mantenidos', type: 'number', placeholder: 'Eje: 3' }
        ],
        'resolucion-incidencias': [
            { name: 'totalIncidencias', label: 'Total Incidencias', type: 'number', placeholder: 'Eje: 20' },
            { name: 'incidenciasRecurrentes', label: 'Incidencias Recurrentes', type: 'number', placeholder: 'Eje: 1' }
        ]
    };
    return fieldMappings[kpiId] || [{ name: 'currentValue', label: 'Valor Real', type: 'number' }];
};

/**
 * Grupos de alias para campos compartidos
 */
export const FIELD_ALIAS_GROUPS = [
    ['ventaTotal', 'totalVenta', 'ventasTotales', 'ventas', 'valorVenta'],
    ['totalCartera', 'carteraTotal', 'totalCarteraVencida'],
    ['valorNomina', 'totalNomina', 'nominaLogistica'],
    ['auxiliares', 'auxiliaresSeparacion']
];

export const ALL_SHARED_FIELDS = [
    'ventaTotal', 'totalVenta', 'ventasTotales', 'ventas', 'valorVenta',
    'totalCartera', 'carteraTotal', 'totalCarteraVencida',
    'valorNomina', 'totalNomina', 'nominaLogistica',
    'auxiliares', 'auxiliaresSeparacion',
    'ventaRealizada', 'vehiculos'
];

/**
 * Resuelve el valor de un campo compartido considerando sus alias
 */
export const resolveSharedFieldValue = (updData, targetFieldName) => {
    if (!updData) return undefined;
    if (updData[targetFieldName] !== undefined && updData[targetFieldName] !== null && updData[targetFieldName] !== '') {
        return updData[targetFieldName];
    }
    const group = FIELD_ALIAS_GROUPS.find(g => g.includes(targetFieldName));
    if (group) {
        for (const alias of group) {
            if (updData[alias] !== undefined && updData[alias] !== null && updData[alias] !== '') {
                return updData[alias];
            }
        }
    }
    return undefined;
};

