import XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { BRAND_TO_ENTITY } from './kpiHelpers';

// ─── helpers de estilo ───────────────────────────────────────────────────────
const hdr = (rgb = '1E293B') => ({
    fill: { fgColor: { rgb } },
    font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: { bottom: { style: 'medium', color: { rgb: '2563EB' } } },
});

const semFill = { green: 'C6EFCE', yellow: 'FFEB9C', red: 'FFC7CE', gray: 'EFEFEF' };
const semFont = { green: '276221', yellow: '9C5700', red: '9C0006', gray: '757575' };
const semLabel = { green: '✅ CUMPLE TODO', yellow: '⚠️ CON 1 SIN DATO', red: '❌ INDICADOR FALLIDO', gray: '— SIN DATOS' };
const semIcon  = { green: '🟢 Cumple', yellow: '🟡 Sin dato', red: '🔴 No cumple', gray: '🟡 Sin dato' };

const cell = (v, s = {}) => ({ v, s });
const semCell = (text, sem) => cell(text, {
    fill: { fgColor: { rgb: semFill[sem] } },
    font: { bold: true, color: { rgb: semFont[sem] } },
    alignment: { horizontal: 'center' },
});

/** Mapa: cargo (en users.js) → personas reales con sus KPI ids */
const PERSONAS = [
    {
        nombre: 'David Aguirre',       cargo: 'Líder Logístico',            proveedor: 'Alpina · Fleischmann',
        kpiIds: ['indice-devoluciones','promedio-pedidos-auxiliar','promedio-pedidos-carro','gasto-fletes-venta'],
        brands: ['ALPINA','FLEISCHMANN'], company: 'TYM',
    },
    {
        nombre: 'Felipe Murillo',      cargo: 'Líder Logístico',            proveedor: 'Zenú',
        kpiIds: ['indice-devoluciones','promedio-pedidos-auxiliar','promedio-pedidos-carro','gasto-fletes-venta'],
        brands: ['ZENU'], company: 'TYM',
    },
    {
        nombre: 'Sebastián Arias',     cargo: 'Líder Logístico',            proveedor: 'Unilever · Familiar',
        kpiIds: ['indice-devoluciones','promedio-pedidos-auxiliar','promedio-pedidos-carro','gasto-fletes-venta'],
        brands: ['UNILEVER','FAMILIA'], company: 'TAT',
    },
    {
        nombre: 'Carlos Enrique Díaz', cargo: 'Auxiliar de Facturación',    proveedor: 'Alpina',
        kpiIds: ['impresion-facturas','error-facturacion','pedidos-facturados'],
        brands: ['ALPINA'], company: 'TYM',
    },
    {
        nombre: 'Esteban Loaiza',      cargo: 'Auxiliar de Facturación',    proveedor: 'Zenú · Fleischmann',
        kpiIds: ['impresion-facturas','error-facturacion','pedidos-facturados'],
        brands: ['ZENU','FLEISCHMANN'], company: 'TYM',
    },
    {
        nombre: 'Mariana Gallego',     cargo: 'Auxiliar de Facturación',    proveedor: 'Unilever · Familiar',
        kpiIds: ['impresion-facturas','error-facturacion','pedidos-facturados'],
        brands: ['UNILEVER','FAMILIA'], company: 'TAT',
    },
    {
        nombre: 'Anyi Mosquera',       cargo: 'Analista de Abastecimientos',proveedor: 'General',
        kpiIds: ['revision-precios','fiabilidad-inventarios','revision-margenes','exactitud-inventarios'],
        brands: null, company: 'TYM',
    },
    {
        nombre: 'Diana García',        cargo: 'Analista de Cartera',        proveedor: 'General',
        kpiIds: ['cartera-al-dia','cartera-mayor-30','relacion-cartera-ventas'],
        brands: null, company: 'TYM',
    },
    {
        nombre: 'Cristian Ballesteros',cargo: 'Auxiliar Contable',          proveedor: 'General',
        kpiIds: ['conciliaciones-bancarias','arqueos-caja','cierre-planillas'],
        brands: null, company: 'TYM',
    },
    {
        nombre: 'Karina Taba',         cargo: 'Analista de Gestión Humana', proveedor: 'General',
        kpiIds: ['cobertura-vacantes','cumplimiento-sst','actividades-cultura'],
        brands: null, company: 'TYM',
    },
    {
        nombre: 'María José Franco',   cargo: 'Analista de Gestión Humana', proveedor: 'General',
        kpiIds: ['cumplimiento-sst','actividades-cultura'],
        brands: null, company: 'TYM',
    },
    {
        nombre: 'Daniel Arroyave',     cargo: 'Auxiliar de Caja',           proveedor: 'TAT',
        kpiIds: ['cierre-planillas-caja','vales-cuadres','indice-arqueos'],
        brands: null, company: 'TAT',
    },
    {
        nombre: 'Eliana González',     cargo: 'Auxiliar de Caja',           proveedor: 'TYM',
        kpiIds: ['cierre-planillas-caja','vales-cuadres','indice-arqueos'],
        brands: null, company: 'TYM',
    },
    {
        nombre: 'Nataly Molina',       cargo: 'Auxiliar de Caja',           proveedor: 'TYM',
        kpiIds: ['cierre-planillas-caja','vales-cuadres','indice-arqueos'],
        brands: null, company: 'TYM',
    },
    {
        nombre: 'Juan José Colorado',  cargo: 'Software y TI',              proveedor: 'General',
        kpiIds: ['tareas-programadas','mantenimiento-preventivo','efectividad-resolucion'],
        brands: null, company: 'TYM',
    },
    {
        nombre: 'Sandra Milena',       cargo: 'Líder Caja',                 proveedor: 'TYM',
        kpiIds: ['arqueos-caja','indice-arqueos','cierre-planillas-caja','vales-cuadres'],
        brands: null, company: 'TYM',
    },
    {
        nombre: 'Oscar Giraldo',       cargo: 'Contador Principal',         proveedor: 'General',
        kpiIds: ['dias-cierre','ajustes-posteriores','ajustes-revisoria','rotacion-cxc','conciliaciones-bancarias','cierre-planillas','multas-sanciones'],
        brands: null, company: 'TYM',
    },
    {
        nombre: 'Erika Valencia',      cargo: 'TYM y TAT - Talento Humano', proveedor: 'General',
        kpiIds: ['rotacion-personal','indice-ausentismo','cumplimiento-sst','actividades-cultura','cobertura-vacantes'],
        brands: null, company: 'TYM',
    },
];

