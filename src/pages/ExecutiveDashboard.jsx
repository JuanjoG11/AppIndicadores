import React, { useState, useMemo } from 'react';
import MetricSummary from '../components/dashboard/MetricSummary';
import DynamicAreaGrid from '../components/dashboard/DynamicAreaGrid';
import ExecutiveHistory from '../components/dashboard/ExecutiveHistory';
import { filterKPIsByEntity } from '../utils/kpiHelpers';
import { calculateOverallScore } from '../data/mockData';
import { isInverseKPI } from '../utils/kpiCalculations';
import { LayoutGrid, TrendingUp, Calendar, Clock, FileText, ChevronDown, Activity, ArrowRight } from 'lucide-react';


const ExecutiveDashboard = ({ kpiData, rawUpdates, activeCompany, setActiveCompany, onViewHistory, selectedMonth }) => {
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'trend'
    const [activeHistoryTab, setActiveHistoryTab] = useState('overview');

    // Filter KPIs based on selected entity using the utility
    const baseKPIs = filterKPIsByEntity(kpiData, activeCompany);

    // Project KPIs to the selected month using history
    const filteredKPIs = useMemo(() => {
        const currentMonthName = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][new Date().getMonth()];
        const isCurrentMonth = selectedMonth === currentMonthName;

        return baseKPIs.map(kpi => {
            // KPIs del mes actual: SIEMPRE usar datos en vivo (independientemente de hasData)
            // Esto evita que un hasData:false incorrectamente oculte datos del mes actual
            if (isCurrentMonth) return kpi;

            const historyEntry = kpi.history?.find(h => h.month === selectedMonth);
            let val = historyEntry ? historyEntry[activeCompany] : null;

            if (val === null || val === undefined) {
                return { 
                    ...kpi, 
                    hasData: false, 
                    compliance: 0, 
                    currentValue: 0, 
                    semaphore: 'gray', 
                    brandValues: {},
                    additionalData: { ...kpi.additionalData, updatedAt: null, period: null }
                };
            }

            // Recalculate compliance for the projected value
            const targetMeta = (kpi.meta && typeof kpi.meta === 'object')
                ? (kpi.meta[activeCompany] || Object.values(kpi.meta)[0])
                : kpi.meta;

            const isInverse = isInverseKPI(kpi.id);
            let compliance = 0;
            if (targetMeta === 0) {
                compliance = isInverse ? (val === 0 ? 100 : 0) : (val > 0 ? 100 : 0);
            } else {
                compliance = isInverse ? (targetMeta / val) * 100 : (val / targetMeta) * 100;
                if (isInverse && val === 0) compliance = 100;
            }
            compliance = Math.min(Math.max(Math.round(compliance || 0), 0), 100);

            let semaphore = 'red';
            const isStrict = ['revision-margenes', 'revision-precios', 'pedidos-facturados', 'impresion-facturas', 'fiabilidad-inventarios', 'planillas-separadas', 'pedidos-separar-total'].includes(kpi.id);
            if (compliance >= (isStrict ? 100 : 95)) semaphore = 'green';
            else if (compliance >= (isStrict ? 100 : 85)) semaphore = 'yellow';

            // Reconstruir brandValues proyectados para que el desglose histórico sea visible
            const projectedBrandValues = {};
            if (kpi.meta && typeof kpi.meta === 'object') {
                Object.keys(kpi.meta).forEach(brand => {
                    const brandKey = `${activeCompany}-${brand.toUpperCase()}`;
                    const brandVal = historyEntry ? historyEntry[brandKey] : null;
                    
                    if (brandVal !== null && brandVal !== undefined) {
                        projectedBrandValues[brandKey] = {
                            currentValue: brandVal,
                            compliance: Math.round(historyEntry[`${brandKey}-COMP`] || 0),
                            semaphore: historyEntry[`${brandKey}-SEM`] || 'gray',
                            hasData: true,
                            additionalData: {
                                updatedAt: historyEntry.updatedAt,
                                period: historyEntry.monthKey || historyEntry.month,
                                brand
                            }
                        };
                    }
                });
            }

            return {
                ...kpi,
                currentValue: val,
                compliance,
                semaphore,
                hasData: true,
                lastUpdate: historyEntry?.updatedAt || historyEntry?.[`${activeCompany}-UPDATED`] || kpi.lastUpdate,
                additionalData: historyEntry ? { 
                    ...kpi.additionalData, 
                    updatedAt: historyEntry.updatedAt || historyEntry[`${activeCompany}-UPDATED`],
                    period: historyEntry.monthKey || historyEntry.month
                } : {
                    ...kpi.additionalData,
                    updatedAt: null,
                    period: null
                },
                brandValues: projectedBrandValues
            };
        });
    }, [baseKPIs, selectedMonth, activeCompany]);

    const overallScore = useMemo(() => calculateOverallScore(filteredKPIs), [filteredKPIs]);



    const handleGoToLog = () => {
        setViewMode('trend');
        setActiveHistoryTab('log');
    };

    const overallScoreColor = overallScore >= 95 ? 'var(--success)' : overallScore >= 80 ? 'var(--warning)' : 'var(--danger)';

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
                                <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: 600 }}>
                                <Clock size={12} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
                                Actualizado: {new Date().toLocaleString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                        </div>
                    </div>

                    <div style={{ height: '40px', width: '1px', background: 'var(--border-soft)' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                            width: '48px', height: '48px', borderRadius: '14px', background: `${overallScoreColor}15`, 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: overallScoreColor
                        }}>
                            <Activity size={24} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>Cumplimiento Global</p>
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 950, color: overallScoreColor }}>
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

