import React, { useMemo, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell, Legend
} from 'recharts';
import { ChevronRight, BarChart3, AlertTriangle, Target, Search, Filter } from 'lucide-react';
import { areas } from '../../data/areas';
import { isInverseKPI } from '../../utils/kpiCalculations';

// Aggregate compliance by area for a given company
const getAreaScoreByMonth = (kpis, areaId, company) => {
    const areaKpis = kpis.filter(k => k.area === areaId && k.history && k.history.length > 0);
    if (areaKpis.length === 0) return [];

    const months = areaKpis[0].history.map(h => h.month);
    return months.map(month => {
        let total = 0;
        let count = 0;
        areaKpis.forEach(kpi => {
            const point = kpi.history.find(h => h.month === month);
            const val = point?.[company]; // Lee TYM o TAT
            if (val === null || val === undefined || !kpi.targetMeta) return;
            const isInverse = isInverseKPI(kpi.id);

            const meta = (kpi.meta && typeof kpi.meta === 'object')
                ? (kpi.meta[company] || Object.values(kpi.meta)[0])
                : kpi.meta;
            if (!meta) return;
            const compliance = isInverse
                ? Math.min((meta / val) * 100, 100)
                : Math.min((val / meta) * 100, 100);
            if (!isNaN(compliance)) { total += compliance; count++; }
        });
        return { month, score: count > 0 ? Math.round(total / count) : null };
    });
};

// Get overall score per month for a company
const getOverallByMonth = (kpis, company) => {
    const companyAreas = areas.map(a => a.id);
    const months = kpis.find(k => k.history?.length)?.history.map(h => h.month) || [];
    return months.map(month => {
        let total = 0; let count = 0;
        companyAreas.forEach(aId => {
            const areaKpis = kpis.filter(k => k.area === aId && k.history?.length);
            areaKpis.forEach(kpi => {
                const point = kpi.history.find(h => h.month === month);
                const val = point?.[company]; // Lee TYM o TAT
                if (val === null || val === undefined || !kpi.targetMeta) return;
                const isInverse = isInverseKPI(kpi.id);
                const meta = (kpi.meta && typeof kpi.meta === 'object')
                    ? (kpi.meta[company] || Object.values(kpi.meta)[0])
                    : kpi.meta;
                if (!meta) return;
                const compliance = isInverse
                    ? Math.min((meta / val) * 100, 100)
                    : Math.min((val / meta) * 100, 100);
                if (!isNaN(compliance)) { total += compliance; count++; }
            });
        });
        return { month, score: count > 0 ? Math.round(total / count) : null };
    });
};

const semColor = (score) => {
    if (score === null || score === undefined) return '#e2e8f0';
    if (score >= 95) return '#22c55e';
    if (score >= 85) return '#f59e0b';
    return '#ef4444';
};

