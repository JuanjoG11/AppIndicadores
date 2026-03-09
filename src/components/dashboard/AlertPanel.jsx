import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, AlertTriangle, TrendingDown, TrendingUp, Clock, Zap } from 'lucide-react';
import { getCriticalAlerts, getWarningAlerts } from '../../data/mockData';
import { formatKPIValue } from '../../utils/formatters';
import { areas } from '../../data/areas';

/**
 * AlertPanel – Panel de alertas proactivas mejorado.
 * Ahora incluye análisis contextual de tendencias basado en el historial.
 */
const AlertPanel = ({ kpiData, activeCompany = 'TYM' }) => {
    const navigate = useNavigate();
    const criticalAlerts = getCriticalAlerts(kpiData, activeCompany).filter(a => a.severity === 'critical');
    const warningAlerts = getWarningAlerts(kpiData, activeCompany).slice(0, 4);

    const getAreaName = (areaId) => areas.find(a => a.id === areaId)?.name || areaId;

    /**
     * Analiza la tendencia de un KPI basado en su historial.
     * Retorna: 'improving' | 'declining' | 'stable' | null
     */
    const getTrend = (kpiId) => {
        const kpi = kpiData.find(k => k.id === kpiId);
        if (!kpi || !kpi.history) return null;

        const filled = kpi.history.filter(h => h[activeCompany] !== null && h[activeCompany] !== undefined);
        if (filled.length < 2) return null;

        const recent = filled.slice(-2);
        const prev = recent[0][activeCompany];
        const curr = recent[1][activeCompany];
        const delta = ((curr - prev) / (Math.abs(prev) || 1)) * 100;

        if (delta > 3) return 'improving';
        if (delta < -3) return 'declining';
        return 'stable';
    };

    /**
     * Genera un insight de texto basado en el cumplimiento actual.
     */
    const getInsight = (alert) => {
        const trend = getTrend(alert.id);
        if (alert.compliance !== undefined) {
            const gap = 100 - (alert.compliance || 0);
            if (trend === 'declining') return `↘ Tendencia a la baja – brecha del ${gap}% con la meta`;
            if (trend === 'improving') return `↗ Mejorando – a ${gap}% de cumplir la meta`;
        }
        return `Requiere acción inmediata`;
    };

    // Insights adicionales: KPIs en riesgo de caer a rojo (amarillos con tendencia negativa)
    const atRiskKPIs = useMemo(() => {
        return kpiData.filter(k => {
            if (k.semaphore !== 'yellow' || !k.hasData) return false;
            const trend = getTrend(k.id);
            return trend === 'declining';
        }).slice(0, 3);
    }, [kpiData, activeCompany]);

    return (
        <div className="card fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-soft)', paddingBottom: '1rem' }}>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={16} color="var(--warning)" />
                    Alertas Proactivas
                </h3>
                <div style={{
                    fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)',
                    background: 'var(--bg-soft)', padding: '0.2rem 0.6rem', borderRadius: '6px',
                }}>
                    {criticalAlerts.length + warningAlerts.length} activas
                </div>
            </div>

            <div className="card-body custom-scrollbar" style={{ flex: 1, overflowY: 'auto', maxHeight: '500px', paddingRight: '0.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Critical Alerts */}
                {criticalAlerts.length > 0 && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                            <AlertCircle style={{ color: 'var(--danger)' }} size={16} />
                            <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Crítico ({criticalAlerts.length})
                            </h4>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                            {criticalAlerts.map((alert, idx) => {
                                const trend = getTrend(alert.id);
                                return (
                                    <div
                                        key={alert.id}
                                        className="animate-slide-up"
                                        onClick={() => navigate(`/area/${alert.area}`)}
                                        style={{
                                            padding: '0.875rem',
                                            background: 'var(--danger-bg)',
                                            borderLeft: '3px solid var(--danger)',
                                            borderRadius: 'var(--radius-sm)',
                                            animationDelay: `${idx * 0.08}s`,
                                            cursor: 'pointer', transition: 'all 0.2s ease',
                                        }}
                                        onMouseOver={e => { e.currentTarget.style.transform = 'translateX(5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                                        onMouseOut={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                                            <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, flex: 1, marginRight: '0.5rem' }}>
                                                {alert.kpiName}
                                            </h5>
                                            {trend === 'declining' && <TrendingDown size={14} color="var(--danger)" />}
                                            {trend === 'improving' && <TrendingUp size={14} color="var(--success)" />}
                                        </div>
                                        <small style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{getAreaName(alert.area)}</small>
                                        <p style={{ fontSize: '0.72rem', color: 'var(--text-main)', margin: '0.4rem 0', lineHeight: 1.4 }}>
                                            {getInsight(alert)}
                                        </p>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            {alert.currentValue !== undefined && (
                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--danger)', background: '#fee2e229', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                                    Actual: {formatKPIValue(alert.currentValue, alert.unit)}
                                                </span>
                                            )}
                                            {alert.meta !== undefined && (
                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--brand)', background: '#dbeafe29', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                                    Meta: {formatKPIValue(alert.meta, alert.unit)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Warning Alerts */}
                {warningAlerts.length > 0 && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                            <AlertTriangle style={{ color: 'var(--warning)' }} size={16} />
                            <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Atención ({warningAlerts.length})
                            </h4>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {warningAlerts.map((alert, idx) => (
                                <div
                                    key={alert.id}
                                    className="animate-slide-up"
                                    onClick={() => navigate(`/area/${alert.area}`)}
                                    style={{
                                        padding: '0.75rem', background: 'var(--warning-bg)',
                                        borderLeft: '3px solid var(--warning)', borderRadius: 'var(--radius-sm)',
                                        animationDelay: `${(criticalAlerts.length + idx) * 0.08}s`,
                                        cursor: 'pointer', transition: 'all 0.2s ease',
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.transform = 'translateX(5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                                    onMouseOut={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h5 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{alert.kpiName}</h5>
                                        <strong style={{ fontSize: '0.8rem', color: 'var(--warning)' }}>
                                            {alert.currentValue !== undefined ? formatKPIValue(alert.currentValue, alert.unit) : '...'}
                                        </strong>
                                    </div>
                                    <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{getAreaName(alert.area)}</small>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* "At Risk" section: yellow KPIs with declining trend */}
                {atRiskKPIs.length > 0 && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                            <Clock size={14} color="#8b5cf6" />
                            <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                En Riesgo (tendencia ↘)
                            </h4>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {atRiskKPIs.map((kpi) => (
                                <div
                                    key={kpi.id}
                                    onClick={() => navigate(`/area/${kpi.area}`)}
                                    style={{
                                        padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                                        background: '#f5f3ff', borderLeft: '3px solid #8b5cf6',
                                        cursor: 'pointer', transition: 'all 0.2s',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'translateX(4px)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'translateX(0)'}
                                >
                                    <div>
                                        <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>{kpi.name}</h5>
                                        <small style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>{getAreaName(kpi.area)}</small>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#8b5cf6' }}>
                                        <TrendingDown size={14} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{kpi.compliance}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* All clear */}
                {criticalAlerts.length === 0 && warningAlerts.length === 0 && atRiskKPIs.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
                        <h4 style={{ fontWeight: 700, color: 'var(--success)', marginBottom: '0.5rem' }}>¡Todo despejado!</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No hay alertas críticas. Sigue así.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertPanel;
