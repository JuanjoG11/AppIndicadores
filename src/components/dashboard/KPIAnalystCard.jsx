import React from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    AlertCircle,
    Calendar,
    Clock,
    TrendingUp,
    TrendingDown,
    Minus
} from 'lucide-react';
import { getKPIDeadline, checkIsUrgent, checkIsExpired, formatDeadline, formatDateTime } from '../../utils/formatters';
import { BRAND_TO_ENTITY } from '../../utils/kpiHelpers';

const KPIAnalystCard = ({ kpi, currentUser, onEdit, idx, isMonitoring = false }) => {
    const isMine = kpi.responsable === currentUser.cargo;
    let isReady = kpi.hasData;
    let pendingBrandsList = [];

    if (isMine && kpi.meta && typeof kpi.meta === 'object') {
        const entityBrands = Object.keys(kpi.meta).filter(b =>
            (BRAND_TO_ENTITY[b] === currentUser.company || b === currentUser.company) && b !== 'POLAR'
        );
        if (entityBrands.length > 0) {
            pendingBrandsList = entityBrands.filter(brand => {
                const dataKey = `${currentUser.company}-${brand}`;
                return !kpi.brandValues?.[dataKey]?.hasData;
            });
            isReady = pendingBrandsList.length === 0;
        }
    }

    const deadline = getKPIDeadline(kpi.frecuencia);
    const isUrgent = checkIsUrgent(deadline);
    const isExpired = checkIsExpired(deadline) && !isReady;

    // Calculate Trend
    const getTrend = () => {
        if (!kpi.history || kpi.history.length < 2) return null;
        const currentMonthIdx = new Date().getMonth();
        const lastMonthIdx = (currentMonthIdx - 1 + 12) % 12;
        
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const currentVal = kpi.currentValue;
        
        // Find last month value in history
        const lastMonthName = months[lastMonthIdx];
        const historyEntry = kpi.history.find(h => h.month === lastMonthName);
        const lastVal = historyEntry ? historyEntry[currentUser.company] : null;

        if (lastVal === null || lastVal === undefined || lastVal === 0) return null;
        
        const diff = ((currentVal - lastVal) / lastVal) * 100;
        return {
            percent: Math.abs(Math.round(diff * 10) / 10),
            isUp: diff > 0,
            isDown: diff < 0
        };
    };

    const trend = getTrend();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="card premium-shadow"
            style={{
                padding: '1.75rem',
                borderRadius: '24px',
                background: 'var(--bg-card)',
                border: isReady ? '1px solid var(--border-soft)' : '2px dashed var(--border-medium)',
                opacity: isMonitoring && !kpi.hasData ? 0.7 : 1,
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <div style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '10px',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        background: isReady ? 'var(--success-bg)' : 'var(--warning-bg)',
                        color: isReady ? 'var(--success)' : 'var(--warning)',
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
                    <button
                        onClick={() => onEdit(kpi, 'data')}
                        style={{
                            background: isReady ? 'var(--bg-hover)' : 'var(--brand)',
                            color: isReady ? 'var(--text-main)' : 'white',
                            border: 'none',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '10px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isReady ? 'Editar' : 'Cargar'}
                    </button>
                ) : (
                    <div style={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 800, 
                        color: 'var(--text-light)', 
                        textTransform: 'uppercase', 
                        background: 'var(--bg-soft)', 
                        padding: '0.4rem 0.8rem', 
                        borderRadius: '10px' 
                    }}>
                        Lectura
                    </div>
                )}
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem', lineHeight: 1.3, flex: 1 }}>
                {kpi.name}
            </h3>

            {/* Deadline Reminder */}
            {!isReady && isMine && (
                <div style={{
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: isExpired ? 'var(--danger-bg)' : (isUrgent ? 'var(--warning-bg)' : 'var(--bg-soft)'),
                    borderRadius: '16px',
                    border: `1px solid ${isExpired ? 'var(--danger)' : (isUrgent ? 'var(--warning)' : 'var(--border-soft)')}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    boxShadow: isUrgent || isExpired ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={16} color={isExpired ? 'var(--danger)' : (isUrgent ? 'var(--warning)' : 'var(--text-muted)')} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                            {isExpired ? '¡PLAZO VENCIDO!' : 'PLAZO DE CARGA'}
                        </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: isExpired ? 'var(--danger)' : (isUrgent ? 'var(--warning)' : 'var(--text-main)') }}>
                        {formatDeadline(deadline)}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-soft)', padding: '1rem', borderRadius: '16px', marginBottom: '1.25rem' }}>
                <div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-light)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Meta</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                        {kpi.meta && typeof kpi.meta === 'object' ? `${kpi.targetMeta} ${kpi.unit}` : `${kpi.meta} ${kpi.unit}`}
                    </div>
                </div>
                {kpi.hasData && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-light)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Cump.</div>
                        <div style={{
                            fontSize: '0.9rem',
                            fontWeight: 900,
                            color: (kpi.semaphore === 'green' ? 'var(--success)' : (kpi.semaphore === 'red' ? 'var(--danger)' : 'var(--warning)'))
                        }}>
                            {kpi.compliance}%
                        </div>
                    </div>
                )}
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-light)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Actual</div>
                    <div style={{
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: kpi.hasData
                            ? (kpi.semaphore === 'green' ? 'var(--success)' : (kpi.semaphore === 'red' ? 'var(--danger)' : (kpi.semaphore === 'yellow' ? 'var(--warning)' : 'var(--brand)')))
                            : 'var(--border-medium)'
                    }}>
                        {kpi.hasData ? `${kpi.currentValue} ${kpi.unit}` : '--'}
                    </div>
                    {kpi.hasData && trend && (
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'flex-end', 
                            gap: '2px',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            color: trend.isUp ? 'var(--success)' : (trend.isDown ? 'var(--danger)' : 'var(--text-light)')
                        }}>
                            {trend.isUp ? <TrendingUp size={10} /> : (trend.isDown ? <TrendingDown size={10} /> : <Minus size={10} />)}
                            {trend.percent}% vs mes ant.
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Box */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                background: 'var(--bg-soft)',
                padding: '0.75rem',
                borderRadius: '14px',
                border: '1px solid var(--border-soft)'
            }}>
                <div>
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-light)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                        <Clock size={10} style={{ verticalAlign: 'baseline', marginRight: '2px' }} /> Límite
                    </div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: isExpired ? 'var(--danger)' : 'var(--text-main)' }}>
                        {formatDeadline(deadline)}
                    </div>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-soft)', paddingLeft: '0.5rem' }}>
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-light)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                        Act.
                    </div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                        {formatDateTime(kpi.additionalData?.updatedAt)}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default KPIAnalystCard;
