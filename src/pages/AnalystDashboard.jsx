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
    Users,
    Shield
} from 'lucide-react';
import KPIDataForm from '../components/forms/KPIDataForm';
import { filterKPIsByEntity } from '../utils/kpiHelpers';

const AnalystDashboard = ({ kpiData, currentUser, onUpdateKPI }) => {
    const [editingKPI, setEditingKPI] = useState(null);

    // 1. Get filtered data for ONLY the current user's company
    const companyKPIsRaw = filterKPIsByEntity(kpiData, currentUser.company);

    // Filter helper: check user permissions for authorized areas
    const myAccessKPIs = companyKPIsRaw.filter(kpi =>
        currentUser.authorizedAreas?.includes('all') ||
        currentUser.authorizedAreas?.includes(kpi.area) ||
        kpi.responsable === currentUser.cargo
    );

    // Split into EXACTLY two lists as requested
    // List 1: "Indicadores por Alimentar" (Mine + Pending)
    const pendingKPIs = myAccessKPIs.filter(k => k.responsable === currentUser.cargo && !k.hasData);

    // List 2: "Indicadores de mi Área" (Mine + Ready AND Monitoring)
    const areaKPIs = myAccessKPIs.filter(k =>
        (k.responsable === currentUser.cargo && k.hasData) || // Mine + Ready
        (k.responsable !== currentUser.cargo) // Monitoring
    );

    // Global stats
    const totalMyKPIs = myAccessKPIs.filter(k => k.responsable === currentUser.cargo).length;
    const completedMyKPIs = myAccessKPIs.filter(k => k.responsable === currentUser.cargo && k.hasData).length;
    const progressPercent = totalMyKPIs > 0 ? Math.round((completedMyKPIs / totalMyKPIs) * 100) : 0;

    const areaIcons = {
        'logistica-entrega': <Truck size={20} />,
        'logistica-picking': <Box size={20} />,
        'comercial': <TrendingUp size={20} />,
        'cartera': <DollarSign size={20} />,
        'administrativo': <Activity size={20} />,
        'talento-humano': <Users size={20} />,
        'logistica-deposito': <Box size={20} />,
        'caja': <DollarSign size={20} />,
        'contabilidad': <Activity size={20} />
    };

    const handleSaveKPI = (kpiId, data) => {
        if (onUpdateKPI) onUpdateKPI(kpiId, data);
        setEditingKPI(null);
    };

    // Helper to render KPI cards
    const renderKPICard = (kpi, idx, isMonitoring = false) => (
        <div key={kpi.id} className="card premium-shadow fade-in" style={{
            padding: '1.75rem',
            borderRadius: '24px',
            background: 'white',
            border: kpi.hasData ? '1px solid #e2e8f0' : '2px dashed #cbd5e1',
            opacity: isMonitoring && !kpi.hasData ? 0.7 : 1,
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            animationDelay: `${idx * 0.05}s`
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '10px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    background: kpi.hasData ? '#ecfdf5' : '#fff7ed',
                    color: kpi.hasData ? '#059669' : '#ea580c',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                }}>
                    {kpi.hasData ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {kpi.hasData ? 'LISTO' : 'POR CARGAR'}
                </div>

                {kpi.responsable === currentUser.cargo ? (
                    <button
                        onClick={() => setEditingKPI(kpi)}
                        style={{
                            background: kpi.hasData ? 'var(--bg-app)' : 'var(--brand)',
                            color: kpi.hasData ? 'var(--text-main)' : 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '10px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {kpi.hasData ? 'Editar' : 'Cargar'}
                    </button>
                ) : (
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', background: '#f8fafc', padding: '0.4rem 0.8rem', borderRadius: '10px' }}>
                        Lectura
                    </div>
                )}
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem', lineHeight: 1.3 }}>
                {kpi.name}
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '1rem', borderRadius: '16px' }}>
                <div>
                    <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Meta</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#475569' }}>
                        {typeof kpi.meta === 'object' ? 'Ver detalle' : `${kpi.meta}${kpi.unit}`}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Actual</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: kpi.hasData ? 'var(--brand)' : '#cbd5e1' }}>
                        {kpi.hasData ? `${kpi.currentValue}${kpi.unit}` : '--'}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh', background: 'var(--bg-app)' }}>

            {/* Header Con Progreso */}
            <div className="card premium-shadow" style={{
                padding: '2.5rem',
                borderRadius: '32px',
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: 'white',
                marginBottom: '4rem',
                border: 'none',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1, transform: 'rotate(-15deg)' }}>
                    <LayoutGrid size={200} />
                </div>

                <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{ background: 'var(--brand)', padding: '0.4rem', borderRadius: '8px' }}><Shield size={18} /></div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', opacity: 0.8 }}>CONSOLA DE ALIMENTACIÓN</span>
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                            Hola, {currentUser.name}
                        </h1>
                        <p style={{ opacity: 0.8, fontSize: '1.1rem', fontWeight: 500 }}>
                            {currentUser.company === 'TYM' ? 'TIENDAS Y MARCAS' : 'TAT DISTRIBUCIONES'}
                        </p>
                    </div>

                    <div style={{ width: '280px', background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.8 }}>PROGRESO DE CARGA</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--brand-light)' }}>{progressPercent}%</span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${progressPercent}%`,
                                height: '100%',
                                background: 'var(--brand)',
                                boxShadow: '0 0 15px var(--brand)',
                                transition: 'width 1s ease-out'
                            }}></div>
                        </div>
                        <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', opacity: 0.6, textAlign: 'right' }}>
                            {completedMyKPIs} de {totalMyKPIs} completados
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>

                {/* 1. Indicadores por Alimentar */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ background: '#f97316', color: 'white', padding: '0.6rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)' }}>
                            <Box size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.25rem' }}>Indicadores por Alimentar</h2>
                            <p style={{ fontSize: '0.95rem', color: '#64748b' }}>Tienes {pendingKPIs.length} indicadores pendientes de gestión.</p>
                        </div>
                    </div>

                    {pendingKPIs.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                            {pendingKPIs.map((kpi, idx) => renderKPICard(kpi, idx))}
                        </div>
                    ) : (
                        <div style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '32px', border: '1px dashed #e2e8f0' }}>
                            <div style={{ color: '#10b981', marginBottom: '1rem' }}><CheckCircle2 size={40} style={{ margin: '0 auto' }} /></div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#475569' }}>¡Todo al día!</h3>
                            <p style={{ color: '#94a3b8' }}>Has alimentado todos tus indicadores asignados.</p>
                        </div>
                    )}
                </section>

                {/* 2. Indicadores de mi Área (Merged Listos + Access) */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ background: '#64748b', color: 'white', padding: '0.6rem', borderRadius: '12px' }}>
                            <Activity size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.25rem' }}>Indicadores de mi Área</h2>
                            <p style={{ fontSize: '0.95rem', color: '#64748b' }}>Monitoreo general y KPIs ya cargados del departamento.</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                        {areaKPIs.map((kpi, idx) => renderKPICard(kpi, idx, kpi.responsable !== currentUser.cargo))}
                    </div>
                </section>
            </div>

            {editingKPI && (
                <KPIDataForm
                    kpi={editingKPI}
                    currentUser={currentUser}
                    onSave={handleSaveKPI}
                    onCancel={() => setEditingKPI(null)}
                />
            )}

            {/* Footer Tip */}
            <div style={{
                marginTop: '6rem',
                padding: '2.5rem',
                background: 'white',
                borderRadius: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
                border: '1px solid #f1f5f9',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <div style={{ width: '64px', height: '64px', background: '#eff6ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                    <Info size={32} />
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>Tip de Productividad</h4>
                    <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.6 }}>
                        Al completar un indicador en la sección **"Por Alimentar"**, este se moverá automáticamente a **"Listos"**. Mantén ambas compañías al día para una visión clara de la gerencia.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AnalystDashboard;
