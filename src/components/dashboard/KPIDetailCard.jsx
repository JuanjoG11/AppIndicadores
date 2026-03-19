import React from 'react';
import { formatKPIValue, formatDateTime, formatDeadline, getKPIDeadline, checkIsUrgent, checkIsExpired } from '../../utils/formatters';
import { ResponsiveContainer, Area, AreaChart, Tooltip } from 'recharts';
import {
    Edit2,
    MoreHorizontal,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    Package,
    ArrowUpRight,
    ArrowDownRight,
    ChevronDown,
    ChevronUp,
    Clock,
    Settings
} from 'lucide-react';
import { BRAND_TO_ENTITY } from '../../utils/kpiHelpers';
import { isInverseKPI } from '../../utils/kpiCalculations';

const KPIDetailCard = ({ kpi, onEdit, canEdit, currentUser, activeCompany, selectedBrand }) => {

    // Simplificado para usar valores consolidados o marca específica
    const isBrandFocus = selectedBrand && selectedBrand !== 'all';
    const entity = activeCompany || 'TYM';

    let displayValue = kpi.currentValue;
    let displayTarget = kpi.targetMeta;
    let displayCompliance = kpi.compliance;

    if (isBrandFocus) {
        const dataKey = `${entity}-${selectedBrand}`;
        const bData = kpi.brandValues?.[dataKey];
        displayValue = bData?.currentValue || 0;
        displayTarget = kpi.meta[selectedBrand] || 0;
        displayCompliance = bData?.compliance;
    }

    const isSuccess = kpi.semaphore === 'green';
    const isWarning = kpi.semaphore === 'yellow';
    const color = isSuccess ? '#059669' : (isWarning ? '#f59e0b' : '#ef4444');
    const bgColor = isSuccess ? '#ecfdf5' : (isWarning ? '#fffbeb' : '#fef2f2');

    const isManager = currentUser?.role === 'Gerente';


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
                    {/* Brand Tag / Entity Tag */}
                    {(() => {
                        const displayBrand = isBrandFocus ? selectedBrand : (kpi.additionalData?.brand || activeCompany);
                        return (
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
                                <Package size={10} /> {displayBrand}
                            </div>
                        );
                    })()}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {(() => {
                        const isComplete = kpi.isComplete || kpi.hasData;
                        const statusColor = isComplete ? { bg: '#ecfdf5', text: '#059669', label: 'LISTO' } : { bg: '#fff7ed', text: '#ea580c', label: 'PENDIENTE' };

                        return (
                            <div style={{
                                padding: '0.3rem 0.6rem',
                                borderRadius: '8px',
                                fontSize: '0.6rem',
                                fontWeight: 900,
                                background: statusColor.bg,
                                color: statusColor.text,
                                marginRight: '0.5rem'
                            }}>
                                {statusColor.label}
                            </div>
                        );
                    })()}
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
                            onClick={() => onEdit && onEdit(kpi, 'data', selectedBrand)}
                            style={{
                                background: 'transparent', border: 'none',
                                color: '#94a3b8', cursor: 'pointer',
                                padding: '0.25rem'
                            }}
                        >
                            <Edit2 size={16} />
                        </button>
                    )}
                    {isManager && (
                        <button
                            onClick={() => onEdit && onEdit(kpi, 'meta')}
                            style={{
                                background: 'transparent', border: 'none',
                                color: 'var(--brand)', cursor: 'pointer',
                                padding: '0.25rem',
                                opacity: 0.8
                            }}
                            title="Gestionar Metas"
                        >
                            <Settings size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Value Section */}
            <div style={{ margin: '0.5rem 0' }}>
                {!isBrandFocus && kpi.meta && typeof kpi.meta === 'object' && Object.keys(kpi.meta).filter(b => (BRAND_TO_ENTITY[b] === entity || b === entity) && b !== 'POLAR').length > 0 ? (
                    /* MULTI-BRAND DISPLAY FOR DASHBOARDS */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.8rem' }}>
                        {Object.keys(kpi.meta)
                            .filter(b => (BRAND_TO_ENTITY[b] === entity || b === entity) && b !== 'POLAR')
                            .map(brand => {
                                const bData = kpi.brandValues?.[`${entity}-${brand}`];
                                const hasData = bData?.hasData;
                                const compColor = hasData ? (bData.semaphore === 'green' ? '#059669' : (bData.semaphore === 'red' ? '#ef4444' : '#f59e0b')) : '#94a3b8';
                                const valColor = hasData ? (bData.semaphore === 'green' ? '#059669' : (bData.semaphore === 'red' ? '#ef4444' : (bData.semaphore === 'yellow' ? '#f59e0b' : '#334155'))) : '#94a3b8';
                                
                                return (
                                    <div key={brand} style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: '60px 1.2fr 1.2fr 60px',
                                        gap: '0.4rem',
                                        alignItems: 'center', 
                                        background: '#f8fafc', 
                                        padding: '0.75rem 0.5rem', 
                                        borderRadius: '12px', 
                                        border: '1px solid #e2e8f0' 
                                    }}>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.1rem' }}>Marca</div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{brand}</div>
                                        </div>
                                        <div style={{ textAlign: 'center', minWidth: 0 }}>
                                            <div style={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.1rem' }}>Meta</div>
                                            <div style={{ fontSize: kpi.unit === '$' ? '0.62rem' : '0.75rem', fontWeight: 700, color: '#64748b' }}>
                                                {isInverseKPI(kpi.id) ? '≤ ' : '≥ '}{formatKPIValue(kpi.meta[brand], kpi.unit)}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'center', minWidth: 0 }}>
                                            <div style={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.1rem' }}>Resultado</div>
                                            <div style={{ fontSize: kpi.unit === '$' ? '0.8rem' : '1rem', fontWeight: 900, color: valColor }}>
                                                {hasData ? formatKPIValue(bData.currentValue, kpi.unit) : '--'}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', minWidth: 0 }}>
                                            <div style={{ fontSize: '0.5rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.1rem' }}>Logro %</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 900, color: compColor }}>
                                                {hasData ? `${bData.compliance}%` : '--'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em' }}>
                                {formatKPIValue(displayValue, kpi.unit).replace(kpi.unit, '').trim()}
                            </span>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#64748b' }}>
                                {kpi.unit}
                            </span>
                        </div>

                        {(displayCompliance != null) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center',
                                    color: color, fontWeight: 800, fontSize: '0.85rem'
                                }}>
                                    {isInverseKPI(kpi.id) ? (displayCompliance >= 100 ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />) : (displayCompliance >= 100 ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />)}
                                    {displayCompliance.toFixed(1)}%
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>LOGRO META ({isInverseKPI(kpi.id) ? `≤ ${formatKPIValue(displayTarget, kpi.unit)}` : `≥ ${formatKPIValue(displayTarget, kpi.unit)}`})</span>
                            </div>
                        )}
                        {/* DETALLE DE CÁLCULO (Input values) */}
                        {(() => {
                            const dataToRender = isBrandFocus
                                ? kpi.brandValues?.[`${entity}-${selectedBrand}`]?.additionalData
                                : kpi.additionalData;

                            if (!dataToRender || Object.keys(dataToRender).length <= 2) return null;

                            return (
                                <div style={{
                                    marginTop: '1.25rem',
                                    padding: '0.75rem',
                                    background: '#f8fafc',
                                    borderRadius: '12px',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '0.75rem'
                                }}>
                                    {Object.entries(dataToRender)
                                        .filter(([key]) => !['brand', 'company', 'updatedAt', 'type', 'newMeta'].includes(key))
                                        .map(([key, val]) => (
                                            <div key={key}>
                                                <div style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>
                                                    {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155' }}>
                                                    {typeof val === 'number' ? (val > 1000 ? `$${val.toLocaleString()}` : val) : val}
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            );
                        })()}
                    </>
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
                flexDirection: 'column',
                gap: '0.75rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>
                        {isBrandFocus ? `META ${selectedBrand}:` : `META CONSOLIDADA ${activeCompany || 'TYM'}:`} <span style={{ color: '#334155', fontWeight: 900 }}>{formatKPIValue(displayTarget, kpi.unit)}</span>
                    </div>
                    <div style={{
                        fontSize: '0.6rem',
                        padding: '0.2rem 0.5rem',
                        background: '#f8fafc',
                        borderRadius: '6px',
                        color: '#94a3b8',
                        fontWeight: 800
                    }}>
                        {kpi.frecuencia} - MARZO 2026
                    </div>
                </div>

                {/* Deadlines and Updates (Special for Manager) */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    background: isManager ? 'var(--brand-bg)' : (checkIsExpired(getKPIDeadline(kpi.frecuencia)) && !kpi.hasData ? '#fff1f2' : (checkIsUrgent(getKPIDeadline(kpi.frecuencia)) ? '#fffbeb' : '#f8fafc')),
                    padding: '0.75rem',
                    borderRadius: '14px',
                    border: isManager ? '1px solid var(--brand)' : (checkIsExpired(getKPIDeadline(kpi.frecuencia)) && !kpi.hasData ? '1px solid #fda4af' : (checkIsUrgent(getKPIDeadline(kpi.frecuencia)) ? '1px solid #fde68a' : '1px solid #e2e8f0')),
                    opacity: 0.9
                }}>
                    <div>
                        <div style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                            <Clock size={10} style={{ verticalAlign: 'middle', marginRight: '2px' }} /> FECHA LÍMITE
                        </div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: (checkIsExpired(getKPIDeadline(kpi.frecuencia)) && !kpi.hasData) ? '#ef4444' : '#1e293b' }}>
                            {formatDeadline(getKPIDeadline(kpi.frecuencia))}
                        </div>
                    </div>
                    <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '0.5rem' }}>
                        <div style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                            {isManager ? '★ ÚLTIMA ACT.' : 'ÚLTIMA ACTUALIZACIÓN'}
                        </div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: isManager ? 'var(--brand)' : '#334155' }}>
                            {formatDateTime(isBrandFocus ? kpi.brandValues?.[`${entity}-${selectedBrand}`]?.additionalData?.updatedAt : kpi.additionalData?.updatedAt)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KPIDetailCard;
