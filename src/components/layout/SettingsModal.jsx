import React, { useState } from 'react';
import {
    X,
    Moon,
    Sun,
    Download,
    Target,
    Users,
    Settings as SettingsIcon,
    Check
} from 'lucide-react';

const SettingsModal = ({ currentUser, kpiData, onUpdateKPI, theme, onToggleTheme, onClose }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [localKPIs, setLocalKPIs] = useState([...kpiData]);
    const [saveStatus, setSaveStatus] = useState('');

    const handleExportCSV = () => {
        const headers = ['ID', 'Nombre', 'Area', 'Responsable', 'Meta', 'Valor Actual', 'Cumplimiento', 'Semaforo'];
        const rows = kpiData.map(k => [
            k.id,
            k.name,
            k.area,
            k.responsable,
            typeof k.meta === 'object' ? JSON.stringify(k.meta) : k.meta,
            k.currentValue || 0,
            k.compliance || 0,
            k.semaphore
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `indicadores_zentra_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUpdateMeta = (kpiId, newMeta) => {
        const value = parseFloat(newMeta);
        if (isNaN(value)) return;

        onUpdateKPI(kpiId, { targetMeta: value });
        setSaveStatus('Meta actualizada correctamente');
        setTimeout(() => setSaveStatus(''), 3000);
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div style={{
                width: '95%',
                maxWidth: '800px',
                height: window.innerWidth <= 600 ? '90vh' : '600px',
                background: 'var(--bg-card)',
                borderRadius: '24px',
                display: 'flex',
                flexDirection: window.innerWidth <= 600 ? 'column' : 'row',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-soft)'
            }} onClick={e => e.stopPropagation()}>

                {/* Sidebar */}
                <div style={{
                    width: window.innerWidth <= 600 ? '100%' : '240px',
                    height: window.innerWidth <= 600 ? 'auto' : '100%',
                    background: 'var(--bg-soft)',
                    borderRight: window.innerWidth <= 600 ? 'none' : '1px solid var(--border-soft)',
                    borderBottom: window.innerWidth <= 600 ? '1px solid var(--border-soft)' : 'none',
                    padding: window.innerWidth <= 600 ? '1rem' : '2rem 1rem',
                    display: 'flex',
                    flexDirection: window.innerWidth <= 600 ? 'row' : 'column',
                    gap: '0.5rem',
                    overflowX: 'auto'
                }}>
                    <div style={{ display: window.innerWidth <= 600 ? 'none' : 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1rem', marginBottom: '2rem' }}>
                        <SettingsIcon size={20} className="text-brand" />
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>CONFIGURACIÓN</span>
                    </div>

                    {[
                        { id: 'general', label: 'General', icon: <SettingsIcon size={18} /> },
                        { id: 'goals', label: 'Metas', icon: <Target size={18} /> },
                        { id: 'data', label: 'Datos', icon: <Download size={18} /> },
                        { id: 'users', label: 'Usuarios', icon: <Users size={18} /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: activeTab === tab.id ? 'var(--brand)' : 'transparent',
                                color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {tab.icon}
                            {window.innerWidth <= 600 ? null : tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                        padding: '1.5rem 2rem',
                        borderBottom: '1px solid var(--border-soft)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            {activeTab === 'general' && 'Ajustes Generales'}
                            {activeTab === 'goals' && 'Editor de Metas'}
                            {activeTab === 'data' && 'Exportación de Datos'}
                            {activeTab === 'users' && 'Gestión de Accesos'}
                        </h2>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={24} />
                        </button>
                    </div>

                    <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                        {activeTab === 'general' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ color: 'var(--text-main)' }}>Tema Visual</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cambia entre modo claro y oscuro</p>
                                    </div>
                                    <button
                                        onClick={onToggleTheme}
                                        style={{
                                            padding: '0.6rem 1.2rem',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border-soft)',
                                            background: 'var(--bg-soft)',
                                            color: 'var(--text-main)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            cursor: 'pointer',
                                            fontWeight: 700
                                        }}
                                    >
                                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                                        {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'goals' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {saveStatus && (
                                    <div style={{ padding: '0.75rem', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Check size={16} /> {saveStatus}
                                    </div>
                                )}
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Ajusta las metas estratégicas para toda la organización. Estos cambios afectan el semáforo de cumplimiento.</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {kpiData.map(k => (
                                        <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-soft)', borderRadius: '16px' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{k.name}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input
                                                    type="number"
                                                    defaultValue={typeof k.meta === 'number' ? k.meta : 0}
                                                    onBlur={(e) => handleUpdateMeta(k.id, e.target.value)}
                                                    style={{
                                                        width: '80px',
                                                        padding: '0.4rem',
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--border-soft)',
                                                        background: 'var(--bg-card)',
                                                        color: 'var(--text-main)',
                                                        textAlign: 'right',
                                                        fontWeight: 700
                                                    }}
                                                />
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{k.unit}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'data' && (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    background: 'var(--brand-bg)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--brand)',
                                    margin: '0 auto 1.5rem'
                                }}>
                                    <Download size={40} />
                                </div>
                                <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Exportar Reporte de Gestión</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Descarga un archivo CSV con el estado actual de todos los indicadores clave de desempeño de la compañía.</p>
                                <button
                                    onClick={handleExportCSV}
                                    style={{
                                        padding: '1rem 2rem',
                                        background: 'var(--brand)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '16px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        boxShadow: 'var(--shadow-md)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        margin: '0 auto'
                                    }}
                                >
                                    <Download size={20} />
                                    Descargar Excel (.csv)
                                </button>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Resumen de accesos y roles configurados en el sistema.</p>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
                                            <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>USUARIO</th>
                                            <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>ROL</th>
                                            <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>EMPRESA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { name: 'Gerencia', role: 'Gerencia', co: 'TYM/TAT' },
                                            { name: 'SST', role: 'Analista', co: 'TYM' },
                                            { name: 'Contador', role: 'Finanzas', co: 'TAT' }
                                        ].map((u, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                                                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>{u.name}</td>
                                                <td style={{ padding: '1rem' }}><span style={{ padding: '0.2rem 0.6rem', background: 'var(--brand-bg)', color: 'var(--brand)', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>{u.role}</span></td>
                                                <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.co}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
