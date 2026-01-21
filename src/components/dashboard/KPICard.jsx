import React from 'react';
import { formatKPIValue, formatPercent, getSemaphoreClass, getSemaphoreEmoji, getTrendArrow, getTrendClass } from '../../utils/formatters';

const KPICard = ({ kpi, onClick }) => {
    const compliancePercent = kpi.compliance;
    const semaphoreClass = getSemaphoreClass(kpi.semaphore);
    const trendClass = getTrendClass(kpi.trend, kpi.inverse);

    return (
        <div
            className="card"
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-primary mb-1">{kpi.name}</h4>
                    <p className="text-xs text-secondary">{kpi.area}</p>
                </div>
                <span className={`semaphore ${semaphoreClass}`}></span>
            </div>

            <div className="mb-3">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-bold text-primary">
                        {formatKPIValue(kpi.currentValue, kpi.unit)}
                    </span>
                    <span className={`trend ${trendClass} text-sm`}>
                        {getTrendArrow(kpi.trend)} {Math.abs(kpi.changePercent).toFixed(1)}%
                    </span>
                </div>
                <div className="text-xs text-secondary">
                    Meta: {formatKPIValue(kpi.target, kpi.unit)}
                </div>
            </div>

            <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-secondary">Cumplimiento</span>
                    <span className="font-semibold text-primary">{formatPercent(compliancePercent)}</span>
                </div>
                <div className="progress">
                    <div
                        className={`progress-bar progress-bar-${kpi.semaphore === 'green' ? 'success' : kpi.semaphore === 'yellow' ? 'warning' : 'danger'}`}
                        style={{ width: `${Math.min(100, compliancePercent)}%` }}
                    ></div>
                </div>
            </div>

            {kpi.semaphore !== 'green' && (
                <div className={`badge ${kpi.semaphore === 'yellow' ? 'badge-warning' : 'badge-danger'} text-xs`}>
                    {getSemaphoreEmoji(kpi.semaphore)} {kpi.semaphore === 'yellow' ? 'Atención requerida' : 'Acción inmediata'}
                </div>
            )}
        </div>
    );
};

export default KPICard;
