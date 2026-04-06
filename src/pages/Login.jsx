import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, Zap } from 'lucide-react';
import Logo from '../components/common/Logo';
import { authenticateUser } from '../data/users';

const BRAND_COLORS = {
    ALPINA: '#0ea5e9',
    ZENU: '#f97316',
    FLEISCHMANN: '#a855f7',
    UNILEVER: '#3b82f6',
    FAMILIA: '#10b981',
};

const BRAND_DISPLAY = {
    ALPINA: 'Alpina',
    ZENU: 'Zenú',
    FLEISCHMANN: 'Fleischmann',
    UNILEVER: 'Unilever',
    FAMILIA: 'Familia',
};

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [shake, setShake] = useState(false);
    const navigate = useNavigate();
    const passwordRef = useRef(null);

    // Dynamic accent based on what the user is typing
    const getAccentColor = () => {
        const u = username.toLowerCase();
        if (u.includes('alpina')) return BRAND_COLORS.ALPINA;
        if (u.includes('zenu')) return BRAND_COLORS.ZENU;
        if (u.includes('fleisch')) return BRAND_COLORS.FLEISCHMANN;
        if (u.includes('unilever')) return BRAND_COLORS.UNILEVER;
        if (u.includes('familia')) return BRAND_COLORS.FAMILIA;
        if (u.includes('gerente')) return '#2563eb';
        return '#6366f1';
    };

    const accentColor = getAccentColor();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password) {
            setError('Ingresa usuario y contraseña');
            return;
        }

        setIsLoading(true);
        setError('');

        // Small delay for UX feedback
        await new Promise(r => setTimeout(r, 500));

        const user = authenticateUser(username, password);
        setIsLoading(false);

        if (!user) {
            setError('Usuario o contraseña incorrectos');
            setShake(true);
            setTimeout(() => setShake(false), 600);
            return;
        }

        // Build the session user object
        const sessionUser = {
            name: user.name,
            role: user.role,
            cargo: user.cargo,
            company: user.company,
            activeBrand: user.activeBrand,
            authorizedAreas: user.allowedAreas,
        };

        onLogin(sessionUser);

        if (user.role === 'Gerente') {
            navigate('/');
        } else {
            navigate('/mis-indicadores');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `radial-gradient(ellipse at 60% 30%, ${accentColor}22 0%, transparent 60%), 
                         radial-gradient(ellipse at 20% 80%, #6366f133 0%, transparent 50%),
                         linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)`,
            padding: '2rem',
            transition: 'background 1s ease',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background grid */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
                pointerEvents: 'none'
            }} />

            {/* Floating accent orbs */}
            <div style={{
                position: 'absolute', top: '-200px', right: '-200px',
                width: '500px', height: '500px',
                background: accentColor,
                filter: 'blur(120px)', opacity: 0.12,
                borderRadius: '50%', pointerEvents: 'none',
                transition: 'background 1s ease'
            }} />
            <div style={{
                position: 'absolute', bottom: '-150px', left: '-150px',
                width: '400px', height: '400px',
                background: '#6366f1',
                filter: 'blur(120px)', opacity: 0.1,
                borderRadius: '50%', pointerEvents: 'none'
            }} />

            <div
                className="fade-in"
                style={{
                    maxWidth: '460px',
                    width: '100%',
                    position: 'relative',
                    animation: shake ? 'shake 0.6s cubic-bezier(.36,.07,.19,.97) both' : undefined,
                }}
            >
                {/* Glassmorphism card */}
                <div style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: `1px solid ${accentColor}33`,
                    borderRadius: '32px',
                    padding: '3rem',
                    boxShadow: `0 32px 64px -16px rgba(0,0,0,0.7), 0 0 80px ${accentColor}15`,
                    transition: 'border-color 1s ease, box-shadow 1s ease',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Inner top accent */}
                    <div style={{
                        position: 'absolute', top: 0, left: '50%',
                        transform: 'translateX(-50%)',
                        width: '200px', height: '1px',
                        background: `linear-gradient(90deg, transparent, ${accentColor}88, transparent)`,
                    }} />

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <div style={{
                            display: 'flex', justifyContent: 'center', marginBottom: '1.5rem',
                            filter: `drop-shadow(0 0 20px ${accentColor}66)`
                        }}>
                            <Logo size="xl" />
                        </div>
                        <h1 style={{
                            fontSize: '3rem', fontWeight: 950, color: 'white',
                            marginBottom: '0.25rem', letterSpacing: '-0.06em',
                            textShadow: '0 2px 20px rgba(0,0,0,0.5)'
                        }}>
                            ZENTRA
                        </h1>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.3rem 1.25rem',
                            background: `${accentColor}18`,
                            borderRadius: '100px',
                            border: `1px solid ${accentColor}33`,
                            transition: 'all 1s ease'
                        }}>
                            <Zap size={12} color={accentColor} />
                            <span style={{
                                color: accentColor, fontSize: '0.7rem', fontWeight: 800,
                                textTransform: 'uppercase', letterSpacing: '0.2em',
                                transition: 'color 1s ease'
                            }}>
                                Potenciando la Excelencia Operativa
                            </span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Username */}
                        <div>
                            <label style={{
                                display: 'block', marginBottom: '0.6rem',
                                fontSize: '0.75rem', fontWeight: 800,
                                color: 'rgba(255,255,255,0.5)',
                                textTransform: 'uppercase', letterSpacing: '0.12em'
                            }}>
                                Usuario
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute', left: '1rem', top: '50%',
                                    transform: 'translateY(-50%)', color: accentColor,
                                    transition: 'color 1s ease', pointerEvents: 'none'
                                }}>
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => { setUsername(e.target.value); setError(''); }}
                                    onKeyDown={e => e.key === 'Enter' && passwordRef.current?.focus()}
                                    placeholder="ej: fact_zenu"
                                    autoFocus
                                    autoComplete="username"
                                    style={{
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        padding: '0.9rem 1rem 0.9rem 3rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${username ? accentColor + '66' : 'rgba(255,255,255,0.1)'}`,
                                        borderRadius: '16px',
                                        color: 'white',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        outline: 'none',
                                        transition: 'all 0.3s ease',
                                        fontFamily: 'inherit'
                                    }}
                                    onFocus={e => e.target.style.borderColor = accentColor + '99'}
                                    onBlur={e => e.target.style.borderColor = username ? accentColor + '66' : 'rgba(255,255,255,0.1)'}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{
                                display: 'block', marginBottom: '0.6rem',
                                fontSize: '0.75rem', fontWeight: 800,
                                color: 'rgba(255,255,255,0.5)',
                                textTransform: 'uppercase', letterSpacing: '0.12em'
                            }}>
                                Contraseña
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute', left: '1rem', top: '50%',
                                    transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)',
                                    pointerEvents: 'none'
                                }}>
                                    <Lock size={18} />
                                </div>
                                <input
                                    ref={passwordRef}
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => { setPassword(e.target.value); setError(''); }}
                                    placeholder="••••••••••"
                                    autoComplete="current-password"
                                    style={{
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        padding: '0.9rem 3rem 0.9rem 3rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        color: 'white',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        outline: 'none',
                                        transition: 'all 0.3s ease',
                                        fontFamily: 'inherit'
                                    }}
                                    onFocus={e => e.target.style.borderColor = accentColor + '99'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '1rem', top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none', border: 'none',
                                        color: 'rgba(255,255,255,0.3)',
                                        cursor: 'pointer', padding: '4px',
                                        display: 'flex', alignItems: 'center',
                                        borderRadius: '8px', transition: 'color 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.color = accentColor}
                                    onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.6rem',
                                padding: '0.75rem 1rem',
                                background: 'rgba(239,68,68,0.12)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: '14px',
                                color: '#f87171',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                animation: 'fadeIn 0.2s ease'
                            }}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                marginTop: '0.5rem',
                                padding: '1rem',
                                background: isLoading
                                    ? 'rgba(255,255,255,0.1)'
                                    : `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
                                border: 'none',
                                borderRadius: '18px',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 900,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                letterSpacing: '0.05em',
                                transition: 'all 0.4s ease',
                                boxShadow: isLoading ? 'none' : `0 12px 32px -8px ${accentColor}88`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                opacity: isLoading ? 0.7 : 1,
                            }}
                            onMouseOver={e => !isLoading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            {isLoading ? (
                                <>
                                    <div style={{
                                        width: '18px', height: '18px',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: 'white',
                                        borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite'
                                    }} />
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck size={20} />
                                    Ingresar al Sistema
                                </>
                            )}
                        </button>
                    </form>

                    {/* Hint panel - collapsible */}
                    <details style={{ marginTop: '2rem' }}>
                        <summary style={{
                            cursor: 'pointer',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: 'rgba(255,255,255,0.25)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            listStyle: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            userSelect: 'none'
                        }}>
                            <span style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                            Ver usuarios de ejemplo
                            <span style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                        </summary>
                        <div style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '14px',
                            border: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.6rem'
                        }}>
                            {[
                                { u: 'gerente', p: 'Zentra2026!', label: '👑 Gerencia General' },
                                { u: 'log_alpina', p: 'Log_Alpina26', label: '🚛 Logística · Alpina (TYM)' },
                                { u: 'log_zenu', p: 'Log_Zenu26', label: '🚛 Logística · Zenú (TYM)' },
                                { u: 'log_unilever', p: 'Log_Unilever26', label: '🚛 Logística · Unilever (TAT)' },
                                { u: 'fact_alpina', p: 'Fact_Alpina26', label: '📋 Facturación · Alpina (TYM)' },
                                { u: 'fact_zenu', p: 'Fact_Zenu26', label: '📋 Facturación · Zenú (TYM)' },
                                { u: 'fact_unilever', p: 'Fact_Unilever26', label: '📋 Facturación · Unilever (TAT)' },
                                { u: 'rrhh_tym', p: 'RRHH_TYM26', label: '👥 Gestión Humana (TYM)' },
                                { u: 'contador_tym', p: 'Conta_TYM26', label: '🧮 Contabilidad (TYM)' },
                            ].map(({ u, p, label }) => (
                                <button
                                    key={u}
                                    type="button"
                                    onClick={() => { setUsername(u); setPassword(p); setError(''); }}
                                    style={{
                                        background: 'none', border: 'none',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '10px',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        color: 'rgba(255,255,255,0.4)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        transition: 'all 0.2s',
                                        fontFamily: 'inherit',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                                    onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                                >
                                    <span>{label}</span>
                                    <span style={{ fontSize: '0.65rem', opacity: 0.6, fontFamily: 'monospace' }}>{u}</span>
                                </button>
                            ))}
                        </div>
                    </details>
                </div>

                {/* Footer */}
                <p style={{
                    textAlign: 'center', marginTop: '1.5rem',
                    color: 'rgba(255,255,255,0.2)',
                    fontSize: '0.7rem', fontWeight: 700,
                    letterSpacing: '0.15em', textTransform: 'uppercase'
                }}>
                    ZENTRA BI © 2026 · Todos los derechos reservados
                </p>
            </div>

            <style>{`
                @keyframes shake {
                    10%, 90% { transform: translateX(-2px); }
                    20%, 80% { transform: translateX(4px); }
                    30%, 50%, 70% { transform: translateX(-6px); }
                    40%, 60% { transform: translateX(6px); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                input::placeholder { color: rgba(255,255,255,0.2); }
                input:-webkit-autofill {
                    -webkit-box-shadow: 0 0 0 1000px #0f172a inset !important;
                    -webkit-text-fill-color: white !important;
                }
                details > summary::-webkit-details-marker { display: none; }
            `}</style>
        </div>
    );
};

export default Login;
