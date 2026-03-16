import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Exports KPI data to Excel
 */
export const exportKPIsToExcel = (kpiData, fileName = 'Reporte_Indicadores.xlsx') => {
    // 1. Prepare data for Excel
    const data = kpiData.map(kpi => {
        return {
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
            'Última Actualización': kpi.additionalData?.updatedAt ? new Date(kpi.additionalData.updatedAt).toLocaleString() : 'Nunca'
        };
    });

    // 2. Create Sheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // 3. Set column widths
    const widths = [
        { wch: 40 }, // Nombre
        { wch: 15 }, // Área
        { wch: 20 }, // Sub-Área
        { wch: 15 }, // Responsable
        { wch: 12 }, // Frecuencia
        { wch: 10 }, // Meta
        { wch: 15 }, // Valor
        { wch: 10 }, // Unidad
        { wch: 15 }, // Cumplimiento
        { wch: 15 }, // Estado
        { wch: 25 }, // Última Act
    ];
    worksheet['!cols'] = widths;

    // 4. Create Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Indicadores");

    // 5. Generate and save file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    
    saveAs(dataBlob, fileName);
};
