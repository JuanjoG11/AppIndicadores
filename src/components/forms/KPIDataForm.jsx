import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
    Calculator,
    X,
    Save,
    Info,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    Box,
    Truck,
    DollarSign,
    Users,
    Activity,
    Shield as ShieldIcon,
    FileText,
    Cpu
} from 'lucide-react';
import { calculateKPIValue, isInverseKPI } from '../../utils/kpiCalculations';
import { BRAND_TO_ENTITY, getBrandEntity } from '../../utils/kpiHelpers';
import { formatNumber, formatKPIValue } from '../../utils/formatters';

const KPIDataForm = ({ kpi, currentUser, onSave, onCancel, mode = 'data', initialBrand }) => {
    const isMetaMode = mode === 'meta';
    const hasMultipleMetas = kpi.meta && typeof kpi.meta === 'object';
    const userEntity = currentUser?.company || 'TYM';

    // 1. Filtrar marcas comerciales
    // Si el usuario tiene marca bloqueada (ej: fact_alpina), solo mostrar ESA marca
    const lockedBrand = !isMetaMode ? (currentUser?.activeBrand || null) : null;
    let commercialBrands = [];
    if (hasMultipleMetas) {
        const allBrands = Object.keys(kpi.meta).filter(b => b !== 'Global' && b !== 'TYM' && b !== 'TAT');

        if (isMetaMode) {
            commercialBrands = allBrands;
        } else if (lockedBrand) {
            // Usuario con proveedor fijo: solo ve SU marca si existe en este KPI
            if (Array.isArray(lockedBrand)) {
                commercialBrands = allBrands.filter(b => lockedBrand.includes(b));
            } else {
                commercialBrands = allBrands.filter(b => b === lockedBrand);
            }
        } else {
            // Analistas sin restricción: ven marcas comerciales de su entidad
            commercialBrands = allBrands.filter(b => BRAND_TO_ENTITY[b] === userEntity);
        }
    }
    const hasCommercialBrands = commercialBrands.length > 0;

    // 2. Determinar cuáles faltan por cargar
    const isBrandPending = (brandName) => {
        const dataKey = `${userEntity}-${brandName.toUpperCase()}`;
        const brandData = kpi.brandValues?.[dataKey];
        return !brandData || brandData.hasData === false;
    };

    // 3. Seleccionar por defecto
    // Si el usuario tiene marca bloqueada, esa es siempre la marca seleccionada
    // Usamos initialBrand si viene de props y es válido para la vista actual
    const validatedInitialBrand = lockedBrand ||
        ((initialBrand && initialBrand !== 'all' && (isMetaMode || (hasMultipleMetas ? commercialBrands.includes(initialBrand) : true)))
        ? initialBrand
        : null);

    // Si no hay marcas comerciales y no es gerente, la marca asignada automáticamente es la propia entidad.
    const defaultBrand = 
        (Array.isArray(validatedInitialBrand) 
            ? (validatedInitialBrand.find(isBrandPending) || validatedInitialBrand[0]) 
            : validatedInitialBrand) || 
        ((!isMetaMode && !hasCommercialBrands)
            ? userEntity
            : (commercialBrands.find(isBrandPending) || commercialBrands[0] || userEntity));

    // Obtener datos iniciales específicos de la marca si existen y son del periodo actual
    const getInitialBrandData = (brandName) => {
        const dataKey = `${userEntity}-${brandName.toUpperCase()}`;
        const currentPeriod = new Date().toISOString().substring(0, 7); // YYYY-MM
        
        const data = kpi.brandValues?.[dataKey]?.additionalData || 
                    (kpi.additionalData?.brand === brandName ? kpi.additionalData : null);

        if (data) {
            // Solo pre-cargar si el periodo coincide o si no tiene periodo (para evitar basura de meses pasados)
            if (!data.period || data.period === currentPeriod) {
                return data;
            }
        }
        return {};
    };

    // Inicializar con datos previos si existen
    const [formData, setFormData] = useState({
        brand: defaultBrand,
        company: userEntity, // Auto-assign company
        newFrecuencia: kpi.frecuencia,
        ...getInitialBrandData(defaultBrand)
    });

    // Refs para mantener la posición del cursor en campos con formato
    const lastInput = useRef(null);
    const lastSelectionStart = useRef(null);
    const lastValueLength = useRef(0);

    useLayoutEffect(() => {
        if (lastInput.current && lastSelectionStart.current !== null) {
            const input = lastInput.current;
            const newLength = input.value.length;
            const diff = newLength - lastValueLength.current;
            const newPos = Math.max(0, lastSelectionStart.current + diff);
            input.setSelectionRange(newPos, newPos);
            // No reseteamos inmediatamente para permitir renders sucesivos si fuera necesario
            // lastInput.current = null; // Quitamos esto para que sea más robusto
        }
    }, [formData]);

    const [saveSuccess, setSaveSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');


    // Mapeo de iconos por área para el diseño
    const areaIcons = {
        'logistica-entrega': <Truck size={18} />,
        'logistica-picking': <Box size={18} />,
        'comercial': <TrendingUp size={18} />,
        'cartera': <DollarSign size={18} />,
        'administrativo': <Activity size={18} />,
        'talento-humano': <Users size={18} />,
        'facturacion': <FileText size={18} />,
        'software': <Cpu size={18} />
    };

    // Determinar qué campos necesita el formulario basado en la fórmula
    const getFormulaFields = () => {
        if (!kpi.formula) return [{ name: 'currentValue', label: 'Valor Actual', type: 'number' }];

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
            // New Commercial KPIs
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
            'quiebres-inventario': [
                { name: 'quiebres', label: 'Quiebres de Inventario', type: 'number' },
                { name: 'totalSku', label: 'Total SKU / Referencias', type: 'number' }
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
            // Picking Specific
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
            // Deposito Specific
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
            // Talento Humano Specific
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
            // Caja Specific
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
            // Cartera Specific (Fed by Contabilidad)
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
            // Contabilidad Specific
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
                { name: 'facturas', label: 'Número de Facturas', type: 'number', placeholder: 'Eje: 1500' }
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
            ],
        };


        return fieldMappings[kpi.id] || [{ name: 'currentValue', label: 'Valor Real', type: 'number' }];
    };

    const calculateLiveResult = () => {
        return calculateKPIValue(kpi.id, formData);
    };

    const fields = getFormulaFields();
    const liveResult = calculateLiveResult();
    let currentMeta = hasMultipleMetas
        ? (kpi.meta[formData.brand] || kpi.meta[formData.brand?.toLowerCase()] || Object.values(kpi.meta)[0])
        : kpi.meta;
        
    const isInverse = isInverseKPI(kpi.id);
    const isStrict = ['revision-margenes', 'revision-precios', 'pedidos-facturados', 'impresion-facturas', 'conciliaciones-diarias'].includes(kpi.id);
    
    // Forzar meta de 100 para indicadores de cumplimiento estricto
    if (isStrict) currentMeta = 100;
    
    let isMeetingMeta = false;
    let compliance = 0;

    if (currentMeta === 0 && liveResult === 0) {
        compliance = isInverse ? 100 : 0;
    } else if (currentMeta === 0 && liveResult > 0) {
        compliance = isInverse ? 0 : 100;
    } else if (typeof currentMeta === 'number') {
        compliance = isInverse ? (currentMeta / liveResult) * 100 : (liveResult / currentMeta) * 100;
        compliance = Math.min(Math.max(Math.round(compliance || 0), 0), 100);
    }

    const greenThreshold = isStrict ? 100 : 95;
    isMeetingMeta = liveResult !== null && compliance >= greenThreshold;

    const handleSubmit = (e) => {
        e.preventDefault();
        const cleanedData = { ...formData };
        // Ensure numbers are really numbers before saving
        // And strip separators, but EXCLUDE non-numeric fields
        Object.keys(cleanedData).forEach(key => {
            const skipKeys = ['brand', 'period', 'company', 'newFrecuencia', 'detalleFaltante', 'type', 'id'];
            if (skipKeys.includes(key)) return;

            if (typeof cleanedData[key] === 'string' && cleanedData[key] !== '') {
                // Remove dots (thousands separators)
                const val = cleanedData[key].replace(/\./g, '').replace(',', '.');
                if (!isNaN(parseFloat(val)) && /^-?\d+(\.\d+)?$/.test(val)) {
                   cleanedData[key] = parseFloat(val);
                }
            }
        });

        const dataToSave = isMetaMode
            ? { ...cleanedData, type: 'META_UPDATE' }
            : { ...cleanedData, type: 'DATA_UPDATE' };

        onSave(kpi.id, dataToSave);

        if (isMetaMode) {
            setSuccessMessage(`¡Meta actualizada para ${formData.brand}! Puedes seguir con las otras.`);
            setSaveSuccess(true);
            setFormData(prev => ({ ...prev, newMeta: '' }));
            setTimeout(() => {
                setSaveSuccess(false);
                setSuccessMessage('');
            }, 3000);
        } else {
            // Confirmation for regular data entry
            setSuccessMessage(`¡Datos guardados para ${formData.brand}! Puedes cerrar esta ventana.`);
            setSaveSuccess(true);
            setTimeout(() => {
                setSaveSuccess(false);
                setSuccessMessage('');
            }, 3000);
        }
    };

    const handleChange = (fieldName, value, e) => {
        if (e && e.target && e.target.selectionStart !== null) {
            lastInput.current = e.target;
            lastSelectionStart.current = e.target.selectionStart;
            lastValueLength.current = e.target.value.length;
        }
        setFormData(prev => {
            let parsedValue = value;
            
            // Si es un string, intentamos limpiar formateo de miles
            if (typeof value === 'string') {
                // Solo si parece un campo numérico (contiene números, puntos o comas)
                const isNumericSource = /^[0-9.,\s]*$/.test(value);
                
                if (isNumericSource && fieldName !== 'brand' && fieldName !== 'newFrecuencia' && fieldName !== 'detalleFaltante') {
                    // Guardamos el raw value (limpio de puntos de miles)
                    const cleanValue = value.replace(/[^0-9,]/g, ''); 
                    parsedValue = cleanValue;
                }
            }

            if (fieldName === 'brand') {
                const brandData = getInitialBrandData(value);
                const newCompany = (value === 'TYM' || value === 'TAT') ? value : (BRAND_TO_ENTITY[value] || userEntity);
                
                if (isMetaMode) {
                    return {
                        ...brandData,
                        brand: value,
                        company: newCompany,
                        newMeta: '',
                        newFrecuencia: kpi.frecuencia
                    };
                }

                return {
                    ...brandData,
                    brand: value,
                    company: newCompany
                };
            }

            if (fieldName === 'newFrecuencia') {
                return { ...prev, [fieldName]: value };
            }

            return { ...prev, [fieldName]: parsedValue };
        });
    };

    return (
        <div
            onClick={e => e.stopPropagation()}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(15, 23, 42, 0.85)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000, padding: '1.5rem', backdropFilter: 'blur(8px)'
            }}>
            <div className="card fade-in" style={{
                maxWidth: '650px', width: '100%', maxHeight: '95vh',
                overflow: 'auto', padding: 0, border: 'none',
                boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5)',
                background: 'white', borderRadius: '28px'
            }}>
                {/* HEADER PREMIUM */}
                <div style={{
                    padding: '2rem 2.5rem',
                    background: 'var(--brand-gradient)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)',
                            borderRadius: '14px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', backdropFilter: 'blur(4px)'
                        }}>
                            {areaIcons[kpi.area] || <Calculator size={24} />}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.2rem' }}>
                                {isMetaMode ? `Ajustar Meta: ${kpi.name}` : kpi.name}
                            </h2>
                            <div style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                {(kpi.subArea || kpi.area).replace(/-/g, ' ')} • {typeof currentMeta === 'number' ? `Actual: ${currentMeta} ${kpi.unit}` : currentMeta}
                            </div>
                        </div>
                    </div>
                    <button onClick={onCancel} style={{
                        background: 'rgba(255,255,255,0.1)', border: 'none',
                        cursor: 'pointer', padding: '0.5rem', borderRadius: '12px',
                        color: 'white', transition: 'all 0.2s'
                    }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '2rem 2.5rem' }}>
                    {saveSuccess && (
                        <div style={{
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            background: '#ecfdf5',
                            borderRadius: '16px',
                            border: '1px solid #10b981',
                            color: '#047857',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            animation: 'bounceIn 0.5s ease-out'
                        }}>
                            <CheckCircle2 size={24} />
                            {successMessage || '¡DATOS GUARDADOS CON ÉXITO!'}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        {/* BRAND / ENTITY SELECTION - PREMIUM CHIPS */}
                        {(isMetaMode || (!isMetaMode && (hasCommercialBrands || kpi.meta?.TYM !== undefined || kpi.meta?.TAT !== undefined))) && (
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 800, marginBottom: '1.25rem', color: '#1e293b' }}>
                                    <Box size={16} color="var(--brand)" />
                                    {isMetaMode ? 'SELECCIONAR NIVEL DE META' : 'MARCA / NIVEL CARGA'}
                                </label>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {/* Nivel Empresa / Razón Social - MOSTRAR SI NO HAY MARCAS O EN MODO META */}
                                    {(isMetaMode || (!hasCommercialBrands && (kpi.meta?.TYM || kpi.meta?.TAT))) && (
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                                                {isMetaMode ? 'Nivel Empresa (Razón Social)' : 'Carga a Nivel Global'}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                {(isMetaMode ? ['Global', 'TYM', 'TAT'] : [userEntity]).map(scope => {
                                                    const isActive = scope === 'Global' ? (!formData.brand || formData.brand === 'Global') : formData.brand === scope;
                                                    return (
                                                        <button
                                                            key={scope}
                                                            type="button"
                                                            onClick={() => {
                                                                handleChange('brand', scope);
                                                            }}
                                                            style={{
                                                                padding: '0.6rem 1.5rem',
                                                                borderRadius: '12px',
                                                                fontSize: '0.9rem',
                                                                fontWeight: 800,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s',
                                                                border: isActive ? '2px solid var(--brand)' : '1px solid #e2e8f0',
                                                                background: isActive ? 'var(--brand-bg)' : 'white',
                                                                color: isActive ? 'var(--brand)' : '#64748b',
                                                                minWidth: '100px'
                                                            }}
                                                        >
                                                            {scope}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Nivel Marca */}
                                    {((isMetaMode) || (!isMetaMode && hasCommercialBrands)) && commercialBrands.length > 0 && (
                                        <div>
                                            {isMetaMode && (
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                                                    Nivel Marca / Producto
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                {/* Filter brands based on selected entity if not 'Global' */}
                                                {commercialBrands
                                                    .filter(brand => {
                                                        if (isMetaMode && (formData.brand === 'TYM' || formData.brand === 'TAT')) {
                                                            return BRAND_TO_ENTITY[brand] === formData.brand;
                                                        }
                                                        return true; // Show all if Global or no selection
                                                    })
                                                    .map(brand => {
                                                        const isActive = formData.brand === brand;
                                                        const pending = !isMetaMode && isBrandPending(brand);
                                                        const entity = BRAND_TO_ENTITY[brand];

                                                        return (
                                                            <button
                                                                key={brand}
                                                                type="button"
                                                                onClick={() => handleChange('brand', brand)}
                                                                style={{
                                                                    padding: '0.6rem 1rem',
                                                                    borderRadius: '12px',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: 700,
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s',
                                                                    border: isActive ? '2px solid var(--brand)' : '1px solid #e2e8f0',
                                                                    background: isActive ? 'var(--brand-bg)' : 'white',
                                                                    color: isActive ? 'var(--brand)' : '#64748b',
                                                                    position: 'relative',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center',
                                                                    gap: '2px'
                                                                }}
                                                            >
                                                                <span>{brand}</span>
                                                                <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>{entity}</span>
                                                                {pending && (
                                                                    <div style={{
                                                                        position: 'absolute', top: '-5px', right: '-5px',
                                                                        background: '#f43f5e', color: 'white', fontSize: '0.5rem',
                                                                        padding: '1px 4px', borderRadius: '4px'
                                                                    }}>!</div>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* INPUT FIELDS - CLEAN & BOLD */}
                        {/* INPUT FIELDS - CLEAN & BOLD */}
                        {isMetaMode ? (
                            <div style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem', color: '#334155' }}>
                                        Nueva Meta para {formData.brand || 'Global'} ({kpi.unit})
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        required
                                        value={formData.newMeta != null && formData.newMeta !== '' ? formData.newMeta.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ''}
                                        onChange={(e) => handleChange('newMeta', e.target.value, e)}
                                        placeholder={`Eje: ${currentMeta}`}
                                        style={{
                                            width: '100%', padding: '1.1rem 1.25rem',
                                            border: '2px solid var(--brand)', borderRadius: '18px',
                                            fontSize: '1.5rem', fontWeight: 800, color: '#1e293b',
                                            background: 'white', outline: 'none'
                                        }}
                                        autoComplete="off"
                                    />
                                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <ShieldIcon size={14} />
                                        Meta actual: {currentMeta} {kpi.unit}
                                    </p>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem', color: '#334155' }}>
                                        Frecuencia de Actualización
                                    </label>
                                    <select
                                        value={formData.newFrecuencia || kpi.frecuencia}
                                        onChange={(e) => handleChange('newFrecuencia', e.target.value)}
                                        style={{
                                            width: '100%', padding: '1.1rem 1.25rem',
                                            border: '2px solid #e2e8f0', borderRadius: '18px',
                                            fontSize: '1.1rem', fontWeight: 800, color: '#1e293b',
                                            background: '#f8fafc', outline: 'none', cursor: 'pointer',
                                            WebkitAppearance: 'none',
                                            backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231e293b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'calc(100% - 1.2rem) center',
                                            backgroundSize: '0.8rem auto'
                                        }}
                                        onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                                        onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                    >
                                        <option value="DIARIA">DIARIA</option>
                                        <option value="SEMANAL">SEMANAL</option>
                                        <option value="QUINCENAL">QUINCENAL</option>
                                        <option value="MENSUAL">MENSUAL</option>
                                        <option value="BIMESTRAL">BIMESTRAL</option>
                                        <option value="TRIMESTRAL">TRIMESTRAL</option>
                                        <option value="SEMESTRAL">SEMESTRAL</option>
                                        <option value="ANUAL">ANUAL</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                {fields.map(field => (
                                    <div key={field.name}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem', color: '#334155' }}>
                                            {field.label}
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={field.type === 'number' ? 'text' : field.type}
                                                inputMode={field.type === 'number' ? 'decimal' : undefined}
                                                required
                                                value={field.type === 'number' && formData[field.name] != null ? formData[field.name].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : (formData[field.name] ?? '')}
                                                onChange={(e) => handleChange(field.name, e.target.value, e)}
                                                autoComplete="off"
                                                style={{
                                                    width: '100%', padding: '1.1rem 1.25rem',
                                                    border: '2px solid #e2e8f0', borderRadius: '18px',
                                                    fontSize: '1.25rem', fontWeight: 800, color: '#1e293b',
                                                    transition: 'all 0.2s', outline: 'none', background: '#f8fafc'
                                                }}
                                                onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                                                onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                                placeholder={field.placeholder || "0"}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* CONDITIONAL OBSERVATIONS (e.g. for Pedidos Facturados) */}
                        {!isMetaMode && kpi.id === 'pedidos-facturados' && (
                            <div style={{ 
                                marginBottom: '2.5rem', padding: '1.5rem', background: '#fef2f2', 
                                borderRadius: '20px', border: '1px solid #fee2e2',
                                animation: 'fadeIn 0.4s ease-out'
                            }}>
                                <label style={{ 
                                    display: 'flex', alignItems: 'center', gap: '0.75rem', 
                                    fontSize: '0.85rem', fontWeight: 800, color: '#991b1b', marginBottom: '1rem',
                                    textTransform: 'uppercase'
                                }}>
                                    <AlertTriangle size={17} />
                                    Observaciones de Inventario
                                </label>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer', userSelect: 'none' }}>
                                        <div style={{ 
                                            position: 'relative', width: '22px', height: '22px', 
                                            background: formData.faltanteInventario ? '#ef4444' : 'white',
                                            border: `2px solid ${formData.faltanteInventario ? '#ef4444' : '#d1d5db'}`,
                                            borderRadius: '6px', transition: 'all 0.2s',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <input 
                                                type="checkbox"
                                                checked={formData.faltanteInventario || false}
                                                onChange={(e) => handleChange('faltanteInventario', e.target.checked)}
                                                style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                                            />
                                            {formData.faltanteInventario && <CheckCircle2 size={14} color="white" />}
                                        </div>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
                                            Reportar Faltante por Inventario
                                        </span>
                                    </label>

                                    {formData.faltanteInventario && (
                                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                                            <textarea 
                                                value={formData.detalleFaltante || ''}
                                                onChange={(e) => handleChange('detalleFaltante', e.target.value)}
                                                placeholder="Indica qué productos o referencias no se pudieron facturar por falta de stock..."
                                                style={{ 
                                                    width: '100%', padding: '1rem', borderRadius: '14px', border: '2px solid #fee2e2',
                                                    fontSize: '0.85rem', fontWeight: 500, minHeight: '90px', outline: 'none',
                                                    background: 'white', color: '#1e293b', fontFamily: 'inherit',
                                                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* PENDING BRANDS INFO */}
                        {!isMetaMode && hasCommercialBrands && (
                            <div style={{
                                marginBottom: '2.5rem',
                                padding: '1rem 1.5rem',
                                background: '#fff7ed',
                                borderRadius: '16px',
                                border: '1px solid #fed7aa',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ea580c', fontWeight: 800, fontSize: '0.8rem' }}>
                                    <AlertTriangle size={16} />
                                    MARCAS PENDIENTES:
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {commercialBrands.filter(isBrandPending).length > 0 ? (
                                        commercialBrands.filter(isBrandPending).map(b => (
                                            <span key={b} style={{
                                                background: 'white',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                color: '#9a3412',
                                                border: '1px solid #ffedd5'
                                            }}>
                                                {b}
                                            </span>
                                        ))
                                    ) : (
                                        <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>¡Todas las marcas cargadas!</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* LIVE RESULT CARD - WOW FACTOR */}
                        {!isMetaMode && liveResult !== null && (
                            <div className="premium-shadow" style={{
                                marginBottom: '2.5rem', padding: '2rem',
                                background: isMeetingMeta ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                                borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden'
                            }}>
                                <div style={{ position: 'relative', zIndex: 2 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 800, opacity: 0.9, letterSpacing: '0.05em' }}>CÁLCULO AUTOMÁTICO</div>
                                            <div style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, display: 'flex', alignItems: 'baseline' }}>
                                                {(() => {
                                                    if (kpi.id === 'rotacion-cxc' || kpi.id === 'rotacion-cxp') {
                                                        const rotationVal = liveResult;
                                                        const daysResult = rotationVal === 0 ? 0 : 360 / rotationVal;
                                                        return (
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                                                                    {formatNumber(rotationVal, 2)}
                                                                    <span style={{ fontSize: '1.5rem', opacity: 0.8, marginLeft: '8px' }}>veces</span>
                                                                </div>
                                                                <div style={{ fontSize: '1.25rem', opacity: 0.7, fontWeight: 700, marginTop: '5px' }}>
                                                                    ({formatNumber(daysResult, 0)} días)
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <>
                                                            {kpi.unit === '$' && <span style={{ fontSize: '1.5rem', opacity: 0.8, marginRight: '4px' }}>$</span>}
                                                            {kpi.unit === '$' ? formatNumber(liveResult, 0) : (kpi.unit === '%' ? formatNumber(liveResult, 2) : formatNumber(liveResult, 0))}
                                                            {kpi.unit !== '$' && <span style={{ fontSize: '1.5rem', opacity: 0.8, marginLeft: '8px' }}>{kpi.unit}</span>}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                        <div style={{
                                            background: 'rgba(255,255,255,0.2)', padding: '0.75rem 1.25rem',
                                            borderRadius: '16px', backdropFilter: 'blur(4px)', textAlign: 'right'
                                        }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.8 }}>ESTADO ACTUAL</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 900, fontSize: '1rem' }}>
                                                {isMeetingMeta ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                                                {isMeetingMeta ? 'DENTRO DE META' : 'FUERA DE META'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        display: 'flex', gap: '1rem', marginTop: '1.5rem',
                                        paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)',
                                        fontSize: '0.85rem', fontWeight: 600
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <span style={{ opacity: 0.8 }}>Fórmula Aplicada:</span>
                                            <div style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.15)', padding: '0.4rem 0.75rem', borderRadius: '8px', marginTop: '0.4rem', fontSize: '0.75rem' }}>
                                                {kpi.formula}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Calculator size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, transform: 'rotate(-10deg)' }} />
                            </div>
                        )}

                        {/* ACTIONS */}
                        <div style={{ display: 'flex', gap: '1.25rem' }}>
                            <button type="button" onClick={onCancel} style={{
                                flex: 1, padding: '1.25rem', borderRadius: '18px', border: '2px solid #e2e8f0',
                                background: 'white', color: '#64748b', fontWeight: 800, cursor: 'pointer',
                                transition: 'all 0.2s'
                            }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}>
                                CANCELAR
                            </button>
                            <button type="submit" style={{
                                flex: 2, padding: '1.25rem', borderRadius: '18px', border: 'none',
                                background: isMetaMode ? 'var(--brand)' : 'var(--bg-sidebar)', color: 'white', fontWeight: 900, cursor: 'pointer',
                                boxShadow: '0 15px 30px -10px rgba(15,23,42,0.4)', fontSize: '1.1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }} onMouseOver={e => {
                                e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 20px 40px -12px rgba(15,23,42,0.5)';
                            }} onMouseOut={e => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 15px 30px -10px rgba(15,23,42,0.4)';
                            }}>
                                <Save size={22} /> {isMetaMode ? 'ACTUALIZAR META' : 'GUARDAR INDICADOR'}
                            </button>
                        </div>
                    </form>

                    <div style={{
                        marginTop: '2rem', padding: '1.25rem', background: '#f8fafc',
                        borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center'
                    }}>
                        <Info size={20} color="var(--brand)" />
                        <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                            <strong>Instrucción:</strong> {isMetaMode
                                ? `Como Gerente, puedes redefinir la meta para ${formData.brand || 'este indicador'}. Este cambio se aplicará a todos los tableros.`
                                : `Ingresa los valores solicitados para la marca ${formData.brand || 'General'}. El sistema calculará el resultado automáticamente.`}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KPIDataForm;
