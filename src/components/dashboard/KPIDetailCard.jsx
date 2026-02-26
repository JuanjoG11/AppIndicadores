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
    ArrowDownRight,
    ChevronDown,
    ChevronUp,
    Clock,
    Settings
} from 'lucide-react';
import { BRAND_TO_ENTITY } from '../../utils/kpiHelpers';

const KPIDetailCard = ({ kpi, onEdit, canEdit, currentUser, activeCompany, selectedBrand }) => {
    const [showBreakdown, setShowBreakdown] = React.useState(false);

    // 1. Determinar marcas de la entidad actual (TYM o TAT)
    const entity = activeCompany || 'TYM';
    const allMetaBrands = (kpi.meta && typeof kpi.meta === 'object') ? Object.keys(kpi.meta) : [];
    const entityBrands = allMetaBrands.filter(b => BRAND_TO_ENTITY[b] === entity || b === entity);

    // Si hay una marca seleccionada, enfocarse en ella
    const isBrandFocus = selectedBrand && selectedBrand !== 'all';

    // Meta y Valor según el enfoque (consolidado o marca específica)
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

    // 2. Identificar cuáles faltan por cargar
    // Si hay filtro de marca, solo importa esa marca. Si no, importan todas las de la entidad.
    const relevantBrandsToTrack = isBrandFocus ? [selectedBrand] : entityBrands;
    const pendingBrands = relevantBrandsToTrack.filter(brand => {
        const dataKey = `${entity}-${brand}`;
        const brandData = kpi.brandValues?.[dataKey];
        return !brandData || brandData.hasData === false;
    });

    const isSuccess = displayCompliance >= 100 || (isBrandFocus ? false : kpi.semaphore === 'green');
    const isWarning = (displayCompliance < 100 && displayCompliance >= 80) || (isBrandFocus ? false : kpi.semaphore === 'yellow');
    const color = isSuccess ? '#059669' : (isWarning ? '#f59e0b' : '#ef4444');
    const bgColor = isSuccess ? '#ecfdf5' : (isWarning ? '#fffbeb' : '#fef2f2');

    const isManager = currentUser?.role === 'Gerente';

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
                <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem', color: '#1e293b' }}>{kpi.name}</h4>

                {pendingBrands.length > 0 && (
                    <div style={{
                        fontSize: '0.75rem',
                        color: '#f43f5e',
                        fontWeight: 700,
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: '#fff1f2',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '10px'
                    }}>
                        <Clock size={12} /> FALTA POR CARGAR: {pendingBrands.join(', ')}
                    </div>
                )}

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
                            onClick={() => onEdit && onEdit(kpi, 'data')}
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
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em' }}>
                        {formatKPIValue(displayValue, kpi.unit).split(' ')[0]}
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#64748b' }}>
                        {kpi.unit}
                    </span>
                </div>

                {displayCompliance !== undefined && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            color: color, fontWeight: 800, fontSize: '0.85rem'
                        }}>
                            {isSuccess ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            {displayCompliance.toFixed(1)}%
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

            {/* Pending Brands Warning (if partial data) */}
            {kpi.hasData && pendingBrands.length > 0 && (
                <div style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    color: '#e11d48',
                    background: '#fff1f2',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                }}>
                    <AlertCircle size={12} /> FALTAN MARCAS: {pendingBrands.join(', ')}
                </div>
            )}

            {/* Breakdown Toggle for Manager */}
            {isManager && entityBrands.length > 1 && (
                <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    style={{
                        width: '100%',
                        padding: '0.6rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        color: '#64748b',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                >
                    {showBreakdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {showBreakdown ? 'OCULTAR DESGLOSE' : 'DESGLOSAR POR MARCA'}
                </button>
            )}

            {/* Detailed Breakdown Section */}
            {showBreakdown && isManager && (
                <div className="fade-in" style={{
                    marginTop: '0.5rem',
                    padding: '1rem',
                    background: '#f8fafc',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {entityBrands.map(brand => {
                            const dataKey = `${entity}-${brand}`;
                            const brandData = kpi.brandValues?.[dataKey];
                            const brandCompliance = brandData?.compliance;
                            const brandTarget = kpi.meta[brand];

                            return (
                                <div key={brand} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '0.75rem',
                                    paddingBottom: '0.5rem',
                                    borderBottom: '1px solid #f1f5f9'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 900, color: '#1e293b' }}>{brand}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Meta: {brandTarget} {kpi.unit}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        {!brandData || brandData.hasData === false ? (
                                            <span style={{ color: '#ef4444', fontWeight: 800 }}>PENDIENTE</span>
                                        ) : (
                                            <>
                                                <div style={{ fontWeight: 900, color: brandCompliance >= 100 ? '#059669' : '#ef4444' }}>
                                                    {brandCompliance?.toFixed(1)}%
                                                </div>
                                                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                                                    {brandData.currentValue} {kpi.unit}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
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
                    {isBrandFocus ? `META ${selectedBrand}:` : `CONSOLIDADO ${entity}:`} <span style={{ color: '#334155' }}>{displayTarget} {kpi.unit}</span>
                </div>
                <div style={{
                    fontSize: '0.6rem',
                    padding: '0.2rem 0.5rem',
                    background: '#f8fafc',
                    borderRadius: '6px',
                    color: '#94a3b8',
                    fontWeight: 800
                }}>
                    FEBRERO 2026
                </div>
            </div>
        </div>
    );
};

export default KPIDetailCard;
