import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LayoutGrid, Users } from 'lucide-react';

const Login = ({ onLogin }) => {
    const [selectedRole, setSelectedRole] = useState('Gerente');
    const navigate = useNavigate();

    const handleLogin = () => {
        const user = {
            name: selectedRole === 'Gerente' ? 'Marco Parra' : 'Juan Pérez',
            role: selectedRole,
            area: selectedRole === 'Jefe de Área' ? 'logistica-entrega' : null
        };
        onLogin(user);
        if (selectedRole === 'Gerente') {
            navigate('/');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-app)',
            padding: '1.5rem'
        }}>
            <div className="card fade-in" style={{
                maxWidth: '450px',
                width: '100%',
                padding: '2.5rem',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'var(--brand)',
                        color: 'white',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem auto',
                        boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)'
                    }}>
                        <Shield size={32} strokeWidth={2.5} />
                    </div>
                    <h1 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Sistema Gestión KPI</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Control Estratégico TYM/TAT 2026</p>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Acceso de Usuario
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button
                            style={{
                                padding: '1rem 1.25rem',
                                textAlign: 'left',
                                cursor: 'pointer',
                                border: selectedRole === 'Gerente' ? '2px solid var(--brand)' : '1px solid var(--border-soft)',
                                background: selectedRole === 'Gerente' ? 'var(--brand-bg)' : 'white',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                transition: 'all 0.2s'
                            }}
                            onClick={() => setSelectedRole('Gerente')}
                        >
                            <LayoutGrid size={20} color={selectedRole === 'Gerente' ? 'var(--brand)' : 'var(--text-light)'} />
                            <div>
                                <div style={{ fontWeight: 700, color: selectedRole === 'Gerente' ? 'var(--brand)' : 'var(--text-main)', fontSize: '0.95rem' }}>Gerente General</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Monitoreo estratégico global</div>
                            </div>
                        </button>

                        <button
                            style={{
                                padding: '1rem 1.25rem',
                                textAlign: 'left',
                                cursor: 'pointer',
                                border: selectedRole === 'Jefe de Área' ? '2px solid var(--brand)' : '1px solid var(--border-soft)',
                                background: selectedRole === 'Jefe de Área' ? 'var(--brand-bg)' : 'white',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                transition: 'all 0.2s'
                            }}
                            onClick={() => setSelectedRole('Jefe de Área')}
                        >
                            <Users size={20} color={selectedRole === 'Jefe de Área' ? 'var(--brand)' : 'var(--text-light)'} />
                            <div>
                                <div style={{ fontWeight: 700, color: selectedRole === 'Jefe de Área' ? 'var(--brand)' : 'var(--text-main)', fontSize: '0.95rem' }}>Jefe de Área</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Operación y registro detallado</div>
                            </div>
                        </button>
                    </div>
                </div>

                <button
                    className="btn btn-primary"
                    style={{
                        width: '100%',
                        padding: '1rem',
                        fontSize: '1rem',
                        fontWeight: 700,
                        borderRadius: '12px',
                        background: 'var(--brand)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                    onClick={handleLogin}
                >
                    Ingresar al Sistema
                </button>
            </div>
        </div>
    );
};

export default Login;
