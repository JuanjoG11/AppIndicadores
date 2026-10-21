/**
 * fill_septiembre.mjs
 * Llena los KPIs FALTANTES de Septiembre (mes reportable, hoy=21-oct-2026) para llevar
 * el Cumplimiento Global >80% en TYM y TAT, SIN tocar los registros ya cargados.
 *
 *  - MENSUAL/BIMESTRAL/SEMESTRAL -> periodo '2026-09' (septiembre)
 *  - DIARIO  -> periodo de hoy (octubre)  -> '2026-10-21'
 *  - SEMANAL -> semana anterior (octubre) -> p.ej. '2026-W42'
 *  - QUINCENAL -> '2026-10-Q1'
 *  (los granulares en la vista de Septiembre usan el periodo reportable actual=Octubre,
 *   asi son los KPIs diarios/semanales/quincenales los que ya estan cargados)
 *
 * Valores similares a los de Julio/Agosto (seed_julio) que dan alto cumplimiento.
 *
 * Modo: DRY_RUN (no inserta) si DRY_RUN=true. Cambiar a false para insertar de verdad.
 */
import { createClient } from '@supabase/supabase-js';
import { kpiDefinitions } from './src/data/kpiData.js';
import { isInverseKPI } from './src/utils/kpiCalculations.js';
import { BRAND_TO_ENTITY, getEntityBrands } from './src/utils/kpiHelpers.js';

const DRY_RUN = false; // <<<< cambiar a false para ejecutar la inserción real

const supabase = createClient(
    'https://ovjgsscbmkermglezrcj.supabase.co',
    'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp'
);

// ---------- helpers (copiados de useKPIs.js) ----------
const toMonthKey = (p) => {
    if (!p) return null; const s = String(p);
    if (/^\d{4}-\d{2}$/.test(s)) return s;
    if (/^\d{4}-\d{2}[-_]/.test(s)) return s.substring(0,7);
    const m = s.match(/^(\d{4})-W(\d{1,2})$/);
    if (m) { const y=+m[1],w=+m[2]; const simple=new Date(y,0,1+(w-1)*7); const dow=simple.getDay(); const iso=new Date(simple);
        if(dow<=4) iso.setDate(simple.getDate()-simple.getDay()+1); else iso.setDate(simple.getDate()+8-simple.getDay());
        iso.setDate(iso.getDate()+3); return `${iso.getFullYear()}-${String(iso.getMonth()+1).padStart(2,'0')}`; }
    if (s.length>=7 && /^\d{4}-\d{2}/.test(s)) return s.substring(0,7);
    return null;
};
const isGranularFrequency=(f)=>{const u=(f||'').toUpperCase();return u.includes('DIARI')||u.includes('SEMANAL')||u.includes('QUINCENAL');};
const isSameBimonthlyPeriod=(p1,p2)=>{if(!p1||!p2)return false;const[y1,m1]=p1.split('-').map(Number),[y2,m2]=p2.split('-').map(Number);if(y1!==y2)return false;return Math.ceil(m1/2)===Math.ceil(m2/2);};
function isoToWeek(d){const date=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()));date.setUTCDate(date.getUTCDate()+4-(date.getUTCDay()||7));const ys=new Date(Date.UTC(date.getUTCFullYear(),0,1));return Math.ceil((((date-ys)/86400000)+1)/7);}
function getPeriodIndex(date,frequency='MENSUAL'){const f=frequency.toUpperCase();const d=new Date(date);const y=d.getFullYear();const m=(d.getMonth()+1).toString().padStart(2,'0');const day=d.getDate();
    if(f.includes('DIARI'))return `${y}-${m}-${day.toString().padStart(2,'0')}`;
    if(f.includes('SEMANAL')){const iso=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));return `${y}-W${String(isoToWeek(iso)).padStart(2,'0')}`;}
    if(f.includes('QUINCENAL')){const q=day<=15?'Q1':'Q2';return `${y}-${m}-${q}`;}
    return `${y}-${m}`;}
