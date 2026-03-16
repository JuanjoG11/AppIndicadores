import React, { useState } from 'react';
import {
    ResponsiveContainer,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Cell
} from 'recharts';
import { Activity, TrendingUp, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AreaAnalytics = ({ radarData, complianceData, areaColor, areaName, kpisWithData }) => {
    const [isChartExpanded, setIsChartExpanded] = useState(false);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            {/* Radar Balance Chart */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card premium-shadow" 
                style={{ padding: '2rem', borderRadius: '32px', background: 'var(--bg-card)', border: '1px solid var(--border-soft)' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                    <div style={{ color: 'var(--brand)', background: 'var(--brand-bg)', p: '8px', borderRadius: '12px' }}>
                        <Activity size={20} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Equilibrio de Indicadores
                    </h4>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="var(--border-soft)" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: 'var(--text-soft)', fontSize: 10, fontWeight: 600 }}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div style={{
                                            background: 'var(--bg-card)',
                                            padding: '1rem',
                                            border: '1px solid var(--border-soft)',
                                            borderRadius: '16px',
                                            boxShadow: 'var(--shadow-lg)',
                                            fontSize: '0.85rem'
                                        }}>
                                            <p style={{ margin: '0 0 0.25rem 0', fontWeight: 800, color: 'var(--text-main)' }}>{payload[0].payload.fullValue}</p>
                                            <p style={{ margin: 0, color: areaColor, fontWeight: 900, fontSize: '1.1rem' }}>{payload[0].value}%</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Radar
                            name={areaName}
                            dataKey="value"
                            stroke={areaColor}
                            fill={areaColor}
                            fillOpacity={0.2}
                            animationDuration={1500}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Compliance Bar Chart */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card premium-shadow" 
                style={{ padding: '2rem', borderRadius: '32px', background: 'var(--bg-card)', border: '1px solid var(--border-soft)' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ color: 'var(--brand)', background: 'var(--brand-bg)', p: '8px', borderRadius: '12px' }}>
                            <TrendingUp size={20} />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Análisis de Cumplimiento
                        </h4>
                    </div>
                    <button
                        onClick={() => setIsChartExpanded(true)}
                        className="btn-ghost"
                        style={{ padding: '8px', borderRadius: '10px' }}
                    >
                        <Maximize2 size={18} />
                    </button>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={complianceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-soft)" opacity={0.5} />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 9, fill: 'var(--text-soft)', fontWeight: 600 }}
                            tickFormatter={(name) => name.length > 15 ? name.substring(0, 12) + '...' : name}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                            cursor={{ fill: 'var(--bg-hover)', opacity: 0.4 }}
                            contentStyle={{ 
                                borderRadius: '16px', 
                                border: '1px solid var(--border-soft)', 
                                background: 'var(--bg-card)',
                                boxShadow: 'var(--shadow-lg)' 
                            }}
                        />
                        <Bar dataKey="cumplimiento" radius={[10, 10, 10, 10]} barSize={24}>
                            {complianceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Expanded Chart Modal */}
            <AnimatePresence>
                {isChartExpanded && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.9)',
                            zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '2rem', backdropFilter: 'blur(12px)'
                        }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="card" 
                            style={{
                                width: '100%', maxWidth: '1200px', height: '85vh',
                                background: 'var(--bg-card)', borderRadius: '32px', padding: '3rem',
                                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                border: '1px solid var(--border-soft)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                                        Análisis Detallado de Cumplimiento
                                    </h3>
                                    <p style={{ color: 'var(--text-soft)', fontSize: '1.1rem', margin: '0.5rem 0 0', fontWeight: 500 }}>
                                        Distribución de metas vs realidad para {areaName}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsChartExpanded(false)}
                                    className="btn-primary"
                                    style={{
                                        padding: '0.75rem 1.5rem', borderRadius: '16px',
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        fontWeight: 900
                                    }}
                                >
                                    <X size={20} /> CERRAR
                                </button>
                            </div>

                            <div style={{ flex: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={kpisWithData.map(k => ({
                                            name: k.name,
                                            cumplimiento: k.compliance,
                                            color: k.semaphore === 'green' ? '#10b981' : '#f43f5e'
                                        }))}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-soft)" opacity={0.3} />
                                        <XAxis
                                            dataKey="name"
                                            angle={-45}
                                            textAnchor="end"
                                            interval={0}
                                            tick={{ fontSize: 11, fill: 'var(--text-soft)', fontWeight: 700 }}
                                            height={100}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            domain={[0, 100]}
                                            tick={{ fontSize: 13, fill: 'var(--text-soft)', fontWeight: 600 }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(val) => `${val}%`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'var(--bg-hover)', opacity: 0.3 }}
                                            contentStyle={{
                                                borderRadius: '20px',
                                                border: '1px solid var(--border-soft)',
                                                boxShadow: 'var(--shadow-2xl)',
                                                padding: '1.25rem',
                                                background: 'var(--bg-card)'
                                            }}
                                            formatter={(val) => [`${val}%`, 'Cumplimiento']}
                                        />
                                        <Bar dataKey="cumplimiento" radius={[12, 12, 0, 0]} barSize={50}>
                                            {kpisWithData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.compliance >= 100 ? '#10b981' : '#f43f5e'}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AreaAnalytics;
