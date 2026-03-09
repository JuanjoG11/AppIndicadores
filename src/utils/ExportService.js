/**
 * ExportService - Servicio de exportación mejorado
 * Soporta CSV y PDF (sin dependencias externas)
 */

import { BRAND_TO_ENTITY } from '../utils/kpiHelpers';

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
export const exportToPDF = (kpiData, company = 'TYM', companyFull = 'Tiendas y Marcas', areaName = null, selectedBrand = 'all') => {
    const brandLabel = selectedBrand !== 'all' ? ` - Marca: ${selectedBrand}` : ' - Consolidado';
    const titleLabel = areaName ? `Reporte de Área: ${areaName}${brandLabel}` : `Reporte Ejecutivo ZENTRA${brandLabel}`;
    const now = new Date();
    const dateLabel = now.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeLabel = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

    const dataKPIs = kpiData;
    const green = dataKPIs.filter(k => k.semaphore === 'green' && k.hasData).length;
    const yellow = dataKPIs.filter(k => k.semaphore === 'yellow' && k.hasData).length;
    const red = dataKPIs.filter(k => k.semaphore === 'red' && k.hasData).length;

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

    const kpisByArea = dataKPIs.reduce((acc, kpi) => {
        const areaId = kpi.area || 'Otros';
        const areaName = areaLabels[areaId] || areaId;
        if (!acc[areaName]) acc[areaName] = [];
        acc[areaName].push(kpi);
        return acc;
    }, {});

    const sections = Object.entries(kpisByArea).map(([areaName, kpis]) => {
        const areaRows = [];

        kpis.forEach(k => {
            const hasMultipleBrands = k.meta && typeof k.meta === 'object';

            if (selectedBrand === 'all' && hasMultipleBrands) {
                Object.keys(k.meta).forEach(brand => {
                    if (BRAND_TO_ENTITY[brand] !== company) return;

                    const dataKey = `${company}-${brand}`;
                    const bData = k.brandValues?.[dataKey] || {};
                    const compl = bData.compliance || 0;
                    const val = bData.value ?? '--';
                    const target = k.meta[brand] ?? '--';
                    const sem = bData.semaphore || 'gray';
                    const color = sem === 'green' ? '#10b981' : sem === 'red' ? '#ef4444' : sem === 'yellow' ? '#f59e0b' : '#cbd5e1';
                    const status = sem === 'green' ? '🟢 Verde' : sem === 'red' ? '🔴 Rojo' : sem === 'yellow' ? '🟡 Amarillo' : '⚪ Pendiente';

                    let calculationDetail = '';
                    const addData = bData.additionalData;
                    if (addData && Object.keys(addData).length > 2) {
                        const inputs = Object.entries(addData)
                            .filter(([key]) => !['brand', 'company', 'updatedAt', 'type', 'newMeta'].includes(key))
                            .map(([key, val]) => {
                                const label = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').toUpperCase();
                                const formattedVal = typeof val === 'number' ? (val > 1000 ? `$${val.toLocaleString()}` : val) : val;
                                return `<span style="color:#64748b;margin-right:8px;">${label}: <strong style="color:#334155;">${formattedVal}</strong></span>`;
                            }).join(' | ');

                        if (inputs) {
                            calculationDetail = `<div style="margin-top:4px;font-size:8px;background:#f8fafc;padding:3px 6px;border-radius:4px;border:1px solid #f1f5f9;">${inputs}</div>`;
                        }
                    }

                    areaRows.push(`
                        <tr>
                            <td style="padding:10px;border-bottom:1px solid #f1f5f9;font-size:11px;">
                                <div style="font-weight:700;color:#1e293b;">${k.name}</div>
                                <div style="font-size:9px;color:#2563eb;font-weight:800;text-transform:uppercase;">MARCA: ${brand}</div>
                                ${calculationDetail}
                            </td>
                            <td style="padding:10px;border-bottom:1px solid #f1f5f9;text-align:center;font-size:11px;">
                                <strong>${val}</strong>
                            </td>
                            <td style="padding:10px;border-bottom:1px solid #f1f5f9;text-align:center;color:#64748b;font-size:11px;">
                                ${target}
                            </td>
                            <td style="padding:10px;border-bottom:1px solid #f1f5f9;text-align:center;">
                                <strong style="color:${color};font-size:11px;">${compl}%</strong>
                            </td>
                            <td style="padding:10px;border-bottom:1px solid #f1f5f9;text-align:center;color:${color};font-weight:700;font-size:10px;">
                                ${status}
                            </td>
                        </tr>
                    `);
                });
            } else {
                const isBrandSpecific = hasMultipleBrands && selectedBrand !== 'all';
                const dataKey = isBrandSpecific ? `${company}-${selectedBrand}` : null;
                const bData = isBrandSpecific ? (k.brandValues?.[dataKey] || {}) : {};

                const compl = isBrandSpecific ? (bData.compliance || 0) : (k.hasData ? (k.compliance || 0) : 0);
                const currentVal = isBrandSpecific ? (bData.value ?? '--') : (k.hasData ? `${k.currentValue} ${k.unit || ''}` : '--');
                const metaVal = isBrandSpecific ? (k.meta[selectedBrand] ?? '--') : (k.targetMeta ?? k.meta ?? '--');
                const sem = isBrandSpecific ? (bData.semaphore || 'gray') : k.semaphore;
                const color = sem === 'green' ? '#10b981' : sem === 'red' ? '#ef4444' : sem === 'yellow' ? '#f59e0b' : '#cbd5e1';
                const status = sem === 'green' ? '🟢 Verde' : sem === 'red' ? '🔴 Rojo' : sem === 'yellow' ? '🟡 Amarillo' : '⚪ Pendiente';

                let calculationDetail = '';
                if (k.additionalData && Object.keys(k.additionalData).length > 2) {
                    const inputs = Object.entries(k.additionalData)
                        .filter(([key]) => !['brand', 'company', 'updatedAt', 'type', 'newMeta'].includes(key))
                        .map(([key, val]) => {
                            const label = key.replace(/([A-Z])/g, ' $1').replace(/_/, ' ').toUpperCase();
                            const formattedVal = typeof val === 'number' ? (val > 1000 ? `$${val.toLocaleString()}` : val) : val;
                            return `<span style="color:#64748b;margin-right:8px;">${label}: <strong style="color:#334155;">${formattedVal}</strong></span>`;
                        }).join(' | ');

                    if (inputs) {
                        calculationDetail = `<div style="margin-top:4px;font-size:8px;background:#f8fafc;padding:3px 6px;border-radius:4px;border:1px solid #f1f5f9;">${inputs}</div>`;
                    }
                }

                areaRows.push(`
                    <tr>
                        <td style="padding:10px;border-bottom:1px solid #f1f5f9;font-size:11px;">
                            <div style="font-weight:700;color:#1e293b;">${k.name}</div>
                            ${isBrandSpecific ? `<div style="font-size:9px;color:#2563eb;font-weight:800;text-transform:uppercase;">MARCA: ${selectedBrand}</div>` : ''}
                            ${calculationDetail}
                        </td>
                        <td style="padding:10px;border-bottom:1px solid #f1f5f9;text-align:center;font-size:11px;">
                            <strong>${currentVal}</strong>
                        </td>
                        <td style="padding:10px;border-bottom:1px solid #f1f5f9;text-align:center;color:#64748b;font-size:11px;">
                            ${metaVal} ${!isBrandSpecific ? (k.unit || '') : ''}
                        </td>
                        <td style="padding:10px;border-bottom:1px solid #f1f5f9;text-align:center;">
                            <strong style="color:${color};font-size:11px;">${compl}%</strong>
                        </td>
                        <td style="padding:10px;border-bottom:1px solid #f1f5f9;text-align:center;color:${color};font-weight:700;font-size:10px;">
                            ${status}
                        </td>
                    </tr>
                `);
            }
        });

        return `
            <div style="margin-bottom:16px;">
                <h3 style="font-size:11px;font-weight:900;color:#1e293b;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px;padding-left:4px;border-left:3px solid #2563eb;">
                    ÁREA: ${areaName.toUpperCase()}
                </h3>
                <table style="width:100%;border-collapse:collapse;font-size:11px;background:white;border:1px solid #e2e8f0;">
                    <thead>
                        <tr style="background:#f8fafc;">
                            <th style="padding:6px 10px;text-align:left;font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:2px solid #e2e8f0;width:45%;">Indicador / Marca</th>
                            <th style="padding:6px 10px;text-align:center;font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:2px solid #e2e8f0;">Actual</th>
                            <th style="padding:6px 10px;text-align:center;font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:2px solid #e2e8f0;">Meta</th>
                            <th style="padding:6px 10px;text-align:center;font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:2px solid #e2e8f0;">Cumpl.</th>
                            <th style="padding:6px 10px;text-align:center;font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;border-bottom:2px solid #e2e8f0;">Estado</th>
                        </tr>
                    </thead>
                    <tbody>${areaRows.join('')}</tbody>
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
            <div style="background:#0f172a;color:white;padding:20px 24px;border-radius:12px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <h1 style="font-size:20px;font-weight:900;letter-spacing:-0.02em;margin-bottom:4px;">${titleLabel.toUpperCase()}</h1>
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span style="background:#2563eb;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:800;">REPORTE OFICIAL</span>
                        <p style="font-size:12px;font-weight:700;opacity:0.9;">${companyFull} · ${company}</p>
                    </div>
                </div>
                <div style="text-align:right;">
                    <p style="font-size:10px;opacity:0.7;margin-bottom:2px;">ZENTRA BI ANALYTICS</p>
                    <p style="font-size:10px;font-weight:800;opacity:0.9;">${dateLabel} · ${timeLabel}</p>
                </div>
            </div>

            <!-- Summary cards Compact -->
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;">
                ${[
            { label: 'CUMPLIMIENTO', value: overall + '%', color: '#2563eb', bg: '#eff6ff' },
            { label: 'EN VERDE', value: green, color: '#10b981', bg: '#ecfdf5' },
            { label: 'EN AMARILLO', value: yellow, color: '#f59e0b', bg: '#fffbeb' },
            { label: 'EN ROJO', value: red, color: '#ef4444', bg: '#fef2f2' },
        ].map(c => `
                    <div style="background:${c.bg};border:1px solid ${c.color}20;border-radius:10px;padding:12px;text-align:center;">
                        <p style="font-size:8px;font-weight:800;color:${c.color};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">${c.label}</p>
                        <p style="font-size:20px;font-weight:900;color:${c.color};">${c.value}</p>
                    </div>
                `).join('')}
            </div>

            <div style="width:100%;">
                ${sections}
            </div>

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
        setTimeout(() => win.print(), 800);
    }
};

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
