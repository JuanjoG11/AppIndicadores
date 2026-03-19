import { useState, useEffect, useCallback, useRef } from 'react';
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
    const [lastSyncTime, setLastSyncTime] = useState(null);

    // Ref para ignorar persistencia automática en procesos internos
    const suppressPersist = useRef(false);

    const MONTH_NAMES = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

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

            const updatedAdditionalData = {
                ...existingBrandData,
                ...newData,
                updatedAt: newData.updatedAt || new Date().toISOString()
            };

            const d = updatedAdditionalData;
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
                    // Solo permitimos actualizar metas de marcas que existen en la definición original del código
                    const staticDef = kpiDefinitions.find(s => s.id === kpiId);
                    const originalHasBrand = staticDef && staticDef.meta && typeof staticDef.meta === 'object' && staticDef.meta.hasOwnProperty(scope);

                    if (originalHasBrand) {
                        const currentMeta = (kpi.meta && typeof kpi.meta === 'object') ? { ...kpi.meta } : { global: kpi.meta };
                        kpi.meta = { ...currentMeta, [scope]: d.newMeta };
                    }
                }
            }

            // Resolver targetMeta basándose en la meta actual (priorizando la marca específica)
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
                
                // Si es inverso y el resultado es 0, el cumplimiento es 100% (o más según lógica, pero 100% es seguro)
                if (isInverse && newValue === 0) compliance = 100;

                compliance = Math.min(Math.max(Math.round(compliance || 0), 0), 100);
                
                if (compliance >= 95) semaphore = 'green';
                else if (compliance >= 85) semaphore = 'yellow';
                else semaphore = 'red';
            } else if (targetMeta === 0 && newValue === 0) {
                compliance = isInverseKPI(kpiId) ? 100 : 0;
                semaphore = compliance >= 95 ? 'green' : 'red';
            } else if (targetMeta === 0 && newValue > 0) {
                compliance = isInverseKPI(kpiId) ? 0 : 100;
                semaphore = compliance >= 95 ? 'green' : 'red';
            }

            brandValues[dataKey] = {
                ...brandValues[dataKey],
                currentValue: newValue,
                meta: targetMeta,
                compliance,
                semaphore,
                additionalData: updatedAdditionalData,
                company: currentCompany,
                brand: currentBrand,
                hasData: d.type === 'META_UPDATE' ? (brandValues[dataKey]?.hasData) : true
            };

            const hasAnyData = !kpi.meta || typeof kpi.meta !== 'object'
                ? (d.type === 'META_UPDATE' ? kpi.hasData : true)
                : Object.keys(brandValues).filter(k => k.startsWith(`${currentCompany}-`)).some(k => brandValues[k].hasData);

            if (shouldPersist && !suppressPersist.current) {
                persistUpdate(kpiId, updatedAdditionalData, newValue, currentUser);
            }

            const targetMonth = MONTH_NAMES[new Date(d.updatedAt || new Date()).getMonth()];
            const targetCompany = d.company || 'TYM';

            const newKpi = {
                ...kpi,
                currentValue: newValue,
                targetMeta,
                compliance,
                semaphore,
                hasData: hasAnyData,
                additionalData: updatedAdditionalData,
                brandValues: { ...brandValues },
                history: kpi.history.map(h => h.month === targetMonth ? { ...h, [targetCompany]: newValue } : h)
            };

            const newDataList = [...prevData];
            newDataList[index] = newKpi;
            return newDataList;
        });
    }, [activeCompany, currentUser, isInverseKPI, calculateKPIValue]);

    const persistUpdate = async (kpiId, additionalData, value, user) => {
        try {
            console.log("💾 Persistiendo en Supabase:", kpiId, additionalData);
            const { error } = await supabase.from('kpi_updates').insert({
                kpi_id: kpiId,
                additional_data: additionalData,
                value: value,
                cargo: user?.cargo || 'Sistema'
            });
            if (error) throw error;
            setLastSyncTime(new Date());
        } catch (err) {
            console.error("❌ Error persistiendo en Supabase:", err);
            if (onToast) onToast('error', 'Error al guardar en la nube');
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
                        filteredMeta[brandKey] = live.meta.hasOwnProperty(brandKey) ? live.meta[brandKey] : def.meta[brandKey];
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

    // ── 2. CARGA DE DATOS DE SUPABASE ──
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const { data } = await supabase.from('kpi_updates').select('*').order('updated_at', { ascending: true });
                if (data) {
                    suppressPersist.current = true;
                    data.forEach(upd => {
                        applyKPIUpdate(upd.kpi_id, { ...upd.additional_data, updatedAt: upd.updated_at }, false);
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

        const channel = supabase.channel('realtime-kpi-sync')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'kpi_updates' }, (p) => {
                applyKPIUpdate(p.new.kpi_id, p.new.additional_data, false);
                if (onToast) onToast('info', `📊 KPI actualizado`);
            }).subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [applyKPIUpdate, onToast, kpiData.length === 0]);

    return { kpiData, isLoading, lastSyncTime, applyKPIUpdate };
};
