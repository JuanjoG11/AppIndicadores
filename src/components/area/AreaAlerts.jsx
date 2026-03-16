import React from 'react';
import { AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDeadline } from '../../utils/formatters';

const AreaAlerts = ({ kpiAlerts, criticalAlerts, onEdit }) => {
    if (kpiAlerts.length === 0) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                marginBottom: '3.5rem',
                background: criticalAlerts.length > 0 ? 'rgba(254, 226, 226, 0.5)' : 'rgba(254, 243, 199, 0.5)',
                border: `1px solid ${criticalAlerts.length > 0 ? '#fca5a5' : '#fcd34d'}`,
                borderRadius: '32px',
                padding: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                backdropFilter: 'blur(8px)'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{
                    width: '56px', height: '56px',
                    background: criticalAlerts.length > 0 ? '#ef4444' : '#f59e0b',
                    borderRadius: '18px', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', color: 'white',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    <AlertCircle size={32} />
                </div>
                <div>
                    <h4 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
                        Panel de Atención Prioritaria
                    </h4>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '1rem', color: '#64748b', fontWeight: 600 }}>
                        {criticalAlerts.length > 0
                            ? `Se detectaron ${criticalAlerts.length} indicadores con plazos de carga vencidos.`
                            : `Hay indicadores que requieren tu atención antes del cierre de periodo.`}
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {kpiAlerts.slice(0, 6).map((k, index) => (
                    <motion.div 
                        key={k.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{
                            background: 'white', 
                            padding: '1.25rem', 
                            borderRadius: '20px',
                            border: `2px solid ${k.isExpired ? '#fee2e2' : '#fef3c7'}`,
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            boxShadow: 'var(--shadow-sm)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#1e293b' }}>{k.name}</div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontSize: '0.75rem', 
                                fontWeight: 800,
                                color: k.isExpired ? '#ef4444' : '#f59e0b',
                                textTransform: 'uppercase',
                                letterSpacing: '0.02em'
                            }}>
                                <Clock size={12} />
                                {k.isExpired ? 'VENCIDO DESDE: ' : 'CIERRA EN: '} {formatDeadline(k.deadline)}
                            </div>
                        </div>
                        <button
                            onClick={() => onEdit(k)}
                            style={{
                                background: k.isExpired ? '#ef4444' : '#f59e0b',
                                color: 'white', 
                                border: 'none',
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                            }}
                            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default AreaAlerts;
