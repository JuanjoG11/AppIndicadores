import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Users, Lock, ChevronLeft } from 'lucide-react';
import Logo from '../components/common/Logo';

const Login = ({ onLogin }) => {
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const roles = [
        { id: 'Gerente', name: 'Gerencia', desc: 'Gerente General - Acceso total', icon: <LayoutGrid size={24} />, companies: ['TYM', 'TAT'], allowedAreas: ['all'], color: '#2563eb' },
        { id: 'LOGISTICA', name: 'Logística', desc: 'Entregas, picking, devoluciones y bodega', icon: <Users size={24} />, companies: ['TYM', 'TAT'], allowedAreas: ['logistica'], color: '#0ea5e9' },
        { id: 'GESTIÓN HUMANA', name: 'Gestión Humana', desc: 'Nómina, horas extras, rotación, ausentismo', icon: <Users size={24} />, companies: ['TYM', 'TAT'], allowedAreas: ['talento-humano'], color: '#8b5cf6' },
        { id: 'CONTABILIDAD', name: 'Contabilidad', desc: 'Gasto de fletes, rentabilidad y cierres', icon: <Users size={24} />, companies: ['TYM', 'TAT'], allowedAreas: ['contabilidad'], color: '#f59e0b' },
        { id: 'INFORMACIÓN/INVENTARIO', name: 'Información/Inventario', desc: 'Picking, fiabilidad y obsolescencia', icon: <Users size={24} />, companies: ['TYM', 'TAT'], allowedAreas: ['administrativo'], color: '#10b981' },
        { id: 'CAJA', name: 'Caja', desc: 'Arqueos de caja y planillas', icon: <Users size={24} />, companies: ['TYM', 'TAT'], allowedAreas: ['caja'], color: '#6366f1' },
        { id: 'CARTERA', name: 'Cartera', desc: 'Rotación de cartera y circulaciones', icon: <Users size={24} />, companies: ['TYM', 'TAT'], allowedAreas: ['cartera'], color: '#f43f5e' },
        { id: 'COMERCIAL', name: 'Comercial', desc: 'Ventas, margen y devoluciones comercial', icon: <Users size={24} />, companies: ['TYM', 'TAT'], allowedAreas: ['comercial'], color: '#ec4899' },
        { id: 'SST', name: 'SST', desc: 'Sistema de Gestión y Auditoría', icon: <Users size={24} />, companies: ['TYM', 'TAT'], allowedAreas: ['talento-humano'], color: '#06b6d4' },
    ];

    const navigate = useNavigate();

    // Dynamic Theme Calculation
    const getActiveColor = () => {
        if (selectedRole) return selectedRole.color;
        if (selectedCompany) return '#38bdf8';
        return '#6366f1';
    };

    const activeColor = getActiveColor();

    const handleRoleSelection = (role) => {
        if (role.id === 'Gerente') {
            setSelectedRole(role);
            setError('');
        } else {
            completeLogin(role);
        }
    };

    const completeLogin = (role) => {
        const user = {
            name: role.name,
            role: role.id === 'Gerente' ? 'Gerente' : 'Analista',
            cargo: role.id,
            company: selectedCompany,
            authorizedAreas: role.allowedAreas
        };
        onLogin(user);
        if (role.id === 'Gerente') {
            navigate('/');
        } else {
            navigate('/mis-indicadores');
        }
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (password === 'admin2026') {
            completeLogin(selectedRole);
        } else {
            setError('Contraseña incorrecta. Por favor intente de nuevo.');
            setPassword('');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, #0f172a 0%, ${activeColor}22 50%, #0f172a 100%)`,
            padding: '2rem',
            transition: 'background 0.8s ease'
        }}>
            <div className="card fade-in" style={{
                maxWidth: selectedRole ? '450px' : '880px',
                width: '100%',
                padding: '3rem',
                borderRadius: '32px',
                background: '#0f172a',
                border: `2px solid ${activeColor}55`,
                color: 'white',
                boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 60px ${activeColor}15`,
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Subtle Accent Glow */}
                <div style={{
                    position: 'absolute',
                    top: '-150px',
                    right: '-150px',
                    width: '300px',
                    height: '300px',
                    background: activeColor,
                    filter: 'blur(100px)',
                    opacity: 0.1,
                    pointerEvents: 'none',
                    transition: 'background 0.8s ease'
                }} />

                <div style={{ textAlign: 'center', marginBottom: '3.5rem', position: 'relative' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '1.5rem',
                        filter: `drop-shadow(0 0 10px ${activeColor}44)`
                    }}>
                        <Logo size="xl" />
                    </div>
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: 950,
                        color: 'white',
                        marginBottom: '0.2rem',
                        letterSpacing: '-0.06em',
                        textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                    }}>
                        ZENTRA
                    </h1>
                    <div style={{
                        display: 'inline-block',
                        padding: '0.25rem 1rem',
                        background: `${activeColor}22`,
                        borderRadius: '100px',
                        border: `1px solid ${activeColor}44`,
                        marginBottom: '2rem'
                    }}>
                        <p style={{
                            color: activeColor,
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.2em',
                            margin: 0
                        }}>
                            Potenciando la Excelencia Operativa
                        </p>
                    </div>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1.1rem', fontWeight: 500 }}>
                        {selectedRole
                            ? `Identidad de ${selectedRole.name}`
                            : (!selectedCompany ? 'Escoge tu organización para continuar' : `Selecciona tu perfil en ${selectedCompany}`)}
                    </p>
                </div>

                {selectedRole ? (
                    <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: activeColor }} size={20} />
                            <input
                                autoFocus
                                type="password"
                                placeholder="Contraseña de Acceso"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '1.25rem 1.25rem 1.25rem 3.5rem',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'all 0.3s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = activeColor;
                                    e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                                    e.target.style.boxShadow = `0 0 15px ${activeColor}22`;
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                        {error && <div style={{ color: '#f43f5e', fontSize: '0.85rem', textAlign: 'center', fontWeight: 600 }}>{error}</div>}

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => { setSelectedRole(null); setPassword(''); setError(''); }}
                                style={{
                                    flex: 1,
                                    padding: '1.1rem',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    background: 'transparent',
                                    color: 'rgba(255,255,255,0.7)',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                Atrás
                            </button>
                            <button
                                type="submit"
                                style={{
                                    flex: 2,
                                    padding: '1.1rem',
                                    borderRadius: '16px',
                                    border: 'none',
                                    background: activeColor,
                                    color: 'white',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    boxShadow: `0 8px 20px -6px ${activeColor}66`,
                                    transition: 'all 0.3s'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = `0 12px 25px -6px ${activeColor}88`;
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = `0 8px 20px -6px ${activeColor}66`;
                                }}
                            >
                                Acceder al Sistema
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        {!selectedCompany ? (
                            <div className="company-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '2.5rem',
                                marginBottom: '1rem'
                            }}>
                                {['TYM', 'TAT'].map((company) => (
                                    <button
                                        key={company}
                                        onClick={() => setSelectedCompany(company)}
                                        style={{
                                            padding: '3rem 1.5rem',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            background: '#1e293b',
                                            borderRadius: '32px',
                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '2rem',
                                            minHeight: '280px'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-8px)';
                                            e.currentTarget.style.background = '#334155';
                                            e.currentTarget.style.borderColor = activeColor;
                                            e.currentTarget.style.boxShadow = `0 15px 30px -5px ${activeColor}44`;
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.background = '#1e293b';
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div style={{
                                            fontSize: 'clamp(3rem, 10vw, 4.5rem)',
                                            fontWeight: 950,
                                            letterSpacing: '-4px',
                                            color: 'white',
                                            lineHeight: 1,
                                            textShadow: '0 4px 20px rgba(0,0,0,0.5)'
                                        }}>
                                            {company}
                                        </div>

                                        <div style={{
                                            fontSize: '0.75rem',
                                            fontWeight: 900,
                                            letterSpacing: '0.3em',
                                            color: 'rgba(255,255,255,0.4)',
                                            textTransform: 'uppercase'
                                        }}>
                                            INGRESAR
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => setSelectedCompany(null)}
                                    style={{
                                        marginBottom: '2rem',
                                        padding: '0.75rem 1.25rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '14px',
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        fontWeight: 700,
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                        transition: 'all 0.2s',
                                        width: 'fit-content'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                                    }}
                                >
                                    <ChevronLeft size={16} /> Cambiar Empresa
                                </button>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                                    gap: '1.25rem',
                                    maxHeight: '480px',
                                    overflowY: 'auto',
                                    paddingRight: '0.5rem',
                                    marginBottom: '1rem'
                                }}>
                                    {roles.map((role) => (
                                        <button
                                            key={role.id}
                                            onClick={() => handleRoleSelection(role)}
                                            style={{
                                                padding: '1.75rem',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                background: '#1e293b',
                                                borderRadius: '24px',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '1rem',
                                                color: 'white',
                                                position: 'relative'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.borderColor = role.color;
                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                                e.currentTarget.style.background = '#334155';
                                                e.currentTarget.style.boxShadow = `0 8px 20px -5px ${role.color}33`;
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.background = '#1e293b';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            <div style={{
                                                width: '44px',
                                                height: '44px',
                                                background: `${role.color}15`,
                                                borderRadius: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: role.color,
                                                transition: 'all 0.3s'
                                            }}>
                                                {role.icon}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, color: 'white', fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                                                    {role.name}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)', lineHeight: '1.5' }}>
                                                    {role.desc}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}

                <div style={{
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.3)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.15em',
                    marginTop: '3rem',
                    fontWeight: 700
                }}>
                    ZENTRA BI &copy; 2026 • TODOS LOS DERECHOS RESERVADOS
                </div>
            </div>
        </div>
    );
};

export default Login;
