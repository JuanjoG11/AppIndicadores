import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAreaById } from '../data/areas';
import KPIDetailCard from '../components/dashboard/KPIDetailCard';
import KPIDataForm from '../components/forms/KPIDataForm';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const AreaDashboard = ({ kpiData, currentUser, onUpdateKPI }) => {
    const { areaId } = useParams();
    const area = getAreaById(areaId);
    const [editingKPI, setEditingKPI] = useState(null);

    // Restricted access: Manager (Gerente) cannot edit
    const canModify = currentUser?.role !== 'Gerente';

    if (!area) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>Área no encontrada</p>
            </div>
        );
    }

    const areaKPIs = kpiData.filter(kpi => kpi.area === areaId);
    const kpisWithData = areaKPIs.filter(kpi => kpi.hasData);
    const kpisPending = areaKPIs.filter(kpi => !kpi.hasData);

    const greenCount = areaKPIs.filter(kpi => kpi.semaphore === 'green').length;
    const redCount = areaKPIs.filter(kpi => kpi.semaphore !== 'green').length;

    const distributionData = [
        { name: 'Cumple Meta', value: greenCount, color: 'var(--success)' },
        { name: 'No Cumple', value: redCount, color: 'var(--danger)' }
    ].filter(item => item.value > 0);

    const complianceData = kpisWithData
        .filter(kpi => kpi.compliance)
        .slice(0, 10)
        .map(kpi => ({
            name: kpi.name.length > 20 ? kpi.name.substring(0, 20) + '...' : kpi.name,
            cumplimiento: kpi.compliance,
            color: kpi.semaphore === 'green' ? 'var(--success)' : 'var(--danger)'
        }));

    const handleSaveKPI = (kpiId, data) => {
        if (onUpdateKPI) {
            onUpdateKPI(kpiId, data);
        }
        setEditingKPI(null);
    };

    return (
        <div className="dashboard fade-in">
            <div className="app-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ color: 'var(--brand)', fontWeight: 800 }}>{area.name}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{area.description}</p>
                </div>
                <div style={{ textAlign: 'right', padding: '1rem', background: 'var(--bg-soft)', borderRadius: 'var(--radius-lg)' }}>
                    <small style={{ color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>CUMPLIMIENTO GRUPAL</small>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-accent)' }}>
                        {distributionData.length > 0 ? Math.round((greenCount / areaKPIs.length) * 100) : 0}%
                    </div>
                </div>
            </div>

            {/* Main Visual Panels */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h4 className="section-title">Distribución de Estado</h4>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={distributionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {distributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <h4 className="section-title">Análisis de Cumplimiento</h4>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={complianceData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-soft)" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip cursor={{ fill: 'var(--bg-soft)' }} />
                            <Bar dataKey="cumplimiento" radius={[10, 10, 0, 0]} barSize={40}>
                                {complianceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Visual KPI Grid */}
            <h3 className="section-title">Indicadores del Proceso</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
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
                    onSave={handleSaveKPI}
                    onCancel={() => setEditingKPI(null)}
                />
            )}
        </div>
    );
};

export default AreaDashboard;
