import React, { useState, useEffect, useMemo } from 'react';
import {
    X,
    Save,
    Calculator,
    AlertTriangle,
    CheckCircle2,
    Info,
    Calendar,
    RefreshCw,
    Search,
    SlidersHorizontal
} from 'lucide-react';
import { calculateKPIValue, isInverseKPI } from '../../utils/kpiCalculations';
import {
    BRAND_TO_ENTITY,
    getKPIFormulaFields,
    resolveSharedFieldValue,
    ALL_SHARED_FIELDS,
    FIELD_ALIAS_GROUPS,
    getEntityBrands,
    getKPIResponsable
} from '../../utils/kpiHelpers';
import { formatNumber, getCurrentPeriodKey } from '../../utils/formatters';

// ─── Period helpers per frequency type ───────────────────────────────────────

/** Last N months as YYYY-MM, newest first */
const getRecentMonths = (n = 6) => {
    const result = [];
    const d = new Date();
    for (let i = 0; i < n; i++) {
        const y = d.getFullYear();
        const m = (d.getMonth() + 1).toString().padStart(2, '0');
        result.push(`${y}-${m}`);
        d.setMonth(d.getMonth() - 1);
    }
    return result;
};

/** Last N fortnights as YYYY-MM-Q1 or YYYY-MM-Q2, newest first */
const getRecentQuincenas = (n = 6) => {
    const result = [];
    const now = new Date();
    // Start from the most recently COMPLETED fortnight
    let d = new Date(now);
    // If today is Q1 (1-15), the last completed is previous month Q2
    // If today is Q2 (16+), the last completed is this month Q1
    if (d.getDate() <= 15) {
        // Last completed: previous month Q2
        d.setMonth(d.getMonth() - 1);
        let y = d.getFullYear(), m = (d.getMonth() + 1).toString().padStart(2, '0');
        result.push(`${y}-${m}-Q2`);
        // then Q1 of same month
        result.push(`${y}-${m}-Q1`);
        // go back further
        for (let i = 0; i < n - 2; i++) {
            d.setMonth(d.getMonth() - 1);
            y = d.getFullYear(); m = (d.getMonth() + 1).toString().padStart(2, '0');
            result.push(`${y}-${m}-Q2`);
            result.push(`${y}-${m}-Q1`);
            if (result.length >= n) break;
        }
    } else {
        // Last completed: this month Q1
        let y = d.getFullYear(), m = (d.getMonth() + 1).toString().padStart(2, '0');
        result.push(`${y}-${m}-Q1`);
        for (let i = 0; i < n - 1; i++) {
            d.setMonth(d.getMonth() - 1);
            y = d.getFullYear(); m = (d.getMonth() + 1).toString().padStart(2, '0');
            result.push(`${y}-${m}-Q2`);
            result.push(`${y}-${m}-Q1`);
            if (result.length >= n) break;
        }
    }
    return result.slice(0, n);
};

