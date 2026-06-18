/**
 * Utilidades para parsear periodos de KPI en cualquier formato:
 *   - Diario:     "2026-06-18"       (YYYY-MM-DD)
 *   - Semanal:    "2026-W25"         (YYYY-Wnn)
 *   - Quincenal:  "2026-06-Q1"       (YYYY-MM-Q1 / Q2)
 *   - Mensual:    "2026-06"          (YYYY-MM)
 *
 * Todas las funciones son puras y nunca mutan datos externos.
 */

const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Dado un string de periodo (cualquier formato) devuelve el nombre
 * del mes en español ("Enero", "Febrero", …) para matchear con history[].month.
 *
 * Si el periodo no se puede parsear, usa `fallbackDate` (ISO string) o la fecha actual.
 */
export function periodToMonthName(period, fallbackDate) {
    if (period) {
        // Quincenal: "2026-06-Q1" o "2026-06-Q2"
        if (period.includes('-Q')) {
            const parts = period.split('-');
            if (parts.length >= 2) {
                const monthIdx = parseInt(parts[1], 10) - 1;
                if (monthIdx >= 0 && monthIdx <= 11) return MONTH_NAMES[monthIdx];
            }
        }

        // Semanal: "2026-W25" → convertir semana ISO a fecha y sacar mes
        if (period.includes('-W')) {
            const parts = period.split('-W');
            if (parts.length === 2) {
                const year = parseInt(parts[0], 10);
                const week = parseInt(parts[1], 10);
                if (!isNaN(year) && !isNaN(week)) {
                    // Aproximación: semana 1 empieza ~4 de enero
                    const d = new Date(year, 0, 4 + (week - 1) * 7);
                    return MONTH_NAMES[d.getMonth()];
                }
            }
        }

        // Diario: "2026-06-18" (3 partes, sin Q ni W)
        if (period.split('-').length === 3 && !period.includes('Q') && !period.includes('W')) {
            const parts = period.split('-');
            const monthIdx = parseInt(parts[1], 10) - 1;
            if (monthIdx >= 0 && monthIdx <= 11) return MONTH_NAMES[monthIdx];
        }

        // Mensual: "2026-06"
        if (/^\d{4}-\d{2}$/.test(period)) {
            const monthIdx = parseInt(period.split('-')[1], 10) - 1;
            if (monthIdx >= 0 && monthIdx <= 11) return MONTH_NAMES[monthIdx];
        }
    }

    // Fallback: usar la fecha de carga (updatedAt) o la fecha actual
    const d = fallbackDate ? new Date(fallbackDate) : new Date();
    return MONTH_NAMES[d.getMonth()];
}

/**
 * Dado un string de periodo (cualquier formato) devuelve la clave
 * "YYYY-MM" normalizada para comparaciones y agrupaciones.
 *
 * Si no se puede parsear, usa `fallbackDate` o la fecha actual.
 */
export function getPeriodKey(period, fallbackDate) {
    if (period) {
        // Quincenal: "2026-06-Q1" → "2026-06"
        if (period.includes('-Q')) {
            const parts = period.split('-');
            if (parts.length >= 2) return `${parts[0]}-${parts[1]}`;
        }

        // Semanal: "2026-W25" → calcular mes
        if (period.includes('-W')) {
            const parts = period.split('-W');
            if (parts.length === 2) {
                const year = parseInt(parts[0], 10);
                const week = parseInt(parts[1], 10);
                if (!isNaN(year) && !isNaN(week)) {
                    const d = new Date(year, 0, 4 + (week - 1) * 7);
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                }
            }
        }

        // Diario: "2026-06-18" → "2026-06"
        if (period.split('-').length === 3 && !period.includes('Q') && !period.includes('W')) {
            const parts = period.split('-');
            return `${parts[0]}-${parts[1]}`;
        }

        // Mensual: "2026-06" → ya está en formato correcto
        if (/^\d{4}-\d{2}$/.test(period)) {
            return period;
        }
    }

    // Fallback
    const d = fallbackDate ? new Date(fallbackDate) : new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Genera un period key por defecto para la fecha actual según la frecuencia del KPI.
 *   - "DIARIO"     → "2026-06-18"
 *   - "SEMANAL"    → "2026-W25"
 *   - "QUINCENAL"  → "2026-06-Q1" o "2026-06-Q2"
 *   - "MENSUAL"    → "2026-06"
 */
export function generateCurrentPeriod(frecuencia) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');

    const freq = (frecuencia || '').toUpperCase();

    if (freq.includes('DIARIO')) {
        const d = String(now.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    if (freq.includes('SEMANAL')) {
        // Calcular número de semana ISO
        const startOfYear = new Date(y, 0, 1);
        const days = Math.floor((now - startOfYear) / 86400000);
        const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        return `${y}-W${String(weekNum).padStart(2, '0')}`;
    }

    if (freq.includes('QUINCENAL')) {
        const q = now.getDate() <= 15 ? 'Q1' : 'Q2';
        return `${y}-${m}-${q}`;
    }

    // Mensual por defecto
    return `${y}-${m}`;
}
