import React, { useState } from 'react';
import { Bell, User, LogOut, Menu, X } from 'lucide-react';
import { getCriticalAlerts, getWarningAlerts } from '../../data/mockData';

const Header = ({ kpiData, currentUser, onLogout }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const criticalAlerts = getCriticalAlerts(kpiData);
    const warningAlerts = getWarningAlerts(kpiData);
    const totalAlerts = criticalAlerts.length + warningAlerts.length;

    return (
        <header className="bg-primary sticky top-0 z-50" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                            <span className="text-2xl">📊</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Sistema de Gestión KPI</h1>
                            <p className="text-xs text-white opacity-80">TYM/TAT 2026</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <div className="relative">
                        <button
                            className="relative p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell size={20} />
                            {totalAlerts > 0 && (
                                <span className="absolute -top-1 -right-1 bg-danger-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                    {totalAlerts}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 animate-fade-in">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="font-semibold text-primary">Notificaciones</h3>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {criticalAlerts.map(alert => (
                                        <div key={alert.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                                            <div className="flex items-start gap-2">
                                                <span className="text-danger-500">🔴</span>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-primary">{alert.kpiName}</p>
                                                    <p className="text-xs text-secondary mt-1">{alert.message}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {warningAlerts.map(alert => (
                                        <div key={alert.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                                            <div className="flex items-start gap-2">
                                                <span className="text-warning-500">🟡</span>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-primary">{alert.kpiName}</p>
                                                    <p className="text-xs text-secondary mt-1">{alert.message}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            className="flex items-center gap-2 px-3 py-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <div className="w-8 h-8 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                                <User size={16} />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-semibold">{currentUser.name}</div>
                                <div className="text-xs opacity-80">{currentUser.role}</div>
                            </div>
                        </button>

                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 animate-fade-in">
                                <button
                                    className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-50 text-danger-600"
                                    onClick={onLogout}
                                >
                                    <LogOut size={16} />
                                    <span className="text-sm font-medium">Cerrar sesión</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
