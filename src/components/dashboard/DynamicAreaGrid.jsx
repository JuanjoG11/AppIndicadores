import React from 'react';
import { useNavigate } from 'react-router-dom';
import { areas } from '../../data/areas';
import { calculateAreaScore } from '../../data/mockData';

import {
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';

const AreaMiniCard = ({ area, score, kpiData }) => {
    const navigate = useNavigate();

    // Construir sparkline desde el historial real de los KPIs del área
    const history = React.useMemo(() => {
        const areaKpis = kpiData.filter(k => k.area === area.id && k.history?.length);
        if (areaKpis.length === 0) return [];

        // Recopilar monthKeys únicos
        const monthKeys = new Set();
        areaKpis.forEach(k => k.history.forEach(h => { if (h.monthKey) monthKeys.add(h.monthKey); }));
        const sorted = [...monthKeys].sort().slice(-6); // últimos 6 meses

        return sorted.map(mk => {
            let total = 0; let count = 0;
            areaKpis.forEach(kpi => {
                const pt = kpi.history.find(h => h.monthKey === mk);
                if (!pt) return;
                const compKeys = Object.keys(pt).filter(k => k.endsWith('-COMP'));
                if (compKeys.length > 0) {
                    compKeys.forEach(ck => { if (pt[ck] != null) { total += pt[ck]; count++; } });
                } else {
                    const val = pt.TYM ?? pt.TAT;
                    if (val != null && kpi.targetMeta) {
                        const c = Math.min((val / kpi.targetMeta) * 100, 100);
                        if (!isNaN(c)) { total += c; count++; }
                    }
                }
            });
            return { value: count > 0 ? Math.round(total / count) : null };
        }).filter(p => p.value !== null);
    }, [kpiData, area.id]);

    const statusColor = score >= 95 ? 'var(--success)' : score >= 80 ? 'var(--warning)' : 'var(--danger)';
    const statusText = score >= 95 ? 'CUMPLE' : score >= 80 ? 'ACEPTABLE' : 'CRÍTICO';

    return (
        <div
            onClick={() => navigate(`/area/${area.id}`)}
            className="card area-card"
            style={{
                padding: '1.25rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                background: 'white',
                borderLeft: `4px solid ${statusColor}`
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>{area.name}</h4>
                    <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: statusColor,
                        background: `${statusColor}10`,
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        marginTop: '0.25rem',
                        display: 'inline-block'
                    }}>
                        {statusText}
                    </span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {score}%
                </div>
            </div>

            <div style={{ height: '40px', marginTop: '1rem' }}>
                {history.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <AreaChart data={history}>
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={area.color}
                                fill={area.color}
                                fillOpacity={0.1}
                                strokeWidth={2}
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : null}
            </div>
        </div>
    );
};

const DynamicAreaGrid = ({ kpiData }) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem'
        }}>
            {areas.map(area => (
                <AreaMiniCard
                    key={area.id}
                    area={area}
                    score={calculateAreaScore(kpiData, area.id) || 0}
                    kpiData={kpiData}
                />
            ))}
        </div>
    );
};

export default DynamicAreaGrid;
