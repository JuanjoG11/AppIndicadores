/**
 * ExportService - Servicio de exportación mejorado
 * Soporta CSV y PDF (sin dependencias externas)
 */

// ─── CSV Export ──────────────────────────────────────────────────────────────
export const exportToCSV = (data, fileName = 'export_kpis') => {
    if (!data || !data.length) return;

    const headers = [
        'Indicador', 'Área', 'Empresa', 'Meta Principal',
        'Valor Actual', 'Cumplimiento (%)', 'Semáforo',
        'Frecuencia', 'Responsable'
    ];

    const SEMAPHORE_LABELS = { green: 'Verde', yellow: 'Amarillo', red: 'Rojo', gray: 'Sin datos' };

    const rows = data.map(item => [
        item.name,
        item.area,
        item.company || 'GLOBAL',
        item.targetMeta ?? item.meta,
        item.currentValue ?? 'N/A',
        item.compliance != null ? `${item.compliance}%` : 'N/A',
        SEMAPHORE_LABELS[item.semaphore] || 'N/A',
        item.frecuencia,
        item.responsable
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(value =>
            typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(','))
    ].join('\n');

    _downloadBlob(
        new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }),
        `${fileName}_${_dateStamp()}.csv`
    );
};

// ─── PDF Executive Report ────────────────────────────────────────────────────
/**
 * Genera un PDF ejecutivo en HTML usando la API nativa del navegador (window.print).
 * No requiere librerías externas (jsPDF, pdfmake, etc.).
 */
