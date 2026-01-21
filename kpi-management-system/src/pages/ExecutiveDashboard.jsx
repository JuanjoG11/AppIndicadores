import React from 'react';
import MetricSummary from '../components/dashboard/MetricSummary';
import DynamicAreaGrid from '../components/dashboard/DynamicAreaGrid';

const ExecutiveDashboard = ({ kpiData }) => {
    return (
        <div className="dashboard fade-in" style={{
            height: 'calc(100vh - 64px)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto', // Allow scroll if many areas, but we aim for no scroll
            padding: '1.5rem',
            gap: '1.5rem',
            background: 'var(--bg-app)'
        }}>
            {/* 1. STRATEGIC SUMMARY (TOP) */}
            <div style={{ flexShrink: 0 }}>
                <div className="card" style={{
                    padding: '1.5rem',
                    background: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Desempeño Operativo Global</h3>
                            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-light)' }}>Monitoreo en tiempo real de indicadores estratégicos</p>
                        </div>
                    </div>
                    <MetricSummary kpiData={kpiData} horizontal />
                </div>
            </div>

            {/* 2. AREA MONITOR (BOTTOM) - FULL WIDTH GRID */}
            <div>
                <div className="card" style={{
                    padding: '1.5rem',
                    background: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow-md)',
                    minHeight: 'min-content'
                }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monitor Detallado por Área</h3>
                    </div>
                    <div style={{ width: '100%' }}>
                        <DynamicAreaGrid kpiData={kpiData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExecutiveDashboard;
