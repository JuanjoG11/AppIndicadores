import { createClient } from '@supabase/supabase-js';
import { kpiDefinitions } from '../src/data/kpiData.js';
import { SYSTEM_USERS } from '../src/data/users.js';

const sb = createClient(
    'https://ovjgsscbmkermglezrcj.supabase.co',
    'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp'
);

const currentUser = SYSTEM_USERS.find(u => u.username === 'comercial_tym');

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

// Helper to determine what kpi hasData for August
async function inspectUserView() {
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

    // Filter relevant KPIs for comercial_tym
    const userAreas = currentUser.allowedAreas || []; // ['comercial', 'administrativo']
    const relevantKpis = kpiDefinitions.filter(k => 
        userAreas.includes(k.area) || k.responsable === currentUser.cargo
    );

    console.log(`Checking ${relevantKpis.length} KPIs for ${currentUser.name} (${currentUser.username}):\n`);

    for (const kpi of relevantKpis) {
        // Find updates for this kpi in TYM
        const kpiUpdates = data.filter(u => {
            if (u.kpi_id !== kpi.id) return false;
            const comp = u.company_id || u.additional_data?.company;
            const brand = u.additional_data?.brand;
            return comp === 'TYM' || ['ALPINA', 'ZENU', 'FLEISCHMANN'].includes(brand);
        });

        // Check if there are updates that apply to August
        const augustUpdates = kpiUpdates.filter(u => {
            const p = String(u.additional_data?.period || '');
            return p.startsWith('2026-08') || p === '2026-W32' || p === '2026-W31';
        });

        if (augustUpdates.length > 0) {
            console.log(`[CARGADO] KPI: ${kpi.id.padEnd(32)} | Area: ${kpi.area.padEnd(14)} | Responsable: ${kpi.responsable}`);
            augustUpdates.slice(0, 3).forEach(u => {
                console.log(`          period: ${u.additional_data?.period} | brand: ${u.additional_data?.brand} | val: ${u.value} | date: ${u.updated_at.slice(0, 10)}`);
            });
        } else {
            console.log(`[LIMPIO]  KPI: ${kpi.id.padEnd(32)} | Area: ${kpi.area.padEnd(14)} | Responsable: ${kpi.responsable}`);
        }
    }
}

inspectUserView();
