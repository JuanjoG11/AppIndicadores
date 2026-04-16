import React, { useState, useEffect } from 'react';
import { areas } from '../data/areas';
import { filterKPIsByEntity } from '../utils/kpiHelpers';
import { CheckCircle2, Clock, AlertCircle, RefreshCw, Building2, TrendingUp, Activity } from 'lucide-react';
import Logo from '../components/common/Logo';

const AUTO_RELOAD_MS = 10 * 60 * 1000;

const PresentationView = ({ kpiData, activeCompany, setActiveCompany }) => {
    const [now, setNow] = useState(new Date());
    const [secondsToReload, setSecondsToReload] = useState(AUTO_RELOAD_MS / 1000);

    useEffect(() => {
        const clockTimer = setInterval(() => setNow(new Date()), 30000);
        const countdownTimer = setInterval(() => {
            setSecondsToReload(prev => {
                if (prev <= 1) { window.location.reload(); return AUTO_RELOAD_MS / 1000; }
                return prev - 1;
            });
        }, 1000);
        return () => { clearInterval(clockTimer); clearInterval(countdownTimer); };
    }, []);

    const filteredKPIs = filterKPIsByEntity(kpiData, activeCompany);

    const areaStats = areas.map(area => {
        const areaKPIs = filteredKPIs.filter(k =>
            k.area === area.id || (k.visibleEnAreas && k.visibleEnAreas.includes(area.id))
        );
        const total = areaKPIs.length;
        const loaded = areaKPIs.filter(k => k.hasData).length;
        const pct = total > 0 ? Math.round((loaded / total) * 100) : 0;
        const avgCompliance = loaded > 0
            ? Math.round(areaKPIs.filter(k => k.hasData).reduce((s, k) => s + (k.compliance || 0), 0) / loaded)
            : 0;
        const status = pct === 100 ? 'complete' : pct >= 60 ? 'partial' : pct > 0 ? 'started' : 'empty';
        return { ...area, total, loaded, pct, avgCompliance, status };
    }).filter(a => a.total > 0);

    const globalTotal = areaStats.reduce((s, a) => s + a.total, 0);
    const globalLoaded = areaStats.reduce((s, a) => s + a.loaded, 0);
    const globalPct = globalTotal > 0 ? Math.round((globalLoaded / globalTotal) * 100) : 0;
    const completeAreas = areaStats.filter(a => a.pct === 100).length;

    const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });

    const statusColor = s => ({ complete: '#10b981', partial: '#f59e0b', started: '#3b82f6', empty: '#475569' }[s]);
    const statusLabel = s => ({ complete: 'COMPLETO', partial: 'EN PROGRESO', started: 'INICIADO', empty: 'PENDIENTE' }[s]);

    return (
        <div style={{
            width: '100vw', height: '100vh',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 50%, #0d1117 100%)',
            fontFamily: 'Inter, system-ui, sans-serif',
            color: 'white',
            boxSizing: 'border-box',
        }}>
            {/* Grid background */}
            <div style={{
                position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
                backgroundImage: `linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
            }} />

            {/* ── HEADER ── */}
            <header style={{
                flexShrink: 0,
                position: 'relative', zIndex: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.6rem 1.75rem',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(10,15,30,0.8)',
                backdropFilter: 'blur(12px)',
                height: '60px',
            }}>
                {/* Logo + title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                    <Logo size="sm" />
                    <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>ZENTRA</div>
                        <div style={{ fontSize: '0.55rem', color: 'rgba(165,180,252,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                            Estado de Carga · Tiempo Real
                        </div>
                    </div>
                </div>

                {/* Center: company switcher */}
                <div style={{
                    display: 'flex', gap: '0.25rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', padding: '0.2rem',
                }}>
                    {['TYM', 'TAT'].map(e => (
                        <button key={e} onClick={() => setActiveCompany(e)} style={{
                            padding: '0.3rem 1rem', borderRadius: '7px', border: 'none',
                            fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer',
                            background: activeCompany === e ? '#6366f1' : 'transparent',
                            color: activeCompany === e ? 'white' : 'rgba(255,255,255,0.4)',
                            transition: 'all 0.2s',
                        }}>{e}</button>
                    ))}
                </div>

                {/* Clock */}
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>{timeStr}</div>
                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'capitalize' }}>{dateStr}</div>
                </div>
            </header>

            {/* ── SUMMARY BAR ── */}
            <div style={{
                flexShrink: 0,
                position: 'relative', zIndex: 10,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr 3fr',
                gap: '0.75rem',
                padding: '0.6rem 1.75rem',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(10,15,30,0.6)',
                alignItems: 'center',
                height: '70px',
            }}>
                {[
                    { label: 'CARGADOS', value: `${globalLoaded} / ${globalTotal}`, color: '#818cf8' },
                    { label: 'PROGRESO', value: `${globalPct}%`, color: globalPct >= 80 ? '#34d399' : globalPct >= 50 ? '#fbbf24' : '#f87171' },
                    { label: 'COMPLETAS', value: `${completeAreas} de ${areaStats.length}`, color: '#34d399' },
                    { label: 'EMPRESA', value: activeCompany === 'TYM' ? 'TYM' : 'TAT', color: '#a78bfa' },
                ].map((s, i) => (
                    <div key={i} style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '10px', padding: '0.4rem 0.75rem',
                        display: 'flex', flexDirection: 'column', gap: '0.1rem',
                    }}>
                        <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</span>
                    </div>
                ))}

                {/* Global progress bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase' }}>
                        <span>Progreso consolidado</span><span>{globalPct}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.07)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', width: `${globalPct}%`,
                            background: globalPct >= 80 ? 'linear-gradient(90deg,#34d399,#059669)' : globalPct >= 50 ? 'linear-gradient(90deg,#fbbf24,#d97706)' : 'linear-gradient(90deg,#f87171,#dc2626)',
                            borderRadius: '999px',
                            transition: 'width 1.5s ease',
                        }} />
                    </div>
                </div>
            </div>

            {/* ── AREAS GRID ── fills remaining space ── */}
            <div style={{
                flex: 1,
                position: 'relative', zIndex: 10,
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gridTemplateRows: 'repeat(2, 1fr)',
                gap: '0.75rem',
                padding: '0.75rem 1.75rem',
                overflow: 'hidden',
                minHeight: 0,
            }}>
                {areaStats.map((area) => {
                    const color = statusColor(area.status);
                    const label = statusLabel(area.status);
                    const Icon = area.pct === 100 ? CheckCircle2 : area.pct > 0 ? Clock : AlertCircle;

                    return (
                        <div key={area.id} style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: `1px solid ${area.pct === 100 ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}`,
                            borderRadius: '16px',
                            padding: '1rem 1.1rem',
                            display: 'flex', flexDirection: 'column', gap: '0.6rem',
                            position: 'relative', overflow: 'hidden',
                            backdropFilter: 'blur(6px)',
                            minHeight: 0,
                        }}>
                            {/* Top accent line */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                                background: area.pct === 100
                                    ? 'linear-gradient(90deg,#34d399,#059669)'
                                    : `linear-gradient(90deg,${area.color}cc,${area.color}44)`,
                                borderRadius: '16px 16px 0 0',
                            }} />

                            {/* Header row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        width: '28px', height: '28px', flexShrink: 0,
                                        borderRadius: '8px',
                                        background: area.pct === 100 ? 'rgba(52,211,153,0.15)' : `${area.color}22`,
                                        border: `1px solid ${area.pct === 100 ? 'rgba(52,211,153,0.35)' : `${area.color}44`}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: area.pct === 100 ? '#34d399' : area.color,
                                    }}>
                                        <Icon size={14} />
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.8rem', color: 'white', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {area.name}
                                        </div>
                                        <div style={{ fontSize: '0.5rem', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.1rem' }}>
                                            {label}
                                        </div>
                                    </div>
                                </div>
                                {/* Big % */}
                                <div style={{ fontSize: '1.9rem', fontWeight: 900, color, lineHeight: 1, letterSpacing: '-0.04em', flexShrink: 0 }}>
                                    {area.pct}%
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '999px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', width: `${area.pct}%`,
                                    background: area.pct === 100
                                        ? 'linear-gradient(90deg,#34d399,#059669)'
                                        : `linear-gradient(90deg,${area.color},${area.color}99)`,
                                    borderRadius: '999px',
                                    boxShadow: area.pct > 0 ? `0 0 8px ${area.color}66` : 'none',
                                    transition: 'width 1.5s ease',
                                }} />
                            </div>

                            {/* Stats row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                                {[
                                    { label: 'Cargados', value: area.loaded, vc: '#34d399' },
                                    { label: 'Pendientes', value: area.total - area.loaded, vc: area.total - area.loaded === 0 ? '#34d399' : '#f87171' },
                                    { label: 'Logro', value: area.loaded > 0 ? `${area.avgCompliance}%` : '--', vc: area.avgCompliance >= 95 ? '#34d399' : area.avgCompliance >= 80 ? '#fbbf24' : '#f87171' },
                                ].map((s, i) => (
                                    <div key={i} style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '8px', padding: '0.35rem 0.4rem',
                                        textAlign: 'center',
                                    }}>
                                        <div style={{ fontSize: '0.45rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.15rem' }}>{s.label}</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 900, color: s.vc }}>{s.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── FOOTER ── */}
            <footer style={{
                flexShrink: 0,
                position: 'relative', zIndex: 10,
                height: '32px',
                padding: '0 1.75rem',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(10,15,30,0.7)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.25)', fontSize: '0.6rem', fontWeight: 700 }}>
                    <RefreshCw size={10} style={{ animation: secondsToReload <= 10 ? 'spin 1s linear infinite' : 'none' }} />
                    Actualización en{' '}
                    <span style={{ color: secondsToReload <= 30 ? '#fbbf24' : 'inherit', fontVariantNumeric: 'tabular-nums' }}>
                        {Math.floor(secondsToReload / 60)}:{String(secondsToReload % 60).padStart(2, '0')}
                    </span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.6rem', fontWeight: 700 }}>ZENTRA BI © 2026</div>
            </footer>
        </div>
    );
};

export default PresentationView;
