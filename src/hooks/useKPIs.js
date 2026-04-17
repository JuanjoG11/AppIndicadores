import { useState, useEffect, useCallback, useRef } from 'react';
import { isSameDay, isSameWeek, isSameMonth, parseISO } from 'date-fns';
import { kpiDefinitions } from '../data/kpiData';
import { mockKPIData as initialMockData } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { BRAND_TO_ENTITY } from '../utils/kpiHelpers';
import { calculateKPIValue, isInverseKPI } from '../utils/kpiCalculations';

/**
 * useKPIs - Hook central de datos sincronizado con el código y Supabase
 */
export const useKPIs = (currentUser, activeCompany, onToast) => {
    // 1. Estado inicial
    const [kpiData, setKpiData] = useState(initialMockData);
    const [isLoading, setIsLoading] = useState(true);
    const [rawUpdates, setRawUpdates] = useState([]);
    const [lastSyncTime, setLastSyncTime] = useState(null);

    // ... (rest of the state and logic)

    // Ref para ignorar persistencia automática en procesos internos
    const suppressPersist = useRef(false);

    const MONTH_NAMES = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // ── Período mensual actual (YYYY-MM) para reseteо automático ──────────────
    const getCurrentPeriod = () => {
        const now = new Date();
        const day = now.getDate();
        
        let targetDate = now;
        // Gracia de 3 días para reportar el mes anterior
        if (day <= 3) {
            targetDate = new Date(now.getFullYear(), now.getMonth(), 0);
        }

        const y = targetDate.getFullYear();
        const m = String(targetDate.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}`;
    };
    const currentPeriod = getCurrentPeriod();

    // Inicio y fin del mes actual para el filtro de Supabase
    const getMonthDateRange = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        return { start: start.toISOString(), end: end.toISOString() };
    };

    /**
     * Aplica actualizaciones locales al estado.
     */
    const applyKPIUpdate = useCallback((kpiId, newData, shouldPersist = true) => {
        setKpiData(prevData => {
            const index = prevData.findIndex(k => k.id === kpiId);
            if (index === -1) return prevData;

            const oldKpi = prevData[index];
            const kpi = structuredClone(oldKpi);

            const currentBrand = newData.brand || 'Global';
            const currentCompany = newData.company || BRAND_TO_ENTITY[currentBrand] || activeCompany || 'TYM';
            const dataKey = `${currentCompany}-${currentBrand.toUpperCase()}`;
            const brandValues = kpi.brandValues || {};

            // Usar datos previos de la marca específica si existen, sino los globales si coinciden en marca
            const existingBrandData = brandValues[dataKey]?.additionalData || 
                                    (kpi.additionalData?.brand === currentBrand ? kpi.additionalData : {});

            // Determinar si es una actualización manual (desde UI) o remota (desde Supabase)
            const isManualUpdate = !newData.updatedAt;

            const updatedAdditionalData = {
                ...existingBrandData,
                ...newData,
                updatedAt: newData.updatedAt || new Date().toISOString(),
                // Si es manual, forzamos el periodo actual para evitar heredar periodos viejos (ej: de Marzo)
                // que calificarían el registro como histórico injustamente.
                period: isManualUpdate ? currentPeriod : (newData.period || existingBrandData.period || currentPeriod)
            };

            const d = updatedAdditionalData;
            const recordDateObj = parseISO(d.updatedAt || new Date().toISOString());
            const nowObj = new Date();
            
            // ─── Lógica de Periodo Actual ───
            const frequency = (kpi.frecuencia || '').toUpperCase();
            let isFromCurrentPeriod = false;
            const dayOfRecord = recordDateObj.getDate();
            const monthOfRecord = recordDateObj.getMonth();
            const yearOfRecord = recordDateObj.getFullYear();
            const nowDay = nowObj.getDate();
            const nowMonth = nowObj.getMonth();
            const nowYear = nowObj.getFullYear();

            if (frequency.includes('DIARI')) {
                isFromCurrentPeriod = isSameDay(recordDateObj, nowObj);
            } else if (frequency.includes('SEMANAL')) {
                isFromCurrentPeriod = isSameWeek(recordDateObj, nowObj, { weekStartsOn: 1 });
            } else if (frequency.includes('QUINCENAL')) {
                const isGraceQ1 = (nowDay >= 16 && nowDay <= 18) && (dayOfRecord === 15) && (nowMonth === monthOfRecord) && (nowYear === yearOfRecord);
                const lastDayPrevMonth = new Date(nowYear, nowMonth, 0).getDate();
                const isGraceQ2 = (nowDay <= 3) && (dayOfRecord >= lastDayPrevMonth - 1) && 
                                 ((nowMonth === 0 ? 11 : nowMonth - 1) === monthOfRecord);
                isFromCurrentPeriod = isSameMonth(recordDateObj, nowObj) || isGraceQ1 || isGraceQ2;
            } else {
                const isGraceMensual = (nowDay <= 3) && 
                                      ((nowMonth === 0 ? 11 : nowMonth - 1) === monthOfRecord) &&
                                      (nowMonth === 0 ? nowYear - 1 : nowYear) === yearOfRecord;
                isFromCurrentPeriod = isSameMonth(recordDateObj, nowObj) || isGraceMensual;
            }

            const isHistoricalUpdate = d.type !== 'META_UPDATE' && !isManualUpdate && !isFromCurrentPeriod;

            let newValue = kpi.currentValue;
            let targetMeta = kpi.targetMeta;

            try {
                if (d.type === 'META_UPDATE') newValue = kpi.currentValue;
                else newValue = calculateKPIValue(kpiId, d);
            } catch (e) {
                console.error("Calculation Error:", e);
            }

            // Gestionar actualización de meta
            if (d.type === 'META_UPDATE') {
                if (d.newFrecuencia && d.newFrecuencia !== kpi.frecuencia) {
                    kpi.frecuencia = d.newFrecuencia;
                }
                const scope = d.brand;
                console.log(`🎯 Aplicando META_UPDATE: ${kpiId} -> ${scope} = ${d.newMeta}`);

                if (!scope || scope === 'Global' || scope === 'global' || scope === currentCompany) {
                    const currentMeta = (kpi.meta && typeof kpi.meta === 'object') ? { ...kpi.meta } : { global: kpi.meta };
                    kpi.meta = { ...currentMeta, [currentCompany]: d.newMeta };
                } else {
                    const staticDef = kpiDefinitions.find(s => s.id === kpiId);
                    const originalHasBrand = staticDef && staticDef.meta && typeof staticDef.meta === 'object' && staticDef.meta.hasOwnProperty(scope);

                    if (originalHasBrand) {
                        const currentMeta = (kpi.meta && typeof kpi.meta === 'object') ? { ...kpi.meta } : { global: kpi.meta };
                        kpi.meta = { ...currentMeta, [scope]: d.newMeta };
                    }
                }
            }

            // Resolver targetMeta basándose en la meta actual
            if (kpi.meta && typeof kpi.meta === 'object') {
                targetMeta = kpi.meta[currentBrand] || kpi.meta[currentCompany] || kpi.meta.global ||
                    kpi.meta[Object.keys(kpi.meta).find(b => BRAND_TO_ENTITY[b] === currentCompany)] || 0;
            } else targetMeta = kpi.meta;

            newValue = parseFloat((newValue || 0).toFixed(2));

            // Cálculo de Semáforo y Cumplimiento
            let semaphore = 'gray';
            let compliance = 0;
            if (typeof targetMeta === 'number' && targetMeta !== 0) {
                const isInverse = isInverseKPI(kpiId);
                compliance = isInverse ? (targetMeta / newValue) * 100 : (newValue / targetMeta) * 100;
                if (isInverse && newValue === 0) compliance = 100;
                compliance = Math.min(Math.max(Math.round(compliance || 0), 0), 100);
                
                const isStrict = ['revision-margenes', 'revision-precios', 'pedidos-facturados', 'impresion-facturas'].includes(kpiId);
                const greenThreshold = isStrict ? 100 : 95;
                const yellowThreshold = isStrict ? 100 : 85;

                if (compliance >= greenThreshold) semaphore = 'green';
                else if (compliance >= yellowThreshold) semaphore = 'yellow';
                else semaphore = 'red';
            } else if (targetMeta === 0 && newValue === 0) {
                compliance = isInverseKPI(kpiId) ? 100 : 0;
                semaphore = compliance >= 95 ? 'green' : 'red';
            } else if (targetMeta === 0 && newValue > 0) {
                compliance = isInverseKPI(kpiId) ? 0 : 100;
                semaphore = compliance >= 95 ? 'green' : 'red';
            }

            // Actualizar desglose por marca (Solo marcamos 'hasData' si es el periodo reportable/actual)
            brandValues[dataKey] = {
                ...brandValues[dataKey],
                currentValue: isHistoricalUpdate ? (brandValues[dataKey]?.currentValue || 0) : newValue,
                meta: targetMeta,
                compliance: isHistoricalUpdate ? (brandValues[dataKey]?.compliance || 0) : compliance,
                semaphore: isHistoricalUpdate ? (brandValues[dataKey]?.semaphore || 'gray') : semaphore,
                additionalData: d,
                company: currentCompany,
                brand: currentBrand,
                hasData: (d.type === 'META_UPDATE') 
                    ? (brandValues[dataKey]?.hasData) 
                    : (isHistoricalUpdate ? (brandValues[dataKey]?.hasData || false) : true)
            };

            // Cálculo del mes para el histórico
            const MONTH_NAMES = [
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ];
            let targetMonthIndex = recordDateObj.getMonth();
            if (d.period && d.period.includes('-')) {
                const parts = d.period.split('-');
                if (parts.length >= 2) targetMonthIndex = parseInt(parts[1], 10) - 1;
            }
            const targetMonth = MONTH_NAMES[targetMonthIndex];
            const targetCompany = currentCompany;

            const newHistory = kpi.history.map(h => h.month === targetMonth ? { ...h, [targetCompany]: newValue } : h);

            let newKpi;
            if (isHistoricalUpdate) {
                // Registro histórico: no cambia el estado 'visto' de la barra actual
                newKpi = {
                    ...oldKpi,
                    brandValues: { ...brandValues },
                    history: newHistory
                };
            } else {
                // Registro actual: actualiza el valor principal y marca como cargado
                newKpi = {
                    ...kpi,
                    currentValue: newValue,
                    targetMeta,
                    compliance,
                    semaphore,
                    hasData: d.type === 'META_UPDATE' ? kpi.hasData : true,
                    brandValues: { ...brandValues },
                    history: newHistory
                };
            }

            if (shouldPersist && !suppressPersist.current) {
                persistUpdate(kpiId, updatedAdditionalData, newValue, currentUser);
            }

            const newDataFull = [...prevData];
            newDataFull[index] = newKpi;
            return newDataFull;
        });
    }, [activeCompany, currentUser, isInverseKPI, calculateKPIValue, currentPeriod]);

    const persistUpdate = async (kpiId, additionalData, value, user) => {
        try {
            const period = getCurrentPeriod();
            const persistBrand = additionalData?.brand || (Array.isArray(user?.activeBrand) ? user.activeBrand[0] : user?.activeBrand) || 'Global';
            
            const payload = {
                company_id: user?.company || 'TYM',
                kpi_id: kpiId,
                period: period,
                additional_data: { 
                    ...additionalData, 
                    brand: persistBrand,
                    period 
                },
                value: value,
                cargo: user?.cargo || 'Sistema'
            };

            console.log("💾 Enviando a Supabase:", JSON.stringify(payload, null, 2));
            const { error } = await supabase.from('kpi_updates').insert(payload);
            
            if (error) {
                console.error("❌ Detalle Error Supabase:", error.message, error.details, error.hint);
                throw error;
            }
            setLastSyncTime(new Date());
        } catch (err) {
            console.error("❌ Error persistiendo en Supabase:", err);
            if (onToast) onToast('error', `Error: ${err.message || 'Error al guardar'}`);
        }
    };

    // ── 1. INICIALIZACIÓN Y SINC EN TIEMPO REAL CON EL CÓDIGO (HMR) ──
    useEffect(() => {
        setKpiData(prevData => {
            return kpiDefinitions.map(def => {
                const live = prevData.find(k => k.id === def.id);

                // Si no hay datos previos, usamos la definición estática procesada por mockData
                if (!live) {
                    return initialMockData.find(m => m.id === def.id) || def;
                }

                // Si hay datos previos, actualizamos los metadatos estáticos desde el código
                // pero filtramos la meta para que SOLO existan las marcas que están en el código.
                let filteredMeta = def.meta;
                if (live.meta && typeof live.meta === 'object' && def.meta && typeof def.meta === 'object') {
                    // Mantener valores de la DB solo para las marcas que todavía existen en el código
                    filteredMeta = {};
                    Object.keys(def.meta).forEach(brandKey => {
                        // EXCEPCIÓN: Forzamos la sincronización de metas críticas desde el código si cambian (para evitar valores basura de la DB)
                        const isForcedMeta = ['revision-margenes', 'revision-precios', 'pedidos-facturados', 'impresion-facturas'].includes(def.id);
                        filteredMeta[brandKey] = (live.meta.hasOwnProperty(brandKey) && !isForcedMeta) ? live.meta[brandKey] : def.meta[brandKey];
                    });
                }

                return {
                    ...live,
                    name: def.name,
                    area: def.area,
                    subArea: def.subArea,
                    objetivo: def.objetivo,
                    unit: def.unit,
                    frecuencia: live.frecuencia || def.frecuencia,
                    formula: def.formula,
                    responsable: def.responsable,
                    fuente: def.fuente,
                    brands: def.brands,
                    isAutoFeed: def.isAutoFeed,
                    visibleEnAreas: def.visibleEnAreas,
                    meta: filteredMeta // Sincroniza estructura y valores del código
                };
            });
        });
    }, [kpiDefinitions]);

    // ── 2. CARGA DE DATOS DE SUPABASE (histórico del año + suscripción realtime) ──
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                // Get start of the YEAR to load all history correctly
                const now = new Date();
                const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();
                // We keep 'end' at current month's end just in case
                const { end } = getMonthDateRange();

                console.log(`📅 Cargando datos históricos desde ${startOfYear} hasta ${end}`);

                // Fetch data for the current company from the start of the year
                const { data, error } = await supabase
                    .from('kpi_updates')
                    .select('*')
                    .eq('company_id', activeCompany)
                    .gte('updated_at', startOfYear)
                    .lte('updated_at', end)
                    .order('updated_at', { ascending: true });
                
                if (error) {
                    console.error("❌ Supabase fetch error:", error);
                }

                 if (data) {
                    setRawUpdates(data);
                    suppressPersist.current = true;
                    data.forEach(upd => {
                        applyKPIUpdate(upd.kpi_id, { ...upd.additional_data, updatedAt: upd.updated_at, period: upd.period || upd.additional_data?.period }, false);
                    });
                    suppressPersist.current = false;
                    setLastSyncTime(new Date());
                }
            } finally {
                setIsLoading(false);
                suppressPersist.current = false;
            }
        };

        if (kpiData.length > 0) fetchInitialData();

        const channel = supabase.channel(`realtime-kpi-sync-${activeCompany}-${currentPeriod}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'kpi_updates',
                filter: `company_id=eq.${activeCompany}`
            }, (p) => {
                // Solo aplicar actualizaciones del mes actual en tiempo real
                setRawUpdates(prev => [...prev, p.new]);
                const { start, end } = getMonthDateRange();
                const updatedAt = new Date(p.new.updated_at);
                const startDate = new Date(start);
                const endDate   = new Date(end);
                if (updatedAt >= startDate && updatedAt <= endDate) {
                    applyKPIUpdate(p.new.kpi_id, p.new.additional_data, false);
                    if (onToast) onToast('info', `📊 KPI actualizado`);
                }
            }).subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [applyKPIUpdate, onToast, activeCompany, kpiData.length === 0]);

    return { kpiData, rawUpdates, isLoading, lastSyncTime, applyKPIUpdate };
};
