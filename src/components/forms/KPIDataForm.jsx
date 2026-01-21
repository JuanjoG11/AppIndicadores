import React, { useState } from 'react';

const KPIDataForm = ({ kpi, onSave, onCancel }) => {
    // Inicializar con datos previos si existen
    const [formData, setFormData] = useState({
        brand: kpi.additionalData?.brand || (typeof kpi.meta === 'object' ? Object.keys(kpi.meta)[0] : null),
        ...kpi.additionalData
    });

    // Determinar si el KPI tiene metas por marca
    const hasMultipleMetas = typeof kpi.meta === 'object';
    const brands = hasMultipleMetas ? Object.keys(kpi.meta) : [];

    // Determinar qué campos necesita el formulario basado en la fórmula
    const getFormulaFields = () => {
        if (!kpi.formula) return [];

        // Mapeo de KPIs a sus campos de entrada
        const fieldMappings = {
            'pedidos-devueltos': [
                { name: 'pedidosFacturados', label: 'Pedidos Facturados', type: 'number' },
                { name: 'pedidosDevueltos', label: 'Pedidos Devueltos', type: 'number' }
            ],
            'promedio-pedidos-auxiliar': [
                { name: 'numeroPedidos', label: 'Número de Pedidos', type: 'number' },
                { name: 'auxiliares', label: 'Número de Auxiliares', type: 'number' }
            ],
            'promedio-pedidos-carro': [
                { name: 'numeroPedidos', label: 'Número de Pedidos', type: 'number' },
                { name: 'vehiculos', label: 'Número de Vehículos', type: 'number' }
            ],
            'gasto-nomina-venta': [
                { name: 'nominaLogistica', label: 'Nómina Logística ($)', type: 'number' },
                { name: 'ventaTotal', label: 'Venta Total ($)', type: 'number' }
            ],
            'gasto-fletes-venta': [
                { name: 'valorFletes', label: 'Valor Fletes ($)', type: 'number' },
                { name: 'ventaTotal', label: 'Venta Total ($)', type: 'number' }
            ],
            'horas-extras-auxiliares': [
                { name: 'totalHorasExtras', label: 'Total Horas Extras', type: 'number' },
                { name: 'auxiliares', label: 'Número de Auxiliares', type: 'number' }
            ]
        };

        return fieldMappings[kpi.id] || [];
    };

    const calculateLiveResult = () => {
        const id = kpi.id;
        let result = 0;

        if (id === 'pedidos-devueltos' && formData.pedidosFacturados) {
            result = (formData.pedidosDevueltos / formData.pedidosFacturados) * 100;
        } else if (id === 'promedio-pedidos-auxiliar' && formData.auxiliares) {
            result = formData.numeroPedidos / formData.auxiliares;
        } else if (id === 'promedio-pedidos-carro' && formData.vehiculos) {
            result = formData.numeroPedidos / formData.vehiculos;
        } else if (id === 'gasto-nomina-venta' && formData.ventaTotal) {
            result = (formData.nominaLogistica / formData.ventaTotal) * 100;
        } else if (id === 'gasto-fletes-venta' && formData.ventaTotal) {
            result = (formData.valorFletes / formData.ventaTotal) * 100;
        } else if (id === 'horas-extras-auxiliares' && formData.auxiliares) {
            result = (formData.totalHorasExtras / formData.auxiliares) / 12;
        } else {
            return null;
        }

        return parseFloat(result.toFixed(2));
    };

    const fields = getFormulaFields();
    const liveResult = calculateLiveResult();
    const currentMeta = hasMultipleMetas ? kpi.meta[formData.brand] : kpi.meta;

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
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1.5rem', backdropFilter: 'blur(4px)'
        }}>
            <div className="card" style={{ maxWidth: '550px', width: '100%', maxHeight: '95vh', overflow: 'auto', border: '1px solid var(--brand)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-soft)', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand)' }}>
                            {kpi.name}
                        </h2>
                        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-muted)' }}>&times;</button>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        {kpi.objetivo}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Brand Selection for multi-meta KPIs */}
                    {hasMultipleMetas && (
                        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--brand)' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--brand)' }}>
                                SELECCIONAR MARCA / PROVEEDOR:
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {brands.map(brand => (
                                    <button
                                        key={brand}
                                        type="button"
                                        onClick={() => handleChange('brand', brand)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            border: formData.brand === brand ? '2px solid var(--brand)' : '1px solid var(--border-soft)',
                                            background: formData.brand === brand ? 'var(--brand-soft)' : 'white',
                                            color: formData.brand === brand ? 'var(--brand)' : 'var(--text-muted)'
                                        }}
                                    >
                                        {brand} (Meta: {kpi.meta[brand]}{kpi.unit})
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dynamic Fields */}
                    {fields.length > 0 ? (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {fields.map(field => (
                                    <div key={field.name} style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                                            {field.label}
                                        </label>
                                        <input
                                            type={field.type}
                                            step="any"
                                            required
                                            value={formData[field.name] || ''}
                                            onChange={(e) => handleChange(field.name, e.target.value)}
                                            style={{
                                                width: '100%', padding: '0.8rem',
                                                border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-sm)',
                                                fontSize: '1rem', fontWeight: 600
                                            }}
                                            placeholder="0"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Live Formula Result */}
                            {liveResult !== null && (
                                <div style={{
                                    marginTop: '1rem', marginBottom: '2rem', padding: '1.5rem',
                                    background: 'linear-gradient(135deg, var(--brand) 0%, #3b82f6 100%)',
                                    borderRadius: 'var(--radius-md)', color: 'white', textAlign: 'center',
                                    boxShadow: '0 10px 20px rgba(59, 130, 246, 0.2)'
                                }}>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '0.5rem', fontWeight: 600 }}>CÁLCULO EN VIVO (RESULTADO ACTUAL)</div>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>
                                        {liveResult}{kpi.unit}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.8 }}>
                                        Meta: {currentMeta}{kpi.unit} |
                                        Estado: <span style={{
                                            padding: '2px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', fontWeight: 700
                                        }}>
                                            {((kpi.id.includes('devueltos') || kpi.id.includes('gasto') || kpi.id.includes('horas-extras')) ? liveResult <= currentMeta : liveResult >= currentMeta) ? '✅ CUMPLE' : '⚠️ FUERA DE META'}
                                        </span>
                                    </div>
                                    <div style={{ marginTop: '1rem', fontSize: '0.75rem', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                                        Fórmula: {kpi.formula}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1.5, fontWeight: 700 }}>
                                    💾 GUARDAR INDICADOR
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <p style={{ color: 'var(--text-muted)' }}>Configurando formulario...</p>
                            <button type="button" className="btn btn-ghost" onClick={onCancel}>Cerrar</button>
                        </div>
                    )}
                </form>

                <div style={{ marginTop: '1.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-soft)', paddingTop: '1rem' }}>
                    <strong>RESPONSABLE:</strong> {kpi.responsable} | <strong>FUENTE:</strong> {kpi.fuente}
                </div>
            </div>
        </div>
    );
};

export default KPIDataForm;
