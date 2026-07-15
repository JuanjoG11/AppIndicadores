/**
 * Informe KPIs — Junio 2026
 * node generar_informe_junio.cjs
 *
 * REGLA BONIFICACIÓN:
 *   2 indicadores → $100.000 c/u (máx $200.000)
 *   3 indicadores → $100.000 c/u (máx $300.000)
 *   4 indicadores → $ 75.000 c/u (máx $300.000)
 *   Se paga proporcional: indicadores_cumplidos × valor_unitario
 *
 * LÓGICA CUMPLIMIENTO:
 *   positivo → resultado >= meta
 *   inverso  → resultado <= meta  (menor es mejor: devoluciones, fletes, etc.)
 */
'use strict';
const ExcelJS = require('exceljs');
const path    = require('path');

// ═══════════════════════════════════════════════════════════
// DATOS JUNIO 2026
// ═══════════════════════════════════════════════════════════
const datos = [
  // ── CARLOS ENRIQUE DÍAZ  ─────────────────────────────────
  { r:'CARLOS ENRIQUE DÍAZ',  c:'Auxiliar de Facturación',    p:'Alpina',              i:'Impresión de Facturas',              m:'100',   res:'100',  t:'pos' },
  { r:'CARLOS ENRIQUE DÍAZ',  c:'Auxiliar de Facturación',    p:'Alpina',              i:'Error sobre la facturación',         m:'99.5',  res:'100',  t:'pos' },
  { r:'CARLOS ENRIQUE DÍAZ',  c:'Auxiliar de Facturación',    p:'Alpina',              i:'Pedidos facturados',                 m:'100',   res:'100',  t:'pos' },
  // ── ESTEBAN LOAIZA  ──────────────────────────────────────
  { r:'ESTEBAN LOAIZA',       c:'Auxiliar de Facturación',    p:'Zenú - Fleischmann',  i:'Impresión de Facturas',              m:'100',   res:'100',  t:'pos' },
  { r:'ESTEBAN LOAIZA',       c:'Auxiliar de Facturación',    p:'Zenú - Fleischmann',  i:'Error sobre la facturación',         m:'99.5',  res:'100',  t:'pos' },
  { r:'ESTEBAN LOAIZA',       c:'Auxiliar de Facturación',    p:'Zenú - Fleischmann',  i:'Pedidos facturados',                 m:'100',   res:'100',  t:'pos' },
  // ── MARIANA GALLEGO  ─────────────────────────────────────
  { r:'MARIANA GALLEGO',      c:'Auxiliar de Facturación',    p:'Unilever - Familiar', i:'Impresión de Facturas',              m:'100',   res:'100',  t:'pos' },
  { r:'MARIANA GALLEGO',      c:'Auxiliar de Facturación',    p:'Unilever - Familiar', i:'Error sobre la facturación',         m:'99.5',  res:'0',    t:'pos' },
  { r:'MARIANA GALLEGO',      c:'Auxiliar de Facturación',    p:'Unilever - Familiar', i:'Pedidos facturados',                 m:'100',   res:'100',  t:'pos' },
  // ── ANYI MOSQUERA  ───────────────────────────────────────
  { r:'ANYI MOSQUERA',        c:'Analista de Abastecimientos',p:'General',             i:'Revisión de precios',                m:'100',   res:'100',  t:'pos' },
  { r:'ANYI MOSQUERA',        c:'Analista de Abastecimientos',p:'General',             i:'Cumplimiento de inventarios',        m:'90',    res:'100',  t:'pos' },
  { r:'ANYI MOSQUERA',        c:'Analista de Abastecimientos',p:'General',             i:'Revisión de márgenes',               m:'100',   res:'100',  t:'pos' },
  { r:'ANYI MOSQUERA',        c:'Analista de Abastecimientos',p:'General',             i:'Exactitud de inventarios',           m:'99',    res:'90',   t:'pos' },
  // ── DIANA GARCÍA  ────────────────────────────────────────
  { r:'DIANA GARCÍA',         c:'Analista de Cartera',        p:'General',             i:'Cartera al día',                     m:'10',    res:'6.61', t:'inv' },
  { r:'DIANA GARCÍA',         c:'Analista de Cartera',        p:'General',             i:'Cartera Mayor a 30 días',            m:'5',     res:'5',    t:'inv' },
  { r:'DIANA GARCÍA',         c:'Analista de Cartera',        p:'General',             i:'Relación Cartera vs Ventas',         m:'10',    res:'10',   t:'inv' },
  // ── CRISTIAN BALLESTEROS  ────────────────────────────────
  { r:'CRISTIAN BALLESTEROS', c:'Auxiliar Contable',          p:'General',             i:'Conciliaciones Bancarias',           m:'8',     res:'8',    t:'pos' },
  { r:'CRISTIAN BALLESTEROS', c:'Auxiliar Contable',          p:'General',             i:'Arqueos de Caja',                    m:'1',     res:'1',    t:'pos' },
  { r:'CRISTIAN BALLESTEROS', c:'Auxiliar Contable',          p:'General',             i:'Cierre de planillas',                m:'100',   res:'100',  t:'pos' },
  // ── DAVID AGUIRRE  (4 indicadores → $75k c/u)  ───────────
  { r:'DAVID AGUIRRE',        c:'Líder Logístico',            p:'Alpina - Fleischmann',i:'Índice de devoluciones',             m:'1.5',   res:'0',    t:'inv' },
  { r:'DAVID AGUIRRE',        c:'Líder Logístico',            p:'Alpina - Fleischmann',i:'Productividad de Auxiliares',        m:'40',    res:'40',   t:'pos' },
  { r:'DAVID AGUIRRE',        c:'Líder Logístico',            p:'Alpina - Fleischmann',i:'Productividad por Vehículo',         m:'60',    res:'60',   t:'pos' },
  { r:'DAVID AGUIRRE',        c:'Líder Logístico',            p:'Alpina - Fleischmann',i:'Participación de Fletes en Ventas',  m:'4.8',   res:'4.10', t:'inv' },
  // ── FELIPE MURILLO  (4 indicadores → $75k c/u)  ──────────
  { r:'FELIPE MURILLO',       c:'Líder Logístico',            p:'Zenú',                i:'Índice de devoluciones',             m:'1.8',   res:'1.40', t:'inv' },
  { r:'FELIPE MURILLO',       c:'Líder Logístico',            p:'Zenú',                i:'Productividad de Auxiliares',        m:'70',    res:'79',   t:'pos' },
  { r:'FELIPE MURILLO',       c:'Líder Logístico',            p:'Zenú',                i:'Productividad por Vehículo',         m:'70',    res:'79',   t:'pos' },
  { r:'FELIPE MURILLO',       c:'Líder Logístico',            p:'Zenú',                i:'Participación de Fletes en Ventas',  m:'3.9',   res:'3',    t:'inv' },
  // ── SEBASTIÁN ARIAS  (4 indicadores → $75k c/u)  ─────────
  { r:'SEBASTIÁN ARIAS',      c:'Líder Logístico',            p:'Unilever - Familiar', i:'Índice de devoluciones',             m:'2',     res:'0',    t:'inv' },
  { r:'SEBASTIÁN ARIAS',      c:'Líder Logístico',            p:'Unilever - Familiar', i:'Productividad de Auxiliares',        m:'55',    res:'55',   t:'pos' },
  { r:'SEBASTIÁN ARIAS',      c:'Líder Logístico',            p:'Unilever - Familiar', i:'Productividad por Vehículo',         m:'50',    res:'50',   t:'pos' },
  { r:'SEBASTIÁN ARIAS',      c:'Líder Logístico',            p:'Unilever - Familiar', i:'Participación de Fletes en Ventas',  m:'4.2',   res:null,   t:'inv' },
  // ── KARINA TABA  ─────────────────────────────────────────
  { r:'KARINA TABA',          c:'Analista de Gestión Humana', p:'General',             i:'Tiempo de cobertura de vacantes',    m:'8',     res:'8',    t:'inv' },
  { r:'KARINA TABA',          c:'Analista de Gestión Humana', p:'General',             i:'Cumplimiento SST',                   m:'92',    res:'98',   t:'pos' },
  { r:'KARINA TABA',          c:'Analista de Gestión Humana', p:'General',             i:'Actividades de cultura',             m:'90',    res:'98',   t:'pos' },
  // ── MARÍA JOSÉ FRANCO  (2 indicadores → $100k c/u)  ──────
  { r:'MARÍA JOSÉ FRANCO',    c:'Analista de Gestión Humana', p:'General',             i:'Cumplimiento SST',                   m:'92',    res:'98',   t:'pos' },
  { r:'MARÍA JOSÉ FRANCO',    c:'Analista de Gestión Humana', p:'General',             i:'Actividades de cultura',             m:'90',    res:'98',   t:'pos' },
  // ── DANIEL ARROYAVE  ─────────────────────────────────────
  { r:'DANIEL ARROYAVE',      c:'Auxiliar de Caja',           p:'TAT',                 i:'Cierre de planillas',                m:'100',   res:'100',  t:'pos' },
  { r:'DANIEL ARROYAVE',      c:'Auxiliar de Caja',           p:'TAT',                 i:'Vales en Cuadres',                   m:'0.5',   res:'0.5',  t:'inv' },
  { r:'DANIEL ARROYAVE',      c:'Auxiliar de Caja',           p:'TAT',                 i:'Índice de Arqueos',                  m:'0',     res:'0',    t:'inv' },
  // ── ELIANA GONZÁLEZ  ─────────────────────────────────────
  { r:'ELIANA GONZÁLEZ',      c:'Auxiliar de Caja',           p:'TYM',                 i:'Cierre de planillas',                m:'100',   res:'100',  t:'pos' },
  { r:'ELIANA GONZÁLEZ',      c:'Auxiliar de Caja',           p:'TYM',                 i:'Vales en Cuadres',                   m:'0.5',   res:'0.5',  t:'inv' },
  { r:'ELIANA GONZÁLEZ',      c:'Auxiliar de Caja',           p:'TYM',                 i:'Índice de Arqueos',                  m:'0',     res:'0',    t:'inv' },
  // ── NATALY MOLINA  ───────────────────────────────────────
  { r:'NATALY MOLINA',        c:'Auxiliar de Caja',           p:'TYM',                 i:'Cierre de planillas',                m:'100',   res:'100',  t:'pos' },
  { r:'NATALY MOLINA',        c:'Auxiliar de Caja',           p:'TYM',                 i:'Vales en Cuadres',                   m:'0.5',   res:'0.5',  t:'inv' },
  { r:'NATALY MOLINA',        c:'Auxiliar de Caja',           p:'TYM',                 i:'Índice de Arqueos',                  m:'0',     res:'0',    t:'inv' },
  // ── JUAN JOSÉ COLORADO  ──────────────────────────────────
  { r:'JUAN JOSÉ COLORADO',   c:'Software y TI',              p:'TYM',                 i:'Cumplimiento de Tareas Programadas', m:'100',   res:'100',  t:'pos' },
  { r:'JUAN JOSÉ COLORADO',   c:'Software y TI',              p:'TYM',                 i:'Mantenimiento Preventivo',           m:'3',     res:'3',    t:'inv' },
  { r:'JUAN JOSÉ COLORADO',   c:'Software y TI',              p:'TYM',                 i:'Efectividad en Resolución',          m:'95',    res:'95',   t:'pos' },
];

