import React from 'react';
import { formatKPIValue } from '../../utils/formatters';
import { ResponsiveContainer, Area, AreaChart, Tooltip } from 'recharts';
import {
    Edit2,
    MoreHorizontal,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    Package,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

const KPIDetailCard = ({ kpi, onEdit, canEdit }) => {
    const isSuccess = kpi.semaphore === 'green';
    const isWarning = kpi.semaphore === 'yellow';
    const color = isSuccess ? '#059669' : (isWarning ? '#f59e0b' : '#ef4444');
    const bgColor = isSuccess ? '#ecfdf5' : (isWarning ? '#fffbeb' : '#fef2f2');

    if (!kpi.hasData) {
        return (
            <div className="card animate-fade-in" style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                minHeight: '220px',
                background: 'white',
                border: '1px dashed #e2e8f0',
                borderRadius: '24px',
                padding: '2rem'
            }}>
                <div style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                    <Package size={32} strokeWidth={1.5} />
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: '#1e293b' }}>{kpi.name}</h4>
                {canEdit && (
                    <button
                        className="btn-primary"
                        style={{
                            fontSize: '0.8rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '12px',
                            background: 'var(--brand)',
                            color: 'white',
                            border: 'none',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                        onClick={() => onEdit && onEdit(kpi)}
                    >
                        Completar Datos
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="card premium-shadow animate-slide-up" style={{
            padding: '1.5rem',
            borderRadius: '24px',
            background: 'white',
            border: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            transition: 'transform 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.2, marginBottom: '0.4rem' }}>
                        {kpi.name}
                    </h4>
                    {kpi.additionalData?.brand && (
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            color: 'var(--brand)',
                            background: 'var(--brand-bg)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '20px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em'
                        }}>
                            <Package size={10} /> {kpi.additionalData.brand}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                        width: '32px', height: '32px',
                        borderRadius: '50%', background: bgColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: color
                    }}>
                        {isSuccess ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    </div>
                    {canEdit && (
                        <button
                            onClick={() => onEdit && onEdit(kpi)}
                            style={{
                                background: 'transparent', border: 'none',
                                color: '#94a3b8', cursor: 'pointer',
                                padding: '0.25rem'
                            }}
                        >
                            <Edit2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Value Section */}
            <div style={{ margin: '0.5rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em' }}>
                        {formatKPIValue(kpi.currentValue, kpi.unit).split(' ')[0]}
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#64748b' }}>
                        {kpi.unit}
                    </span>
                </div>

                {kpi.compliance !== undefined && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            color: color, fontWeight: 800, fontSize: '0.85rem'
                        }}>
                            {isSuccess ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            {kpi.compliance.toFixed(1)}%
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>CUMPLIMIENTO</span>
                    </div>
                )}
            </div>

            {/* Sparkline */}
            {kpi.history && kpi.history.length > 0 && (
                <div style={{ height: '50px', margin: '0.5rem -1.5rem', opacity: 0.8 }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={50}>
                        <AreaChart data={kpi.history}>
                            <defs>
                                <linearGradient id={`gradient-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={color}
                                strokeWidth={2}
                                fill={`url(#gradient-${kpi.id})`}
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Footer / Meta info */}
            <div style={{
                marginTop: 'auto',
                paddingTop: '1rem',
                borderTop: '1px solid #f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>
                    META: <span style={{ color: '#334155' }}>{kpi.targetMeta}{kpi.unit}</span>
                </div>
                <div style={{
                    fontSize: '0.6rem',
                    padding: '0.2rem 0.5rem',
                    background: '#f8fafc',
                    borderRadius: '6px',
                    color: '#94a3b8',
                    fontWeight: 800
                }}>
                    EST: 2026
                </div>
            </div>
        </div>
    );
};

export default KPIDetailCard;
