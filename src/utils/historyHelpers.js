import { isInverseKPI } from './kpiCalculations';

// Normaliza cualquier período granular a YYYY-MM
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

/**
 * Calculate the historical trend for a set of KPIs.
 * Uses toMonthKey to normalize all granular periods to YYYY-MM.
 */
export const calculateHistoricalTrend = (kpis, company = null) => {
    const filteredKpis = company
        ? kpis.filter(kpi => kpi.history?.some(h => {
            const mk = toMonthKey(h.monthKey || h.month);
            return mk && (h[company] != null || Object.keys(h).some(k => k.startsWith(`${company}-`) && !k.endsWith('-COMP') && !k.endsWith('-SEM')));
        }))
        : kpis;

    if (filteredKpis.length === 0) return [];

    const monthAccum = {};
    const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    filteredKpis.forEach(kpi => {
        (kpi.history || []).forEach(h => {
            const mk = toMonthKey(h.monthKey || h.month);
            if (!mk) return;
            if (!monthAccum[mk]) monthAccum[mk] = { total: 0, count: 0 };

            const targetMeta = (kpi.meta && typeof kpi.meta === 'object')
                ? (company ? (kpi.meta[company] || Object.values(kpi.meta)[0]) : Object.values(kpi.meta)[0])
                : kpi.meta;
            if (!targetMeta) return;

            const val = company ? h[company] : (h.TYM ?? h.TAT);
            if (val == null) return;

            const isInverse = isInverseKPI(kpi.id);
            let compliance;
            if (targetMeta === 0) {
                compliance = isInverse ? (val === 0 ? 100 : 0) : (val > 0 ? 100 : 0);
            } else {
                compliance = isInverse ? (val === 0 ? 100 : Math.min((targetMeta / val) * 100, 100)) : Math.min((val / targetMeta) * 100, 100);
            }

            if (!isNaN(compliance)) {
                monthAccum[mk].total += compliance;
                monthAccum[mk].count++;
            }
        });
    });

    return Object.entries(monthAccum)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([mk, { total, count }]) => ({
            month: MONTH_NAMES[parseInt(mk.split('-')[1]) - 1] || mk,
            monthKey: mk,
            score: count > 0 ? Math.round(total / count) : 0
        }));
};

/**
 * Prepares data for a multi-line chart comparing companies
 */
export const getComparisonTrend = (kpis) => {
    const tymTrend = calculateHistoricalTrend(kpis, 'TYM');
    const tatTrend = calculateHistoricalTrend(kpis, 'TAT');

    const allKeys = new Map();
    [...tymTrend, ...tatTrend].forEach(p => {
        if (!allKeys.has(p.monthKey)) allKeys.set(p.monthKey, p.month);
    });

    return [...allKeys.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([monthKey, month]) => ({
        month,
        monthKey,
        TYM: tymTrend.find(p => p.monthKey === monthKey)?.score ?? null,
        TAT: tatTrend.find(p => p.monthKey === monthKey)?.score ?? null,
    }));
};
