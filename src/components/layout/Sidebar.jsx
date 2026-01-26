import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Logo from '../common/Logo';
import { areas } from '../../data/areas';
import {
    Home,
    LogOut,
    Shield,
    X
} from 'lucide-react';

const Sidebar = ({ currentUser, onLogout, isOpen, onClose }) => {
    const location = useLocation();

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && window.innerWidth <= 900 && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 95
                    }}
                />
            )}

            <aside style={{
                width: '260px',
                height: '100vh',
                position: 'fixed',
                left: isOpen ? 0 : '-260px',
                top: 0,
                background: 'var(--bg-sidebar)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 100,
                padding: '2rem 1.25rem',
                color: 'white',
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isOpen ? '20px 0 50px rgba(0,0,0,0.2)' : 'none'
            }}>
                {/* Mobile Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '1rem',
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        display: window.innerWidth <= 900 ? 'block' : 'none',
                        cursor: 'pointer'
                    }}
                >
                    <X size={24} />
                </button>
                {/* BRANDING */}
                <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1rem', paddingLeft: '0.5rem' }}>
                    <Logo size="md" />
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>
                            ZENTRA
                        </h3>
                        <small style={{ fontSize: '0.65rem', color: 'var(--brand-light)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Analytics</small>
                    </div>
                </div>

                {/* NAVIGATION */}
                <nav style={{ flex: 1 }}>
                    <NavLink
                        to="/"
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.85rem 1rem',
                            borderRadius: '12px',
                            fontSize: '0.95rem',
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                            background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            marginBottom: '0.5rem'
                        })}
                    >
                        <Home size={20} />
                        {currentUser.role === 'Gerente' ? 'Inicio' : 'Mis Indicadores'}
                    </NavLink>

                    {currentUser.role === 'Gerente' && (
                        <>
                            <div style={{ padding: '0 0.75rem', marginTop: '2.5rem', marginBottom: '1.25rem' }}>
                                <small style={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Áreas Estratégicas</small>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto', maxHeight: 'calc(100vh - 350px)' }}>
                                {areas.map(area => {
                                    const isActive = location.pathname === `/area/${area.id}`;
                                    return (
                                        <NavLink
                                            key={area.id}
                                            to={`/area/${area.id}`}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                padding: '0.65rem 1rem',
                                                borderRadius: '10px',
                                                fontSize: '0.85rem',
                                                fontWeight: isActive ? 700 : 500,
                                                color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                                                background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                                                textDecoration: 'none',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: area.color }}></div>
                                            {area.name}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </nav>

                {/* FOOTER ACTIONS */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', marginTop: 'auto' }}>
                    <button
                        onClick={onLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.85rem 1rem',
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: '#f87171',
                            cursor: 'pointer',
                            borderRadius: '10px',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                    >
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
