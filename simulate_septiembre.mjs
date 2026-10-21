/**
 * simulate_septiembre.mjs
 * Replica el cálculo del dashboard (useKPIs + filterKPIsByEntity + calculateOverallScore)
 * para mostrar el "Cumplimiento Global" actual de Septiembre (mes reportable, hoy=21-oct-2026)
 * por empresa (TYM y TAT), y listar qué KPIs faltan o están en 0.
 */
import { createClient } from '@supabase/supabase-js';
import { kpiDefinitions } from './src/data/kpiData.js';
import { isInverseKPI } from './src/utils/kpiCalculations.js';
import { BRAND_TO_ENTITY, getEntityBrands } from './src/utils/kpiHelpers.js';

const supabase = createClient(
    'https://ovjgsscbmkermglezrcj.supabase.co',
    'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp'
);

// ---------- helpers copiados de useKPIs.js ----------
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const toMonthKey = (p) => {
    if (!p) return null;
    const s = String(p);
    if (/^\d{4}-\d{2}$/.test(s)) return s;
    if (/^\d{4}-\d{2}[-_]/.test(s)) return s.substring(0, 7);
    const m = s.match(/^(\d{4})-W(\d{1,2})$/);
    if (m) {
        const y = +m[1], w = +m[2];
        const simple = new Date(y, 0, 1 + (w - 1) * 7);
        const dow = simple.getDay();
        const iso = new Date(simple);
        if (dow <= 4) iso.setDate(simple.getDate() - simple.getDay() + 1);
        else iso.setDate(simple.getDate() + 8 - simple.getDay());
        iso.setDate(iso.getDate() + 3);
        return `${iso.getFullYear()}-${String(iso.getMonth()+1).padStart(2,'0')}`;
    }
    if (s.length >= 7 && /^\d{4}-\d{2}/.test(s)) return s.substring(0,7);
    return null;
};
const isGranularFrequency = (f) => { const u=(f||'').toUpperCase(); return u.includes('DIARI')||u.includes('SEMANAL')||u.includes('QUINCENAL'); };
const periodToMonth = (period) => {
    if (!period) return '';
    if (/^\d{4}-\d{2}$/.test(period)) return period;
    if (/^\d{4}-\d{2}-\d{2}$/.test(period)) return period.substring(0,7);
    if (/^\d{4}-\d{2}-Q[12]$/.test(period)) return period.substring(0,7);
    if (/^\d{4}-W\d{1,2}$/.test(period)) return toMonthKey(period);
    return period.substring(0,7);
};
const isSameBimonthlyPeriod = (p1,p2) => {
    if (!p1||!p2) return false;
    const [y1,m1]=p1.split('-').map(Number), [y2,m2]=p2.split('-').map(Number);
    if (y1!==y2) return false;
    return Math.ceil(m1/2)===Math.ceil(m2/2);
};
function getPeriodIndex(date, frequency='MENSUAL') {
    const f = frequency.toUpperCase(); const d = new Date(date);
    const y=d.getFullYear(); const m=(d.getMonth()+1).toString().padStart(2,'0'); const day=d.getDate();
    if (f.includes('DIARI')) return `${y}-${m}-${day.toString().padStart(2,'0')}`;
    if (f.includes('SEMANAL')) { const iso = new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())); const wn = isoToWeek(iso); return `${y}-W${String(wn).padStart(2,'0')}`; }
    if (f.includes('QUINCENAL')) { const q = day<=15?'Q1':'Q2'; return `${y}-${m}-${q}`; }
    return `${y}-${m}`;
}
function isoToWeek(d){ const date=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())); date.setUTCDate(date.getUTCDate()+4-(date.getUTCDay()||7)); const yearStart=new Date(Date.UTC(date.getUTCFullYear(),0,1)); return Math.ceil((((date-yearStart)/86400000)+1)/7);}
function getReportablePeriod(frequency='MENSUAL') {
    const now=new Date(); const f=(frequency||'MENSUAL').toUpperCase();
    if (f.includes('DIARI')) return getPeriodIndex(now,frequency);
    if (f.includes('SEMANAL')) { const p=new Date(now); p.setDate(now.getDate()-7); return getPeriodIndex(p,frequency); }
    if (f.includes('QUINCENAL')) { const day=now.getDate(); if(day<=15){const p=new Date(now.getFullYear(),now.getMonth()-1,20);return getPeriodIndex(p,frequency);} const q=new Date(now.getFullYear(),now.getMonth(),1); return getPeriodIndex(q,frequency); }
    const p=new Date(now.getFullYear(),now.getMonth()-1,1); return getPeriodIndex(p,frequency);
}
const CAJA_LEGACY_MAP = {'planillas-cerradas':'planillas-pendientes-cuadrar','vales-descuadres':'actualizacion-estado-vales'};
const normalizeUpdateKpi = (u) => u && CAJA_LEGACY_MAP[u.kpi_id] ? {...u, kpi_id: CAJA_LEGACY_MAP[u.kpi_id]} : u;
const KPIS_CARTERA=['cartera-no-vencida','cartera-mayor-30','recircularizaciones','valor-cartera-venta'];
const KPIS_COMERCIAL_TYM=['venta-realizada-esperada','primer-margen','devoluciones-buen-estado','devoluciones-mal-estado-comercial','promedio-venta-vendedor','ventas-promedio-vendedor','participacion-venta-credito','cobro-optimo-cartera','rotacion-equipo-comercial','gasto-personal-comercial','gasto-viaje-comercial','dias-inventario-comercial','inventarios-realizados','fiabilidad-inventarios','quiebres-inventario','obsolescencia','mermas','revision-margenes','revision-precios','consignaciones-soportes-validados','planillas-pendientes-cuadrar','actualizacion-estado-vales','planillas-cerradas','vales-descuadres','indice-arqueo-caja','arqueos-realizados'];
const isExoneratedUpdate=(u)=>{ if(!u) return false; const period=String(u.additional_data?.period||u.period||''); if(period==='2026-08-04'||period==='2026-08-05') return true; const isFromAug5=(u.updated_at||'').startsWith('2026-08-05'); if(period==='2026-08'&&KPIS_CARTERA.includes(u.kpi_id)&&isFromAug5) return true; const isAug=period==='2026-08'||period.startsWith('2026-08')||period==='2026-W32'; const comp=u.company_id||u.additional_data?.company; const brand=u.additional_data?.brand; const isTym=comp==='TYM'||['ALPINA','ZENU','FLEISCHMANN','POLAR'].includes(brand); if(isFromAug5&&isAug&&isTym&&KPIS_COMERCIAL_TYM.includes(u.kpi_id)) return true; return false; };