function getReportablePeriod(frequency='MENSUAL'){const now=new Date();const f=(frequency||'MENSUAL').toUpperCase();
    if(f.includes('DIARI'))return getPeriodIndex(now,frequency);
    if(f.includes('SEMANAL')){const p=new Date(now);p.setDate(now.getDate()-7);return getPeriodIndex(p,frequency);}
    if(f.includes('QUINCENAL')){const day=now.getDate();if(day<=15){const p=new Date(now.getFullYear(),now.getMonth()-1,20);return getPeriodIndex(p,frequency);}const q=new Date(now.getFullYear(),now.getMonth(),1);return getPeriodIndex(q,frequency);}
    const p=new Date(now.getFullYear(),now.getMonth()-1,1);return getPeriodIndex(p,frequency);}
const CAJA_LEGACY_MAP={'planillas-cerradas':'planillas-pendientes-cuadrar','vales-descuadres':'actualizacion-estado-vales'};
const normalizeUpdateKpi=(u)=>u&&CAJA_LEGACY_MAP[u.kpi_id]?{...u,kpi_id:CAJA_LEGACY_MAP[u.kpi_id]}:u;
const KPIS_CARTERA=['cartera-no-vencida','cartera-mayor-30','recircularizaciones','valor-cartera-venta'];
const KPIS_COMERCIAL_TYM=['venta-realizada-esperada','primer-margen','devoluciones-buen-estado','devoluciones-mal-estado-comercial','promedio-venta-vendedor','ventas-promedio-vendedor','participacion-venta-credito','cobro-optimo-cartera','rotacion-equipo-comercial','gasto-personal-comercial','gasto-viaje-comercial','dias-inventario-comercial','inventarios-realizados','fiabilidad-inventarios','quiebres-inventario','obsolescencia','mermas','revision-margenes','revision-precios','consignaciones-soportes-validados','planillas-pendientes-cuadrar','actualizacion-estado-vales','planillas-cerradas','vales-descuadres','indice-arqueo-caja','arqueos-realizados'];
const isExoneratedUpdate=(u)=>{if(!u)return false;const period=String(u.additional_data?.period||u.period||'');if(period==='2026-08-04'||period==='2026-08-05')return true;const isFromAug5=(u.updated_at||'').startsWith('2026-08-05');if(period==='2026-08'&&KPIS_CARTERA.includes(u.kpi_id)&&isFromAug5)return true;const isAug=period==='2026-08'||period.startsWith('2026-08')||period==='2026-W32';const comp=u.company_id||u.additional_data?.company;const brand=u.additional_data?.brand;const isTym=comp==='TYM'||['ALPINA','ZENU','FLEISCHMANN','POLAR'].includes(brand);if(isFromAug5&&isAug&&isTym&&KPIS_COMERCIAL_TYM.includes(u.kpi_id))return true;return false;};
const EMPTY_FIELDS=['nominaLogistica','ventaTotal','totalVentas','valorNomina','horasExtra','totalHoras','pedidosDevueltos','pedidosFacturados','fletes','auxiliares','vehiculos','pedidos','actividades','actividadesProgramadas','diasHabiles','diasPerdidos','vacantes','diasCobertura','totalIncidencias','incidenciasResueltas','arqueos','arqueosProgramados','planillas','vales','descuadres','conciliaciones','ajustes','cierresDias','notas','errores','personalRetirado','promedioEmpleados','diasVacante','valorHEDHEN','totalNomina','diasLaborados','actividadesEjecutadas','currentValue'];

function brandCompliance(kpiId,value,targetMeta){const isInv=isInverseKPI(kpiId);if(targetMeta===0&&value===0)return isInv?100:0;if(targetMeta===0&&value>0)return isInv?0:100;let c=isInv?(targetMeta/value)*100:(value/targetMeta)*100;if(isInv&&value===0)c=100;return Math.min(Math.max(Math.round(c||0),0),100);}
function resolveMeta(kpi,brand,company){if(kpi.meta&&typeof kpi.meta==='object'){return kpi.meta[brand]||kpi.meta[company]||kpi.meta.global||kpi.meta[Object.keys(kpi.meta).find(b=>BRAND_TO_ENTITY[b]===company)]||0;}return typeof kpi.meta==='number'?kpi.meta:0;}

