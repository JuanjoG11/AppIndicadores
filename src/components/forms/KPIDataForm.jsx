import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
    Calculator,
    X,
    Save,
    Info,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    Box,
    Truck,
    DollarSign,
    Users,
    Activity,
    Shield as ShieldIcon,
    FileText,
    Cpu,
    Calendar
} from 'lucide-react';
import { calculateKPIValue, isInverseKPI } from '../../utils/kpiCalculations';
import { BRAND_TO_ENTITY, getKPIFormulaFields, resolveSharedFieldValue, ALL_SHARED_FIELDS } from '../../utils/kpiHelpers';
import { formatNumber } from '../../utils/formatters';

const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Helper: compute the expected period prefix for the current KPI frequency
const getPeriodPrefix = (freq) => {
    const d = new Date();
    if (freq === 'SEMANAL' || freq === 'semanal') return `${d.getFullYear()}-W`;
    if (freq === 'QUINCENAL' || freq === 'quincenal') return d.toISOString().substring(0, 7);
    if (freq === 'DIARIO' || freq === 'diaria' || freq === 'DIARIA') return d.toISOString().substring(0, 7);
    return d.toISOString().substring(0, 7); // MENSUAL default
};

const KPIDataForm = ({ kpi, currentUser, onSave, onCancel, mode = 'data', initialBrand, defaultPeriod, rawUpdates = [] }) => {
    const isMetaMode = mode === 'meta';
    const hasMultipleMetas = kpi.meta && typeof kpi.meta === 'object';
    const userEntity = currentUser?.company || 'TYM';

    // 1. Filtrar marcas comerciales
    // Si el usuario tiene marca bloqueada (ej: fact_alpina), solo mostrar ESA marca
    const lockedBrand = !isMetaMode ? (currentUser?.activeBrand || null) : null;
    let commercialBrands = [];
    if (hasMultipleMetas) {
        const allBrands = Object.keys(kpi.meta).filter(b => b !== 'Global' && b !== 'TYM' && b !== 'TAT');

        if (isMetaMode) {
            commercialBrands = allBrands;
        } else if (lockedBrand) {
            // Usuario con proveedor fijo: solo ve SU marca si existe en este KPI
            if (Array.isArray(lockedBrand)) {
                const normLocks = lockedBrand.map(l => l?.trim().toUpperCase());
                commercialBrands = allBrands.filter(b => normLocks.includes(b?.trim().toUpperCase()));
            } else {
                commercialBrands = allBrands.filter(b => b?.trim().toUpperCase() === lockedBrand?.trim().toUpperCase());
            }
        } else {
            // Analistas sin restricción: ven marcas comerciales de su entidad
            commercialBrands = allBrands.filter(b => BRAND_TO_ENTITY[b] === userEntity);
        }
    }
    const hasCommercialBrands = commercialBrands.length > 0;

    // 2. Determinar cuáles faltan por cargar
    const isBrandPending = (brandName) => {
        const dataKey = `${userEntity}-${brandName.toUpperCase()}`;
        const brandData = kpi.brandValues?.[dataKey];
        return !brandData || brandData.hasData === false;
    };

    // 3. Seleccionar por defecto
    // Si el usuario tiene marca bloqueada, esa es siempre la marca seleccionada
    // Usamos initialBrand si viene de props y es válido para la vista actual
    const validatedInitialBrand = lockedBrand ||
        ((initialBrand && initialBrand !== 'all' && (isMetaMode || (hasMultipleMetas ? commercialBrands.includes(initialBrand) : true)))
        ? initialBrand
        : null);

    // Si no hay marcas comerciales y no es gerente, la marca asignada automáticamente es la propia entidad.
    const defaultBrand = 
        (Array.isArray(validatedInitialBrand) 
            ? (validatedInitialBrand.find(isBrandPending) || validatedInitialBrand[0]) 
            : validatedInitialBrand) || 
        ((!isMetaMode && !hasCommercialBrands)
            ? userEntity
            : (commercialBrands.find(isBrandPending) || commercialBrands[0] || userEntity));

    // Obtener datos iniciales específicos de la marca si existen y son del periodo actual
    // Campos que se comparten entre múltiples KPIs de la misma marca/periodo.
    // Si el usuario ya llenó "ventaTotal" en otro KPI, aparece prellenado aquí.
    const SHARED_FIELDS = ALL_SHARED_FIELDS;

    const getSharedFieldValues = (brandName, targetPeriod) => {
        if (!rawUpdates || !Array.isArray(rawUpdates)) return {};
        const period = targetPeriod || new Date().toISOString().substring(0, 7);
        const shared = {};

        // Buscar en todos los KPIs del mismo periodo/empresa — independientemente del área/cargo que lo guardó.
        // Esto permite propagación cruzada entre departamentos: si Comercial guardó ventaTotal,
        // Gestión Humana lo verá pre-llenado en su KPI si también usa ese campo.
        rawUpdates.forEach(upd => {
            if (upd.kpi_id === kpi.id) return; // skip el propio KPI
            if (upd.additional_data?.type === 'META_UPDATE') return;
            const updPeriod = upd.additional_data?.period || '';
            const updBrand = (upd.additional_data?.brand || '').toUpperCase();
            const updCompany = upd.additional_data?.company || upd.company_id || '';
            // Mismo mes, misma empresa
            if (updPeriod.substring(0, 7) !== period.substring(0, 7)) return;
            if (updCompany !== userEntity) return;
            // Brand: exact match OR the saved record has no brand (company-level KPI)
            const brandMatches = updBrand === brandName.toUpperCase() || updBrand === '' || updBrand === userEntity.toUpperCase();
            if (!brandMatches) return;
            // Extraer campos compartidos usando resolución de alias
            SHARED_FIELDS.forEach(field => {
                const val = resolveSharedFieldValue(upd.additional_data, field);
                if (val !== undefined && val !== null && val !== '' && shared[field] === undefined) {
                    shared[field] = val;
                }
            });
        });
        return shared;
    };

    const getInitialBrandData = (brandName, targetPeriod = null) => {
        if (!brandName) return {};
        const dataKey = `${userEntity}-${brandName.toUpperCase()}`;
        const period = targetPeriod || new Date().toISOString().substring(0, 7); // YYYY-MM
        
        // 1. Buscar en rawUpdates por periodo EXACTO (Bug Fix #6: evitar startsWith que matchea otros periodos)
        if (rawUpdates && Array.isArray(rawUpdates)) {
            const match = rawUpdates.find(upd => 
                upd.kpi_id === kpi.id &&
                (upd.company_id === userEntity || upd.additional_data?.company === userEntity) &&
                (upd.additional_data?.brand?.toUpperCase() === brandName.toUpperCase()) &&
                upd.additional_data?.period === period &&
                upd.additional_data?.type !== 'META_UPDATE'
            );
            if (match && match.additional_data) {
                const cleaned = { ...match.additional_data };
                delete cleaned.updatedAt;
                delete cleaned.period;
                delete cleaned.timestamp;
                return cleaned;
            }
        }

        // 2. Fallback a los brandValues actuales
        const data = kpi.brandValues?.[dataKey]?.additionalData ||
                    (kpi.additionalData?.brand === brandName ? kpi.additionalData : null);

        if (data) {
            const storedPeriod = data.period || '';
            if (!storedPeriod) return {};
            const periodMatch = storedPeriod && (storedPeriod === period || storedPeriod.startsWith(period));
            if (periodMatch) {
                const cleaned = { ...data };
                delete cleaned.updatedAt;
                delete cleaned.period;
                delete cleaned.timestamp;
                return cleaned;
            }
        }

        // 3. Sin datos propios — intentar precargar campos compartidos de otros KPIs
        return getSharedFieldValues(brandName, period);
    };

    // ── Multi-marca: modo columnas (solo data, no meta) ──────────────────────
    // Cuando el usuario tiene 2+ marcas, se muestra una columna por marca.
    const isMultiBrand = !isMetaMode && commercialBrands.length > 1;

    // Estado por marca: { FLEISCHMANN: { campo1: '', ... }, ZENU: { ... } }
    const [multiFormData, setMultiFormData] = useState(() => {
        if (!isMultiBrand) return {};
        const d = new Date();
        let initialPeriod = defaultPeriod;
        if (!initialPeriod) {
            if (kpi.frecuencia === 'SEMANAL') {
                const dd = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
                const day = dd.getUTCDay() || 7;
                dd.setUTCDate(dd.getUTCDate() + 4 - day);
                const yearStart = new Date(Date.UTC(dd.getUTCFullYear(), 0, 1));
                const week = Math.ceil((((dd - yearStart) / 86400000) + 1) / 7);
                initialPeriod = `${dd.getUTCFullYear()}-W${week.toString().padStart(2, '0')}`;
            } else if (kpi.frecuencia === 'QUINCENAL') {
                const q = d.getDate() <= 15 ? 'Q1' : 'Q2';
                initialPeriod = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${q}`;
            } else {
                // MENSUAL, BIMESTRAL → mes anterior
                const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1);
                initialPeriod = `${prev.getFullYear()}-${String(prev.getMonth()+1).padStart(2,'0')}`;
            }
        }
        const map = {};
        commercialBrands.forEach(brand => {
            map[brand] = {
                brand,
                company: userEntity,
                period: initialPeriod,
                ...getInitialBrandData(brand, initialPeriod)
            };
        });
        return map;
    });

    const handleMultiChange = (brand, fieldName, value) => {
        setMultiFormData(prev => {
            const updated = {
                ...prev,
                [brand]: {
                    ...prev[brand],
                    [fieldName]: value,
                    ...(fieldName === 'period' ? { periodSelectedByUser: true } : {})
                }
            };
            // Sync shared fields across all brands of same entity
            if (ALL_SHARED_FIELDS.includes(fieldName)) {
                commercialBrands.forEach(b => {
                    if (b !== brand && BRAND_TO_ENTITY[b] === userEntity) {
                        updated[b] = { ...updated[b], [fieldName]: value };
                    }
                });
            }
            return updated;
        });
    };

    // Inicializar con datos previos si existen
    const drafts = useRef({});
    const lastInput = useRef(null);
    const lastSelectionStart = useRef(null);
    const lastValueLength = useRef(0);
    
    const [formData, setFormData] = useState(() => {
        let initialPeriod = defaultPeriod;
        
        if (!initialPeriod) {
            const d = new Date();
            initialPeriod = d.toISOString().split('T')[0]; // Default Day
            
            if (kpi.frecuencia === 'SEMANAL') {
                // ISO week: mismo algoritmo que date-fns format(d, "yyyy-'W'II")
                const isoWeek = (dt) => {
                    const d = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()));
                    const day = d.getUTCDay() || 7;
                    d.setUTCDate(d.getUTCDate() + 4 - day);
                    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
                    const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
                    return `${d.getUTCFullYear()}-W${week.toString().padStart(2, '0')}`;
                };
                initialPeriod = isoWeek(d);
            } else if (kpi.frecuencia === 'QUINCENAL') {
                const quincena = d.getDate() <= 15 ? 'Q1' : 'Q2';
                initialPeriod = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${quincena}`;
            } else if (kpi.frecuencia === 'MENSUAL') {
                // El periodo vigente para mensuales es el mes anterior (carga de mes vencido)
                const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1);
                initialPeriod = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
            } else if (kpi.frecuencia === 'BIMESTRAL') {
                const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1);
                initialPeriod = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
            }
        }
        const savedDraft = drafts.current[`${defaultBrand}-${initialPeriod}`];
        if (savedDraft) {
            // Siempre forzar el period correcto aunque el draft guardado tenga uno viejo
            return { ...savedDraft, period: initialPeriod };
        }
        return {
            brand: (defaultBrand || userEntity),
            company: userEntity,
            period: initialPeriod,
            newFrecuencia: kpi.frecuencia,
            ...getInitialBrandData(defaultBrand || userEntity, initialPeriod)
        };
    });




    // Load persisted drafts from localStorage on mount, filtering stale period formats
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = window.localStorage.getItem(`kpi_drafts_${kpi.id}`);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    const currentPrefix = getPeriodPrefix(kpi.frecuencia);
                    // Calcular el periodo actual exacto para filtrar drafts de quincenas/semanas pasadas
                    const now = new Date();
                    const exactCurrentPeriod = (() => {
                        if (kpi.frecuencia === 'QUINCENAL') {
                            const m = String(now.getMonth() + 1).padStart(2, '0');
                            const q = now.getDate() <= 15 ? 'Q1' : 'Q2';
                            return `${now.getFullYear()}-${m}-${q}`;
                        }
                        if (kpi.frecuencia === 'SEMANAL') {
                            const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
                            const day = d.getUTCDay() || 7;
                            d.setUTCDate(d.getUTCDate() + 4 - day);
                            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
                            const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
                            return `${d.getUTCFullYear()}-W${week.toString().padStart(2, '0')}`;
                        }
                        return currentPrefix; // MENSUAL/BIMESTRAL: el prefijo ya es exacto
                    })();

                    const valid = {};
                    Object.entries(parsed).forEach(([key, draft]) => {
                        const draftPeriod = draft?.period || '';
                        // Para granulares (QUINCENAL, SEMANAL): exigir periodo exacto
                        // Para mensuales/bimestrales: basta con el prefijo del mes
                        const isValid = kpi.frecuencia === 'QUINCENAL' || kpi.frecuencia === 'SEMANAL'
                            ? draftPeriod === exactCurrentPeriod
                            : draftPeriod.startsWith(currentPrefix);
                        if (isValid) valid[key] = draft;
                    });
                    drafts.current = valid;
                } else {
                    drafts.current = {};
                }
            } catch (e) {
                console.error('Failed to load KPI drafts from localStorage', e);
                drafts.current = {};
            }
        }
    }, [kpi.id, kpi.frecuencia]);

    // Ref para detectar cambio de marca y evitar guardar datos de una marca en el borrador de otra
    // Se inicializa con defaultBrand para que el primer draft se guarde correctamente
    const prevBrandPeriodRef = useRef(`${defaultBrand}-${formData.period}`);
    // BUG FIX #7: Distinguir la carga inicial del formulario de un cambio intencional del usuario.
    // En la carga inicial NO se deben limpiar campos (el useState ya los inicializó correctamente).
    const isInitialLoadRef = useRef(true);

    // Guardar borrador SOLO cuando la marca O el periodo NO cambiaron
    // Guardar borrador SOLO cuando el actual se guarde en borradores
    useEffect(() => {
        const currentKey = `${formData.brand}-${formData.period}`;
        if (currentKey === prevBrandPeriodRef.current) {
            drafts.current[currentKey] = formData;
            // Sync drafts to localStorage
            if (typeof window !== 'undefined') {
                try {
                    window.localStorage.setItem(`kpi_drafts_${kpi.id}`, JSON.stringify(drafts.current));
                } catch (e) {
                    console.error('Failed to save KPI drafts to localStorage', e);
                }
            }
        }
        prevBrandPeriodRef.current = currentKey;
    }, [formData, kpi.id]);

    // EFECTO: Pre-cargar datos cuando cambia la marca o el periodo
    useEffect(() => {
        // BUG FIX #7: Saltar la primera ejecución (carga inicial).
        // El useState ya inicializó formData correctamente; ejecutar aquí limpia los campos.
        if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
            return;
        }

        const draftKey = `${formData.brand}-${formData.period}`;
        const rawDraft = drafts.current[draftKey];
        // Al restaurar un draft, siempre forzar el period actual para evitar que un borrador
        // corrupto con period del mes pasado sobreescriba el periodo correcto del form.
        const safeDraft = rawDraft ? { ...rawDraft, period: formData.period } : null;
        const brandData = safeDraft || getInitialBrandData(formData.brand, formData.period);
        if (brandData && Object.keys(brandData).length > 1) {
            setFormData(prev => ({
                ...prev,
                ...brandData,
                period: prev.period  // Siempre preservar el period del estado actual
            }));
        } else {
            // No hay datos previos para esta marca/periodo: limpiar solo los campos de fórmula
            // para no heredar valores de la marca/periodo anterior.
            const emptyFields = {};
            getFormulaFields().forEach(f => {
                emptyFields[f.name] = '';
            });
            setFormData(prev => ({
                ...prev,
                ...emptyFields,
            }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.brand, formData.period]);

    useLayoutEffect(() => {
        if (lastInput.current && lastSelectionStart.current !== null) {
            const input = lastInput.current;
            const newLength = input.value.length;
            const diff = newLength - lastValueLength.current;
            const newPos = Math.max(0, lastSelectionStart.current + diff);
            input.setSelectionRange(newPos, newPos);
        }
    }, [formData]);

    const [saveSuccess, setSaveSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [formError, setFormError] = useState('');


    // Mapeo de iconos por área para el diseño
    const areaIcons = {
        'logistica-entrega': <Truck size={18} />,
        'logistica-picking': <Box size={18} />,
        'comercial': <TrendingUp size={18} />,
        'cartera': <DollarSign size={18} />,
        'administrativo': <Activity size={18} />,
        'talento-humano': <Users size={18} />,
        'sst-cultura': <ShieldIcon size={18} />,
        'facturacion': <FileText size={18} />,
        'software': <Cpu size={18} />
    };

    // Determinar qué campos necesita el formulario basado en la fórmula
    const getFormulaFields = () => {
        return getKPIFormulaFields(kpi.id);
    };

    const calculateLiveResult = () => {
        return calculateKPIValue(kpi.id, formData);
    };

    const fields = getFormulaFields();
    const liveResult = calculateLiveResult();
    let currentMeta = hasMultipleMetas
        ? (kpi.meta[formData.brand] || kpi.meta[formData.brand?.toLowerCase()] || Object.values(kpi.meta)[0])
        : kpi.meta;
        
    const isInverse = isInverseKPI(kpi.id);
    const isStrict = ['revision-margenes', 'revision-precios', 'pedidos-facturados', 'impresion-facturas', 'fiabilidad-inventarios', 'planillas-separadas', 'pedidos-separar-total'].includes(kpi.id);
    
    // Forzar meta de 100 para indicadores de cumplimiento estricto (100% o nada)
    if (isStrict) currentMeta = 100;
    
    let isMeetingMeta = false;
    let compliance = 0;

    if (currentMeta === 0 && liveResult === 0) {
        compliance = isInverse ? 100 : 0;
    } else if (currentMeta === 0 && liveResult > 0) {
        compliance = isInverse ? 0 : 100;
    } else if (typeof currentMeta === 'number') {
        compliance = isInverse ? (liveResult !== 0 ? (currentMeta / liveResult) * 100 : 0) : (currentMeta !== 0 ? (liveResult / currentMeta) * 100 : 0);
        compliance = Math.min(Math.max(Math.round(compliance || 0), 0), 100);
    }

    const greenThreshold = isStrict ? 100 : 95;
    isMeetingMeta = liveResult !== null && compliance >= greenThreshold;

    const handleMultiSubmit = (e) => {
        e.preventDefault();
        const cleanNumeric = (data) => {
            const cleaned = { ...data };
            const skipKeys = ['brand', 'period', 'company', 'newFrecuencia', 'detalleFaltante', 'type', 'id', 'value', 'periodSelectedByUser'];
            Object.keys(cleaned).forEach(key => {
                if (skipKeys.includes(key)) return;
                if (typeof cleaned[key] === 'string' && cleaned[key].trim() !== '') {
                    let valStr = cleaned[key].trim().replace(/\s/g, '');
                    if (valStr.includes(',') && valStr.includes('.')) valStr = valStr.replace(/\./g, '').replace(',', '.');
                    else if (valStr.includes(',')) valStr = valStr.replace(',', '.');
                    else valStr = valStr.replace(/\./g, '');
                    const parsed = parseFloat(valStr);
                    if (!isNaN(parsed)) cleaned[key] = parsed;
                }
            });
            return cleaned;
        };
        const formulaFields = getFormulaFields().map(f => f.name);
        let savedCount = 0;
        commercialBrands.forEach(brand => {
            const data = cleanNumeric(multiFormData[brand] || {});
            const hasValue = formulaFields.some(fname => {
                const v = data[fname];
                return v !== undefined && v !== null && v !== '' && !isNaN(Number(v));
            });
            if (hasValue) {
                onSave(kpi.id, { ...data, type: 'DATA_UPDATE' });
                savedCount++;
            }
        });
        if (savedCount === 0) {
            setFormError('Ingresa al menos un valor antes de guardar.');
            return;
        }
        setFormError('');
        setSuccessMessage(`¡Datos guardados para ${savedCount} marca${savedCount > 1 ? 's' : ''}!`);
        setSaveSuccess(true);
        setTimeout(() => { setSaveSuccess(false); setSuccessMessage(''); }, 3000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // ── Limpiar número: formato colombiano (punto=miles, coma=decimal) ──
        const cleanNumericFields = (data) => {
            const cleaned = { ...data };
            const skipKeys = ['brand', 'period', 'company', 'newFrecuencia', 'detalleFaltante', 'type', 'id', 'value', 'periodSelectedByUser'];
            Object.keys(cleaned).forEach(key => {
                if (skipKeys.includes(key)) return;
                if (typeof cleaned[key] === 'string' && cleaned[key].trim() !== '') {
                    let valStr = cleaned[key].trim().replace(/\s/g, '');
                    if (valStr.includes(',') && valStr.includes('.')) {
                        valStr = valStr.replace(/\./g, '').replace(',', '.');
                    } else if (valStr.includes(',')) {
                        valStr = valStr.replace(',', '.');
                    } else {
                        valStr = valStr.replace(/\./g, '');
                    }
                    const parsed = parseFloat(valStr);
                    if (!isNaN(parsed)) cleaned[key] = parsed;
                }
            });
            return cleaned;
        };

        // SOLO guardar el formulario actual
        const currentDraftKey = `${formData.brand}-${formData.period}`;
        drafts.current[currentDraftKey] = formData;

        const cleanedData = cleanNumericFields(formData);
        const dataToSave = isMetaMode
            ? { ...cleanedData, type: 'META_UPDATE' }
            : { ...cleanedData, type: 'DATA_UPDATE' };

        // Validar que al menos un campo de fórmula tiene valor (evita guardar registros vacíos)
        if (!isMetaMode) {
            const formulaFields = getFormulaFields().map(f => f.name);
            const hasAtLeastOneField = formulaFields.some(fname => {
                const v = cleanedData[fname];
                return v !== undefined && v !== null && v !== '' && !isNaN(Number(v));
            });
            if (!hasAtLeastOneField) {
                setFormError('Ingresa al menos un valor antes de guardar.');
                return;
            }
        }

        // En modo meta: validar que newMeta sea un número válido antes de guardar
        if (isMetaMode) {
            const rawMeta = cleanedData.newMeta;
            const parsed = typeof rawMeta === 'string' ? parseFloat(rawMeta) : rawMeta;
            if (rawMeta === '' || rawMeta === undefined || rawMeta === null || isNaN(parsed)) {
                setFormError('Ingresa un valor numérico válido para la meta antes de guardar.');
                return;
            }
        }
        setFormError('');

        onSave(kpi.id, dataToSave);

        const msgString = formData.brand;

        // Limpiar SOLO el borrador de la marca/periodo guardado, no los de otras marcas
        const savedKey = `${formData.brand}-${formData.period}`;
        delete drafts.current[savedKey];
        if (typeof window !== 'undefined') {
            try {
                if (Object.keys(drafts.current).length === 0) {
                    window.localStorage.removeItem(`kpi_drafts_${kpi.id}`);
                } else {
                    window.localStorage.setItem(`kpi_drafts_${kpi.id}`, JSON.stringify(drafts.current));
                }
            } catch { /* ignore */ }
        }

        if (isMetaMode) {
            setSuccessMessage(`¡Meta actualizada para ${msgString}! Puedes cerrar esta ventana.`);
            setSaveSuccess(true);
            setFormData(prev => ({ ...prev, newMeta: '' }));
            setTimeout(() => { setSaveSuccess(false); setSuccessMessage(''); }, 3000);
        } else {
            setSuccessMessage(`¡Datos guardados para ${msgString}! Puedes cerrar esta ventana.`);
            setSaveSuccess(true);
            setTimeout(() => { setSaveSuccess(false); setSuccessMessage(''); }, 3000);
        }
    };

    const handleChange = (fieldName, value, e) => {
        if (e && e.target && e.target.selectionStart !== null) {
            lastInput.current = e.target;
            lastSelectionStart.current = e.target.selectionStart;
            lastValueLength.current = e.target.value.length;
        }
        setFormData(prev => {
            let parsedValue = value;

            // Si el usuario cambia el período manualmente, marcar el flag para que
            // applyKPIUpdate no lo sobreescriba con el período actual.
            if (fieldName === 'period') {
                return { ...prev, period: value, periodSelectedByUser: true };
            }
            
            // Si es un string, intentamos limpiar formateo de miles
            if (typeof value === 'string') {
                // Solo si parece un campo numérico (contiene números, puntos o comas)
                const isNumericSource = /^[0-9.,\s]*$/.test(value);
                
                if (isNumericSource && fieldName !== 'brand' && fieldName !== 'newFrecuencia' && fieldName !== 'detalleFaltante') {
                    // Permitimos el string crudo para que el usuario pueda escribir decimales (, o .)
                    // La limpieza final se hace en handleSubmit de forma robusta.
                    parsedValue = value;
                }
            }

            if (fieldName === 'brand') {
                const rawBrandDraft = drafts.current[`${value}-${formData.period}`];
                const safeBrandDraft = rawBrandDraft ? { ...rawBrandDraft, period: formData.period } : null;
                const brandData = safeBrandDraft || getInitialBrandData(value, formData.period);
                const newCompany = (value === 'TYM' || value === 'TAT') ? value : (BRAND_TO_ENTITY[value] || userEntity);
                
                if (isMetaMode) {
                    return {
                        ...brandData,
                        brand: value,
                        company: newCompany,
                        period: prev.period,  // Preservar period actual
                        newMeta: '',
                        newFrecuencia: kpi.frecuencia
                    };
                }

                return {
                    ...brandData,
                    brand: value,
                    company: newCompany,
                    period: prev.period   // Preservar period actual
                };
            }

            if (fieldName === 'newFrecuencia') {
                return { ...prev, [fieldName]: value };
            }

            return { ...prev, [fieldName]: parsedValue };
        });
    };

    return (
        <div
            onClick={e => e.stopPropagation()}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(15, 23, 42, 0.85)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000, padding: '1.5rem', backdropFilter: 'blur(8px)'
            }}>
            <div className="card fade-in" style={{
                maxWidth: '650px', width: '100%', maxHeight: '95vh',
                overflow: 'auto', padding: 0, border: 'none',
                boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5)',
                background: 'white', borderRadius: '28px'
            }}>
                {/* HEADER PREMIUM */}
                <div style={{
                    padding: '2rem 2.5rem',
                    background: 'var(--brand-gradient)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)',
                            borderRadius: '14px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', backdropFilter: 'blur(4px)'
                        }}>
                            {areaIcons[kpi.area] || <Calculator size={24} />}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.2rem' }}>
                                {isMetaMode ? `Ajustar Meta: ${kpi.name}` : kpi.name}
                            </h2>
                            <div style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                {(kpi.subArea || kpi.area).replace(/-/g, ' ')} • {typeof currentMeta === 'number' ? `Actual: ${currentMeta} ${kpi.unit}` : currentMeta}
                            </div>
                        </div>
                    </div>
                    <button onClick={onCancel} style={{
                        background: 'rgba(255,255,255,0.1)', border: 'none',
                        cursor: 'pointer', padding: '0.5rem', borderRadius: '12px',
                        color: 'white', transition: 'all 0.2s'
                    }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '2rem 2.5rem' }}>
                    {saveSuccess && (
                        <div style={{
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            background: '#ecfdf5',
                            borderRadius: '16px',
                            border: '1px solid #10b981',
                            color: '#047857',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            animation: 'bounceIn 0.5s ease-out'
                        }}>
                            <CheckCircle2 size={24} />
                            {successMessage || '¡DATOS GUARDADOS CON ÉXITO!'}
                        </div>
                    )}
                    {formError && (
                        <div style={{
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            background: '#fef2f2',
                            borderRadius: '16px',
                            border: '1px solid #ef4444',
                            color: '#b91c1c',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontSize: '0.9rem',
                            fontWeight: 700
                        }}>
                            <AlertTriangle size={20} />
                            {formError}
                        </div>
                    )}
                    <form onSubmit={isMultiBrand ? handleMultiSubmit : handleSubmit}>
                        {/* ── MULTI-MARCA: layout columnas ───────────────────── */}
                        {isMultiBrand && (
                            <div>
                                {/* Periodo compartido */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 800, marginBottom: '1rem', color: '#1e293b' }}>
                                        <Calendar size={16} color="var(--brand)" />
                                        PERIODO DE CARGA ({kpi.frecuencia})
                                    </label>
                                    {/* Selector de periodo reutilizando el valor de la primera marca */}
                                    {(() => {
                                        const period = multiFormData[commercialBrands[0]]?.period || '';
                                        const setPeriod = (val) => {
                                            setMultiFormData(prev => {
                                                const updated = { ...prev };
                                                commercialBrands.forEach(b => {
                                                    updated[b] = { ...updated[b], period: val, periodSelectedByUser: true };
                                                });
                                                return updated;
                                            });
                                        };
                                        if (kpi.frecuencia === 'DIARIO') return (
                                            <input type="date" value={period} onChange={e => setPeriod(e.target.value)}
                                                style={{ padding: '0.85rem 1.25rem', borderRadius: '14px', border: '2px solid #e2e8f0', fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', background: '#f8fafc' }} />
                                        );
                                        if (kpi.frecuencia === 'SEMANAL') {
                                            const yMatch = period.match(/^\d{4}/);
                                            const currentYear = yMatch ? yMatch[0] : new Date().getFullYear().toString();
                                            const wMatch = period.match(/W(\d{2})/);
                                            const currentWeek = wMatch ? wMatch[1] : '01';
                                            return (
                                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                    <select value={currentYear} onChange={e => setPeriod(`${e.target.value}-W${currentWeek}`)}
                                                        style={{ padding: '0.85rem 1.25rem', borderRadius: '14px', border: '2px solid #e2e8f0', fontSize: '0.95rem', fontWeight: 800, background: '#f8fafc' }}>
                                                        <option value={new Date().getFullYear().toString()}>{new Date().getFullYear()}</option>
                                                        <option value={(new Date().getFullYear()-1).toString()}>{new Date().getFullYear()-1}</option>
                                                    </select>
                                                    <select value={currentWeek} onChange={e => setPeriod(`${currentYear}-W${e.target.value}`)}
                                                        style={{ padding: '0.85rem 1.25rem', borderRadius: '14px', border: '2px solid #e2e8f0', fontSize: '0.95rem', fontWeight: 800, background: '#f8fafc' }}>
                                                        {Array.from({length:53},(_,i)=>String(i+1).padStart(2,'0')).map(w=>(
                                                            <option key={w} value={w}>Semana {w}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            );
                                        }
                                        // MENSUAL / BIMESTRAL / QUINCENAL
                                        const yMatch = period.match(/^\d{4}/);
                                        const currentYear = yMatch ? yMatch[0] : new Date().getFullYear().toString();
                                        const mMatch = period.match(/(?:^\d{4}-)(\d{2})/);
                                        const currentMonth = mMatch ? mMatch[1] : String(new Date().getMonth()+1).padStart(2,'0');
                                        return (
                                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                <select value={currentYear} onChange={e => setPeriod(`${e.target.value}-${currentMonth}`)}
                                                    style={{ padding: '0.85rem 1.25rem', borderRadius: '14px', border: '2px solid #e2e8f0', fontSize: '0.95rem', fontWeight: 800, background: '#f8fafc' }}>
                                                    <option value={new Date().getFullYear().toString()}>{new Date().getFullYear()}</option>
                                                    <option value={(new Date().getFullYear()-1).toString()}>{new Date().getFullYear()-1}</option>
                                                </select>
                                                <select value={currentMonth} onChange={e => setPeriod(`${currentYear}-${e.target.value}`)}
                                                    style={{ padding: '0.85rem 1.25rem', borderRadius: '14px', border: '2px solid #e2e8f0', fontSize: '0.95rem', fontWeight: 800, background: '#f8fafc' }}>
                                                    {MONTH_NAMES.map((name,i) => (
                                                        <option key={i+1} value={String(i+1).padStart(2,'0')}>{name.toUpperCase()}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Columnas por marca */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${commercialBrands.length}, 1fr)`,
                                    gap: '1rem',
                                    marginBottom: '2rem'
                                }}>
                                    {commercialBrands.map(brand => {
                                        const bData = multiFormData[brand] || {};
                                        const bLiveResult = calculateKPIValue(kpi.id, bData);
                                        const bMeta = kpi.meta?.[brand] ?? (typeof kpi.meta === 'number' ? kpi.meta : 0);
                                        let bCompliance = 0;
                                        if (bMeta === 0 && bLiveResult === 0) bCompliance = isInverse ? 100 : 0;
                                        else if (bMeta === 0 && bLiveResult > 0) bCompliance = isInverse ? 0 : 100;
                                        else if (typeof bMeta === 'number') {
                                            bCompliance = isInverse ? (bLiveResult !== 0 ? (bMeta/bLiveResult)*100 : 0) : (bMeta !== 0 ? (bLiveResult/bMeta)*100 : 0);
                                            bCompliance = Math.min(Math.max(Math.round(bCompliance||0),0),100);
                                        }
                                        const bMeeting = bLiveResult !== null && bCompliance >= (isStrict ? 100 : 95);
                                        const bPending = isBrandPending(brand);

                                        return (
                                            <div key={brand} style={{
                                                border: `2px solid ${bPending ? '#e2e8f0' : '#10b981'}`,
                                                borderRadius: '20px',
                                                overflow: 'hidden'
                                            }}>
                                                {/* Cabecera de marca */}
                                                <div style={{
                                                    padding: '0.75rem 1rem',
                                                    background: bPending ? '#f8fafc' : '#ecfdf5',
                                                    textAlign: 'center',
                                                    fontWeight: 900,
                                                    fontSize: '0.85rem',
                                                    color: bPending ? '#64748b' : '#059669',
                                                    borderBottom: '1px solid #e2e8f0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.4rem'
                                                }}>
                                                    {!bPending && <CheckCircle2 size={14} />}
                                                    {brand}
                                                    <span style={{ fontSize: '0.65rem', opacity: 0.6, fontWeight: 700 }}>
                                                        · Meta: {isInverse ? '≤' : '≥'} {bMeta} {kpi.unit}
                                                    </span>
                                                </div>

                                                {/* Campos de fórmula */}
                                                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    {getFormulaFields().map(field => (
                                                        <div key={field.name}>
                                                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                                                                {field.label}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                inputMode="decimal"
                                                                value={(() => {
                                                                    const val = bData[field.name];
                                                                    if (val == null || val === '') return '';
                                                                    const str = val.toString().replace(/\./g, '');
                                                                    const [int, dec] = str.split(',');
                                                                    const fmt = int.replace(/\D/g,'').replace(/\B(?=(\d{3})+(?!\d))/g,'.');
                                                                    return dec !== undefined ? `${fmt},${dec}` : fmt;
                                                                })()}
                                                                onChange={e => handleMultiChange(brand, field.name, e.target.value)}
                                                                placeholder={field.placeholder || '0'}
                                                                autoComplete="off"
                                                                style={{
                                                                    width: '100%', padding: '0.75rem 1rem',
                                                                    border: '2px solid #e2e8f0', borderRadius: '12px',
                                                                    fontSize: '1rem', fontWeight: 800, color: '#1e293b',
                                                                    background: '#f8fafc', outline: 'none', boxSizing: 'border-box'
                                                                }}
                                                                onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                                                                onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Resultado en vivo por marca */}
                                                {bLiveResult !== null && (
                                                    <div style={{
                                                        margin: '0 1rem 1rem',
                                                        padding: '0.6rem 1rem',
                                                        borderRadius: '12px',
                                                        background: bMeeting ? '#ecfdf5' : '#fef2f2',
                                                        border: `1px solid ${bMeeting ? '#10b981' : '#ef4444'}`,
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}>
                                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>Resultado</span>
                                                        <span style={{ fontSize: '1rem', fontWeight: 900, color: bMeeting ? '#059669' : '#dc2626' }}>
                                                            {bLiveResult} {kpi.unit} · {bCompliance}%
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── MODO NORMAL (una marca o modo meta) ─────────────── */}
                        {!isMultiBrand && (<>
                        {/* BRAND / ENTITY SELECTION - PREMIUM CHIPS */}
                        {(isMetaMode || (!isMetaMode && (hasCommercialBrands || kpi.meta?.TYM !== undefined || kpi.meta?.TAT !== undefined))) && (
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 800, marginBottom: '1.25rem', color: '#1e293b' }}>
                                    <Box size={16} color="var(--brand)" />
                                    {isMetaMode ? 'SELECCIONAR NIVEL DE META' : 'MARCA / NIVEL CARGA'}
                                </label>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {/* Nivel Empresa / Razón Social - MOSTRAR SI NO HAY MARCAS O EN MODO META */}
                                    {(isMetaMode || (!hasCommercialBrands && (kpi.meta?.TYM || kpi.meta?.TAT))) && (
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                                                {isMetaMode ? 'Nivel Empresa (Razón Social)' : (hasCommercialBrands ? 'Carga a Nivel Marca' : 'Carga a Nivel Empresa')}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                {(isMetaMode ? ['Global', 'TYM', 'TAT'] : [userEntity]).map(scope => {
                                                    const isActive = scope === 'Global' ? (!formData.brand || formData.brand === 'Global') : formData.brand === scope;
                                                    return (
                                                        <button
                                                            key={scope}
                                                            type="button"
                                                            onClick={() => {
                                                                handleChange('brand', scope);
                                                            }}
                                                            style={{
                                                                padding: '0.6rem 1.5rem',
                                                                borderRadius: '12px',
                                                                fontSize: '0.9rem',
                                                                fontWeight: 800,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s',
                                                                border: isActive ? '2px solid var(--brand)' : '1px solid #e2e8f0',
                                                                background: isActive ? 'var(--brand-bg)' : 'white',
                                                                color: isActive ? 'var(--brand)' : '#64748b',
                                                                minWidth: '100px'
                                                            }}
                                                        >
                                                            {scope}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Nivel Marca */}
                                    {((isMetaMode) || (!isMetaMode && hasCommercialBrands)) && commercialBrands.length > 0 && (
                                        <div>
                                            {isMetaMode && (
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                                                    Nivel Marca / Producto
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                                {/* Filter brands based on selected entity if not 'Global' */}
                                                {commercialBrands
                                                    .filter(brand => {
                                                        if (isMetaMode && (formData.brand === 'TYM' || formData.brand === 'TAT')) {
                                                            return BRAND_TO_ENTITY[brand] === formData.brand;
                                                        }
                                                        return true; // Show all if Global or no selection
                                                    })
                                                    .map(brand => {
                                                        const isActive = formData.brand === brand;
                                                        const pending = !isMetaMode && isBrandPending(brand);
                                                        const entity = BRAND_TO_ENTITY[brand];

                                                        return (
                                                            <button
                                                                key={brand}
                                                                type="button"
                                                                onClick={() => handleChange('brand', brand)}
                                                                style={{
                                                                    padding: '0.6rem 1rem',
                                                                    borderRadius: '12px',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: 700,
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s',
                                                                    border: isActive ? '2px solid var(--brand)' : '1px solid #e2e8f0',
                                                                    background: isActive ? 'var(--brand-bg)' : 'white',
                                                                    color: isActive ? 'var(--brand)' : '#64748b',
                                                                    position: 'relative',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center',
                                                                    gap: '2px'
                                                                }}
                                                            >
                                                                <span>{brand}</span>
                                                                <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>{entity}</span>
                                                                {pending && (
                                                                    <div style={{
                                                                        position: 'absolute', top: '-5px', right: '-5px',
                                                                        background: '#f43f5e', color: 'white', fontSize: '0.5rem',
                                                                        padding: '1px 4px', borderRadius: '4px'
                                                                    }}>!</div>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* PERIOD SELECTION - NEW & ESSENTIAL */}
                        {!isMetaMode && (
                            <div style={{ marginBottom: '2.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 800, marginBottom: '1rem', color: '#1e293b' }}>
                                    <Calendar size={16} color="var(--brand)" />
                                    PERIODO DE CARGA ({kpi.frecuencia})
                                </label>
                                
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    {kpi.frecuencia === 'DIARIO' && (
                                        <input 
                                            type="date"
                                            value={formData.period}
                                            onChange={(e) => handleChange('period', e.target.value)}
                                            style={{
                                                padding: '0.85rem 1.25rem', borderRadius: '14px', border: '2px solid #e2e8f0',
                                                fontSize: '0.95rem', fontWeight: 800, outline: 'none', color: '#1e293b',
                                                background: '#f8fafc'
                                            }}
                                        />
                                    )}

                                    {kpi.frecuencia === 'SEMANAL' && (() => {
                                        const yMatch = (formData.period || '').match(/^\d{4}/);
                                        const currentYear = yMatch ? yMatch[0] : new Date().getFullYear().toString();
                                        const wMatch = (formData.period || '').match(/W(\d{2})/);
                                        const currentWeek = wMatch ? wMatch[1] : '01';
                                        return (
                                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <select 
                                                    value={currentYear}
                                                    onChange={(e) => {
                                                        const newYear = e.target.value;
                                                        handleChange('period', `${newYear}-W${currentWeek}`);
                                                    }}
                                                    style={{
                                                        padding: '0.85rem 1.25rem', borderRadius: '14px', border: '2px solid #e2e8f0',
                                                        fontSize: '0.95rem', fontWeight: 800, outline: 'none', color: '#1e293b',
                                                        background: '#f8fafc', cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value={new Date().getFullYear().toString()}>{new Date().getFullYear()}</option>
                                                    <option value={(new Date().getFullYear() - 1).toString()}>{new Date().getFullYear() - 1}</option>
                                                </select>
                                                <select 
                                                    value={currentWeek}
                                                    onChange={(e) => {
                                                        const newWeek = e.target.value;
                                                        handleChange('period', `${currentYear}-W${newWeek}`);
                                                    }}
                                                    style={{
                                                        padding: '0.85rem 1.25rem', borderRadius: '14px', border: '2px solid #e2e8f0',
                                                        fontSize: '0.95rem', fontWeight: 800, outline: 'none', color: '#1e293b',
                                                        background: '#f8fafc', cursor: 'pointer'
                                                    }}
                                                >
                                                    {[...Array(53)].map((_, i) => {
                                                        const weekNumStr = String(i + 1).padStart(2, '0');
                                                        return (
                                                            <option key={i+1} value={weekNumStr}>
                                                                Semana {i + 1}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>
                                        );
                                    })()}

                                    {kpi.frecuencia === 'QUINCENAL' && (() => {
                                        const yMatch = (formData.period || '').match(/^\d{4}/);
                                        const currentYear = yMatch ? yMatch[0] : new Date().getFullYear().toString();
                                        const mMatch = (formData.period || '').match(/(?:^\d{4}-)(\d{2})/);
                                        const currentMonth = mMatch ? mMatch[1] : '01';
                                        const fMatch = (formData.period || '').match(/Q[12]/);
                                        const currentFortnight = fMatch ? fMatch[0] : 'Q1';
                                        return (
                                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <select 
                                                    value={currentYear}
                                                    onChange={(e) => {
                                                        const newYear = e.target.value;
                                                        handleChange('period', `${newYear}-${currentMonth}-${currentFortnight}`);
                                                    }}
                                                    style={{
                                                        padding: '0.85rem 1.25rem', borderRadius: '14px', border: '2px solid #e2e8f0',
                                                        fontSize: '0.95rem', fontWeight: 800, outline: 'none', color: '#1e293b',
                                                        background: '#f8fafc', cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value={new Date().getFullYear().toString()}>{new Date().getFullYear()}</option>
                                                    <option value={(new Date().getFullYear() - 1).toString()}>{new Date().getFullYear() - 1}</option>
                                                </select>
                                                <select 
                                                    value={currentMonth}
                                                    onChange={(e) => {
                                                        const newMonth = e.target.value;
                                                        handleChange('period', `${currentYear}-${newMonth}-${currentFortnight}`);
                                                    }}
                                                    style={{
                                                        padding: '0.85rem 1.25rem', borderRadius: '14px', border: '2px solid #e2e8f0',
                                                        fontSize: '0.95rem', fontWeight: 800, outline: 'none', color: '#1e293b',
                                                        background: '#f8fafc', cursor: 'pointer'
                                                    }}
                                                >
                                                    {MONTH_NAMES.map((name, i) => {
                                                        const mVal = String(i + 1).padStart(2, '0');
                                                        return (
                                                            <option key={i+1} value={mVal}>
                                                                {name.toUpperCase()}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                    {['Q1', 'Q2'].map(q => {
                                                        const isActive = currentFortnight === q;
                                                        return (
                                                            <button
                                                                key={q}
                                                                type="button"
                                                                onClick={() => handleChange('period', `${currentYear}-${currentMonth}-${q}`)}
                                                                style={{
                                                                    padding: '0.75rem 1.25rem', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 800,
                                                                    border: isActive ? '2px solid var(--brand)' : '2px solid #e2e8f0',
                                                                    background: isActive ? 'var(--brand-bg)' : 'white',
                                                                    color: isActive ? 'var(--brand)' : '#64748b',
                                                                    cursor: 'pointer', transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                {q === 'Q1' ? '1ra Quincena' : '2da Quincena'}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {kpi.frecuencia === 'MENSUAL' && (() => {
                                        const yMatch = (formData.period || '').match(/^\d{4}/);
                                        const currentYear = yMatch ? yMatch[0] : new Date().getFullYear().toString();
                                        const mMatch = (formData.period || '').match(/(?:^\d{4}-)(\d{2})/);
                                        const currentMonth = mMatch ? mMatch[1] : '01';
                                        return (
                                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <select 
                                                    value={currentYear}
                                                    onChange={(e) => {
                                                        const newYear = e.target.value;
                                                        handleChange('period', `${newYear}-${currentMonth}`);
                                                    }}
                                                    style={{
                                                        padding: '0.85rem 1.25rem', borderRadius: '14px', border: '2px solid #e2e8f0',
                                                        fontSize: '0.95rem', fontWeight: 800, outline: 'none', color: '#1e293b',
                                                        background: '#f8fafc', cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value={new Date().getFullYear().toString()}>{new Date().getFullYear()}</option>
                                                    <option value={(new Date().getFullYear() - 1).toString()}>{new Date().getFullYear() - 1}</option>
                                                </select>
                                                <select 
                                                    value={currentMonth}
                                                    onChange={(e) => {
                                                        const newMonth = e.target.value;
                                                        handleChange('period', `${currentYear}-${newMonth}`);
                                                    }}
                                                    style={{
                                                        padding: '0.85rem 1.25rem', borderRadius: '14px', border: '2px solid #e2e8f0',
                                                        fontSize: '0.95rem', fontWeight: 800, outline: 'none', color: '#1e293b',
                                                        background: '#f8fafc', cursor: 'pointer'
                                                    }}
                                                >
                                                    {MONTH_NAMES.map((name, i) => {
                                                        const mVal = String(i + 1).padStart(2, '0');
                                                        return (
                                                            <option key={i+1} value={mVal}>
                                                                {name.toUpperCase()}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>
                                        );
                                    })()}
                                </div>
                                <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.6rem', fontWeight: 600 }}>
                                    Indica a qué fecha o periodo corresponden los datos que estás ingresando.
                                </p>
                            </div>
                        )}

                        {/* INPUT FIELDS - CLEAN & BOLD */}
                        {/* INPUT FIELDS - CLEAN & BOLD */}
                        {isMetaMode ? (
                            <div style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem', color: '#334155' }}>
                                        Nueva Meta para {formData.brand || 'Global'} ({kpi.unit})
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        required
                                        value={(() => {
                                            if (formData.newMeta == null || formData.newMeta === '') return '';
                                            const str = formData.newMeta.toString().replace(/\./g, '');
                                            const [int, dec] = str.split(',');
                                            const formattedInt = int.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                            return dec !== undefined ? `${formattedInt},${dec}` : formattedInt;
                                        })()}
                                        onChange={(e) => handleChange('newMeta', e.target.value, e)}
                                        placeholder={`Eje: ${currentMeta}`}
                                        style={{
                                            width: '100%', padding: '1.1rem 1.25rem',
                                            border: '2px solid var(--brand)', borderRadius: '18px',
                                            fontSize: '1.5rem', fontWeight: 800, color: '#1e293b',
                                            background: 'white', outline: 'none'
                                        }}
                                        autoComplete="off"
                                    />
                                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <ShieldIcon size={14} />
                                        Meta actual: {currentMeta} {kpi.unit}
                                    </p>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem', color: '#334155' }}>
                                        Frecuencia de Actualización
                                    </label>
                                    <select
                                        value={formData.newFrecuencia || kpi.frecuencia}
                                        onChange={(e) => handleChange('newFrecuencia', e.target.value)}
                                        style={{
                                            width: '100%', padding: '1.1rem 1.25rem',
                                            border: '2px solid #e2e8f0', borderRadius: '18px',
                                            fontSize: '1.1rem', fontWeight: 800, color: '#1e293b',
                                            background: '#f8fafc', outline: 'none', cursor: 'pointer',
                                            WebkitAppearance: 'none',
                                            backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231e293b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'calc(100% - 1.2rem) center',
                                            backgroundSize: '0.8rem auto'
                                        }}
                                        onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                                        onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                    >
                                        <option value="DIARIA">DIARIA</option>
                                        <option value="SEMANAL">SEMANAL</option>
                                        <option value="QUINCENAL">QUINCENAL</option>
                                        <option value="MENSUAL">MENSUAL</option>
                                        <option value="BIMESTRAL">BIMESTRAL</option>
                                        <option value="TRIMESTRAL">TRIMESTRAL</option>
                                        <option value="SEMESTRAL">SEMESTRAL</option>
                                        <option value="ANUAL">ANUAL</option>
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                {fields.map(field => (
                                    <div key={field.name}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem', color: '#334155' }}>
                                            {field.label}
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={field.type === 'number' ? 'text' : field.type}
                                                inputMode={field.type === 'number' ? 'decimal' : undefined}
                                                required
                                                value={(() => {
                                                    const val = formData[field.name];
                                                    if (field.type !== 'number' || val == null || val === '') return val ?? '';
                                                    // Limpiamos cualquier punto previo para re-formatear
                                                    const str = val.toString().replace(/\./g, '');
                                                    const [int, dec] = str.split(',');
                                                    const formattedInt = int.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                                    return dec !== undefined ? `${formattedInt},${dec}` : formattedInt;
                                                })()}
                                                onChange={(e) => handleChange(field.name, e.target.value, e)}
                                                autoComplete="off"
                                                style={{
                                                    width: '100%', padding: '1.1rem 1.25rem',
                                                    border: '2px solid #e2e8f0', borderRadius: '18px',
                                                    fontSize: '1.25rem', fontWeight: 800, color: '#1e293b',
                                                    transition: 'all 0.2s', outline: 'none', background: '#f8fafc'
                                                }}
                                                onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                                                onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                                                placeholder={field.placeholder || "0"}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* CONDITIONAL OBSERVATIONS (e.g. for Pedidos Facturados) */}
                        {!isMetaMode && kpi.id === 'pedidos-facturados' && (
                            <div style={{ 
                                marginBottom: '2.5rem', padding: '1.5rem', background: '#fef2f2', 
                                borderRadius: '20px', border: '1px solid #fee2e2',
                                animation: 'fadeIn 0.4s ease-out'
                            }}>
                                <label style={{ 
                                    display: 'flex', alignItems: 'center', gap: '0.75rem', 
                                    fontSize: '0.85rem', fontWeight: 800, color: '#991b1b', marginBottom: '1rem',
                                    textTransform: 'uppercase'
                                }}>
                                    <AlertTriangle size={17} />
                                    Observaciones de Inventario
                                </label>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer', userSelect: 'none' }}>
                                        <div style={{ 
                                            position: 'relative', width: '22px', height: '22px', 
                                            background: formData.faltanteInventario ? '#ef4444' : 'white',
                                            border: `2px solid ${formData.faltanteInventario ? '#ef4444' : '#d1d5db'}`,
                                            borderRadius: '6px', transition: 'all 0.2s',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <input 
                                                type="checkbox"
                                                checked={formData.faltanteInventario || false}
                                                onChange={(e) => handleChange('faltanteInventario', e.target.checked)}
                                                style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                                            />
                                            {formData.faltanteInventario && <CheckCircle2 size={14} color="white" />}
                                        </div>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
                                            Reportar Faltante por Inventario
                                        </span>
                                    </label>

                                    {formData.faltanteInventario && (
                                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                                            <textarea 
                                                value={formData.detalleFaltante || ''}
                                                onChange={(e) => handleChange('detalleFaltante', e.target.value)}
                                                placeholder="Indica qué productos o referencias no se pudieron facturar por falta de stock..."
                                                style={{ 
                                                    width: '100%', padding: '1rem', borderRadius: '14px', border: '2px solid #fee2e2',
                                                    fontSize: '0.85rem', fontWeight: 500, minHeight: '90px', outline: 'none',
                                                    background: 'white', color: '#1e293b', fontFamily: 'inherit',
                                                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* PENDING BRANDS INFO */}
                        {!isMetaMode && hasCommercialBrands && (
                            <div style={{
                                marginBottom: '2.5rem',
                                padding: '1rem 1.5rem',
                                background: '#fff7ed',
                                borderRadius: '16px',
                                border: '1px solid #fed7aa',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ea580c', fontWeight: 800, fontSize: '0.8rem' }}>
                                    <AlertTriangle size={16} />
                                    MARCAS PENDIENTES:
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {commercialBrands.filter(isBrandPending).length > 0 ? (
                                        commercialBrands.filter(isBrandPending).map(b => (
                                            <span key={b} style={{
                                                background: 'white',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                color: '#9a3412',
                                                border: '1px solid #ffedd5'
                                            }}>
                                                {b}
                                            </span>
                                        ))
                                    ) : (
                                        <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>¡Todas las marcas cargadas!</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Cierre modo normal ── */}
                        </>)}

                        {/* LIVE RESULT CARD - solo en modo normal/una marca */}
                        {!isMultiBrand && !isMetaMode && liveResult !== null && (
                            <div className="premium-shadow" style={{
                                marginBottom: '2.5rem', padding: '2rem',
                                background: isMeetingMeta ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                                borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden'
                            }}>
                                <div style={{ position: 'relative', zIndex: 2 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 800, opacity: 0.9, letterSpacing: '0.05em' }}>CÁLCULO AUTOMÁTICO</div>
                                            <div style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, display: 'flex', alignItems: 'baseline' }}>
                                                {(() => {
                                                    if (kpi.id === 'rotacion-cxc' || kpi.id === 'rotacion-cxp') {
                                                        const rotationVal = liveResult;
                                                        const daysResult = rotationVal === 0 ? 0 : 360 / rotationVal;
                                                        return (
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                                                                    {formatNumber(rotationVal, 2)}
                                                                    <span style={{ fontSize: '1.5rem', opacity: 0.8, marginLeft: '8px' }}>veces</span>
                                                                </div>
                                                                <div style={{ fontSize: '1.25rem', opacity: 0.7, fontWeight: 700, marginTop: '5px' }}>
                                                                    ({formatNumber(daysResult, 0)} días)
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <>
                                                            {kpi.unit === '$' && <span style={{ fontSize: '1.5rem', opacity: 0.8, marginRight: '4px' }}>$</span>}
                                                            {kpi.unit === '$' ? formatNumber(liveResult, 0) : (kpi.unit === '%' ? formatNumber(liveResult, 2) : formatNumber(liveResult, 0))}
                                                            {kpi.unit !== '$' && <span style={{ fontSize: '1.5rem', opacity: 0.8, marginLeft: '8px' }}>{kpi.unit}</span>}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                        <div style={{
                                            background: 'rgba(255,255,255,0.2)', padding: '0.75rem 1.25rem',
                                            borderRadius: '16px', backdropFilter: 'blur(4px)', textAlign: 'right'
                                        }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.8 }}>ESTADO ACTUAL</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 900, fontSize: '1rem' }}>
                                                {isMeetingMeta ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                                                {isMeetingMeta ? 'DENTRO DE META' : 'FUERA DE META'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        display: 'flex', gap: '1rem', marginTop: '1.5rem',
                                        paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)',
                                        fontSize: '0.85rem', fontWeight: 600
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <span style={{ opacity: 0.8 }}>Fórmula Aplicada:</span>
                                            <div style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.15)', padding: '0.4rem 0.75rem', borderRadius: '8px', marginTop: '0.4rem', fontSize: '0.75rem' }}>
                                                {kpi.formula}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Calculator size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, transform: 'rotate(-10deg)' }} />
                            </div>
                        )}

                        {/* ACTIONS */}
                        <div style={{ display: 'flex', gap: '1.25rem' }}>
                            <button type="button" onClick={onCancel} style={{
                                flex: 1, padding: '1.25rem', borderRadius: '18px', border: '2px solid #e2e8f0',
                                background: 'white', color: '#64748b', fontWeight: 800, cursor: 'pointer',
                                transition: 'all 0.2s'
                            }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}>
                                CANCELAR
                            </button>
                            <button type="submit" style={{
                                flex: 2, padding: '1.25rem', borderRadius: '18px', border: 'none',
                                background: isMetaMode ? 'var(--brand)' : 'var(--bg-sidebar)', color: 'white', fontWeight: 900, cursor: 'pointer',
                                boxShadow: '0 15px 30px -10px rgba(15,23,42,0.4)', fontSize: '1.1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }} onMouseOver={e => {
                                e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 20px 40px -12px rgba(15,23,42,0.5)';
                            }} onMouseOut={e => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 15px 30px -10px rgba(15,23,42,0.4)';
                            }}>
                                <Save size={22} /> {isMetaMode ? 'ACTUALIZAR META' : 'GUARDAR INDICADOR'}
                            </button>
                        </div>
                    </form>

                    <div style={{
                        marginTop: '2rem', padding: '1.25rem', background: '#f8fafc',
                        borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center'
                    }}>
                        <Info size={20} color="var(--brand)" />
                        <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                            <strong>Instrucción:</strong> {isMetaMode
                                ? `Como Gerente, puedes redefinir la meta para ${formData.brand || 'este indicador'}. Este cambio se aplicará a todos los tableros.`
                                : `Ingresa los valores solicitados para la marca ${formData.brand || 'General'}. El sistema calculará el resultado automáticamente.`}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KPIDataForm;
