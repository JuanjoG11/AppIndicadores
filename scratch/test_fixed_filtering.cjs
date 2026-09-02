const { createClient } = require('@supabase/supabase-js');
const { kpiDefinitions } = require('../src/data/kpiData.js');

const supabaseUrl = 'https://ovjgsscbmkermglezrcj.supabase.co';
const supabaseAnonKey = 'sb_publishable_H94STzN1_uN5JPDNmB9urg_B2u3TQpp';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

async function testFixedFiltering() {
    const { data: updates, error } = await supabase
        .from('kpi_updates')
        .select('*')
        .order('updated_at', { ascending: true });

    if (error) {
        console.error(error);
        return;
    }

    const reversed = [...updates].reverse();

    // Group updates by KPI & month
    ['TYM', 'TAT'].forEach(company => {
        ['Julio', 'Agosto'].forEach(selectedMonth => {
            let totalCompliance = 0;
            let count = 0;

            kpiDefinitions.forEach(kpi => {
                const matchedUpdate = reversed.find(u => {
                    const c = u.additional_data?.company || u.company_id || 'TYM';
                    const p = u.additional_data?.period || '';
                    const isMonth = selectedMonth === 'Julio' 
                        ? (p.startsWith('2026-07') || p === '2026-W30' || p === '2026-W31')
                        : (p.startsWith('2026-08') || p === '2026-W32' || p === '2026-W33');
                    return u.kpi_id === kpi.id && c === company && isMonth;
                });

                if (matchedUpdate) {
                    const val = matchedUpdate.value;
                    const meta = kpi.meta;
                    let targetMeta = typeof meta === 'number' ? meta : 0;
                    if (typeof meta === 'object') {
                        const brand = matchedUpdate.additional_data?.brand || company;
                        targetMeta = meta[brand] || meta[company] || Object.values(meta)[0] || 0;
                    }

                    const isInv = isInverseKPI(kpi.id);
                    let comp = 0;
                    if (targetMeta === 0 && val === 0) comp = isInv ? 100 : 0;
                    else if (targetMeta === 0 && val > 0) comp = isInv ? 0 : 100;
                    else if (isInv) comp = (targetMeta / val) * 100;
                    else comp = (val / targetMeta) * 100;
                    if (isInv && val === 0) comp = 100;
                    comp = Math.min(Math.max(Math.round(comp || 0), 0), 100);

                    totalCompliance += comp;
                    count++;
                }
            });

            const avg = count > 0 ? (totalCompliance / count).toFixed(1) : '0';
            console.log(`Company: ${company} | Selected Month: ${selectedMonth} | Score: ${avg}% (${count} KPIs)`);
        });
    });
}

testFixedFiltering();
