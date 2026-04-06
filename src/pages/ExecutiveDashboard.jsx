import React, { useState } from 'react';
import MetricSummary from '../components/dashboard/MetricSummary';
import DynamicAreaGrid from '../components/dashboard/DynamicAreaGrid';
import ExecutiveHistory from '../components/dashboard/ExecutiveHistory';
import { filterKPIsByEntity } from '../utils/kpiHelpers';
import { LayoutGrid, TrendingUp } from 'lucide-react';

const ExecutiveDashboard = ({ kpiData, rawUpdates, activeCompany, setActiveCompany }) => {
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'trend'

    // Filter KPIs based on selected entity using the utility
    const filteredKPIs = filterKPIsByEntity(kpiData, activeCompany);

    return (
        <div className="dashboard fade-in" style={{
            height: 'calc(100vh - 64px)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '1.5rem',
            gap: '1.5rem',
            background: 'var(--bg-app)'
        }}>
            {/* 1. STRATEGIC HEADER */}
            <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: 'var(--text-main)' }}>
                        Tablero de Control Gerencial
                    </h2>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Supervisión estratégica unificada
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {/* VIEW TOGGLE */}
                    <div style={{
                        background: 'rgba(0,0,0,0.03)',
                        padding: '0.25rem',
                        borderRadius: '12px',
                        display: 'flex',
                        gap: '0.25rem'
                    }}>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '10px',
                                border: 'none',
                                cursor: 'pointer',
                                background: viewMode === 'grid' ? 'white' : 'transparent',
                                color: viewMode === 'grid' ? 'var(--brand)' : '#64748b',
                                boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.2s'
                            }}
                            title="Vista de Cuadrícula"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('trend')}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '10px',
                                border: 'none',
                                cursor: 'pointer',
                                background: viewMode === 'trend' ? 'white' : 'transparent',
                                color: viewMode === 'trend' ? 'var(--brand)' : '#64748b',
                                boxShadow: viewMode === 'trend' ? 'var(--shadow-sm)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.2s'
                            }}
                            title="Vista Histórica"
                        >
                            <TrendingUp size={18} />
                        </button>
                    </div>

                    {/* ENTITY SELECTOR */}
                    <div style={{
                        background: 'white',
                        padding: '0.25rem',
                        borderRadius: '12px',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        gap: '0.25rem'
                    }}>
                        {['TYM', 'TAT'].map(entity => (
                            <button
                                key={entity}
                                onClick={() => setActiveCompany(entity)}
                                style={{
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    background: activeCompany === entity ? 'var(--brand)' : 'transparent',
                                    color: activeCompany === entity ? 'white' : '#64748b',
                                    transition: 'all 0.2s ease',
                                    boxShadow: activeCompany === entity ? '0 4px 6px -1px rgba(37, 99, 235, 0.2)' : 'none'
                                }}
                            >
                                {entity}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. KPI SUMMARY */}
            <div style={{ flexShrink: 0 }}>
                <MetricSummary kpiData={filteredKPIs} horizontal />
            </div>

            {/* 3. MAIN CONTENT: GRID OR HISTORY */}
            {viewMode === 'grid' ? (
                <div>
                    <DynamicAreaGrid kpiData={filteredKPIs} />
                </div>
            ) : (
                <div className="fade-in">
                    <ExecutiveHistory kpiData={kpiData} rawUpdates={rawUpdates} />

                    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>Detalle Histórico por Área</h4>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '1rem'
                        }}>
                            {/* Proactive listing of area trends could go here, 
                                but for MVP the main chart is the star */}
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                La gráfica superior muestra el promedio consolidado de cumplimiento operativo para ambas empresas.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExecutiveDashboard;

