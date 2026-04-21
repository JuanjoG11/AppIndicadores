import React, { useMemo, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell, Legend
} from 'recharts';
import { areas } from '../../data/areas';

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
            const isInverse = kpi.id.includes('devueltos') || kpi.id.includes('gasto') ||
                kpi.id.includes('horas-extras') || kpi.id.includes('mal-estado') ||
                kpi.id.includes('vencida') || kpi.id === 'segundos-unidad-separada' ||
                kpi.id === 'notas-errores-venta' || kpi.id.includes('nomina') ||
                kpi.id === 'rotacion-personal' || kpi.id === 'ausentismo' ||
                kpi.id === 'he-rn-nomina' || kpi.id === 'tiempo-contratacion';

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
                const isInverse = kpi.id.includes('devueltos') || kpi.id.includes('gasto') ||
                    kpi.id.includes('horas-extras') || kpi.id.includes('mal-estado') ||
                    kpi.id.includes('vencida') || kpi.id === 'segundos-unidad-separada' ||
                    kpi.id === 'notas-errores-venta' || kpi.id.includes('nomina') ||
                    kpi.id === 'rotacion-personal' || kpi.id === 'ausentismo' ||
                    kpi.id === 'he-rn-nomina' || kpi.id === 'tiempo-contratacion';
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
    return '#ef4444';
};

