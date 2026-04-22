import React, { useMemo, useState } from 'react';
import { 
    X, 
    TrendingUp, 
    FileText, 
    History, 
    Calendar, 
    User, 
    Target, 
    Activity,
    Layers,
    ChevronRight,
    ChevronDown,
    Clock,
    BarChart3,
    Filter
} from 'lucide-react';
import { 
    BarChart,
    Bar,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell,
    ReferenceLine
} from 'recharts';
import { formatKPIValue, formatDateTime } from '../../utils/formatters';

const KPIHistoryModal = ({ kpi, rawUpdates, onClose, activeCompany }) => {
    const [chartMode, setChartMode] = useState('summary'); // 'summary' (months) | 'detailed' (all points)
    const [expandedMonth, setExpandedMonth] = useState(new Date().toLocaleString('es-ES', { month: 'long' }));
    const [modalBrand, setModalBrand] = useState('all');
    const [selectedMonthBrand, setSelectedMonthBrand] = useState(null); // filter inside expanded month

    if (!kpi) return null;

    const availableBrands = useMemo(() => {
        if (!kpi.meta || typeof kpi.meta !== 'object') return [];
        return Object.keys(kpi.meta).filter(b => b !== 'TAT' && b !== 'TYM' && b !== 'Global');
    }, [kpi.meta]);

    // Filter and process logs for this KPI
    const kpiLogs = useMemo(() => {
        const logs = [...rawUpdates]
            .filter(log => log.kpi_id === kpi.id)
            .filter(log => {
                if (modalBrand === 'all') return true;
                const logBrand = log.additional_data?.brand || log.brand;
                return logBrand === modalBrand;
            })
            .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
        
        // Group logs by Month
        const grouped = {};
        logs.forEach(log => {
            const date = new Date(log.updated_at || log.created_at);
            const monthName = date.toLocaleString('es-ES', { month: 'long' });
            const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
            
            if (!grouped[capitalizedMonth]) grouped[capitalizedMonth] = [];
            grouped[capitalizedMonth].push(log);
        });
        
        return grouped;
    }, [rawUpdates, kpi.id]);

    // Format individual points for the detailed chart
    const detailedData = useMemo(() => {
        return [...rawUpdates]
            .filter(log => log.kpi_id === kpi.id)
            .filter(log => {
                if (modalBrand === 'all') return true;
                const logBrand = log.additional_data?.brand || log.brand;
                return logBrand === modalBrand;
            })
            .sort((a, b) => new Date(a.updated_at || a.created_at) - new Date(b.updated_at || b.created_at))
            .map(log => ({
                date: new Date(log.updated_at || log.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
                fullDate: formatDateTime(log.updated_at || log.created_at),
                value: log.value,
                period: log.additional_data?.period,
                brand: log.additional_data?.brand
            }));
    }, [rawUpdates, kpi.id, modalBrand]);

    const isInverse = kpi.id.includes('devueltos') || kpi.id.includes('gasto') || 
                      kpi.id.includes('horas-extras') || kpi.id.includes('mal-estado') ||
                      kpi.id.includes('vencida') || kpi.id === 'segundos-unidad-separada' ||
                      kpi.id === 'notas-errores-venta' || kpi.id.includes('nomina') ||
                      kpi.id === 'rotacion-personal' || kpi.id === 'ausentismo';

    const color = kpi.semaphore === 'green' ? '#10b981' : (kpi.semaphore === 'yellow' ? '#f59e0b' : '#ef4444');

    const renderLogItem = (log) => {
        const isMeta = log.additional_data?.type === 'META_UPDATE';
        const period = log.additional_data?.period; 
        const brand = log.additional_data?.brand || log.brand;
        const logDate = new Date(log.updated_at || log.created_at);
        
        // Humanize period — if no granular tag exists, derive from the actual timestamp
        let periodLabel;
        if (period && period.includes('-Q')) {
            // Quincenal: 2026-04-Q1 → '1ra Quincena'
            periodLabel = period.split('-').pop() === 'Q1' ? '1ra Quincena' : '2da Quincena';
        } else if (period && period.includes('-W')) {
            // Semanal: 2026-W17 → 'Semana 17'
            const weekNum = period.split('-W').pop();
            periodLabel = `Semana ${weekNum}`;
        } else if (period && period.split('-').length === 3 && !period.includes('Q') && !period.includes('W')) {
            // Diario con fecha exacta: 2026-04-21 → 'Día 21'
            periodLabel = `Día ${new Date(period + 'T12:00:00').getDate()}`;
        } else if (isMeta) {
            // Actualización de meta
            periodLabel = 'Actualización de Meta';
        } else {
            // Sin etiqueta de periodo guardada → derivar del timestamp real del registro
            const freq = kpi.frecuencia?.toUpperCase() || 'DIARIO';
            if (freq.includes('QUINCENAL')) {
                periodLabel = logDate.getDate() <= 15 ? '1ra Quincena' : '2da Quincena';
            } else if (freq.includes('SEMANAL')) {
                // Calcular número de semana aproximado
                const startOfYear = new Date(logDate.getFullYear(), 0, 1);
                const weekNum = Math.ceil(((logDate - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
                periodLabel = `Semana ${weekNum}`;
            } else {
                // Diario o Mensual sin tag → mostrar el día exacto de la carga
                periodLabel = `Día ${logDate.getDate()}`;
            }
        }

        // Determine a color for the period badge based on whether it's meta or data
        const periodBg = isMeta ? '#e0f2fe' : '#f0fdf4';
        const periodColor = isMeta ? '#0369a1' : '#16a34a';

        return (
            <div key={log.id || Math.random()} style={{
                background: 'white',
                padding: '1rem 1.25rem',
                borderRadius: '20px',
                border: '1px solid #f1f5f9',
                marginBottom: '0.75rem',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
            }}>
                {/* LEFT: Period Badge - most important info */}
                <div style={{
                    minWidth: '60px',
                    textAlign: 'center',
                    background: periodBg,
                    borderRadius: '14px',
                    padding: '0.6rem 0.5rem',
                    flexShrink: 0
                }}>
                    <div style={{ fontSize: '0.55rem', fontWeight: 800, color: periodColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                        {isMeta ? 'META' : kpi.frecuencia || 'CARGA'}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 950, color: periodColor, lineHeight: 1 }}>
                        {periodLabel}
                    </div>
                </div>

                {/* CENTER: Brand + Timestamp + Cargo */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                        {brand && brand !== 'Global' && (
                            <span style={{
                                background: 'var(--brand)',
                                color: 'white',
                                fontSize: '0.6rem',
                                fontWeight: 900,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em'
                            }}>
                                {brand}
                            </span>
                        )}
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                            {formatDateTime(log.updated_at || log.created_at)}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <User size={11} color="#cbd5e1" />
                        <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>
                            {log.cargo || 'Sistema'} · {log.company_id}
                        </span>
                    </div>
                </div>

                {/* RIGHT: Value */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 950, color: isMeta ? 'var(--brand)' : '#0f172a' }}>
                        {formatKPIValue(log.value, kpi.unit)}
                    </div>
                    {isMeta && <div style={{ fontSize: '0.55rem', color: 'var(--brand)', fontWeight: 800, textTransform: 'uppercase' }}>Nueva Meta</div>}
                </div>
            </div>
        );
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(12px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'fade-in 0.3s ease-out'
        }}>
            <div className="card scale-in" style={{
                width: '100%',
                maxWidth: '1100px',
                height: '92vh',
                background: 'white',
                borderRadius: '32px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                {/* Header Premium */}
                <div style={{
                    padding: '1.75rem 2.5rem',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                            color: 'white',
                            borderRadius: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 8px 16px -4px ${color}44`
                        }}>
                            <TrendingUp size={28} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                                {kpi.name}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem' }}>
                                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{kpi.area}</span>
                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }}></span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--brand)', fontWeight: 800 }}>Frecuencia: {kpi.frecuencia || 'Mensual'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={onClose}
                        style={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            color: '#64748b',
                            width: '44px',
                            height: '44px',
                            borderRadius: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) 380px' }}>
                    
                    {/* LEFT: Dashboard Logic */}
                    <div style={{ padding: '2.5rem', borderRight: '1px solid #f1f5f9' }}>
                        
                        {/* Summary Numbers */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#64748b' }}>
                                    <Activity size={16} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resultado Actual</span>
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 950, color: '#0f172a' }}>
                                    {formatKPIValue(kpi.currentValue, kpi.unit)}
                                </div>
                                <div style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '0.35rem',
                                    fontSize: '0.8rem',
                                    fontWeight: 900,
                                    color: color,
                                    marginTop: '0.5rem',
                                    background: `${color}10`,
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '10px'
                                }}>
                                    {kpi.compliance}% de Meta
                                </div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#64748b' }}>
                                    <Target size={16} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {modalBrand === 'all' ? 'Meta Consolidada' : `Meta ${modalBrand}`}
                                    </span>
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 950, color: '#0f172a' }}>
                                    {modalBrand === 'all' 
                                        ? formatKPIValue(kpi.targetMeta, kpi.unit) 
                                        : formatKPIValue(kpi.meta[modalBrand], kpi.unit)}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.5rem', fontWeight: 700 }}>
                                    {isInverse ? 'Tendencia: Menor es Mejor' : 'Tendencia: Mayor es Mejor'}
                                </div>
                            </div>
                            <div style={{ 
                                background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`, 
                                padding: '1.5rem', 
                                borderRadius: '24px', 
                                color: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', opacity: 0.9 }}>
                                    <History size={16} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Estado</span>
                                </div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 950 }}>
                                    {kpi.compliance >= 95 ? 'SOBRESALIENTE' : (kpi.compliance >= 85 ? 'CUMPLIENDO' : 'EN RIESGO')}
                                </div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '0.5rem', opacity: 0.9 }}>
                                    Corte: {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                        </div>
                        
                        {/* Brand Breakdown Grid - EXTREMELY IMPORTANT FOR TRANSPARENCY */}
                        {availableBrands.length > 0 && (
                            <div style={{ marginBottom: '2.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                                    <Layers size={18} color="#94a3b8" />
                                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Estado por Marca
                                    </h4>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                                    {availableBrands.map(brand => {
                                        const brandKey = `${activeCompany}-${brand}`;
                                        const bData = kpi.brandValues?.[brandKey];
                                        const hasData = bData?.hasData;
                                        const bColor = hasData ? (bData.semaphore === 'green' ? '#10b981' : (bData.semaphore === 'red' ? '#ef4444' : '#f59e0b')) : '#cbd5e1';
                                        
                                        return (
                                            <div 
                                                key={brand}
                                                onClick={() => setModalBrand(brand)}
                                                style={{ 
                                                    padding: '1rem', 
                                                    background: modalBrand === brand ? 'var(--brand-bg)' : 'white', 
                                                    borderRadius: '16px', 
                                                    border: `1px solid ${modalBrand === brand ? 'var(--brand)' : '#f1f5f9'}`,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    position: 'relative',
                                                    boxShadow: modalBrand === brand ? '0 4px 12px var(--brand-bg)' : 'none'
                                                }}
                                            >
                                                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{brand}</div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                                    <div style={{ fontSize: '1.25rem', fontWeight: 950, color: hasData ? '#1e293b' : '#94a3b8' }}>
                                                        {hasData ? `${bData.compliance}%` : '--'}
                                                    </div>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: bColor, marginBottom: '4px' }}></div>
                                                </div>
                                                {!hasData && <div style={{ fontSize: '0.55rem', color: '#ef4444', fontWeight: 800, marginTop: '0.2rem' }}>SIN CARGAR</div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Chart Area - Single clean BarChart */}
                        <div style={{ 
                            background: 'white', 
                            padding: '2rem', 
                            borderRadius: '28px', 
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 4px 20px -10px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <History size={20} color="var(--brand)" /> 
                                    Cumplimiento Mensual por Proveedor
                                </h4>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {availableBrands.length > 0 ? availableBrands.map((b, i) => {
                                        const dotColors = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6'];
                                        return (
                                            <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColors[i % dotColors.length] }} />
                                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{b}</span>
                                            </div>
                                        );
                                    }) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>{activeCompany}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p style={{ margin: '0 0 1.5rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                                % de cumplimiento vs. meta — {kpi.unit === '%' ? 'escala porcentaje' : `en ${kpi.unit}`}
                            </p>

                            {/* Single BarChart: compliance % per month, grouped by brand */}
                            {(() => {
                                const dotColors = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6'];
                                const brands = availableBrands.length > 0 ? availableBrands : [activeCompany];

                                // Build chart data from rawUpdates grouped by month
                                const monthMap = {};
                                rawUpdates
                                    .filter(u => u.kpi_id === kpi.id)
                                    .forEach(u => {
                                        const d = new Date(u.updated_at || u.created_at);
                                        const monthKey = d.toLocaleString('es-ES', { month: 'short' }).replace('.','');
                                        const brand = u.additional_data?.brand || activeCompany;
                                        if (!monthMap[monthKey]) monthMap[monthKey] = { month: monthKey };
                                        if (!monthMap[monthKey][brand]) monthMap[monthKey][brand] = { total: 0, count: 0 };
                                        monthMap[monthKey][brand].total += (u.value || 0);
                                        monthMap[monthKey][brand].count++;
                                    });

                                const chartData = Object.values(monthMap).map(row => {
                                    const out = { month: row.month };
                                    brands.forEach(b => {
                                        const meta = (kpi.meta && typeof kpi.meta === 'object')
                                            ? (kpi.meta[b] || kpi.meta[activeCompany] || 0)
                                            : (kpi.targetMeta || 0);
                                        const avg = row[b] ? row[b].total / row[b].count : null;
                                        out[b] = avg !== null && meta > 0
                                            ? Math.min(Math.round((avg / meta) * 100), 100)
                                            : null;
                                    });
                                    return out;
                                });

                                if (chartData.length === 0) {
                                    return (
                                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', flexDirection: 'column', gap: '1rem' }}>
                                            <History size={48} />
                                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#94a3b8' }}>Sin datos históricos aún</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div style={{ height: '300px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} barCategoryGap="20%" barGap={4}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis
                                                    dataKey="month"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}
                                                    dy={8}
                                                />
                                                <YAxis
                                                    domain={[0, 100]}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                                    tickFormatter={v => `${v}%`}
                                                    dx={-4}
                                                />
                                                <ReferenceLine y={95} stroke="#10b981" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: 'Meta 95%', position: 'insideTopRight', fontSize: 10, fill: '#10b981', fontWeight: 700 }} />
                                                <Tooltip
                                                    cursor={{ fill: 'rgba(99,102,241,0.05)', radius: 8 }}
                                                    content={({ active, payload, label }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div style={{ background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(8px)', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minWidth: '160px' }}>
                                                                    <p style={{ margin: '0 0 0.6rem', fontWeight: 900, fontSize: '0.85rem', textTransform: 'capitalize' }}>{label}</p>
                                                                    {payload.map((p, i) => p.value !== null && (
                                                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.25rem' }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.fill }} />
                                                                                <span style={{ fontSize: '0.75rem', color: '#cbd5e1', textTransform: 'uppercase' }}>{p.dataKey}</span>
                                                                            </div>
                                                                            <span style={{ fontWeight: 900, fontSize: '0.9rem', color: p.value >= 95 ? '#10b981' : p.value >= 85 ? '#f59e0b' : '#ef4444' }}>{p.value}%</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                {brands.map((b, i) => (
                                                    <Bar key={b} dataKey={b} fill={dotColors[i % dotColors.length]} radius={[6,6,0,0]} maxBarSize={28} animationDuration={1000}>
                                                        {chartData.map((entry, idx) => {
                                                            const v = entry[b];
                                                            const c = v === null ? '#e2e8f0' : v >= 95 ? '#10b981' : v >= 85 ? '#f59e0b' : '#ef4444';
                                                            return <Cell key={idx} fill={c} fillOpacity={v === null ? 0.3 : 1} />;
                                                        })}
                                                    </Bar>
                                                ))}
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* RIGHT: Granular Audit Log */}
                    <div style={{ 
                        background: '#f8fafc', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        borderLeft: '1px solid #f1f5f9' 
                    }}>
                        <div style={{ padding: '1.75rem 2rem', background: 'white', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <FileText size={22} color="var(--brand)" /> 
                                    Bitácora de Carga
                                </h4>
                                <Filter size={18} color="#94a3b8" />
                            </div>
                            <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Trazabilidad por mes y periodo</p>
                        </div>
                        
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                            {Object.keys(kpiLogs).length > 0 ? (
                                Object.entries(kpiLogs).map(([month, logs]) => (
                                    <div key={month} style={{ marginBottom: '2rem' }}>
                                        {/* Month header - clean, no brand pills */}
                                        <button 
                                            onClick={() => {
                                                setExpandedMonth(expandedMonth === month ? null : month);
                                                setSelectedMonthBrand(null); // reset brand filter on close
                                            }}
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '0.85rem 1.25rem',
                                                background: expandedMonth === month ? 'var(--brand-bg)' : '#f1f5f9',
                                                border: expandedMonth === month ? '1px solid var(--brand)' : '1px solid transparent',
                                                borderRadius: '14px',
                                                cursor: 'pointer',
                                                marginBottom: '0.75rem',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <span style={{ fontSize: '0.9rem', fontWeight: 900, color: expandedMonth === month ? 'var(--brand)' : '#1e293b', textTransform: 'capitalize' }}>
                                                {month}
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', background: 'white', padding: '2px 10px', borderRadius: '8px' }}>
                                                    {logs.length} {logs.length === 1 ? 'registro' : 'registros'}
                                                </span>
                                                {expandedMonth === month ? <ChevronDown size={16} color="var(--brand)" /> : <ChevronRight size={16} color="#94a3b8" />}
                                            </div>
                                        </button>
                                        
                                        {expandedMonth === month && (() => {
                                            // ── Brand Breakdown for this month ──
                                            const brandSummary = {};
                                            logs.forEach(log => {
                                                const b = log.additional_data?.brand || log.brand || 'Global';
                                                if (!brandSummary[b]) brandSummary[b] = { count: 0, total: 0 };
                                                brandSummary[b].count++;
                                                brandSummary[b].total += (log.value || 0);
                                            });
                                            const brandEntries = Object.entries(brandSummary).filter(([b]) => b !== 'Global');
                                            const hasBrands = brandEntries.length > 1;

                                            // Filter logs by selected brand within this month
                                            const visibleLogs = selectedMonthBrand
                                                ? logs.filter(l => (l.additional_data?.brand || l.brand) === selectedMonthBrand)
                                                : logs;

                                            return (
                                                <div style={{ paddingLeft: '0.5rem' }}>
                                                    {/* Provider breakdown - each row is clickable */}
                                                    {hasBrands && (
                                                        <div style={{
                                                            background: '#f8fafc',
                                                            borderRadius: '16px',
                                                            padding: '1rem 1.25rem',
                                                            marginBottom: '1rem',
                                                            border: '1px solid #e2e8f0'
                                                        }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                                    Desglose por Proveedor — {month}
                                                                </div>
                                                                {selectedMonthBrand && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setSelectedMonthBrand(null)}
                                                                        style={{ background: '#e2e8f0', border: 'none', borderRadius: '8px', padding: '2px 10px', fontSize: '0.6rem', fontWeight: 800, color: '#64748b', cursor: 'pointer' }}
                                                                    >
                                                                        ✕ Todos
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                                {brandEntries.map(([brand, summary]) => {
                                                                    const avg = summary.total / summary.count;
                                                                    const brandMeta = (kpi.meta && typeof kpi.meta === 'object')
                                                                        ? (kpi.meta[brand] || kpi.meta[activeCompany] || 0)
                                                                        : (kpi.targetMeta || 0);
                                                                    const compliance = brandMeta > 0
                                                                        ? Math.min(Math.round((avg / brandMeta) * 100), 100)
                                                                        : null;
                                                                    const barColor = compliance === null ? '#cbd5e1'
                                                                        : compliance >= 95 ? '#10b981'
                                                                        : compliance >= 85 ? '#f59e0b'
                                                                        : '#ef4444';
                                                                    const isSelected = selectedMonthBrand === brand;
                                                                    const isOther = selectedMonthBrand && !isSelected;

                                                                    return (
                                                                        <div
                                                                            key={brand}
                                                                            onClick={() => setSelectedMonthBrand(isSelected ? null : brand)}
                                                                            style={{
                                                                                cursor: 'pointer',
                                                                                padding: '0.6rem 0.75rem',
                                                                                borderRadius: '12px',
                                                                                background: isSelected ? 'white' : 'transparent',
                                                                                border: isSelected ? '1px solid var(--brand)' : '1px solid transparent',
                                                                                opacity: isOther ? 0.4 : 1,
                                                                                transition: 'all 0.2s'
                                                                            }}
                                                                        >
                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                                    <span style={{
                                                                                        background: isSelected ? 'var(--brand)' : '#e2e8f0',
                                                                                        color: isSelected ? 'white' : '#64748b',
                                                                                        fontSize: '0.6rem', fontWeight: 900,
                                                                                        padding: '2px 8px', borderRadius: '5px',
                                                                                        textTransform: 'uppercase',
                                                                                        transition: 'all 0.2s'
                                                                                    }}>{brand}</span>
                                                                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>
                                                                                        {summary.count} {summary.count === 1 ? 'carga' : 'cargas'}
                                                                                    </span>
                                                                                </div>
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#1e293b' }}>
                                                                                        {formatKPIValue(avg, kpi.unit)}
                                                                                    </span>
                                                                                    {compliance !== null && (
                                                                                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: barColor }}>
                                                                                            {compliance}%
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <div style={{ height: '5px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                                                                                <div style={{
                                                                                    height: '100%',
                                                                                    width: `${compliance ?? 50}%`,
                                                                                    background: barColor,
                                                                                    borderRadius: '99px',
                                                                                    transition: 'width 0.8s ease'
                                                                                }} />
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Individual log items - filtered by selected brand */}
                                                    {selectedMonthBrand && (
                                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--brand)', marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
                                                            Mostrando días de {selectedMonthBrand}
                                                        </div>
                                                    )}
                                                    {visibleLogs.map(log => renderLogItem(log))}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                                    <div style={{ color: '#cbd5e1', marginBottom: '1rem' }}><Clock size={64} style={{ margin: '0 auto' }} /></div>
                                    <p style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 }}>No hay registros para este indicador.</p>
                                </div>
                            )}
                        </div>
                        
                        <div style={{ padding: '1.5rem', background: 'white', borderTop: '1px solid #f1f5f9' }}>
                            <button 
                                onClick={() => {
                                    const companyFull = activeCompany === 'TYM' ? 'Tiendas y Marcas' : 'TAT Distribuciones';
                                    import('../../utils/ExportService').then(m => {
                                        m.exportToPDF([kpi], activeCompany, companyFull, kpi.area, 'Global');
                                    });
                                }}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: '#0f172a',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '16px',
                                    fontSize: '0.9rem',
                                    fontWeight: 900,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem'
                                }}
                            >
                                <FileText size={20} /> Descargar Auditoría PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KPIHistoryModal;
