import React from 'react';
import { formatKPIValue } from '../../utils/formatters';
import { ResponsiveContainer, Area, AreaChart, Tooltip } from 'recharts';

const KPIDetailCard = ({ kpi, onEdit, canEdit }) => {
    if (!kpi.hasData) {
        return (
            <div className="card fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: '180px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>{kpi.name}</h4>
                <div style={{ padding: '0.75rem', background: 'var(--bg-soft)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                    <small style={{ color: 'var(--text-muted)' }}>Sin datos registrados</small>
                </div>
                {canEdit && (
                    <button
                        className="btn btn-primary"
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                        onClick={() => onEdit && onEdit(kpi)}
                    >
                        + Registrar
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="card fade-in" style={{ padding: '1.25rem' }}>
            {/* Visual Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--brand)' }}>{kpi.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`status ${kpi.semaphore === 'green' ? 'success' : 'danger'}`}></span>
                    {canEdit && (
                        <button
                            className="btn btn-ghost"
                            style={{ padding: '0.2rem 0.4rem', color: 'var(--brand-accent)' }}
                            onClick={() => onEdit && onEdit(kpi)}
                        >
                            ✏️
                        </button>
                    )}
                </div>
            </div>

            {/* Main Metric Value */}
            <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                    {formatKPIValue(kpi.currentValue, kpi.unit)}
                </div>
                {kpi.compliance && (
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: kpi.semaphore === 'green' ? 'var(--success)' : 'var(--danger)' }}>
                        {kpi.compliance.toFixed(1)}% Cumplimiento
                    </div>
                )}
            </div>

            {/* Micro Sparkline Chart */}
            {kpi.history && kpi.history.length > 0 && (
                <div style={{ height: '60px', marginBottom: '1rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={kpi.history}>
                            <defs>
                                <linearGradient id={`sparkline-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="var(--brand)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div style={{ background: 'var(--brand)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '10px' }}>
                                                {payload[0].value}
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="var(--brand)"
                                strokeWidth={1.5}
                                fillOpacity={1}
                                fill={`url(#sparkline-${kpi.id})`}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Progress Bar (Visual status) */}
            <div className="progress" style={{ height: '6px', borderRadius: '10px' }}>
                <div
                    className={kpi.semaphore === 'green' ? 'success' : 'danger'}
                    style={{ width: `${Math.min(kpi.compliance || 0, 100)}%` }}
                ></div>
            </div>

            {/* Hide formula and detailed meta as requested */}
        </div>
    );
};

export default KPIDetailCard;
