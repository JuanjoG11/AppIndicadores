import { useState, useEffect, useCallback, useRef } from 'react';
import { isSameDay, isSameWeek, isSameMonth, parseISO, format, subMonths } from 'date-fns';
import { kpiDefinitions } from '../data/kpiData';
import { mockKPIData as initialMockData } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { BRAND_TO_ENTITY } from '../utils/kpiHelpers';
import { calculateKPIValue, isInverseKPI } from '../utils/kpiCalculations';

/**
 * useKPIs - Hook central de datos sincronizado con el código y Supabase
 */
const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const useKPIs = (currentUser, activeCompany, onToast) => {
    // 1. Estado inicial
    // Inicializar con definiciones limpias (sin datos de prueba) para que solo se vea lo real de Supabase
    const cleanInitialData = kpiDefinitions.map(def => ({
        ...def,
        currentValue: 0,
        compliance: 0,
        semaphore: 'gray',
        hasData: false,
        brandValues: {},
        history: []
    }));

    const [kpiData, setKpiData] = useState(cleanInitialData);
    const [isLoading, setIsLoading] = useState(true);
    const [rawUpdates, setRawUpdates] = useState([]);
    const [lastSyncTime, setLastSyncTime] = useState(null);

    // ... (rest of the state and logic)

    // Ref para ignorar persistencia automática en procesos internos
    const suppressPersist = useRef(false);


    // ── Período mensual actual (YYYY-MM) para reseteо automático ──────────────
    const getCurrentPeriod = () => {
        const now = new Date();
        const day = now.getDate();
        
        let targetDate = now;
        // Gracia de 10 días para reportar el mes anterior (Accounting/SST closure window)
        if (day <= 10) {
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
     * Calcula un índice único para el periodo según la frecuencia del KPI.
     * Prevé que registros de distintos periodos (ej: Q1 vs Q2) no se solapen.
     */
    const getPeriodIndex = (date = new Date(), frequency = 'MENSUAL') => {
        const freq = frequency.toUpperCase();
        const d = new Date(date);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const monthStr = month.toString().padStart(2, '0');

        if (freq.includes('DIARI')) {
            return format(d, 'yyyy-MM-dd');
        }
        if (freq.includes('SEMANAL')) {
            return format(d, "yyyy-'W'II"); // ISO Week
        }
        if (freq.includes('QUINCENAL')) {
            const fortnight = day <= 15 ? 'Q1' : 'Q2';
            return `${year}-${monthStr}-${fortnight}`;
        }
        return `${year}-${monthStr}`; // Mensual
    };

    /**
     * Determina el periodo reportable "Actual". 
     * Incluye lógica de gracia (los primeros días permiten cargar el periodo anterior).
     */
    const getReportablePeriod = (frequency = 'MENSUAL') => {
        const now = new Date();
        const day = now.getDate();
        const freq = frequency.toUpperCase();

        // Gracia Mensual: Primeros 10 días del mes permiten cargar el mes anterior
        if (freq.includes('MENSUAL') && day <= 10) {
            return getPeriodIndex(subMonths(now, 1), 'MENSUAL');
        }

        // Gracia Quincenal: 
        // Si estamos entre el 1 y el 5, reportamos Q2 del mes pasado.
        // Si estamos entre el 16 y el 20, reportamos Q1 de este mes.
        if (freq.includes('QUINCENAL')) {
            if (day <= 5) return getPeriodIndex(subMonths(now, 1), 'QUINCENAL').replace('Q1', 'Q2');
            if (day >= 16 && day <= 20) return `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-Q1`;
        }
        
        // Gracia Semanal: Primeros 2 días de la semana permiten cargar la anterior
        if (freq.includes('SEMANAL') && now.getDay() >= 1 && now.getDay() <= 2) {
             // ISO Week de hace 3 días (para estar seguro de caer en la semana anterior)
             return getPeriodIndex(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), 'SEMANAL');
        }

        return getPeriodIndex(now, frequency);
    };

    /**
     * Aplica actualizaciones locales al estado.
     */
    const applyKPIUpdate = useCallback((kpiId, newData, shouldPersist = true, forceHistorical = false) => {
        // Pre-calcular periodo y valor FUERA del updater (evita side-effects en updaters de React)
        const kpiDef = kpiDefinitions.find(k => k.id === kpiId);
        const freq = (kpiDef?.frecuencia || 'MENSUAL').toUpperCase();
        const isManualUpd = !newData.updatedAt;

        // Calcular fecha del registro
        let recDateObj;
        if (isManualUpd && freq === 'MENSUAL' && newData.period?.length === 7) {
            const [yr, mo] = newData.period.split('-').map(Number);
            recDateObj = new Date(yr, mo - 1, 15);
        } else {
            const raw = newData.updatedAt || new Date().toISOString();
            try { recDateObj = typeof raw === 'string' ? parseISO(raw) : new Date(raw); }
            catch { recDateObj = new Date(); }
        }
        if (isNaN(recDateObj?.getTime())) recDateObj = new Date();

        // Calcular periodo
        let prePeriodIndex = isManualUpd
            ? getPeriodIndex(recDateObj, freq)
            : (newData.period || getPeriodIndex(recDateObj, freq)).toString();
        if (prePeriodIndex.length === 7 && freq !== 'MENSUAL') {
            prePeriodIndex = getPeriodIndex(recDateObj, freq);
        }

        // Datos enriquecidos con periodo correcto
        const enrichedData = {
            ...newData,
            updatedAt: newData.updatedAt || new Date().toISOString(),
            period: prePeriodIndex
        };

        // Pre-calcular valor para persistencia
        let preValue = 0;
        try {
            if (newData.type !== 'META_UPDATE') {
                preValue = newData.value !== undefined ? newData.value : calculateKPIValue(kpiId, enrichedData);
            }
        } catch { preValue = newData.value || 0; }
        if (!isFinite(preValue)) preValue = 0;
        preValue = parseFloat((preValue || 0).toFixed(2));

        setKpiData(prevData => {
            const index = prevData.findIndex(k => k.id === kpiId);
            if (index === -1) return prevData;

            const oldKpi = prevData[index];
            const kpi = structuredClone(oldKpi);
            const frequency = (kpi.frecuencia || 'MENSUAL').toUpperCase();

            const currentBrand = newData.brand || 'Global';
            const currentCompany = newData.company || BRAND_TO_ENTITY[currentBrand] || activeCompany || 'TYM';
            const dataKey = `${currentCompany}-${currentBrand.toUpperCase()}`;
            const brandValues = kpi.brandValues || {};

            // ─── Lógica de Periodo ───
            let recordDateObj;
            const isManualUpdate = !newData.updatedAt;

            // Si es una carga manual mensual y se especificó un periodo (ej. mes vencido)
            // forzamos que la fecha del registro sea en ese mes para el historial.
            if (isManualUpdate && frequency === 'MENSUAL' && newData.period && newData.period.length === 7) {
                const [year, month] = newData.period.split('-').map(Number);
                recordDateObj = new Date(year, month - 1, 15); // Día 15 para estar seguros
            } else {
                const rawDate = newData.updatedAt || newData.timestamp || new Date().toISOString();
                if (rawDate instanceof Date) {
                    recordDateObj = rawDate;
                } else {
                    try {
                        recordDateObj = typeof rawDate === 'string' ? parseISO(rawDate) : new Date(rawDate);
                    } catch (e) {
                        recordDateObj = new Date();
                    }
                }
            }

            if (isNaN(recordDateObj.getTime())) recordDateObj = new Date();
            // Calculamos el índice del periodo de este registro
            // Si es manual, recalculamos siempre el periodo para HOY (para que no se quede pegado en ayer)
            // Si viene de DB (isManualUpdate = false), respetamos el periodo guardado.
            let recordPeriodIndex;
            if (isManualUpdate) {
                recordPeriodIndex = getPeriodIndex(recordDateObj, frequency);
            } else {
                recordPeriodIndex = (newData.period || getPeriodIndex(recordDateObj, frequency)).toString();
            }

            // COMPATIBILIDAD: Si el periodo guardado es solo YYYY-MM (7 chars) pero el KPI es Semanal/Quincenal,
            // forzamos el cálculo granular basado en el timestamp para no perder la marca de "Listo".
            if (recordPeriodIndex.length === 7 && frequency !== 'MENSUAL') {
                recordPeriodIndex = getPeriodIndex(recordDateObj, frequency);
            }
            
            const currentReportablePeriod = getReportablePeriod(frequency);
            const today = new Date();
            const actualCurrentPeriod = getPeriodIndex(today, frequency);

            // Periodos comparativos
            const isStrictCurrent = recordPeriodIndex === currentReportablePeriod || recordPeriodIndex === actualCurrentPeriod;
            const isFromCurrentMonth = typeof recordPeriodIndex === 'string' && recordPeriodIndex.startsWith(currentPeriod);

            // Para el estado de carga (hasData): Si es del periodo estrictamente actual O del reportable (gracia)
            const isFromCurrentPeriod = !forceHistorical && (isStrictCurrent || recordPeriodIndex === currentReportablePeriod);
            // Para el tablero: si es una acción manual (el usuario presionó Guardar) SIEMPRE mostramos,
            // sin importar el período — el analista sabe qué mes está cargando.
            // Para cargas automáticas desde DB al inicio, mostramos si es del período actual 
            // O si es del periodo reportable actual (grace period).
            // El valor se muestra en el dashboard SOLO si es del periodo estrictamente actual 
            // O del reportable (gracia). Las cargas manuales de meses pasados no deben afectar Mayo.
            const shouldShowInDashboard = !forceHistorical && (
                isStrictCurrent ||
                recordPeriodIndex === currentReportablePeriod || 
                (frequency.includes('DIARI') && isFromCurrentMonth)
            );
            
            // Enriquecer datos con el periodo calculado si falta
            const updatedAdditionalData = {
                ...newData,
                updatedAt: newData.updatedAt || new Date().toISOString(),
                period: recordPeriodIndex
            };
            const d = updatedAdditionalData;

            const isHistoricalUpdate = d.type !== 'META_UPDATE' && !isManualUpdate && !isFromCurrentPeriod;

            let newValue = 0;
            let targetMeta = 0;

            try {
                if (d.type === 'META_UPDATE') newValue = kpi.currentValue;
                else if (d.value !== undefined) newValue = d.value; // Priorizar valor pre-calculado (promedios)
                else newValue = calculateKPIValue(kpiId, d);
            } catch (e) {
                console.error("Calculation Error:", e);
                newValue = d.value || 0;
            }

            // Evitar NaN o Infinity en persistencia
            if (!isFinite(newValue)) newValue = 0;
            newValue = parseFloat((newValue || 0).toFixed(2));
            
            // Gestionar actualización de meta (Modo Gerente)
            if (d.type === 'META_UPDATE') {
                if (d.newFrecuencia && d.newFrecuencia !== kpi.frecuencia) {
                    kpi.frecuencia = d.newFrecuencia;
                }
                const scope = d.brand;
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

            // Resolver targetMeta basándose en la configuración actual
            if (kpi.meta && typeof kpi.meta === 'object') {
                targetMeta = kpi.meta[currentBrand] || kpi.meta[currentCompany] || kpi.meta.global ||
                    kpi.meta[Object.keys(kpi.meta).find(b => BRAND_TO_ENTITY[b] === currentCompany)] || 0;
            } else targetMeta = kpi.meta;

            newValue = parseFloat((newValue || 0).toFixed(2));

            // Cálculo de Semáforo y Cumplimiento
            let semaphore = 'gray';
            let compliance = 0;

            if (typeof targetMeta === 'number') {
                const isInverse = isInverseKPI(kpiId);

                if (targetMeta === 0 && newValue === 0) {
                    // Meta 0 + valor 0 → perfecto para inversos (embalajes, quiebres, mermas…)
                    compliance = isInverse ? 100 : 0;
                } else if (targetMeta === 0 && newValue > 0) {
                    // Meta 0 pero hay un valor → malo para inversos
                    compliance = isInverse ? 0 : 100;
                } else {
                    compliance = isInverse ? (targetMeta / newValue) * 100 : (newValue / targetMeta) * 100;
                    if (isInverse && newValue === 0) compliance = 100;
                    compliance = Math.min(Math.max(Math.round(compliance || 0), 0), 100);
                }

                const isStrict = ['revision-margenes', 'revision-precios', 'pedidos-facturados', 'impresion-facturas'].includes(kpiId);
                const greenThreshold = isStrict ? 100 : 95;
                const yellowThreshold = isStrict ? 100 : 85;

                if (compliance >= greenThreshold) semaphore = 'green';
                else if (compliance >= yellowThreshold) semaphore = 'yellow';
                else semaphore = 'red';
            }

            // Actualizar desglose por marca (SOLO si es del periodo actual o si no había datos)
            const oldBrandData = brandValues[dataKey] || {};
            brandValues[dataKey] = {
                ...oldBrandData,
                currentValue: shouldShowInDashboard ? newValue : (oldBrandData.currentValue || 0),
                meta: targetMeta,
                compliance: shouldShowInDashboard ? compliance : (oldBrandData.compliance || 0),
                semaphore: shouldShowInDashboard ? semaphore : (oldBrandData.semaphore || 'gray'),
                additionalData: shouldShowInDashboard ? d : (oldBrandData.additionalData || d),
                hasData: isManualUpdate 
                    ? true 
                    : (d.type === 'META_UPDATE') 
                    ? (oldBrandData.hasData) 
                    : (isFromCurrentPeriod ? true : (oldBrandData.hasData || false))
            };

            const targetMonth = MONTH_NAMES[recordDateObj.getMonth()];
            const targetCompany = currentCompany;

            // ── CONSOLIDACIÓN DE VALORES (Para métricas con múltiples marcas) ──
            let finalValue = shouldShowInDashboard ? newValue : (kpi.currentValue || 0);
            let finalCompliance = shouldShowInDashboard ? compliance : (kpi.compliance || 0);
            let finalSemaphore = shouldShowInDashboard ? semaphore : (kpi.semaphore || 'gray');
            let finalHasData = kpi.hasData || isFromCurrentPeriod || isManualUpdate;
            let historyValue = newValue; // Para el historial, usamos el valor que se está cargando

            if (kpi.meta && typeof kpi.meta === 'object') {
                const brandsForThisCompany = Object.keys(brandValues).filter(key => key.startsWith(`${currentCompany}-`));
                
                if (brandsForThisCompany.length > 0) {
                    let sumVal = 0;
                    let sumComp = 0;
                    let count = 0;

                    brandsForThisCompany.forEach(key => {
                        const bData = brandValues[key];
                        if (bData && bData.hasData) {
                            sumVal += bData.currentValue;
                            sumComp += bData.compliance;
                            count++;
                        }
                    });

                    if (count > 0) {
                        const calculatedFinalValue = sumVal / count;
                        
                        // Si se muestra en dashboard, actualizamos los finales consolidados
                        if (shouldShowInDashboard) {
                            finalValue = calculatedFinalValue;
                            finalCompliance = Math.round(sumComp / count);
                            
                            // Recalcular semáforo consolidado
                            const isStrict = ['revision-margenes', 'revision-precios', 'pedidos-facturados', 'impresion-facturas'].includes(kpiId);
                            const greenThreshold = isStrict ? 100 : 95;
                            const yellowThreshold = isStrict ? 100 : 85;

                            if (finalCompliance >= greenThreshold) finalSemaphore = 'green';
                            else if (finalCompliance >= yellowThreshold) finalSemaphore = 'yellow';
                            else finalSemaphore = 'red';
                            
                            historyValue = finalValue;
                        }
                        
                        finalHasData = true;
                    }
                }
            }

            // ── ACTUALIZACIÓN DEL HISTORIAL ──
            const [year, monthNum] = (d.period || currentPeriod).split('-');
            const monthName = MONTH_NAMES[parseInt(monthNum) - 1];
            const periodKey = d.period || currentPeriod;

            const newHistory = [...(kpi.history || [])];
            const existingHistoryIdx = newHistory.findIndex(h => h.monthKey === periodKey || h.month === monthName);
            
            const historyPoint = {
                month: targetMonth,
                year: recordDateObj.getFullYear(),
                monthKey: periodKey,
                [currentCompany]: finalValue,
                [`${currentCompany}-${currentBrand.toUpperCase()}`]: newValue,
                [`${currentCompany}-${currentBrand.toUpperCase()}-COMP`]: compliance,
                [`${currentCompany}-${currentBrand.toUpperCase()}-SEM`]: semaphore,
                compliance: finalCompliance,
                updatedAt: d.updatedAt
            };

            if (existingHistoryIdx >= 0) {
                newHistory[existingHistoryIdx] = { ...newHistory[existingHistoryIdx], ...historyPoint };
            } else {
                newHistory.push(historyPoint);
            }

            const newKpi = {
                ...kpi,
                currentValue: parseFloat(finalValue.toFixed(2)),
                compliance: finalCompliance,
                semaphore: finalSemaphore,
                hasData: finalHasData,
                lastUpdate: d.updatedAt,
                additionalData: shouldShowInDashboard ? d : (kpi.additionalData || d),
                brandValues: { ...brandValues },
                history: newHistory.sort((a, b) => (a.monthKey || '').localeCompare(b.monthKey || ''))
            };

            const newDataFull = [...prevData];
            newDataFull[index] = newKpi;
            return newDataFull;
        });

        // ⚠️ persistUpdate FUERA del updater - los valores ya fueron pre-calculados arriba
        if (shouldPersist && !suppressPersist.current) {
            persistUpdate(kpiId, enrichedData, preValue, currentUser)
                .catch(err => console.error('persistUpdate fallido:', err));
        }
    }, [activeCompany, currentUser, calculateKPIValue, currentPeriod]);

    const persistUpdate = async (kpiId, additionalData, value, user) => {
        try {
            const persistBrand = additionalData?.brand || (Array.isArray(user?.activeBrand) ? user.activeBrand[0] : user?.activeBrand) || 'Global';
            
            // Usar kpiDefinitions (estático) para evitar closure stale de kpiData
            const frequency = kpiDefinitions.find(k => k.id === kpiId)?.frecuencia || 'MENSUAL';
            // Respetar el periodo ya calculado en applyKPIUpdate (tiene prioridad)
            const persistPeriod = additionalData?.period || getPeriodIndex(new Date(), frequency);
            
            const payload = {
                company_id: additionalData?.company || activeCompany || user?.company || 'TYM',
                kpi_id: kpiId,
                additional_data: { 
                    ...additionalData, 
                    brand: persistBrand,
                    period: persistPeriod 
                },
                value: isFinite(value) ? value : 0,
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

                let query = supabase
                    .from('kpi_updates')
                    .select('*')
                    .gte('updated_at', startOfYear)
                    .lte('updated_at', end)
                    .order('updated_at', { ascending: true });

                // Solo filtramos si no es el rol de Gerente, para que el Gerente pueda ver la comparativa completa
                if (currentUser?.role !== 'Gerente') {
                    query = query.eq('company_id', activeCompany);
                }
                
                const { data, error } = await query;
                if (error) {
                    console.error("❌ Supabase fetch error:", error);
                }

                if (data) {
                    setRawUpdates(data);
                    suppressPersist.current = true;

                    // 3. Agrupar por KPI-Empresa-Marca-Periodo para tener el último dato de cada punto
                    const aggregatedData = {};
                    data.forEach(upd => {
                        const kpiId = upd.kpi_id;
                        const companyId = upd.company_id || 'TYM';
                        const brand = upd.additional_data?.brand || 'Global';
                        const kpiDef = kpiDefinitions.find(k => k.id === kpiId);
                        const frequency = kpiDef?.frecuencia || 'MENSUAL';
                        
                        const date = new Date(upd.updated_at || upd.created_at);
                        const periodKey = upd.additional_data?.period || getPeriodIndex(date, frequency);
                        
                        const groupKey = `${kpiId}-${companyId}-${brand}-${periodKey}`;

                        if (!aggregatedData[groupKey] || new Date(upd.updated_at || upd.created_at) > new Date(aggregatedData[groupKey].latestUpdate.updated_at || aggregatedData[groupKey].latestUpdate.created_at)) {
                            aggregatedData[groupKey] = {
                                kpi_id: kpiId,
                                company_id: companyId,
                                brand: brand,
                                periodKey: periodKey,
                                latestUpdate: upd
                            };
                        }
                    });

                    // 4. Ordenar cronológicamente para que las actualizaciones se apliquen en orden
                    const sortedGroups = Object.values(aggregatedData).sort((a, b) => 
                        (a.periodKey || '').localeCompare(b.periodKey || '') || 
                        (new Date(a.latestUpdate.updated_at || a.latestUpdate.created_at) - new Date(b.latestUpdate.updated_at || b.latestUpdate.created_at))
                    );

                    // 5. Aplicar actualizaciones en bloque (BATCH UPDATE) para asegurar consistencia
                    setKpiData(prevData => {
                        let newData = [...prevData];
                        
                        sortedGroups.forEach(group => {
                            const upd = group.latestUpdate;
                            const kpiDef = kpiDefinitions.find(k => k.id === group.kpi_id);
                            const freq = kpiDef?.frecuencia || 'MENSUAL';
                            const currentPeriodKey = getReportablePeriod(freq);
                            // También aceptar el periodo actual estricto (sin gracia) y el
                            // periodo de la semana/quincena anterior para datos ya guardados
                            const strictCurrentPeriod = getPeriodIndex(new Date(), freq);
                            const isFromCurrentPeriod = 
                                group.periodKey === currentPeriodKey ||
                                group.periodKey === strictCurrentPeriod;
                            
                            newData = newData.map(kpi => {
                                if (kpi.id !== upd.kpi_id) return kpi;

                                const currentCompany = group.company_id;
                                const currentBrand = group.brand;
                                const dataKey = `${currentCompany}-${currentBrand.toUpperCase()}`;
                                const [year, rawMonthPart] = group.periodKey.split('-');
                                // Para SEMANAL (2026-W20) usar la fecha del registro para el mes
                                // Para MENSUAL/QUINCENAL (2026-05, 2026-05-Q1) extraer el número de mes
                                let monthName;
                                if (rawMonthPart?.startsWith('W')) {
                                    const d = new Date(upd.updated_at || upd.created_at);
                                    monthName = MONTH_NAMES[isNaN(d) ? new Date().getMonth() : d.getMonth()];
                                } else {
                                    const monthNumStr = rawMonthPart?.replace(/[^0-9]/g, '') || '1';
                                    const monthIdx = Math.min(Math.max(parseInt(monthNumStr) - 1, 0), 11);
                                    monthName = MONTH_NAMES[monthIdx];
                                }

                                // Recalcular métricas (ya que no se guardan en la DB)
                                let compliance = 0;
                                let semaphore = 'gray';
                                const targetMeta = (kpiDef.meta && typeof kpiDef.meta === 'object')
                                    ? (kpiDef.meta[currentBrand] || kpiDef.meta[currentCompany] || Object.values(kpiDef.meta)[0])
                                    : kpiDef.meta;

                                if (typeof targetMeta === 'number') {
                                    const isInverse = isInverseKPI(upd.kpi_id);
                                    if (targetMeta === 0) {
                                        compliance = isInverse ? (upd.value === 0 ? 100 : 0) : (upd.value > 0 ? 100 : 0);
                                    } else {
                                        compliance = isInverse ? (targetMeta / upd.value) * 100 : (upd.value / targetMeta) * 100;
                                        if (isInverse && upd.value === 0) compliance = 100;
                                    }
                                    compliance = Math.min(Math.max(Math.round(compliance || 0), 0), 100);

                                    const isStrict = ['revision-margenes', 'revision-precios', 'pedidos-facturados', 'impresion-facturas'].includes(upd.kpi_id);
                                    if (compliance >= (isStrict ? 100 : 95)) semaphore = 'green';
                                    else if (compliance >= (isStrict ? 100 : 85)) semaphore = 'yellow';
                                    else semaphore = 'red';
                                }

                                const historyPoint = {
                                    month: monthName, year: parseInt(year), monthKey: group.periodKey,
                                    [currentCompany]: upd.value,
                                    [`${currentCompany}-${currentBrand.toUpperCase()}`]: upd.value,
                                    [`${currentCompany}-${currentBrand.toUpperCase()}-COMP`]: compliance,
                                    [`${currentCompany}-${currentBrand.toUpperCase()}-SEM`]: semaphore,
                                    brand: currentBrand,
                                    compliance: compliance,
                                    updatedAt: upd.updated_at || upd.created_at
                                };

                                const history = [...(kpi.history || [])];
                                const hIdx = history.findIndex(h => h.monthKey === group.periodKey);
                                if (hIdx >= 0) history[hIdx] = { ...history[hIdx], ...historyPoint };
                                else history.push(historyPoint);

                                // Actualizamos brandValues y el estado base SIEMPRE con el dato más reciente
                                // (Como sortedGroups está ordenado por fecha, el último proceso siempre es el más nuevo)
                                const brandValues = { ...(kpi.brandValues || {}) };
                                // Actualizamos brandValues y métricas base SOLO si es el periodo reportable actual
                                if (isFromCurrentPeriod) {
                                    brandValues[dataKey] = {
                                        currentValue: upd.value, compliance, semaphore, hasData: true,
                                        additionalData: { 
                                            ...(upd.additional_data || {}), 
                                            period: group.periodKey,
                                            updatedAt: upd.updated_at || upd.created_at
                                        }
                                    };

                                    // Consolidado de marcas para el KPI base
                                    const brands = Object.keys(brandValues).filter(key => key.startsWith(`${currentCompany}-`));
                                    let sumVal = 0, sumComp = 0, count = 0;
                                    brands.forEach(k => {
                                        if (brandValues[k].hasData) {
                                            sumVal += brandValues[k].currentValue;
                                            sumComp += brandValues[k].compliance;
                                            count++;
                                        }
                                    });

                                    const finalValue = count > 0 ? sumVal / count : 0;
                                    const finalComp = count > 0 ? sumComp / count : 0;
                                    let finalSem = 'gray';
                                    if (count > 0) {
                                        const isStrict = ['revision-margenes', 'revision-precios', 'pedidos-facturados', 'impresion-facturas'].includes(kpi.id);
                                        if (finalComp >= (isStrict ? 100 : 95)) finalSem = 'green';
                                        else if (finalComp >= (isStrict ? 100 : 85)) finalSem = 'yellow';
                                        else finalSem = 'red';
                                    }

                                    return {
                                        ...kpi,
                                        currentValue: parseFloat(finalValue.toFixed(2)),
                                        compliance: Math.round(finalComp),
                                        semaphore: finalSem,
                                        hasData: true,
                                        brandValues,
                                        lastUpdate: upd.updated_at || upd.created_at,
                                        additionalData: { 
                                            ...(upd.additional_data || {}), 
                                            period: group.periodKey,
                                            updatedAt: upd.updated_at || upd.created_at
                                        },
                                        history: history.map(h => h.monthKey === group.periodKey ? { ...h, [currentCompany]: finalValue, compliance: finalComp } : h)
                                            .sort((a, b) => (a.monthKey || '').localeCompare(b.monthKey || ''))
                                    };
                                } else {
                                    // Para periodos pasados, solo actualizamos el historial y la fecha de última actividad global
                                    return {
                                        ...kpi,
                                        lastUpdate: new Date(upd.updated_at || upd.created_at) > new Date(kpi.lastUpdate || 0) 
                                            ? (upd.updated_at || upd.created_at) 
                                            : kpi.lastUpdate,
                                        history: history.map(h => h.monthKey === group.periodKey ? { ...h, [currentCompany]: historyPoint[currentCompany], compliance: historyPoint.compliance } : h)
                                            .sort((a, b) => (a.monthKey || '').localeCompare(b.monthKey || ''))
                                    };
                                }
                            });
                        });
                        return newData;
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

        const postgresFilter = currentUser?.role === 'Gerente' 
            ? { event: 'INSERT', schema: 'public', table: 'kpi_updates' }
            : { event: 'INSERT', schema: 'public', table: 'kpi_updates', filter: `company_id=eq.${activeCompany}` };

        const channel = supabase.channel(`realtime-kpi-sync-${activeCompany}-${currentPeriod}`)
            .on('postgres_changes', postgresFilter, (p) => {
                // Solo aplicar actualizaciones del mes actual en tiempo real
                setRawUpdates(prev => [...prev, p.new]);
                const { start, end } = getMonthDateRange();
                const updatedAt = new Date(p.new.updated_at);
                const startDate = new Date(start);
                const endDate   = new Date(end);
                if (updatedAt >= startDate && updatedAt <= endDate) {
                    console.log("⚡ Cambio en tiempo real detectado:", p.new);
                    applyKPIUpdate(p.new.kpi_id, { ...p.new.additional_data, value: p.new.value }, false);
                    if (onToast) onToast('info', `📊 KPI actualizado`);
                }
            }).subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [applyKPIUpdate, onToast, activeCompany, kpiData.length === 0]);

    return { kpiData, rawUpdates, isLoading, lastSyncTime, applyKPIUpdate };
};
