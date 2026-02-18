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
        { id: 'Gerente', name: 'Gerencia', desc: 'Gerente General - Acceso total', icon: <LayoutGrid size={24} />, companies: ['TYM', 'TAT'], allowedAreas: ['all'] },
        { id: 'LOGISTICA', name: 'Logística', desc: 'Entregas, picking, devoluciones y bodega', icon: <Users size={24} />, companies: ['TYM', 'TAT'], allowedAreas: ['logistica'] },
        { id: 'GESTIÓN HUMANA', name: 'Gestión Humana', desc: 'Nómina, horas extras, rotación, ausentismo', icon: <Users size={24} />, companies: ['TYM', 'TAT'], allowedAreas: ['talento-humano'] },
        { id: 'CONTABILIDAD', name: 'Contabilidad', desc: 'Gasto de fletes, rentabilidad y cierres', icon: <Users size={24} />, companies: ['TYM', 'TAT'], allowedAreas: ['contabilidad', 'logistica'] },
        { id: 'INFORMACIÓN/INVENTARIO', name: 'Información/Inventario', desc: 'Picking, fiabilidad y obsolescencia', icon: <Users size={24} />, companies: ['TYM', 'TAT'], allowedAreas: ['logistica', 'administrativo'] },
        { id: 'CAJA', name: 'Caja', desc: 'Arqueos de caja y planillas', icon: <Users size={24} />, companies: ['TYM', 'TAT'], allowedAreas: ['caja'] },
        { id: 'CARTERA', name: 'Cartera', desc: 'Rotación de cartera y circulaciones', icon: <Users size={24} />, companies: ['TYM', 'TAT'], allowedAreas: ['cartera'] },
        { id: 'COORDINADOR POR MARCA', name: 'Coordinador por Marca', desc: 'Ventas, margen y devoluciones comercial', icon: <Users size={24} />, companies: ['TYM', 'TAT'], allowedAreas: ['comercial'] },
        { id: 'SST', name: 'SST', desc: 'Sistema de Gestión y Auditoría', icon: <Users size={24} />, companies: ['TYM', 'TAT'], allowedAreas: ['talento-humano'] },
    ];

    const navigate = useNavigate();

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
        // Contraseña genérica profesional solicitada: admin2026
        if (password === 'admin2026') {
            completeLogin(selectedRole);
        } else {
            setError('Contraseña incorrecta. Por favor intente de nuevo.');
            setPassword('');
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '2rem'
        }}>
            <div className="card fade-in login-card-inner" style={{
                maxWidth: selectedRole ? '450px' : '800px', width: '100%', padding: '2.5rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', borderRadius: '24px',
                background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white',
                margin: '1rem'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <Logo size="xl" />
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 950, color: 'white', marginBottom: '0.2rem', letterSpacing: '-0.05em' }}>
                        ZENTRA
                    </h1>
                    <p style={{ color: 'var(--brand-light, #38bdf8)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '2rem', opacity: 0.9 }}>
                        Potenciando la Excelencia Operativa
                    </p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1rem' }}>
                        {selectedRole
                            ? `Ingrese la clave de ${selectedRole.name}`
                            : (!selectedCompany ? 'Seleccione su empresa para comenzar' : `Seleccione su cargo en ${selectedCompany}`)}
                    </p>
                </div>

                {/* Password Form for Manager */}
                {selectedRole ? (
                    <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.4)' }} size={20} />
                            <input
                                autoFocus
                                type="password"
                                placeholder="Contraseña de Gerencia"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '1rem 1rem 1rem 3rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                            />
                        </div>
                        {error && <div style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>{error}</div>}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => { setSelectedRole(null); setPassword(''); setError(''); }}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    background: 'transparent',
                                    color: 'white',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                style={{
                                    flex: 2,
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: 'var(--brand, #2563eb)',
                                    color: 'white',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                                }}
                            >
                                Entrar al Dashboard
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        {/* Company Selection */}
                        {!selectedCompany ? (
                            <div className="company-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '2rem',
                                marginBottom: '2rem'
                            }}>
                                {['TYM', 'TAT'].map((company) => (
                                    <button
                                        key={company}
                                        onClick={() => setSelectedCompany(company)}
                                        style={{
                                            padding: window.innerWidth <= 600 ? '2rem' : '4rem 2rem',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            borderRadius: '24px',
                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '1rem'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                            e.currentTarget.style.borderColor = 'var(--brand, #2563eb)';
                                            e.currentTarget.style.boxShadow = '0 20px 40px -12px rgba(37, 99, 235, 0.4)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div style={{
                                            fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                                            fontWeight: 950,
                                            letterSpacing: '-2px',
                                            color: 'white',
                                            lineHeight: 1,
                                            textShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                        }}>
                                            {company}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <>
                                {/* Back Button */}
                                <button
                                    onClick={() => setSelectedCompany(null)}
                                    style={{
                                        marginBottom: '1.5rem',
                                        padding: '0.6rem 1rem',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '10px',
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                                >
                                    <ChevronLeft size={16} /> Cambiar Empresa
                                </button>

                                {/* Role Selection */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                                    gap: '1rem',
                                    marginBottom: '2rem',
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                    paddingRight: '0.5rem'
                                }}>
                                    {roles.map((role) => (
                                        <button
                                            key={role.id}
                                            onClick={() => handleRoleSelection(role)}
                                            style={{
                                                padding: '1.25rem',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                background: role.id === 'Gerente' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                                borderRadius: '16px',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.75rem',
                                                color: 'white'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.borderColor = 'var(--brand, #2563eb)';
                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.background = role.id === 'Gerente' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(255, 255, 255, 0.03)';
                                            }}
                                        >
                                            <div style={{
                                                color: role.id === 'Gerente' ? 'var(--brand, #2563eb)' : 'rgba(255, 255, 255, 0.5)',
                                            }}>
                                                {role.icon}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, color: 'white', fontSize: '1rem', marginBottom: '0.25rem' }}>
                                                    {role.name}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', lineHeight: '1.4' }}>
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

                <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                    ZENTRA INDICADORES &copy; 2026
                </div>
            </div>
        </div>
    );
};

export default Login;
