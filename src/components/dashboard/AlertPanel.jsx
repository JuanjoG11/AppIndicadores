import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { getCriticalAlerts, getWarningAlerts } from '../../data/mockData';
import { formatKPIValue, formatPercent } from '../../utils/formatters';
import { areas } from '../../data/areas';

const AlertPanel = ({ kpiData }) => {
    const navigate = useNavigate();
    const criticalAlerts = getCriticalAlerts(kpiData);
    const warningAlerts = getWarningAlerts(kpiData).slice(0, 3); // Top 3 warnings

    const getAreaName = (areaId) => {
        return areas.find(a => a.id === areaId)?.name || areaId;
    };

    return (
        <div className="card fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-soft)', paddingBottom: '1rem' }}>
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>🔔</span> Alertas Proactivas
                </h3>
            </div>

            <div className="card-body" style={{ flex: 1, overflowY: 'auto', maxHeight: '500px', paddingRight: '0.5rem' }}>
                {criticalAlerts.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <AlertCircle style={{ color: 'var(--danger)' }} size={18} />
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Crítico
                            </h4>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {criticalAlerts.map((alert, idx) => (
                                <div key={alert.id}
                                    className="animate-slide-up"
                                    onClick={() => navigate(`/area/${alert.area}`)}
                                    style={{
                                        padding: '1rem',
                                        background: 'var(--danger-bg)',
                                        borderLeft: '4px solid var(--danger)',
                                        borderRadius: 'var(--radius-sm)',
                                        animationDelay: `${idx * 0.1}s`,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={e => {
                                        e.currentTarget.style.transform = 'translateX(5px)';
                                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.transform = 'translateX(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <div>
                                            <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brand)', margin: 0 }}>{alert.kpiName}</h5>
                                            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{getAreaName(alert.area)}</small>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', margin: '0.5rem 0' }}>{alert.message}</p>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                        <div style={{ fontSize: '0.75rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Actual: </span>
                                            <strong style={{ color: 'var(--danger)' }}>{formatKPIValue(alert.currentValue, alert.unit)}</strong>
                                        </div>
                                        <div style={{ fontSize: '0.75rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Meta: </span>
                                            <strong style={{ color: 'var(--brand)' }}>{formatKPIValue(alert.meta, alert.unit)}</strong>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {warningAlerts.length > 0 && (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <AlertTriangle style={{ color: 'var(--warning)' }} size={18} />
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Atención
                            </h4>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {warningAlerts.map((alert, idx) => (
                                <div key={alert.id}
                                    className="animate-slide-up"
                                    onClick={() => navigate(`/area/${alert.area}`)}
                                    style={{
                                        padding: '1rem',
                                        background: 'var(--warning-bg)',
                                        borderLeft: '4px solid var(--warning)',
                                        borderRadius: 'var(--radius-sm)',
                                        animationDelay: `${(criticalAlerts.length + idx) * 0.1}s`,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={e => {
                                        e.currentTarget.style.transform = 'translateX(5px)';
                                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.transform = 'translateX(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--brand)', margin: 0 }}>{alert.kpiName}</h5>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                                        <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{getAreaName(alert.area)}</small>
                                        <strong style={{ fontSize: '0.8rem', color: 'var(--warning)' }}>{formatKPIValue(alert.currentValue, alert.unit)}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {criticalAlerts.length === 0 && warningAlerts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
                        <h4 style={{ fontWeight: 700, color: 'var(--success)', marginBottom: '0.5rem' }}>¡Todo despejado!</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No hay alertas críticas en este momento. Sigue así.</p>
                    </div>
                )}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-soft)', textAlign: 'center' }}>
                <button className="btn btn-ghost" style={{ width: '100%', fontSize: '0.75rem' }}>
                    Ver Historial de Alertas
                </button>
            </div>
        </div>
    );
};

export default AlertPanel;
