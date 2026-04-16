import React, { useState, useEffect } from 'react';
import { areas } from '../data/areas';
import { filterKPIsByEntity } from '../utils/kpiHelpers';
import {
    CheckCircle2, Clock, AlertCircle, Maximize2, Minimize2,
    RefreshCw, Building2, TrendingUp, Activity
} from 'lucide-react';
import Logo from '../components/common/Logo';

const TICK_INTERVAL = 30000; // refresh clock every 30s

const PresentationView = ({ kpiData, activeCompany, setActiveCompany }) => {
    const [now, setNow] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        setAnimateIn(true);
        const timer = setInterval(() => setNow(new Date()), TICK_INTERVAL);
        return () => clearInterval(timer);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    const filteredKPIs = filterKPIsByEntity(kpiData, activeCompany);

    // Build per-area stats
    const areaStats = areas.map(area => {
        const areaKPIs = filteredKPIs.filter(k =>
            k.area === area.id ||
            (k.visibleEnAreas && k.visibleEnAreas.includes(area.id))
        );
        const total = areaKPIs.length;
        const loaded = areaKPIs.filter(k => k.hasData).length;
        const pct = total > 0 ? Math.round((loaded / total) * 100) : 0;
        const avgCompliance = loaded > 0
            ? Math.round(areaKPIs.filter(k => k.hasData).reduce((s, k) => s + (k.compliance || 0), 0) / loaded)
            : 0;
        const semaphore = pct === 100 ? 'complete' : pct >= 60 ? 'partial' : pct > 0 ? 'started' : 'empty';
        return { ...area, total, loaded, pct, avgCompliance, semaphore };
    }).filter(a => a.total > 0);

    // Global stats
    const globalTotal = areaStats.reduce((s, a) => s + a.total, 0);
    const globalLoaded = areaStats.reduce((s, a) => s + a.loaded, 0);
    const globalPct = globalTotal > 0 ? Math.round((globalLoaded / globalTotal) * 100) : 0;
    const completeAreas = areaStats.filter(a => a.pct === 100).length;

    const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const semColor = (s) => ({ complete: '#10b981', partial: '#f59e0b', started: '#3b82f6', empty: '#94a3b8' }[s]);
    const semLabel = (s) => ({ complete: 'Completo', partial: 'En Progreso', started: 'Iniciado', empty: 'Pendiente' }[s]);
    const semBg   = (s) => ({ complete: '#ecfdf5', partial: '#fffbeb', started: '#eff6ff', empty: '#f8fafc' }[s]);

    return (
        <div style={{
            height: '100vh',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Inter, system-ui, sans-serif',
            color: 'white',
            overflowX: 'hidden',
        }}>
            {/* Subtle grid overlay */}
            <div style={{
                position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
                backgroundImage: `linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
            }} />

            {/* Top glow */}
            <div style={{
                position: 'fixed', top: '-200px', left: '50%', transform: 'translateX(-50%)',
                width: '800px', height: '400px',
                background: 'radial-gradient(ellipse, rgba(99,102,241,0.25) 0%, transparent 70%)',
                pointerEvents: 'none', zIndex: 0
            }} />

            {/* ── HEADER ── */}
            <header style={{
                position: 'relative', zIndex: 10,
                padding: '1.5rem 2.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(15,23,42,0.6)',
                backdropFilter: 'blur(16px)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <Logo size="md" />
                    <div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>
                            ZENTRA
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(165,180,252,0.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                            Estado de Carga · Tiempo Real
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    {/* Company switcher */}
                    <div style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        padding: '0.3rem', borderRadius: '14px',
                        display: 'flex', gap: '0.3rem'
                    }}>
                        {['TYM', 'TAT'].map(entity => (
                            <button key={entity} onClick={() => setActiveCompany(entity)} style={{
                                padding: '0.45rem 1.25rem', borderRadius: '10px', border: 'none',
                                fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
                                background: activeCompany === entity ? '#6366f1' : 'transparent',
                                color: activeCompany === entity ? 'white' : 'rgba(255,255,255,0.45)',
                                transition: 'all 0.2s',
                                boxShadow: activeCompany === entity ? '0 4px 12px rgba(99,102,241,0.4)' : 'none',
                            }}>
                                {entity}
                            </button>
                        ))}
                    </div>

                    {/* Clock */}
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>{timeStr}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: '0.15rem', textTransform: 'capitalize' }}>{dateStr}</div>
                    </div>

                    {/* Fullscreen button */}
                    <button onClick={toggleFullscreen} title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'} style={{
                        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)',
                        color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                        padding: '0.55rem', borderRadius: '12px',
                        display: 'flex', alignItems: 'center', transition: 'all 0.2s',
                    }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = 'white'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                    >
                        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                </div>
            </header>

            {/* ── GLOBAL SUMMARY BAR ── */}
            <div style={{
                position: 'relative', zIndex: 10,
                padding: '1rem 2.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.75rem',
                borderBottom: '1px solid rgba(99,102,241,0.2)',
            }}>
                {[
                    { label: 'INDICADORES CARGADOS', value: `${globalLoaded} / ${globalTotal}`, icon: <Activity size={20} />, color: '#818cf8' },
                    { label: 'PROGRESO GLOBAL', value: `${globalPct}%`, icon: <TrendingUp size={20} />, color: globalPct >= 80 ? '#34d399' : globalPct >= 50 ? '#fbbf24' : '#f87171' },
                    { label: 'ÁREAS COMPLETAS', value: `${completeAreas} de ${areaStats.length}`, icon: <CheckCircle2 size={20} />, color: '#34d399' },
                    { label: 'EMPRESA ACTIVA', value: activeCompany === 'TYM' ? 'Tiendas y Marcas' : 'TAT Distribuciones', icon: <Building2 size={20} />, color: '#a78bfa' },
                ].map((stat, i) => (
                    <div key={i} style={{
                        background: 'rgba(99,102,241,0.08)',
                        border: '1px solid rgba(99,102,241,0.25)',
                        borderRadius: '16px', padding: '0.85rem 1.25rem',
                        display: 'flex', flexDirection: 'column', gap: '0.35rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: stat.color }}>
                            {stat.icon}
                            <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)' }}>
                                {stat.label}
                            </span>
                        </div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: stat.color, letterSpacing: '-0.02em', lineHeight: 1 }}>
                            {stat.value}
                        </div>
                    </div>
                ))}

                {/* Global progress bar spanning all columns */}
                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>
                        <span>Progreso consolidado</span>
                        <span>{globalPct}%</span>
                    </div>
                    <div style={{ height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: `${globalPct}%`,
                            background: globalPct >= 80
                                ? 'linear-gradient(90deg, #34d399, #059669)'
                                : globalPct >= 50
                                    ? 'linear-gradient(90deg, #fbbf24, #d97706)'
                                    : 'linear-gradient(90deg, #f87171, #dc2626)',
                            borderRadius: '999px',
                            boxShadow: '0 0 20px rgba(99,102,241,0.5)',
                            transition: 'width 1.5s cubic-bezier(0.4,0,0.2,1)',
                        }} />
                    </div>
                </div>
            </div>

            {/* ── AREA GRID ── */}
            <div style={{
                position: 'relative', zIndex: 10,
                padding: '1rem 2rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '1rem',
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
            }}>
                {areaStats.map((area, idx) => {
                    const color = semColor(area.semaphore);
                    const bg = semBg(area.semaphore);
                    const label = semLabel(area.semaphore);
                    const Icon = area.pct === 100 ? CheckCircle2 : area.pct > 0 ? Clock : AlertCircle;

                    return (
                        <div key={area.id} className={animateIn ? 'fade-in' : ''} style={{
                            background: 'rgba(99,102,241,0.07)',
                            border: `1px solid ${area.pct === 100 ? 'rgba(52,211,153,0.35)' : 'rgba(99,102,241,0.25)'}`,
                            borderRadius: '20px',
                            padding: '1.25rem',
                            animationDelay: `${idx * 0.05}s`,
                            transition: 'all 0.3s',
                            backdropFilter: 'blur(8px)',
                            position: 'relative',
                            overflow: 'hidden',
                        }}>
                            {/* Area color accent */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                                background: area.pct === 100
                                    ? 'linear-gradient(90deg, #34d399, #059669)'
                                    : `linear-gradient(90deg, ${area.color}99, ${area.color}44)`,
                                borderRadius: '24px 24px 0 0',
                            }} />

                            {/* Header row */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '12px',
                                        background: area.pct === 100 ? 'rgba(52,211,153,0.15)' : `${area.color}22`,
                                        border: `1px solid ${area.pct === 100 ? 'rgba(52,211,153,0.35)' : `${area.color}44`}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: area.pct === 100 ? '#34d399' : area.color,
                                    }}>
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'white', lineHeight: 1.2 }}>
                                            {area.name}
                                        </div>
                                        <div style={{
                                            fontSize: '0.65rem', fontWeight: 700,
                                            color: color,
                                            textTransform: 'uppercase', letterSpacing: '0.08em',
                                            marginTop: '0.15rem',
                                        }}>
                                            {label}
                                        </div>
                                    </div>
                                </div>

                                {/* Big % */}
                                <div style={{
                                    fontSize: '2.5rem', fontWeight: 900, lineHeight: 1,
                                    color: color,
                                    letterSpacing: '-0.04em',
                                }}>
                                    {area.pct}%
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${area.pct}%`,
                                        background: area.pct === 100
                                            ? 'linear-gradient(90deg, #34d399, #059669)'
                                            : `linear-gradient(90deg, ${area.color}, ${area.color}bb)`,
                                        borderRadius: '999px',
                                        boxShadow: area.pct > 0 ? `0 0 12px ${area.color}88` : 'none',
                                        transition: 'width 1.5s cubic-bezier(0.4,0,0.2,1)',
                                    }} />
                                </div>
                            </div>

                            {/* Stats row */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                                gap: '0.5rem',
                            }}>
                                {[
                                    { label: 'Cargados', value: area.loaded, valueColor: '#34d399' },
                                    { label: 'Pendientes', value: area.total - area.loaded, valueColor: area.total - area.loaded === 0 ? '#34d399' : '#f87171' },
                                    { label: 'Cumplimiento', value: area.loaded > 0 ? `${area.avgCompliance}%` : '--', valueColor: area.avgCompliance >= 95 ? '#34d399' : area.avgCompliance >= 80 ? '#fbbf24' : '#f87171' },
                                ].map((s, i) => (
                                    <div key={i} style={{
                                        background: 'rgba(99,102,241,0.1)',
                                        border: '1px solid rgba(99,102,241,0.2)',
                                        borderRadius: '10px', padding: '0.5rem 0.6rem',
                                        textAlign: 'center',
                                    }}>
                                        <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                                            {s.label}
                                        </div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: s.valueColor }}>
                                            {s.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── FOOTER ── */}
            <footer style={{
                position: 'relative', zIndex: 10,
                padding: '1rem 2.5rem',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(15,23,42,0.5)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem', fontWeight: 700 }}>
                    <RefreshCw size={12} />
                    Datos en tiempo real · Actualización automática cada 30 segundos
                </div>
                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', fontWeight: 700 }}>
                    ZENTRA BI © 2026
                </div>
            </footer>
        </div>
    );
};

export default PresentationView;