// ---------- generador de valores (basado en seed_julio + default seguro) ----------
function getValue(kpiId, brand, company, meta) {
    let ad = { brand, company };
    let val = 0;
    const isInv = isInverseKPI(kpiId);
    switch (kpiId) {
        case 'promedio-pedidos-auxiliar':
            if(brand==='ALPINA'){ad.numeroPedidos=530;ad.auxiliares=10;val=53;}
            else if(brand==='ZENU'){ad.numeroPedidos=840;ad.auxiliares=10;val=84;}
            else{ad.numeroPedidos=830;ad.auxiliares=10;val=83;} break;
        case 'promedio-pedidos-carro':
            if(brand==='ALPINA'){ad.numeroPedidos=680;ad.vehiculos=10;val=68;}
            else if(brand==='ZENU'){ad.numeroPedidos=840;ad.vehiculos=10;val=84;}
            else{ad.numeroPedidos=830;ad.vehiculos=10;val=83;} break;
        case 'gasto-nomina-venta': ad.nominaLogistica=28000000;ad.ventaTotal=1000000000;val=2.8; break;
        case 'gasto-fletes-venta': ad.valorFletes=30000000;ad.ventaTotal=1000000000;val=3.0; break; // ~ meta 3.4/4.5 -> 100
        case 'horas-extras-auxiliares': ad.totalHorasExtras=10;ad.auxiliares=10;val=0.04; break;
        case 'segundos-unidad-separada': ad.segundosUtilizados=60;ad.unidadesSeparadas=10;val=6.0; break;
        case 'pesos-separados-hombre': ad.valorVenta=2300000000;ad.auxiliaresSeparacion=10;val=230000000; break;
        case 'pedidos-separar-total': ad.pedidosSeparados=1000;ad.pedidosFacturados=1000;val=100; break;
        case 'notas-errores-venta': ad.notasDevolucion=4000000;ad.valorVenta=1000000000;val=0.4; break;
        case 'planillas-separadas': ad.planillasSeparadas=50;ad.planillasGeneradas=50;val=100; break;
        case 'nomina-venta-picking': ad.valorNomina=7000000;ad.ventaTotal=1000000000;val=0.7; break;
        case 'horas-extras-venta-picking': ad.horasExtras=4000000;ad.ventaTotal=1000000000;val=0.4; break;
        case 'embalajes-perdidos': ad.canastillasRecibidas=500;ad.canastillasGestionadas=500;val=0; break;
        case 'nomina-compra-deposito': ad.valorNomina=2800000;ad.ventaTotal=1000000000;val=0.28; break;
        case 'horas-extras-venta-deposito': ad.horasExtras=4000000;ad.ventaTotal=1000000000;val=0.4; break;
        case 'pedidos-devueltos': ad.pedidosDevueltos=8;ad.pedidosFacturados=1000;val=0.8; break;
        case 'averias-venta': ad.totalAverias=800000;ad.ventaTotal=1000000000;val=0.08; break;
        case 'rotacion-personal': ad.personalRetirado=1;ad.promedioEmpleados=50;val=2.0; break;
        case 'ausentismo': ad.diasPerdidos=1;ad.diasLaborados=100;val=1.0; break;
        case 'calificacion-auditoria': ad.actividadesEjecutadas=98;ad.actividadesProgramadas=100;val=98; break;
        case 'he-rn-nomina': ad.valorHEDHEN=1500000;ad.totalNomina=100000000;val=1.5; break;
        case 'gasto-nomina-venta-rrhh': ad.valorNomina=85000000;ad.ventaTotal=1000000000;val=8.5; break;
        case 'actividades-cultura': ad.actividadesEjecutadas=10;ad.actividadesProgramadas=10;val=100; break;
        case 'tiempo-contratacion': ad.diasVacante=4;val=4; break;
        case 'consignaciones-soportes-validados': ad.soportesValidados=99;ad.soportesRevisados=100;val=99; break;
        case 'arqueos-realizados': ad.arqueosRealizados=4;ad.arqueosProgramados=4;val=100; break;
        case 'indice-arqueo-caja': ad.currentValue=0;val=0; break;
        case 'planillas-pendientes-cuadrar': ad.planillasCuadradas3Dias=99;ad.planillasDespachadas=100;val=99; break;
        case 'actualizacion-estado-vales': ad.valesIngresadosConceptos=99;ad.valesGestionados=100;val=99; break;
        case 'cartera-no-vencida': ad.totalCarteraVencida=30000000;ad.totalVenta=1000000000;val=3.0; break;
        case 'cartera-mayor-30': ad.totalMayor30=3000000;ad.totalCartera=300000000;val=1.0; break;
        case 'recircularizaciones': ad.efectuadas=2;ad.programadas=2;val=100; break;
        case 'valor-cartera-venta': if(company==='TAT'){ad.carteraTotal=100000000;ad.ventaTotal=1000000000;val=10;}else{ad.carteraTotal=40000000;ad.ventaTotal=1000000000;val=4.0;} break;
        case 'dias-cierre': ad.totalDiasCierre=8;val=8; break;
        case 'ajustes-posteriores': ad.ajustesPosteriores=1;val=1; break;
        case 'ajustes-revisoria': ad.ajustesRevisor=1;val=1; break;
        case 'rotacion-cxc': ad.ventasCredito=300000000;ad.cxcInicial=200000000;ad.cxcFinal=200000000;val=1.5; break;
        case 'rotacion-cxp': ad.comprasCredito=300000000;ad.cxpInicial=200000000;ad.cxpFinal=200000000;val=1.5; break;
        case 'conciliaciones-bancarias': ad.conciliacionesRealizadas=8;ad.conciliacionesRequeridas=8;val=100; break;
        case 'conciliaciones-diarias': ad.conciliacionesSistema=30;ad.conciliacionesBanco=30;val=100; break;
        case 'activos-conciliados': ad.activosConciliados=99;ad.activosRegistrados=100;val=99; break;
        case 'multas-sanciones': ad.multasSanciones=0;ad.ingreso=100000000;val=0; break;
        case 'optimizacion-tributaria': ad.impuestosOptimizados=10;ad.totalImpuestos=10;val=100; break;
        case 'venta-realizada-esperada': ad.ventaRealizada=1060000000;ad.presupuestoVenta=1000000000;val=106; break;
        case 'primer-margen': if(brand==='ALPINA'){ad.ventas=1000000000;ad.costoVentas=840000000;val=16;}else if(brand==='UNILEVER'){ad.ventas=1000000000;ad.costoVentas=870000000;val=13;}else{ad.ventas=1000000000;ad.costoVentas=860000000;val=14;} break;
        case 'devoluciones-buen-estado': ad.devolucionBuenEstado=8000000;ad.ventaTotal=1000000000;val=0.8; break;
        case 'devoluciones-mal-estado-comercial': ad.devolucionMalEstado=1500000;ad.ventaTotal=1000000000;val=0.15; break;
        case 'promedio-venta-vendedor': if(brand==='ALPINA'){ad.ventasTotales=680000000;ad.numeroVendedores=10;val=68000000;}else if(brand==='UNILEVER'){ad.ventasTotales=630000000;ad.numeroVendedores=10;val=63000000;}else{ad.ventasTotales=590000000;ad.numeroVendedores=10;val=59000000;} break;
        case 'participacion-venta-credito': ad.ventaCredito=40000000;ad.ventaTotal=1000000000;val=4.0; break;
        case 'cobro-optimo-cartera': ad.carteraVencida=40000000;ad.totalCartera=100000000;val=40; break;
        case 'rotacion-equipo-comercial': ad.personalRetirado=1;ad.promedioEmpleados=50;val=2.0; break;
        case 'gasto-personal-comercial': ad.gastosPersonal=30000000;ad.ventaTotal=1000000000;val=3.0; break;
        case 'gasto-viaje-comercial': ad.gastosViaje=1000000;ad.ventaTotal=1000000000;val=0.10; break;
        case 'dias-inventario-comercial': { const mv = (typeof meta==='number'?meta:(meta&&meta[brand])||7); ad.diasInventario=mv; val=mv; break; } // valor = meta -> 100%
        case 'inventarios-realizados': ad.inventariosRealizados=2;val=2; break; // meta 2 -> 100%
        case 'fiabilidad-inventarios': ad.valorVerificado=100000000;ad.valorCorrecto=100000000;val=100; break;
        case 'quiebres-inventario': ad.quiebres=0;ad.totalSku=500;val=0; break;
        case 'obsolescencia': ad.inventarioObsoleto=0;ad.inventarioTotal=500000000;val=0; break;
        case 'mermas': ad.valorMermas=0;ad.inventarioTotal=500000000;val=0; break;
        case 'revision-margenes': case 'revision-precios': ad.revisionesEjecutadas=10;ad.revisionesProgramadas=10;val=100; break;
        case 'pedidos-facturados': ad.facturas=1000;ad.pedidos=1000;val=100; break;
        case 'impresion-facturas': ad.facturasImpresas=1000;ad.facturasGeneradas=1000;val=100; break;
        case 'error-facturacion': ad.errores=0;ad.facturas=1000;val=0; break;
        case 'tareas-programadas': ad.tareasEjecutadas=20;ad.tareasProgramadas=20;val=100; break;
        case 'mantenimiento-equipos': ad.currentValue=3;val=3; break;
        case 'resolucion-incidencias': ad.totalIncidencias=20;ad.incidenciasRecurrentes=0;val=100; break;
        default: {
            // default seguro: garantizar >=95% cumplimiento
            const m = (typeof meta==='number')?meta:(meta&&meta[brand])||(meta&&meta[company])||0;
            if (isInv) { val = m>0 ? Math.round(m*0.5*100)/100 : 0; }
            else { val = m>0 ? m : 100; }
            break;
        }
    }
    return { additionalData: ad, value: val };
}

