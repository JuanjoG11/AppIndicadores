import React, { useState } from 'react';

const KPIDataForm = ({ kpi, onSave, onCancel }) => {
    const [formData, setFormData] = useState({});

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
            ],
            'segundos-unidad-separada': [
                { name: 'unidadesSeparadas', label: 'Unidades Separadas', type: 'number' },
                { name: 'segundosUtilizados', label: 'Segundos Utilizados', type: 'number' }
            ],
            'pesos-separados-hombre': [
                { name: 'valorVenta', label: 'Valor Venta ($)', type: 'number' },
                { name: 'auxiliaresSeparacion', label: 'Auxiliares de Separación', type: 'number' }
            ],
            'pedidos-separar-total': [
                { name: 'pedidosFacturados', label: 'Pedidos Facturados', type: 'number' },
                { name: 'pedidosSeparados', label: 'Pedidos Separados', type: 'number' }
            ],
            'notas-errores-venta': [
                { name: 'notasDevolucion', label: 'Notas por Devolución ($)', type: 'number' },
                { name: 'valorVenta', label: 'Valor de la Venta ($)', type: 'number' }
            ],
            'planillas-separadas': [
                { name: 'planillasGeneradas', label: 'Planillas Generadas', type: 'number' },
                { name: 'planillasSeparadas', label: 'Planillas Separadas', type: 'number' }
            ],
            'nomina-venta-picking': [
                { name: 'valorNomina', label: 'Valor Nómina ($)', type: 'number' },
                { name: 'ventaTotal', label: 'Venta Total ($)', type: 'number' }
            ],
            'horas-extras-venta-picking': [
                { name: 'horasExtras', label: 'Horas Extras ($)', type: 'number' },
                { name: 'ventaTotal', label: 'Venta Total ($)', type: 'number' }
            ],
            'embalajes-perdidos': [
                { name: 'canastillasRecibidas', label: 'Canastillas Recibidas', type: 'number' },
                { name: 'canastillasGestionadas', label: 'Canastillas Gestionadas', type: 'number' }
            ],
            'nomina-compra-deposito': [
                { name: 'nominaDeposito', label: 'Nómina Depósito ($)', type: 'number' },
                { name: 'ventaTotal', label: 'Venta Total ($)', type: 'number' }
            ],
            'horas-extras-venta-deposito': [
                { name: 'horasExtras', label: 'Horas Extras ($)', type: 'number' },
                { name: 'ventaTotal', label: 'Venta Total ($)', type: 'number' }
            ],
            'averias-venta': [
                { name: 'totalAverias', label: 'Total Averías ($)', type: 'number' },
                { name: 'ventaTotal', label: 'Venta Total ($)', type: 'number' }
            ]
        };

        return fieldMappings[kpi.id] || [];
    };

    const fields = getFormulaFields();

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(kpi.id, formData);
    };

    const handleChange = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: parseFloat(value) || 0
        }));
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
        }}>
            <div className="card" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        Registrar Datos: {kpi.name}
                    </h2>
                    <small style={{ color: 'var(--text-muted)' }}>
                        {kpi.objetivo}
                    </small>
                </div>

                {kpi.formula && (
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-soft)', borderRadius: 'var(--radius-sm)' }}>
                        <small style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Fórmula:</small>
                        <small style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{kpi.formula}</small>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {fields.length > 0 ? (
                        <>
                            {fields.map(field => (
                                <div key={field.name} style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                        {field.label}
                                    </label>
                                    <input
                                        type={field.type}
                                        step="any"
                                        required
                                        onChange={(e) => handleChange(field.name, e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid var(--border-soft)',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: '0.9rem',
                                            fontFamily: 'inherit'
                                        }}
                                        placeholder={`Ingrese ${field.label.toLowerCase()}`}
                                    />
                                </div>
                            ))}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    style={{ flex: 1 }}
                                    onClick={onCancel}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                >
                                    💾 Guardar Datos
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                Este indicador aún no tiene un formulario de captura configurado.
                            </p>
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={onCancel}
                            >
                                Cerrar
                            </button>
                        </div>
                    )}
                </form>

                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-soft)', borderRadius: 'var(--radius-sm)' }}>
                    <small style={{ color: 'var(--text-muted)' }}>
                        <strong>Responsable:</strong> {kpi.responsable} |
                        <strong> Frecuencia:</strong> {kpi.frecuencia} |
                        {kpi.fuente && <><strong> Fuente:</strong> {kpi.fuente}</>}
                    </small>
                </div>
            </div>
        </div>
    );
};

export default KPIDataForm;
