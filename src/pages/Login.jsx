import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LayoutGrid, Users } from 'lucide-react';

const Login = ({ onLogin }) => {
    const roles = [
        { id: 'Gerente', name: 'Gerente General', desc: 'Acceso total y reportes estratégicos', icon: <LayoutGrid size={24} /> },
        { id: 'APRENDIZ DEVOLUCIONES', name: 'Aprendiz Devoluciones', desc: 'Pedidos devueltos, promedio por auxiliar/carro', icon: <Users size={24} /> },
        { id: 'GESTIÓN HUMANA', name: 'Gestión Humana', desc: 'Nómina, horas extras, rotación, ausentismo', icon: <Users size={24} /> },
        { id: 'JEFE DE TALENTO HUMANO', name: 'Jefe de Talento Humano', desc: 'Rotación, ausentismo, calificación auditoría', icon: <Users size={24} /> },
        { id: 'CONTADOR', name: 'Contador', desc: 'Gasto de fletes y rentabilidad', icon: <Users size={24} /> },
        { id: 'ANALISTA DE INFORMACIÓN', name: 'Analista de Información', desc: 'Picking, segundos/unidad, pedidos/hombre', icon: <Users size={24} /> },
        { id: 'LOGISTICA INVERSA', name: 'Logística Inversa', desc: 'Embalajes y control de canastillas', icon: <Users size={24} /> },
        { id: 'CONTROLLER', name: 'Controller', desc: 'Arqueos de caja y planillas', icon: <Users size={24} /> },
        { id: 'ANALISTA DE CARTERA', name: 'Analista de Cartera', desc: 'Rotación de cartera y circulaciones', icon: <Users size={24} /> },
        { id: 'CONTADORA', name: 'Contadora', desc: 'Diferencia en cierres y activos', icon: <Users size={24} /> },
        { id: 'COORDINADOR POR MARCA', name: 'Coordinador por Marca', desc: 'Ventas, margen y devoluciones comercial', icon: <Users size={24} /> },
        { id: 'ANALISTA DE INVENTARIOS', name: 'Analista de Inventarios', desc: 'Fiabilidad, quiebres y obsolescencia', icon: <Users size={24} /> },
    ];

    const navigate = useNavigate();

    const handleLogin = (roleId) => {
        const role = roles.find(r => r.id === roleId);
        const user = {
            name: role.name,
            role: role.id === 'Gerente' ? 'Gerente' : 'Analista',
            cargo: role.id
        };
        onLogin(user);
        if (role.id === 'Gerente') {
            navigate('/');
        } else {
            navigate('/mis-indicadores');
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', padding: '2rem'
        }}>
            <div className="card fade-in" style={{
                maxWidth: '800px', width: '100%', padding: '2.5rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', borderRadius: '24px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        width: '72px', height: '72px', background: 'var(--brand)',
                        color: 'white', borderRadius: '20px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto',
                        boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)',
                        transform: 'rotate(-5deg)'
                    }}>
                        <Shield size={38} strokeWidth={2.5} />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' }}>
                        Indicadores TYM/TAT 2026
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                        Seleccione su cargo para alimentar el sistema
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => handleLogin(role.id)}
                            style={{
                                padding: '1.25rem',
                                textAlign: 'left',
                                cursor: 'pointer',
                                border: '1px solid var(--border-soft)',
                                background: 'white',
                                borderRadius: '16px',
                                transition: 'all 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = 'var(--brand)';
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-soft)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{
                                color: role.id === 'Gerente' ? 'var(--brand)' : 'var(--text-muted)',
                                opacity: 0.8
                            }}>
                                {role.icon}
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1rem', marginBottom: '0.25rem' }}>
                                    {role.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                                    {role.desc}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Al ingresar, el sistema le mostrará únicamente los indicadores bajo su responsabilidad.
                </div>
            </div>
        </div>
    );
};

export default Login;
