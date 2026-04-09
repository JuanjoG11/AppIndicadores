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
    Shield as ShieldIcon,
    Settings
} from 'lucide-react';
import KPIDataForm from '../components/forms/KPIDataForm';
import { filterKPIsByEntity, BRAND_TO_ENTITY, getEntityBrands, getKPIResponsable } from '../utils/kpiHelpers';
import { isInverseKPI } from '../utils/kpiCalculations';
import { getKPIDeadline, checkIsUrgent, checkIsExpired, formatDeadline, formatDateTime, formatKPIValue } from '../utils/formatters';
import { Clock, Calendar } from 'lucide-react';

const AnalystDashboard = ({ kpiData, currentUser, onUpdateKPI }) => {
    const [editingKPI, setEditingKPI] = useState(null);
    const [editMode, setEditMode] = useState('data');

    const handleStartEdit = (kpi, mode = 'data') => {
        setEditingKPI(kpi);
        setEditMode(mode);
    };

    // Si el usuario tiene marca bloqueada, filtrar por ella; si no, usar todas las marcas de la entidad
    const lockedBrand = currentUser.activeBrand || null;

    const getEffectiveBrands = (kpi) => {
        const all = getEntityBrands(kpi, currentUser.company);
        if (lockedBrand) {
            // Handle single brand or array of brands
            if (Array.isArray(lockedBrand)) {
                return all.filter(b => lockedBrand.includes(b));
            }
            return all.filter(b => b === lockedBrand);
        }
        return all;
    };

    // 1. Get filtered data for ONLY the current user's company
    const companyKPIsRaw = filterKPIsByEntity(kpiData, currentUser.company);

    // Filter helper: check user permissions for authorized areas
    const myAccessKPIs = companyKPIsRaw.filter(kpi => {
        const effectiveResponsable = getKPIResponsable(kpi, currentUser);
        return (currentUser.authorizedAreas?.includes('all') ||
            currentUser.authorizedAreas?.includes(kpi.area) ||
            kpi.visibleEnAreas?.some(a => currentUser.authorizedAreas?.includes(a)) ||
            effectiveResponsable === currentUser.cargo) &&
            kpi.isAutoFeed !== true;
    });

    // Split into EXACTLY two lists as requested
    // List 1: "Indicadores por Alimentar" (Mine + Pending Brands)
    const pendingKPIs = myAccessKPIs.filter(k => {
        const effectiveResponsable = getKPIResponsable(k, currentUser);
        if (effectiveResponsable !== currentUser.cargo) return false;

        // Si no tiene desgloses por marca, solo chequear hasData
        if (!k.meta || typeof k.meta !== 'object') return !k.hasData;

        // Si tiene marcas, ver si la(s) marca(s) efectiva(s) del usuario faltan
        const effectiveBrands = getEffectiveBrands(k);
        if (effectiveBrands.length === 0) return !k.hasData;

        return effectiveBrands.some(brand => {
            const dataKey = `${currentUser.company}-${brand}`;
            const brandData = k.brandValues?.[dataKey];
            return !brandData || brandData.hasData === false;
        });
    });

    // List 2: "Indicadores de mi Área" (Monitoring + Fully Fed Mine)
    const areaKPIs = myAccessKPIs.filter(k => {
        const effectiveResponsable = getKPIResponsable(k, currentUser);
        const isMine = effectiveResponsable === currentUser.cargo;
        if (!isMine) return true; // Monitoring
        return !pendingKPIs.find(pk => pk.id === k.id);
    });
    // Priority mapping for sorting SubAreas in Logistica
    const subAreaPriority = {
        'Logística de Depósito': 1,
        'Logística de Picking': 2,
        'Logística de Entrega': 3
    };

    // Helper to group KPIs by SubArea
    const groupKPIsBySubArea = (kpis) => {
        const groups = {};
        kpis.forEach(kpi => {
            const groupName = kpi.subArea || 'General';
            if (!groups[groupName]) groups[groupName] = [];
            groups[groupName].push(kpi);
        });
        return groups;
    };

    const pendingGroups = groupKPIsBySubArea(pendingKPIs);
    const areaGroups = groupKPIsBySubArea(areaKPIs);

    const sortedSubAreas = Object.keys(subAreaPriority).sort((a, b) => subAreaPriority[a] - subAreaPriority[b]);


    // Urgency logic for pending
    const criticalCount = pendingKPIs.filter(k => checkIsExpired(getKPIDeadline(k.frecuencia))).length;
    const urgentCount = pendingKPIs.filter(k => checkIsUrgent(getKPIDeadline(k.frecuencia))).length;

    // Global stats - Contar solo marcas efectivas del usuario
    const getMyStats = () => {
        let total = 0;
        let done = 0;
        myAccessKPIs.filter(k => {
            const effectiveResponsable = getKPIResponsable(k, currentUser);
            return effectiveResponsable === currentUser.cargo;
        }).forEach(k => {
            if (!k.meta || typeof k.meta !== 'object') {
                total++;
                if (k.hasData) done++;
            } else {
                const effectiveBrands = getEffectiveBrands(k);
                if (effectiveBrands.length === 0) {
                    total++;
                    if (k.hasData) done++;
                } else {
                    effectiveBrands.forEach(brand => {
                        total++;
                        const dataKey = `${currentUser.company}-${brand}`;
                        if (k.brandValues?.[dataKey]?.hasData) done++;
                    });
                }
            }
        });
        return { total, done };
    };

    const { total: totalMyKPIs, done: completedMyKPIs } = getMyStats();
    const progressPercent = totalMyKPIs > 0 ? Math.round((completedMyKPIs / totalMyKPIs) * 100) : 0;

    const handleSaveKPI = (kpiId, data) => {
        if (onUpdateKPI) onUpdateKPI(kpiId, data);
        if (data.type !== 'META_UPDATE') {
            setEditingKPI(null);
        }
    };

    // Helper to render KPI cards
    const renderKPICard = (kpi, idx, isMonitoring = false) => {
        const effectiveResponsable = getKPIResponsable(kpi, currentUser);
        const isMine = effectiveResponsable === currentUser.cargo;
        let isReady = kpi.hasData;
        let pendingBrandsList = [];

        if (isMine && kpi.meta && typeof kpi.meta === 'object') {
            const effectiveBrands = getEffectiveBrands(kpi);
            if (effectiveBrands.length > 0) {
                pendingBrandsList = effectiveBrands.filter(brand => {
                    const dataKey = `${currentUser.company}-${brand}`;
                    return !kpi.brandValues?.[dataKey]?.hasData;
                });
                isReady = pendingBrandsList.length === 0;
            }
        }

        const deadline = getKPIDeadline(kpi.frecuencia);
        const isUrgent = checkIsUrgent(deadline);
        const isExpired = checkIsExpired(deadline) && !isReady;

        return (
            <div key={kpi.id} className="card premium-shadow fade-in" style={{
                padding: '1.75rem',
                borderRadius: '24px',
                background: 'white',
                border: isReady ? '1px solid #e2e8f0' : '2px dashed #cbd5e1',
                opacity: isMonitoring && !kpi.hasData ? 0.7 : 1,
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                animationDelay: `${idx * 0.05}s`
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <div style={{
                            padding: '0.4rem 0.8rem',
                            borderRadius: '10px',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            background: isReady ? '#ecfdf5' : '#fff7ed',
                            color: isReady ? '#059669' : '#ea580c',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                        }}>
                            {isReady ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                            <span style={{ whiteSpace: 'normal' }}>
                                {isReady ? 'LISTO' : (pendingBrandsList.length > 0
                                    ? `FALTA CARGAR: ${pendingBrandsList.join(', ')}`
                                    : 'FALTA CARGAR')}
                            </span>
                        </div>
                        <div style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            color: 'var(--brand)',
                            background: 'var(--brand-bg)',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                        }}>
                            <Calendar size={12} /> {kpi.frecuencia}
                        </div>
                    </div>

                    {isMine ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => handleStartEdit(kpi, 'data')}
                                style={{
                                    background: isReady ? 'var(--bg-app)' : 'var(--brand)',
                                    color: isReady ? 'var(--text-main)' : 'white',
                                    border: 'none',
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '10px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    cursor: 'pointer'
                                }}
                            >
                                {isReady ? 'Editar' : 'Cargar'}
                            </button>
                        </div>
                    ) : (
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', background: '#f8fafc', padding: '0.4rem 0.8rem', borderRadius: '10px' }}>
                            Lectura
                        </div>
                    )}
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.25rem', lineHeight: 1.3 }}>
                    {kpi.name}
                </h3>

                {/* Deadline Reminder - MORE VISIBLE */}
                {!isReady && isMine && (
                    <div style={{
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        background: isExpired ? '#fff1f2' : (isUrgent ? '#fffbeb' : '#f8fafc'),
                        borderRadius: '16px',
                        border: `1px solid ${isExpired ? '#fda4af' : (isUrgent ? '#fde68a' : '#e2e8f0')}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                        boxShadow: isUrgent || isExpired ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={16} color={isExpired ? '#ef4444' : (isUrgent ? '#f59e0b' : '#64748b')} />
                            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' }}>
                                {isExpired ? '¡PLAZO VENCIDO!' : 'PLAZO DE CARGA'}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 900, color: isExpired ? '#ef4444' : (isUrgent ? '#f59e0b' : '#1e293b') }}>
                            {formatDeadline(deadline)}
                        </div>
                    </div>
                )}



                {/* Brand Breakdown for Multi-brand KPIs - FILTRADO POR MARCA ACTIVA */}
                {kpi.meta && typeof kpi.meta === 'object' && getEffectiveBrands(kpi).length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        {getEffectiveBrands(kpi)
                            .map(brand => {
                                const dataKey = `${currentUser.company}-${brand}`;
                                const bData = kpi.brandValues?.[dataKey];
                                const hasData = bData?.hasData;
                                const compColor = hasData ? (bData.semaphore === 'green' ? '#059669' : (bData.semaphore === 'red' ? '#ef4444' : '#f59e0b')) : '#94a3b8';
                                const valColor = hasData ? (bData.semaphore === 'green' ? '#059669' : (bData.semaphore === 'red' ? '#ef4444' : (bData.semaphore === 'yellow' ? '#f59e0b' : 'var(--brand)'))) : '#94a3b8';
                                
                                return (
                                    <div key={brand} style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: '65px 1.2fr 1.2fr 60px',
                                        gap: '0.4rem',
                                        alignItems: 'center', 
                                        background: '#f8fafc', 
                                        padding: '0.75rem 0.6rem', 
                                        borderRadius: '12px', 
                                        border: '1px solid #e2e8f0' 
                                    }}>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.1rem' }}>Marca</div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{brand}</div>
                                        </div>
                                        <div style={{ textAlign: 'center', minWidth: 0 }}>
                                            <div style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.1rem' }}>Meta</div>
                                            <div style={{ fontSize: kpi.unit === '$' ? '0.62rem' : '0.75rem', fontWeight: 700, color: '#64748b' }}>
                                                {isInverseKPI(kpi.id) ? '≤ ' : '≥ '}{formatKPIValue(kpi.meta[brand], kpi.unit)}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'center', minWidth: 0 }}>
                                            <div style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.1rem' }}>Resultado</div>
                                            <div style={{ fontSize: kpi.unit === '$' ? '0.75rem' : '0.9rem', fontWeight: 800, color: valColor }}>
                                                {hasData ? formatKPIValue(bData.currentValue, kpi.unit) : '--'}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', minWidth: 0 }}>
                                            <div style={{ fontSize: '0.45rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.1rem' }}>Logro %</div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 900, color: compColor }}>
                                                {hasData ? `${bData.compliance}%` : '--'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                ) : (
                    /* Original Single Display */
                    <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '1rem', borderRadius: '16px', marginBottom: '1.25rem' }}>
                        <div>
                            <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Meta</div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#475569' }}>
                                {isInverseKPI(kpi.id) ? '≤ ' : '≥ '}{kpi.meta && typeof kpi.meta === 'object' ? formatKPIValue(kpi.targetMeta, kpi.unit) : formatKPIValue(kpi.meta, kpi.unit)}
                            </div>
                        </div>
                        {kpi.hasData && (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Logro %</div>
                                <div style={{
                                    fontSize: '0.9rem',
                                    fontWeight: 900,
                                    color: (kpi.semaphore === 'green' ? '#059669' : (kpi.semaphore === 'red' ? '#ef4444' : '#f59e0b'))
                                }}>
                                    {kpi.compliance}%
                                </div>
                            </div>
                        )}
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Resultado</div>
                            <div style={{
                                fontSize: '1rem',
                                fontWeight: 800,
                                color: kpi.hasData
                                    ? (kpi.semaphore === 'green' ? '#059669' : (kpi.semaphore === 'red' ? '#ef4444' : (kpi.semaphore === 'yellow' ? '#f59e0b' : 'var(--brand)')))
                                    : '#cbd5e1'
                            }}>
                                {kpi.hasData ? formatKPIValue(kpi.currentValue, kpi.unit) : '--'}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Box - Always Visible */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    background: '#f8fafc',
                    padding: '0.75rem',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0'
                }}>
                    <div>
                        <div style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                            <Clock size={10} style={{ verticalAlign: 'baseline', marginRight: '2px' }} /> Límite
                        </div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: isExpired ? '#ef4444' : '#1e293b' }}>
                            {formatDeadline(deadline)}
                        </div>
                    </div>
                    <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '0.5rem' }}>
                        <div style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                            Act.
                        </div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#334155' }}>
                            {formatDateTime(kpi.additionalData?.updatedAt)}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

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
                            <div style={{ background: 'var(--brand)', padding: '0.4rem', borderRadius: '8px' }}><ShieldIcon size={18} /></div>
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

            {/* Alertas de Plazo para el Analista */}
            <div style={{
                marginBottom: '3rem',
                background: criticalCount > 0 ? '#fff1f2' : (urgentCount > 0 ? '#fffbeb' : '#f0f9ff'),
                border: `1px solid ${criticalCount > 0 ? '#fda4af' : (urgentCount > 0 ? '#fde68a' : '#bae6fd')}`,
                borderRadius: '24px',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                animation: (criticalCount > 0 || urgentCount > 0) ? 'pulse-subtle 3s infinite' : 'none'
            }}>
                <div style={{
                    width: '56px', height: '56px',
                    background: criticalCount > 0 ? '#ef4444' : (urgentCount > 0 ? '#f59e0b' : '#3b82f6'),
                    borderRadius: '16px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: 'white'
                }}>
                    {criticalCount > 0 ? <AlertCircle size={32} /> : (urgentCount > 0 ? <Clock size={32} /> : <Calendar size={32} />)}
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#1e293b' }}>
                        Estado de Carga - {currentUser.name}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b', fontWeight: 600 }}>
                        {criticalCount > 0
                            ? `¡URGENTE! Tienes ${criticalCount} indicadores con el PLAZO VENCIDO.`
                            : (urgentCount > 0
                                ? `ATENCIÓN: Tienes ${urgentCount} indicadores que vencen en las próximas 24 horas.`
                                : pendingKPIs.length > 0
                                    ? `Tienes ${pendingKPIs.length} indicadores pendientes. El próximo vencimiento es para los de frecuencia DIARIA (hoy) o SEMANAL (viernes).`
                                    : '¡Excelente trabajo! Has completado todas tus cargas para este periodo.'
                            )
                        }
                    </p>
                </div>
                {pendingKPIs.length > 0 && (
                    <div style={{ textAlign: 'right', padding: '0 1rem' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Faltantes</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b' }}>{pendingKPIs.length}</div>
                    </div>
                )}
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
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0 }}>Tienes {pendingKPIs.length} indicadores pendientes.</p>
                                {criticalCount > 0 && (
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', background: '#fff1f2', padding: '0.1rem 0.5rem', borderRadius: '6px' }}>
                                        {criticalCount} VENCIDOS
                                    </span>
                                )}
                                {urgentCount > 0 && (
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', background: '#fffbeb', padding: '0.1rem 0.5rem', borderRadius: '6px' }}>
                                        {urgentCount} URGENTES
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {pendingKPIs.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                            {sortedSubAreas.map(subArea => {
                                const kpis = pendingGroups[subArea];
                                if (!kpis || kpis.length === 0) return null;
                                return (
                                    <div key={`pending-${subArea}`}>
                                        <h3 style={{
                                            fontSize: '1rem',
                                            fontWeight: 900,
                                            color: '#64748b',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            marginBottom: '1.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem'
                                        }}>
                                            <div style={{ width: '12px', height: '4px', background: 'var(--brand)', borderRadius: '2px' }}></div>
                                            {subArea}
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                                            {kpis.map((kpi, idx) => renderKPICard(kpi, idx))}
                                        </div>
                                    </div>
                                );
                            })}
                            {/* Render others if any */}
                            {Object.keys(pendingGroups).filter(sa => !sortedSubAreas.includes(sa)).map(subArea => (
                                <div key={`pending-${subArea}`}>
                                    {subArea !== 'General' && <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '1.5rem' }}>{subArea}</h3>}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                                        {pendingGroups[subArea].map((kpi, idx) => renderKPICard(kpi, idx))}
                                    </div>
                                </div>
                            ))}
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        {sortedSubAreas.map(subArea => {
                            const kpis = areaGroups[subArea];
                            if (!kpis || kpis.length === 0) return null;
                            return (
                                <div key={`area-${subArea}`}>
                                    <h3 style={{
                                        fontSize: '1rem',
                                        fontWeight: 900,
                                        color: '#64748b',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        marginBottom: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}>
                                        <div style={{ width: '12px', height: '4px', background: '#94a3b8', borderRadius: '2px' }}></div>
                                        {subArea}
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                                        {kpis.map((kpi, idx) => renderKPICard(kpi, idx, kpi.responsable !== currentUser.cargo))}
                                    </div>
                                </div>
                            );
                        })}
                        {/* Render others if any */}
                        {Object.keys(areaGroups).filter(sa => !sortedSubAreas.includes(sa)).map(subArea => (
                            <div key={`area-${subArea}`}>
                                {subArea !== 'General' && <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginBottom: '1.5rem' }}>{subArea}</h3>}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                                    {areaGroups[subArea].map((kpi, idx) => renderKPICard(kpi, idx, kpi.responsable !== currentUser.cargo))}
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
                    mode={editMode}
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
