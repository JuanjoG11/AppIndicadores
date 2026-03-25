import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Clock, History, User, Database } from 'lucide-react';

const mockActivities = [
    {
        id: 1,
        type: 'update',
        user: 'Juan Pérez',
        action: 'actualizó',
        kpi: 'Rotación de Personal',
        time: 'hace 10 minutos',
        status: 'success'
    },
    {
        id: 2,
        type: 'target',
        user: 'Sistema',
        action: 'ajustó meta de',
        kpi: 'Ausentismo',
        time: 'hace 2 horas',
        status: 'info'
    },
    {
        id: 3,
        type: 'alert',
        user: 'Recordatorio',
        action: 'notificó vencimiento de',
        kpi: 'Gasto Administrativo',
        time: 'hace 5 horas',
        status: 'warning'
    },
    {
        id: 4,
        type: 'sync',
        user: 'Supabase',
        action: 'sincronizó datos de',
        kpi: 'Facturación TYM',
        time: 'hace 1 día',
        status: 'success'
    }
];

const ActivityFeed = () => {
    const getIcon = (type, status) => {
        switch (type) {
            case 'update': return <CheckCircle2 size={16} color="var(--success)" />;
            case 'target': return <Database size={16} color="var(--brand)" />;
            case 'alert': return <AlertCircle size={16} color="var(--danger)" />;
            case 'sync': return <Clock size={16} color="var(--text-light)" />;
            default: return <History size={16} />;
        }
    };

    return (
        <div className="surface-elevated" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ margin: 0, fontWeight: 900, color: 'var(--text-main)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <History size={18} /> Actividad Reciente
                </h4>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--brand)', cursor: 'pointer' }}>Ver Todo</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {mockActivities.map((act, i) => (
                    <motion.div
                        key={act.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        style={{
                            display: 'flex',
                            gap: '1rem',
                            paddingBottom: '1rem',
                            borderBottom: i === mockActivities.length - 1 ? 'none' : '1px solid var(--border-soft)',
                            position: 'relative'
                        }}
                    >
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '10px',
                            background: 'var(--bg-soft)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            {getIcon(act.type, act.status)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600, lineHeight: 1.4 }}>
                                <span style={{ fontWeight: 800 }}>{act.user}</span> {act.action}{' '}
                                <span style={{ fontWeight: 800, color: 'var(--brand)' }}>{act.kpi}</span>
                            </p>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 600 }}>{act.time}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
            
            <button style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                borderRadius: '12px',
                border: '1px solid var(--border-soft)',
                background: 'transparent',
                color: 'var(--text-main)',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = 'var(--bg-soft)'}
            onMouseOut={(e) => e.target.style.background = 'transparent'}
            >
                Cargar más actividad <Clock size={14} />
            </button>
        </div>
    );
};

export default ActivityFeed;
