import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, LayoutGrid, TrendingUp, Home, FileText, ArrowRight, Command } from 'lucide-react';
import { areas } from '../../data/areas';

/**
 * CommandPalette – Buscador global (Ctrl+K / Cmd+K)
 * Permite buscar KPIs, áreas y navegar rápidamente.
 */
const CommandPalette = ({ kpiData = [], isOpen, onClose, currentUser }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Construir índice de búsqueda al montar
    const searchIndex = useMemo(() => {
        const items = [];

        // Páginas principales
        if (currentUser?.role === 'Gerente') {
            items.push({ type: 'page', id: 'home', label: 'Tablero Ejecutivo', desc: 'Vista gerencial consolidada', icon: <Home size={16} />, route: '/', color: '#2563eb' });
        }
        items.push({ type: 'page', id: 'analyst', label: 'Mis Indicadores', desc: 'Consola de alimentación', icon: <FileText size={16} />, route: '/mis-indicadores', color: '#8b5cf6' });

        // Áreas
        areas.forEach(area => {
            items.push({
                type: 'area',
                id: area.id,
                label: area.name,
                desc: area.description,
                icon: <LayoutGrid size={16} />,
                route: `/area/${area.id}`,
                color: area.color,
            });
        });

        // KPIs
        kpiData.forEach(kpi => {
            const areaName = areas.find(a => a.id === kpi.area)?.name || kpi.area;
            items.push({
                type: 'kpi',
                id: kpi.id,
                label: kpi.name,
                desc: `${areaName} • ${kpi.responsable}`,
                icon: <TrendingUp size={16} />,
                route: `/area/${kpi.area}`,
                color: kpi.semaphore === 'green' ? '#10b981' : kpi.semaphore === 'yellow' ? '#f59e0b' : kpi.semaphore === 'red' ? '#ef4444' : '#94a3b8',
                semaphore: kpi.semaphore,
                compliance: kpi.compliance,
                hasData: kpi.hasData,
            });
        });

        return items;
    }, [kpiData, currentUser]);

    // Filtrar resultados
    const results = useMemo(() => {
        if (!query.trim()) {
            return searchIndex.slice(0, 8);
        }
        const q = query.toLowerCase();
        return searchIndex
            .filter(item =>
                item.label.toLowerCase().includes(q) ||
                item.desc.toLowerCase().includes(q) ||
                item.id.toLowerCase().includes(q)
            )
            .slice(0, 10);
    }, [query, searchIndex]);

    // Focus al abrir
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery('');
        }
    }, [isOpen]);

    // Cerrar con Escape
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    const handleSelect = (item) => {
        navigate(item.route);
        onClose();
    };

    if (!isOpen) return null;

    const groupedResults = {
        page: results.filter(r => r.type === 'page'),
        area: results.filter(r => r.type === 'area'),
        kpi: results.filter(r => r.type === 'kpi'),
    };

    const typeLabels = { page: 'Páginas', area: 'Áreas', kpi: 'Indicadores (KPIs)' };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(6px)',
                    zIndex: 99000,
                    animation: 'fadeIn 0.15s ease',
                }}
            />

            {/* Panel */}
            <div
                style={{
                    position: 'fixed',
                    top: '15vh',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%',
                    maxWidth: '620px',
                    background: 'var(--bg-card)',
                    borderRadius: '20px',
                    boxShadow: '0 30px 70px -10px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
                    zIndex: 99001,
                    overflow: 'hidden',
                    animation: 'toastIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    border: '1px solid var(--border-soft)',
                }}
            >
                {/* Search input */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--border-soft)',
                }}>
                    <Search size={20} color="var(--text-muted)" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Buscar indicadores, áreas, páginas..."
                        style={{
                            flex: 1,
                            background: 'none',
                            border: 'none',
                            outline: 'none',
                            fontSize: '1rem',
                            color: 'var(--text-main)',
                            fontWeight: 500,
                            fontFamily: 'inherit',
                        }}
                    />
                    {query && (
                        <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                            <X size={18} />
                        </button>
                    )}
                    <kbd style={{
                        fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)',
                        background: 'var(--bg-soft)', border: '1px solid var(--border-soft)',
                        borderRadius: '6px', padding: '0.2rem 0.5rem',
                    }}>ESC</kbd>
                </div>

                {/* Results */}
                <div style={{ maxHeight: '55vh', overflowY: 'auto', padding: '0.75rem' }}>
                    {results.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                            <Search size={28} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Sin resultados para "{query}"</p>
                        </div>
                    ) : (
                        Object.entries(groupedResults).map(([type, items]) => {
                            if (items.length === 0) return null;
                            return (
                                <div key={type} style={{ marginBottom: '0.75rem' }}>
                                    <div style={{
                                        fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-light)',
                                        textTransform: 'uppercase', letterSpacing: '0.08em',
                                        padding: '0.25rem 0.5rem', marginBottom: '0.35rem',
                                    }}>
                                        {typeLabels[type]}
                                    </div>
                                    {items.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSelect(item)}
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.875rem',
                                                padding: '0.75rem 0.875rem',
                                                borderRadius: '12px',
                                                border: 'none',
                                                background: 'transparent',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'background 0.15s',
                                                marginBottom: '2px',
                                            }}
                                            onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <div style={{
                                                width: '34px', height: '34px', borderRadius: '10px',
                                                background: `${item.color}18`, color: item.color,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0,
                                            }}>
                                                {item.icon}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {item.label}
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {item.desc}
                                                </div>
                                            </div>
                                            {item.type === 'kpi' && item.hasData && (
                                                <div style={{
                                                    fontSize: '0.7rem', fontWeight: 800,
                                                    color: item.color, background: `${item.color}15`,
                                                    padding: '0.2rem 0.5rem', borderRadius: '6px', flexShrink: 0,
                                                }}>
                                                    {item.compliance}%
                                                </div>
                                            )}
                                            <ArrowRight size={14} color="var(--text-light)" />
                                        </button>
                                    ))}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer hint */}
                <div style={{
                    padding: '0.6rem 1.25rem',
                    borderTop: '1px solid var(--border-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    background: 'var(--bg-soft)',
                }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Command size={11} /> K para abrir
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>↑↓ para navegar</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>↵ para seleccionar</span>
                </div>
            </div>
        </>
    );
};

export default CommandPalette;