const EMPTY_FIELDS=['nominaLogistica','ventaTotal','totalVentas','valorNomina','horasExtra','totalHoras','pedidosDevueltos','pedidosFacturados','fletes','auxiliares','vehiculos','pedidos','actividades','actividadesProgramadas','diasHabiles','diasPerdidos','vacantes','diasCobertura','totalIncidencias','incidenciasResueltas','arqueos','arqueosProgramados','planillas','vales','descuadres','conciliaciones','ajustes','cierresDias','notas','errores','personalRetirado','promedioEmpleados','diasVacante','valorHEDHEN','totalNomina','diasLaborados','actividadesEjecutadas','currentValue'];

// ---------- compliance por marca ----------
function brandCompliance(kpiId, value, targetMeta) {
    const isInverse = isInverseKPI(kpiId);
    if (targetMeta === 0 && value === 0) return isInverse ? 100 : 0;
    if (targetMeta === 0 && value > 0) return isInverse ? 0 : 100;
    let c = isInverse ? (targetMeta/value)*100 : (value/targetMeta)*100;
    if (isInverse && value === 0) c = 100;
    return Math.min(Math.max(Math.round(c||0),0),100);
}
function resolveMeta(kpi, brand, company) {
    if (kpi.meta && typeof kpi.meta === 'object') {
        return kpi.meta[brand] || kpi.meta[company] || kpi.meta.global || kpi.meta[Object.keys(kpi.meta).find(b=>BRAND_TO_ENTITY[b]===company)] || 0;
    }
    return typeof kpi.meta === 'number' ? kpi.meta : 0;
}