// ═══════════════════════════════════════════════════════════
// LÓGICA
// ═══════════════════════════════════════════════════════════
function valUnit(total) { return total <= 3 ? 100000 : 75000; }

function cumple(d) {
  if (d.res === null || d.res === undefined) return null;
  const r = parseFloat(String(d.res)), m = parseFloat(String(d.m));
  if (isNaN(r) || isNaN(m)) return null;
  return d.t === 'inv' ? r <= m : r >= m;
}

const datosC = datos.map(d => ({ ...d, ok: cumple(d) }));
const personas = [...new Set(datosC.map(d => d.r))];

const resumen = personas.map(nombre => {
  const filas = datosC.filter(d => d.r === nombre);
  const total = filas.length;
  const vu = valUnit(total);
  const cumplidos = filas.filter(d => d.ok === true).length;
  const fallidos  = filas.filter(d => d.ok === false).length;
  const sinDato   = filas.filter(d => d.ok === null).length;
  return {
    nombre, cargo: filas[0].c, proveedor: filas[0].p,
    total, vu, cumplidos, fallidos, sinDato,
    pct: Math.round(cumplidos / total * 100),
    ganada: cumplidos * vu,
    maxima: total * vu,
    ok: fallidos === 0 && sinDato === 0,
  };
});

const totalBonif = resumen.reduce((s, p) => s + p.ganada, 0);

