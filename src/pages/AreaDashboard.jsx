import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAreaById } from '../data/areas';
import KPIDetailCard from '../components/dashboard/KPIDetailCard';
import KPIDataForm from '../components/forms/KPIDataForm';
import { filterKPIsByEntity } from '../utils/kpiHelpers';
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
import {
    ArrowLeft,
    LayoutDashboard,
    Activity,
    PieChart as PieIcon,
    TrendingUp,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';

const AreaDashboard = ({ kpiData, activeCompany, currentUser, onUpdateKPI }) => {
    const { areaId } = useParams();
    const navigate = useNavigate();
    const area = getAreaById(areaId);
    const [editingKPI, setEditingKPI] = useState(null);

    // Restricted access: Manager (Gerente) cannot edit
    const canModify = currentUser?.role !== 'Gerente';

    if (!area) {
        return (
            <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Área no encontrada</h3>
                <button onClick={() => navigate('/')} className="btn-ghost" style={{ marginTop: '1rem' }}>Volver al Inicio</button>
            </div>
        );
    }

    // Filter data by company FIRST, then by area
    const companyKPIs = filterKPIsByEntity(kpiData, activeCompany || 'TYM');
    const areaKPIs = companyKPIs.filter(kpi => kpi.area === areaId);
    const kpisWithData = areaKPIs.filter(kpi => kpi.hasData);

    const greenCount = areaKPIs.filter(kpi => kpi.semaphore === 'green').length;
    const redCount = areaKPIs.filter(kpi => kpi.semaphore !== 'green' && kpi.hasData).length;
    const pendingCount = areaKPIs.filter(kpi => !kpi.hasData).length;

    const radarData = areaKPIs.map(kpi => ({
        subject: kpi.name.length > 20 ? kpi.name.substring(0, 17) + '...' : kpi.name,
        fullValue: kpi.name,
        value: kpi.compliance || 0
    }));

    const complianceData = kpisWithData
        .filter(kpi => kpi.compliance)
        .slice(0, 10)
        .map(kpi => ({
            name: kpi.name.length > 15 ? kpi.name.substring(0, 15) + '...' : kpi.name,
            cumplimiento: kpi.compliance,
            color: kpi.semaphore === 'green' ? '#059669' : '#ef4444'
        }));

    const handleSaveKPI = (kpiId, data) => {
        if (onUpdateKPI) {
            onUpdateKPI(kpiId, data);
        }
        setEditingKPI(null);
    };

    const groupCompliance = areaKPIs.length > 0 ? Math.round((greenCount / areaKPIs.length) * 100) : 0;

    return (
        <div style={{ padding: 'clamp(1rem, 5vw, 2rem) clamp(1rem, 5vw, 3rem)', background: 'var(--bg-app)', minHeight: 'calc(100vh - 64px)' }}>
            {/* Header with Navigation */}
            <div className="area-dashboard-header" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: 'white', border: '1px solid #e2e8f0',
                            padding: '0.4rem 0.8rem', borderRadius: '12px',
                            fontSize: '0.8rem', fontWeight: 700, color: '#64748b',
                            cursor: 'pointer', marginBottom: '1.5rem',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                    >
                        <ArrowLeft size={14} /> Volver
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '48px', height: '48px', background: area.color,
                            borderRadius: '14px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1)'
                        }}>
                            <LayoutDashboard size={24} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>
                                {area.name}
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.5rem' }}>{area.description}</p>
                        </div>
                    </div>
                </div>

                <div className="glass" style={{
                    padding: '1.5rem 2.5rem',
                    borderRadius: '24px',
                    background: 'white',
                    border: '1px solid #f1f5f9',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-premium)'
                }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                        Salud de Ejecución
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: groupCompliance > 80 ? '#059669' : '#f59e0b' }}>
                        {groupCompliance}%
                    </div>
                </div>
            </div>

            {/* Top Analytics Row */}
            <div className="radar-container" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '3rem' }}>
                <div className="card premium-shadow" style={{ padding: '2rem', borderRadius: '32px', background: 'white', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ color: 'var(--brand)' }}><Activity size={20} /></div>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: '#1e293b', textTransform: 'uppercase' }}>Equilibrio de Indicadores</h4>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div style={{
                                                background: 'white',
                                                padding: '0.75rem',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '12px',
                                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                                fontSize: '0.8rem'
                                            }}>
                                                <p style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{payload[0].payload.fullValue}</p>
                                                <p style={{ margin: 0, color: area.color, fontWeight: 800 }}>{payload[0].value}%</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Radar
                                name={area.name}
                                dataKey="value"
                                stroke={area.color}
                                fill={area.color}
                                fillOpacity={0.3}
                                animationDuration={1000}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card premium-shadow" style={{ padding: '2rem', borderRadius: '32px', background: 'white', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ color: 'var(--brand)' }}><TrendingUp size={20} /></div>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: '#1e293b', textTransform: 'uppercase' }}>Análisis de Cumplimiento</h4>
                    </div>
                    <ResponsiveContainer width="100%" height={220} minWidth={0} debounce={50}>
                        <BarChart data={complianceData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                            />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                            />
                            <Bar dataKey="cumplimiento" radius={[8, 8, 8, 8]} barSize={32}>
                                {complianceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Grid Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{ width: '24px', height: '4px', background: 'var(--brand)', borderRadius: '2px' }}></div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    Indicadores del Proceso
                </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                {areaKPIs.map(kpi => (
                    <KPIDetailCard
                        key={kpi.id}
                        kpi={kpi}
                        canEdit={canModify}
                        onEdit={setEditingKPI}
                    />
                ))}
            </div>

            {/* Form Modal */}
            {editingKPI && (
                <KPIDataForm
                    kpi={editingKPI}
                    currentUser={currentUser}
                    onSave={handleSaveKPI}
                    onCancel={() => setEditingKPI(null)}
                />
            )}

            {/* Info Footer */}
            <div style={{
                marginTop: '5rem',
                padding: '2rem',
                background: '#f8fafc',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                border: '1px solid #f1f5f9'
            }}>
                <div style={{ color: 'var(--brand)' }}><ShieldCheck size={32} strokeWidth={1.5} /></div>
                <div style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    Estos indicadores son monitoreados bajo la responsabilidad de <strong>{area.responsable}</strong>.
                    Toda la información visualizada se actualiza en tiempo real desde la consola de alimentación.
                </div>
            </div>
        </div>
    );
};

export default AreaDashboard;
