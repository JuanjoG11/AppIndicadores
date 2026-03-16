import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, FileDown } from 'lucide-react';
import { motion } from 'framer-motion';

const AreaHeader = ({ area, activeCompany, filteredKPIs, selectedBrand, groupCompliance }) => {
    const navigate = useNavigate();

    const handleExport = () => {
        const companyFull = activeCompany === 'TYM' ? 'Tiendas y Marcas' : 'TAT Distribuciones';
        import('../../utils/ExportService').then(m => {
            m.exportToPDF(filteredKPIs, activeCompany, companyFull, area.name, selectedBrand);
        });
    };

    return (
        <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <button
                    onClick={() => navigate('/')}
                    className="btn-ghost"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', borderRadius: '12px',
                        fontSize: '0.85rem', fontWeight: 700,
                        marginBottom: '1.5rem'
                    }}
                >
                    <ArrowLeft size={16} /> Volver
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{
                        width: '56px', height: '56px', background: area.color || 'var(--brand)',
                        borderRadius: '16px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: 'white', 
                        boxShadow: `0 8px 16px -4px ${area.color}44`
                    }}>
                        <LayoutDashboard size={28} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
                            {area.name}
                        </h1>
                        <p style={{ color: 'var(--text-soft)', fontSize: '1rem', marginTop: '0.4rem', fontWeight: 500 }}>{area.description}</p>
                    </div>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}
            >
                <button
                    onClick={handleExport}
                    className="btn-primary"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.8rem 1.5rem',
                        borderRadius: '16px',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-soft)',
                        color: 'var(--text-main)',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                >
                    <FileDown size={18} /> Exportar PDF
                </button>

                <div className="card premium-shadow" style={{
                    padding: '1.25rem 2.5rem',
                    borderRadius: '24px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-soft)',
                    textAlign: 'center',
                    minWidth: '160px'
                }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>
                        EJECUCIÓN GLOBAL
                    </div>
                    <div style={{ 
                        fontSize: '2.5rem', 
                        fontWeight: 900, 
                        color: groupCompliance > 80 ? '#10b981' : groupCompliance > 60 ? '#f59e0b' : '#f43f5e',
                        lineHeight: 1
                    }}>
                        {groupCompliance}%
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AreaHeader;
