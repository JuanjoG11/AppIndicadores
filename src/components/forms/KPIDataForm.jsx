import React, { useState, useEffect } from 'react';
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
    Shield as ShieldIcon
} from 'lucide-react';
import { calculateKPIValue, isInverseKPI } from '../../utils/kpiCalculations';
import { BRAND_TO_ENTITY, getBrandEntity } from '../../utils/kpiHelpers';

const KPIDataForm = ({ kpi, currentUser, onSave, onCancel, mode = 'data' }) => {
    const isMetaMode = mode === 'meta';
    const hasMultipleMetas = kpi.meta && typeof kpi.meta === 'object';
    const userEntity = currentUser?.company || 'TYM';

    // 1. Filtrar marcas comerciales
    let commercialBrands = [];
    if (hasMultipleMetas) {
        const allBrands = Object.keys(kpi.meta).filter(b => b !== 'Global' && b !== 'TYM' && b !== 'TAT');

        if (isMetaMode) {
            commercialBrands = allBrands;
        } else {
            // Analistas solo ven marcas comerciales comprobadas de su entidad
            commercialBrands = allBrands.filter(b => BRAND_TO_ENTITY[b] === userEntity);
        }
    }
    const hasCommercialBrands = commercialBrands.length > 0;

    // 2. Determinar cuáles faltan por cargar
    const isBrandPending = (brandName) => {
        const dataKey = `${userEntity}-${brandName}`;
        const brandData = kpi.brandValues?.[dataKey];
        return !brandData || brandData.hasData === false;
    };

    // 3. Seleccionar por defecto
    // Si no hay marcas comerciales y no es gerente, la marca asignada automáticamente es la propia entidad.
    const defaultBrand = (!isMetaMode && !hasCommercialBrands)
        ? userEntity
        : (commercialBrands.find(isBrandPending) || commercialBrands[0] || userEntity);

    // Inicializar con datos previos si existen
    const [formData, setFormData] = useState({
        brand: kpi.additionalData?.brand || defaultBrand,
        company: userEntity, // Auto-assign company
        ...kpi.additionalData
    });

    // Mapeo de iconos por área para el diseño
    const areaIcons = {
        'logistica-entrega': <Truck size={18} />,
        'logistica-picking': <Box size={18} />,
        'comercial': <TrendingUp size={18} />,
        'cartera': <DollarSign size={18} />,
        'administrativo': <Activity size={18} />,
        'talento-humano': <Users size={18} />
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
            'gasto-fletes-comercial': [
                { name: 'gastosFletes', label: 'Gastos de Fletes ($)', type: 'number' },
                { name: 'ventaTotal', label: 'Total Venta ($)', type: 'number' }
            ],
            'dias-inventario-comercial': [
                { name: 'diasInventario', label: 'Días de Inventario', type: 'number' },
                { name: 'metaInventario', label: 'Meta (Días)', type: 'number' }
            ],
            'cartera-no-vencida': [
                { name: 'carteraNoVencida', label: 'Cartera No Vencida ($)', type: 'number', placeholder: 'Eje: 90000000' },
                { name: 'carteraTotal', label: 'Cartera Total ($)', type: 'number', placeholder: 'Eje: 100000000' }
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
                { name: 'valorCorrecto', label: 'Valor Correcto ($)', type: 'number' },
                { name: 'valorVerificado', label: 'Valor Verificado ($)', type: 'number' }
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
            'diferencia-inventarios': [
                { name: 'diferenciaFisica', label: 'Valor Diferencia Física ($)', type: 'number' },
                { name: 'valorInventario', label: 'Valor del Inventario ($)', type: 'number' }
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
                { name: 'arqueosRealizados', label: 'Arqueos Realizados', type: 'number', placeholder: 'Eje: 8' }
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
            'cartera-11-30': [
                { name: 'totalCartera', label: 'Total Cartera ($)', type: 'number', placeholder: 'Eje: 140000000' },
                { name: 'totalCartera1130', label: 'Total Cartera 11-30 días ($)', type: 'number', placeholder: 'Eje: 87000000' }
            ],
            'cartera-31-45': [
                { name: 'totalCartera', label: 'Total Cartera ($)', type: 'number', placeholder: 'Eje: 140000000' },
                { name: 'totalCartera3145', label: 'Total Cartera 31-45 días ($)', type: 'number', placeholder: 'Eje: 10000000' }
            ],
            'cartera-mayor-45': [
                { name: 'totalCartera', label: 'Total Cartera ($)', type: 'number', placeholder: 'Eje: 140000000' },
                { name: 'totalMayor45', label: 'Total Mayor a 45 días ($)', type: 'number', placeholder: 'Eje: 5000000' }
            ],
            'recircularizaciones': [
                { name: 'programadas', label: 'Programadas', type: 'number', placeholder: 'Eje: 2' },
                { name: 'efectuadas', label: 'Efectuadas', type: 'number', placeholder: 'Eje: 2' }
            ],
            'valor-cartera-venta': [
                { name: 'totalVenta', label: 'Total Venta ($)', type: 'number', placeholder: 'Eje: 3600000000' },
                { name: 'ventaCredito', label: 'Venta Crédito ($)', type: 'number', placeholder: 'Eje: 350000000' }
            ],
            // Contabilidad Specific
            'dias-cierre': [
                { name: 'totalDiasCierre', label: 'Total Días al Cierre', type: 'number', placeholder: 'Eje: 12' },
                { name: 'diasReporte', label: 'Días para el Reporte', type: 'number', placeholder: 'Eje: 13' }
            ],
            'ajustes-posteriores': [
                { name: 'totalAjustes', label: 'Total Ajustes', type: 'number', placeholder: 'Eje: 1' },
                { name: 'ajustesPosteriores', label: 'Ajustes Posteriores', type: 'number', placeholder: 'Eje: 1' }
            ],
            'ajustes-revisoria': [
                { name: 'totalAjustes', label: 'Total Ajustes', type: 'number', placeholder: 'Eje: 1' },
                { name: 'ajustesRevisor', label: 'Ajustes Revisor Fiscal', type: 'number', placeholder: 'Eje: 1' }
            ],
            'rotacion-cxc': [
                { name: 'ventasCredito', label: 'Ventas a Crédito ($)', type: 'number', placeholder: 'Eje: 350000000' },
                { name: 'cuentasPorCobrar', label: 'Cuentas por Cobrar ($)', type: 'number', placeholder: 'Eje: 140000000' }
            ],
            'rotacion-cxp': [
                { name: 'comprasCredito', label: 'Compras a Crédito ($)', type: 'number', placeholder: 'Eje: 350000000' },
                { name: 'cuentasPorPagar', label: 'Cuentas por Pagar ($)', type: 'number', placeholder: 'Eje: 200000000' }
            ],
            'conciliaciones-bancarias': [
                { name: 'conciliacionesRequeridas', label: 'Conciliaciones Requeridas', type: 'number', placeholder: 'Eje: 2' },
                { name: 'conciliacionesRealizadas', label: 'Conciliaciones Realizadas', type: 'number', placeholder: 'Eje: 1' }
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
                { name: 'impuestosRecuperados', label: 'Impuestos Recuperados ($)', type: 'number', placeholder: 'Eje: 50000000' },
                { name: 'impuestosOptimizados', label: 'Impuestos Optimizados ($)', type: 'number', placeholder: 'Eje: 70000000' },
                { name: 'totalImpuestos', label: 'Total de Impuestos ($)', type: 'number', placeholder: 'Eje: 150000000' }
            ]
        };

        return fieldMappings[kpi.id] || [{ name: 'currentValue', label: 'Valor Real', type: 'number' }];
    };

    const calculateLiveResult = () => {
        return calculateKPIValue(kpi.id, formData);
    };

    const fields = getFormulaFields();
    const liveResult = calculateLiveResult();
    const currentMeta = hasMultipleMetas
        ? (kpi.meta[formData.brand] || kpi.meta[formData.brand?.toLowerCase()] || Object.values(kpi.meta)[0])
        : kpi.meta;
    const isInverse = isInverseKPI(kpi.id);
    const isMeetingMeta = liveResult !== null && (isInverse ? liveResult <= currentMeta : liveResult >= currentMeta);

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = isMetaMode
            ? { ...formData, type: 'META_UPDATE' }
            : formData;
        onSave(kpi.id, dataToSave);
    };

    const handleChange = (fieldName, value) => {
        setFormData(prev => {
            const newState = { ...prev, [fieldName]: fieldName === 'brand' ? value : (parseFloat(value) || 0) };

            // Auto-sync company if brand changes
            if (fieldName === 'brand') {
                if (value === 'TYM' || value === 'TAT') {
                    newState.company = value;
                } else if (BRAND_TO_ENTITY[value]) {
                    newState.company = BRAND_TO_ENTITY[value];
                }
            }

            return newState;
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
                                {kpi.area.replace(/-/g, ' ')} • {typeof currentMeta === 'number' ? `Actual: ${currentMeta} ${kpi.unit}` : currentMeta}
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
                    <form onSubmit={handleSubmit}>
                        {/* BRAND / ENTITY SELECTION - PREMIUM CHIPS */}
                        {(isMetaMode || (!isMetaMode && hasCommercialBrands)) && (
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 800, marginBottom: '1.25rem', color: '#1e293b' }}>
                                    <Box size={16} color="var(--brand)" />
                                    {isMetaMode ? 'SELECCIONAR NIVEL DE META' : 'MARCA / PROVEEDOR'}
                                </label>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {/* Nivel Empresa / Razón Social - SOLAMENTE PARA MODO META COMO GERENTE */}
                                    {isMetaMode && (
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                                                Nivel Empresa (Razón Social)
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                {['Global', 'TYM', 'TAT'].map(scope => {
                                                    const isActive = scope === 'Global' ? (!formData.brand || formData.brand === 'Global') : formData.brand === scope;
                                                    return (
                                                        <button
                                                            key={scope}
                                                            type="button"
                                                            onClick={() => {
                                                                handleChange('brand', scope);
                                                            }}
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
                                                {(isMetaMode ? ['ALPINA', 'ZENU', 'FLEISCHMANN', 'UNILEVER', 'FAMILIA'] : commercialBrands)
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
                            <div style={{ marginBottom: '2.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem', color: '#334155' }}>
                                    Nueva Meta para {formData.brand || 'Global'} ({kpi.unit})
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    required
                                    value={formData.newMeta || ''}
                                    onChange={(e) => handleChange('newMeta', e.target.value)}
                                    placeholder={`Meta actual: ${(kpi.meta && typeof kpi.meta === 'object'
                                        ? (kpi.meta[formData.brand || 'global'] || kpi.meta[formData.brand || 'Global'] || Object.values(kpi.meta)[0])
                                        : kpi.meta)
                                        }`}
                                    style={{
                                        width: '100%', padding: '1.1rem 1.25rem',
                                        border: '2px solid var(--brand)', borderRadius: '18px',
                                        fontSize: '1.5rem', fontWeight: 800, color: '#1e293b',
                                        background: 'white', outline: 'none'
                                    }}
                                />
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ShieldIcon size={14} />
                                    Meta actual: {currentMeta} {kpi.unit}
                                </p>
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
                                                type={field.type}
                                                step="any"
                                                required
                                                value={formData[field.name] || ''}
                                                onChange={(e) => handleChange(field.name, e.target.value)}
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
                                            <div style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1 }}>
                                                {liveResult}<span style={{ fontSize: '1.5rem', opacity: 0.8, marginLeft: '8px' }}>{kpi.unit}</span>
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
