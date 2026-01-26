import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCriticalAlerts } from '../../data/mockData';
import { Bell, Settings, User, X, CheckCircle2, AlertCircle, LogOut, Menu } from 'lucide-react';

const TopBar = ({ currentUser, kpiData, activeCompany, onOpenSettings, onMenuToggle, onLogout }) => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Get alerts
    const criticalAlerts = kpiData ? getCriticalAlerts(kpiData) : [];
    const hasAlerts = criticalAlerts.length > 0;

    const handleAlertClick = (areaId) => {
        navigate(`/area/${areaId}`);
        setShowNotifications(false);
    };

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
            zIndex: 50 // Increased z-index for dropdown
        }}>
            {/* Left Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={onMenuToggle}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px',
                        cursor: 'pointer',
                        color: 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Menu size={24} />
                </button>
                <span className="breadcrumb-text" style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <span style={{ opacity: 0.5 }}>Plataforma</span> <span style={{ margin: '0 0.5rem' }}>/</span>
                    <span style={{ color: '#38bdf8' }}>
                        Consola de Mando {currentUser?.role === 'Gerente' ? `${activeCompany || 'TYM'}` : 'Analista'}
                    </span>
                </span>
            </div>

            {/* Right side - User info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>

                {/* Notifications Bell (Only for Gerente) */}
                {currentUser?.role === 'Gerente' && (
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            style={{ position: 'relative', cursor: 'pointer', background: 'none', border: 'none', padding: '8px', display: 'flex' }}
                            className="hover:bg-slate-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
                        >
                            <Bell size={20} className="text-slate-600" />
                            {hasAlerts && (
                                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div
                                style={{
                                    position: 'fixed',
                                    top: '70px',
                                    right: '20px',
                                    width: '340px',
                                    maxHeight: 'calc(100vh - 120px)',
                                    zIndex: 100000,
                                    background: 'white',
                                    borderRadius: '20px',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                    animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                                }}
                            >
                                {/* Panel Header */}
                                <div style={{
                                    padding: '1rem 1.25rem',
                                    background: '#1e293b',
                                    color: 'white',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexShrink: 0
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <Bell size={16} />
                                        <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Notificaciones</span>
                                    </div>
                                    <button
                                        onClick={() => setShowNotifications(false)}
                                        style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            border: 'none',
                                            color: 'white',
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Panel Content */}
                                <div style={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    padding: '0.75rem',
                                    background: '#f8fafc'
                                }}>
                                    {!hasAlerts ? (
                                        <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                                            <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
                                            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>Sin alertas</p>
                                            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Todo está bajo control.</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {criticalAlerts.map((alert, idx) => (
                                                <div
                                                    key={`alert-${idx}`}
                                                    onClick={() => handleAlertClick(alert.area)}
                                                    style={{
                                                        background: 'white',
                                                        padding: '0.75rem',
                                                        borderRadius: '12px',
                                                        border: '1px solid #e2e8f0',
                                                        borderLeft: '3px solid #ef4444',
                                                        display: 'flex',
                                                        gap: '0.75rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={e => {
                                                        e.currentTarget.style.borderColor = '#ef4444';
                                                        e.currentTarget.style.background = '#fef2f2';
                                                        e.currentTarget.style.transform = 'translateX(4px)';
                                                    }}
                                                    onMouseOut={e => {
                                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                                        e.currentTarget.style.background = 'white';
                                                        e.currentTarget.style.transform = 'translateX(0)';
                                                    }}
                                                >
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                                                            <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {alert.kpiName}
                                                            </span>
                                                            <span style={{ fontSize: '0.6rem', fontWeight: 900, background: '#fee2e2', color: '#ef4444', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>ALERTA</span>
                                                        </div>
                                                        <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.3, marginBottom: '0.4rem' }}>
                                                            {alert.message}
                                                        </p>
                                                        <div style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 800, color: '#ef4444', background: '#fef2f2', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                                                            Valor: {alert.currentValue}{alert.unit === '%' ? '%' : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Panel Footer */}
                                <div style={{ padding: '0.6rem 0.75rem', background: 'white', borderTop: '1px solid #f1f5f9' }}>
                                    <button
                                        onClick={() => setShowNotifications(false)}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            fontSize: '0.75rem',
                                            fontWeight: 800,
                                            color: '#64748b',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.02em'
                                        }}
                                        onMouseOver={e => {
                                            e.currentTarget.style.background = '#0f172a';
                                            e.currentTarget.style.color = 'white';
                                        }}
                                        onMouseOut={e => {
                                            e.currentTarget.style.background = '#f8fafc';
                                            e.currentTarget.style.color = '#64748b';
                                        }}
                                    >
                                        Cerrar Panel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Settings Icon */}
                <div
                    style={{ cursor: 'pointer', opacity: 0.6 }}
                    className="hover:opacity-100 transition-opacity"
                    onClick={onOpenSettings}
                >
                    <Settings size={20} className="text-slate-600" />
                </div>

                {/* User Profile */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer'
                }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>{currentUser.name}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>{currentUser.role}</div>
                    </div>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--brand-bg)',
                        color: 'var(--brand)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        border: '1px solid var(--brand-light)'
                    }}>
                        {currentUser.avatar ? (
                            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                            currentUser.name.charAt(0)
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
