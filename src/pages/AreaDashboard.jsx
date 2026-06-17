import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAreaById } from '../data/areas';
import KPIDetailCard from '../components/dashboard/KPIDetailCard';
import KPIDataForm from '../components/forms/KPIDataForm';
import ErrorBoundary from '../components/ErrorBoundary';
import { filterKPIsByEntity, getKPIResponsable } from '../utils/kpiHelpers';
import { calculateAreaScore } from '../data/mockData';
import { getKPIDeadline, checkIsUrgent, checkIsExpired, formatDeadline, getMonthFromPeriod } from '../utils/formatters';
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
    Cell,
    ReferenceLine,
    LabelList
} from 'recharts';
import {
    ArrowLeft as ArrowLeftIcon,
    LayoutDashboard,
    Activity,
    TrendingUp,
    ShieldCheck,
    AlertCircle,
    Package,
    Filter,
    ChevronRight,
    Maximize2,
    X as XIcon
} from 'lucide-react';
import { BRAND_TO_ENTITY } from '../utils/kpiHelpers';
import { isInverseKPI } from '../utils/kpiCalculations';

const AreaDashboard = ({ kpiData, activeCompany, currentUser, onUpdateKPI, onViewHistory, selectedMonth }) => {
    const { areaId } = useParams();
    const navigate = useNavigate();
    const area = getAreaById(areaId);
    const [activeSubArea, setActiveSubArea] = useState(
        areaId === 'logistica' ? 'Logística de Entrega' : 
        areaId === 'comercial' ? 'Gestión de Ventas' : 
        areaId === 'administrativo' ? 'Control de Inventarios' :
        areaId === 'facturacion' ? 'Operación Facturación' : 
        areaId === 'software' ? 'all' : 'all'
    );
    const [editingKPIId, setEditingKPIId] = useState(null);
    const [editMode, setEditMode] = useState('data');
    const [isChartExpanded, setIsChartExpanded] = useState(false);

    // Filter by Entity first
    const baseCompanyKPIs = React.useMemo(() => 
        filterKPIsByEntity(kpiData, activeCompany || 'TYM'),
    [kpiData, activeCompany]);

    // Project KPIs to selected month
    const projectedKPIs = React.useMemo(() => {
        const currentMonthName = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][new Date().getMonth()];
        const isCurrentMonth = selectedMonth === currentMonthName;
        
        return baseCompanyKPIs.map(kpi => {
            // KPIs del mes actual: SIEMPRE usar datos en vivo (independientemente de hasData)
            if (isCurrentMonth) return kpi;

            // Buscar en historial para meses pasados
            const historyEntry = kpi.history?.find(h => h.month === selectedMonth);
            let val = historyEntry ? historyEntry[activeCompany] : null;

            if (val === null || val === undefined) {
                return { 
                    ...kpi, 
                    hasData: false, 
                    compliance: 0, 
                    currentValue: 0, 
                    semaphore: 'gray',
                    additionalData: { ...kpi.additionalData, updatedAt: null, period: null }
                };
            }

            // Recalculate based on history value
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

            // Reconstruir brandValues proyectados para que las cards muestren el desglose histórico
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
                brandValues: projectedBrandValues,
                additionalData: historyEntry ? {
                    ...kpi.additionalData,
                    updatedAt: historyEntry.updatedAt,
                    period: historyEntry.monthKey || historyEntry.month
                } : {
                    ...kpi.additionalData,
                    updatedAt: null,
                    period: null
                }
            };
        });
    }, [baseCompanyKPIs, selectedMonth, activeCompany]);

    // Devolvemos el KPI actual del prop basado en el ID para que siempre esté fresco
    const editingKPI = editingKPIId ? kpiData.find(k => k.id === editingKPIId) : null;

    const [initialBrand, setInitialBrand] = useState(null);

    const handleStartEdit = (kpi, mode = 'data', brand = null) => {
        setEditingKPIId(kpi.id);
        setEditMode(mode);
        // Usar la marca seleccionada en el dashboard por defecto
        setInitialBrand(brand || selectedBrand);
    };

    // Restricted access: Manager (Gerente) cannot edit
    const canModify = currentUser?.role !== 'Gerente';


    // Filter by area
    const areaKPIs = projectedKPIs.filter(kpi => 
        kpi.area === areaId || 
        (kpi.visibleEnAreas && kpi.visibleEnAreas.includes(areaId))
    );

    // 2. Sub-areas filter logic (Removed 'Todas' to avoid cluttered charts)
    const subAreas = areaId === 'logistica' 
        ? ['Logística de Entrega', 'Logística de Picking', 'Logística de Depósito']
        : areaId === 'comercial'
        ? ['Gestión de Ventas', 'Servicio y Devoluciones', 'Cartera y Crédito', 'Operación y Gastos']
        : areaId === 'administrativo'
        ? ['Control de Inventarios', 'Auditoría y Parámetros']
        : areaId === 'facturacion'
        ? ['Operación Facturación']
        : areaId === 'software'
        ? ['Gestión Software y TI']
        : [];


    // 3. Brand filter logic for specific areas
    const brandAreas = ['logistica', 'comercial', 'cartera', 'talento-humano', 'facturacion', 'administrativo', 'caja'];
    const isBrandSpecificArea = brandAreas.includes(areaId);

    const brandsForEntity = [...new Set(areaKPIs.flatMap(kpi =>
        (kpi.meta && typeof kpi.meta === 'object') ? Object.keys(kpi.meta) : []
    ))].filter(brand =>
        brand !== 'Global' && brand !== 'TYM' && brand !== 'TAT' && BRAND_TO_ENTITY[brand] === activeCompany
    );

    // Si el usuario tiene marca bloqueada (ej: log_zenu), fijar selectedBrand a su marca
    const lockedBrand = currentUser?.activeBrand || null;
    const [selectedBrand, setSelectedBrand] = useState(lockedBrand || 'all');

    // Reset or set default sub-area when areaId changes
    React.useEffect(() => {
        const defaultSubArea =
            areaId === 'logistica' ? 'Logística de Entrega' :
            areaId === 'comercial' ? 'Gestión de Ventas' :
            areaId === 'administrativo' ? 'Control de Inventarios' :
            areaId === 'facturacion' ? 'Operación Facturación' : 
            areaId === 'software' ? 'all' : 'all';
        setActiveSubArea(defaultSubArea);
    }, [areaId]);

    // Si cambia company/area y el brand está bloqueado, respetar; sino reset
    React.useEffect(() => {
        if (lockedBrand) {
            setSelectedBrand(lockedBrand);
        } else {
            setSelectedBrand('all');
        }
    }, [areaId, activeCompany, lockedBrand]);

    if (!area) {
        return (
            <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Área no encontrada</h3>
                <button onClick={() => navigate('/')} className="btn-ghost" style={{ marginTop: '1rem' }}>Volver al Inicio</button>
            </div>
        );
    }

    const showBrandFilter = isBrandSpecificArea;

    // 4. Filtered KPIs for the CURRENT view (Area or Sub-Area + Brand)
    const hasSubAreas = subAreas.length > 0;
    let filteredKPIs = hasSubAreas && activeSubArea !== 'all'
        ? areaKPIs.filter(kpi => kpi.subArea === activeSubArea)
        : areaKPIs;


    // 5. Apply brand-specific data mapping when a brand is selected
    if (isBrandSpecificArea && selectedBrand !== 'all') {
        filteredKPIs = filteredKPIs.map(kpi => {
            const brandKey = `${activeCompany}-${selectedBrand}`;
            
            // Si estamos proyectando un mes pasado, brandValues actuales no sirven.
            // Necesitamos los brandValues HISTÓRICOS.
            // Por ahora, si es proyección, usamos el valor consolidado si no hay histórico por marca.
            // Pero idealmente historyPoint debería guardar brandValues.
            
            const brandData = kpi.brandValues && kpi.brandValues[brandKey];
            
            let isFromSelectedMonth = false;
            if (brandData && brandData.hasData) {
                if (!brandData.additionalData) {
                    // Reconstructed from history, so it belongs to the selected month
                    isFromSelectedMonth = true;
                } else {
                    const brandPeriodStr = brandData.additionalData.period;
                    const brandMonth = getMonthFromPeriod(brandPeriodStr);
                    isFromSelectedMonth = brandMonth === selectedMonth;
                }
            }
            
            if (brandData && brandData.hasData && isFromSelectedMonth) {
                return {
                    ...kpi,
                    currentValue: brandData.currentValue,
                    compliance: Math.round(brandData.compliance),
                    semaphore: brandData.semaphore,
                    hasData: true,
                    targetMeta: (kpi.meta && kpi.meta[selectedBrand]) || kpi.targetMeta
                };
            }
            // If the brand is in meta but has no specific data yet, show as 0
            if (Object.prototype.hasOwnProperty.call(kpi.meta, selectedBrand)) {
                return {
                    ...kpi,
                    currentValue: 0,
                    compliance: 0,
                    semaphore: 'gray',
                    hasData: false,
                    targetMeta: kpi.meta[selectedBrand]
                };
            }
            return kpi;
        }).filter(kpi => Object.prototype.hasOwnProperty.call(kpi.meta, selectedBrand));
    }

    // 6. Sort: KPIs the user is responsible for (to load/edit) come first
    filteredKPIs = [...filteredKPIs].sort((a, b) => {
        const userCargo = currentUser?.cargo || '';
        const isRespA = getKPIResponsable(a, currentUser) === userCargo;
        const isRespB = getKPIResponsable(b, currentUser) === userCargo;

        if (isRespA && !isRespB) return -1;
        if (!isRespA && isRespB) return 1;
        return 0;
    });

    // 4. Analytics based on FILTERED data
    const kpisWithData = filteredKPIs.filter(kpi => kpi.hasData);

    // Alertas logic
    const kpiAlerts = filteredKPIs.map(kpi => {
        const deadline = getKPIDeadline(kpi.frecuencia);
        return {
            ...kpi,
            deadline,
            isUrgent: checkIsUrgent(deadline),
            isExpired: checkIsExpired(deadline) && !kpi.hasData,
            isPending: !kpi.hasData
        };
    }).filter(k => k.isExpired || k.isUrgent || (k.isPending && canModify));

    const criticalAlerts = kpiAlerts.filter(k => k.isExpired);

    const radarData = filteredKPIs.map(kpi => ({
        subject: filteredKPIs.length <= 6 
            ? (kpi.name.length > 30 ? kpi.name.substring(0, 27) + '...' : kpi.name)
            : (kpi.name.length > 20 ? kpi.name.substring(0, 17) + '...' : kpi.name),
        fullValue: kpi.name,
        value: kpi.compliance || 0
    }));

    const complianceData = kpisWithData
        .filter(kpi => kpi.compliance !== undefined)
        .slice(0, 12)
        .map(kpi => ({
            name: kpi.name,
            cumplimiento: kpi.compliance,
            color: kpi.semaphore === 'green' ? '#10b981' : (kpi.semaphore === 'yellow' ? '#f59e0b' : '#f43f5e'),
            status: kpi.semaphore
        }));

    const handleSaveKPI = (kpiId, data) => {
        if (onUpdateKPI) onUpdateKPI(kpiId, data);
        if (data.type !== 'META_UPDATE') {
            setEditingKPIId(null);
        }
    };

    // Usar la utilidad central para que el puntaje del header coincida SIEMPRE con la card del dashboard
    // Pasamos el array proyectado para que el score sea el del mes seleccionado
    const areaTotalScore = calculateAreaScore(projectedKPIs, areaId) || 0;
    const groupCompliance = areaTotalScore; // Forzar consistencia


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
                        <ArrowLeftIcon size={14} /> Volver
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
                            <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.5rem', fontWeight: 500 }}>
                                {area.description} • <span style={{ color: 'var(--brand)', fontWeight: 800 }}>PERIODO: {selectedMonth.toUpperCase()} {new Date().getFullYear()}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={() => {
                            const companyFull = activeCompany === 'TYM' ? 'Tiendas y Marcas' : 'TAT Distribuciones';
                            import('../utils/ExportService').then(m => {
                                m.exportToPDF(filteredKPIs, activeCompany, companyFull, area.name, selectedBrand);
                            });
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            background: '#eff6ff',
                            border: '1px solid #dbeafe',
                            color: '#2563eb',
                            padding: '0.75rem 1.25rem',
                            borderRadius: '14px',
                            fontSize: '0.85rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.1)'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#dbeafe'}
                        onMouseOut={e => e.currentTarget.style.background = '#eff6ff'}
                    >
                        <TrendingUp size={16} /> Exportar Área PDF
                    </button>

                    <div className="glass" style={{
                        padding: '1.5rem 2.5rem',
                        borderRadius: '24px',
                        background: 'white',
                        border: '1px solid #f1f5f9',
                        textAlign: 'center',
                        boxShadow: 'var(--shadow-premium)'
                    }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                            EJECUCIÓN
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: groupCompliance > 80 ? '#059669' : groupCompliance > 60 ? '#f59e0b' : '#ef4444' }}>
                            {groupCompliance}%
                        </div>
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
                    <ResponsiveContainer width="100%" height={260}>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid stroke="#f1f5f9" strokeWidth={2} />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div style={{
                                                background: 'white',
                                                padding: '1rem',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '16px',
                                                boxShadow: 'var(--shadow-premium)',
                                                fontSize: '0.85rem'
                                            }}>
                                                <p style={{ margin: '0 0 0.25rem 0', fontWeight: 800, color: '#1e293b' }}>{payload[0].payload.fullValue}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: area.color }}></div>
                                                    <p style={{ margin: 0, color: area.color, fontWeight: 900, fontSize: '1.1rem' }}>{payload[0].value}%</p>
                                                </div>
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
                                strokeWidth={3}
                                fill={area.color}
                                fillOpacity={0.4}
                                dot={{ r: 4, fill: 'white', stroke: area.color, strokeWidth: 2 }}
                                activeDot={{ r: 6, fill: area.color, stroke: 'white', strokeWidth: 2 }}
                                animationDuration={1500}
                                animationEasing="ease-out"
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card premium-shadow" style={{ padding: '2rem', borderRadius: '32px', background: 'white', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ color: 'var(--brand)' }}><TrendingUp size={20} /></div>
                            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 900, color: '#1e293b', textTransform: 'uppercase' }}>Análisis de Cumplimiento</h4>
                        </div>
                        <button
                            onClick={() => setIsChartExpanded(true)}
                            title="Expandir Gráfico"
                            style={{
                                background: 'none', border: 'none', color: '#64748b',
                                cursor: 'pointer', padding: '4px', borderRadius: '8px',
                                transition: 'all 0.2s', display: 'flex', alignItems: 'center'
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = 'var(--brand)'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748b'; }}
                        >
                            <Maximize2 size={18} />
                        </button>
                    </div>
                    <ResponsiveContainer width="100%" height={260} minWidth={0} debounce={50}>
                        <BarChart data={complianceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#059669" stopOpacity={1}/>
                                </linearGradient>
                                <linearGradient id="colorYellow" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#d97706" stopOpacity={1}/>
                                </linearGradient>
                                <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#dc2626" stopOpacity={1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }}
                                tickFormatter={(name) => name.length > 15 ? name.substring(0, 12) + '...' : name}
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                            />
                            <YAxis 
                                domain={[0, 115]} 
                                hide 
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc', radius: 10 }}
                                contentStyle={{ 
                                    borderRadius: '16px', 
                                    border: 'none', 
                                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                    padding: '12px',
                                    fontWeight: 700
                                }}
                                formatter={(val) => [`${val}%`, 'Logro']}
                            />
                            
                            {/* Target Line at 100% */}
                            <ReferenceLine 
                                y={100} 
                                stroke="#94a3b8" 
                                strokeDasharray="5 5" 
                                label={{ position: 'right', value: 'Meta', fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
                            />

                            <Bar dataKey="cumplimiento" radius={[10, 10, 0, 0]} barSize={28}>
                                {complianceData.map((entry, index) => {
                                    const gradientId = entry.status === 'green' ? 'url(#colorGreen)' : 
                                                     entry.status === 'yellow' ? 'url(#colorYellow)' : 'url(#colorRed)';
                                    return <Cell key={`cell-${index}`} fill={gradientId} />;
                                })}
                                <LabelList 
                                    dataKey="cumplimiento" 
                                    position="top" 
                                    formatter={(val) => `${val}%`}
                                    style={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} 
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Navigation / Filtering by Sub-Process if Logistics */}
            {areaId === 'logistica' && (
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2.5rem',
                    background: 'white',
                    padding: '0.75rem',
                    borderRadius: '20px',
                    width: 'fit-content',
                    border: '1px solid #e2e8f0',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    {subAreas.map(sub => (
                        <button
                            key={sub}
                            onClick={() => setActiveSubArea(sub)}
                            style={{
                                padding: '0.6rem 1.25rem',
                                borderRadius: '12px',
                                border: 'none',
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: activeSubArea === sub ? 'var(--brand)' : 'transparent',
                                color: activeSubArea === sub ? 'white' : '#64748b'
                            }}
                        >
                            {sub.split('Logística de ')[1]}
                        </button>
                    ))}
                </div>
            )}

            {/* Brand Filter row */}
            {showBrandFilter && (
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    marginBottom: '2.5rem',
                    padding: '0.4rem',
                    background: '#f8fafc',
                    borderRadius: '16px',
                    width: 'fit-content',
                    alignItems: 'center'
                }}>
                    {/* Si la marca está bloqueada, mostrar badge fijo */}
                    {lockedBrand ? (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 1.25rem',
                            background: 'var(--brand)',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '0.8rem',
                            fontWeight: 900,
                            letterSpacing: '0.04em'
                        }}>
                            <Package size={14} />
                            {lockedBrand}
                            <span style={{
                                fontSize: '0.65rem', opacity: 0.75,
                                background: 'rgba(255,255,255,0.2)',
                                padding: '1px 8px', borderRadius: '100px'
                            }}>Tu proveedor</span>
                        </div>
                    ) : (
                        brandsForEntity.map(brand => (
                            <button
                                key={brand}
                                onClick={() => setSelectedBrand(brand === selectedBrand ? 'all' : brand)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    background: selectedBrand === brand ? 'var(--brand)' : 'white',
                                    color: selectedBrand === brand ? 'white' : '#64748b'
                                }}
                            >
                                <Package size={12} /> {brand}
                            </button>
                        ))
                    )}
                </div>
            )}

            {/* Bottom Grid Row */}
            {/* Alertas Section */}
            {kpiAlerts.length > 0 && canModify && (
                <div style={{
                    marginBottom: '2.5rem',
                    background: criticalAlerts.length > 0 ? '#fff1f2' : '#fffbeb',
                    border: `1px solid ${criticalAlerts.length > 0 ? '#fda4af' : '#fde68a'}`,
                    borderRadius: '24px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '40px', height: '40px',
                            background: criticalAlerts.length > 0 ? '#ef4444' : '#f59e0b',
                            borderRadius: '12px', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', color: 'white'
                        }}>
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#1e293b' }}>
                                Panel de Alertas de Carga
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                                {criticalAlerts.length > 0
                                    ? `Tienes ${criticalAlerts.length} indicadores con plazo vencido.`
                                    : `Tienes indicadores pendientes o cerca del plazo límite.`}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {kpiAlerts.slice(0, 4).map(k => (
                            <div key={k.id} style={{
                                background: 'white', padding: '1rem', borderRadius: '16px',
                                border: `1px solid ${k.isExpired ? '#fda4af' : '#fde68a'}`,
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>{k.name}</div>
                                    <div style={{
                                        fontSize: '0.65rem', fontWeight: 700,
                                        color: k.isExpired ? '#ef4444' : '#f59e0b',
                                        textTransform: 'uppercase'
                                    }}>
                                        {k.isExpired ? 'Vencido: ' : 'Plazo: '} {formatDeadline(k.deadline)}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleStartEdit(k)}
                                    style={{
                                        background: k.isExpired ? '#ef4444' : '#f59e0b',
                                        color: 'white', border: 'none',
                                        padding: '0.4rem 0.8rem', borderRadius: '10px',
                                        fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer'
                                    }}
                                >
                                    Cargar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{ width: '24px', height: '4px', background: 'var(--brand)', borderRadius: '2px' }}></div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    {areaId === 'logistica' && activeSubArea !== 'all' ? activeSubArea : 'Indicadores del Proceso'}
                </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                {areaId === 'logistica' && (activeSubArea === 'all' || activeSubArea === 'Todas') ? (
                    (() => {
                        const userCargo = currentUser?.cargo || '';
                        const subs = ['Logística de Depósito', 'Logística de Picking', 'Logística de Entrega'];
                        // Sort sub-areas: those with editable KPIs first
                        const sortedSubs = [...subs].sort((a, b) => {
                            const hasA = filteredKPIs.some(k => k.subArea === a && getKPIResponsable(k, currentUser) === userCargo);
                            const hasB = filteredKPIs.some(k => k.subArea === b && getKPIResponsable(k, currentUser) === userCargo);
                            if (hasA && !hasB) return -1;
                            if (!hasA && hasB) return 1;
                            return 0;
                        });

                        return sortedSubs.map(sub => {
                            const kpis = filteredKPIs.filter(k => k.subArea === sub);
                            if (kpis.length === 0) return null;
                            return (
                                <React.Fragment key={sub}>
                                    <div style={{
                                        gridColumn: '1 / -1',
                                        marginTop: '2rem',
                                        marginBottom: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}>
                                        <div style={{ width: '12px', height: '4px', background: 'var(--brand)', borderRadius: '2px' }}></div>
                                        <h4 style={{
                                            margin: 0,
                                            fontSize: '0.9rem',
                                            fontWeight: 900,
                                            color: '#64748b',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em'
                                        }}>{sub}</h4>
                                    </div>
                                    {kpis.map(kpi => (
                                        <KPIDetailCard
                                            key={kpi.id}
                                            kpi={kpi}
                                            canEdit={canModify}
                                            onEdit={handleStartEdit}
                                            currentUser={currentUser}
                                            activeCompany={activeCompany}
                                            selectedBrand={selectedBrand}
                                            onViewHistory={onViewHistory}
                                            selectedMonth={selectedMonth}
                                        />
                                    ))}
                                </React.Fragment>
                            );
                        });
                    })()
                ) : (
                    filteredKPIs.map(kpi => (
                        <KPIDetailCard
                            key={kpi.id}
                            kpi={kpi}
                            canEdit={canModify}
                            onEdit={handleStartEdit}
                            currentUser={currentUser}
                            activeCompany={activeCompany}
                            selectedBrand={selectedBrand}
                            onViewHistory={onViewHistory}
                            selectedMonth={selectedMonth}
                        />
                    ))
                )}
            </div>

            {/* Form Modal */}
            {editingKPI && (
                <ErrorBoundary>
                    <KPIDataForm
                        key={`${editingKPI.id}-${editMode}`}
                        kpi={editingKPI}
                        currentUser={currentUser}
                        onSave={handleSaveKPI}
                        onCancel={() => setEditingKPIId(null)}
                        mode={editMode}
                        initialBrand={initialBrand}
                    />
                </ErrorBoundary>
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

            {/* Expanded Chart Modal */}
            {isChartExpanded && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.9)',
                    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '2rem', backdropFilter: 'blur(8px)'
                }}>
                    <div className="card scale-in" style={{
                        width: '100%', maxWidth: '1200px', height: '80vh',
                        background: 'white', borderRadius: '32px', padding: '2.5rem',
                        display: 'flex', flexDirection: 'column', overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Análisis de Cumplimiento Completo</h3>
                                <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>Mostrando todos los indicadores cargados de {area.name}</p>
                            </div>
                            <button
                                onClick={() => setIsChartExpanded(false)}
                                style={{
                                    background: '#f1f5f9', border: 'none', color: '#64748b',
                                    padding: '0.75rem', borderRadius: '16px', cursor: 'pointer',
                                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    fontWeight: 800, fontSize: '0.85rem'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'}
                                onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}
                            >
                                <XIcon size={20} /> CERRAR
                            </button>
                        </div>

                        <div style={{ flex: 1, minHeight: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={kpisWithData.map(k => ({
                                        name: k.name,
                                        cumplimiento: k.compliance,
                                        status: k.semaphore
                                    }))}
                                    margin={{ top: 40, right: 30, left: 20, bottom: 100 }}
                                >
                                    <defs>
                                        <linearGradient id="colorGreenModal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#059669" stopOpacity={1}/>
                                        </linearGradient>
                                        <linearGradient id="colorYellowModal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#d97706" stopOpacity={1}/>
                                        </linearGradient>
                                        <linearGradient id="colorRedModal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f87171" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#dc2626" stopOpacity={1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        interval={0}
                                        tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }}
                                        height={100}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        domain={[0, 115]}
                                        tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(val) => `${val}%`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc', radius: 10 }}
                                        contentStyle={{
                                            borderRadius: '20px',
                                            border: 'none',
                                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                                            padding: '1.25rem',
                                            fontWeight: 700
                                        }}
                                        formatter={(val) => [`${val}%`, 'Cumplimiento']}
                                    />

                                    <ReferenceLine 
                                        y={100} 
                                        stroke="#94a3b8" 
                                        strokeDasharray="5 5" 
                                        label={{ position: 'right', value: 'Meta (100%)', fill: '#94a3b8', fontSize: 12, fontWeight: 900 }} 
                                    />

                                    <Bar dataKey="cumplimiento" radius={[12, 12, 0, 0]} barSize={40}>
                                        {kpisWithData.map((entry, index) => {
                                            const status = entry.semaphore || (entry.compliance >= 100 ? 'green' : 'red');
                                            const gradientId = status === 'green' ? 'url(#colorGreenModal)' : 
                                                            status === 'yellow' ? 'url(#colorYellowModal)' : 'url(#colorRedModal)';
                                            return <Cell key={`cell-${index}`} fill={gradientId} />;
                                        })}
                                        <LabelList 
                                            dataKey="cumplimiento" 
                                            position="top" 
                                            formatter={(val) => `${val}%`}
                                            style={{ fill: '#64748b', fontSize: 11, fontWeight: 800 }} 
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default AreaDashboard;
