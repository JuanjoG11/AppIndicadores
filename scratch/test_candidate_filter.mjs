import { createClient } from '@supabase/supabase-js';
import { kpiDefinitions } from '../src/data/kpiData.js';
import { SYSTEM_USERS } from '../src/data/users.js';
import { getCurrentPeriodKey } from '../src/utils/formatters.js';

const sb = createClient(
    'https://ovjgsscbmkermglezrcj.supabase.co',
    'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp'
);

const currentUser = SYSTEM_USERS.find(u => u.username === 'comercial_tym');

// Let's test with our candidate isExoneratedUpdate:
const KPIS_CARTERA = ['cartera-no-vencida', 'cartera-mayor-30', 'recircularizaciones', 'valor-cartera-venta'];
const KPIS_COMERCIAL = [
    'venta-realizada-esperada',
    'primer-margen',
    'devoluciones-buen-estado',
    'devoluciones-mal-estado-comercial',
    'promedio-venta-vendedor',
    'ventas-promedio-vendedor',
    'participacion-venta-credito',
    'cobro-optimo-cartera',
    'rotacion-equipo-comercial',
    'gasto-personal-comercial',
    'gasto-viaje-comercial',
    'dias-inventario-comercial'
];
const KPIS_ADMIN = [
    'inventarios-realizados',
    'fiabilidad-inventarios',
    'quiebres-inventario',
    'obsolescencia',
    'mermas',
    'revision-margenes',
    'revision-precios'
];

const isExoneratedCandidate = (u) => {
    if (!u) return false;
    const period = String(u.additional_data?.period || u.period || '');
    const isAugustPeriod = period === '2026-08' || period.startsWith('2026-08') || period === '2026-W32';
    const isFromAug5 = (u.updated_at || '').startsWith('2026-08-05');
    const isTym = (u.company_id === 'TYM') || ['ALPINA', 'ZENU', 'FLEISCHMANN'].includes(u.additional_data?.brand);

    if (period === '2026-08-04' || period === '2026-08-05') return true;

    // Cartera falso de agosto
    if (period === '2026-08' && KPIS_CARTERA.includes(u.kpi_id) && isFromAug5) return true;

    // Comercial TYM falso de agosto
    if (isTym && isFromAug5 && isAugustPeriod && (KPIS_COMERCIAL.includes(u.kpi_id) || KPIS_ADMIN.includes(u.kpi_id))) {
        return true;
    }

    return false;
};

async function testFilter() {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString();

    const { data: cur } = await sb.from('kpi_updates').select('*').gte('updated_at', currentMonthStart).limit(1000);
    const { data: hist } = await sb.from('kpi_updates').select('*').gte('updated_at', twelveMonthsAgo).lt('updated_at', currentMonthStart).limit(1000);

    const raw = [...(cur || []), ...(hist || [])];
    const filtered = raw.filter(u => !isExoneratedCandidate(u));

    console.log(`Original: ${raw.length}, Filtered: ${filtered.length}, Exonerated: ${raw.length - filtered.length}`);

    // Check July data for Comercial TYM to ensure July data is 100% INTACT!
    const julyComercialTYM = filtered.filter(u => {
        const p = String(u.additional_data?.period || '');
        const isTym = u.company_id === 'TYM' || ['ALPINA', 'ZENU', 'FLEISCHMANN'].includes(u.additional_data?.brand);
        return isTym && KPIS_COMERCIAL.includes(u.kpi_id) && (p === '2026-07' || p === '2026-07-Q2' || p === '2026-W30' || p === '2026-W31');
    });
    console.log(`\nJuly Comercial TYM records remaining: ${julyComercialTYM.length}`);
    const julyKpis = [...new Set(julyComercialTYM.map(u => u.kpi_id))];
    console.log(`July unique KPIs present: ${julyKpis.length}`);

    // Check August data for Comercial TYM - should be 0!
    const augustComercialTYM = filtered.filter(u => {
        const p = String(u.additional_data?.period || '');
        const isTym = u.company_id === 'TYM' || ['ALPINA', 'ZENU', 'FLEISCHMANN'].includes(u.additional_data?.brand);
        return isTym && KPIS_COMERCIAL.includes(u.kpi_id) && (p.startsWith('2026-08') || p === '2026-W32');
    });
    console.log(`August Comercial TYM records remaining: ${augustComercialTYM.length} (MUST BE 0!)`);

    // Check August data for Admin TYM - should be 0!
    const augustAdminTYM = filtered.filter(u => {
        const p = String(u.additional_data?.period || '');
        const isTym = u.company_id === 'TYM' || ['ALPINA', 'ZENU', 'FLEISCHMANN'].includes(u.additional_data?.brand);
        return isTym && KPIS_ADMIN.includes(u.kpi_id) && (p.startsWith('2026-08') || p === '2026-W32');
    });
    console.log(`August Admin TYM records remaining: ${augustAdminTYM.length} (MUST BE 0!)`);
}

testFilter();
