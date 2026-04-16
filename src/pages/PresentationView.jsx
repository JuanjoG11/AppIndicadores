import React, { useState, useEffect } from 'react';
import { areas } from '../data/areas';
import { filterKPIsByEntity } from '../utils/kpiHelpers';
import {
    CheckCircle2, Clock, AlertCircle, Maximize2, Minimize2,
    RefreshCw, Building2, TrendingUp, Activity, ListChecks
} from 'lucide-react';
import Logo from '../components/common/Logo';

const TICK_INTERVAL = 30000; // refresca reloj cada 30s

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

    // Estadísticas por área con nombres de pendientes
    const areaStats = areas.map(area => {
        const areaKPIs = filteredKPIs.filter(k =>
            k.area === area.id ||
            (k.visibleEnAreas && k.visibleEnAreas.includes(area.id))
        );
        const total = areaKPIs.length;
        const loadedKPIs = areaKPIs.filter(k => k.hasData);
        const loaded = loadedKPIs.length;
        const pct = total > 0 ? Math.round((loaded / total) * 100) : 0;
        const avgCompliance = loaded > 0
            ? Math.round(loadedKPIs.reduce((s, k) => s + (k.compliance || 0), 0) / loaded)
            : 0;
        const semaphore = pct === 100 ? 'complete' : pct >= 60 ? 'partial' : pct > 0 ? 'started' : 'empty';
        
        // Obtener nombres de indicadores que faltan
        const pendingNames = areaKPIs.filter(k => !k.hasData).map(k => k.name);
        
        return { ...area, total, loaded, pct, avgCompliance, semaphore, pendingNames };
    }).filter(a => a.total > 0);

    const globalTotal = areaStats.reduce((s, a) => s + a.total, 0);
    const globalLoaded = areaStats.reduce((s, a) => s + a.loaded, 0);
    const globalPct = globalTotal > 0 ? Math.round((globalLoaded / globalTotal) * 100) : 0;
    const completeAreas = areaStats.filter(a => a.pct === 100).length;

    const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });

    const semColor = (s) => ({ complete: '#10b981', partial: '#f59e0b', started: '#3b82f6', empty: '#94a3b8' }[s]);
    const semLabel = (s) => ({ complete: 'Completado', partial: 'En Progreso', started: 'Iniciado', empty: 'Pendiente' }[s]);

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            background: '#0f172a',
            backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Inter, system-ui, sans-serif',
            color: 'white',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 9999
        }}>
            {/* Sutil malla de fondo */}
            <div style={{
                position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
                backgroundImage: `linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)`,
                backgroundSize: '80px 80px',
            }} />

            {/* ── HEADER ── */}
            <header style={{
                position: 'relative', zIndex: 10,
                padding: '1rem 2.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid rgba(99,102,241,0.2)',
                background: 'rgba(15,23,42,0.6)',
                backdropFilter: 'blur(16px)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <Logo size="md" />
                    <div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>
                            ZENTRA
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                            Estado de Carga · Tiempo Real
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    {/* Selector de Empresa */}
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
                            }}>
                                {entity}
                            </button>
                        ))}
                    </div>

                    {/* Reloj */}
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 900, lineHeight: 1 }}>{timeStr}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>{dateStr}</div>
                    </div>

                    <button onClick={toggleFullscreen} style={{
                        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.13)',
                        color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                        padding: '0.55rem', borderRadius: '12px',
                    }}>
                        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                </div>
            </header>

            {/* ── BARRA DE RESUMEN ── */}
            <div style={{
                position: 'relative', zIndex: 10,
                padding: '1rem 2.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                borderBottom: '1px solid rgba(99,102,241,0.2)',
            }}>
                {[
                    { label: 'CARGADOS', value: `${globalLoaded} / ${globalTotal}`, color: '#818cf8', icon: <Activity size={18} /> },
                    { label: 'PROGRESO', value: `${globalPct}%`, color: globalPct >= 80 ? '#34d399' : globalPct >= 40 ? '#fbbf24' : '#f87171', icon: <TrendingUp size={18} /> },
                    { label: 'ÁREAS LISTAS', value: `${completeAreas} de ${areaStats.length}`, color: '#10b981', icon: <CheckCircle2 size={18} /> },
                    { label: 'EMPRESA', value: activeCompany, color: '#a78bfa', icon: <Building2 size={18} /> },
                ].map((s, i) => (
                    <div key={i} style={{
                        background: 'rgba(99,102,241,0.08)',
                        border: '1px solid rgba(99,102,241,0.25)',
                        borderRadius: '16px', padding: '0.85rem 1.25rem',
                        display: 'flex', flexDirection: 'column', gap: '0.2rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: s.color }}>
                            {s.icon}
                            <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>{s.label}</span>
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                    </div>
                ))}

                <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', width: `${globalPct}%`,
                            background: globalPct >= 80 
                                ? 'linear-gradient(90deg, #34d399, #059669)' 
                                : globalPct >= 40 
                                    ? 'linear-gradient(90deg, #fbbf24, #d97706)' 
                                    : 'linear-gradient(90deg, #f87171, #dc2626)',
                            borderRadius: '999px', transition: 'width 1.5s ease',
                        }} />
                    </div>
                </div>
            </div>

            {/* ── CUADRÍCULA DE ÁREAS ── */}
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
                    const label = semLabel(area.semaphore);
                    const Icon = area.pct === 100 ? CheckCircle2 : area.pct > 0 ? Clock : AlertCircle;

                    return (
                        <div key={area.id} style={{
                            background: 'rgba(99,102,241,0.07)',
                            border: `1px solid ${area.pct === 100 ? 'rgba(16,185,129,0.4)' : 'rgba(99,102,241,0.3)'}`,
                            borderRadius: '20px',
                            padding: '1.25rem',
                            display: 'flex', flexDirection: 'column',
                            position: 'relative', overflow: 'hidden',
                            backdropFilter: 'blur(8px)',
                        }}>
                            {/* Accent line */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                                background: area.pct === 100 ? '#10b981' : area.color,
                            }} />

                            {/* Título y % */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {area.name}
                                    </div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color, textTransform: 'uppercase', marginTop: '0.2rem' }}>
                                        {label}
                                    </div>
                                </div>
                                <div style={{ fontSize: '2.2rem', fontWeight: 900, color, lineHeight: 1, letterSpacing: '-0.05em' }}>
                                    {area.pct}%
                                </div>
                            </div>

                            {/* Barra de progreso */}
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden', marginBottom: '1rem' }}>
                                <div style={{
                                    height: '100%', width: `${area.pct}%`,
                                    background: area.pct === 100 ? '#10b981' : area.color,
                                    borderRadius: '999px', transition: 'width 1.5s ease',
                                }} />
                            </div>

                            {/* Mini Estadísticas */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginBottom: '1rem' }}>
                                {[
                                    { l: 'Carg.', v: area.loaded, c: '#34d399' },
                                    { l: 'Pend.', v: area.total - area.loaded, c: area.pct === 100 ? '#34d399' : '#f87171' },
                                    { l: 'Logro', v: area.loaded > 0 ? `${area.avgCompliance}%` : '--', c: '#a78bfa' }
                                ].map((s, i) => (
                                    <div key={i} style={{ background: 'rgba(99,102,241,0.12)', borderRadius: '10px', padding: '0.4rem', textAlign: 'center', border: '1px solid rgba(99,102,241,0.1)' }}>
                                        <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.3)', fontWeight: 800, textTransform: 'uppercase' }}>{s.l}</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 900, color: s.c }}>{s.v}</div>
                                    </div>
                                ))}
                            </div>

                            {/* ── SORPRESA: LISTA DE PENDIENTES ── */}
                            <div style={{ flex: 1, minHeight: 0, padding: '0.75rem', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.4)' }}>
                                    <ListChecks size={12} />
                                    <span style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {area.pct === 100 ? 'Área Finalizada' : 'Pendientes de Carga'}
                                    </span>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto', maxHeight: '100px' }}>
                                    {area.pct === 100 ? (
                                        <div style={{ 
                                            fontSize: '0.75rem', color: '#34d399', fontWeight: 600, 
                                            padding: '0.5rem', textAlign: 'center', background: 'rgba(52,211,153,0.05)',
                                            borderRadius: '8px', border: '1px dashed rgba(52,211,153,0.3)'
                                        }}>
                                            ¡Excelente trabajo! 🚀
                                        </div>
                                    ) : (
                                        area.pendingNames.slice(0, 4).map((name, pidx) => (
                                            <div key={pidx} style={{ 
                                                fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', 
                                                padding: '0.3rem 0.5rem', background: 'rgba(255,255,255,0.03)',
                                                borderRadius: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                            }}>
                                                • {name}
                                            </div>
                                        ))
                                    )}
                                    {area.pendingNames.length > 4 && (
                                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', textAlign: 'center' }}>
                                            y {area.pendingNames.length - 4} más...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── FOOTER ── */}
            <footer style={{
                position: 'relative', zIndex: 10,
                padding: '0.8rem 2.5rem',
                borderTop: '1px solid rgba(99,102,241,0.2)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(15,23,42,0.8)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: 700 }}>
                    <RefreshCw size={12} className="rotate" />
                    Actualización automática tiempo real · ZENTRA BI © 2026
                </div>
                <div style={{ color: 'rgba(129,140,248,0.5)', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '2px' }}>
                    TIENDAS Y MARCAS
                </div>
            </footer>

            <style>{`
                .rotate { animation: spin 4s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default PresentationView;
