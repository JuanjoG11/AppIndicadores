import React from 'react';
import KPIDetailCard from '../dashboard/KPIDetailCard';
import { motion, AnimatePresence } from 'framer-motion';

const AreaKPIList = ({ 
    areaId, 
    activeSubArea, 
    filteredKPIs, 
    canModify, 
    handleStartEdit, 
    currentUser, 
    activeCompany, 
    selectedBrand 
}) => {
    
    // Grouping logic for logistics
    const isLogisticsGrouped = areaId === 'logistica' && (activeSubArea === 'all' || activeSubArea === 'Todas');
    const logisticSections = ['Logística de Depósito', 'Logística de Picking', 'Logística de Entrega'];

    const renderKPIs = (kpis) => (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            <AnimatePresence mode="popLayout">
                {kpis.map((kpi, index) => (
                    <motion.div
                        key={kpi.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                        <KPIDetailCard
                            kpi={kpi}
                            canEdit={canModify}
                            onEdit={handleStartEdit}
                            currentUser={currentUser}
                            activeCompany={activeCompany}
                            selectedBrand={selectedBrand}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {isLogisticsGrouped ? (
                logisticSections.map(sub => {
                    const sectionKPIs = filteredKPIs.filter(k => k.subArea === sub);
                    if (sectionKPIs.length === 0) return null;
                    
                    return (
                        <div key={sub} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '16px', height: '4px', background: 'var(--brand)', borderRadius: '4px' }}></div>
                                <h3 style={{ 
                                    margin: 0, 
                                    fontSize: '1rem', 
                                    fontWeight: 900, 
                                    color: 'var(--text-soft)', 
                                    textTransform: 'uppercase', 
                                    letterSpacing: '0.1em' 
                                }}>
                                    {sub}
                                </h3>
                            </div>
                            {renderKPIs(sectionKPIs)}
                        </div>
                    );
                })
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '16px', height: '4px', background: 'var(--brand)', borderRadius: '4px' }}></div>
                        <h3 style={{ 
                            margin: 0, 
                            fontSize: '1.1rem', 
                            fontWeight: 900, 
                            color: 'var(--text-main)', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.05em' 
                        }}>
                            {activeSubArea === 'all' ? 'Indicadores del Proceso' : activeSubArea}
                        </h3>
                    </div>
                    {renderKPIs(filteredKPIs)}
                </div>
            )}
        </div>
    );
};

export default AreaKPIList;
