import React from 'react';
import { getCriticalAlerts } from '../../data/mockData';

const TopBar = ({ currentUser, kpiData }) => {
    const criticalAlerts = kpiData ? getCriticalAlerts(kpiData) : [];
    const hasAlerts = criticalAlerts.length > 0;

    return (
        <div style={{
            height: '60px',
            background: 'var(--bg-app)',
            borderBottom: '1px solid var(--border-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            position: 'sticky',
            top: 0,
            zIndex: 10
        }}>
            {/* Left Section - Breadcrumbs/Search removed for space */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <span style={{ opacity: 0.5 }}>Plataforma</span> <span style={{ margin: '0 0.5rem' }}>/</span> <span style={{ color: '#38bdf8' }}>Consola de Mando Directivo</span>
                </span>
            </div>

            {/* Right side - User info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ position: 'relative', cursor: 'pointer', fontSize: '1.2rem' }}>
                    🔔
                    {hasAlerts && (
                        <div style={{
                            position: 'absolute',
                            top: '-2px',
                            right: '-2px',
                            width: '12px',
                            height: '12px',
                            background: 'var(--danger)',
                            borderRadius: '50%',
                            border: '2px solid var(--bg-app)',
                            fontSize: '0.6rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 800
                        }}>
                            {criticalAlerts.length}
                        </div>
                    )}
                </div>
                <div style={{ fontSize: '1.2rem', cursor: 'pointer', opacity: 0.6 }}>⚙️</div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer'
                }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>{currentUser.name}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>{currentUser.role}</div>
                    </div>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--brand-bg)',
                        color: 'var(--brand)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        border: '1px solid var(--brand-light)'
                    }}>
                        {currentUser.name.charAt(0)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