// ═══════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════
const AZ_OSC = '1F3864', AZ_MED = '2E75B6', AZ_CLR = 'BDD7EE';
const VD_OSC = '375623', VD_MED = '70AD47', VD_CLR = 'E2EFDA';
const RJ_OSC = '9C0006', RJ_CLR = 'FFCCCC';
const AM_CLR = 'FFF2CC', AM_OSC = '856404';
const GR_CLR = 'F2F2F2', BLANCO = 'FFFFFF', NARANJ = 'F4B942';

const fS = (hex) => ({ type:'pattern', pattern:'solid', fgColor:{ argb:'FF'+hex } });
const bT = () => { const s={style:'thin',color:{argb:'FF'+AZ_MED}}; return {top:s,left:s,bottom:s,right:s}; };
const bL = () => { const s={style:'thin',color:{argb:'FFCCCCCC'}}; return {top:s,left:s,bottom:s,right:s}; };
const fT = { name:'Calibri',size:20,bold:true,color:{argb:'FFFFFFFF'} };
const fH = { name:'Calibri',size:10,bold:true,color:{argb:'FFFFFFFF'} };
const fN = { name:'Calibri',size:10 };
const fB = { name:'Calibri',size:10,bold:true };

function setCell(cell, opts) {
  if (opts.value !== undefined) cell.value = opts.value;
  if (opts.numFmt) cell.numFmt = opts.numFmt;
  if (opts.font)   cell.font   = opts.font;
  if (opts.fill)   cell.fill   = opts.fill;
  if (opts.align)  cell.alignment = opts.align;
  if (opts.border) cell.border = opts.border;
}

