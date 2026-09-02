const { createClient } = require('@supabase/supabase-js');
const { kpiDefinitions } = require('../src/data/kpiData.js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BRAND_TO_ENTITY = {
    'ALPINA': 'TYM',
    'ZENU': 'TYM',
    'FLEISCHMANN': 'TYM',
    'UNILEVER': 'TAT',
    'FAMILIA': 'TAT',
    'TYM': 'TYM',
    'TAT': 'TAT'
};

function isInverseKPI(kpiId) {
    const INVERSE_KPIS = [
        'gasto-nomina-venta', 'gasto-fletes-venta', 'horas-extras-auxiliares',
        'segundos-unidad-separada', 'notas-errores-venta', 'nomina-venta-picking',
        'horas-extras-venta-picking', 'embalajes-perdidos', 'nomina-compra-deposito',
        'horas-extras-venta-deposito', 'pedidos-devueltos', 'averias-venta',
        'rotacion-personal', 'ausentismo', 'he-rn-nomina', 'gasto-nomina-venta-rrhh',
        'tiempo-contratacion', 'indice-arqueo-caja', 'vales-descuadres',
        'cartera-no-vencida', 'cartera-mayor-30', 'dias-cierre', 'ajustes-posteriores',
        'ajustes-revisoria', 'rotacion-cxc', 'rotacion-cxp', 'multas-sanciones',
        'devoluciones-buen-estado', 'devoluciones-mal-estado-comercial',
        'rotacion-equipo-comercial', 'gasto-personal-comercial', 'gasto-viaje-comercial',
        'dias-inventario-comercial', 'quiebres-inventario', 'obsolescencia',
        'mermas', 'error-facturacion', 'mantenimiento-equipos'
    ];
    return INVERSE_KPIS.includes(kpiId);
}

async function calculateScores() {
    const { data: updates, error } = await supabase
        .from('kpi_updates')
        .select('*')
        .order('updated_at', { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    // Separate by month
    const julyMap = {};
    const augustMap = {};

    updates.forEach(u => {
        const period = u.additional_data?.period || '';
        const monthKey = period.startsWith('2026-08') || period === '2026-W32' || period === '2026-W33' ? 'August' :
                         period.startsWith('2026-07') || period === '2026-W30' || period === '2026-W31' ? 'July' : null;
        
        if (!monthKey) return;
        const map = monthKey === 'July' ? julyMap : augustMap;
        const key = `${u.company_id}_${u.kpi_id}_${u.additional_data?.brand || 'Global'}`;
        
        if (!map[key]) {
            map[key] = u;
        }
    });

    console.log(`July unique key entries: ${Object.keys(julyMap).length}`);
    console.log(`August unique key entries: ${Object.keys(augustMap).length}`);

    // Compute average compliance for July & August for TYM and TAT
    ['TYM', 'TAT'].forEach(company => {
        ['July', 'August'].forEach(monthName => {
            const map = monthName === 'July' ? julyMap : augustMap;
            let totalCompliance = 0;
            let count = 0;

            kpiDefinitions.forEach(kpi => {
                // Find entry
                const meta = kpi.meta;
                let metaVal = typeof meta === 'number' ? meta : 0;
                let brandKey = Object.keys(map).find(k => k.startsWith(`${company}_${kpi.id}_`));
                const record = map[brandKey];

                if (record) {
                    const val = record.value;
                    if (typeof meta === 'object') {
                        const brand = record.additional_data?.brand || company;
                        metaVal = meta[brand] || meta[company] || Object.values(meta)[0] || 0;
                    }
                    
                    const isInv = isInverseKPI(kpi.id);
                    let comp = 0;
                    if (metaVal === 0 && val === 0) comp = isInv ? 100 : 0;
                    else if (metaVal === 0 && val > 0) comp = isInv ? 0 : 100;
                    else if (isInv) comp = (metaVal / val) * 100;
                    else comp = (val / metaVal) * 100;
                    
                    if (isInv && val === 0) comp = 100;
                    comp = Math.min(Math.max(Math.round(comp || 0), 0), 100);

                    totalCompliance += comp;
                    count++;
                }
            });

            const avg = count > 0 ? (totalCompliance / count).toFixed(1) : 'N/A';
            console.log(`Company: ${company} | Month: ${monthName} | KPIs count: ${count} / ${kpiDefinitions.length} | Avg Score: ${avg}%`);
        });
    });
}

calculateScores();
