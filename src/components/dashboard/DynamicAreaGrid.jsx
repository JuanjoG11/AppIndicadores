import React from 'react';
import { useNavigate } from 'react-router-dom';
import { areas } from '../../data/areas';
import { calculateAreaScore } from '../../data/mockData';
import {
    ResponsiveContainer,
    Area,
    AreaChart,
    Tooltip
} from 'recharts';

const AreaMiniCard = ({ area, score, kpiData }) => {
    const navigate = useNavigate();

    // Mock history for sparkline
    const history = [
        { value: score - 5 },
        { value: score - 2 },
        { value: score + 3 },
        { value: score - 1 },
        { value: score }
    ];

    const statusColor = score >= 80 ? 'var(--success)' : 'var(--danger)';

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
                borderLeft: `4px solid ${area.color}`
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
                        {score >= 80 ? 'CUMPLE' : 'CRÍTICO'}
                    </span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {score}%
                </div>
            </div>

            <div style={{ height: '40px', marginTop: '1rem' }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <AreaChart data={history}>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={area.color}
                            fill={area.color}
                            fillOpacity={0.1}
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const DynamicAreaGrid = ({ kpiData }) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
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
