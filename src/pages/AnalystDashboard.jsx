import React, { useState } from 'react';
import {
    ChevronRight,
    Info,
    AlertCircle,
    CheckCircle2,
    LayoutGrid,
    TrendingUp,
    Target,
    Activity,
    Box,
    Truck,
    DollarSign,
    Users
} from 'lucide-react';
import KPIDataForm from '../components/forms/KPIDataForm';

const AnalystDashboard = ({ kpiData, currentUser, onUpdateKPI }) => {
    const [editingKPI, setEditingKPI] = useState(null);

    // Filtrar indicadores bajo la responsabilidad del usuario actual y normalizar datos según empresa
    const myKPIs = kpiData
        .filter(kpi => kpi.responsable === currentUser.cargo)
        .map(kpi => {
            // Buscar datos específicos de la empresa del usuario
            const companyKeys = kpi.brandValues ? Object.keys(kpi.brandValues).filter(key => key.startsWith(`${currentUser.company}-`)) : [];

            if (companyKeys.length > 0) {
                // Priorizar el global de la empresa o el primero disponible
                const globalKey = `${currentUser.company}-GLOBAL`;
                const mainKey = companyKeys.includes(globalKey) ? globalKey : companyKeys[0];

                return {
                    ...kpi,
                    ...kpi.brandValues[mainKey]
                };
            }

            // Si no hay datos, ajustar la meta para mostrar la de la empresa
            let targetMeta = kpi.meta;
            if (typeof kpi.meta === 'object') {
                targetMeta = kpi.meta[currentUser.company] || Object.values(kpi.meta)[0] || 0;
            }

            return {
                ...kpi,
                targetMeta,
                hasData: false
            };
        });

    const handleSaveKPI = (kpiId, data) => {
        if (onUpdateKPI) {
            onUpdateKPI(kpiId, data);
        }
        setEditingKPI(null);
    };

    const areaIcons = {
        'logistica-entrega': <Truck size={24} />,
        'logistica-picking': <Box size={24} />,
        'comercial': <TrendingUp size={24} />,
        'cartera': <DollarSign size={24} />,
        'administrativo': <Activity size={24} />,
        'talento-humano': <Users size={24} />
    };

    return (
        <div style={{ padding: '3rem 2rem', maxWidth: '1100px', margin: '0 auto', minHeight: '100vh', background: 'var(--bg-app)' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '3.5rem', textAlign: 'center' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'white',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '20px',
                    boxShadow: 'var(--shadow-sm)',
                    marginBottom: '1.5rem',
                    border: '1px solid var(--border-soft)'
                }}>
                    <div style={{ width: '10px', height: '10px', background: 'var(--brand)', borderRadius: '50%', animation: 'pulse-danger 2s infinite' }}></div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--brand)', letterSpacing: '0.05em' }}>SISTEMA DE ALIMENTACIÓN 2026</span>
                </div>
                <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                    Mis Indicadores
                </h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    Bienvenido, <strong style={{ color: '#0f172a' }}>{currentUser.cargo}</strong>. Aquí puedes gestionar y actualizar los indicadores clave bajo tu responsabilidad.
                </p>
            </div>

            {myKPIs.length === 0 ? (
                <div className="card glass animate-slide-up" style={{ textAlign: 'center', padding: '5rem 2rem', border: '2px dashed #cbd5e1' }}>
                    <div style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                        <LayoutGrid size={64} strokeWidth={1} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#334155', marginBottom: '0.75rem' }}>Sin asignaciones activas</h3>
                    <p style={{ color: '#64748b' }}>No tienes indicadores vinculados a tu cargo en la configuración actual.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                    {myKPIs.map((kpi, index) => (
                        <div key={kpi.id} className="card premium-shadow animate-slide-up" style={{
                            padding: '2rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderRadius: '24px',
                            background: 'white',
                            border: '1px solid #f1f5f9',
                            animationDelay: `${index * 0.1}s`,
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Decorative Area Icon in Background */}
                            <div style={{ position: 'absolute', left: '-10px', top: '-10px', opacity: 0.03, transform: 'scale(4)' }}>
                                {areaIcons[kpi.area] || <Activity size={24} />}
                            </div>

                            <div style={{ flex: 1, position: 'relative', zIndex: 2 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div style={{
                                        padding: '0.4rem 0.8rem',
                                        background: 'var(--brand-bg)',
                                        color: 'var(--brand)',
                                        borderRadius: '10px',
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        {kpi.area.replace(/-/g, ' ')}
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        color: kpi.hasData ? '#059669' : '#f59e0b',
                                        background: kpi.hasData ? '#ecfdf5' : '#fffbeb',
                                        padding: '0.3rem 0.75rem',
                                        borderRadius: '20px'
                                    }}>
                                        {kpi.hasData ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                        {kpi.hasData ? 'ACTUALIZADO' : 'PENDIENTE'}
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e293b', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>
                                    {kpi.name}
                                </h3>

                                <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <div style={{ width: '32px', height: '32px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                            <Target size={18} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Meta establecida</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155' }}>
                                                {typeof kpi.meta === 'object' ? 'Por Marca' : `${kpi.meta}${kpi.unit}`}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <div style={{ width: '32px', height: '32px', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                            <Activity size={18} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Último registro</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#334155' }}>
                                                {kpi.currentValue}{kpi.unit}
                                            </div>
                                        </div>
                                    </div>

                                    {typeof kpi.meta === 'object' && kpi.additionalData?.brand && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <div style={{ width: '32px', height: '32px', background: '#f0f9ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                                                <Box size={18} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Marca Reportada</div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand)' }}>
                                                    {kpi.additionalData.brand}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                className="premium-shadow"
                                onClick={() => setEditingKPI(kpi)}
                                style={{
                                    background: 'var(--bg-sidebar)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '1.25rem 2rem',
                                    borderRadius: '18px',
                                    fontSize: '1rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    position: 'relative',
                                    zIndex: 2
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                                    e.currentTarget.style.background = '#1e293b';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.background = 'var(--bg-sidebar)';
                                }}
                            >
                                {kpi.hasData ? 'Actualizar' : 'Cargar Datos'}
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {editingKPI && (
                <KPIDataForm
                    kpi={editingKPI}
                    currentUser={currentUser}
                    onSave={(id, data) => handleSaveKPI(id, data)}
                    onCancel={() => setEditingKPI(null)}
                />
            )}

            <div style={{
                marginTop: '4rem',
                padding: '2rem',
                background: 'white',
                borderRadius: '24px',
                border: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                color: '#64748b'
            }}>
                <div style={{
                    width: '48px', height: '48px', background: '#f8fafc',
                    borderRadius: '12px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'var(--brand)'
                }}>
                    <Info size={24} />
                </div>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                    <strong>Tip Profesional:</strong> Asegúrate de verificar los datos físicos antes de guardarlos. El sistema realiza los cálculos de cumplimiento contra la meta automáticamente apenas ingresas los valores.
                </div>
            </div>
        </div>
    );
};

export default AnalystDashboard;