/** ISO week key YYYY-Www for the past N weeks, newest first */
const getISOWeekKey = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dow = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dow); // ISO Thursday
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${week.toString().padStart(2, '0')}`;
};

const getRecentWeeks = (n = 8) => {
    const result = [];
    const now = new Date();
    // Start from the most recently COMPLETED week (last Monday-Sunday block)
    const dow = now.getDay() || 7; // 1=Mon ... 7=Sun
    // Last completed week ended last Sunday:
    const lastSunday = new Date(now);
    lastSunday.setDate(now.getDate() - dow); // go back to last Sunday
    for (let i = 0; i < n; i++) {
        const key = getISOWeekKey(lastSunday);
        result.push(key);
        lastSunday.setDate(lastSunday.getDate() - 7);
    }
    return result;
};

// Smart defaults — most recently COMPLETED/EXPIRED period
const getDefaultMonthKey = () => {
    const d = new Date();
    const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    return `${prev.getFullYear()}-${(prev.getMonth() + 1).toString().padStart(2, '0')}`;
};

const getDefaultQuincenaKey = () => getRecentQuincenas(1)[0];
const getDefaultWeekKey = () => getRecentWeeks(1)[0];
const getTodayKey = () => new Date().toISOString().split('T')[0];

// Label formatters
const formatMonthLabel = (yyyyMM) => {
    if (!yyyyMM) return '';
    const [year, month] = yyyyMM.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, 1)
        .toLocaleString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();
};

const formatQuincenaLabel = (key) => {
    if (!key) return '';
    // YYYY-MM-Q1 or YYYY-MM-Q2
    const m = key.match(/^(\d{4})-(\d{2})-(Q[12])$/);
    if (!m) return key;
    const monthName = new Date(parseInt(m[1]), parseInt(m[2]) - 1, 1)
        .toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    return `${m[3] === 'Q1' ? '1RA' : '2DA'} QUINCENA ${monthName} ${m[1]}`;
};

const formatWeekLabel = (key) => {
    if (!key) return '';
    // YYYY-Www → find the Monday of that week
    const m = key.match(/^(\d{4})-W(\d{1,2})$/);
    if (!m) return key;
    const year = parseInt(m[1]), week = parseInt(m[2]);
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const dow = jan4.getUTCDay() || 7;
    const monday = new Date(jan4);
    monday.setUTCDate(jan4.getUTCDate() - (dow - 1) + (week - 1) * 7);
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    const fmt = (d) => d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase();
    return `Sem ${week}: ${fmt(monday)} – ${fmt(sunday)} ${year}`;
};

/** Given a frequency and the per-frequency selected keys, return the period key for a row */
const resolveRowPeriod = (frequency, { selectedMonthKey, selectedQuincenaKey, selectedWeekKey }) => {
    const freq = (frequency || 'MENSUAL').toUpperCase();
    if (freq.includes('DIARI')) return getTodayKey();
    if (freq.includes('SEMANAL')) return selectedWeekKey;
    if (freq.includes('QUINCENAL')) return selectedQuincenaKey;
    // MENSUAL, BIMESTRAL, TRIMESTRAL, SEMESTRAL, ANUAL → use month key
    return selectedMonthKey;
};

// ─── Component ────────────────────────────────────────────────────────────────

const cleanNumericValue = (valStr) => {
    if (typeof valStr !== 'string') return valStr;
    let clean = valStr.trim().replace(/\s/g, '');
    if (clean.includes(',') && clean.includes('.')) {
        clean = clean.replace(/\./g, '').replace(',', '.');
    } else if (clean.includes(',')) {
        clean = clean.replace(',', '.');
    } else {
        clean = clean.replace(/\./g, '');
    }
    const num = parseFloat(clean);
    return isNaN(num) ? '' : num;
};

const formatInputValue = (val) => {
    if (val == null || val === '') return '';
    const str = val.toString().replace(/\./g, '');
    const [int, dec] = str.split(',');
    const formattedInt = int.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return dec !== undefined ? `${formattedInt},${dec}` : formattedInt;
};

const BulkKPIDataGrid = ({ kpis = [], currentUser, onSave, onCancel, rawUpdates = [], isInline = false }) => {
    const userEntity = currentUser?.company || 'TYM';
    const lockedBrand = currentUser?.activeBrand || null;

    const [searchTerm, setSearchTerm] = useState('');
    const [showOnlyPending, setShowOnlyPending] = useState(true);
    const [gridData, setGridData] = useState({});
    const [userModified, setUserModified] = useState({});
    const [saveStatus, setSaveStatus] = useState({ state: 'idle', message: '' });
    const [rowSaveStatus, setRowSaveStatus] = useState({}); // per-row save feedback

    // Global defaults (used as initial values for per-row overrides)
    const recentMonths = useMemo(() => getRecentMonths(6), []);
    const recentQuincenas = useMemo(() => getRecentQuincenas(6), []);
    const recentWeeks = useMemo(() => getRecentWeeks(8), []);

    // Per-KPI period overrides: { [kpiId]: periodKey }
    const [rowPeriodOverrides, setRowPeriodOverrides] = useState({});

    const getRowPeriod = (kpi) => {
        if (rowPeriodOverrides[kpi.id] !== undefined) return rowPeriodOverrides[kpi.id];
        const freq = (kpi.frecuencia || 'MENSUAL').toUpperCase();
        if (freq.includes('DIARI')) return getTodayKey();
        if (freq.includes('SEMANAL')) return getDefaultWeekKey();
        if (freq.includes('QUINCENAL')) return getDefaultQuincenaKey();
        return getDefaultMonthKey();
    };

    const periodSelectors = {
        selectedMonthKey: getDefaultMonthKey(),
        selectedQuincenaKey: getDefaultQuincenaKey(),
        selectedWeekKey: getDefaultWeekKey()
    };



    // Determine brands user can see
    const getEffectiveBrands = (kpi) => {
        const all = getEntityBrands(kpi, userEntity);
        if (lockedBrand) {
            if (Array.isArray(lockedBrand)) {
                const normalizedLocks = lockedBrand.map(l => l?.trim().toUpperCase());
                return all.filter(b => normalizedLocks.includes(b?.trim().toUpperCase()));
            }
            return all.filter(b => b?.trim().toUpperCase() === lockedBrand?.trim().toUpperCase());
        }
        return all;
    };

    // Flatten KPIs to rows (one per brand required/allowed)
    const rows = useMemo(() => {
        const list = [];
        kpis.forEach(kpi => {
            const effectiveBrands = getEffectiveBrands(kpi);
            const freqPeriod = getRowPeriod(kpi);

            if (effectiveBrands.length === 0) {
                list.push({
                    kpi,
                    brand: userEntity,
                    period: freqPeriod,
                    key: `${kpi.id}-${userEntity}-${freqPeriod}`
                });
            } else {
                effectiveBrands.forEach(brand => {
                    list.push({
                        kpi,
                        brand,
                        period: freqPeriod,
                        key: `${kpi.id}-${brand}-${freqPeriod}`
                    });
                });
            }
        });
        return list;
    }, [kpis, userEntity, lockedBrand, rowPeriodOverrides]);

    // Group rows by kpi.id for multi-brand display (título único, marcas en columnas)
    const buildGroupedRows = (rowList) => {
        const groups = new Map();
        rowList.forEach(row => {
            if (!groups.has(row.kpi.id)) groups.set(row.kpi.id, []);
            groups.get(row.kpi.id).push(row);
        });
        return Array.from(groups.values());
    };

    // Initial load: prefill inputs using exact values or shared fields
    useEffect(() => {
        const initial = {};
        const modified = {};

        rows.forEach(row => {
            const { kpi, brand, period, key } = row;
            const dataKey = `${userEntity}-${brand.toUpperCase()}`;

            // A. Check if the KPI already has saved data in rawUpdates
            let existingData = null;
            if (rawUpdates && Array.isArray(rawUpdates)) {
                const match = rawUpdates.find(upd =>
                    upd.kpi_id === kpi.id &&
                    (upd.company_id === userEntity || upd.additional_data?.company === userEntity) &&
                    (upd.additional_data?.brand?.toUpperCase() === brand.toUpperCase() || (!upd.additional_data?.brand && brand === userEntity)) &&
                    upd.additional_data?.period === period &&
                    upd.additional_data?.type !== 'META_UPDATE'
                );
                if (match && match.additional_data) {
                    existingData = { ...match.additional_data };
                }
            }

            // B. Fallback to kpi brandValues
            if (!existingData) {
                const bVal = kpi.brandValues?.[dataKey];
                if (bVal && bVal.hasData) {
                    const storedPeriod = bVal.additionalData?.period || '';
                    if (storedPeriod === period || (storedPeriod.startsWith(period) && kpi.frecuencia === 'MENSUAL')) {
                        existingData = { ...bVal.additionalData };
                    }
                }
            }

            if (existingData) {
                // Prepopulate with existing clean data
                const cleaned = { ...existingData };
                delete cleaned.updatedAt; delete cleaned.period; delete cleaned.timestamp;
                initial[key] = cleaned;
            } else {
                // C. Fallback: load shared fields from other KPIs
                const shared = {};
                const formulaFields = getKPIFormulaFields(kpi.id);

                rawUpdates.forEach(upd => {
                    if (upd.kpi_id === kpi.id) return;
                    if (upd.additional_data?.type === 'META_UPDATE') return;
                    const updPeriod = upd.additional_data?.period || '';
                    const updBrand = upd.additional_data?.brand?.toUpperCase() || '';
                    const updCompany = upd.additional_data?.company || upd.company_id || '';

                    // Same month, same company, same brand (or no brand)
                    if (updPeriod.substring(0, 7) !== period.substring(0, 7)) return;
                    if (updCompany !== userEntity) return;
                    if (updBrand !== '' && updBrand !== brand.toUpperCase()) return;

                    formulaFields.forEach(field => {
                        const val = resolveSharedFieldValue(upd.additional_data, field.name);
                        if (val !== undefined && shared[field.name] === undefined) {
                            shared[field.name] = val;
                        }
                    });
                });
                initial[key] = shared;
            }
            modified[key] = new Set();
        });

        setGridData(initial);
        setUserModified(modified);
    }, [rows, rawUpdates, userEntity]);

    // Handle input change & propagate shared values to other rows
    const handleInputChange = (rowKey, rowBrand, rowPeriod, fieldName, rawValue) => {
        // Track input manually
        setUserModified(prev => {
            const next = { ...prev };
            if (!next[rowKey]) next[rowKey] = new Set();
            next[rowKey].add(fieldName);
            return next;
        });

        setGridData(prev => {
            const next = { ...prev };
            if (!next[rowKey]) next[rowKey] = {};
            next[rowKey][fieldName] = rawValue;

            // Propagation logic: check if field is shared
            if (ALL_SHARED_FIELDS.includes(fieldName)) {
                const aliasGroup = FIELD_ALIAS_GROUPS.find(g => g.includes(fieldName)) || [fieldName];

                rows.forEach(other => {
                    if (other.key === rowKey) return;
                    const sameBrand = other.brand.toUpperCase() === rowBrand.toUpperCase();
                    const sameMonth = other.period.substring(0, 7) === rowPeriod.substring(0, 7);

                    if (sameBrand && sameMonth) {
                        const otherFields = getKPIFormulaFields(other.kpi.id);
                        const matchField = otherFields.find(f => aliasGroup.includes(f.name));

                        if (matchField) {
                            // Propagate ONLY if the user hasn't edited that field in the other row manually
                            const isUserModified = userModified[other.key]?.has(matchField.name);
                            if (!isUserModified) {
                                if (!next[other.key]) next[other.key] = {};
                                next[other.key][matchField.name] = rawValue;
                            }
                        }
                    }
                });
            }
            return next;
        });
    };

    // Calculate details for each row
    const getRowDetails = (row) => {
        const { kpi, brand, key } = row;
        const fields = getKPIFormulaFields(kpi.id);
        const rowValues = gridData[key] || {};

        // Parse numerical fields
        const parsedData = {};
        let filledCount = 0;
        fields.forEach(f => {
            const val = rowValues[f.name];
            if (val !== undefined && val !== null && val !== '') {
                const cleanNum = cleanNumericValue(val.toString());
                if (cleanNum !== '') {
                    parsedData[f.name] = cleanNum;
                    filledCount++;
                }
            }
        });

        const isComplete = fields.length === filledCount;
        const liveVal = isComplete ? calculateKPIValue(kpi.id, parsedData) : null;

        // Meta target
        const metaObj = kpi.meta || {};
        const targetMeta = typeof metaObj === 'object'
            ? (metaObj[brand] || metaObj[brand.toLowerCase()] || Object.values(metaObj)[0] || 0)
            : metaObj;

        // Compliance & semaphore
        let compliance = 0;
        let semaphore = 'gray';
        const isStrict = ['revision-margenes', 'revision-precios', 'pedidos-facturados', 'impresion-facturas', 'fiabilidad-inventarios', 'planillas-separadas', 'pedidos-separar-total'].includes(kpi.id);
        const isInverse = isInverseKPI(kpi.id);

        if (liveVal !== null) {
            if (targetMeta === 0 && liveVal === 0) {
                compliance = 100;
            } else if (targetMeta === 0 && liveVal > 0) {
                compliance = isInverse ? 0 : 100;
            } else {
                compliance = isInverse ? (targetMeta / liveVal) * 100 : (liveVal / targetMeta) * 100;
                compliance = Math.min(Math.max(Math.round(compliance || 0), 0), 100);
            }

            const greenThreshold = isStrict ? 100 : 95;
            const yellowThreshold = isStrict ? 100 : 85;
            if (compliance >= greenThreshold) semaphore = 'green';
            else if (compliance >= yellowThreshold) semaphore = 'yellow';
            else semaphore = 'red';
        }

        // Check if this row originally has data for the current period
        const originallyLoaded = (() => {
            const dataKey = `${userEntity}-${brand.toUpperCase()}`;
            const bVal = kpi.brandValues?.[dataKey];
            if (!bVal || !bVal.hasData) return false;
            const expectedPeriod = getCurrentPeriodKey(kpi.frecuencia);
            return bVal.additionalData?.period === expectedPeriod;
        })();

        return {
            fields,
            isComplete,
            liveVal,
            targetMeta,
            compliance,
            semaphore,
            originallyLoaded,
            parsedData
        };
    };

    // Filter rows based on filters & search
    const filteredRows = useMemo(() => {
        return rows.filter(row => {
            const details = getRowDetails(row);

            // Filter out fully loaded rows if showOnlyPending is true
            if (showOnlyPending && details.originallyLoaded) {
                return false;
            }

            // Search text
            if (searchTerm) {
                const matchName = row.kpi.name.toLowerCase().includes(searchTerm.toLowerCase());
                const matchBrand = row.brand.toLowerCase().includes(searchTerm.toLowerCase());
                const matchArea = (row.kpi.subArea || '').toLowerCase().includes(searchTerm.toLowerCase());
                if (!matchName && !matchBrand && !matchArea) return false;
            }

            return true;
        });
    }, [rows, searchTerm, showOnlyPending, gridData]);

    // Handle individual row save
    const handleSaveRow = async (row) => {
        const details = getRowDetails(row);
        if (!details.isComplete) return;
        const rowStatusKey = row.key;
        setRowSaveStatus(prev => ({ ...prev, [rowStatusKey]: 'saving' }));
        try {
            const payload = {
                brand: row.brand,
                period: row.period,
                ...details.parsedData,
                type: 'DATA_UPDATE'
            };
            await onSave(row.kpi.id, payload);
            setRowSaveStatus(prev => ({ ...prev, [rowStatusKey]: 'success' }));
            setTimeout(() => setRowSaveStatus(prev => ({ ...prev, [rowStatusKey]: null })), 2500);
        } catch (error) {
            setRowSaveStatus(prev => ({ ...prev, [rowStatusKey]: 'error' }));
            setTimeout(() => setRowSaveStatus(prev => ({ ...prev, [rowStatusKey]: null })), 3000);
        }
    };

    // Handle batch save
    const handleSaveAll = async () => {
        try {
            setSaveStatus({ state: 'saving', message: 'Guardando datos en lote...' });
            let saveCount = 0;

            for (const row of rows) {
                const details = getRowDetails(row);
                // Save only if inputs are fully completed
                if (details.isComplete) {
                    // Guardar solo si el usuario modificó algo en esta fila
                    const wasModified = userModified[row.key] && userModified[row.key].size > 0;
                    
                    if (wasModified || !details.originallyLoaded) {
                        const payload = {
                            brand: row.brand,
                            period: row.period,
                            ...details.parsedData,
                            type: 'DATA_UPDATE'
                        };

                        await onSave(row.kpi.id, payload);
                        saveCount++;
                    }
                }
            }

            setSaveStatus({ state: 'success', message: `¡Carga masiva exitosa! Se actualizaron ${saveCount} registros.` });
            setTimeout(() => {
                setSaveStatus({ state: 'idle', message: '' });
                if (!isInline && onCancel) {
                    onCancel(); // Close grid modal
                }
            }, 2500);

        } catch (error) {
            console.error('Error saving bulk data', error);
            setSaveStatus({ state: 'error', message: `Error al guardar: ${error.message || 'Inténtalo de nuevo.'}` });
        }
    };

    return (
        <div style={isInline ? { width: '100%', padding: '0 0 2rem 0' } : {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
            padding: '2rem'
        }}>
            <div className="glass" style={isInline ? {
                width: '100%', borderRadius: '24px', display: 'flex', flexDirection: 'column',
                overflow: 'hidden', border: '1px solid var(--border-soft)',
                background: 'var(--bg-card)', boxShadow: 'var(--shadow-lg)'
            } : {
                width: '100%', maxWidth: '1280px', height: '100%', maxHeight: '850px',
                borderRadius: '32px', display: 'flex', flexDirection: 'column',
                overflow: 'hidden', border: '1px solid var(--glass-border)',
                background: 'var(--bg-card)', boxShadow: 'var(--shadow-xl)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '2rem 2.5rem', borderBottom: '1px solid var(--border-soft)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'var(--bg-soft)'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                            <SlidersHorizontal size={24} color="var(--brand)" />
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>
                                Consola de Alimentación de Indicadores
                            </h2>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Ingresa los datos para la entidad <strong>{userEntity}</strong>. Los campos compartidos como <em>ventaTotal</em> se propagarán automáticamente entre filas equivalentes.
                        </p>
                    </div>
                    {!isInline && (
                        <button
                            onClick={onCancel}
                            style={{
                                background: 'white', border: '1px solid var(--border-soft)',
                                padding: '0.5rem', borderRadius: '12px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s', color: 'var(--text-muted)'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseOut={e => e.currentTarget.style.background = 'white'}
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Filters Row - search + pending toggle only */}
                <div style={{
                    padding: '1rem 2.5rem', borderBottom: '1px solid var(--border-soft)',
                    display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap',
                    background: '#f8fafc'
                }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Buscar por KPI, marca o subárea..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem',
                                borderRadius: '12px', border: '1px solid var(--border-medium)',
                                fontSize: '0.85rem', outline: 'none', background: 'white', color: 'var(--text-main)'
                            }}
                        />
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={showOnlyPending}
                            onChange={e => setShowOnlyPending(e.target.checked)}
                            style={{ width: '16px', height: '16px', borderRadius: '4px', accentColor: 'var(--brand)' }}
                        />
                        Mostrar solo pendientes
                    </label>
                </div>

                {/* Table Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2.5rem' }}>
                    {filteredRows.length === 0 ? (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <CheckCircle2 size={48} color="var(--success)" />
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                                {showOnlyPending ? '¡No tienes indicadores pendientes por cargar!' : 'No se encontraron resultados.'}
                            </div>
                            {showOnlyPending && (
                                <button
                                    onClick={() => setShowOnlyPending(false)}
                                    style={{
                                        padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-medium)',
                                        background: 'white', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600
                                    }}
                                >
                                    Ver todos los indicadores
                                </button>
                            )}
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-soft)', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800 }}>
                                    <th style={{ padding: '0.75rem 1rem', width: '30%' }}>INDICADOR</th>
                                    <th style={{ padding: '0.75rem 1rem', width: '10%' }}>MARCA</th>
                                    <th style={{ padding: '0.75rem 1rem', width: '12%' }}>FRECUENCIA</th>
                                    <th style={{ padding: '0.75rem 1rem', width: '33%' }}>VALORES FÓRMULA</th>
                                    <th style={{ padding: '0.75rem 1rem', width: '15%' }}>CÁLCULO LIVE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {buildGroupedRows(filteredRows).map(group => {
                                    const firstRow = group[0];
                                    const { kpi } = firstRow;
                                    const isMultiBrandGroup = group.length > 1;
                                    const freq = (kpi.frecuencia || 'MENSUAL').toUpperCase();
                                    const isMonthly = !freq.includes('DIARI') && !freq.includes('SEMANAL') && !freq.includes('QUINCENAL');
                                    const isQuincenal = freq.includes('QUINCENAL');
                                    const isSemanal = freq.includes('SEMANAL');
                                    const isDiario = freq.includes('DIARI');
                                    const currentPeriod = getRowPeriod(kpi);

                                    return (
                                        <tr key={kpi.id} style={{
                                            borderBottom: '1px solid var(--border-soft)',
                                            transition: 'background 0.15s',
                                            background: group.every(r => getRowDetails(r).originallyLoaded) ? '#f8fafc' : 'transparent'
                                        }}>
                                            {/* Column 1: KPI Details + inline period selector — UNA VEZ */}
                                            <td style={{ padding: '1rem 1rem', verticalAlign: 'middle' }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                                                    {kpi.name}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.4rem' }}>
                                                    {kpi.subArea || 'General'}
                                                </div>
                                                {!isDiario && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                                                        <Calendar size={11} color={isQuincenal ? '#059669' : (isSemanal ? '#7c3aed' : 'var(--brand)')} />
                                                        <select
                                                            value={currentPeriod}
                                                            onChange={e => {
                                                                setRowPeriodOverrides(prev => ({ ...prev, [kpi.id]: e.target.value }));
                                                                group.forEach(r => {
                                                                    setGridData(prev => { const n = {...prev}; delete n[r.key]; return n; });
                                                                    setUserModified(prev => { const n = {...prev}; delete n[r.key]; return n; });
                                                                });
                                                            }}
                                                            style={{
                                                                padding: '0.2rem 0.45rem', borderRadius: '7px', fontSize: '0.65rem',
                                                                border: `1.5px solid ${isQuincenal ? '#059669' : (isSemanal ? '#7c3aed' : 'var(--brand)')}`,
                                                                fontWeight: 800,
                                                                color: isQuincenal ? '#059669' : (isSemanal ? '#7c3aed' : 'var(--brand)'),
                                                                background: isQuincenal ? '#ecfdf5' : (isSemanal ? '#f5f3ff' : '#eff6ff'),
                                                                cursor: 'pointer', outline: 'none', maxWidth: '180px'
                                                            }}
                                                        >
                                                            {isQuincenal
                                                                ? recentQuincenas.map(q => <option key={q} value={q}>{formatQuincenaLabel(q)}{q === getDefaultQuincenaKey() ? ' ✓' : ''}</option>)
                                                                : isSemanal
                                                                    ? recentWeeks.map(w => <option key={w} value={w}>{formatWeekLabel(w)}{w === getDefaultWeekKey() ? ' ✓' : ''}</option>)
                                                                    : recentMonths.map(m => <option key={m} value={m}>{formatMonthLabel(m)}{m === getDefaultMonthKey() ? ' ✓' : ''}</option>)
                                                            }
                                                        </select>
                                                    </div>
                                                )}
                                                {isDiario && (
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--brand)', fontWeight: 800 }}>
                                                        📅 Hoy: {currentPeriod}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Column 2: Marca(s) */}
                                            <td style={{ padding: '1rem 1rem', verticalAlign: 'middle' }}>
                                                {isMultiBrandGroup ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                        {group.map(r => (
                                                            <span key={r.brand} style={{
                                                                padding: '0.2rem 0.5rem', borderRadius: '8px',
                                                                fontSize: '0.72rem', fontWeight: 800,
                                                                background: BRAND_TO_ENTITY[r.brand] === 'TYM' ? '#eff6ff' : '#f0fdf4',
                                                                color: BRAND_TO_ENTITY[r.brand] === 'TYM' ? '#1e40af' : '#166534',
                                                                border: BRAND_TO_ENTITY[r.brand] === 'TYM' ? '1px solid #dbeafe' : '1px solid #dcfce7',
                                                                display: 'inline-block'
                                                            }}>
                                                                {r.brand}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span style={{
                                                        padding: '0.25rem 0.5rem', borderRadius: '8px',
                                                        fontSize: '0.75rem', fontWeight: 800,
                                                        background: BRAND_TO_ENTITY[firstRow.brand] === 'TYM' ? '#eff6ff' : '#f0fdf4',
                                                        color: BRAND_TO_ENTITY[firstRow.brand] === 'TYM' ? '#1e40af' : '#166534',
                                                        border: BRAND_TO_ENTITY[firstRow.brand] === 'TYM' ? '1px solid #dbeafe' : '1px solid #dcfce7'
                                                    }}>
                                                        {firstRow.brand}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Column 3: Frecuencia */}
                                            <td style={{ padding: '1rem 1rem', verticalAlign: 'middle' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                                    {kpi.frecuencia}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                                    {currentPeriod}
                                                </div>
                                            </td>

                                            {/* Column 4: Inputs — columnas por marca si hay varias */}
                                            <td style={{ padding: '1rem 1rem', verticalAlign: 'top' }}>
                                                {isMultiBrandGroup ? (
                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: `repeat(${group.length}, 1fr)`,
                                                        gap: '0.75rem'
                                                    }}>
                                                        {group.map(row => {
                                                            const { brand, key } = row;
                                                            const details = getRowDetails(row);
                                                            return (
                                                                <div key={brand} style={{
                                                                    border: '1px solid var(--border-soft)',
                                                                    borderRadius: '10px',
                                                                    overflow: 'hidden'
                                                                }}>
                                                                    <div style={{
                                                                        padding: '0.3rem 0.6rem',
                                                                        background: BRAND_TO_ENTITY[brand] === 'TYM' ? '#eff6ff' : '#f0fdf4',
                                                                        fontSize: '0.68rem', fontWeight: 900,
                                                                        color: BRAND_TO_ENTITY[brand] === 'TYM' ? '#1e40af' : '#166534',
                                                                        textAlign: 'center'
                                                                    }}>
                                                                        {brand}
                                                                    </div>
                                                                    <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                                        {details.fields.map(field => {
                                                                            const rowValues = gridData[key] || {};
                                                                            const isShared = ALL_SHARED_FIELDS.includes(field.name);
                                                                            return (
                                                                                <div key={field.name}>
                                                                                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                                        {field.label} {isShared && '🔗'}
                                                                                    </div>
                                                                                    <input
                                                                                        type="text"
                                                                                        inputMode="decimal"
                                                                                        value={formatInputValue(rowValues[field.name])}
                                                                                        onChange={e => handleInputChange(key, brand, row.period, field.name, e.target.value)}
                                                                                        style={{
                                                                                            width: '100%', padding: '0.35rem 0.5rem',
                                                                                            borderRadius: '7px', border: '1px solid var(--border-medium)',
                                                                                            fontSize: '0.78rem', fontWeight: 700, outline: 'none',
                                                                                            background: 'white', color: 'var(--text-main)',
                                                                                            borderColor: isShared ? '#93c5fd' : 'var(--border-medium)',
                                                                                            boxSizing: 'border-box'
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    // Una sola marca — layout original
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                                                        {getRowDetails(firstRow).fields.map(field => {
                                                            const rowValues = gridData[firstRow.key] || {};
                                                            const isShared = ALL_SHARED_FIELDS.includes(field.name);
                                                            return (
                                                                <div key={field.name}>
                                                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                                        {field.label} {isShared && '🔗'}
                                                                    </div>
                                                                    <input
                                                                        type="text"
                                                                        inputMode="decimal"
                                                                        value={formatInputValue(rowValues[field.name])}
                                                                        onChange={e => handleInputChange(firstRow.key, firstRow.brand, firstRow.period, field.name, e.target.value)}
                                                                        style={{
                                                                            width: '100%', padding: '0.4rem 0.6rem',
                                                                            borderRadius: '8px', border: '1px solid var(--border-medium)',
                                                                            fontSize: '0.8rem', fontWeight: 700, outline: 'none',
                                                                            background: 'white', color: 'var(--text-main)',
                                                                            borderColor: isShared ? '#93c5fd' : 'var(--border-medium)'
                                                                        }}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Column 5: Cálculo live + botón guardar */}
                                            <td style={{ padding: '1rem 1rem', verticalAlign: 'top' }}>
                                                {isMultiBrandGroup ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                        {group.map(row => {
                                                            const details = getRowDetails(row);
                                                            const rowSt = rowSaveStatus[row.key];
                                                            return (
                                                                <div key={row.brand} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                    <button
                                                                        onClick={() => handleSaveRow(row)}
                                                                        disabled={!details.isComplete || rowSt === 'saving'}
                                                                        style={{
                                                                            padding: '0.3rem 0.7rem', borderRadius: '8px', border: 'none',
                                                                            fontSize: '0.7rem', fontWeight: 800,
                                                                            background: rowSt === 'success' ? '#dcfce7' : rowSt === 'error' ? '#fee2e2' : details.isComplete ? 'var(--brand)' : '#e2e8f0',
                                                                            color: rowSt === 'success' ? '#166534' : rowSt === 'error' ? '#991b1b' : details.isComplete ? 'white' : '#94a3b8',
                                                                            cursor: details.isComplete && rowSt !== 'saving' ? 'pointer' : 'not-allowed',
                                                                            whiteSpace: 'nowrap', transition: 'all 0.2s'
                                                                        }}
                                                                    >
                                                                        {rowSt === 'success' ? '✓' : rowSt === 'error' ? '✗' : rowSt === 'saving' ? '...' : '⬆ Guardar'}
                                                                    </button>
                                                                    {details.liveVal !== null && (
                                                                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: details.semaphore === 'green' ? '#059669' : details.semaphore === 'red' ? '#dc2626' : '#f59e0b' }}>
                                                                            {details.liveVal} {kpi.unit}
                                                                        </span>
                                                                    )}
                                                                    {details.liveVal === null && (
                                                                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Faltan datos</span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (() => {
                                                    const details = getRowDetails(firstRow);
                                                    const rowSt = rowSaveStatus[firstRow.key];
                                                    return (
                                                        <div>
                                                            <div style={{ marginBottom: '0.5rem' }}>
                                                                <button
                                                                    onClick={() => handleSaveRow(firstRow)}
                                                                    disabled={!details.isComplete || rowSt === 'saving'}
                                                                    title={details.isComplete ? 'Guardar este KPI' : 'Completa todos los campos para guardar'}
                                                                    style={{
                                                                        padding: '0.3rem 0.7rem', borderRadius: '8px', border: 'none',
                                                                        fontSize: '0.7rem', fontWeight: 800,
                                                                        background: rowSt === 'success' ? '#dcfce7' : rowSt === 'error' ? '#fee2e2' : details.isComplete ? 'var(--brand)' : '#e2e8f0',
                                                                        color: rowSt === 'success' ? '#166534' : rowSt === 'error' ? '#991b1b' : details.isComplete ? 'white' : '#94a3b8',
                                                                        cursor: details.isComplete && rowSt !== 'saving' ? 'pointer' : 'not-allowed',
                                                                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                                        transition: 'all 0.2s', whiteSpace: 'nowrap'
                                                                    }}
                                                                >
                                                                    {rowSt === 'saving' ? <RefreshCw size={10} className="spin" /> : <Save size={10} />}
                                                                    {rowSt === 'success' ? '¡Guardado!' : rowSt === 'error' ? 'Error' : 'Guardar'}
                                                                </button>
                                                            </div>
                                                            {details.liveVal !== null ? (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                    <div>
                                                                        <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-main)' }}>
                                                                            {kpi.unit === '$' && '$'}
                                                                            {kpi.unit === '$' ? formatNumber(details.liveVal, 0) : (kpi.unit === '%' ? formatNumber(details.liveVal, 2) : formatNumber(details.liveVal, 0))}
                                                                            {kpi.unit !== '$' && kpi.unit}
                                                                        </div>
                                                                        <div style={{
                                                                            fontSize: '0.7rem', fontWeight: 800,
                                                                            color: details.semaphore === 'green' ? 'var(--success)' : (details.semaphore === 'yellow' ? 'var(--warning)' : 'var(--danger)')
                                                                        }}>
                                                                            {details.compliance}% cumpl.
                                                                        </div>
                                                                    </div>
                                                                    <div style={{
                                                                        width: '10px', height: '10px', borderRadius: '50%',
                                                                        background: details.semaphore === 'green' ? 'var(--success)' : (details.semaphore === 'yellow' ? 'var(--warning)' : 'var(--danger)')
                                                                    }} />
                                                                </div>
                                                            ) : (
                                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <AlertTriangle size={12} /> Faltan datos
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer Area */}
                <div style={{
                    padding: '1.5rem 2.5rem', borderTop: '1px solid var(--border-soft)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'var(--bg-soft)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Info size={16} color="var(--brand)" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            Los campos marcados con 🔗 propagan sus datos a otros KPIs del mismo mes/marca automáticamente.
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {saveStatus.state !== 'idle' && (
                            <div style={{
                                fontSize: '0.85rem', fontWeight: 700,
                                color: saveStatus.state === 'saving' ? 'var(--text-main)' : (saveStatus.state === 'success' ? 'var(--success)' : 'var(--danger)'),
                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}>
                                {saveStatus.state === 'saving' && <RefreshCw size={14} className="spin" />}
                                {saveStatus.message}
                            </div>
                        )}

                        {!isInline && (
                            <button
                                onClick={onCancel}
                                disabled={saveStatus.state === 'saving'}
                                style={{
                                    padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid var(--border-medium)',
                                    background: 'white', color: 'var(--text-muted)', fontWeight: 800, cursor: 'pointer',
                                    transition: 'all 0.2s', fontSize: '0.85rem'
                                }}
                                onMouseOver={e => !e.currentTarget.disabled && (e.currentTarget.style.background = 'var(--bg-hover)')}
                                onMouseOut={e => e.currentTarget.style.background = 'white'}
                            >
                                CANCELAR
                            </button>
                        )}

                        <button
                            onClick={handleSaveAll}
                            disabled={saveStatus.state === 'saving' || filteredRows.length === 0}
                            style={{
                                padding: '0.75rem 2rem', borderRadius: '12px', border: 'none',
                                background: 'var(--brand)', color: 'white', fontWeight: 900,
                                fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                opacity: (saveStatus.state === 'saving' || filteredRows.length === 0) ? 0.6 : 1,
                                cursor: (saveStatus.state === 'saving' || filteredRows.length === 0) ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
                            }}
                        >
                            <Save size={16} /> GUARDAR TODO
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkKPIDataGrid;