export const exportToPDF = (kpiData, company = 'TYM', companyFull = 'Tiendas y Marcas', areaName = null) => {
    const titleLabel = areaName ? `Reporte de Área: ${areaName}` : 'Reporte Ejecutivo ZENTRA';
    const now = new Date();
    const dateLabel = now.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeLabel = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

    // Procesamos todos los KPIs del área/empresa para el reporte
    const dataKPIs = kpiData;
    const green = dataKPIs.filter(k => k.semaphore === 'green' && k.hasData).length;
    const yellow = dataKPIs.filter(k => k.semaphore === 'yellow' && k.hasData).length;
    const red = dataKPIs.filter(k => k.semaphore === 'red' && k.hasData).length;

    // El promedio global debe ser consistente con la lógica de gestión (divide por total)
    const overall = dataKPIs.length > 0
        ? Math.round(dataKPIs.reduce((s, k) => s + (k.hasData ? (k.compliance || 0) : 0), 0) / dataKPIs.length)
        : 0;

    const semLabel = { green: '🟢 Verde', yellow: '🟡 Amarillo', red: '🔴 Rojo', gray: '⚪ Pendiente' };
    const semColor = { green: '#10b981', yellow: '#f59e0b', red: '#ef4444', gray: '#cbd5e1' };

    const areaLabels = {
        'logistica': 'Logística',
        'comercial': 'Comercial',
        'caja': 'Caja',
        'cartera': 'Cartera',
        'contabilidad': 'Contabilidad',
        'talento-humano': 'Gestión Humana',
        'administrativo': 'Información e Inventario'
    };

    // Agrupar KPIs por área para el reporte
    const kpisByArea = dataKPIs.reduce((acc, kpi) => {
        const areaId = kpi.area || 'Otros';
        const areaName = areaLabels[areaId] || areaId;
        if (!acc[areaName]) acc[areaName] = [];
        acc[areaName].push(kpi);
        return acc;
    }, {});

    const sections = Object.entries(kpisByArea).map(([areaName, kpis]) => {
        const areaRows = kpis.map(k => {
            const compl = k.hasData ? (k.compliance || 0) : 0;
            const color = k.hasData ? (semColor[k.semaphore] || '#94a3b8') : '#cbd5e1';
            const status = k.hasData ? (semLabel[k.semaphore] || '--') : '⚪ Pendiente';

            return `
                <tr>
                    <td style="padding:12px;border-bottom:1px solid #f1f5f9;font-weight:600;color:#1e293b;font-size:12px;">${k.name}</td>
                    <td style="padding:12px;border-bottom:1px solid #f1f5f9;text-align:center;">
                        ${k.hasData ? `<strong>${k.currentValue} ${k.unit || ''}</strong>` : '<span style="color:#cbd5e1;">--</span>'}
                    </td>
                    <td style="padding:12px;border-bottom:1px solid #f1f5f9;text-align:center;color:#64748b;">
                        ${k.targetMeta != null ? `${k.targetMeta} ${k.unit || ''}` : '--'}
                    </td>
                    <td style="padding:12px;border-bottom:1px solid #f1f5f9;text-align:center;">
                        <strong style="color:${color}">${compl}%</strong>
                    </td>
                    <td style="padding:12px;border-bottom:1px solid #f1f5f9;text-align:center;color:${color};font-weight:700;font-size:11px;">
                        ${status}
                    </td>
                </tr>
            `;
        }).join('');

        return `
            <div style="margin-bottom:16px;">
                <h3 style="font-size:11px;font-weight:900;color:#1e293b;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px;padding-left:4px;border-left:3px solid #2563eb;">
                    ÁREA: ${areaName.toUpperCase()}
                </h3>
                <table style="width:100%;border-collapse:collapse;font-size:11px;background:white;border:1px solid #e2e8f0;">
                    <thead>
                        <tr style="background:#f8fafc;">
                            <th style="padding:6px 10px;text-align:left;font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:2px solid #e2e8f0;width:45%;">Indicador</th>
                            <th style="padding:6px 10px;text-align:center;font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:2px solid #e2e8f0;">Actual</th>
                            <th style="padding:6px 10px;text-align:center;font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:2px solid #e2e8f0;">Meta</th>
                            <th style="padding:6px 10px;text-align:center;font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:2px solid #e2e8f0;">Cumpl.</th>
                            <th style="padding:6px 10px;text-align:center;font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:2px solid #e2e8f0;">Estado</th>
                        </tr>
                    </thead>
                    <tbody>${areaRows}</tbody>
                </table>
            </div>
        `;
    }).join('');

    const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>${titleLabel} – ${company}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: white; padding: 20px; }
                @media print {
                    @page { size: A4 portrait; margin: 0.8cm; }
                    .no-print { display: none; }
                }
                tr { page-break-inside: avoid; }
            </style>
        </head>
        <body>
            <!-- Header Compact -->
            <div style="background:#0f172a;color:white;padding:16px 24px;border-radius:8px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <h1 style="font-size:18px;font-weight:900;letter-spacing:-0.02em;">${titleLabel.toUpperCase()}</h1>
                    <p style="font-size:11px;opacity:0.8;">${companyFull} · ${company}</p>
                </div>
                <div style="text-align:right;">
                    <p style="font-size:10px;opacity:0.7;">Generado: ${dateLabel} · ${timeLabel}</p>
                </div>
            </div>

            <!-- Summary cards Compact -->
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;">
                ${[
            { label: 'Cumplimiento', value: overall + '%', color: '#2563eb', bg: '#eff6ff' },
            { label: 'Verde', value: green, color: '#10b981', bg: '#ecfdf5' },
            { label: 'Amarillo', value: yellow, color: '#f59e0b', bg: '#fffbeb' },
            { label: 'Rojo', value: red, color: '#ef4444', bg: '#fef2f2' },
        ].map(c => `
                    <div style="background:${c.bg};border:1px solid ${c.color}30;border-radius:8px;padding:10px 14px;text-align:center;">
                        <p style="font-size:8px;font-weight:800;color:${c.color};text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px;">${c.label}</p>
                        <p style="font-size:18px;font-weight:900;color:${c.color};">${c.value}</p>
                    </div>
                `).join('')}
            </div>

            <!-- KPI Sections -->
            <div style="width:100%;">
                ${sections}
            </div>

            <!-- Print button (not printed) -->
            <div class="no-print" style="margin:32px 40px;text-align:center;">
                <button onclick="window.print()" style="background:#2563eb;color:white;border:none;padding:12px 32px;border-radius:12px;font-size:14px;font-weight:800;cursor:pointer;">
                    🖨️ Imprimir / Guardar como PDF
                </button>
                <button onclick="window.close()" style="margin-left:12px;background:#f1f5f9;color:#475569;border:none;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;">
                    Cerrar
                </button>
            </div>

            <div style="margin:0 40px 40px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center;">
                ZENTRA BI © ${now.getFullYear()} · Generado el ${dateLabel} a las ${timeLabel} hrs · Confidencial
            </div>
        </body>
        </html>
    `;

    const win = window.open('', '_blank', 'width=1200,height=800');
    if (win) {
        win.document.write(html);
        win.document.close();
        // Auto-trigger print after a small delay so the browser renders first
        setTimeout(() => win.print(), 800);
    }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const _dateStamp = () => new Date().toISOString().split('T')[0];

const _downloadBlob = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
