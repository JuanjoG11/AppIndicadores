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
