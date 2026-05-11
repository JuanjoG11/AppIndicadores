import React, { useState, useMemo } from 'react';
import MetricSummary from '../components/dashboard/MetricSummary';
import DynamicAreaGrid from '../components/dashboard/DynamicAreaGrid';
import ExecutiveHistory from '../components/dashboard/ExecutiveHistory';
import { filterKPIsByEntity } from '../utils/kpiHelpers';
import { calculateOverallScore } from '../data/mockData';
import { isInverseKPI } from '../utils/kpiCalculations';
import { LayoutGrid, TrendingUp, Calendar, Clock, FileText, ChevronDown, Activity, ArrowRight } from 'lucide-react';

const ExecutiveDashboard = ({ kpiData, rawUpdates, activeCompany, setActiveCompany, onViewHistory }) => {
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'trend'
    const [activeHistoryTab, setActiveHistoryTab] = useState('overview');
    const [selectedMonth, setSelectedMonth] = useState('Mayo'); // Default to current month in the system

    // Filter KPIs based on selected entity using the utility
    const baseKPIs = filterKPIsByEntity(kpiData, activeCompany);

    // Project KPIs to the selected month using history
    const filteredKPIs = useMemo(() => {
        // If current month is selected, we use the live data
        const currentMonthName = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'][new Date().getMonth()];
        // if (selectedMonth === currentMonthName) return baseKPIs; // Optional: always project for consistency

        return baseKPIs.map(kpi => {
            const historyEntry = kpi.history?.find(h => h.month === selectedMonth);
            const value = historyEntry ? historyEntry[activeCompany] : null;

            if (value === null || value === undefined) {
                return { ...kpi, hasData: false, compliance: 0, currentValue: 0, semaphore: 'gray' };
            }

            // Recalculate compliance for the projected value
            const targetMeta = (kpi.meta && typeof kpi.meta === 'object')
                ? (kpi.meta[activeCompany] || Object.values(kpi.meta)[0])
                : kpi.meta;

            const isInverse = isInverseKPI(kpi.id);
            let compliance = 0;
            if (targetMeta === 0) {
                compliance = isInverse ? (value === 0 ? 100 : 0) : (value > 0 ? 100 : 0);
            } else {
                compliance = isInverse ? (targetMeta / value) * 100 : (value / targetMeta) * 100;
                if (isInverse && value === 0) compliance = 100;
            }
            compliance = Math.min(Math.max(Math.round(compliance || 0), 0), 100);

            let semaphore = 'red';
            const isStrict = ['revision-margenes', 'revision-precios', 'pedidos-facturados', 'impresion-facturas'].includes(kpi.id);
            if (compliance >= (isStrict ? 100 : 95)) semaphore = 'green';
            else if (compliance >= (isStrict ? 100 : 85)) semaphore = 'yellow';

            return {
                ...kpi,
                currentValue: value,
                compliance,
                semaphore,
                hasData: true
            };
        });
    }, [baseKPIs, selectedMonth, activeCompany]);

    const overallScore = useMemo(() => calculateOverallScore(filteredKPIs), [filteredKPIs]);

    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];

    const handleGoToLog = () => {
        setViewMode('trend');
        setActiveHistoryTab('log');
    };

    return (
        <div className="dashboard fade-in" style={{
            height: 'calc(100vh - 64px)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '1.5rem',
            gap: '1.5rem',
            background: 'var(--bg-app)'
        }}>
            {/* 1. PREMIUM EXECUTIVE HEADER */}
            <div style={{ 
                background: 'white', padding: '1.5rem 2rem', borderRadius: '24px', 
                boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-soft)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                            Panel de Control Estratégico
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-soft)', padding: '0.3rem 0.75rem', borderRadius: '8px' }}>
                                <Calendar size={14} color="var(--brand)" />
                                <select 
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    style={{ 
                                        border: 'none', background: 'transparent', fontWeight: 800, color: 'var(--text-main)', 
                                        fontSize: '0.85rem', outline: 'none', cursor: 'pointer', textTransform: 'uppercase'
                                    }}
                                >
                                    {months.map(m => <option key={m} value={m}>{m} 2026</option>)}
                                </select>
                            </div>
                            <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: 600 }}>
                                <Clock size={12} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
                                Actualizado: Hoy, 03:45 PM
                            </span>
                        </div>
                    </div>

                    <div style={{ height: '40px', width: '1px', background: 'var(--border-soft)' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                            width: '48px', height: '48px', borderRadius: '14px', background: 'var(--brand-bg)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)'
                        }}>
                            <Activity size={24} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>Cumplimiento Global</p>
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 950, color: overallScore >= 95 ? 'var(--success)' : 'var(--brand)' }}>
                                {overallScore ? `${overallScore}%` : '0%'}
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {/* BITACORA SHORTCUT */}
                    <button 
                        onClick={handleGoToLog}
                        style={{ 
                            background: 'var(--text-main)', color: 'white', border: 'none', padding: '0.75rem 1.25rem',
                            borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.6rem', transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        className="btn-bitacora"
                    >
                        <FileText size={18} />
                        Ver Bitácora de Carga
                        <ArrowRight size={16} />
                    </button>

                    <div style={{ height: '40px', width: '1px', background: 'var(--border-soft)' }} />

                    {/* ENTITY SELECTOR */}
                    <div style={{
                        background: 'var(--bg-soft)', padding: '0.3rem', borderRadius: '14px',
                        display: 'flex', gap: '0.3rem'
                    }}>
                        {['TYM', 'TAT'].map(entity => (
                            <button
                                key={entity}
                                onClick={() => setActiveCompany(entity)}
                                style={{
                                    padding: '0.5rem 1.25rem', borderRadius: '10px', border: 'none',
                                    fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
                                    background: activeCompany === entity ? 'white' : 'transparent',
                                    color: activeCompany === entity ? 'var(--brand)' : 'var(--text-light)',
                                    transition: 'all 0.2s',
                                    boxShadow: activeCompany === entity ? 'var(--shadow-sm)' : 'none'
                                }}
                            >
                                {entity}
                            </button>
                        ))}
                    </div>

                    {/* VIEW TOGGLE */}
                    <div style={{
                        background: 'var(--bg-soft)', padding: '0.3rem', borderRadius: '14px',
                        display: 'flex', gap: '0.3rem'
                    }}>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{
                                padding: '0.5rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                background: viewMode === 'grid' ? 'white' : 'transparent',
                                color: viewMode === 'grid' ? 'var(--brand)' : 'var(--text-light)',
                                boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('trend')}
                            style={{
                                padding: '0.5rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                background: viewMode === 'trend' ? 'white' : 'transparent',
                                color: viewMode === 'trend' ? 'var(--brand)' : 'var(--text-light)',
                                boxShadow: viewMode === 'trend' ? 'var(--shadow-sm)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <TrendingUp size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. KPI SUMMARY (Now more compact since we have the total in the header) */}
            <div style={{ flexShrink: 0 }}>
                <MetricSummary kpiData={filteredKPIs} horizontal />
            </div>

            {/* 3. MAIN CONTENT */}
            {viewMode === 'grid' ? (
                <div>
                    <DynamicAreaGrid kpiData={filteredKPIs} />
                </div>
            ) : (
                <div className="fade-in">
                    <ExecutiveHistory 
                        kpiData={kpiData} 
                        rawUpdates={rawUpdates} 
                        onViewHistory={onViewHistory} 
                        activeTab={activeHistoryTab}
                        onTabChange={setActiveHistoryTab}
                    />
                </div>
            )}
        </div>
    );
};

export default ExecutiveDashboard;

