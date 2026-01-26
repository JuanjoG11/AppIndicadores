import React, { useState, useEffect } from 'react';
import { Bell, User, LogOut, CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';
import Logo from '../common/Logo';

const Header = ({ kpiData, currentUser, onLogout }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [alerts, setAlerts] = useState({ critical: [], warning: [] });

    // Generate real-time alerts based on KPI status
    useEffect(() => {
        if (!kpiData) return;

        // User requested STRICT Red/Green logic. 
        // Treating anything NOT Green (i.e., Red or Yellow) as a Critical Alert (Red).
        const critical = kpiData.filter(k => k.semaphore !== 'green').map(k => ({
            id: k.id,
            kpiName: k.name,
            value: k.currentValue,
            meta: typeof k.meta === 'object' && k.brandValues ? k.brandValues.currentMeta : (typeof k.meta === 'number' ? k.meta : 0),
            unit: k.unit,
            // If it was yellow (close to meta), we still mark it as Critical per user request for binary Green/Red
            message: k.semaphore === 'yellow' ? 'Atención: Desempeño por debajo de la meta' : 'Crítico: Desempeño deficiente'
        }));

        setAlerts({ critical, warning: [] }); // No warnings, only Critical (Red) or OK (Green)
    }, [kpiData]);

    const totalAlerts = alerts.critical.length;

    return (
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-white/20 shadow-sm"
            style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(226, 232, 240, 0.8)'
            }}>
            <div className="flex items-center justify-between px-6 py-3">
                {/* Logo & Title */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <Logo size="md" className="transition-transform duration-500 hover:rotate-[360deg]" />
                        <div>
                            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-tight">
                                ZENTRA
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Analytics
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Notifications Button */}
                    <div className="relative z-50 cursor-pointer pointer-events-auto border-4 border-red-600 rounded-full">
                        <button
                            className={`relative p-2.5 rounded-xl transition-all duration-300 ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                // console.log('Bell clicked!');
                                // window.alert('DEBUG: Click detectado!'); 
                                setShowNotifications(prev => !prev);
                            }}
                        >
                            <Bell size={20} strokeWidth={showNotifications ? 2.5 : 2} />
                            {totalAlerts > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm border border-white">
                                    {totalAlerts}
                                </span>
                            )}
                        </button>

                        {/* Notifications Panel - Clean & Professional */}
                        {showNotifications && (
                            <div
                                style={{
                                    position: 'fixed',
                                    top: '70px',
                                    right: '20px',
                                    width: '400px',
                                    maxHeight: '600px',
                                    background: '#ffffff',
                                    zIndex: 99999,
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                    border: '1px solid #e5e7eb'
                                }}
                            >
                                {/* Header */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    padding: '20px',
                                    color: 'white'
                                }}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-lg">Notificaciones</h3>
                                            {totalAlerts > 0 && (
                                                <p className="text-sm text-white/90 mt-1">
                                                    {totalAlerts} {totalAlerts === 1 ? 'alerta' : 'alertas'} activas
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowNotifications(false); }}
                                            className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="overflow-y-auto" style={{
                                    flex: 1,
                                    background: '#f9fafb',
                                    padding: totalAlerts === 0 ? '40px 20px' : '16px'
                                }}>
                                    {totalAlerts === 0 ? (
                                        <div className="flex flex-col items-center justify-center text-center py-8">
                                            <div style={{
                                                width: '80px',
                                                height: '80px',
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: '16px'
                                            }}>
                                                <CheckCircle2 size={40} color="white" strokeWidth={2.5} />
                                            </div>
                                            <h4 className="font-bold text-slate-800 text-lg mb-2">Todo en orden</h4>
                                            <p className="text-sm text-slate-500">
                                                No hay alertas en este momento
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {alerts.critical.map((alert, idx) => (
                                                <div
                                                    key={`crit-${idx}`}
                                                    style={{
                                                        background: 'white',
                                                        borderRadius: '12px',
                                                        padding: '16px',
                                                        border: '1px solid #fee2e2',
                                                        borderLeft: '4px solid #ef4444',
                                                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                                                    }}
                                                    className="hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex gap-3">
                                                        {/* Icon */}
                                                        <div style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            background: '#fef2f2',
                                                            borderRadius: '10px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0
                                                        }}>
                                                            <AlertCircle size={24} color="#ef4444" strokeWidth={2.5} />
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                                <h4 className="font-bold text-slate-900 text-sm">
                                                                    {alert.kpiName}
                                                                </h4>
                                                                <span style={{
                                                                    background: '#ef4444',
                                                                    color: 'white',
                                                                    fontSize: '10px',
                                                                    fontWeight: '700',
                                                                    padding: '4px 8px',
                                                                    borderRadius: '6px',
                                                                    whiteSpace: 'nowrap'
                                                                }}>
                                                                    CRÍTICO
                                                                </span>
                                                            </div>

                                                            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                                                                {alert.message}
                                                            </p>

                                                            <div className="flex flex-wrap gap-2">
                                                                <div style={{
                                                                    background: '#f1f5f9',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '8px',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px'
                                                                }}>
                                                                    <span className="text-xs font-semibold text-slate-500">
                                                                        Actual:
                                                                    </span>
                                                                    <span className="text-sm font-bold text-slate-900">
                                                                        {alert.value}{alert.unit}
                                                                    </span>
                                                                </div>
                                                                {alert.meta !== undefined && alert.meta !== 0 && (
                                                                    <div style={{
                                                                        background: '#eff6ff',
                                                                        padding: '6px 12px',
                                                                        borderRadius: '8px',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '6px'
                                                                    }}>
                                                                        <span className="text-xs font-semibold text-blue-600">
                                                                            Meta:
                                                                        </span>
                                                                        <span className="text-sm font-bold text-blue-900">
                                                                            {alert.meta}{alert.unit}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                {totalAlerts > 0 && (
                                    <div style={{
                                        padding: '16px',
                                        borderTop: '1px solid #e5e7eb',
                                        background: 'white'
                                    }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowNotifications(false); }}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                background: '#3b82f6',
                                                color: 'white',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                            className="hover:bg-blue-600 transition-colors"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="relative border-l border-slate-200 pl-3 ml-1">
                        <button
                            className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                    {currentUser?.name || 'Usuario'}
                                </div>
                                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                    {currentUser?.role || 'Invitado'}
                                </div>
                            </div>
                            <div className="w-9 h-9 bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                                {currentUser?.avatar ? (
                                    <img src={currentUser.avatar} alt="user" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={18} strokeWidth={2.5} />
                                )}
                            </div>
                        </button>

                        {showUserMenu && (
                            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-slate-100 animate-slide-up-fade overflow-hidden z-50">
                                <div className="p-2">
                                    <button
                                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                        onClick={onLogout}
                                    >
                                        <LogOut size={16} strokeWidth={2.5} />
                                        <span className="text-sm font-bold">Cerrar sesión</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
