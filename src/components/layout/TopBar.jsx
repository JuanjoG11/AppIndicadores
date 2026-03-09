import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCriticalAlerts } from '../../data/mockData';
import { Bell, Settings, X, CheckCircle2, AlertCircle, LogOut, Menu, Search, Wifi, WifiOff, Command } from 'lucide-react';

const TopBar = ({ currentUser, kpiData, activeCompany, onOpenSettings, onMenuToggle, onLogout, onOpenCommandPalette, lastSyncTime }) => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Get alerts
    const criticalAlerts = kpiData ? getCriticalAlerts(kpiData, activeCompany) : [];
    const trueAlerts = criticalAlerts.filter(a => a.severity === 'critical');
    const hasAlerts = trueAlerts.length > 0;

    const handleAlertClick = (areaId) => {
        navigate(`/area/${areaId}`);
        setShowNotifications(false);
    };

    // Format last sync time
    const syncLabel = lastSyncTime
        ? `Sincronizado ${lastSyncTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`
        : 'Cargando...';

    return (
        <div style={{
            height: '60px',
            background: 'var(--bg-app)',
            borderBottom: '1px solid var(--border-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            position: 'sticky',
            top: 0,
            zIndex: 50,
        }}>
            {/* Left Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={onMenuToggle}
                    style={{
                        background: 'none', border: 'none', padding: '4px',
                        cursor: 'pointer', color: 'var(--text-main)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '8px', transition: 'background 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseOut={e => e.currentTarget.style.background = 'none'}
                >
                    <Menu size={22} />
                </button>

                <span className="breadcrumb-text" style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <span style={{ opacity: 0.5 }}>Plataforma</span> <span style={{ margin: '0 0.5rem' }}>/</span>
                    <span style={{ color: '#38bdf8' }}>
                        Consola de Mando {currentUser?.role === 'Gerente' ? `${activeCompany || 'TYM'}` : 'Analista'}
                    </span>
                </span>

                {/* Sync indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {lastSyncTime
                        ? <Wifi size={13} color="#10b981" />
                        : <WifiOff size={13} color="#f59e0b" />
                    }
                    <span style={{ fontSize: '0.65rem', color: lastSyncTime ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                        {syncLabel}
                    </span>
                </div>
            </div>

            {/* Right section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>



                {/* Notifications Bell (Only for Gerente) */}
                {currentUser?.role === 'Gerente' && (
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                            style={{
                                position: 'relative', cursor: 'pointer',
                                background: hasAlerts ? '#fef2f2' : 'none',
                                border: hasAlerts ? '1px solid #fecaca' : 'none',
                                padding: '8px', display: 'flex',
                                color: hasAlerts ? '#ef4444' : 'var(--text-muted)',
                                borderRadius: '10px',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={e => e.currentTarget.style.background = hasAlerts ? '#fee2e2' : 'var(--bg-hover)'}
                            onMouseOut={e => e.currentTarget.style.background = hasAlerts ? '#fef2f2' : 'none'}
                        >
                            <Bell size={20} />
                            {hasAlerts && (
                                <span style={{
                                    position: 'absolute', top: '4px', right: '4px',
                                    width: '10px', height: '10px',
                                    background: '#ef4444', borderRadius: '50%',
                                    border: '2px solid var(--bg-app)',
                                    animation: 'pulse-danger 2s ease-in-out infinite',
                                }} />
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <>
                                <div onClick={() => setShowNotifications(false)} style={{ position: 'fixed', inset: 0, zIndex: 99000 }} />
                                <div style={{
                                    position: 'fixed', top: '70px', right: '20px',
                                    width: '360px', maxHeight: 'calc(100vh - 120px)',
                                    zIndex: 99001,
                                    background: 'var(--bg-card)',
                                    borderRadius: '20px',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px var(--border-soft)',
                                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                                    animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                }}>
                                    {/* Panel Header */}
                                    <div style={{
                                        padding: '1rem 1.25rem',
                                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                        color: 'white',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <Bell size={16} />
                                            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Alertas KPI</span>
                                            {hasAlerts && (
                                                <span style={{ background: '#ef4444', color: 'white', fontSize: '0.6rem', fontWeight: 900, padding: '0.1rem 0.4rem', borderRadius: '6px' }}>
                                                    {trueAlerts.length}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setShowNotifications(false)}
                                            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    {/* Panel Content */}
                                    <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', background: 'var(--bg-soft)' }} className="custom-scrollbar">
                                        {!hasAlerts ? (
                                            <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                                                <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
                                                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Sin alertas críticas</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Todo está bajo control.</p>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {trueAlerts.map((alert, idx) => (
                                                    <div
                                                        key={`alert-${idx}`}
                                                        onClick={() => handleAlertClick(alert.area)}
                                                        style={{
                                                            background: 'var(--bg-card)', padding: '0.875rem',
                                                            borderRadius: '12px', border: '1px solid var(--border-soft)',
                                                            borderLeft: '3px solid #ef4444',
                                                            cursor: 'pointer', transition: 'all 0.2s',
                                                        }}
                                                        onMouseOver={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                                                        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-soft)'; e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                                                            <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-main)' }}>
                                                                {alert.kpiName}
                                                            </span>
                                                            <span style={{ fontSize: '0.6rem', fontWeight: 900, background: '#fee2e2', color: '#ef4444', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                                                CRÍTICO
                                                            </span>
                                                        </div>
                                                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
                                                            {alert.message}
                                                        </p>
                                                        {alert.currentValue !== undefined && (
                                                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem' }}>
                                                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#ef4444', background: '#fef2f2', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                                                    Actual: {alert.currentValue}{alert.unit === '%' ? '%' : ''}
                                                                </span>
                                                                {alert.meta && (
                                                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                                                        Meta: {alert.meta}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div style={{ padding: '0.6rem 0.75rem', background: 'var(--bg-card)', borderTop: '1px solid var(--border-soft)' }}>
                                        <button
                                            onClick={() => setShowNotifications(false)}
                                            style={{
                                                width: '100%', padding: '0.5rem', fontSize: '0.75rem', fontWeight: 800,
                                                color: 'var(--text-muted)', background: 'var(--bg-soft)',
                                                border: '1px solid var(--border-soft)', borderRadius: '10px',
                                                cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.02em',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseOver={e => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.color = 'white'; }}
                                            onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-soft)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                        >
                                            Cerrar Panel
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Settings Icon (Only for Gerente) */}
                {currentUser?.role === 'Gerente' && (
                    <button
                        style={{
                            cursor: 'pointer', background: 'none', border: 'none',
                            color: 'var(--text-muted)', padding: '8px', borderRadius: '10px',
                            display: 'flex', alignItems: 'center', transition: 'all 0.2s',
                        }}
                        onClick={onOpenSettings}
                        title="Configuración"
                        onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                        <Settings size={20} />
                    </button>
                )}

                {/* User Profile with Dropdown */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.35rem 0.75rem 0.35rem 0.5rem',
                            borderRadius: '12px', border: '1px solid var(--border-soft)',
                            background: 'var(--bg-card)', cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                        onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-soft)'}
                    >
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'var(--brand-bg)', color: 'var(--brand)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '0.85rem',
                            border: '2px solid var(--brand)',
                        }}>
                            {currentUser.name.charAt(0)}
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>{currentUser.name}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>{currentUser.role}</div>
                        </div>
                    </button>

                    {showUserMenu && (
                        <>
                            <div onClick={() => setShowUserMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 99000 }} />
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                                background: 'var(--bg-card)',
                                borderRadius: '16px', minWidth: '200px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.12), 0 0 0 1px var(--border-soft)',
                                zIndex: 99001, overflow: 'hidden',
                                animation: 'slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            }}>
                                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-soft)', background: 'var(--bg-soft)' }}>
                                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>{currentUser.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{currentUser.cargo}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--brand)', marginTop: '0.2rem', fontWeight: 600 }}>{currentUser.company}</div>
                                </div>
                                <div style={{ padding: '0.5rem' }}>
                                    <button
                                        onClick={() => { onLogout(); setShowUserMenu(false); }}
                                        style={{
                                            width: '100%', padding: '0.75rem 1rem',
                                            background: 'none', border: 'none',
                                            borderRadius: '10px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            fontSize: '0.875rem', fontWeight: 600, color: '#ef4444',
                                            transition: 'background 0.15s', textAlign: 'left',
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = '#fef2f2'}
                                        onMouseOut={e => e.currentTarget.style.background = 'none'}
                                    >
                                        <LogOut size={16} />
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopBar;