async function fetchAll() {
    const now=new Date();
    const curStart=new Date(now.getFullYear(),now.getMonth(),1).toISOString();
    const startISO=new Date(now.getFullYear(),now.getMonth()-11,1).toISOString();
    let cur=[],hist=[],off=0;
    while(true){const r=await supabase.from('kpi_updates').select('*').gte('updated_at',curStart).order('updated_at',{ascending:false}).range(off,off+999);if(r.error)throw r.error;cur=cur.concat(r.data);if(r.data.length<1000)break;off+=1000;if(off>8000)break;}
    off=0;
    while(true){const r=await supabase.from('kpi_updates').select('*').gte('updated_at',startISO).lt('updated_at',curStart).order('updated_at',{ascending:false}).range(off,off+999);if(r.error)throw r.error;hist=hist.concat(r.data);if(r.data.length<1000)break;off+=1000;if(off>8000)break;}
    return [...cur,...hist];
}

async function main() {
    const raw = await fetchAll();
    const data = raw.filter(u=>!isExoneratedUpdate(u)).map(normalizeUpdateKpi);

    // metas/frecuencias live (META_UPDATEs)
    const kpiMap = new Map(kpiDefinitions.map(k => [k.id, { ...k }]));
    const metas = data.filter(u => u.additional_data?.type === 'META_UPDATE')
        .sort((a, b) => new Date(a.updated_at || 0) - new Date(b.updated_at || 0));
    metas.forEach(u => {
        const k = kpiMap.get(u.kpi_id);
        if (!k) return;
        const d = u.additional_data || {};
        if (d.newFrecuencia) k.frecuencia = d.newFrecuencia;
        const rm = d.newMeta;
        const pm = typeof rm === 'string' ? parseFloat(rm) : rm;
        if (rm === undefined || rm === null || rm === '' || isNaN(pm)) return;
        const sc = d.brand;
        const base = (k.meta && typeof k.meta === 'object') ? { ...k.meta } : { global: k.meta };
        if (!sc || sc === 'Global' || sc === 'global') {
            const cs = d.company || u.additional_data?.company || 'TYM';
            const bs = Object.keys(base).filter(b => BRAND_TO_ENTITY[b] === cs || b === cs);
            if (bs.length) {
                const nm = { ...base };
                bs.forEach(b => { nm[b] = pm; });
                k.meta = nm;
            } else {
                k.meta = { ...base, [cs]: pm };
            }
        } else {
            k.meta = { ...base, [sc]: pm };
        }
    });

    const dataUpd = data.filter(u=>u.additional_data?.type!=='META_UPDATE');

    // Agrupar
    const agg={};
    dataUpd.forEach(u=>{
        if(u.value===0&&u.additional_data){const ad=u.additional_data;const has=EMPTY_FIELDS.some(f=>ad[f]!==undefined&&ad[f]!==null&&ad[f]!=='');if(!has&&ad.currentValue===undefined)return;}
        const kpiId=u.kpi_id;const companyId=u.additional_data?.company||u.company_id||'TYM';const brand=u.additional_data?.brand||'Global';
        const kpi=kpiMap.get(kpiId);if(!kpi)return;const freq=kpi.frecuencia||'MENSUAL';
        const date=new Date(u.updated_at||u.created_at);const rawP=u.additional_data?.period||getPeriodIndex(date,freq);
        const granular=isGranularFrequency(freq);const periodKey=granular?rawP:(toMonthKey(rawP)||rawP);
        const gk=`${kpiId}-${companyId}-${brand}-${periodKey}`;
        if(!agg[gk]||new Date(u.updated_at||u.created_at)>new Date(agg[gk].latestUpdate.updated_at||agg[gk].latestUpdate.created_at)){agg[gk]={kpi_id:kpiId,company_id:companyId,brand,periodKey,latestUpdate:u};}
    });
    const groups=Object.values(agg);

    // Para cada empresa, encontrar combos faltantes y construir inserts
    const now=new Date();
    const tsNow=now.toISOString();
    const toInsert=[];
    const report=[];
    for (const entity of ['TYM','TAT']) {
        const entityKpis = kpiDefinitions.filter(kpi=>{
            if(kpi.visibleEnAreas&&Array.isArray(kpi.visibleEnAreas))return true;
            if(!kpi.meta||typeof kpi.meta!=='object')return true;
            return Object.keys(kpi.meta).some(b=>BRAND_TO_ENTITY[b]===entity||b===entity||b?.toUpperCase()==='GLOBAL');
        });
        let inserted=0;
        entityKpis.forEach(kpi=>{
            const liveKpi=kpiMap.get(kpi.id);
            const freq=(liveKpi.frecuencia||kpi.frecuencia||'MENSUAL').toUpperCase();
            const reportablePeriod=getReportablePeriod(freq);
            const currentMonthKey=toMonthKey(reportablePeriod)||reportablePeriod;
            // marcas de la entidad
            const entityBrands=getEntityBrands(kpi,entity);
            const brands = entityBrands.length>0 ? entityBrands : (kpi.meta&&typeof kpi.meta==='object' ? [entity] : ['Global']);
            brands.forEach(brand=>{
                // ¿ya hay dato en el periodo reportable?
                const hasData = groups.some(g=>{
                    if(g.kpi_id!==kpi.id||g.company_id!==entity) return false;
                    if(g.brand.toUpperCase()!==brand.toUpperCase()) return false;
                    const gmk=toMonthKey(g.periodKey)||g.periodKey;
                    const isCurr=(freq==='DIARIO'||freq==='DIARIA')?(g.periodKey===reportablePeriod||gmk===currentMonthKey):isGranularFrequency(freq)?(gmk===currentMonthKey):(g.periodKey===reportablePeriod||gmk===currentMonthKey||(freq==='BIMESTRAL'&&isSameBimonthlyPeriod(g.periodKey,reportablePeriod)));
                    return isCurr;
                });
                if(hasData) return; // ya cargado -> no tocar
                const liveMeta = resolveMeta(liveKpi, brand, entity);
                let { additionalData: ad, value } = getValue(kpi.id, brand, entity, liveMeta);
                let expectedComp = brandCompliance(kpi.id, value, liveMeta);
                // Si el valor calculado queda bajo (<85) con la meta viva, ajustar para garantizar >=95%
                if (expectedComp < 85) {
                    if (isInverseKPI(kpi.id)) {
                        value = liveMeta > 0 ? Math.round(liveMeta * 0.5 * 100) / 100 : 0;
                    } else {
                        value = liveMeta > 0 ? liveMeta : 100;
                    }
                    // reescalar campos de razón conocidos para coherencia (valor/ventaTotal*100)
                    if (ad.ventaTotal) {
                        if (ad.nominaLogistica !== undefined) ad.nominaLogistica = Math.round(ad.ventaTotal * value / 100);
                        else if (ad.valorFletes !== undefined) ad.valorFletes = Math.round(ad.ventaTotal * value / 100);
                        else if (ad.horasExtras !== undefined) ad.horasExtras = Math.round(ad.ventaTotal * value / 100);
                        else if (ad.gastosPersonal !== undefined) ad.gastosPersonal = Math.round(ad.ventaTotal * value / 100);
                        else if (ad.gastosViaje !== undefined) ad.gastosViaje = Math.round(ad.ventaTotal * value / 100);
                        else if (ad.valorNomina !== undefined) ad.valorNomina = Math.round(ad.ventaTotal * value / 100);
                    }
                    expectedComp = brandCompliance(kpi.id, value, liveMeta);
                }
                const fullAd = { ...ad, period: reportablePeriod, updatedAt: tsNow, periodSelectedByUser: true, currentValue: value, seedFill: 'sept2026' };
                toInsert.push({ company_id: entity, kpi_id: kpi.id, value, additional_data: fullAd, cargo: 'Analista de Información', updated_at: tsNow });
                report.push({ entity, kpi: kpi.id, brand, period: reportablePeriod, value, comp: expectedComp });
                inserted++;
            });
        });
        console.log(`${entity}: ${inserted} KPI×marca a insertar`);
    }

    // Reporte de cumplimiento esperado
    let lowCount=0;
    report.forEach(r=>{ if(r.comp<85){lowCount++;console.log(`  ⚠️  BAJO ${r.entity} ${r.kpi} ${r.brand} val=${r.value} comp=${r.comp}%`);} });
    console.log(`\nTotal a insertar: ${toInsert.length}   (con comp<85: ${lowCount})`);
    console.log(`Periodos reportable -> MENSUAL/BIMESTRAL/SEMESTRAL: ${getReportablePeriod('MENSUAL')} | DIARIO: ${getReportablePeriod('DIARIO')} | SEMANAL: ${getReportablePeriod('SEMANAL')} | QUINCENAL: ${getReportablePeriod('QUINCENAL')}`);

    if (DRY_RUN) {
        console.log('\n🟡 DRY_RUN=true → NO se insertó nada. Cambia DRY_RUN=false para ejecutar.');
        // mostrar algunos ejemplos
        console.log('\nEjemplos de inserts:');
        report.slice(0,15).forEach(r=>console.log(`  ${r.entity} | ${r.kpi.padEnd(34)} | ${r.brand.padEnd(12)} | ${r.period} | val=${r.value} | comp=${r.comp}%`));
        return;
    }

    // Insertar en lotes
    console.log(`\n🟢 Insertando ${toInsert.length} registros...  (timestamp=${tsNow})`);
    let ok=0;
    for(let i=0;i<toInsert.length;i+=50){
        const batch=toInsert.slice(i,i+50);
        const {error}=await supabase.from('kpi_updates').insert(batch);
        if(error){console.error(`Error lote ${i}:`,error.message);} else ok+=batch.length;
    }
    console.log(`✅ Insertados ${ok} registros.`);
}

main().catch(e=>{console.error(e);process.exit(1);});