const semLabel = (score) => {
    if (score === null || score === undefined) return 'S.D.';
    if (score >= 95) return '🟢';
    if (score >= 85) return '🟡';
    return '🔴';
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'white', padding: '0.75rem 1rem', borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9'
            }}>
                <p style={{ margin: '0 0 0.4rem', fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>{label}</p>
                {payload.map((e, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: e.color }} />
                        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>{e.name}:</span>
                        <span style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 800 }}>{e.value}%</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const ExecutiveHistory = ({ kpiData, rawUpdates = [], onViewHistory, activeTab, onTabChange }) => {
    const [internalTab, setInternalTab] = useState('overview');
    const tab = activeTab || internalTab;
    const setTab = onTabChange || setInternalTab;

    const [selectedArea, setSelectedArea] = useState('logistica');
    const [logAreaFilter, setLogAreaFilter] = useState('all');
    const [logCompanyFilter, setLogCompanyFilter] = useState('all');
    const [logMonthFilter, setLogMonthFilter] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
    const [searchQuery, setSearchQuery] = useState('');

    const months = useMemo(() => kpiData.find(k => k.history?.length)?.history.map(h => h.month) || [], [kpiData]);

    const tymOverall = useMemo(() => getOverallByMonth(kpiData, 'TYM'), [kpiData]);
    const tatOverall = useMemo(() => getOverallByMonth(kpiData, 'TAT'), [kpiData]);

    const comparisonData = useMemo(() => tymOverall.map((p, i) => ({
        month: p.month, TYM: p.score, TAT: tatOverall[i]?.score ?? 0
    })), [tymOverall, tatOverall]);

    // Heatmap data: area × month for each company
    const heatmapTYM = useMemo(() =>
        areas.map(a => ({
            ...a,
            months: getAreaScoreByMonth(kpiData, a.id, 'TYM')
        })), [kpiData]);

    const heatmapTAT = useMemo(() =>
        areas.map(a => ({
            ...a,
            months: getAreaScoreByMonth(kpiData, a.id, 'TAT')
        })), [kpiData]);

    // Area KPI bar chart
    const areaBarData = useMemo(() => {
        const lastMonth = months[months.length - 1];
        return ['TYM', 'TAT'].map(company => {
            const areaScores = areas.map(a => {
                const monthData = (company === 'TYM' ? heatmapTYM : heatmapTAT)
                    .find(x => x.id === a.id)
                    ?.months.find(m => m.month === lastMonth);
                return { area: a.name, score: monthData?.score ?? 0 };
            });
            return { company, areaScores };
        });
    }, [months, heatmapTYM, heatmapTAT]);

    // Determinar el último mes que tiene datos reales (para no mostrar Abril si está vacío)
    const lastMonthWithData = useMemo(() => {
        const availableMonths = [...months].reverse();
        return availableMonths.find(m => {
            const tymIdx = tymOverall.find(o => o.month === m);
            const tatIdx = tatOverall.find(o => o.month === m);
            return (tymIdx && tymIdx.score !== null) || (tatIdx && tatIdx.score !== null);
        }) || months[months.length - 1];
    }, [months, tymOverall, tatOverall]);

    const tymLast = tymOverall.find(m => m.month === lastMonthWithData)?.score ?? null;
    const tatLast = tatOverall.find(m => m.month === lastMonthWithData)?.score ?? null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* HEADER CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[{ name: 'TYM', score: tymLast, color: '#3b82f6' }, { name: 'TAT', score: tatLast, color: '#f59e0b' }].map(co => (
                    <div key={co.name} style={{
                        background: 'white', borderRadius: '16px', padding: '1.25rem 1.5rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: `2px solid ${co.score >= 95 ? '#22c55e' : co.score >= 85 ? '#f59e0b' : '#ef4444'}30`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Cumplimiento Global — {co.name}
                            </p>
                            <p style={{ margin: '0.25rem 0 0', fontSize: '2rem', fontWeight: 900, color: co.score !== null ? semColor(co.score) : '#cbd5e1' }}>
                                {co.score !== null ? `${co.score}%` : '0%'}
                            </p>
                            <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>{co.score !== null ? `${lastMonthWithData} 2026` : 'PENDIENTE DE CARGA'}</p>
                        </div>
                        <div style={{
                            width: 60, height: 60, borderRadius: '50%',
                            background: `${semColor(co.score)}15`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.8rem'
                        }}>
                            {semLabel(co.score)}
                        </div>
                    </div>
                ))}
            </div>

            {/* TAB SWITCHER */}
            <div style={{ display: 'flex', gap: '0.5rem', background: '#f8fafc', padding: '0.3rem', borderRadius: '12px', width: 'fit-content' }}>
                {[
                    { id: 'overview', label: '📈 Tendencia General' }, 
                    { id: 'areas', label: '🗂️ Por Área' },
                    { id: 'log', label: '📜 Bitácora de Carga' }
                ].map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{
                        padding: '0.5rem 1.25rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        fontWeight: 700, fontSize: '0.85rem',
                        background: tab === t.id ? 'white' : 'transparent',
                        color: tab === t.id ? '#1e293b' : '#64748b',
                        boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.2s'
                    }}>{t.label}</button>
                ))}
            </div>

            {tab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* LINE CHART */}
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '1.5rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)', height: 280
                    }}>
                        <p style={{ margin: '0 0 0.3rem', fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                            Evolución del Cumplimiento Mensual
                        </p>
                        <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                            % promedio de todos los indicadores por empresa
                        </p>
                        <ResponsiveContainer width="100%" height="80%" minWidth={0}>
                            <AreaChart data={comparisonData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gTYM" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gTAT" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.12} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} dy={8} />
                                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="TYM" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gTYM)" animationDuration={1200} />
                                <Area type="monotone" dataKey="TAT" stroke="#f59e0b" strokeWidth={2.5} fill="url(#gTAT)" animationDuration={1200} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* HEATMAP TABLE */}
                    <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
                        <p style={{ margin: '0 0 1rem', fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                            Semáforo por Área y Mes
                        </p>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#64748b', fontWeight: 700, borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>Área</th>
                                    <th style={{ textAlign: 'center', padding: '0.5rem 0.5rem', color: '#64748b', fontWeight: 700, borderBottom: '1px solid #f1f5f9' }}>Empresa</th>
                                    {months.map(m => (
                                        <th key={m} style={{ textAlign: 'center', padding: '0.5rem 0.5rem', color: '#64748b', fontWeight: 700, borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap', minWidth: 72 }}>
                                            {m.substring(0, 3)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {areas.map((area, ai) => {
                                    const tymRow = heatmapTYM.find(x => x.id === area.id);
                                    const tatRow = heatmapTAT.find(x => x.id === area.id);
                                    return (
                                        <React.Fragment key={area.id}>
                                            {['TYM', 'TAT'].map((co, ci) => {
                                                const row = co === 'TYM' ? tymRow : tatRow;
                                                return (
                                                    <tr key={co} style={{ background: ci === 0 ? '#fafafa' : 'white' }}>
                                                        {ci === 0 && (
                                                            <td rowSpan={2} style={{
                                                                padding: '0.5rem 0.75rem', fontWeight: 700, color: '#1e293b',
                                                                borderBottom: '2px solid #f1f5f9', verticalAlign: 'middle',
                                                                borderLeft: `3px solid ${area.color}`,
                                                                whiteSpace: 'nowrap'
                                                            }}>{area.name}</td>
                                                        )}
                                                        <td style={{
                                                            textAlign: 'center', padding: '0.4rem 0.5rem',
                                                            borderBottom: ci === 1 ? '2px solid #f1f5f9' : '1px dashed #f1f5f9',
                                                            fontWeight: 700, color: co === 'TYM' ? '#3b82f6' : '#f59e0b',
                                                            fontSize: '0.75rem'
                                                        }}>{co}</td>
                                                        {row?.months.map((m, mi) => (
                                                            <td key={mi} style={{ textAlign: 'center', padding: '0.4rem 0.25rem', borderBottom: ci === 1 ? '2px solid #f1f5f9' : '1px dashed #f1f5f9' }}>
                                                                <div style={{
                                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                                    width: 48, height: 28, borderRadius: 6,
                                                                    background: m.score !== null ? `${semColor(m.score)}20` : '#f8fafc',
                                                                    color: semColor(m.score),
                                                                    fontWeight: 800, fontSize: '0.75rem'
                                                                }}>
                                                                    {m.score !== null ? `${m.score}%` : '—'}
                                                                </div>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'areas' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Area selector */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {areas.map(a => (
                            <button key={a.id} onClick={() => setSelectedArea(a.id)} style={{
                                padding: '0.4rem 1rem', borderRadius: '20px', border: '2px solid',
                                borderColor: selectedArea === a.id ? a.color : '#e2e8f0',
                                background: selectedArea === a.id ? `${a.color}15` : 'white',
                                color: selectedArea === a.id ? a.color : '#64748b',
                                fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}>{a.name}</button>
                        ))}
                    </div>

                    {/* Linechart por empresa para el área seleccionada */}
                    {['TYM', 'TAT'].map(co => {
                        const areaColor = areas.find(a => a.id === selectedArea)?.color || '#3b82f6';
                        const coColor = co === 'TYM' ? '#3b82f6' : '#f59e0b';
                        const heatmap = co === 'TYM' ? heatmapTYM : heatmapTAT;
                        const chartData = heatmap.find(x => x.id === selectedArea)?.months || [];
                        return (
                            <div key={co} style={{
                                background: 'white', borderRadius: '16px', padding: '1.5rem',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)', height: 220
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                                            {areas.find(a => a.id === selectedArea)?.name} — {co}
                                        </p>
                                        <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                                            Cumplimiento % por mes
                                        </p>
                                    </div>
                                    <div style={{
                                        padding: '0.3rem 0.75rem', borderRadius: '20px',
                                        background: `${semColor(chartData[chartData.length - 1]?.score)}15`,
                                        color: semColor(chartData[chartData.length - 1]?.score),
                                        fontWeight: 800, fontSize: '0.85rem'
                                    }}>
                                        {chartData[chartData.length - 1]?.score ?? '—'}%
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height="75%" minWidth={0}>
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id={`g${co}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={coColor} stopOpacity={0.15} />
                                                <stop offset="95%" stopColor={coColor} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={6} />
                                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="score" name={co} stroke={coColor} strokeWidth={2.5} fill={`url(#g${co})`} animationDuration={1000} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        );
                    })}

                    {/* KPI grid para el área seleccionada */}
                    <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                        <p style={{ margin: '0 0 1rem', fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                            Indicadores de {areas.find(a => a.id === selectedArea)?.name}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                            {kpiData.filter(k => k.area === selectedArea).map(kpi => (
                                <div 
                                    key={kpi.id} 
                                    onClick={() => onViewHistory && onViewHistory(kpi)}
                                    style={{
                                        padding: '0.75rem 1rem', 
                                        borderRadius: '10px',
                                        background: kpi.hasData ? `${semColor(kpi.compliance)}10` : '#f8fafc',
                                        border: `1px solid ${kpi.hasData ? semColor(kpi.compliance) + '30' : '#e2e8f0'}`,
                                        cursor: onViewHistory ? 'pointer' : 'default',
                                        transition: 'all 0.2s'
                                    }}
                                    className="kpi-mini-card"
                                >
                                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b', fontWeight: 600, lineHeight: 1.3 }}>{kpi.name}</p>
                                    {kpi.hasData ? (
                                        <p style={{ margin: '0.4rem 0 0', fontWeight: 900, fontSize: '1.1rem', color: semColor(kpi.compliance) }}>
                                            {kpi.compliance}% {semLabel(kpi.compliance)}
                                        </p>
                                    ) : (
                                        <p style={{ margin: '0.4rem 0 0', color: '#cbd5e1', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Pendiente</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {tab === 'log' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="fade-in">
                    {/* FILTERS FOR LOG */}
                    <div style={{ 
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem',
                        background: 'white', padding: '1.25rem', borderRadius: '16px',
                        boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-soft)'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Filter size={12} /> Filtrar Área
                            </label>
                            <select 
                                value={logAreaFilter} 
                                onChange={(e) => setLogAreaFilter(e.target.value)}
                                style={{ 
                                    padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid var(--border-soft)', 
                                    background: 'var(--bg-soft)', fontWeight: 700, color: 'var(--text-main)', fontSize: '0.85rem',
                                    outline: 'none', cursor: 'pointer'
                                }}
                            >
                                <option value="all">Todas las Áreas</option>
                                {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🏢 Empresa</label>
                            <select 
                                value={logCompanyFilter} 
                                onChange={(e) => setLogCompanyFilter(e.target.value)}
                                style={{ 
                                    padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid var(--border-soft)', 
                                    background: 'var(--bg-soft)', fontWeight: 700, color: 'var(--text-main)', fontSize: '0.85rem',
                                    outline: 'none', cursor: 'pointer'
                                }}
                            >
                                <option value="all">Todas</option>
                                <option value="TYM">Tiendas y Marcas (TYM)</option>
                                <option value="TAT">TAT Distribuciones</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📅 Período Mensual</label>
                            <select 
                                value={logMonthFilter} 
                                onChange={(e) => setLogMonthFilter(e.target.value)}
                                style={{ 
                                    padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid var(--border-soft)', 
                                    background: 'var(--bg-soft)', fontWeight: 700, color: 'var(--text-main)', fontSize: '0.85rem',
                                    outline: 'none', cursor: 'pointer'
                                }}
                            >
                                <option value="all">Histórico Completo</option>
                                {['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', gridColumn: 'span 1' }}>
                            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Search size={12} /> Buscar por Nombre
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type="text"
                                    placeholder="Nombre del indicador..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                                    style={{ 
                                        padding: '0.6rem 1rem 0.6rem 2.2rem', borderRadius: '10px', border: '1px solid var(--border-soft)', 
                                        background: 'var(--bg-soft)', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem', width: '100%',
                                        outline: 'none'
                                    }}
                                />
                                <Search size={14} color="var(--text-light)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
                            </div>
                        </div>
                    </div>

                    {/* ACTIVITY SUMMARY STATS */}
                    {(() => {
                        const filtered = [...rawUpdates].reverse().filter(log => {
                            const kpi = kpiData.find(k => k.id === log.kpi_id);
                            const matchesArea = logAreaFilter === 'all' || kpi?.area === logAreaFilter;
                            const matchesCompany = logCompanyFilter === 'all' || log.company_id === logCompanyFilter;
                            const dateSource = log.updated_at || log.created_at || log.period || log.additional_data?.period;
                            const itemPeriodFull = dateSource ? (typeof dateSource === 'string' ? dateSource.substring(0, 10) : new Date(dateSource).toISOString().substring(0, 10)) : null;
                            const itemPeriodMonth = (itemPeriodFull && typeof itemPeriodFull === 'string') ? itemPeriodFull.substring(0, 7) : null;
                            const matchesMonth = logMonthFilter === 'all' || itemPeriodMonth === logMonthFilter;
                            const matchesSearch = !searchQuery || (kpi?.name || log.kpi_id).toLowerCase().includes(searchQuery);
                            return matchesArea && matchesCompany && matchesMonth && matchesSearch;
                        });

                        const missingCount = filtered.filter(l => l.additional_data?.faltanteInventario).length;
                        const metaCount = filtered.filter(l => l.additional_data?.type === 'META_UPDATE').length;

                        return (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                    {[
                                        { label: 'Cargas Totales', value: filtered.length, icon: <BarChart3 size={20} />, color: 'var(--brand)' },
                                        { label: 'Alertas de Faltante', value: missingCount, icon: <AlertTriangle size={20} />, color: 'var(--danger)', animate: missingCount > 0 },
                                        { label: 'Cambios en Meta', value: metaCount, icon: <Target size={20} />, color: 'var(--warning)' }
                                    ].map((s, i) => (
                                        <div key={i} style={{ 
                                            background: 'white', padding: '1rem', borderRadius: '16px', 
                                            border: `1px solid ${s.color}15`, boxShadow: 'var(--shadow-sm)',
                                            display: 'flex', alignItems: 'center', gap: '1rem'
                                        }}>
                                            <div style={{ 
                                                width: '40px', height: '40px', borderRadius: '12px', background: `${s.color}10`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color
                                            }} className={s.animate ? 'pulse-danger' : ''}>
                                                {s.icon}
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>{s.label}</p>
                                                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>{s.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ 
                                    background: 'white', borderRadius: '20px', padding: '2rem', 
                                    boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-soft)',
                                    minHeight: '400px'
                                }}>
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>Flujo de Actividad</h3>
                                        <p style={{ margin: '0.25rem 0 0', color: 'var(--text-light)', fontSize: '0.85rem' }}>Registro cronológico de actualizaciones y reportes</p>
                                    </div>

                                    {filtered.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-soft)', borderRadius: '16px', border: '2px dashed var(--border-soft)' }}>
                                            <Search size={48} color="var(--text-light)" style={{ marginBottom: '1rem' }} />
                                            <p style={{ color: 'var(--text-light)', fontWeight: 600 }}>No se encontraron registros con los filtros actuales.</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                            {(() => {
                                                // Group by day
                                                const groups = {};
                                                filtered.forEach(log => {
                                                    const dateObj = new Date(log.updated_at || log.created_at);
                                                    const day = dateObj.toLocaleDateString('es-CO', { 
                                                        weekday: 'long', day: 'numeric', month: 'long' 
                                                    });
                                                    if (!groups[day]) groups[day] = [];
                                                    groups[day].push(log);
                                                });

                                                return Object.keys(groups).map((day, gi) => (
                                                    <div key={gi} style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                                                        {/* Sticky Day Header */}
                                                        <div style={{ 
                                                            position: 'sticky', top: '0', zIndex: 10, background: 'white', 
                                                            padding: '0.5rem 0', margin: '0.5rem 0 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' 
                                                        }}>
                                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--brand)', boxShadow: '0 0 0 4px var(--brand-bg)' }} />
                                                            <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'var(--brand)', textTransform: 'capitalize' }}>{day}</h4>
                                                            <div style={{ flexGrow: 1, height: '1px', background: 'linear-gradient(to right, var(--border-soft), transparent)' }} />
                                                        </div>

                                                        {/* Activity Vertical Line */}
                                                        <div style={{ position: 'absolute', left: '20px', top: '30px', bottom: '0', width: '2px', background: 'var(--bg-soft)' }} />

                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                            {groups[day].map((log, li) => {
                                                                const kpi = kpiData.find(k => k.id === log.kpi_id);
                                                                const date = new Date(log.updated_at || log.created_at);
                                                                const brand = log.brand || log.additional_data?.brand || 'Global';
                                                                const isMeta = log.additional_data?.type === 'META_UPDATE';
                                                                const isFaltante = log.additional_data?.faltanteInventario;
                                                                const areaObj = areas.find(a => a.id === kpi?.area);

                                                                const isInverse = kpi ? isInverseKPI(kpi.id) : false;

                                                                const meta = (kpi?.meta && typeof kpi.meta === 'object')
                                                                    ? (kpi.meta[brand] || kpi.meta[log.company_id] || Object.values(kpi.meta)[0])
                                                                    : kpi?.meta;
                                                                
                                                                let compliance = null;
                                                                if (meta && !isMeta) {
                                                                    if (isInverse) {
                                                                        compliance = log.value === 0 ? 100 : Math.min((meta / log.value) * 100, 100);
                                                                    } else {
                                                                        compliance = meta === 0 ? (log.value === 0 ? 100 : 0) : Math.min((log.value / meta) * 100, 100);
                                                                    }
                                                                }
                                                                const statusColor = compliance === null ? 'var(--text-light)' : compliance >= 95 ? 'var(--success)' : compliance >= 85 ? 'var(--warning)' : 'var(--danger)';
                                                                
                                                                return (
                                                                    <div key={li} style={{ 
                                                                        display: 'grid', gridTemplateColumns: '100px 1fr auto auto', gap: '1rem', alignItems: 'center',
                                                                        padding: '1rem', borderRadius: '12px', 
                                                                        background: isFaltante ? 'var(--danger-bg)' : 'var(--bg-soft)',
                                                                        border: `1px solid ${isFaltante ? 'var(--danger)30' : 'var(--border-soft)'}`,
                                                                        transition: 'all 0.2s ease',
                                                                        position: 'relative',
                                                                        cursor: 'pointer'
                                                                    }} 
                                                                    className="activity-row"
                                                                    onClick={() => onViewHistory && kpi && onViewHistory(kpi)}
                                                                    >
                                                                        {/* TIME */}
                                                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-light)' }}>
                                                                            {date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                                        </div>

                                                                        {/* CONTENT */}
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                                                <span style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: '0.95rem' }}>{kpi?.name || log.kpi_id}</span>
                                                                                <span style={{ 
                                                                                    fontSize: '0.65rem', background: `${areaObj?.color || 'var(--brand)'}15`, 
                                                                                    color: areaObj?.color || 'var(--brand)', padding: '2px 8px', borderRadius: '6px', fontWeight: 800, textTransform: 'uppercase' 
                                                                                }}>
                                                                                    {areaObj?.name || 'General'}
                                                                                </span>
                                                                                {isMeta && <span style={{ fontSize: '0.65rem', background: 'var(--warning-bg)', color: 'var(--warning)', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>META</span>}
                                                                                {isFaltante && <span style={{ fontSize: '0.65rem', background: 'var(--danger)', color: 'white', padding: '2px 8px', borderRadius: '6px', fontWeight: 900, animation: 'pulse-danger 2s infinite' }}>FALTANTE</span>}
                                                                            </div>
                                                                            
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>
                                                                                    Sede: <span style={{ color: 'var(--text-muted)' }}>{log.company_id}</span>
                                                                                </span>
                                                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>
                                                                                    Marca: <span style={{ color: 'var(--brand)', fontWeight: 800 }}>{brand}</span>
                                                                                </span>
                                                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>
                                                                                    Responsable: <span style={{ color: 'var(--text-muted)' }}>{log.cargo || 'Audit'}</span>
                                                                                </span>
                                                                            </div>

                                                                            {log.additional_data?.detalleFaltante && (
                                                                                <div style={{ 
                                                                                    marginTop: '0.4rem', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.5)', 
                                                                                    borderRadius: '8px', borderLeft: '3px solid var(--danger)', fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--danger)'
                                                                                }}>
                                                                                    "{log.additional_data.detalleFaltante}"
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* VALUE */}
                                                                        <div style={{ textAlign: 'right', minWidth: '90px' }}>
                                                                            <div style={{ 
                                                                                display: 'inline-flex', flexDirection: 'column', alignItems: 'center', 
                                                                                padding: '0.5rem 0.75rem', background: 'white', borderRadius: '12px', 
                                                                                boxShadow: 'var(--shadow-sm)', border: `1px solid ${statusColor}40`
                                                                            }}>
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                                                    {!isMeta && <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor }} />}
                                                                                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: isFaltante ? 'var(--danger)' : 'var(--text-main)' }}>
                                                                                        {log.value}{kpi?.unit === '%' ? '%' : ''}
                                                                                    </span>
                                                                                </div>
                                                                                <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>{isMeta ? 'Nueva Meta' : 'Valor'}</span>
                                                                            </div>
                                                                        </div>

                                                                        {/* ACTION */}
                                                                        <div style={{ paddingLeft: '0.5rem' }}>
                                                                            <div style={{ 
                                                                                width: '32px', height: '32px', borderRadius: '50%', background: 'white', 
                                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-soft)',
                                                                                color: 'var(--text-light)'
                                                                            }}>
                                                                                <ChevronRight size={18} />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

export default ExecutiveHistory;
