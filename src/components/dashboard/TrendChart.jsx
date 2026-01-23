import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const TrendChart = ({ data, kpiName, unit, target }) => {
    return (
        <div className="card">
            <div className="card-header">
                <h4 className="card-title">{kpiName} - Tendencia (6 meses)</h4>
            </div>
            <div className="card-body">
                <ResponsiveContainer width="100%" height={300} minWidth={0}>
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="month"
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            stroke="#d1d5db"
                        />
                        <YAxis
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            stroke="#d1d5db"
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                        />
                        <Legend />
                        <ReferenceLine
                            y={target}
                            stroke="#f59e0b"
                            strokeDasharray="5 5"
                            label={{ value: 'Meta', fill: '#f59e0b', fontSize: 12 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', r: 5 }}
                            activeDot={{ r: 7 }}
                            name="Valor Real"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TrendChart;
