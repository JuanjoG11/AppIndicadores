import React from 'react';
import { areas } from '../../data/areas';
import { calculateAreaScore } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';

const AreaHeatmap = ({ kpiData }) => {
    const navigate = useNavigate();

    const areaScores = areas.map(area => {
        const areaKPIs = kpiData.filter(kpi => kpi.area === area.id);
        const kpisWithData = areaKPIs.filter(kpi => kpi.hasData);
        const score = calculateAreaScore(kpiData, area.id);
        const criticalCount = areaKPIs.filter(kpi => kpi.semaphore === 'red').length;
        const pendingCount = areaKPIs.filter(kpi => !kpi.hasData).length;

        let status = 'gray';
        if (score !== null) {
            if (score >= 95) status = 'success';
            else if (score >= 85) status = 'warning';
            else status = 'danger';
        }

        return {
            ...area,
            score,
            criticalCount,
            pendingCount,
            totalKPIs: areaKPIs.length,
            kpisWithData: kpisWithData.length,
            status
        };
    });

    return (
        <div className="card fade-in">
            <div className="card-header">
                <div>
                    <h2>Indicadores por Área</h2>
                    <small>Sistema de gestión TYM/TAT 2026</small>
                </div>
            </div>

            <table className="table">
                <thead>
                    <tr>
                        <th>Área / Proceso</th>
                        <th>Responsable</th>
                        <th style={{ textAlign: 'center' }}>Total</th>
                        <th style={{ textAlign: 'center' }}>Datos</th>
                        <th style={{ textAlign: 'center' }}>Pendientes</th>
                        <th style={{ textAlign: 'center' }}>Críticos</th>
                        <th style={{ textAlign: 'center' }}>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {areaScores.map(area => (
                        <tr
                            key={area.id}
                            onClick={() => navigate(`/area/${area.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <td>
                                <div style={{ fontWeight: 600 }}>{area.name}</div>
                                <small>{area.description}</small>
                            </td>
                            <td><small>{area.responsible}</small></td>
                            <td style={{ textAlign: 'center', fontWeight: 600 }}>{area.totalKPIs}</td>
                            <td style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>
                                {area.kpisWithData}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                {area.pendingCount > 0 ? (
                                    <span className="badge warning">{area.pendingCount}</span>
                                ) : (
                                    <span style={{ color: 'var(--text-light)' }}>0</span>
                                )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                {area.criticalCount > 0 ? (
                                    <span className="badge danger">{area.criticalCount}</span>
                                ) : (
                                    <span style={{ color: 'var(--text-light)' }}>0</span>
                                )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                {area.score !== null ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <span className={`status ${area.status}`}></span>
                                        <span style={{ fontWeight: 700 }}>{area.score}</span>
                                    </div>
                                ) : (
                                    <small style={{ color: 'var(--text-muted)' }}>Sin datos</small>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-soft)', borderRadius: 'var(--radius-sm)' }}>
                <small style={{ color: 'var(--text-muted)' }}>
                    <strong>Nota:</strong> Los indicadores marcados como "Pendientes" aún no tienen fórmulas definidas o datos registrados.
                    El sistema está listo para recibir esta información a medida que se vayan completando las definiciones.
                </small>
            </div>
        </div>
    );
};

export default AreaHeatmap;
