export const exportToCSV = (data, fileName = 'export_kpis') => {
    if (!data || !data.length) return;

    const headers = [
        'Indicador',
        'Área',
        'Empresa',
        'Meta Principal',
        'Valor Actual',
        'Cumplimiento (%)',
        'Frecuencia',
        'Responsable'
    ];

    const rows = data.map(item => [
        item.name,
        item.area,
        item.company || 'GLOBAL',
        item.targetMeta || item.meta,
        item.currentValue,
        `${item.compliance || 0}%`,
        item.frecuencia,
        item.responsable
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(value =>
            typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
