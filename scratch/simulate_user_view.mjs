import { createClient } from '@supabase/supabase-js';
import { kpiDefinitions } from '../src/data/kpiData.js';
import { SYSTEM_USERS } from '../src/data/users.js';

const sb = createClient(
    'https://ovjgsscbmkermglezrcj.supabase.co',
    'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp'
);

const currentUser = SYSTEM_USERS.find(u => u.username === 'comercial_tym');

// Copy isExoneratedUpdate from useKPIs.js
const KPIS_CARTERA = ['cartera-no-vencida', 'cartera-mayor-30', 'recircularizaciones', 'valor-cartera-venta'];
const isExoneratedUpdate = (u) => {
    if (!u) return false;
    const period = String(u.additional_data?.period || u.period || '');
    if (period === '2026-08-04' || period === '2026-08-05') return true;
    if (
        period === '2026-08' &&
        KPIS_CARTERA.includes(u.kpi_id) &&
        (u.updated_at || '').startsWith('2026-08-05')
    ) return true;
    return false;
};

async function simulate() {
    // 1. Fetch from Supabase exactly like useKPIs does
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString();

    const { data: currentMonthData } = await sb
        .from('kpi_updates')
        .select('*')
        .gte('updated_at', currentMonthStart)
        .order('updated_at', { ascending: false })
        .limit(1000);

    const { data: historicalData } = await sb
        .from('kpi_updates')
        .select('*')
        .gte('updated_at', twelveMonthsAgo)
        .lt('updated_at', currentMonthStart)
        .order('updated_at', { ascending: false })
        .limit(1000);

    const rawCombined = [...(currentMonthData || []), ...(historicalData || [])];
    const data = rawCombined.filter(u => !isExoneratedUpdate(u));

    console.log(`Fetched ${rawCombined.length} total rows, ${data.length} after isExoneratedUpdate`);

    // Let's see what updates match TYM and are for August (either period = 2026-08, 2026-08-Q1, 2026-W32, etc.)
    // especially for commercial or admin KPIs
    const tymCommercialUpdates = data.filter(u => {
        const comp = u.company_id || u.additional_data?.company;
        const brand = u.additional_data?.brand;
        const isTym = comp === 'TYM' || ['ALPINA', 'ZENU', 'FLEISCHMANN'].includes(brand);
        return isTym;
    });

    console.log(`Total TYM updates remaining: ${tymCommercialUpdates.length}`);

    // Check which ones have an August period
    const augustTym = tymCommercialUpdates.filter(u => {
        const p = String(u.additional_data?.period || '');
        return p.includes('2026-08') || p === '2026-W32';
    });

    console.log(`TYM updates with August period: ${augustTym.length}`);
    const byKpi = {};
    augustTym.forEach(u => {
        byKpi[u.kpi_id] = (byKpi[u.kpi_id] || 0) + 1;
    });
    console.log('Breakdown by KPI:', byKpi);
}

simulate();
