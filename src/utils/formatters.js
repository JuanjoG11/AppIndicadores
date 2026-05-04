// Formateo simple y profesional
export const formatNumber = (value, decimals = 0) => {
    if (value === null || value === undefined) return 'N/D';
    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
};

export const formatPercent = (value, decimals = 1) => {
    if (value === null || value === undefined) return 'N/D';
    return `${formatNumber(value, decimals)}%`;
};

export const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/D';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

export const formatKPIValue = (value, unit) => {
    if (value === null || value === undefined) return 'Sin datos';

    const formattedValue = formatNumber(value, unit === '%' ? 2 : 0);

    switch (unit) {
        case '%':
            return `${formattedValue}%`;
        case '$':
            return formatCurrency(value);
        case 'pedidos':
        case 'cantidad':
        case 'arqueos':
        case 'veces':
        case 'actividades':
            return formattedValue;
        case 'segundos':
            return `${formattedValue} seg`;
        case 'horas':
            return `${formattedValue} hrs`;
        case 'días':
            return `${formattedValue} días`;
        default:
            return `${formattedValue} ${unit || ''}`;
    }
};

export const getSemaphoreClass = (status) => {
    switch (status) {
        case 'green':
            return 'semaphore-green';
        case 'yellow':
            return 'semaphore-yellow';
        case 'red':
            return 'semaphore-red';
        default:
            return '';
    }
};

export const getSemaphoreEmoji = (status) => {
    switch (status) {
        case 'green':
            return '🟢';
        case 'yellow':
            return '🟡';
        case 'red':
            return '🔴';
        default:
            return '⚪';
    }
};

export const getBadgeClass = (status) => {
    switch (status) {
        case 'green':
            return 'badge-success';
        case 'yellow':
            return 'badge-warning';
        case 'red':
            return 'badge-danger';
        default:
            return 'badge-primary';
    }
};
export const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Nunca';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(date);
};

export const getKPIDeadline = (frequency) => {
    const today = new Date();
    const now = new Date();
    const day = now.getDate();

    const cleanFrequency = frequency?.toUpperCase();
    switch (cleanFrequency) {
        case 'DIARIO':
        case 'DIARIA':
            const EOD = new Date(today.setHours(23, 59, 0, 0));
            return EOD;
        case 'SEMANAL':
            // Próximo viernes a las 17:00
            // Si es sábado o domingo, podríamos mostrar el viernes pasado como gracia,
            // pero por ahora mantenemos el próximo viernes según flujo semanal.
            const nextFriday = new Date();
            nextFriday.setDate(today.getDate() + (5 + 7 - today.getDay()) % 7);
            nextFriday.setHours(17, 0, 0, 0);
            return nextFriday;
        case 'QUINCENAL':
            // Grace period: hasta el día 5 del mes para el cierre anterior, 
            // y hasta el 20 para la primera quincena.
            if (day <= 5) {
                // Último día del mes pasado
                return new Date(today.getFullYear(), today.getMonth(), 0, 23, 59);
            }
            if (day >= 16 && day <= 20) {
                // Día 15 del mes actual (primera quincena)
                return new Date(today.getFullYear(), today.getMonth(), 15, 23, 59);
            }
            // Día 15 o último día del mes
            const mid = new Date(today.getFullYear(), today.getMonth(), 15, 23, 59);
            if (now > mid) {
                return new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59);
            }
            return mid;
        case 'MENSUAL':
            // Grace period: hasta el día 5 del mes siguiente para reportar el mes anterior
            if (day <= 5) {
                return new Date(today.getFullYear(), today.getMonth(), 0, 23, 59);
            }
            // Último día del mes corriente
            return new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59);
        case 'BIMESTRAL':
            // Cada dos meses (pares)
            const month = today.getMonth();
            const nextBim = month % 2 === 0 ? month + 2 : month + 1;
            return new Date(today.getFullYear(), nextBim, 0, 23, 59);
        default:
            return null;
    }
};

export const checkIsUrgent = (deadline) => {
    if (!deadline) return false;
    const now = new Date();
    const diff = deadline - now;
    const hours = diff / (1000 * 60 * 60);
    return hours > 0 && hours < 24; // Less than 24 hours remaining
};

export const checkIsExpired = (deadline) => {
    if (!deadline) return false;
    const now = new Date();
    return now > deadline;
};

export const formatDeadline = (date) => {
    if (!date) return 'Sin fecha límite';
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    const options = { day: '2-digit', month: '2-digit' };
    if (isToday) return `HOY ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;

    return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};
export const formatPeriod = (periodStr) => {
    if (!periodStr) return '';
    // YYYY-MM
    if (/^\d{4}-\d{2}$/.test(periodStr)) {
        const [year, month] = periodStr.split('-');
        const date = new Date(year, month - 1, 1);
        return date.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();
    }
    // YYYY-MM-QX (Quincenal)
    if (/^\d{4}-\d{2}-Q[12]$/.test(periodStr)) {
        const [year, month, q] = periodStr.split('-');
        const date = new Date(year, month - 1, 1);
        const monthName = date.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
        return `${q === 'Q1' ? '1RA' : '2DA'} QUINCENA ${monthName} ${year}`;
    }
    // YYYY-WXX (Semanal)
    if (/^\d{4}-W\d{1,2}$/.test(periodStr)) {
        const [year, week] = periodStr.split('-W');
        return `SEMANA ${week} DE ${year}`;
    }
    return periodStr;
};
