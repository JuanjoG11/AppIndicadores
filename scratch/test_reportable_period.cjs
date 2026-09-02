const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function getISOWeekNumber(d) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

function getReportablePeriod(frecuencia) {
    const now = new Date();
    const freq = (frecuencia || 'MENSUAL').toUpperCase();

    if (freq === 'DIARIO' || freq === 'DIARIA') {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
    }
    if (freq === 'SEMANAL') {
        // Semana anterior
        const prevWeek = new Date(now);
        prevWeek.setDate(now.getDate() - 7);
        const w = getISOWeekNumber(prevWeek);
        return `${prevWeek.getFullYear()}-W${String(w).padStart(2, '0')}`;
    }
    if (freq === 'QUINCENAL') {
        // Quincena anterior: si estamos en Q1 (días 1-15), el reportable es Q2 del mes anterior
        const day = now.getDate();
        if (day <= 15) {
            const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const m = String(prevMonthDate.getMonth() + 1).padStart(2, '0');
            return `${prevMonthDate.getFullYear()}-${m}-Q2`;
        } else {
            const m = String(now.getMonth() + 1).padStart(2, '0');
            return `${now.getFullYear()}-${m}-Q1`;
        }
    }
    // MENSUAL, BIMESTRAL, SEMESTRAL -> Mes vencido (anterior)
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const m = String(prevMonthDate.getMonth() + 1).padStart(2, '0');
    return `${prevMonthDate.getFullYear()}-${m}`;
}

function toMonthKey(s) {
    if (!s) return null;
    s = String(s);
    if (/^\d{4}-\d{2}$/.test(s)) return s;
    if (/^\d{4}-\d{2}[-_]/.test(s)) return s.substring(0, 7);
    if (/^\d{4}-W\d{1,2}$/.test(s)) {
        // Calculate month for ISO week
        const parts = s.split('-W');
        const year = parseInt(parts[0], 10);
        const week = parseInt(parts[1], 10);
        const simple = new Date(year, 0, 1 + (week - 1) * 7);
        const dow = simple.getDay();
        const isoStart = new Date(simple);
        if (dow <= 4) isoStart.setDate(simple.getDate() - simple.getDay() + 1);
        else isoStart.setDate(simple.getDate() + 8 - simple.getDay());
        isoStart.setDate(isoStart.getDate() + 3);
        return `${isoStart.getFullYear()}-${String(isoStart.getMonth() + 1).padStart(2, '0')}`;
    }
    return s.substring(0, 7);
}

console.log("Today:", new Date().toISOString());
console.log("Reportable MENSUAL:", getReportablePeriod('MENSUAL'), "-> monthKey:", toMonthKey(getReportablePeriod('MENSUAL')));
console.log("Reportable SEMANAL:", getReportablePeriod('SEMANAL'), "-> monthKey:", toMonthKey(getReportablePeriod('SEMANAL')));
console.log("Reportable QUINCENAL:", getReportablePeriod('QUINCENAL'), "-> monthKey:", toMonthKey(getReportablePeriod('QUINCENAL')));
console.log("Reportable DIARIO:", getReportablePeriod('DIARIO'), "-> monthKey:", toMonthKey(getReportablePeriod('DIARIO')));