const semLabel = (score) => {
    if (score === null || score === undefined) return 'S.D.';
    if (score >= 95) return '🟢';
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

const ExecutiveHistory = ({ kpiData, rawUpdates = [] }) => {
    const [tab, setTab] = useState('overview'); // 'overview' | 'areas' | 'log'
    const [selectedArea, setSelectedArea] = useState('logistica');
    const [logAreaFilter, setLogAreaFilter] = useState('all');
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
                        <ResponsiveContainer width="100%" height="80%">
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
                                <ResponsiveContainer width="100%" height="75%">
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
                                <div key={kpi.id} style={{
                                    padding: '0.75rem 1rem', borderRadius: '10px',
                                    background: kpi.hasData ? `${semColor(kpi.compliance)}10` : '#f8fafc',
                                    border: `1px solid ${kpi.hasData ? semColor(kpi.compliance) + '30' : '#e2e8f0'}`
                                }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="fade-in">
                    {/* FILTERS FOR LOG */}
                    <div style={{ 
                        display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center',
                        background: 'white', padding: '1.25rem 1.5rem', borderRadius: '16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>📦 Área</label>
                            <select 
                                value={logAreaFilter} 
                                onChange={(e) => setLogAreaFilter(e.target.value)}
                                style={{ 
                                    padding: '0.6rem 2.5rem 0.6rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', 
                                    background: '#f8fafc', fontWeight: 700, color: '#1e293b', fontSize: '0.85rem'
                                }}
                            >
                                <option value="all">Todas las Áreas</option>
                                {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>📅 Período (Mes)</label>
                            <select 
                                value={logMonthFilter} 
                                onChange={(e) => setLogMonthFilter(e.target.value)}
                                style={{ 
                                    padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', 
                                    background: '#f8fafc', fontWeight: 700, color: '#1e293b', fontSize: '0.85rem'
                                }}
                            >
                                <option value="all">Ver Historico Completo</option>
                                {['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexGrow: 1 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>🔍 Buscar Indicador</label>
                            <input 
                                type="text"
                                placeholder="Escribe el nombre del KPI..."
                                onChange={(e) => {
                                    const search = e.target.value.toLowerCase();
                                    // I'll filter rawUpdates inside the map, so I don't need another state here
                                    // But let's add one for clarity
                                    setSearchQuery(search);
                                }}
                                style={{ 
                                    padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', 
                                    background: '#f8fafc', fontWeight: 500, color: '#1e293b', fontSize: '0.85rem', width: '100%'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>
                                    Bitácora Cronológica de Carga
                                </p>
                                <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                                    Listado detallado de todas las actividades registradas
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {(() => {
                                const filtered = [...rawUpdates].reverse().filter(log => {
                                    const kpi = kpiData.find(k => k.id === log.kpi_id);
                                    const matchesArea = logAreaFilter === 'all' || kpi?.area === logAreaFilter;
                                    const itemPeriodFull = (log.period || log.additional_data?.period || (log.updated_at ? (typeof log.updated_at === 'string' ? log.updated_at.substring(0, 10) : new Date(log.updated_at).toISOString().substring(0, 10)) : null));
                                    const itemPeriodMonth = (itemPeriodFull && typeof itemPeriodFull === 'string') ? itemPeriodFull.substring(0, 7) : null;
                                    const matchesMonth = logMonthFilter === 'all' || itemPeriodMonth === logMonthFilter;
                                    const matchesSearch = !searchQuery || (kpi?.name || log.kpi_id).toLowerCase().includes(searchQuery);
                                    return matchesArea && matchesMonth && matchesSearch;
                                });

                                if (filtered.length === 0) {
                                    return (
                                        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                                            <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>No hay registros que coincidan con los filtros seleccionados.</p>
                                        </div>
                                    );
                                }

                                // Group by day
                                const groups = {};
                                filtered.forEach(log => {
                                    const day = new Date(log.updated_at || log.created_at).toLocaleDateString('es-CO', { 
                                        weekday: 'long', day: 'numeric', month: 'long' 
                                    });
                                    if (!groups[day]) groups[day] = [];
                                    groups[day].push(log);
                                });

                                return Object.keys(groups).map((day, gi) => (
                                    <div key={gi} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <h5 style={{ 
                                            margin: gi === 0 ? '0 0 0.5rem' : '1.5rem 0 0.5rem', 
                                            fontSize: '0.8rem', fontWeight: 800, color: 'var(--brand)', 
                                            textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                        }}>
                                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                                            {day}
                                        </h5>
                                        <div style={{ overflowX: 'auto', background: '#fcfcfc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                                <thead>
                                                    <tr style={{ background: '#f1f5f940', textAlign: 'left' }}>
                                                        <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.75rem' }}>Hora</th>
                                                        <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.75rem' }}>Indicador / Área</th>
                                                        <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.75rem', textAlign: 'center' }}>Marca</th>
                                                        <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.75rem', textAlign: 'right' }}>Valor</th>
                                                        <th style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.75rem', textAlign: 'center' }}>Responsable</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {groups[day].map((log, li) => {
                                                        const kpi = kpiData.find(k => k.id === log.kpi_id);
                                                        const date = new Date(log.updated_at || log.created_at);
                                                        const brand = log.brand || log.additional_data?.brand || 'Global';
                                                        const isMeta = log.additional_data?.type === 'META_UPDATE';
                                                        
                                                        return (
                                                            <tr key={li} style={{ borderTop: '1px solid #f1f5f9' }}>
                                                                <td style={{ padding: '0.8rem 1rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                                    {date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                                </td>
                                                                <td style={{ padding: '0.8rem 1rem' }}>
                                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                        <span style={{ color: '#1e293b', fontWeight: 800 }}>{kpi?.name || log.kpi_id}</span>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.02em', fontWeight: 700 }}>
                                                                                {kpi?.area || 'General'}
                                                                            </span>
                                                                            {log.additional_data?.faltanteInventario && (
                                                                                <span style={{ 
                                                                                    fontSize: '0.65rem', background: '#fef2f2', color: '#ef4444', 
                                                                                    border: '1px solid #fee2e2', borderRadius: '4px', padding: '1px 5px',
                                                                                    fontWeight: 800, textTransform: 'uppercase'
                                                                                }}>
                                                                                    Faltante
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        {log.additional_data?.detalleFaltante && (
                                                                            <span style={{ 
                                                                                fontSize: '0.75rem', color: '#b91c1c', marginTop: '0.2rem', 
                                                                                fontStyle: 'italic', maxWidth: '300px' 
                                                                            }}>
                                                                                "{log.additional_data.detalleFaltante}"
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td style={{ textAlign: 'center', padding: '0.8rem 1rem' }}>
                                                                    <span style={{ 
                                                                        padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 900,
                                                                        background: brand === 'Global' ? '#f1f5f9' : '#3b82f615',
                                                                        color: brand === 'Global' ? '#64748b' : '#3b82f6',
                                                                        border: `1px solid ${brand === 'Global' ? '#e2e8f0' : '#3b82f620'}`
                                                                    }}>
                                                                        {brand}
                                                                    </span>
                                                                </td>
                                                                <td style={{ textAlign: 'right', padding: '0.8rem 1rem' }}>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                                        <span style={{ fontWeight: 900, color: '#1e293b', fontSize: '1rem' }}>
                                                                            {log.value}{kpi?.unit === '%' ? '%' : ''}
                                                                        </span>
                                                                        {isMeta && <span style={{ fontSize: '0.65rem', color: 'var(--brand)', fontWeight: 800 }}>META</span>}
                                                                    </div>
                                                                </td>
                                                                <td style={{ textAlign: 'center', padding: '0.8rem 1rem' }}>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                                                        <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.75rem' }}>{log.cargo || 'Audit'}</span>
                                                                        <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>{log.company_id}</span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExecutiveHistory;
