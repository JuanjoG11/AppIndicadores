import React from 'react';
import { Package, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const AreaFilters = ({ 
    subAreas, 
    activeSubArea, 
    setActiveSubArea, 
    showBrandFilter, 
    brandsForEntity, 
    selectedBrand, 
    setSelectedBrand 
}) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
            {/* Sub-areas Navigation */}
            {subAreas.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-soft)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <Layers size={16} /> Sub-Procesos
                    </div>
                    <div style={{
                        display: 'flex',
                        gap: '0.75rem',
                        background: 'var(--bg-card)',
                        padding: '0.6rem',
                        borderRadius: '20px',
                        width: 'fit-content',
                        border: '1px solid var(--border-soft)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        {subAreas.map(sub => (
                            <button
                                key={sub}
                                onClick={() => setActiveSubArea(sub === 'Todas' ? 'all' : sub)}
                                style={{
                                    padding: '0.7rem 1.4rem',
                                    borderRadius: '14px',
                                    border: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    background: (activeSubArea === sub || (sub === 'Todas' && activeSubArea === 'all')) ? 'var(--brand)' : 'transparent',
                                    color: (activeSubArea === sub || (sub === 'Todas' && activeSubArea === 'all')) ? 'white' : 'var(--text-soft)',
                                    transform: (activeSubArea === sub || (sub === 'Todas' && activeSubArea === 'all')) ? 'scale(1.05)' : 'scale(1)',
                                    boxShadow: (activeSubArea === sub || (sub === 'Todas' && activeSubArea === 'all')) ? '0 10px 15px -3px rgba(var(--brand-rgb), 0.3)' : 'none'
                                }}
                            >
                                {sub === 'Todas' ? 'Todas' : sub.split('Logística de ')[1] || sub}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Brand Filter row */}
            {showBrandFilter && brandsForEntity.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-soft)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <Package size={16} /> Filtrar por Marca
                    </div>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        padding: '0.5rem',
                        background: 'var(--bg-soft)',
                        borderRadius: '20px',
                        width: 'fit-content',
                        border: '1px solid var(--border-soft)'
                    }}>
                        {brandsForEntity.map(brand => (
                            <button
                                key={brand}
                                onClick={() => setSelectedBrand(brand)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    padding: '0.6rem 1.25rem',
                                    borderRadius: '14px',
                                    border: '1px solid',
                                    borderColor: selectedBrand === brand ? 'var(--brand)' : 'var(--border-soft)',
                                    fontSize: '0.85rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    background: selectedBrand === brand ? 'var(--brand)' : 'var(--bg-card)',
                                    color: selectedBrand === brand ? 'white' : 'var(--text-main)',
                                    boxShadow: selectedBrand === brand ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                <Package size={14} /> {brand}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AreaFilters;