// ═══════════════════════════════════════════════════════════
async function main() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Sistema KPIs TYM/TAT'; wb.created = new Date();

  // ─────────────────────────────────────────────────────────
  // HOJA 1: RESUMEN EJECUTIVO
  // ─────────────────────────────────────────────────────────
  const ws1 = wb.addWorksheet('📊 Resumen Ejecutivo');
  ws1.columns = [
    {width:4},{width:28},{width:26},{width:22},
    {width:8},{width:8},{width:8},{width:9},
    {width:14},{width:14},{width:17},
  ];

  ws1.mergeCells('A1:K1');
  setCell(ws1.getCell('A1'), { value:'📈   INFORME DE CUMPLIMIENTO KPIs  —  JUNIO 2026',
    font:fT, fill:fS(AZ_OSC), align:{horizontal:'center',vertical:'middle'} });
  ws1.getRow(1).height = 48;

  ws1.mergeCells('A2:K2');
  setCell(ws1.getCell('A2'), {
    value:'Distribuidora TYM / TAT   |   Período: Junio 2026   |   Generado: ' + new Date().toLocaleDateString('es-CO'),
    font:{name:'Calibri',size:11,italic:true,color:{argb:'FFFFFFFF'}},
    fill:fS(AZ_MED), align:{horizontal:'center',vertical:'middle'} });
  ws1.getRow(2).height = 26;
  ws1.getRow(3).height = 12;

  // Cajas
  const cumplenTodos = resumen.filter(p=>p.ok).length;
  const noCumplen    = resumen.filter(p=>!p.ok).length;
  const cajasData = [
    {lbl:'👥 Personas Evaluadas', val:personas.length, color:AZ_MED, moneda:false},
    {lbl:'✅ Cumplen Todo',       val:cumplenTodos,     color:VD_MED, moneda:false},
    {lbl:'❌ Con Fallos',         val:noCumplen,        color:RJ_OSC, moneda:false},
    {lbl:'💰 Total a Pagar',      val:totalBonif,       color:NARANJ, moneda:true },
  ];
  const bCols=['B','D','F','H'], bEnds=['C','E','G','I'];
  cajasData.forEach((b,i) => {
    ws1.mergeCells(`${bCols[i]}4:${bEnds[i]}4`);
    ws1.mergeCells(`${bCols[i]}5:${bEnds[i]}5`);
    setCell(ws1.getCell(`${bCols[i]}4`), { value:b.lbl,
      font:{name:'Calibri',size:10,bold:true,color:{argb:'FFFFFFFF'}},
      fill:fS(b.color), align:{horizontal:'center',vertical:'middle'}, border:bT() });
    const vc = ws1.getCell(`${bCols[i]}5`);
    vc.value = b.val;
    if (b.moneda) vc.numFmt = '"$"#,##0';
    vc.font = {name:'Calibri',size:22,bold:true,color:{argb:'FF'+b.color}};
    vc.fill = fS(BLANCO); vc.alignment = {horizontal:'center',vertical:'middle'}; vc.border = bT();
  });
  ws1.getRow(4).height = 24; ws1.getRow(5).height = 44; ws1.getRow(6).height = 12;

  // Regla
  ws1.mergeCells('A7:K7');
  setCell(ws1.getCell('A7'), {
    value:'⚙️  Regla: 3 indicadores → $100.000 c/u  |  4 indicadores → $75.000 c/u  |  Se paga proporcional (cumplidos × valor unitario)',
    font:{name:'Calibri',size:10,italic:true,color:{argb:'FF'+AZ_OSC}},
    fill:fS(AZ_CLR), align:{horizontal:'center',vertical:'middle'} });
  ws1.getRow(7).height = 20; ws1.getRow(8).height = 8;

  // Header tabla
  const hdr = ['#','Responsable','Cargo','Proveedor','Indicad.','Cumplid.','Fallidos','% Logro','$ p/indicad.','Bonif. Ganada','Estado'];
  const rH = ws1.getRow(9); rH.height = 28;
  hdr.forEach((h,i) => setCell(rH.getCell(i+1), { value:h, font:fH, fill:fS(AZ_OSC),
    align:{horizontal:'center',vertical:'middle',wrapText:true}, border:bT() }));

  resumen.forEach((p,idx) => {
    const row = ws1.getRow(10+idx); row.height = 22;
    const bg = idx%2===0 ? GR_CLR : BLANCO;
    const est = p.ok ? '✅ CUMPLE TODO' : p.sinDato > 0 ? '⚠️ CON SIN DATO' : '❌ INDICADOR FALLIDO';
    const vals = [idx+1, p.nombre, p.cargo, p.proveedor,
                  p.total, p.cumplidos, p.fallidos, p.pct+'%',
                  p.vu, p.ganada, est];
    vals.forEach((v,ci) => {
      const cell = row.getCell(ci+1);
      cell.value = v; cell.font = ci===1 ? fB : fN;
      cell.alignment = {horizontal: ci<=3?'left':'center', vertical:'middle'};
      cell.border = bL();
      if (ci===8||ci===9) cell.numFmt = '"$"#,##0';
      if (ci===10) {
        if (p.ok)           { cell.fill=fS(VD_CLR); cell.font={...fB,color:{argb:'FF'+VD_OSC}}; }
        else if (p.sinDato) { cell.fill=fS(AM_CLR); cell.font={...fB,color:{argb:'FF'+AM_OSC}}; }
        else                { cell.fill=fS(RJ_CLR); cell.font={...fB,color:{argb:'FF'+RJ_OSC}}; }
      } else if (ci===7) {
        cell.fill = p.pct>=100?fS(VD_CLR):p.pct>=67?fS(AM_CLR):fS(RJ_CLR);
        cell.font = {...fB, color:{argb: p.pct>=100?'FF'+VD_OSC:p.pct>=67?'FF'+AM_OSC:'FF'+RJ_OSC}};
      } else if (ci===9) {
        cell.fill = p.ganada===p.maxima ? fS(VD_CLR) : p.ganada>0 ? fS(AM_CLR) : fS(RJ_CLR);
      } else if (ci===6 && p.fallidos>0) {
        cell.fill=fS(RJ_CLR); cell.font={...fB,color:{argb:'FF'+RJ_OSC}};
      } else { cell.fill=fS(bg); }
    });
  });

  // Total
  const tr = ws1.getRow(10+resumen.length); tr.height=26;
  ws1.mergeCells(`A${10+resumen.length}:I${10+resumen.length}`);
  setCell(tr.getCell(1), { value:'💰  TOTAL BONIFICACIONES — JUNIO 2026',
    font:{...fB,color:{argb:'FFFFFFFF'}}, fill:fS(AZ_OSC),
    align:{horizontal:'right',vertical:'middle'}, border:bT() });
  const tc = tr.getCell(10);
  tc.value=totalBonif; tc.numFmt='"$"#,##0';
  tc.font={name:'Calibri',size:14,bold:true,color:{argb:'FFFFFFFF'}};
  tc.fill=fS(NARANJ); tc.alignment={horizontal:'center',vertical:'middle'}; tc.border=bT();
  tr.getCell(11).fill=fS(AZ_OSC); tr.getCell(11).border=bT();


  // ─────────────────────────────────────────────────────────
  // HOJA 2: DETALLE INDICADORES
  // ─────────────────────────────────────────────────────────
  const ws2 = wb.addWorksheet('📋 Detalle Indicadores');
  ws2.columns = [{width:4},{width:26},{width:26},{width:22},{width:34},{width:10},{width:12},{width:14},{width:16}];

  ws2.mergeCells('A1:I1');
  setCell(ws2.getCell('A1'), { value:'📋   DETALLE DE INDICADORES — JUNIO 2026',
    font:fT, fill:fS(AZ_OSC), align:{horizontal:'center',vertical:'middle'} });
  ws2.getRow(1).height=44;

  ws2.mergeCells('A2:I2');
  setCell(ws2.getCell('A2'), {
    value:'✦ = Indicador inverso (menor = mejor)   |   🟢 Cumple   🔴 No cumple   🟡 Sin dato',
    font:{name:'Calibri',size:10,italic:true,color:{argb:'FF'+AZ_OSC}},
    fill:fS(AZ_CLR), align:{horizontal:'center',vertical:'middle'} });
  ws2.getRow(2).height=20; ws2.getRow(3).height=8;

  const hdr2=['#','Responsable','Cargo','Proveedor','Indicador','Meta','Resultado','$ p/indicad.','Estado'];
  const rH2=ws2.getRow(4); rH2.height=26;
  hdr2.forEach((h,i) => setCell(rH2.getCell(i+1), { value:h, font:fH, fill:fS(AZ_MED),
    align:{horizontal:'center',vertical:'middle',wrapText:true}, border:bT() }));

  let ri=5, prev='', alt=true;
  datosC.forEach((d,i) => {
    if (d.r!==prev) { prev=d.r; alt=!alt; }
    const row=ws2.getRow(ri++); row.height=20;
    const bg=alt?'EBF3FB':BLANCO;
    const vu2=valUnit(datosC.filter(x=>x.r===d.r).length);
    const nomI = d.t==='inv' ? d.i+' ✦' : d.i;
    const est  = d.ok===null?'🟡 Sin dato':d.ok?'🟢 Cumple':'🔴 No cumple';
    const resShow = d.res===null ? '—' : String(d.res).includes('.')&&d.res!=parseInt(d.res) ? d.res+'%' : d.res;
    const metaShow = d.m + (isNaN(parseFloat(d.m)) ? '' : ['100','90','99','92','95'].includes(d.m) ? '%' : d.m.includes('.')&&d.m!='0.5'&&d.m!='1.5'&&d.m!='1.8'&&d.m!='4.8'&&d.m!='4.2'&&d.m!='3.9' ? '' : d.m.includes('.') ? '%' : ['40','55','60','70','79','8','1'].includes(d.m) ? '' : '%');

    [i+1, d.r, d.c, d.p, nomI, d.m, d.res??'—', vu2, est].forEach((v,ci) => {
      const cell=row.getCell(ci+1);
      cell.value=v; cell.font=ci===1?fB:fN;
      cell.alignment={horizontal:ci<=4?'left':'center',vertical:'middle'};
      cell.border=bL();
      if (ci===7) cell.numFmt='"$"#,##0';
      if (ci===8) {
        if (d.ok===null)  { cell.fill=fS(AM_CLR); cell.font={...fB,color:{argb:'FF'+AM_OSC}}; }
        else if (d.ok)    { cell.fill=fS(VD_CLR); cell.font={...fB,color:{argb:'FF'+VD_OSC}}; }
        else              { cell.fill=fS(RJ_CLR); cell.font={...fB,color:{argb:'FF'+RJ_OSC}}; }
      } else { cell.fill=fS(bg); }
    });
  });

  // ─────────────────────────────────────────────────────────
  // HOJA 3: SEMÁFORO
  // ─────────────────────────────────────────────────────────
  const ws3 = wb.addWorksheet('🚦 Semáforo');
  ws3.columns=[{width:3},{width:28},{width:24},{width:10},{width:14},{width:14},{width:36}];

  ws3.mergeCells('A1:G1');
  setCell(ws3.getCell('A1'), { value:'🚦   SEMÁFORO DE CUMPLIMIENTO — JUNIO 2026',
    font:fT, fill:fS(AZ_OSC), align:{horizontal:'center',vertical:'middle'} });
  ws3.getRow(1).height=44; ws3.getRow(2).height=10;

  // VERDE
  ws3.mergeCells('A3:G3');
  setCell(ws3.getCell('A3'), { value:'✅   CUMPLEN TODOS LOS INDICADORES — RECIBEN BONIFICACIÓN COMPLETA',
    font:{name:'Calibri',size:12,bold:true,color:{argb:'FF'+VD_OSC}},
    fill:fS(VD_MED), align:{horizontal:'center',vertical:'middle'} });
  ws3.getRow(3).height=28;

  ['#','Responsable','Cargo','% Logro','$ p/indicad.','Bonif. Total','Indicadores'].forEach((h,i) =>
    setCell(ws3.getRow(4).getCell(i+1), { value:h, font:fH, fill:fS(VD_OSC),
      align:{horizontal:'center',vertical:'middle'}, border:bT() }));
  ws3.getRow(4).height=24;

  const verdeList = resumen.filter(p=>p.ok);
  verdeList.forEach((p,i) => {
    const row=ws3.getRow(5+i); row.height=22;
    const bg=i%2===0?VD_CLR:BLANCO;
    const indsTxt=datosC.filter(d=>d.r===p.nombre).map(d=>d.i).join('  ·  ');
    [i+1, p.nombre, p.cargo, p.pct+'%', p.vu, p.ganada, indsTxt].forEach((v,ci) => {
      const cell=row.getCell(ci+1);
      cell.value=v; cell.font=ci===1?fB:fN; cell.fill=fS(bg);
      cell.alignment={horizontal:ci===0||ci===3?'center':'left',vertical:'middle',wrapText:ci===6};
      cell.border=bL();
      if (ci===4||ci===5) cell.numFmt='"$"#,##0';
    });
  });

  const sepR=5+verdeList.length+1;
  ws3.getRow(sepR-1).height=12;

  // ROJA
  ws3.mergeCells(`A${sepR}:G${sepR}`);
  setCell(ws3.getCell(`A${sepR}`), { value:'❌   INDICADORES FALLIDOS / SIN DATO — BONIFICACIÓN PARCIAL O NULA',
    font:{name:'Calibri',size:12,bold:true,color:{argb:'FFFFFFFF'}},
    fill:fS(RJ_OSC), align:{horizontal:'center',vertical:'middle'} });
  ws3.getRow(sepR).height=28;

  ['#','Responsable','Cargo','% Logro','Bonif. Ganada','Bonif. Máx','Indicadores Fallidos'].forEach((h,i) =>
    setCell(ws3.getRow(sepR+1).getCell(i+1), { value:h, font:fH, fill:fS(RJ_OSC),
      align:{horizontal:'center',vertical:'middle'}, border:bT() }));
  ws3.getRow(sepR+1).height=24;

  const rojoList=resumen.filter(p=>!p.ok);
  rojoList.forEach((p,i) => {
    const row=ws3.getRow(sepR+2+i); row.height=32;
    const bg=i%2===0?RJ_CLR:BLANCO;
    const failTxt=datosC.filter(d=>d.r===p.nombre&&(d.ok===false||d.ok===null))
      .map(d=>`${d.i} (meta:${d.m} → resultado:${d.res??'Sin dato'})`)
      .join('  |  ');
    [i+1, p.nombre, p.cargo, p.pct+'%', p.ganada, p.maxima, failTxt].forEach((v,ci) => {
      const cell=row.getCell(ci+1);
      cell.value=v; cell.font=ci===1?fB:fN; cell.fill=fS(bg);
      cell.alignment={horizontal:ci===0||ci===3?'center':'left',vertical:'middle',wrapText:ci===6};
      cell.border=bL();
      if (ci===4||ci===5) cell.numFmt='"$"#,##0';
    });
  });

  // ─────────────────────────────────────────────────────────
  // HOJA 4: POR CARGO
  // ─────────────────────────────────────────────────────────
  const ws4=wb.addWorksheet('👔 Por Cargo');
  ws4.columns=[{width:4},{width:26},{width:26},{width:22},{width:34},{width:10},{width:12},{width:16}];

  ws4.mergeCells('A1:H1');
  setCell(ws4.getCell('A1'), { value:'👔   DETALLE POR CARGO — JUNIO 2026',
    font:fT, fill:fS(AZ_OSC), align:{horizontal:'center',vertical:'middle'} });
  ws4.getRow(1).height=44;

  const cargos=[...new Set(datosC.map(d=>d.c))];
  let cr=3;
  cargos.forEach(cargo => {
    const persC=resumen.filter(p=>p.cargo===cargo);
    ws4.mergeCells(`A${cr}:H${cr}`);
    setCell(ws4.getCell(`A${cr}`), { value:`  📌  ${cargo.toUpperCase()}`,
      font:{name:'Calibri',size:11,bold:true,color:{argb:'FFFFFFFF'}},
      fill:fS(AZ_MED), align:{horizontal:'left',vertical:'middle'} });
    ws4.getRow(cr).height=24; cr++;

    ['#','Responsable','Cargo','Proveedor','Indicador','Meta','Resultado','Estado'].forEach((h,i) =>
      setCell(ws4.getRow(cr).getCell(i+1), { value:h, font:fH, fill:fS(AZ_OSC),
        align:{horizontal:'center',vertical:'middle'}, border:bT() }));
    ws4.getRow(cr).height=22; cr++;

    let li=0;
    persC.forEach(p => {
      datosC.filter(d=>d.r===p.nombre).forEach(d => {
        const row=ws4.getRow(cr++); row.height=20;
        const bg=li%2===0?'EBF3FB':BLANCO;
        const est=d.ok===null?'🟡 Sin dato':d.ok?'🟢 Cumple':'🔴 No cumple';
        [li+1, d.r, d.c, d.p, d.t==='inv'?d.i+' ✦':d.i, d.m, d.res??'—', est].forEach((v,ci) => {
          const cell=row.getCell(ci+1);
          cell.value=v; cell.font=ci===1?fB:fN;
          cell.alignment={horizontal:ci<=4?'left':'center',vertical:'middle'};
          cell.border=bL();
          if (ci===7) {
            if (d.ok===null)  { cell.fill=fS(AM_CLR); cell.font={...fB,color:{argb:'FF'+AM_OSC}}; }
            else if (d.ok)    { cell.fill=fS(VD_CLR); cell.font={...fB,color:{argb:'FF'+VD_OSC}}; }
            else              { cell.fill=fS(RJ_CLR); cell.font={...fB,color:{argb:'FF'+RJ_OSC}}; }
          } else { cell.fill=fS(bg); }
        }); li++;
      });
    });
    cr++;
  });

  // ─────────────────────────────────────────────────────────
  // GUARDAR
  // ─────────────────────────────────────────────────────────
  const out = path.join(__dirname, 'Informe_KPIs_Junio_2026_Final.xlsx');
  await wb.xlsx.writeFile(out);

  console.log('\n✅  Generado: ' + out);
  console.log('\n📊  Resumen:');
  console.log(`   Personas evaluadas   : ${personas.length}`);
  console.log(`   Cumplen todo         : ${resumen.filter(p=>p.ok).length}`);
  console.log(`   Con fallos/sin dato  : ${resumen.filter(p=>!p.ok).length}`);
  console.log(`   Total bonificaciones : $${totalBonif.toLocaleString('es-CO')}`);
  console.log('\n👤  Detalle por persona:');
  resumen.forEach(p => {
    const ico = p.ok ? '✅' : p.sinDato>0 ? '⚠️ ' : '❌';
    console.log(`   ${ico} ${p.nombre.padEnd(28)} ${p.cumplidos}/${p.total} inds  $${p.ganada.toLocaleString('es-CO')} de $${p.maxima.toLocaleString('es-CO')}`);
  });
}

main().catch(err => {
  console.error('\n❌  ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
});
