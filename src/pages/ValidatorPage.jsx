import React, { useState, useEffect } from 'react';
import { 
    ShieldCheck, Users, RefreshCw, FileText, 
    List, Search, Play, Download, Trash2, 
    CheckCircle2, XCircle, AlertCircle, Loader2
} from 'lucide-react';
import IDLookupField from '../components/common/IDLookupField';
import { lookupNameByCedula } from '../utils/idValidation';

const ValidatorPage = () => {
    const [activeTab, setActiveTab] = useState('single'); // 'single' or 'bulk'
    const [singleCedula, setSingleCedula] = useState('');
    
    // Bulk state
    const [bulkInput, setBulkInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [results, setResults] = useState([]);
    const [progress, setProgress] = useState(0);
    const [stopRequested, setStopRequested] = useState(false);

    const handleSingleIdChange = (val) => {
        setSingleCedula(val);
    };

    const processBulk = async () => {
        const ids = bulkInput.split(/\r?\n/).map(id => id.trim()).filter(id => id !== '');
        if (ids.length === 0) return;

        setIsProcessing(true);
        setResults([]);
        setProgress(0);
        setStopRequested(false);

        for (let i = 0; i < ids.length; i++) {
            if (stopRequested) break;

            const id = ids[i];
            
            // Minimal delay to avoid aggressive blocking
            await new Promise(resolve => setTimeout(resolve, 500));

            try {
                const result = await lookupNameByCedula(id);
                setResults(prev => [{
                    id,
                    name: result.name || 'No encontrado',
                    status: result.success ? 'success' : 'not_found',
                    error: result.error
                }, ...prev]);
            } catch (err) {
                setResults(prev => [{
                    id,
                    name: 'Error',
                    status: 'error',
                    error: 'Error de conexión'
                }, ...prev]);
            }

            setProgress(Math.round(((i + 1) / ids.length) * 100));
        }

        setIsProcessing(false);
    };

    const copyToClipboard = () => {
        const text = results.map(r => `${r.id}\t${r.name}`).join('\n');
        navigator.clipboard.writeText(text);
        alert('Copiado al portapapeles');
    };

    return (
        <div style={{ padding: '2.5rem', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ padding: '0.5rem', background: 'var(--brand-bg)', borderRadius: '12px' }}>
                        <ShieldCheck size={28} color="var(--brand)" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
                            Validador de Identidad
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 500, margin: 0 }}>
                            Consulta oficial nombres por Cédula (vía ADRES)
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', borderBottom: '1px solid #e2e8f0' }}>
                    <button 
                        onClick={() => setActiveTab('single')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            background: 'none',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: activeTab === 'single' ? 'var(--brand)' : '#64748b',
                            borderBottom: activeTab === 'single' ? '3px solid var(--brand)' : '3px solid transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Search size={18} /> Consulta Individual
                    </button>
                    <button 
                        onClick={() => setActiveTab('bulk')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            background: 'none',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: activeTab === 'bulk' ? 'var(--brand)' : '#64748b',
                            borderBottom: activeTab === 'bulk' ? '3px solid var(--brand)' : '3px solid transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <List size={18} /> Consulta Masiva
                    </button>
                </div>
            </header>

            {activeTab === 'single' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }}>
                    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                                Consulta Individual
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                Ingresa el número de documento para obtener el nombre completo registrado.
                            </p>
                        </div>

                        <IDLookupField 
                            value={singleCedula} 
                            onChange={handleSingleIdChange}
                            placeholder="Escribe la cédula aquí..."
                        />

                        <div style={{ 
                            marginTop: '2.5rem',
                            padding: '1.25rem', 
                            background: '#f8fafc', 
                            borderRadius: '16px', 
                            border: '1px dashed #e2e8f0',
                            fontSize: '0.85rem',
                            color: '#64748b',
                            lineHeight: 1.5
                        }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <FileText size={16} color="var(--brand)" />
                                <strong style={{ color: '#475569' }}>Nota sobre la fuente:</strong>
                            </div>
                            Esta herramienta consulta en tiempo real la Base de Datos Única de Afiliados (BDUA) de la ADRES.
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="card" style={{ padding: '2rem', borderRadius: '24px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <Users size={24} color="var(--brand-light)" />
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Casos de Uso</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {[
                                    { title: 'Registro de Retiros', text: 'Valida el nombre al registrar rotación de personal.' },
                                    { title: 'Verificación de Terceros', text: 'Asegura que el nombre en facturas coincida con la cédula.' }
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>{i+1}</div>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.2rem' }}>{item.title}</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{item.text}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 0.5fr) 1fr', gap: '2.5rem' }}>
                        <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                                    Entrada de Datos
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                    Pega la lista de cédulas (una por línea).
                                </p>
                            </div>

                            <textarea 
                                value={bulkInput}
                                onChange={(e) => setBulkInput(e.target.value)}
                                placeholder="Ejemplo:&#10;24414747&#10;31403139&#10;1108150533"
                                disabled={isProcessing}
                                style={{
                                    width: '100%',
                                    height: '350px',
                                    padding: '1rem',
                                    borderRadius: '16px',
                                    border: '2px solid #e2e8f0',
                                    fontFamily: 'monospace',
                                    fontSize: '0.9rem',
                                    resize: 'none',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    background: isProcessing ? '#f1f5f9' : 'white'
                                }}
                            />

                            <div style={{ marginTop: '1.5rem' }}>
                                {!isProcessing ? (
                                    <button 
                                        onClick={processBulk}
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            background: 'var(--brand)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: 800,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.75rem',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(var(--brand-rgb), 0.2)'
                                        }}
                                    >
                                        <Play size={18} fill="currentColor" /> Iniciar Procesamiento
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setStopRequested(true)}
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            background: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: 800,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.75rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Detener
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="card" style={{ 
                            padding: '2rem', 
                            background: 'white', 
                            borderRadius: '24px', 
                            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                                    Resultados ({results.length})
                                </h3>
                                {results.length > 0 && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button 
                                            onClick={copyToClipboard}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: '#f1f5f9',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                fontSize: '0.8rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <Download size={14} /> Copiar Tabla
                                        </button>
                                        <button 
                                            onClick={() => setResults([])}
                                            disabled={isProcessing}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: '#fee2e2',
                                                border: '1px solid #fecaca',
                                                color: '#b91c1c',
                                                borderRadius: '8px',
                                                fontSize: '0.8rem',
                                                fontWeight: 700,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Limpiar
                                        </button>
                                    </div>
                                )}
                            </div>

                            {isProcessing && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                        <span style={{ fontWeight: 700, color: 'var(--brand)' }}>Procesando...</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            height: '100%', 
                                            width: `${progress}%`, 
                                            background: 'var(--brand)', 
                                            transition: 'width 0.3s ease' 
                                        }} />
                                    </div>
                                </div>
                            )}

                            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '430px', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>Cédula</th>
                                            <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>Nombre Completo</th>
                                            <th style={{ textAlign: 'center', padding: '1rem', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
                                                    <div style={{ marginBottom: '1rem' }}><Search size={40} opacity={0.2} /></div>
                                                    Sin resultados aún
                                                </td>
                                            </tr>
                                        ) : (
                                            results.map((r, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{r.id}</td>
                                                    <td style={{ padding: '0.75rem 1rem' }}>{r.name}</td>
                                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                                                        {r.status === 'success' ? (
                                                            <CheckCircle2 size={18} color="#22c55e" />
                                                        ) : r.status === 'not_found' ? (
                                                            <AlertCircle size={18} color="#eab308" />
                                                        ) : (
                                                            <XCircle size={18} color="#ef4444" />
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                textarea::-webkit-scrollbar { width: 6px; }
                textarea::-webkit-scrollbar-track { background: transparent; }
                textarea::-webkit-scrollbar-thumb { background: #e2e8f0; borderRadius: 3px; }
            `}</style>
        </div>
    );
};

export default ValidatorPage;

