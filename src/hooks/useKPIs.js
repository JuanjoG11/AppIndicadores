import { useState, useEffect, useCallback, useRef } from 'react';
import { isSameDay, isSameWeek, isSameMonth, parseISO, format, subMonths } from 'date-fns';
import { kpiDefinitions } from '../data/kpiData';
import { mockKPIData as initialMockData } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { BRAND_TO_ENTITY } from '../utils/kpiHelpers';
import { calculateKPIValue, isInverseKPI } from '../utils/kpiCalculations';

const isSameBimonthlyPeriod = (p1, p2) => {
    if (!p1 || !p2) return false;
    const [y1, m1] = p1.split('-').map(Number);
    const [y2, m2] = p2.split('-').map(Number);
    if (y1 !== y2) return false;
    const bim1 = Math.ceil(m1 / 2);
    const bim2 = Math.ceil(m2 / 2);
    return bim1 === bim2;
};

const getDateFromPeriod = (period, frequency) => {
    if (!period) return new Date();
    const freq = frequency.toUpperCase();
    try {
        if (freq.includes('DIARI')) {
            // Formato: YYYY-MM-DD
            const [y, m, d] = period.split('-').map(Number);
            return new Date(y, m - 1, d);
        }
        if (freq.includes('SEMANAL')) {
            // Formato: YYYY-Www (ej. 2026-W22)
            const [y, wStr] = period.split('-');
            const w = Number(wStr.replace('W', ''));
            const year = Number(y);
            // Obtener fecha del inicio de la semana ISO
            const simple = new Date(year, 0, 1 + (w - 1) * 7);
            const dow = simple.getDay();
            const ISOweekStart = new Date(simple);
            if (dow <= 4) {
                ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
            } else {
                ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
            }
            // Sumar 3 días para estar en el medio de la semana (Jueves)
            ISOweekStart.setDate(ISOweekStart.getDate() + 3);
            return ISOweekStart;
        }
        if (freq.includes('QUINCENAL')) {
            // Formato: YYYY-MM-Q1 o YYYY-MM-Q2
            const parts = period.split('-');
            const y = Number(parts[0]);
            const m = Number(parts[1]);
            const q = parts[2];
            const day = q === 'Q1' ? 7 : 22;
            return new Date(y, m - 1, day);
        }
        if (freq.includes('BIMESTRAL') || freq.includes('MENSUAL')) {
            // Formato: YYYY-MM
            const [y, m] = period.split('-').map(Number);
            return new Date(y, m - 1, 15);
        }
    } catch (e) {
        console.error("Error parsing period date:", e);
    }
    return new Date();
};

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


    // ── Período mensual actual (YYYY-MM) ──────────────
    const getCurrentPeriod = () => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
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
     * Ahora simplemente devuelve el mes actual sin aplicar ninguna gracia.
     */
    const getReportablePeriod = (frequency = 'MENSUAL') => {
        const now = new Date();
        // Ignorar el día del mes y devolver siempre el periodo del mes actual
        const period = getPeriodIndex(now, frequency);
        return period;
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
        if (isManualUpd && newData.period) {
            recDateObj = getDateFromPeriod(newData.period, freq);
        } else {
            const raw = newData.updatedAt || new Date().toISOString();
            try { recDateObj = typeof raw === 'string' ? parseISO(raw) : new Date(raw); }
            catch { recDateObj = new Date(); }
        }
        if (isNaN(recDateObj?.getTime())) recDateObj = new Date();

        // Calcular periodo (siempre respetando newData.period si viene de un formulario)
        let prePeriodIndex = (newData.period || getPeriodIndex(recDateObj, freq)).toString();
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
                // Manual: siempre recalcular. DB: usar value persistido
                preValue = (!isManualUpd && newData.value !== undefined)
                    ? newData.value
                    : calculateKPIValue(kpiId, enrichedData);
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
            const isManualUpdate = !newData.updatedAt || newData.manual === true;

            // Si es una carga manual y se especificó un periodo, calculamos la fecha en base al periodo
            if (isManualUpdate && newData.period) {
                recordDateObj = getDateFromPeriod(newData.period, frequency);
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
            // Calculamos el índice del periodo de este registro (siempre respetando newData.period si viene de un formulario)
            let recordPeriodIndex = (newData.period || getPeriodIndex(recordDateObj, frequency)).toString();

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
            const isFromCurrentPeriod = !forceHistorical && (
                isStrictCurrent || 
                recordPeriodIndex === currentReportablePeriod ||
                (frequency === 'BIMESTRAL' && isSameBimonthlyPeriod(recordPeriodIndex, currentReportablePeriod))
            );
            // Para el tablero: mostramos si es del período actual O si es del periodo reportable actual (grace period)
            const shouldShowInDashboard = !forceHistorical && (
                isStrictCurrent ||
                recordPeriodIndex === currentReportablePeriod ||
                (frequency === 'SEMANAL') ||
                (frequency === 'BIMESTRAL' && isSameBimonthlyPeriod(recordPeriodIndex, currentReportablePeriod)) ||
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
                // Para updates de DB (recarga): usar el value persistido
                // Para updates manuales (analista): SIEMPRE recalcular desde los campos del formulario
                else if (!isManualUpdate && d.value !== undefined) newValue = d.value;
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
                
                // Recalcular cumplimiento y semáforo de todas las marcas afectadas en el estado de brandValues actual
                Object.keys(brandValues).forEach(key => {
                    const bData = brandValues[key];
                    if (bData && bData.hasData) {
                        const bBrand = key.split('-')[1];
                        const bCompany = key.split('-')[0];
                        
                        let bMeta = 0;
                        if (kpi.meta && typeof kpi.meta === 'object') {
                            bMeta = kpi.meta[bBrand] || kpi.meta[bCompany] || kpi.meta.global || 0;
                        } else {
                            bMeta = kpi.meta;
                        }
                        
                        let bComp = 0;
                        let bSem = 'gray';
                        const bVal = bData.currentValue;
                        if (typeof bMeta === 'number') {
                            const isInverse = isInverseKPI(kpiId);
                            if (bMeta === 0 && bVal === 0) {
                                bComp = isInverse ? 100 : 0;
                            } else if (bMeta === 0 && bVal > 0) {
                                bComp = isInverse ? 0 : 100;
                            } else {
                                bComp = isInverse ? (bMeta / bVal) * 100 : (bVal / bMeta) * 100;
                                if (isInverse && bVal === 0) bComp = 100;
                                bComp = Math.min(Math.max(Math.round(bComp || 0), 0), 100);
                            }
                            
                            const isStrict = ['revision-margenes', 'revision-precios', 'pedidos-facturados', 'impresion-facturas'].includes(kpiId);
                            const greenThreshold = isStrict ? 100 : 95;
                            const yellowThreshold = isStrict ? 100 : 85;

                            if (bComp >= greenThreshold) bSem = 'green';
                            else if (bComp >= yellowThreshold) bSem = 'yellow';
                            else bSem = 'red';
                        }
                        
                        brandValues[key] = {
                            ...bData,
                            meta: bMeta,
                            compliance: bComp,
                            semaphore: bSem
                        };
                    }
                });
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
                hasData: (isFromCurrentPeriod || isManualUpdate) ? true : (oldBrandData.hasData || false)
            };

            const targetMonth = MONTH_NAMES[recordDateObj.getMonth()];
            const targetCompany = currentCompany;

            // ── CONSOLIDACIÓN DE VALORES PARA EL HISTORIAL (Para periodos pasados o actuales) ──
            let historyValue = newValue;
            let historyCompliance = compliance;
            let historySemaphore = semaphore;

            const [year, monthNum] = (d.period || currentPeriod).split('-');
            const monthName = MONTH_NAMES[parseInt(monthNum) - 1];
            const periodKey = d.period || currentPeriod;

            if (kpi.meta && typeof kpi.meta === 'object') {
                // Para multi-marca, consolidamos los valores de las marcas para este periodo específico (periodKey)
                // Buscamos si ya existe una entrada para este periodo en el historial
                const existingEntry = (kpi.history || []).find(h => h.monthKey === periodKey || h.month === targetMonth);
                
                const allEntityKeys = Object.keys(kpi.meta).filter(b => b !== 'Global' && b !== 'TYM' && b !== 'TAT');
                const brandsOfEntity = allEntityKeys.filter(b => BRAND_TO_ENTITY[b] === currentCompany || b === currentCompany);
                
                let sumVal = 0;
                let sumComp = 0;
                let count = 0;
                
                brandsOfEntity.forEach(brand => {
                    const brandKey = `${currentCompany}-${brand.toUpperCase()}`;
                    let brandVal = null;
                    let brandComp = null;
                    
                    if (brand.toUpperCase() === currentBrand.toUpperCase()) {
                        brandVal = newValue;
                        brandComp = compliance;
                    } else if (existingEntry) {
                        brandVal = existingEntry[brandKey];
                        brandComp = existingEntry[`${brandKey}-COMP`];
                    }
                    
                    if (brandVal !== null && brandVal !== undefined) {
                        sumVal += brandVal;
                        sumComp += (brandComp !== null && brandComp !== undefined ? brandComp : 100);
                        count++;
                    }
                });
                
                if (count > 0) {
                    historyValue = sumVal / count;
                    historyCompliance = Math.round(sumComp / count);
                    
                    const isStrict = ['revision-margenes', 'revision-precios', 'pedidos-facturados', 'impresion-facturas'].includes(kpiId);
                    const greenThreshold = isStrict ? 100 : 95;
                    const yellowThreshold = isStrict ? 100 : 85;

                    if (historyCompliance >= greenThreshold) historySemaphore = 'green';
                    else if (historyCompliance >= yellowThreshold) historySemaphore = 'yellow';
                    else historySemaphore = 'red';
                }
            }

            let finalValue = shouldShowInDashboard ? historyValue : (kpi.currentValue || 0);
            let finalCompliance = shouldShowInDashboard ? historyCompliance : (kpi.compliance || 0);
            let finalSemaphore = shouldShowInDashboard ? historySemaphore : (kpi.semaphore || 'gray');
            let finalHasData = isFromCurrentPeriod || kpi.hasData;

            // ── ACTUALIZACIÓN DEL HISTORIAL ──
            const newHistory = [...(kpi.history || [])];
            const existingHistoryIdx = newHistory.findIndex(h => h.monthKey === periodKey || h.month === monthName);
            
            const historyPoint = {
                month: targetMonth,
                year: recordDateObj.getFullYear(),
                monthKey: periodKey,
                [currentCompany]: historyValue,
                [`${currentCompany}-${currentBrand.toUpperCase()}`]: newValue,
                [`${currentCompany}-${currentBrand.toUpperCase()}-COMP`]: compliance,
                [`${currentCompany}-${currentBrand.toUpperCase()}-SEM`]: semaphore,
                compliance: historyCompliance,
                updatedAt: d.updatedAt
            };

            if (existingHistoryIdx >= 0) {
                newHistory[existingHistoryIdx] = { ...newHistory[existingHistoryIdx], ...historyPoint };
            } else {
                newHistory.push(historyPoint);
            }

            const newKpi = {
                ...kpi,
                // Solo actualizar los valores del dashboard si el dato es del periodo actual o es manual
                ...(shouldShowInDashboard ? {
                    currentValue: parseFloat(finalValue.toFixed(2)),
                    compliance: finalCompliance,
                    semaphore: finalSemaphore,
                    additionalData: d,
                } : {
                    // Para datos de periodos pasados: preservar los valores actuales del dashboard
                    currentValue: kpi.currentValue,
                    compliance: kpi.compliance,
                    semaphore: kpi.semaphore,
                    additionalData: kpi.additionalData || d,
                }),
                hasData: finalHasData,
                lastUpdate: d.updatedAt,
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
    }, [activeCompany, currentUser, currentPeriod]);

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
                    period: persistPeriod,
                    // Marcar como manual solo si es carga de datos (no cambio de meta/frecuencia)
                    ...(additionalData?.type !== 'META_UPDATE' ? { manual: true } : {})
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
                    frecuencia: live.frecuencia || def.frecuencia, // Preservar frecuencia modificada por gerente en DB
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
}, []);
    // ── 2. CARGA DE DATOS DE SUPABASE (histórico del año + suscripción realtime) ──
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                // Fetch only the last 12 months of history to reduce egress
                const now = new Date();
                const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString();
                const startISO = twelveMonthsAgo;
                const { end } = getMonthDateRange();

                console.log(`📅 Cargando datos históricos desde ${startISO} hasta ${end}`);

                // Apply a reasonable limit to the query to avoid huge payloads
                let query = supabase
                    .from('kpi_updates')
                    .select('*')
                    .gte('updated_at', startISO)
                    .lte('updated_at', end)
                    .order('updated_at', { ascending: true })
                    .limit(5000); // Adjust as needed based on typical data volume

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

                    // 3a. Separar META_UPDATEs de actualizaciones de datos normales
                    //     Los META_UPDATEs se procesan primero para reconstruir metas y periodicidades
                    const metaUpdates = data.filter(u => u.additional_data?.type === 'META_UPDATE');
                    const dataUpdates = data.filter(u => u.additional_data?.type !== 'META_UPDATE');

                    // 3b. Aplicar META_UPDATEs: reconstruir metas y frecuencias guardadas por el gerente
                    setKpiData(prevData => {
                        let rebuilt = [...prevData];
                        // Ordenar por fecha para que el más reciente gane
                        const sortedMetas = [...metaUpdates].sort((a, b) =>
                            new Date(a.updated_at || a.created_at) - new Date(b.updated_at || b.created_at)
                        );
                        sortedMetas.forEach(upd => {
                            rebuilt = rebuilt.map(kpi => {
                                if (kpi.id !== upd.kpi_id) return kpi;
                                const d = upd.additional_data || {};
                                let newFrecuencia = kpi.frecuencia;
                                if (d.newFrecuencia && d.newFrecuencia !== kpi.frecuencia) {
                                    newFrecuencia = d.newFrecuencia;
                                    console.log(`🔄 Frecuencia restaurada desde DB: ${kpi.id} → ${newFrecuencia}`);
                                }
                                let newMeta = kpi.meta;
                                if (d.newMeta !== undefined) {
                                    const scope = d.brand;
                                    if (!scope || scope === 'Global' || scope === 'global') {
                                        const base = (kpi.meta && typeof kpi.meta === 'object') ? { ...kpi.meta } : { global: kpi.meta };
                                        newMeta = { ...base, [upd.company_id]: d.newMeta };
                                    } else {
                                        const base = (kpi.meta && typeof kpi.meta === 'object') ? { ...kpi.meta } : { global: kpi.meta };
                                        newMeta = { ...base, [scope]: d.newMeta };
                                    }
                                    console.log(`🎯 Meta restaurada desde DB: ${kpi.id} ${scope || 'global'} → ${d.newMeta}`);
                                }
                                return { ...kpi, frecuencia: newFrecuencia, meta: newMeta };
                            });
                        });
                        return rebuilt;
                    });

                    // 3c. Agrupar datos normales por KPI-Empresa-Marca-Periodo para tener el último dato de cada punto
                    const aggregatedData = {};
                    dataUpdates.forEach(upd => {
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
                            if (!kpiDef) return;

                            newData = newData.map(kpi => {
                                if (kpi.id !== upd.kpi_id) return kpi;

                                // Bug fix: obtener freq y targetMeta del estado del KPI (ya con metas/frecuencias
                                // del gerente aplicadas en el paso 3b), no del kpiDef estático.
                                const freq = (kpi.frecuencia || kpiDef.frecuencia || 'MENSUAL').toUpperCase();
                                const currentPeriodKey = getReportablePeriod(freq);
                                const strictCurrentPeriod = getPeriodIndex(new Date(), freq);
                                const isFromCurrentPeriod =
                                    group.periodKey === currentPeriodKey ||
                                    group.periodKey === strictCurrentPeriod ||
                                    (freq === 'BIMESTRAL' && isSameBimonthlyPeriod(group.periodKey, currentPeriodKey));

                                const currentCompany = group.company_id;
                                const currentBrand = group.brand;
                                const dataKey = `${currentCompany}-${currentBrand.toUpperCase()}`;
                                const [year, rawMonthPart] = group.periodKey.split('-');
                                
                                let monthName;
                                if (rawMonthPart?.startsWith('W')) {
                                    const d = new Date(upd.updated_at || upd.created_at);
                                    monthName = MONTH_NAMES[isNaN(d) ? new Date().getMonth() : d.getMonth()];
                                } else {
                                    const monthNumStr = rawMonthPart?.replace(/[^0-9]/g, '') || '1';
                                    const monthIdx = Math.min(Math.max(parseInt(monthNumStr) - 1, 0), 11);
                                    monthName = MONTH_NAMES[monthIdx];
                                }

                                // Recalcular métricas usando la meta del estado actual del KPI (no la estática)
                                let compliance = 0;
                                let semaphore = 'gray';
                                const targetMeta = (kpi.meta && typeof kpi.meta === 'object')
                                    ? (kpi.meta[currentBrand] || kpi.meta[currentCompany] || Object.values(kpi.meta)[0])
                                    : (kpi.meta ?? kpiDef?.meta);

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
                                brandValues[dataKey] = {
                                    currentValue: upd.value,
                                    compliance,
                                    semaphore,
                                    hasData: true,
                                    additionalData: {
                                        ...(upd.additional_data || {}),
                                        period: group.periodKey,
                                        updatedAt: upd.updated_at || upd.created_at
                                    }
                                };

                                // Consolidado de marcas para el KPI base (Priorizar marcas específicas sobre nivel entidad)
                                const allEntityKeys = Object.keys(brandValues).filter(key => key.startsWith(`${currentCompany}-`));
                                const brandsOfEntity = kpiDef.meta && typeof kpiDef.meta === 'object' 
                                    ? Object.keys(kpiDef.meta).filter(b => (BRAND_TO_ENTITY[b] === currentCompany || b === currentCompany) && b !== currentCompany)
                                    : [];
                                
                                const brandSpecificKeys = brandsOfEntity.length > 0
                                    ? brandsOfEntity.map(b => `${currentCompany}-${b}`).filter(k => brandValues[k]?.hasData)
                                    : [];
                                
                                const keysToAggregate = brandSpecificKeys.length > 0
                                    ? brandSpecificKeys
                                    : allEntityKeys.filter(k => brandValues[k]?.hasData);

                                let sumVal = 0, sumComp = 0, count = 0;
                                keysToAggregate.forEach(k => {
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
                                    const isStrict = ['revision-margenes', 'revision-precios', 'pedidos-facturados', 'impresion-facturas', 'fiabilidad-inventarios', 'planillas-separadas', 'pedidos-separar-total'].includes(kpi.id);
                                    if (finalComp >= (isStrict ? 100 : 95)) finalSem = 'green';
                                    else if (finalComp >= (isStrict ? 100 : 85)) finalSem = 'yellow';
                                    else finalSem = 'red';
                                }

                                // ── SIEMPRE actualizamos brandValues con el dato más reciente de cada periodo ──
                                // (periodos pasados O actuales - ambos persisten en brandValues para que el
                                //  gerente y el tablero puedan ver el historial completo al recargar)

                                // Determinar el estado del KPI base usando TODOS los brandValues disponibles
                                // Priorizamos las claves de marcas específicas sobre el nivel entidad
                                const finalBrandSpecificKeys = brandsOfEntity.length > 0
                                    ? brandsOfEntity.map(b => `${currentCompany}-${b}`).filter(k => brandValues[k]?.hasData)
                                    : [];
                                const finalKeysToAggregate = finalBrandSpecificKeys.length > 0
                                    ? finalBrandSpecificKeys
                                    : allEntityKeys.filter(k => brandValues[k]?.hasData);

                                let fSumVal = 0, fSumComp = 0, fCount = 0;
                                finalKeysToAggregate.forEach(k => {
                                    if (brandValues[k]?.hasData) {
                                        fSumVal += brandValues[k].currentValue;
                                        fSumComp += brandValues[k].compliance;
                                        fCount++;
                                    }
                                });

                                const aggFinalValue = fCount > 0 ? fSumVal / fCount : 0;
                                const aggFinalComp  = fCount > 0 ? fSumComp / fCount : 0;
                                let aggFinalSem = 'gray';
                                if (fCount > 0) {
                                    const isStrict = ['revision-margenes', 'revision-precios', 'pedidos-facturados', 'impresion-facturas', 'fiabilidad-inventarios', 'planillas-separadas', 'pedidos-separar-total'].includes(kpi.id);
                                    if (aggFinalComp >= (isStrict ? 100 : 95)) aggFinalSem = 'green';
                                    else if (aggFinalComp >= (isStrict ? 100 : 85)) aggFinalSem = 'yellow';
                                    else aggFinalSem = 'red';
                                }

                                // Si el periodo es el actual → actualizar currentValue del KPI base (lo que muestra la card)
                                // Si el periodo es pasado  → solo actualizamos brandValues e historial (no cambia el currentValue de la card)
                                const baseKpiUpdate = isFromCurrentPeriod
                                    ? {
                                        currentValue: parseFloat(aggFinalValue.toFixed(2)),
                                        compliance: Math.round(aggFinalComp),
                                        semaphore: aggFinalSem,
                                    }
                                    : {
                                        // Mantener los valores actuales de la card para no pisarlos con datos viejos
                                        currentValue: kpi.currentValue,
                                        compliance: kpi.compliance,
                                        semaphore: kpi.semaphore,
                                    };

                                return {
                                    ...kpi,
                                    ...baseKpiUpdate,
                                    hasData: kpi.hasData || isFromCurrentPeriod,
                                    brandValues,
                                    lastUpdate: new Date(upd.updated_at || upd.created_at) > new Date(kpi.lastUpdate || 0)
                                        ? (upd.updated_at || upd.created_at)
                                        : kpi.lastUpdate,
                                    additionalData: isFromCurrentPeriod
                                        ? { ...(upd.additional_data || {}), period: group.periodKey, updatedAt: upd.updated_at || upd.created_at }
                                        : (kpi.additionalData || { ...(upd.additional_data || {}), period: group.periodKey }),
                                    history: history
                                        .map(h => h.monthKey === group.periodKey
                                            ? { ...h, [currentCompany]: isFromCurrentPeriod ? aggFinalValue : upd.value, compliance: isFromCurrentPeriod ? aggFinalComp : compliance }
                                            : h
                                        )
                                        .sort((a, b) => (a.monthKey || '').localeCompare(b.monthKey || ''))
                                };
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
                // Aplicar TODAS las actualizaciones en tiempo real (no solo las del mes actual)
                // para que el gerente reciba los datos inmediatamente sin importar el período cargado
                setRawUpdates(prev => [...prev, p.new]);
                console.log("⚡ Cambio en tiempo real detectado:", p.new);
                applyKPIUpdate(
                    p.new.kpi_id,
                    { ...p.new.additional_data, value: p.new.value, updatedAt: p.new.updated_at },
                    false
                );
                if (onToast) onToast('info', `📊 KPI actualizado`);
            }).subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [applyKPIUpdate, onToast, activeCompany, kpiData.length === 0]);

    return { kpiData, rawUpdates, isLoading, lastSyncTime, applyKPIUpdate };
};