// ---------- fetch con paginación tipo app ----------
async function fetchAll() {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startISO = new Date(now.getFullYear(), now.getMonth()-11, 1).toISOString();
    let cur=[], hist=[];
    let off=0;
    // mes actual (paginar por si >1000)
    while (true) {
        const r = await supabase.from('kpi_updates').select('*').gte('updated_at', currentMonthStart).order('updated_at',{ascending:false}).range(off, off+999);
        if (r.error) throw r.error;
        cur = cur.concat(r.data);
        if (r.data.length < 1000) break;
        off += 1000;
        if (off > 8000) break;
    }
    off=0;
    while (true) {
        const r = await supabase.from('kpi_updates').select('*').gte('updated_at', startISO).lt('updated_at', currentMonthStart).order('updated_at',{ascending:false}).range(off, off+999);
        if (r.error) throw r.error;
        hist = hist.concat(r.data);
        if (r.data.length < 1000) break;
        off += 1000;
        if (off > 8000) break;
    }
    return [...cur, ...hist];
}

// ---------- main ----------
async function main() {
    const raw = await fetchAll();
    const data = raw.filter(u=>!isExoneratedUpdate(u)).map(normalizeUpdateKpi);

    // Aplicar META_UPDATEs a kpiDefinitions (copias)
    const kpiMap = new Map(kpiDefinitions.map(k=>[k.id, {...k}]));
    const metas = data.filter(u=>u.additional_data?.type==='META_UPDATE').sort((a,b)=>new Date(a.updated_at||0)-new Date(b.updated_at||0));
    metas.forEach(u=>{
        const k=kpiMap.get(u.kpi_id); if(!k) return;
        const d=u.additional_data||{};
        if (d.newFrecuencia) k.frecuencia=d.newFrecuencia;
        const rawMeta=d.newMeta; const pm=typeof rawMeta==='string'?parseFloat(rawMeta):rawMeta;
        if (rawMeta!==undefined&&rawMeta!==null&&rawMeta!==''&&!isNaN(pm)) {
            const scope=d.brand;
            const base=(k.meta&&typeof k.meta==='object')?{...k.meta}:{global:k.meta};
            if (!scope||scope==='Global'||scope==='global') {
                const cs=d.company||u.additional_data?.company||'TYM';
                const brands=Object.keys(base).filter(b=>BRAND_TO_ENTITY[b]===cs||b===cs);
                if (brands.length){const nm={...base};brands.forEach(b=>nm[b]=pm);k.meta=nm;} else k.meta={...base,[cs]:pm};
            } else k.meta={...base,[scope]:pm};
        }
    });

    const dataUpd = data.filter(u=>u.additional_data?.type!=='META_UPDATE');

    // Agrupar por kpi-company-brand-period
    const agg = {};
    dataUpd.forEach(u=>{
        if (u.value===0 && u.additional_data) {
            const ad=u.additional_data;
            const hasField = EMPTY_FIELDS.some(f=>ad[f]!==undefined&&ad[f]!==null&&ad[f]!=='');
            if (!hasField && ad.currentValue===undefined) return;
        }
        const kpiId=u.kpi_id; const companyId=u.additional_data?.company||u.company_id||'TYM';
        const brand=u.additional_data?.brand||'Global';
        const kpi=kpiMap.get(kpiId); if(!kpi) return;
        const frequency=kpi.frecuencia||'MENSUAL';
        const date=new Date(u.updated_at||u.created_at);
        const rawPeriod=u.additional_data?.period||getPeriodIndex(date,frequency);
        const granular=isGranularFrequency(frequency);
        const periodKey=granular?rawPeriod:(toMonthKey(rawPeriod)||rawPeriod);
        const gk=`${kpiId}-${companyId}-${brand}-${periodKey}`;
        if(!agg[gk]||new Date(u.updated_at||u.created_at)>new Date(agg[gk].latestUpdate.updated_at||agg[gk].latestUpdate.created_at)){
            agg[gk]={kpi_id:kpiId,company_id:companyId,brand,periodKey,latestUpdate:u};
        }
    });
    const groups=Object.values(agg);

    // Para cada empresa, simular filterKPIsByEntity + calculateOverallScore
    for (const entity of ['TYM','TAT']) {
        // brandValues por KPI
        const entityKpis = kpiDefinitions.filter(kpi=>{
            if (kpi.visibleEnAreas && Array.isArray(kpi.visibleEnAreas)) return true;
            if (!kpi.meta || typeof kpi.meta!=='object') return true;
            return Object.keys(kpi.meta).some(b=>BRAND_TO_ENTITY[b]===entity||b===entity||b?.toUpperCase()==='GLOBAL');
        });

        let sumComp=0, totalKpis=entityKpis.length, conDatos=0;
        const detalles=[];
        entityKpis.forEach(kpi=>{
            const liveKpi=kpiMap.get(kpi.id);
            const freq=(liveKpi.frecuencia||kpi.frecuencia||'MENSUAL').toUpperCase();
            const currentPeriodKey=getReportablePeriod(freq);
            const currentMonthKey=toMonthKey(currentPeriodKey)||currentPeriodKey;
            const brandValues={};
            // construir brandValues: solo marcas con dato en periodo reportable
            groups.forEach(g=>{
                if (g.kpi_id!==kpi.id) return;
                if (g.company_id!==entity) return;
                const gmk=toMonthKey(g.periodKey)||g.periodKey;
                const isFromCurrent = (freq==='DIARIO'||freq==='DIARIA')
                    ? (g.periodKey===currentPeriodKey||gmk===currentMonthKey)
                    : isGranularFrequency(freq)
                        ? (gmk===currentMonthKey)
                        : (g.periodKey===currentPeriodKey||gmk===currentMonthKey||(g.periodKey===currentPeriodKey)||(freq==='BIMESTRAL'&&isSameBimonthlyPeriod(g.periodKey,currentPeriodKey)));
                if(!isFromCurrent) return;
                const dataKey=`${entity}-${g.brand.toUpperCase()}`;
                const meta=resolveMeta(liveKpi,kpi.meta&&typeof kpi.meta==='object'?g.brand:entity,entity);
                const comp=brandCompliance(kpi.id,g.latestUpdate.value,meta);
                brandValues[dataKey]={hasData:true,compliance:comp,currentValue:g.latestUpdate.value,brand:g.brand};
            });

            // replicate filterKPIsByEntity aggregation
            const entityBrands=getEntityBrands(kpi,entity);
            const brandSpecificKeys = entityBrands.length>0
                ? entityBrands.map(b=>`${entity}-${b}`).filter(k=>brandValues[k]?.hasData)
                : [];
            let keysToAgg = brandSpecificKeys.length>0 ? brandSpecificKeys : Object.keys(brandValues).filter(k=>k.startsWith(`${entity}-`)&&brandValues[k]?.hasData);
            if (keysToAgg.length===0) {
                const gk=`${entity}-GLOBAL`;
                if (brandValues[gk]?.hasData) keysToAgg=[gk];
            }
            let avgComp=0, hasData=false;
            if (keysToAgg.length>0){
                hasData=true;
                avgComp = keysToAgg.reduce((s,k)=>s+brandValues[k].compliance,0)/keysToAgg.length;
            }
            avgComp=Math.min(Math.round(avgComp),100);
            const contrib = hasData?avgComp:0;
            sumComp+=contrib; if(hasData) conDatos++;
            detalles.push({id:kpi.id,name:kpi.name,freq,brands:entityBrands.length?entityBrands.join(','):'(global)',hasData,comp:hasData?avgComp:0,contrib});
        });

        const global = totalKpis>0 ? Math.round(sumComp/totalKpis) : 0;
        console.log(`\n══════════════════════════════════════════════`);
        console.log(`  EMPRESA ${entity}  —  Cumplimiento Global (mes reportable=Septiembre): ${global}%`);
        console.log(`  KPIs con dato: ${conDatos}/${totalKpis}   (umbral >80% → ${global>=80?'OK ✅':'POR DEBAJO ❌'})`);
        console.log(`══════════════════════════════════════════════`);
        // Listar los que faltan (sin dato) y los bajos
        const sinDato = detalles.filter(d=>!d.hasData);
        const bajos = detalles.filter(d=>d.hasData && d.comp<85);
        console.log(`\n  — SIN DATO (${sinDato.length}):`);
        sinDato.forEach(d=>console.log(`     [${d.freq.padEnd(9)}] ${d.id.padEnd(36)} ${(d.brands).padEnd(22)}`));
        console.log(`\n  — CON DATO PERO BAJO (<85) (${bajos.length}):`);
        bajos.forEach(d=>console.log(`     [${d.freq.padEnd(9)}] ${d.id.padEnd(36)} ${(d.brands).padEnd(22)} comp=${d.comp}%`));
    }
}
main().catch(e=>{console.error(e); process.exit(1);});