/**
 * Dado un KPI y una persona, obtiene { meta, resultado, semaforo } desde kpiData.
 * Si la persona tiene marcas específicas, promedia/consolida por marcas.
 */
function resolveKPI(kpi, persona) {
    if (!kpi) return { meta: '—', resultado: '—', semaforo: 'gray' };

    if (persona.brands && persona.brands.length > 0 && kpi.meta && typeof kpi.meta === 'object') {
        // Buscar datos por cada marca de la persona
        const results = persona.brands.map(brand => {
            const key = `${persona.company}-${brand}`;
            const bData = kpi.brandValues?.[key] || {};
            return {
                meta: kpi.meta[brand] ?? kpi.meta[Object.keys(kpi.meta)[0]] ?? '—',
                resultado: bData.hasData ? (bData.currentValue ?? '—') : '—',
                semaforo: bData.hasData ? (bData.semaphore || 'gray') : 'gray',
                compliance: bData.hasData ? (bData.compliance ?? 0) : null,
            };
        });
        // Tomar el peor semáforo entre las marcas
        const semPriority = ['red', 'yellow', 'green', 'gray'];
        const sorted = results.sort((a, b) => semPriority.indexOf(a.semaforo) - semPriority.indexOf(b.semaforo));
        const worst = sorted[0];
        const metaStr = persona.brands.map(b => `${b.substring(0,3)}: ${kpi.meta[b] ?? '?'}`).join(' | ');
        const resStr = results.map((r, i) => `${persona.brands[i].substring(0,3)}: ${r.resultado}`).join(' | ');
        return { meta: metaStr, resultado: resStr, semaforo: worst.semaforo, compliance: worst.compliance };
    }

    // KPI sin marcas
    const meta = kpi.targetMeta ?? (kpi.meta && typeof kpi.meta !== 'object' ? kpi.meta : '—');
    if (!kpi.hasData) return { meta: String(meta), resultado: '—', semaforo: 'gray', compliance: null };
    return {
        meta: String(meta),
        resultado: String(kpi.currentValue ?? '—'),
        semaforo: kpi.semaphore || 'gray',
        compliance: kpi.compliance ?? 0,
    };
}

