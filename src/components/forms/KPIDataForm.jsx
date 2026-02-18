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
    Activity
} from 'lucide-react';

const KPIDataForm = ({ kpi, currentUser, onSave, onCancel }) => {
    // Determinar si el KPI tiene metas por marca o empresa
    const hasMultipleMetas = typeof kpi.meta === 'object';

    // Filtrar las marcas/empresas disponibles según la empresa del usuario
    let brands = hasMultipleMetas ? Object.keys(kpi.meta) : [];

    // Si la empresa del usuario es TYM o TAT, y estas están en las opciones, filtrar solo la del usuario
    if (currentUser?.company && brands.includes(currentUser.company)) {
        brands = [currentUser.company];
    } else if (kpi.brands && currentUser?.company) {
        // Si el KPI tiene una lista de marcas permitidas explícita y estamos filtrando por empresa
        // (Esto es por si acaso hay una lógica cruzada, pero por ahora simplificamos)
    }

    // Inicializar con datos previos si existen
    const [formData, setFormData] = useState({
        brand: kpi.additionalData?.brand || (brands.length > 0 ? brands[0] : null),
        company: currentUser?.company || kpi.additionalData?.company || null,
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
            ]
        };

        return fieldMappings[kpi.id] || [{ name: 'currentValue', label: 'Valor Real', type: 'number' }];
    };

    const calculateLiveResult = () => {
        const id = kpi.id;
        const d = formData;
        let res = null;

        try {
            if (id === 'pedidos-devueltos') res = (d.pedidosDevueltos / d.pedidosFacturados) * 100;
            else if (id === 'promedio-pedidos-auxiliar') res = d.numeroPedidos / d.auxiliares;
            else if (id === 'promedio-pedidos-carro') res = d.numeroPedidos / d.vehiculos;
            else if (id === 'gasto-nomina-venta') res = (d.nominaLogistica / d.ventaTotal) * 100;
            else if (id === 'gasto-fletes-venta') res = (d.valorFletes / d.ventaTotal) * 100;
            else if (id === 'horas-extras-auxiliares') res = (d.totalHorasExtras / d.auxiliares) / 12;
            else if (id === 'primer-margen') res = ((d.ventas - d.costoVentas) / d.ventas) * 100;
            else if (id === 'devoluciones-mal-estado') res = (d.valorDevolucion / d.ventaTotal) * 100;
            else if (id === 'promedio-venta-vendedor') res = d.ventasTotales / d.numeroVendedores;
            else if (id === 'venta-credito-total') res = (d.ventaCredito / d.ventaTotal) * 100;
            else if (id === 'cartera-vencida-total') res = (d.carteraVencida / d.totalCartera) * 100;
            else if (id === 'cartera-no-vencida') res = (d.carteraNoVencida / d.carteraTotal) * 100;
            else if (id === 'cartera-11-30') res = (d.cartera1130 / d.carteraTotal) * 100;
            else if (id === 'valor-cartera-venta') res = (d.carteraTotal / d.ventaTotal) * 100;
            else if (id === 'notas-errores-venta') res = (d.notasDevolucion / d.valorVenta) * 100;
            else if (id === 'fiabilidad-inventarios') res = (d.valorCorrecto / d.valorVerificado) * 100;
            // Picking Specific
            else if (id === 'segundos-unidad-separada') res = d.segundosUtilizados / d.unidadesSeparadas;
            else if (id === 'pesos-separados-hombre') res = d.valorVenta / d.auxiliaresSeparacion;
            else if (id === 'pedidos-separar-total') res = (d.pedidosSeparados / d.pedidosFacturados) * 100;
            else if (id === 'planillas-separadas') res = (d.planillasSeparadas / d.planillasGeneradas) * 100;
            else if (id === 'nomina-venta-picking') res = (d.valorNomina / d.ventaTotal) * 100;
            else if (id === 'horas-extras-venta-picking') res = (d.horasExtras / d.ventaTotal) * 100;
            // Deposito Specific
            else if (id === 'embalajes-perdidos') res = (d.canastillasRecibidas || 0) - (d.canastillasGestionadas || 0);
            else if (id === 'nomina-compra-deposito') res = ((d.valorNomina || 0) / (d.ventaTotal || 1)) * 100;
            else if (id === 'horas-extras-venta-deposito') res = ((d.horasExtras || 0) / (d.ventaTotal || 1)) * 100;
            else if (id === 'averias-venta') res = ((d.totalAverias || 0) / (d.ventaTotal || 1)) * 100;
            // Talento Humano Specific
            else if (id === 'rotacion-personal') res = ((d.personalRetirado || 0) / (d.promedioEmpleados || 1)) * 100;
            else if (id === 'ausentismo') res = ((d.diasPerdidos || 0) / (d.diasLaborados || 1)) * 100;
            else if (id === 'calificacion-auditoria') res = ((d.actividadesEjecutadas || 0) / (d.actividadesProgramadas || 1)) * 100;
            else if (id === 'he-rn-nomina') res = ((d.valorHEDHEN || 0) / (d.totalNomina || 1)) * 100;
            else if (id === 'gasto-nomina-venta-rrhh') res = ((d.valorNomina || 0) / (d.ventaTotal || 1)) * 100;
            else if (id === 'actividades-cultura') res = ((d.actividadesEjecutadas || 0) / (d.actividadesProgramadas || 1)) * 100;
            else if (id === 'tiempo-contratacion') res = d.diasVacante;
            // Caja Specific
            else if (id === 'arqueos-realizados') res = (d.arqueosRealizados / d.arqueosProgramados) * 100;
            else if (id === 'planillas-cerradas') res = (d.planillasCerradas / d.planillasGeneradas) * 100;
            else if (id === 'vales-descuadres') res = (d.valorVales / d.totalCuadreCaja) * 100;
            // Cartera Specific (Fed by Contabilidad)
            else if (id === 'cartera-no-vencida') res = (d.totalCarteraVencida / d.totalVenta) * 100;
            else if (id === 'cartera-11-30') res = (d.totalCartera1130 / d.totalCartera) * 100;
            else if (id === 'cartera-31-45') res = (d.totalCartera3145 / d.totalCartera) * 100;
            else if (id === 'cartera-mayor-45') res = (d.totalMayor45 / d.totalCartera) * 100;
            else if (id === 'recircularizaciones') res = d.efectuadas;
            else if (id === 'valor-cartera-venta') res = (d.ventaCredito / d.totalVenta) * 100;
            else if (d.currentValue !== undefined) res = d.currentValue;
        } catch (e) { return null; }

        if (res === null || isNaN(res) || !isFinite(res)) return null;
        return parseFloat(res.toFixed(2));
    };

    const fields = getFormulaFields();
    const liveResult = calculateLiveResult();
    const currentMeta = hasMultipleMetas ? kpi.meta[formData.brand] : kpi.meta;
    const isInverse = kpi.id.includes('devueltos') ||
        kpi.id.includes('gasto') ||
        kpi.id.includes('horas-extras') ||
        kpi.id.includes('mal-estado') ||
        kpi.id.includes('vencida') ||
        kpi.id === 'segundos-unidad-separada' ||
        kpi.id === 'notas-errores-venta' ||
        kpi.id.includes('nomina') ||
        kpi.id === 'rotacion-personal' ||
        kpi.id === 'ausentismo' ||
        kpi.id === 'he-rn-nomina' ||
        kpi.id === 'vales-descuadres' ||
        kpi.id === 'tiempo-contratacion';
    const isMeetingMeta = liveResult !== null && (isInverse ? liveResult <= currentMeta : liveResult >= currentMeta);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(kpi.id, formData);
    };

    const handleChange = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: fieldName === 'brand' ? value : (parseFloat(value) || 0)
        }));
    };

    return (
        <div style={{
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
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.2rem' }}>{kpi.name}</h2>
                            <div style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                {kpi.area.replace(/-/g, ' ')} • {typeof currentMeta === 'number' ? `Meta: ${currentMeta}${kpi.unit}` : currentMeta}
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
                        {/* BRAND SELECTION - PREMIUM CHIPS */}
                        {hasMultipleMetas && (
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 800, marginBottom: '1rem', color: '#1e293b' }}>
                                    <Box size={16} color="var(--brand)" /> MARCA / PROVEEDOR
                                </label>
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    {brands.map(brand => (
                                        <button
                                            key={brand}
                                            type="button"
                                            onClick={() => handleChange('brand', brand)}
                                            style={{
                                                padding: '0.75rem 1.25rem',
                                                borderRadius: '16px',
                                                fontSize: '0.85rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                border: formData.brand === brand ? '2px solid var(--brand)' : '1px solid #e2e8f0',
                                                background: formData.brand === brand ? 'var(--brand-bg)' : 'white',
                                                color: formData.brand === brand ? 'var(--brand)' : '#64748b',
                                                boxShadow: formData.brand === brand ? '0 10px 15px -3px rgba(37,99,235,0.15)' : 'none',
                                                transform: formData.brand === brand ? 'scale(1.05)' : 'scale(1)'
                                            }}
                                        >
                                            {brand}
                                            <div style={{ fontSize: '0.65rem', opacity: 0.7, fontWeight: 600, marginTop: '2px' }}>
                                                Meta: {kpi.meta[brand]}{kpi.unit}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* INPUT FIELDS - CLEAN & BOLD */}
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

                        {/* LIVE RESULT CARD - WOW FACTOR */}
                        {liveResult !== null && (
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
                                                {liveResult}<span style={{ fontSize: '1.5rem', opacity: 0.8, marginLeft: '4px' }}>{kpi.unit}</span>
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
                                {/* Decorative background element */}
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
                                background: 'var(--bg-sidebar)', color: 'white', fontWeight: 900, cursor: 'pointer',
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
                                <Save size={22} /> GUARDAR INDICADOR
                            </button>
                        </div>
                    </form>

                    <div style={{
                        marginTop: '2rem', padding: '1.25rem', background: '#f8fafc',
                        borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center'
                    }}>
                        <Info size={20} color="var(--brand)" />
                        <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                            <strong>Instrucción:</strong> Ingresa los valores solicitados para la marca <strong>{formData.brand || 'General'}</strong>. El sistema calculará automáticamente el resultado y lo enviará al tablero directivo.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KPIDataForm;
