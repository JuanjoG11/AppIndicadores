import React from 'react';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, Tooltip, ResponsiveContainer, Cell,
    RadialBarChart, RadialBar, AreaChart, Area
} from 'recharts';
import { calculateOverallScore, calculateAreaScore } from '../../data/mockData';
import { areas } from '../../data/areas';
import { Activity, Target, ShieldCheck, AlertTriangle } from 'lucide-react';

const MetricSummary = ({ kpiData, horizontal }) => {
    const kpisWithData = kpiData.filter(kpi => kpi.hasData);
    const overallScore = calculateOverallScore(kpiData);

    // Prepare chart data for area comparison
    const chartData = areas.map(area => ({
        name: area.name,
        score: calculateAreaScore(kpiData, area.id),
        color: area.color
    })).sort((a, b) => b.score - a.score);

    // Mock history for sparklines
    const mockHistory = (baseValue, variance) => {
        return Array.from({ length: 6 }, (_, i) => ({
            value: baseValue + (Math.random() * variance * 2 - variance)
        }));
    };

    const metrics = [
        {
            title: 'Cumplimiento Total',
            value: overallScore ? `${overallScore}%` : '0%',
            color: 'var(--brand)',
            icon: <Activity size={18} />,
            history: mockHistory(overallScore || 0, 5)
        },
        {
            title: 'KPIs en Verde',
            value: kpiData.filter(k => k.semaphore === 'green').length,
            color: 'var(--success)',
            icon: <ShieldCheck size={18} />,
            history: mockHistory(kpiData.filter(k => k.semaphore === 'green').length, 2)
        },
        {
            title: 'KPIs en Rojo',
            value: kpiData.filter(k => k.semaphore === 'red').length,
            color: 'var(--danger)',
            icon: <AlertTriangle size={18} />,
            history: mockHistory(kpiData.filter(k => k.semaphore === 'red').length, 1)
        }
    ];

    const radialData = [
        { name: 'Total', value: overallScore, fill: 'var(--brand)' }
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'white',
                    padding: '0.75rem',
                    border: '1px solid var(--border-soft)',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-md)'
                }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{payload[0].payload.name}</p>
                    <p style={{ margin: 0, color: 'var(--brand)', fontSize: '1.1rem', fontWeight: 800 }}>{payload[0].value}%</p>
                </div>
            );
        }
        return null;
    };

    const Sparkline = ({ data, color }) => (
        <div style={{ height: '30px', width: '80px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        fill={color}
                        fillOpacity={0.1}
                        strokeWidth={1.5}
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );

    if (horizontal) {
        return (
            <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '2rem' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                        {metrics.map((m, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <div style={{ color: m.color, background: `${m.color}15`, padding: '0.5rem', borderRadius: '10px', display: 'flex' }}>
                                        {m.icon}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.title}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingLeft: '0.2rem' }}>
                                    <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{m.value}</span>
                                    <Sparkline data={m.history} color={m.color} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ height: '200px', width: '100%', marginTop: '-1rem' }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                <PolarGrid stroke="var(--border-soft)" />
                                <PolarAngleAxis
                                    dataKey="name"
                                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ stroke: 'var(--brand)', strokeWidth: 1 }}
                                />
                                <Radar
                                    name="Cumplimiento"
                                    dataKey="score"
                                    stroke="var(--brand)"
                                    fill="var(--brand)"
                                    fillOpacity={0.2}
                                    animationDuration={1500}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{ width: '220px', height: '220px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <RadialBarChart
                            innerRadius="70%"
                            outerRadius="100%"
                            data={radialData}
                            startAngle={180}
                            endAngle={-180}
                        >
                            <RadialBar
                                minAngle={15}
                                background={{ fill: 'var(--bg-soft)' }}
                                clockWise={true}
                                dataKey="value"
                                cornerRadius={10}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div style={{ position: 'absolute', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--brand)', lineHeight: 1 }}>{overallScore}%</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>Efectividad</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-3">
            {metrics.map((m, i) => (
                <div key={i} className="card" style={{ background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div className="card-header" style={{ marginBottom: 0, padding: 0, border: 'none', boxShadow: 'none' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.title}</span>
                                <div style={{ color: m.color, background: `${m.color}15`, padding: '0.4rem', borderRadius: '8px', display: 'flex' }}>
                                    {React.cloneElement(m.icon, { size: 16 })}
                                </div>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{m.value}</div>
                        </div>
                        <Sparkline data={m.history} color={m.color} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MetricSummary;
