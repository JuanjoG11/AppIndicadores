/* eslint-disable react-hooks/exhaustive-deps, no-prototype-builtins */
import { useState, useEffect, useCallback, useRef } from 'react';
import { parseISO, format } from 'date-fns';
import { kpiDefinitions } from '../data/kpiData';
import { mockKPIData as initialMockData } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { BRAND_TO_ENTITY } from '../utils/kpiHelpers';
import { calculateKPIValue, isInverseKPI } from '../utils/kpiCalculations';


// Normaliza cualquier período granular (quincenal, semanal, diario) a YYYY-MM
const toMonthKey = (periodOrKey) => {
    if (!periodOrKey) return null;
    const s = String(periodOrKey);
    if (/^\d{4}-\d{2}$/.test(s)) return s;
    if (/^\d{4}-\d{2}[-_]/.test(s)) return s.substring(0, 7);
    const weekMatch = s.match(/^(\d{4})-W(\d{1,2})$/);
    if (weekMatch) {
        const year = parseInt(weekMatch[1]);
        const week = parseInt(weekMatch[2]);
        const simple = new Date(year, 0, 1 + (week - 1) * 7);
        const dow = simple.getDay();
        const isoStart = new Date(simple);
        if (dow <= 4) isoStart.setDate(simple.getDate() - simple.getDay() + 1);
        else isoStart.setDate(simple.getDate() + 8 - simple.getDay());
        isoStart.setDate(isoStart.getDate() + 3);
        return `${isoStart.getFullYear()}-${String(isoStart.getMonth() + 1).padStart(2, '0')}`;
    }
    if (s.length >= 7 && /^\d{4}-\d{2}/.test(s)) return s.substring(0, 7);
    return null;
};

const isSameBimonthlyPeriod = (p1, p2) => {
    if (!p1 || !p2) return false;
    const [y1, m1] = p1.split('-').map(Number);
    const [y2, m2] = p2.split('-').map(Number);
    if (y1 !== y2) return false;
    const bim1 = Math.ceil(m1 / 2);
    const bim2 = Math.ceil(m2 / 2);
    return bim1 === bim2;
};

/**
 * Determina si una frecuencia es "granular" (sub-mensual).
 * Para estas frecuencias, hasData debe compararse contra el periodo exacto,
 * NO contra el mes completo.
 */
const isGranularFrequency = (freq) => {
    const f = (freq || '').toUpperCase();
    return f.includes('DIARI') || f.includes('SEMANAL') || f.includes('QUINCENAL');
};