/** Calcula bonificación: 3 KPIs → $100k c/u, 4+ KPIs → $75k c/u */
function calcBono(totalKpis, cumplidos) {
    const unitario = totalKpis >= 4 ? 75000 : 100000;
    return { unitario, total: cumplidos * unitario };
}

/** Aplica estilo header a fila 0 de una hoja */
function styleHeader(ws, headers, fillRgb = '1E293B') {
    headers.forEach((_, ci) => {
        const ref = XLSX.utils.encode_cell({ r: 0, c: ci });
        if (ws[ref]) ws[ref].s = hdr(fillRgb);
    });
}

/** Agrega ancho a columnas */
function setCols(ws, widths) {
    ws['!cols'] = widths.map(w => ({ wch: w }));
}

/**
 * Genera el Excel de informe mensual idéntico al Informe_KPIs_Junio_2026_Final.xlsx
 * con datos reales de la app.
 *
 * @param {Array}  kpiData    - filteredKPIs del dashboard (ya proyectados al mes)
 * @param {string} company    - 'TYM' | 'TAT' | 'AMBAS'
 * @param {string} monthLabel - Ej: 'Junio_2026'
 */
export const exportMonthlyComplianceExcel = (kpiData, company = 'TYM', monthLabel = '') => {
    // Índice rápido por id
    const kpiById = {};
    kpiData.forEach(k => { kpiById[k.id] = k; });

    // Calcular resultados por persona
    const personasData = PERSONAS
        .filter(p => company === 'AMBAS' || p.company === company || !p.company)
        .map(persona => {
            const kpis = persona.kpiIds.map(id => {
                const kpi = kpiById[id];
                const r = resolveKPI(kpi, persona);
                return { nombre: kpi?.name || id, ...r };
            });
            const totalKpis = kpis.length;
            const cumplidos = kpis.filter(k => k.semaforo === 'green').length;
            const fallidos  = kpis.filter(k => k.semaforo === 'red').length;
            const sinDato   = kpis.filter(k => k.semaforo === 'gray').length;
            const pct = totalKpis > 0 ? Math.round((cumplidos / totalKpis) * 100) : 0;
            const { unitario, total: bonif } = calcBono(totalKpis, cumplidos);

            let estado;
            if (fallidos > 0)      estado = 'red';
            else if (sinDato > 0)  estado = 'yellow';
            else if (cumplidos === totalKpis) estado = 'green';
            else                   estado = 'gray';

            return { ...persona, kpis, totalKpis, cumplidos, fallidos, sinDato, pct, unitario, bonif, estado };
        });

    // ═══════════════════════════════════════════════════════════
    // HOJA 1 — 📊 Resumen Ejecutivo
    // ═══════════════════════════════════════════════════════════
    const totalPersonas = personasData.length;
    const cumplenTodo   = personasData.filter(p => p.estado === 'green').length;
    const conFallos     = personasData.filter(p => p.estado !== 'green').length;
    const totalPagar    = personasData.reduce((s, p) => s + p.bonif, 0);

    const resumenData = [
        [cell(`📈   INFORME DE CUMPLIMIENTO KPIs  —  ${monthLabel.replace('_', ' ').toUpperCase()}`, {
            font: { bold: true, sz: 16, color: { rgb: '1E293B' } },
        })],
        [],
        [
            null,
            cell('👥 Personas Evaluadas', { font: { bold: true, sz: 11 }, alignment: { horizontal: 'center' } }),
            null,
            cell('✅ Cumplen Todo', { font: { bold: true, sz: 11, color: { rgb: '276221' } }, alignment: { horizontal: 'center' } }),
            null,
            cell('❌ Con Fallos', { font: { bold: true, sz: 11, color: { rgb: '9C0006' } }, alignment: { horizontal: 'center' } }),
            null,
            cell('💰 Total a Pagar', { font: { bold: true, sz: 11, color: { rgb: '1D4ED8' } }, alignment: { horizontal: 'center' } }),
        ],
        [
            null,
            cell(totalPersonas, { font: { bold: true, sz: 20 }, alignment: { horizontal: 'center' } }),
            null,
            cell(cumplenTodo,  { font: { bold: true, sz: 20, color: { rgb: '276221' } }, alignment: { horizontal: 'center' } }),
            null,
            cell(conFallos,    { font: { bold: true, sz: 20, color: { rgb: '9C0006' } }, alignment: { horizontal: 'center' } }),
            null,
            cell(`$${totalPagar.toLocaleString('es-CO')}`, { font: { bold: true, sz: 20, color: { rgb: '1D4ED8' } }, alignment: { horizontal: 'center' } }),
        ],
        [],
        [cell('⚙️  Regla: 3 indicadores → $100.000 c/u  |  4 indicadores → $75.000 c/u  |  Se paga proporcional (cumplidos × valor unitario)', {
            font: { italic: true, color: { rgb: '64748B' } },
        })],
        [],
    ];
    // Encabezado tabla resumen
    const resHdrs = ['#','Responsable','Cargo','Proveedor','Indicad.','Cumplid.','Fallidos','% Logro','$ p/indicad.','Bonif. Ganada','Estado'];
    resumenData.push(resHdrs.map(h => cell(h, hdr())));

    personasData.forEach((p, i) => {
        resumenData.push([
            cell(i + 1),
            cell(p.nombre.toUpperCase()),
            cell(p.cargo),
            cell(p.proveedor),
            cell(p.totalKpis),
            cell(p.cumplidos, { font: { bold: true, color: { rgb: '276221' } } }),
            cell(p.fallidos,  { font: { bold: true, color: { rgb: p.fallidos > 0 ? '9C0006' : '276221' } } }),
            cell(`${p.pct}%`, { font: { bold: true }, alignment: { horizontal: 'center' } }),
            cell(p.unitario,  { numFmt: '#,##0', alignment: { horizontal: 'center' } }),
            cell(p.bonif,     { numFmt: '#,##0', font: { bold: true }, alignment: { horizontal: 'center' } }),
            semCell(semLabel[p.estado], p.estado),
        ]);
    });

    const wsRes = XLSX.utils.aoa_to_sheet(resumenData.map(r => r.map(c => c?.v ?? c ?? '')));
    // Re-aplicar estilos manualmente (aoa_to_sheet no los preserva)
    resumenData.forEach((row, ri) => {
        row.forEach((c, ci) => {
            if (c && c.s) {
                const ref = XLSX.utils.encode_cell({ r: ri, c: ci });
                if (wsRes[ref]) wsRes[ref].s = c.s;
            }
        });
    });
    setCols(wsRes, [4, 28, 26, 22, 10, 10, 10, 10, 14, 16, 22]);
    wsRes['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }, { s: { r: 5, c: 0 }, e: { r: 5, c: 10 } }];

    // ═══════════════════════════════════════════════════════════
    // HOJA 2 — 📋 Detalle Indicadores
    // ═══════════════════════════════════════════════════════════
    const detHdrs = ['#','Responsable','Cargo','Proveedor','Indicador','Meta','Resultado','$ p/indicad.','Estado'];
    const detalleRows = [
        [cell(`📋   DETALLE DE INDICADORES — ${monthLabel.replace('_',' ').toUpperCase()}`, { font: { bold: true, sz: 14 } })],
        [cell('✦ = Indicador inverso (menor = mejor)   |   🟢 Cumple   🔴 No cumple   🟡 Sin dato', { font: { italic: true, color: { rgb: '64748B' } } })],
        [],
        detHdrs.map(h => cell(h, hdr())),
    ];

    let rowNum = 1;
    personasData.forEach(p => {
        p.kpis.forEach(k => {
            detalleRows.push([
                cell(rowNum++),
                cell(p.nombre.toUpperCase()),
                cell(p.cargo),
                cell(p.proveedor),
                cell(k.nombre),
                cell(k.meta),
                cell(k.resultado),
                cell(p.unitario, { numFmt: '#,##0', alignment: { horizontal: 'center' } }),
                semCell(semIcon[k.semaforo], k.semaforo),
            ]);
        });
    });

    const wsDet = XLSX.utils.aoa_to_sheet(detalleRows.map(r => r.map(c => c?.v ?? c ?? '')));
    detalleRows.forEach((row, ri) => {
        row.forEach((c, ci) => {
            if (c && c.s) {
                const ref = XLSX.utils.encode_cell({ r: ri, c: ci });
                if (wsDet[ref]) wsDet[ref].s = c.s;
            }
        });
    });
    setCols(wsDet, [4, 28, 26, 22, 36, 22, 18, 14, 16]);
    wsDet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }];

    // ═══════════════════════════════════════════════════════════
    // HOJA 3 — 🚦 Semáforo
    // ═══════════════════════════════════════════════════════════
    const semHdrs1 = ['#','Responsable','Cargo','% Logro','$ p/indicad.','Bonif. Total','Indicadores'];
    const semHdrs2 = ['#','Responsable','Cargo','% Logro','Bonif. Ganada','Bonif. Máx','Indicadores Fallidos'];

    const cumplenTodoList = personasData.filter(p => p.estado === 'green');
    const fallidosList    = personasData.filter(p => p.estado !== 'green');

    const semRows = [
        [cell(`🚦   SEMÁFORO DE CUMPLIMIENTO — ${monthLabel.replace('_',' ').toUpperCase()}`, { font: { bold: true, sz: 14 } })],
        [],
        [cell('✅   CUMPLEN TODOS LOS INDICADORES — RECIBEN BONIFICACIÓN COMPLETA', {
            fill: { fgColor: { rgb: 'C6EFCE' } }, font: { bold: true, color: { rgb: '276221' }, sz: 11 },
        })],
        semHdrs1.map(h => cell(h, hdr('276221'))),
    ];

    cumplenTodoList.forEach((p, i) => {
        semRows.push([
            cell(i + 1),
            cell(p.nombre.toUpperCase()),
            cell(p.cargo),
            cell(`${p.pct}%`, { font: { bold: true }, alignment: { horizontal: 'center' } }),
            cell(p.unitario, { numFmt: '#,##0', alignment: { horizontal: 'center' } }),
            cell(p.bonif, { numFmt: '#,##0', font: { bold: true }, alignment: { horizontal: 'center' } }),
            cell(p.kpis.map(k => k.nombre).join('  ·  ')),
        ]);
    });

    semRows.push([], [cell('❌   INDICADORES FALLIDOS / SIN DATO — BONIFICACIÓN PARCIAL O NULA', {
        fill: { fgColor: { rgb: 'FFC7CE' } }, font: { bold: true, color: { rgb: '9C0006' }, sz: 11 },
    })]);
    semRows.push(semHdrs2.map(h => cell(h, hdr('9C0006'))));

    fallidosList.forEach((p, i) => {
        const fallDesc = p.kpis.filter(k => k.semaforo !== 'green')
            .map(k => `${k.nombre} (meta:${k.meta} → resultado:${k.resultado})`).join(' | ');
        const bonifMax = calcBono(p.totalKpis, p.totalKpis).total;
        semRows.push([
            cell(i + 1),
            cell(p.nombre.toUpperCase()),
            cell(p.cargo),
            cell(`${p.pct}%`, { font: { bold: true }, alignment: { horizontal: 'center' } }),
            cell(p.bonif, { numFmt: '#,##0', alignment: { horizontal: 'center' } }),
            cell(bonifMax,  { numFmt: '#,##0', alignment: { horizontal: 'center' } }),
            cell(fallDesc),
        ]);
    });

    const wsSem = XLSX.utils.aoa_to_sheet(semRows.map(r => r.map(c => c?.v ?? c ?? '')));
    semRows.forEach((row, ri) => {
        row.forEach((c, ci) => {
            if (c && c.s) {
                const ref = XLSX.utils.encode_cell({ r: ri, c: ci });
                if (wsSem[ref]) wsSem[ref].s = c.s;
            }
        });
    });
    setCols(wsSem, [4, 28, 26, 10, 14, 16, 60]);

    // ═══════════════════════════════════════════════════════════
    // HOJA 4 — 👔 Por Cargo
    // ═══════════════════════════════════════════════════════════
    const porCargoHdrs = ['#','Responsable','Cargo','Proveedor','Indicador','Meta','Resultado','Estado'];
    const cargoRows = [
        [cell(`👔   DETALLE POR CARGO — ${monthLabel.replace('_',' ').toUpperCase()}`, { font: { bold: true, sz: 14 } })],
        [],
    ];

    // Agrupar por cargo
    const byCargo = {};
    personasData.forEach(p => {
        if (!byCargo[p.cargo]) byCargo[p.cargo] = [];
        byCargo[p.cargo].push(p);
    });

    let cIdx = 1;
    Object.entries(byCargo).forEach(([cargo, personas]) => {
        cargoRows.push([cell(`  📌  ${cargo.toUpperCase()}`, {
            fill: { fgColor: { rgb: 'EFF6FF' } }, font: { bold: true, sz: 11, color: { rgb: '1D4ED8' } },
        })]);
        cargoRows.push(porCargoHdrs.map(h => cell(h, hdr())));
        personas.forEach(p => {
            p.kpis.forEach(k => {
                cargoRows.push([
                    cell(cIdx++),
                    cell(p.nombre.toUpperCase()),
                    cell(p.cargo),
                    cell(p.proveedor),
                    cell(k.nombre),
                    cell(k.meta),
                    cell(k.resultado),
                    semCell(semIcon[k.semaforo], k.semaforo),
                ]);
            });
        });
        cargoRows.push([]);
    });

    const wsCargo = XLSX.utils.aoa_to_sheet(cargoRows.map(r => r.map(c => c?.v ?? c ?? '')));
    cargoRows.forEach((row, ri) => {
        row.forEach((c, ci) => {
            if (c && c.s) {
                const ref = XLSX.utils.encode_cell({ r: ri, c: ci });
                if (wsCargo[ref]) wsCargo[ref].s = c.s;
            }
        });
    });
    setCols(wsCargo, [4, 28, 26, 22, 36, 22, 18, 16]);

    // ═══════════════════════════════════════════════════════════
    // Workbook final
    // ═══════════════════════════════════════════════════════════
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsRes,   '📊 Resumen Ejecutivo');
    XLSX.utils.book_append_sheet(wb, wsDet,   '📋 Detalle Indicadores');
    XLSX.utils.book_append_sheet(wb, wsSem,   '🚦 Semáforo');
    XLSX.utils.book_append_sheet(wb, wsCargo, '👔 Por Cargo');

    const fileName = `Informe_KPIs_${monthLabel}_${company}.xlsx`;
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fileName);
};

/**
 * Exports KPI data to Excel (función existente, sin cambios)
 */
export const exportKPIsToExcel = (kpiData, fileName = 'Reporte_Indicadores.xlsx') => {
    const data = kpiData.map(kpi => ({
        'Nombre Indicador': kpi.name,
        'Área': kpi.area?.toUpperCase(),
        'Sub-Área': kpi.subArea || 'N/A',
        'Responsable': kpi.responsable,
        'Frecuencia': kpi.frecuencia,
        'Meta': kpi.targetMeta || kpi.meta,
        'Valor Actual': kpi.hasData ? kpi.currentValue : 'Sin datos',
        'Unidad': kpi.unit,
        'Cumplimiento': kpi.hasData ? `${kpi.compliance}%` : '0%',
        'Estado': kpi.semaphore === 'green' ? '🟢 Óptimo' : (kpi.semaphore === 'red' ? '🔴 Crítico' : '🟡 En riesgo'),
        'Última Actualización': kpi.additionalData?.updatedAt ? new Date(kpi.additionalData.updatedAt).toLocaleString() : 'Nunca',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = [
        { wch: 40 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 12 },
        { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 25 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Indicadores');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fileName);
};
