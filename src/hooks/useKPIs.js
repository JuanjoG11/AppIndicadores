import { useState, useEffect, useCallback } from 'react';
import { mockKPIData, getMonthKey } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { BRAND_TO_ENTITY } from '../utils/kpiHelpers';
import { calculateKPIValue, isInverseKPI } from '../utils/kpiCalculations';

/**
 * useKPIs - Custom hook para el estado y sincronización de KPIs
 * Centraliza toda la lógica de datos que antes vivía en App.jsx
 */
export const useKPIs = (currentUser, activeCompany, onToast) => {
    const [kpiData, setKpiData] = useState(mockKPIData);
    const [isLoading, setIsLoading] = useState(true);
    const [lastSyncTime, setLastSyncTime] = useState(null);

    /**
     * Aplica una actualización de KPI al estado local.
     * @param {string} kpiId - El ID del KPI a actualizar
     * @param {object} newData - Los datos nuevos del KPI
     * @param {boolean} shouldPersist - Si debe persistirse en Supabase
     */
    const applyKPIUpdate = useCallback((kpiId, newData, shouldPersist = true) => {
        setKpiData(prevData => prevData.map(oldKpi => {
            if (oldKpi.id !== kpiId) return oldKpi;

            // Uso de structuredClone para mayor rendimiento que JSON.parse/stringify
            const kpi = structuredClone(oldKpi);

            const updatedAdditionalData = {
                ...kpi.additionalData,
                ...newData
            };

            const d = updatedAdditionalData;
            let newValue = kpi.currentValue;
            let targetMeta = kpi.targetMeta;

            const currentBrand = d.brand || 'GLOBAL';
            const currentCompany = d.company || BRAND_TO_ENTITY[currentBrand] || activeCompany || 'TYM';
            const dataKey = `${currentCompany}-${currentBrand}`;
            const brandValues = kpi.brandValues || {};

            try {
                if (d.type === 'META_UPDATE') {
                    newValue = kpi.currentValue;
                } else {
                    newValue = calculateKPIValue(kpiId, d);
                }
            } catch (e) {
                console.error("Error calculating KPI:", e);
            }

            if (d.type === 'META_UPDATE') {
                const scope = d.brand;
                if (!scope || scope === 'Global' || scope === 'global') {
                    kpi.meta = d.newMeta;
                } else {
                    const currentMeta = (kpi.meta && typeof kpi.meta === 'object') ? { ...kpi.meta } : { global: kpi.meta };
                    kpi.meta = { ...currentMeta, [scope]: d.newMeta };
                }
            }

            if (kpi.meta && typeof kpi.meta === 'object') {
                const entity = d.company || activeCompany || 'TYM';
                const brand = d.brand;
                if (brand && kpi.meta[brand]) {
                    targetMeta = kpi.meta[brand];
                } else if (kpi.meta[entity]) {
                    targetMeta = kpi.meta[entity];
                } else if (kpi.meta.global) {
                    targetMeta = kpi.meta.global;
                } else {
                    const brandKey = Object.keys(kpi.meta).find(b => BRAND_TO_ENTITY[b] === entity);
                    targetMeta = brandKey ? kpi.meta[brandKey] : (Object.values(kpi.meta)[0] || 0);
                }
            } else {
                targetMeta = kpi.meta;
            }

            newValue = parseFloat((newValue || kpi.currentValue || 0).toFixed(2));

            let semaphore = kpi.semaphore;
            let compliance = kpi.compliance;

            if (typeof targetMeta === 'number' && targetMeta !== 0) {
                const isInverse = isInverseKPI(kpiId);
                compliance = isInverse ? (targetMeta / newValue) * 100 : (newValue / targetMeta) * 100;
                compliance = Math.min(Math.round(compliance), 100);
                if (newValue === 0 && isInverse) compliance = 100;

                if (compliance >= 95) semaphore = 'green';
                else if (compliance >= 85) semaphore = 'yellow';
                else semaphore = 'red';
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

            // ── Lógica de hasData mejorada (basada en marcas de la entidad) ──
            const checkAllBrandsFilled = () => {
                if (!kpi.meta || typeof kpi.meta !== 'object') {
                    return d.type === 'META_UPDATE' ? kpi.hasData : true;
                }

                const entityBrands = Object.keys(kpi.meta).filter(b =>
                    BRAND_TO_ENTITY[b] === currentCompany && b !== 'POLAR'
                );

                if (entityBrands.length === 0) return d.type === 'META_UPDATE' ? kpi.hasData : true;

                // Verificamos si todas las marcas necesarias de ESTA empresa están en brandValues y tienen hasData true
                return entityBrands.every(brand => {
                    const key = `${currentCompany}-${brand}`;
                    // Si el update actual es para esta marca, consideramos este dato como nuevo.
                    if (brand === currentBrand && currentCompany === d.company) return d.type !== 'META_UPDATE';
                    return kpi.brandValues?.[key]?.hasData === true;
                });
            };

            const kpiHasData = checkAllBrandsFilled();

            if (shouldPersist) {
                persistUpdate(kpiId, updatedAdditionalData, newValue, currentUser);
            }

            const targetMonth = getMonthKey(d.updatedAt || null);
            const targetCompany = d.company || 'TYM';

            return {
                ...kpi,
                currentValue: newValue,
                targetMeta,
                compliance,
                semaphore,
                hasData: kpiHasData,
                additionalData: updatedAdditionalData,
                brandValues: { ...brandValues },
                history: kpi.history.map(h =>
                    h.month === targetMonth
                        ? { ...h, [targetCompany]: newValue }
                        : h
                )
            };
        }));
    }, [activeCompany, currentUser]);

    /**
     * Persiste una actualización en Supabase
     */
    const persistUpdate = async (kpiId, additionalData, value, user) => {
        try {
            const { error } = await supabase.from('kpi_updates').insert({
                kpi_id: kpiId,
                additional_data: additionalData,
                value: value,
                cargo: user?.cargo || 'Sistema'
            });
            if (error) throw error;
            setLastSyncTime(new Date());
        } catch (err) {
            console.error("Error persistiendo en Supabase:", err);
            if (onToast) onToast('error', '⚠️ Error al sincronizar con el servidor');
        }
    };

    /**
     * Carga inicial de datos desde Supabase y suscripción en tiempo real
     */
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('kpi_updates')
                    .select('*')
                    .order('updated_at', { ascending: true });

                if (data && !error) {
                    data.forEach(update => {
                        applyKPIUpdate(update.kpi_id, { ...update.additional_data, updatedAt: update.updated_at }, false);
                    });
                    setLastSyncTime(new Date());
                }
            } catch (err) {
                console.error("Error cargando datos iniciales:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();

        // Suscripción en tiempo real
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'kpi_updates' },
                (payload) => {
                    applyKPIUpdate(payload.new.kpi_id, payload.new.additional_data, false);
                    if (onToast) {
                        onToast('info', `📊 KPI actualizado en tiempo real`);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return {
        kpiData,
        isLoading,
        lastSyncTime,
        applyKPIUpdate,
    };
};
