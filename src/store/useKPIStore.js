import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { mockKPIData, getMonthKey } from '../data/mockData';
import { calculateKPIValue, isInverseKPI } from '../utils/kpiCalculations';
import { BRAND_TO_ENTITY } from '../utils/kpiHelpers';
import { getPeriodKey } from '../utils/dateHelpers';

const useKPIStore = create((set, get) => ({
    kpiData: mockKPIData,
    currentUser: null,
    activeCompany: 'TYM',
    theme: localStorage.getItem('theme') || 'light',
    isSidebarOpen: window.innerWidth > 900,
    showSettings: false,

    // Actions
    setCurrentUser: (user) => {
        set({ currentUser: user });
        if (user?.company) {
            set({ activeCompany: user.company });
        }
    },

    setActiveCompany: (company) => set({ activeCompany: company }),

    setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        set({ theme });
    },

    toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
    },

    setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

    setShowSettings: (show) => set({ showSettings: show }),

    // Helper to remove any fields that should not be sent to the backend
    clearSensitiveData: (data) => {
        const { company, period, ...rest } = data;
        return rest;
    },

    // KPI Actions
    applyKPIUpdate: (kpiId, newData, shouldPersist = true) => {
        // Basic validation of incoming data
        if (!newData || typeof newData !== 'object') {
            console.error('applyKPIUpdate received invalid data');
            return;
        }
        const sanitizedData = get().clearSensitiveData(newData);
        set((state) => ({
            kpiData: state.kpiData.map((oldKpi) => {
                if (oldKpi.id === kpiId) {
                    const kpi = JSON.parse(JSON.stringify(oldKpi));
                    const updatedAdditionalData = {
                        ...kpi.additionalData,
                        ...sanitizedData,
                    };

                    const d = updatedAdditionalData;
                    let newValue = kpi.currentValue;
                    let targetMeta = kpi.targetMeta;

                    const currentBrand = d.brand || 'GLOBAL';
                    const currentCompany = d.company || BRAND_TO_ENTITY[currentBrand] || state.activeCompany || 'TYM';
                    const dataKey = `${currentCompany}-${currentBrand}`;
                    const brandValues = kpi.brandValues || {};

                    try {
                        if (d.type === 'META_UPDATE') {
                            newValue = kpi.currentValue;
                        } else {
                            newValue = calculateKPIValue(kpiId, d);
                        }
                    } catch (e) {
                        console.error('Error calculating KPI:', e);
                    }

                    if (d.type === 'META_UPDATE') {
                        const scope = d.brand;
                        if (!scope || scope === 'Global' || scope === 'global') {
                            kpi.meta = d.newMeta;
                        } else {
                            const currentMeta = kpi.meta && typeof kpi.meta === 'object' ? { ...kpi.meta } : { global: kpi.meta };
                            kpi.meta = { ...currentMeta, [scope]: d.newMeta };
                        }
                    }

                    if (kpi.meta && typeof kpi.meta === 'object') {
                        const entity = d.company || state.activeCompany || 'TYM';
                        const brand = d.brand;

                        if (brand && kpi.meta[brand]) {
                            targetMeta = kpi.meta[brand];
                        } else if (kpi.meta[entity]) {
                            targetMeta = kpi.meta[entity];
                        } else if (kpi.meta.global) {
                            targetMeta = kpi.meta.global;
                        } else {
                            const brandKey = Object.keys(kpi.meta).find((b) => BRAND_TO_ENTITY[b] === entity);
                            targetMeta = brandKey ? kpi.meta[brandKey] : (Object.values(kpi.meta)[0] || 0);
                        }
                    } else {
                        targetMeta = kpi.meta;
                    }

                    newValue = parseFloat((newValue || kpi.currentValue || 0).toFixed(2));

                    let semaphore = kpi.semaphore;
                    let compliance = kpi.compliance;

                    if (typeof targetMeta === 'number') {
                        const isInverse = isInverseKPI(kpiId);

                        if (targetMeta === 0 && newValue === 0) {
                            // Meta 0, resultado 0 → perfecto para inversos (ej. embalajes, quiebres)
                            compliance = isInverse ? 100 : 0;
                        } else if (targetMeta === 0 && newValue > 0) {
                            // Meta 0 pero hay un valor → malo para inversos
                            compliance = isInverse ? 0 : 100;
                        } else {
                            compliance = isInverse
                                ? (targetMeta / newValue) * 100
                                : (newValue / targetMeta) * 100;
                            compliance = Math.min(Math.round(compliance || 0), 100);
                            if (newValue === 0 && isInverse) compliance = 100;
                        }

                        if (compliance >= 95) semaphore = 'green';
                        else if (compliance >= 85) semaphore = 'yellow';
                        else semaphore = 'red';
                    }

                    brandValues[dataKey] = {
                        ...brandValues[dataKey],
                        value: newValue,
                        currentValue: newValue,   // ← clave que lee filterKPIsByEntity
                        meta: targetMeta,
                        compliance,
                        semaphore,
                        additionalData: updatedAdditionalData,
                        company: currentCompany,
                        brand: currentBrand,
                        hasData: d.type === 'META_UPDATE' ? brandValues[dataKey]?.hasData : true,
                    };

                    if (shouldPersist) {
                        get().persistUpdate(kpiId, updatedAdditionalData, newValue);
                    }

                    const targetMonth = getMonthKey(d.updatedAt || null);
                    const targetCompany = d.company || 'TYM';

                    return {
                        ...kpi,
                        currentValue: newValue,
                        targetMeta,
                        compliance,
                        semaphore,
                        hasData: d.type === 'META_UPDATE' ? kpi.hasData : true,
                        additionalData: updatedAdditionalData,
                        brandValues: { ...brandValues },
                        history: kpi.history.map((h) =>
                            h.month === targetMonth ? { ...h, [targetCompany]: newValue } : h
                        ),
                    };
                }
                return oldKpi;
            }),
        }));
    },

    persistUpdate: async (kpiId, additionalData, value) => {
        const { currentUser } = get();
        const payload = {
            kpi_id: kpiId,
            additional_data: {
                ...additionalData,
                company: additionalData?.company || get().activeCompany || 'TYM',
                period: additionalData?.period || getMonthKey(new Date().toISOString()),
            },
            value,
            cargo: currentUser?.cargo || 'Sistema',
            company_id: additionalData?.company || get().activeCompany || 'TYM',
            period: additionalData?.period || getMonthKey(new Date().toISOString()),
        };
        const maxRetries = 3;
        let attempt = 0;
        const delay = (ms) => new Promise((res) => setTimeout(res, ms));
        while (attempt < maxRetries) {
            try {
                await supabase.from('kpi_updates').insert(payload);
                return; // success
            } catch (err) {
                attempt++;
                console.warn(`Persist attempt ${attempt} failed`, err);
                if (attempt >= maxRetries) {
                    // fallback to local storage queue
                    const queue = JSON.parse(localStorage.getItem('kpi_update_queue') || '[]');
                    queue.push({ kpiId, additionalData, value });
                    localStorage.setItem('kpi_update_queue', JSON.stringify(queue));
                    console.error('Persist failed after retries, queued locally');
                    return;
                }
                // exponential backoff
                await delay(500 * Math.pow(2, attempt));
            }
        }
    },

    handleUpdateKPI: (id, data) => {
        const { kpiData, currentUser } = get();
        if (!data || typeof data !== 'object') {
            console.warn('handleUpdateKPI received invalid data:', data);
            return;
        }

        const kpi = kpiData.find((k) => k.id === id);
        if (!kpi) {
            console.error('KPI no encontrado:', id);
            return;
        }

        const isMetaUpdate = data.type === 'META_UPDATE';
        const userRole = (currentUser?.role || '').toLowerCase();
        const isManager = userRole === 'gerente' || userRole === 'sistema';

        if (isMetaUpdate && !isManager) {
            // Show toast instead of alert
            import('../components/Toast').then(({ showToast }) => {
                showToast('Solo gerentes pueden actualizar metas');
            });
            return;
        }

        if (!isMetaUpdate && kpi.responsable?.toLowerCase() !== currentUser?.cargo?.toLowerCase()) {
            import('../components/Toast').then(({ showToast }) => {
                showToast(`No tienes permiso para actualizar este indicador: ${kpi.name}`);
            });
            return;
        }

        // Apply primary update
        get().applyKPIUpdate(id, data, true);
    },

    fetchInitialData: async () => {
        const { data, error } = await supabase
            .from('kpi_updates')
            .select('*')
            .order('updated_at', { ascending: true });

        if (data && !error) {
            data.forEach((update) => {
                get().applyKPIUpdate(
                    update.kpi_id,
                    { ...update.additional_data, updatedAt: update.updated_at },
                    false
                );
            });
        }

        // Subscribe to changes
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'kpi_updates' },
                (payload) => {
                    get().applyKPIUpdate(payload.new.kpi_id, payload.new.additional_data, false);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },
}));

export default useKPIStore;
