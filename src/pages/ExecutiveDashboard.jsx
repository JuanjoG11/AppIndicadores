import React from 'react';
import MetricSummary from '../components/dashboard/MetricSummary';
import DynamicAreaGrid from '../components/dashboard/DynamicAreaGrid';
import { filterKPIsByEntity } from '../utils/kpiHelpers';

const ExecutiveDashboard = ({ kpiData, activeCompany, setActiveCompany }) => {
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

            {/* 2. KPI SUMMARY */}
            <div style={{ flexShrink: 0 }}>
                <MetricSummary kpiData={filteredKPIs} horizontal />
            </div>

            {/* 3. AREA GRID */}
            <div>
                <DynamicAreaGrid kpiData={filteredKPIs} />
            </div>
        </div>
    );
};

export default ExecutiveDashboard;
