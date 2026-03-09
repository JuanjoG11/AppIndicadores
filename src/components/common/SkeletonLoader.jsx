import React from 'react';

/**
 * SkeletonLoader - Componente de carga esqueleto con shimmer animado
 * Evita el parpadeo al cargar datos desde Supabase
 */
const SkeletonBlock = ({ width = '100%', height = '16px', borderRadius = '8px', style = {} }) => (
    <div
        className="skeleton-shimmer"
        style={{
            width,
            height,
            borderRadius,
            background: 'linear-gradient(90deg, var(--bg-soft) 25%, var(--bg-hover) 50%, var(--bg-soft) 75%)',
            backgroundSize: '200% 100%',
            ...style,
        }}
    />
);

export const KPICardSkeleton = () => (
    <div
        style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-soft)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SkeletonBlock width="60%" height="14px" />
            <SkeletonBlock width="36px" height="36px" borderRadius="10px" />
        </div>
        <SkeletonBlock width="40%" height="40px" borderRadius="10px" />
        <SkeletonBlock width="100%" height="6px" borderRadius="999px" />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <SkeletonBlock width="30%" height="12px" />
            <SkeletonBlock width="20%" height="12px" />
        </div>
    </div>
);

export const DashboardSkeleton = () => (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <SkeletonBlock width="280px" height="28px" borderRadius="10px" />
                <SkeletonBlock width="180px" height="16px" borderRadius="8px" />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <SkeletonBlock width="120px" height="40px" borderRadius="12px" />
                <SkeletonBlock width="80px" height="40px" borderRadius="12px" />
            </div>
        </div>

        {/* Metric cards row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {[1, 2, 3].map(i => <KPICardSkeleton key={i} />)}
        </div>

        {/* Area grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {[1, 2, 3, 4, 5, 6].map(i => <KPICardSkeleton key={i} />)}
        </div>
    </div>
);

export const AnalystSkeleton = () => (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header card */}
        <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: '32px',
            padding: '2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '2rem',
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                <SkeletonBlock width="200px" height="40px" borderRadius="10px" style={{ background: 'rgba(255,255,255,0.1)', backgroundSize: '200% 100%' }} />
                <SkeletonBlock width="280px" height="20px" borderRadius="8px" style={{ background: 'rgba(255,255,255,0.07)', backgroundSize: '200% 100%' }} />
            </div>
            <div style={{ width: '280px', height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '24px' }} />
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3, 4].map(i => <KPICardSkeleton key={i} />)}
        </div>
    </div>
);

export default SkeletonBlock;