const periodToMonth = (period) => {
    if (!period) return '';
    if (/^\d{4}-\d{2}$/.test(period)) return period;
    if (/^\d{4}-\d{2}-\d{2}$/.test(period)) return period.substring(0, 7);
    if (/^\d{4}-\d{2}-Q[12]$/.test(period)) return period.substring(0, 7);
    if (/^\d{4}-W\d{1,2}$/.test(period)) {
        try {
            const parts = period.split('-');
            const year = Number(parts[0]);
            const week = Number(parts[1].replace('W', ''));
            const simple = new Date(year, 0, 1 + (week - 1) * 7);
            const dow = simple.getDay();
            const isoStart = new Date(simple);
            if (dow <= 4) { isoStart.setDate(simple.getDate() - simple.getDay() + 1); }
            else { isoStart.setDate(simple.getDate() + 8 - simple.getDay()); }
            isoStart.setDate(isoStart.getDate() + 3);
            return isoStart.getFullYear() + '-' + String(isoStart.getMonth() + 1).padStart(2, '0');
        } catch { return ''; }
    }
    return period.substring(0, 7);
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

    // Ref para mantener kpiData fresco en applyKPIUpdate sin causar loop infinito
    const kpiDataRef = useRef(kpiData);
    useEffect(() => {
        kpiDataRef.current = kpiData;
    }, [kpiData]);

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

    // (getMonthDateRange no se usa en la query principal y se eliminó para evitar advertencias de linter)

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
     */
    const getReportablePeriod = (frequency = 'MENSUAL') => {
        const now = new Date();
        const period = getPeriodIndex(now, frequency);
        return period;
    };

    /**
     * Aplica actualizaciones locales al estado.
     */
    const applyKPIUpdate = useCallback((kpiId, newData, shouldPersist = true, forceHistorical = false) => {
        // Pre-calcular periodo y valor FUERA del updater (evita side-effects en updaters de React)
        const kpiDef = kpiDefinitions.find(k => k.id === kpiId);
        const liveKpi = kpiDataRef.current.find(k => k.id === kpiId);
        const freq = (liveKpi?.frecuencia || kpiDef?.frecuencia || 'MENSUAL').toUpperCase();
        const isManualUpd = !newData.updatedAt;

        // GUARDIA: si es una actualización manual sin selector de período explícito
        // (periodSelectedByUser !== true) y el período enviado es de un mes anterior al actual,
        // corregirlo. Esto bloquea borradores corruptos del mes pasado sin afectar correcciones
        // históricas intencionales que el usuario seleccionó en el form.
        const currentActualPeriod = getPeriodIndex(new Date(), freq);
        if (isManualUpd && newData.period && !newData.periodSelectedByUser) {
            const sentMonthKey = toMonthKey(String(newData.period)) || String(newData.period);
            const currentMonthKey = toMonthKey(currentActualPeriod) || currentActualPeriod;
            if (sentMonthKey !== currentMonthKey) {
                console.warn(`⚠️ [applyKPIUpdate] Period mismatch en guardado automático: enviado=${newData.period}, actual=${currentActualPeriod}. Corrigiendo.`);
                newData = { ...newData, period: currentActualPeriod };
            }
        }
        // Solo loguear en caso de corrección automática (no spam en consola)

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
            // Si viene de la base de datos (con updatedAt), NO es una actualización manual local que requiera recalcular.
            const isManualUpdate = !newData.updatedAt;

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
                    } catch {
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
            // Mes actual YYYY-MM para comparación independiente de granularidad
            const currentMonthNorm = toMonthKey(currentReportablePeriod) || currentReportablePeriod;
            const recordMonthNorm = toMonthKey(recordPeriodIndex) || recordPeriodIndex;

            // Periodos comparativos
            const isStrictCurrent = recordPeriodIndex === currentReportablePeriod || recordPeriodIndex === actualCurrentPeriod;
            const isSameMonthNorm = currentMonthNorm === recordMonthNorm;

            // Comparación cruzada de meses para frecuencias gruesas
            const recordMonth = periodToMonth(recordPeriodIndex);
            const currentMonth = periodToMonth(currentReportablePeriod);
            const isCrossPeriodMatch = (frequency === 'MENSUAL' || frequency === 'BIMESTRAL' || frequency === 'SEMESTRAL') && 
                                       recordMonth && recordMonth === currentMonth;

            const granular = isGranularFrequency(frequency);
            const isFromCurrentPeriod = !forceHistorical && (
                granular
                    ? isStrictCurrent
                    : (
                        isStrictCurrent || 
                        isSameMonthNorm ||
                        isCrossPeriodMatch ||
                        recordPeriodIndex === currentReportablePeriod ||
                        (frequency === 'BIMESTRAL' && isSameBimonthlyPeriod(recordPeriodIndex, currentReportablePeriod))
                    )
            );
            const shouldShowInDashboard = !forceHistorical && (
                isStrictCurrent ||
                isSameMonthNorm ||
                isCrossPeriodMatch ||
                recordPeriodIndex === currentReportablePeriod ||
                (frequency === 'BIMESTRAL' && isSameBimonthlyPeriod(recordPeriodIndex, currentReportablePeriod)) ||
                recordMonthNorm === currentMonthNorm
            );
            
            // Enriquecer datos con el periodo calculado si falta
            const updatedAdditionalData = {
                ...newData,
                updatedAt: newData.updatedAt || new Date().toISOString(),
                period: recordPeriodIndex
            };
            const d = updatedAdditionalData;

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
                // Solo actualizar meta si newMeta es un número válido
                const rawNewMeta = d.newMeta;
                const parsedNewMeta = typeof rawNewMeta === 'string' ? parseFloat(rawNewMeta) : rawNewMeta;
                if (rawNewMeta !== undefined && rawNewMeta !== null && rawNewMeta !== '' && !isNaN(parsedNewMeta)) {
                    const scope = d.brand;
                    if (!scope || scope === 'Global' || scope === 'global' || scope === currentCompany) {
                        const currentMeta = (kpi.meta && typeof kpi.meta === 'object') ? { ...kpi.meta } : { global: kpi.meta };
                        kpi.meta = { ...currentMeta, [currentCompany]: parsedNewMeta };
                    } else {
                        const staticDef = kpiDefinitions.find(s => s.id === kpiId);
                        const originalHasBrand = staticDef && staticDef.meta && typeof staticDef.meta === 'object' && staticDef.meta.hasOwnProperty(scope);
                        if (originalHasBrand) {
                            const currentMeta = (kpi.meta && typeof kpi.meta === 'object') ? { ...kpi.meta } : { global: kpi.meta };
                            kpi.meta = { ...currentMeta, [scope]: parsedNewMeta };
                        }
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
                            
                            const isStrict = ['revision-margenes', 'revision-precios', 'pedidos-facturados', 'impresion-facturas', 'fiabilidad-inventarios', 'planillas-separadas', 'pedidos-separar-total'].includes(kpiId);
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

                const isStrict = ['revision-margenes', 'revision-precios', 'pedidos-facturados', 'impresion-facturas', 'fiabilidad-inventarios', 'planillas-separadas', 'pedidos-separar-total'].includes(kpiId);
                const greenThreshold = isStrict ? 100 : 95;
                const yellowThreshold = isStrict ? 100 : 85;

                if (compliance >= greenThreshold) semaphore = 'green';
                else if (compliance >= yellowThreshold) semaphore = 'yellow';
                else semaphore = 'red';
            }

            const oldBrandData = brandValues[dataKey] || {};
            const oldUpdatedAt = oldBrandData.additionalData?.updatedAt || oldBrandData.updatedAt || 0;
            const newUpdatedAt = d.updatedAt || new Date().toISOString();
            const newIsNewer = !oldBrandData.additionalData?.updatedAt || newUpdatedAt >= oldUpdatedAt;

            // BUG FIX: Si es una actualización de META (META_UPDATE), no cambiar el estado de hasData, mantener el que ya tenía.
            const nextHasData = d.type === 'META_UPDATE' 
                ? (oldBrandData.hasData ?? false)
                : (isFromCurrentPeriod ? true : false);

            brandValues[dataKey] = {
                ...oldBrandData,
                currentValue: shouldShowInDashboard && newIsNewer && d.type !== 'META_UPDATE' ? newValue : (oldBrandData.currentValue || 0),
                meta: targetMeta,
                compliance: shouldShowInDashboard && newIsNewer && d.type !== 'META_UPDATE' ? compliance : (oldBrandData.compliance || 0),
                semaphore: shouldShowInDashboard && newIsNewer && d.type !== 'META_UPDATE' ? semaphore : (oldBrandData.semaphore || 'gray'),
                additionalData: shouldShowInDashboard && newIsNewer ? d : (oldBrandData.additionalData || d),
                hasData: nextHasData
            };
            console.log(`[applyKPIUpdate] ${kpiId} brand=${currentBrand} period=${recordPeriodIndex} isFromCurrent=${isFromCurrentPeriod} type=${d.type} → hasData=${nextHasData}`);

            // ── CONSOLIDACIÓN DE VALORES PARA EL HISTORIAL ──
            let historyValue = newValue;
            let historyCompliance = compliance;
            let historySemaphore = semaphore;

            const [, monthNum] = (d.period || currentPeriod).split('-');
            const monthName = MONTH_NAMES[parseInt(monthNum) - 1];
            const periodKey = d.period || currentPeriod;
            // BUG FIX #5: Para granulares usar el periodo exacto como key del historial.
            // Antes se usaba siempre toMonthKey, que colapsaba Q1 y Q2 en la misma entrada.
            const normalizedMonthKey = granular ? periodKey : (toMonthKey(periodKey) || periodKey);
            // Nombre del mes basado en el monthKey normalizado (más fiable que recordDateObj para histórico)
            const histMonth = MONTH_NAMES[parseInt((toMonthKey(periodKey) || periodKey).split('-')[1]) - 1] || monthName;

            // Para KPIs con marcas: consolidar promedio de marcas del mismo periodo
            const hasMultiBrandMeta = kpi.meta && typeof kpi.meta === 'object';
            if (hasMultiBrandMeta) {
                // BUG FIX #5: buscar entrada existente usando la misma clave normalizada (exacta para granulares)
                const existingEntry = (kpi.history || []).find(h =>
                    granular ? h.monthKey === normalizedMonthKey : toMonthKey(h.monthKey) === normalizedMonthKey
                );
                const allEntityKeys = Object.keys(kpi.meta).filter(b => b !== 'Global' && b !== 'TYM' && b !== 'TAT');
                const brandsOfEntity = allEntityKeys.filter(b => BRAND_TO_ENTITY[b] === currentCompany || b === currentCompany);
                
                let sumVal = 0, sumComp = 0, count = 0;
                brandsOfEntity.forEach(brand => {
                    const brandKey = `${currentCompany}-${brand.toUpperCase()}`;
                    let brandVal = null, brandComp = null;
                    if (brand.toUpperCase() === currentBrand.toUpperCase()) {
                        brandVal = newValue; brandComp = compliance;
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
                    const isStrict = ['revision-margenes','revision-precios','pedidos-facturados','impresion-facturas','fiabilidad-inventarios','planillas-separadas','pedidos-separar-total'].includes(kpiId);
                    if (historyCompliance >= (isStrict ? 100 : 95)) historySemaphore = 'green';
                    else if (historyCompliance >= (isStrict ? 100 : 85)) historySemaphore = 'yellow';
                    else historySemaphore = 'red';
                }
            }
            // Para KPIs sin marcas: usar directamente el valor calculado (ya está en historyValue)

            let finalValue = shouldShowInDashboard ? historyValue : (kpi.currentValue || 0);
            let finalCompliance = shouldShowInDashboard ? historyCompliance : (kpi.compliance || 0);
            let finalSemaphore = shouldShowInDashboard ? historySemaphore : (kpi.semaphore || 'gray');
            // hasData del KPI base: solo true si el dato es del periodo actual.
            // Si es un dato histórico (otro mes), NO contaminar el estado "actual" del KPI.
            const finalHasData = isFromCurrentPeriod;

            // ── ACTUALIZACIÓN DEL HISTORIAL ──
            const newHistory = [...(kpi.history || [])];
            // BUG FIX #5: Para granulares comparar por clave exacta, no por mes normalizado
            const existingHistoryIdx = newHistory.findIndex(h =>
                granular ? h.monthKey === normalizedMonthKey : toMonthKey(h.monthKey) === normalizedMonthKey
            );
            
            const historyPoint = {
                month: histMonth,
                year: recordDateObj.getFullYear(),
                monthKey: normalizedMonthKey,
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

    // BUG FIX #8: Mutex para evitar race condition INSERT→INSERT duplicado.
    // Clave: kpiId-companyId-brand-period
    const persistInFlight = useRef(new Set());

    const persistUpdate = async (kpiId, additionalData, value, user) => {
        let lockKey = null;
        try {
            const persistBrand = additionalData?.brand || (Array.isArray(user?.activeBrand) ? user.activeBrand[0] : user?.activeBrand) || 'Global';
            
            const liveKpi = kpiDataRef.current.find(k => k.id === kpiId);
            const frequency = (liveKpi?.frecuencia || kpiDefinitions.find(k => k.id === kpiId)?.frecuencia || 'MENSUAL').toUpperCase();
            const persistPeriod = additionalData?.period || getPeriodIndex(new Date(), frequency);
            
            // Para frecuencias granulares, preservar el periodo exacto (YYYY-MM-DD, YYYY-Www, YYYY-MM-Qx).
            // Solo normalizar a YYYY-MM para frecuencias mensual/bimestral.
            const granular = isGranularFrequency(frequency);
            const periodToStore = granular ? persistPeriod : (toMonthKey(persistPeriod) || persistPeriod);
            const companyId = additionalData?.company || activeCompany || user?.company || 'TYM';
            
            // BUG FIX #8: Lock por clave para evitar race condition de doble INSERT.
            lockKey = `${kpiId}-${companyId}-${persistBrand}-${periodToStore}`;
            if (persistInFlight.current.has(lockKey)) {
                console.log('🔒 persistUpdate ignorado (ya en vuelo):', lockKey);
                return;
            }
            persistInFlight.current.add(lockKey);
            
            const payload = {
                company_id: companyId,
                kpi_id: kpiId,
                additional_data: {
                    ...additionalData,
                    brand: persistBrand,
                    period: periodToStore,
                    periodSelectedByUser: undefined, // no persisitir el flag interno
                    ...(additionalData?.type !== 'META_UPDATE' ? { manual: true } : {})
                },
                value: isFinite(value) ? value : 0,
                cargo: user?.cargo || 'Sistema'
            };

            // Con anon key de Supabase, UPDATE y DELETE no están permitidos.
            // Estrategia: siempre INSERT. El batch de carga inicial ya deduplica
            // conservando solo el registro más reciente por KPI+company+brand+periodo.
            const { error } = await supabase.from('kpi_updates').insert(payload);
            if (error) {
                console.error("❌ Detalle Error Supabase:", error.message, error.details, error.hint);
                throw error;
            }
            setLastSyncTime(new Date());
        } catch (err) {
            console.error("❌ Error persistiendo en Supabase:", err);
            if (onToast) onToast('error', `Error: ${err.message || 'Error al guardar'}`);
        } finally {
            // Liberar el lock siempre (éxito o error) usando la misma clave calculada al inicio
            if (lockKey) persistInFlight.current.delete(lockKey);
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
                        const isForcedMeta = ['revision-margenes', 'revision-precios', 'pedidos-facturados', 'impresion-facturas', 'fiabilidad-inventarios', 'planillas-separadas', 'pedidos-separar-total'].includes(def.id);
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
                console.log(`📅 Cargando datos históricos desde ${startISO}`);

                // ─── QUERY 1: Mes actual (PRIORIDAD) ─────────────────────────────────────
                // Supabase tiene un límite real de ~1000 filas por defecto aunque se ponga limit(5000).
                // Con orden ascending, los datos más viejos llegan primero y los de junio NUNCA llegan.
                // Solución: query separada del mes actual para garantizar que siempre se carguen.
                const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const { data: currentMonthData, error: currentMonthError } = await supabase
                    .from('kpi_updates')
                    .select('*')
                    .gte('updated_at', currentMonthStart)
                    .order('updated_at', { ascending: false })
                    .limit(1000);

                if (currentMonthError) console.error('❌ Error cargando mes actual:', currentMonthError);
                console.log(`📅 Datos del mes actual cargados: ${currentMonthData?.length ?? 0} registros`);

                // ─── QUERY 2: Histórico (últimos 12 meses, orden DESC para que los más recientes lleguen primero) ─
                const { data: historicalData, error: historicalError } = await supabase
                    .from('kpi_updates')
                    .select('*')
                    .gte('updated_at', startISO)
                    .lt('updated_at', currentMonthStart)
                    .order('updated_at', { ascending: false })
                    .limit(1000);

                if (historicalError) console.error('❌ Error cargando histórico:', historicalError);
                console.log(`📅 Datos históricos cargados: ${historicalData?.length ?? 0} registros`);

                // Combinar: mes actual primero, luego histórico (para que la deduplicación preserve los más recientes)
                const data = [...(currentMonthData || []), ...(historicalData || [])];
                const error = currentMonthError && historicalError ? currentMonthError : null;

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
                                }
                                let newMeta = kpi.meta;
                                // Solo aplicar si newMeta es un número válido (no undefined, null, ni string vacío)
                                const rawMeta = d.newMeta;
                                const parsedMeta = typeof rawMeta === 'string' ? parseFloat(rawMeta) : rawMeta;
                                if (rawMeta !== undefined && rawMeta !== null && rawMeta !== '' && !isNaN(parsedMeta)) {
                                    const scope = d.brand;
                                    if (!scope || scope === 'Global' || scope === 'global') {
                                        const base = (kpi.meta && typeof kpi.meta === 'object') ? { ...kpi.meta } : { global: kpi.meta };
                                        // Usar la empresa del additional_data si existe, si no usar el company_id del registro
                                        const companyScope = d.company || upd.additional_data?.company || 'TYM';
                                        newMeta = { ...base, [companyScope]: parsedMeta };
                                    } else {
                                        const base = (kpi.meta && typeof kpi.meta === 'object') ? { ...kpi.meta } : { global: kpi.meta };
                                        newMeta = { ...base, [scope]: parsedMeta };
                                    }
                                    console.log(`🎯 Meta restaurada desde DB: ${kpi.id} ${d.brand || 'global'} → ${parsedMeta}`);
                                }
                                return { ...kpi, frecuencia: newFrecuencia, meta: newMeta };
                            });
                        });
                        return rebuilt;
                    });

                    // 3c. Agrupar datos normales por KPI-Empresa-Marca-Periodo
                    // Cada combinación kpi+company+brand+periodo es una entrada independiente.
                    // Para frecuencias granulares se preserva el periodo exacto (Q1 ≠ Q2, W01 ≠ W02).
                    const aggregatedData = {};
                    dataUpdates.forEach(upd => {
                        const kpiId = upd.kpi_id;
                        const companyId = upd.additional_data?.company || upd.company_id || 'TYM';
                        
                        // Filtrar por empresa en memoria (excepto Gerente que ve todo)
                        // Registros legacy sin company se asignan a TYM para evitar contaminación cruzada
                        const hasCompany = !!upd.additional_data?.company;
                        if (currentUser?.role !== 'Gerente' && hasCompany && companyId !== activeCompany) return;
                        // Registros legacy sin company: solo incluir si somos TYM (la empresa original)
                        if (!hasCompany && activeCompany !== 'TYM' && currentUser?.role !== 'Gerente') return;
                        
                        const brand = upd.additional_data?.brand || 'Global';
                        const kpiDef = kpiDefinitions.find(k => k.id === kpiId);
                        const frequency = kpiDef?.frecuencia || 'MENSUAL';
                        
                        const date = new Date(upd.updated_at || upd.created_at);
                        const rawPeriod = upd.additional_data?.period || getPeriodIndex(date, frequency);
                        // BUG FIX #1/#2: Para frecuencias granulares preservar el periodo exacto.
                        // toMonthKey colapsaría Q1 y Q2 al mismo key, perdiendo uno de los dos.
                        const granularFreq = isGranularFrequency(frequency);

                        // CORRECCIÓN DE REGISTROS LEGACY: Para frecuencias mensuales/bimestrales,
                        // si el period guardado en DB es de un mes anterior pero updated_at es del mes
                        // actual, el dato es válido para este mes (fue guardado con period corrupto).
                        // Usamos el mes del updated_at como periodo real.
                        let resolvedRawPeriod = rawPeriod;
                        if (!granularFreq && rawPeriod) {
                            const savedMonthKey = toMonthKey(rawPeriod) || rawPeriod;
                            const updatedAtMonthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                            const nowMonthKey = (() => {
                                const n = new Date();
                                return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
                            })();
                            // Solo corregir si:
                            // 1. El period guardado difiere del mes del updated_at
                            // 2. El updated_at es del mes ACTUAL (no un dato histórico legítimo del mes pasado)
                            // Esto evita reclasificar datos históricos válidos como del mes actual
                            if (savedMonthKey !== updatedAtMonthKey && updatedAtMonthKey === nowMonthKey) {
                                resolvedRawPeriod = updatedAtMonthKey;
                                console.log(`[batch] Corrigiendo period legacy: ${rawPeriod} → ${resolvedRawPeriod} (updated_at: ${upd.updated_at})`);
                            }
                        }

                        const periodKey = granularFreq ? resolvedRawPeriod : (toMonthKey(resolvedRawPeriod) || resolvedRawPeriod);
                        
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
                                // Mes actual en YYYY-MM (para comparación independiente de granularidad)
                                const currentMonthKey = toMonthKey(currentPeriodKey) || currentPeriodKey;
                                const groupMonthKey = toMonthKey(group.periodKey) || group.periodKey;

                                const recordMonth = periodToMonth(group.periodKey);
                                const currentMonth = periodToMonth(currentPeriodKey);
                                const isCrossPeriodMatch = (freq === 'MENSUAL' || freq === 'BIMESTRAL' || freq === 'SEMESTRAL') && 
                                                           recordMonth && recordMonth === currentMonth;

                                const granular = isGranularFrequency(freq);
                                const isFromCurrentPeriod = granular
                                    ? (group.periodKey === currentPeriodKey || group.periodKey === strictCurrentPeriod)
                                    : (
                                        group.periodKey === currentPeriodKey ||
                                        group.periodKey === strictCurrentPeriod ||
                                        groupMonthKey === currentMonthKey ||
                                        isCrossPeriodMatch ||
                                        (freq === 'BIMESTRAL' && isSameBimonthlyPeriod(group.periodKey, currentPeriodKey))
                                    );

                                const currentCompany = group.company_id || group.latestUpdate?.additional_data?.company || 'TYM';
                                const currentBrand = group.brand || 'Global';
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
                                let targetMeta = 0;
                                if (kpi.meta && typeof kpi.meta === 'object') {
                                    targetMeta = kpi.meta[currentBrand] || kpi.meta[currentCompany] || kpi.meta.global ||
                                        kpi.meta[Object.keys(kpi.meta).find(b => BRAND_TO_ENTITY[b] === currentCompany)] || 0;
                                } else {
                                    targetMeta = kpi.meta ?? kpiDef?.meta ?? 0;
                                }

                                if (typeof targetMeta === 'number') {
                                    const isInverse = isInverseKPI(kpi.id);

                                    if (targetMeta === 0 && upd.value === 0) {
                                        compliance = isInverse ? 100 : 0;
                                    } else if (targetMeta === 0 && upd.value > 0) {
                                        compliance = isInverse ? 0 : 100;
                                    } else {
                                        compliance = isInverse ? (targetMeta / upd.value) * 100 : (upd.value / targetMeta) * 100;
                                        if (isInverse && upd.value === 0) compliance = 100;
                                    }
                                    
                                    // Clamp compliance between 0 and 100
                                    compliance = Math.min(Math.max(Math.round(compliance || 0), 0), 100);

                                    const isStrict = ['revision-margenes', 'revision-precios', 'pedidos-facturados', 'impresion-facturas', 'fiabilidad-inventarios', 'planillas-separadas', 'pedidos-separar-total'].includes(kpi.id);
                                    const greenThreshold = isStrict ? 100 : 95;
                                    const yellowThreshold = isStrict ? 100 : 85;

                                    if (compliance >= greenThreshold) semaphore = 'green';
                                    else if (compliance >= yellowThreshold) semaphore = 'yellow';
                                    else semaphore = 'red';
                                }

                                // BUG FIX #5 (batch): Para granulares usar el periodo exacto como key del historial
                                const batchGranular = isGranularFrequency(freq);
                                const normalizedMK = batchGranular ? group.periodKey : (toMonthKey(group.periodKey) || group.periodKey);
                                const existingEntry = (kpi.history || []).find(h =>
                                    batchGranular ? h.monthKey === normalizedMK : toMonthKey(h.monthKey) === normalizedMK
                                );

                                // Calcular promedio consolidado de marcas para el historial si tiene marcas
                                const brandsOfEntity = kpiDef.meta && typeof kpiDef.meta === 'object'
                                    ? Object.keys(kpiDef.meta).filter(b => (BRAND_TO_ENTITY[b] === currentCompany || b === currentCompany) && b !== currentCompany)
                                    : [];

                                let histValue = upd.value;
                                let histComp = compliance;

                                if (brandsOfEntity.length > 0) {
                                    let sumVal = 0, sumComp = 0, count = 0;
                                    brandsOfEntity.forEach(brand => {
                                        const brandKey = `${currentCompany}-${brand.toUpperCase()}`;
                                        let brandVal = null, brandComp = null;
                                        if (brand.toUpperCase() === currentBrand.toUpperCase()) {
                                            brandVal = upd.value;
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
                                        histValue = sumVal / count;
                                        histComp = Math.round(sumComp / count);
                                    }
                                }

                                const historyPoint = {
                                    month: monthName, year: parseInt(year), monthKey: normalizedMK,
                                    [currentCompany]: histValue,
                                    [`${currentCompany}-${currentBrand.toUpperCase()}`]: upd.value,
                                    [`${currentCompany}-${currentBrand.toUpperCase()}-COMP`]: compliance,
                                    [`${currentCompany}-${currentBrand.toUpperCase()}-SEM`]: semaphore,
                                    brand: currentBrand,
                                    compliance: histComp,
                                    updatedAt: upd.updated_at || upd.created_at
                                };

                                const history = [...(kpi.history || [])];
                                // BUG FIX #5 (batch): comparación exacta para granulares
                                const hIdx = history.findIndex(h =>
                                    batchGranular ? h.monthKey === normalizedMK : toMonthKey(h.monthKey) === normalizedMK
                                );
                                if (hIdx >= 0) history[hIdx] = { ...history[hIdx], ...historyPoint };
                                else history.push(historyPoint);

                                // Para dashboard: mostramos valor si es del mismo mes (shouldShowInDashboard)
                                // Para hasData: solo true si es del periodo actual exacto
                                const shouldShowInDashboard = isFromCurrentPeriod || groupMonthKey === currentMonthKey;
                                const brandValues = { ...(kpi.brandValues || {}) };
                                const oldBrandEntry = brandValues[dataKey] || {};
                                // BUG FIX #4 (batch): solo sobreescribir si el nuevo dato es más reciente
                                const batchOldUpdatedAt = oldBrandEntry.additionalData?.updatedAt || 0;
                                const batchNewUpdatedAt = upd.updated_at || upd.created_at || 0;
                                const batchIsNewer = !oldBrandEntry.additionalData?.updatedAt || batchNewUpdatedAt >= batchOldUpdatedAt;
                                brandValues[dataKey] = {
                                    currentValue: shouldShowInDashboard && batchIsNewer ? upd.value : (oldBrandEntry.currentValue ?? upd.value),
                                    compliance: shouldShowInDashboard && batchIsNewer ? compliance : (oldBrandEntry.compliance ?? compliance),
                                    semaphore: shouldShowInDashboard && batchIsNewer ? semaphore : (oldBrandEntry.semaphore ?? semaphore),
                                    // hasData: SOLO true si el dato es del periodo actual exacto.
                                    // Nunca preservar hasData de un dato de otro mes (evita mostrar mayo en julio).
                                    hasData: isFromCurrentPeriod ? true : false,
                                    additionalData: {
                                        ...(upd.additional_data || {}),
                                        period: group.periodKey,
                                        updatedAt: upd.updated_at || upd.created_at
                                    }
                                };

                                 // Determinar el estado del KPI base usando TODOS los brandValues disponibles
                                 const allEntityKeys = Object.keys(brandValues).filter(key => key.startsWith(`${currentCompany}-`));
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

                                // Para KPIs sin marcas (meta es número), usar el valor directo
                                const isNoMarcas = !kpiDef.meta || typeof kpiDef.meta !== 'object';
                                const aggFinalValue = isNoMarcas
                                    ? upd.value
                                    : (fCount > 0 ? fSumVal / fCount : 0);
                                const aggFinalComp = isNoMarcas
                                    ? compliance
                                    : (fCount > 0 ? fSumComp / fCount : 0);
                                
                                // Calcular semáforo para ambos casos (con y sin marcas)
                                let aggFinalSem = 'gray';
                                if (isNoMarcas || fCount > 0) {
                                    const isStrict = ['revision-margenes', 'revision-precios', 'pedidos-facturados', 'impresion-facturas', 'fiabilidad-inventarios', 'planillas-separadas', 'pedidos-separar-total'].includes(kpi.id);
                                    if (aggFinalComp >= (isStrict ? 100 : 95)) aggFinalSem = 'green';
                                    else if (aggFinalComp >= (isStrict ? 100 : 85)) aggFinalSem = 'yellow';
                                    else aggFinalSem = 'red';
                                }

                                // Sincronizar el valor principal del KPI:
                                // - Valores del dashboard: si es del mismo mes (shouldShowInDashboard)
                                // - hasData: SOLO true si es del periodo actual exacto (isFromCurrentPeriod)
                                //   Nunca preservar hasData de meses anteriores → evita mostrar mayo en julio
                                const baseKpiUpdate = shouldShowInDashboard
                                    ? {
                                          currentValue: parseFloat(aggFinalValue.toFixed(2)),
                                          compliance: Math.round(aggFinalComp),
                                          semaphore: aggFinalSem,
                                          hasData: isFromCurrentPeriod,
                                          additionalData: { ...(upd.additional_data || {}), period: group.periodKey, updatedAt: upd.updated_at || upd.created_at }
                                      }
                                    : {
                                          currentValue: kpi.currentValue,
                                          compliance: kpi.compliance,
                                          semaphore: kpi.semaphore,
                                          hasData: false, // dato de otro mes → no tiene datos del periodo actual
                                          additionalData: kpi.additionalData || { ...(upd.additional_data || {}), period: group.periodKey }
                                      };

                                return {
                                    ...kpi,
                                    ...baseKpiUpdate,
                                    // hasData: usar exactamente lo que calculó baseKpiUpdate.
                                    // Para multi-marca: si ya había una marca del mes actual procesada
                                    // antes (kpi.hasData=true) y ahora procesamos otra marca también
                                    // del mes actual, preservar true. Pero si el dato es de otro mes,
                                    // NO heredar el true de una marca anterior.
                                    hasData: baseKpiUpdate.hasData || (isFromCurrentPeriod && kpi.hasData),
                                    brandValues,
                                    lastUpdate: new Date(upd.updated_at || upd.created_at) > new Date(kpi.lastUpdate || 0)
                                        ? (upd.updated_at || upd.created_at)
                                        : kpi.lastUpdate,
                                    history: history
                                        .map(h => toMonthKey(h.monthKey) === normalizedMK
                                            ? { ...h, [currentCompany]: histValue, compliance: histComp }
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

        // Sin filtro por company_id (la columna no existe) — filtramos en el handler
        // BUG FIX #10: Escuchar INSERT y UPDATE para que correcciones de datos lleguen en tiempo real
        const postgresFilter = { event: '*', schema: 'public', table: 'kpi_updates' };

        const channel = supabase.channel(`realtime-kpi-sync-${activeCompany}-${currentPeriod}`)
            .on('postgres_changes', postgresFilter, (p) => {
                if (!p.new?.kpi_id) return;

                setRawUpdates(prev => {
                    const exists = prev.some(r => r.id === p.new.id);
                    return exists ? prev.map(r => r.id === p.new.id ? p.new : r) : [...prev, p.new];
                });

                const realtimePeriod = p.new.additional_data?.period;
                const kpiDef = kpiDefinitions.find(k => k.id === p.new.kpi_id);
                const freq = (kpiDef?.frecuencia || 'MENSUAL').toUpperCase();
                const currentP = getPeriodIndex(new Date(), freq);
                const currentMonthP = toMonthKey(currentP) || currentP;
                const recordMonthP = realtimePeriod ? (toMonthKey(realtimePeriod) || realtimePeriod) : currentMonthP;

                // Solo aplicar al estado en vivo si el dato es del mes actual.
                // Datos de meses anteriores se ignoraran para el dashboard — 
                // ya están en el historial desde la carga inicial.
                if (recordMonthP !== currentMonthP) {
                    console.log(`[realtime] ignorando dato de ${realtimePeriod} para ${p.new.kpi_id} (mes actual: ${currentMonthP})`);
                    return;
                }

                // Skip applying realtime updates that originated from the current user to avoid overwriting optimistic UI state
                // Usamos cargo + company + timestamp cercano para detectar updates propios.
                // NO comparar solo por cargo porque dos usuarios pueden tener el mismo cargo.
                const updatedAtMs = new Date(p.new.updated_at || 0).getTime();
                const nowMs = Date.now();
                const isVeryRecent = (nowMs - updatedAtMs) < 10000; // menos de 10 segundos
                const isSelfUpdate = isVeryRecent &&
                    p.new.cargo && currentUser?.cargo && p.new.cargo === currentUser.cargo &&
                    (p.new.additional_data?.company || 'TYM') === activeCompany;
                if (isSelfUpdate) {
                    // Ignore self update; optimistic UI already reflects the change
                    return;
                }

                // Apply update for other users
                applyKPIUpdate(
                    p.new.kpi_id,
                    { 
                        ...p.new.additional_data,
                        company: p.new.additional_data?.company || p.new.company_id || 'TYM',
                        period: realtimePeriod || currentP,
                        value: p.new.value,
                        updatedAt: p.new.updated_at 
                    },
                    false
                );

                if (onToast) {
                    onToast('info', `📊 KPI actualizado por ${p.new.cargo || 'otro usuario'}`);
                }
            }).subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [applyKPIUpdate, onToast, activeCompany, kpiData.length === 0]);

    return { kpiData, rawUpdates, isLoading, lastSyncTime, applyKPIUpdate };
};
