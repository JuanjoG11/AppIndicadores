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
    const [activeTab, setActiveTab] = useState('all');

    // Filter by company FIRST, then by user permissions
    const companyKPIs = filterKPIsByEntity(kpiData, currentUser.company);

    const myKPIs = companyKPIs.filter(kpi =>
        currentUser.authorizedAreas?.includes('all') ||
        currentUser.authorizedAreas?.includes(kpi.area) ||
        kpi.responsable === currentUser.cargo
    );

    const totalKPIs = myKPIs.length;
    const completedKPIs = myKPIs.filter(k => k.hasData).length;
    const progressPercent = totalKPIs > 0 ? Math.round((completedKPIs / totalKPIs) * 100) : 0;

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

    const groupedKPIs = myKPIs.reduce((acc, kpi) => {
        if (!acc[kpi.area]) acc[kpi.area] = [];
        acc[kpi.area].push(kpi);
        return acc;
    }, {});

    const handleSaveKPI = (kpiId, data) => {
        if (onUpdateKPI) onUpdateKPI(kpiId, data);
        setEditingKPI(null);
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh', background: 'var(--bg-app)' }}>

            {/* Header Con Progreso */}
            <div className="card premium-shadow" style={{
                padding: '2.5rem',
                borderRadius: '32px',
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                color: 'white',
                marginBottom: '3rem',
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
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                            Hola, {currentUser.name}
                        </h1>
                        <p style={{ opacity: 0.7, fontSize: '1rem', maxWidth: '450px' }}>
                            Tienes <strong style={{ color: 'white' }}>{totalKPIs} indicadores</strong> asignados para <strong style={{ color: 'white' }}>{currentUser.company}</strong>. Mantén la información al día para la gerencia.
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
                            {completedKPIs} de {totalKPIs} completados
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>

                {/* 1. Indicadores que Alimento */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ background: 'var(--brand)', color: 'white', padding: '0.6rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>
                            <Box size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.25rem' }}>Indicadores que Alimento</h2>
                            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Estos son los indicadores bajo tu responsabilidad directa.</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                        {myKPIs.filter(k => k.responsable === currentUser.cargo).map((kpi, idx) => (
                            <div key={kpi.id} className="card premium-shadow fade-in" style={{
                                padding: '1.75rem',
                                borderRadius: '24px',
                                background: 'white',
                                border: kpi.hasData ? '1px solid #e2e8f0' : '2px dashed #cbd5e1',
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
                                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        {kpi.hasData ? 'Editar' : 'Cargar'}
                                    </button>
                                </div>

                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem', lineHeight: 1.3 }}>
                                    {kpi.name}
                                </h3>

                                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '1rem', borderRadius: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Meta</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#475569' }}>
                                            {typeof kpi.meta === 'object' ? 'Varios (Marca)' : `${kpi.meta}${kpi.unit}`}
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
                        ))}
                    </div>
                </section>

                {/* 2. Indicadores de mi Área */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ background: '#64748b', color: 'white', padding: '0.6rem', borderRadius: '12px' }}>
                            <Activity size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.25rem' }}>Indicadores de mi Área</h2>
                            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Monitoreo general de los indicadores de tu departamento.</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                        {myKPIs.filter(k => k.responsable !== currentUser.cargo).map((kpi, idx) => (
                            <div key={kpi.id} className="card premium-shadow fade-in" style={{
                                padding: '1.75rem',
                                borderRadius: '24px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                opacity: 0.85,
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                    <div style={{
                                        padding: '0.3rem 0.6rem',
                                        borderRadius: '8px',
                                        fontSize: '0.6rem',
                                        fontWeight: 800,
                                        background: '#f1f5f9',
                                        color: '#64748b',
                                        textTransform: 'uppercase'
                                    }}>
                                        Solo Lectura
                                    </div>
                                    <div style={{
                                        color: kpi.semaphore === 'green' ? '#10b981' : kpi.semaphore === 'yellow' ? '#f59e0b' : kpi.semaphore === 'red' ? '#ef4444' : '#94a3b8'
                                    }}>
                                        <TrendingUp size={20} />
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem', lineHeight: 1.3 }}>
                                    {kpi.name}
                                </h3>

                                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '1rem', borderRadius: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Meta</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#64748b' }}>
                                            {typeof kpi.meta === 'object' ? 'Varios (Marca)' : `${kpi.meta}${kpi.unit}`}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Actual</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>
                                            {kpi.hasData ? `${kpi.currentValue}${kpi.unit}` : '--'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
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
                marginTop: '4rem',
                padding: '2rem',
                background: 'white',
                borderRadius: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                border: '1px solid #f1f5f9'
            }}>
                <div style={{ width: '56px', height: '56px', background: '#eff6ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                    <Info size={28} />
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>Tip del Sistema</h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                        Carga los datos diariamente para que el **Tablero Gerencial** refleje la realidad exacta de la operación. Tu puntualidad es clave para el éxito de la compañía.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AnalystDashboard;
