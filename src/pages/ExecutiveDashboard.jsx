import React from 'react';
import MetricSummary from '../components/dashboard/MetricSummary';
import DynamicAreaGrid from '../components/dashboard/DynamicAreaGrid';

const ExecutiveDashboard = ({ kpiData }) => {
    const [selectedEntity, setSelectedEntity] = React.useState('TYM');

    // Filter KPIs based on selected entity
    const filteredKPIs = kpiData.map(kpi => {
        // Look for keys that start with the selected entity (e.g., "TYM-")
        const entityKeys = kpi.brandValues ? Object.keys(kpi.brandValues).filter(key => key.startsWith(`${selectedEntity}-`)) : [];

        // If we have specific data for this entity
        if (entityKeys.length > 0) {
            // Priority: Total/Global for that entity, or first available
            const globalKey = `${selectedEntity}-GLOBAL`;
            const mainKey = entityKeys.includes(globalKey) ? globalKey : entityKeys[0];

            return {
                ...kpi,
                ...kpi.brandValues[mainKey]
            };
        }

        // Fallback: If no specific data in brandValues, check if we need to adjust TARGET only
        let targetMeta = kpi.meta;
        if (typeof kpi.meta === 'object') {
            targetMeta = kpi.meta[selectedEntity] || Object.values(kpi.meta)[0] || 0;
        }

        return {
            ...kpi,
            targetMeta,
            hasData: false // Marcar como sin datos si no hay registro específico para esta empresa
        };
    });

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
            <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>
                        Tablero de Control Gerencial
                    </h2>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#64748b' }}>
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
                            onClick={() => setSelectedEntity(entity)}
                            style={{
                                padding: '0.5rem 1.5rem',
                                borderRadius: '10px',
                                border: 'none',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                background: selectedEntity === entity ? 'var(--brand)' : 'transparent',
                                color: selectedEntity === entity ? 'white' : '#64748b',
                                transition: 'all 0.2s ease',
                                boxShadow: selectedEntity === entity ? '0 4px 6px -1px rgba(37, 99, 235, 0.2)' : 'none'
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
