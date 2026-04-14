import React, { useState } from 'react';
import { Search, User, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { lookupNameByCedula, isValidCedula } from '../../utils/idValidation';

const IDLookupField = ({ value, onChange, label = "Número de Cédula", placeholder = "Eje: 1017123456" }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleLookup = async () => {
        if (!isValidCedula(value)) {
            setError('Ingresa un número de cédula válido');
            return;
        }

        setError('');
        setSuccess(false);
        setLoading(true);
        setName('');

        try {
            const foundName = await lookupNameByCedula(value);
            if (foundName) {
                setName(foundName);
                setSuccess(true);
                // Optionally call onChange with the name as well if the parent supports it
            } else {
                setError('No se encontró el nombre en ADRES. Inténtalo manual.');
            }
        } catch (err) {
            setError('Error al consultar ADRES. Verifica tu conexión.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="id-lookup-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                {label}
            </label>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        style={{
                            width: '100%',
                            padding: '0.85rem 1rem',
                            paddingLeft: '2.5rem',
                            border: error ? '2px solid #ef4444' : '2px solid #e2e8f0',
                            borderRadius: '14px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            outline: 'none',
                            transition: 'all 0.2s'
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                        onBlur={e => e.currentTarget.style.borderColor = error ? '#ef4444' : '#e2e8f0'}
                    />
                    <Search 
                        size={18} 
                        style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
                    />
                </div>
                
                <button
                    type="button"
                    onClick={handleLookup}
                    disabled={loading || !value}
                    style={{
                        padding: '0 1.25rem',
                        borderRadius: '14px',
                        background: 'var(--brand-gradient, #2563eb)',
                        color: 'white',
                        border: 'none',
                        fontWeight: 700,
                        cursor: (loading || !value) ? 'not-allowed' : 'pointer',
                        opacity: (loading || !value) ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Validar'}
                </button>
            </div>

            {/* Resultado del Nombre */}
            {(name || error || loading) && (
                <div style={{
                    marginTop: '0.25rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    background: error ? '#fef2f2' : (success ? '#f0fdf4' : '#f8fafc'),
                    border: `1px solid ${error ? '#fee2e2' : (success ? '#dcfce7' : '#e2e8f0')}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '0.9rem',
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    {error ? (
                        <AlertCircle size={18} color="#ef4444" />
                    ) : (
                        success ? <CheckCircle2 size={18} color="#22c55e" /> : <Loader2 className="animate-spin" size={18} color="#64748b" />
                    )}
                    
                    <div style={{ flex: 1 }}>
                        {loading ? (
                            <span style={{ color: '#64748b', fontWeight: 500 }}>Consultando ADRES...</span>
                        ) : error ? (
                            <span style={{ color: '#b91c1c', fontWeight: 600 }}>{error}</span>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.7rem', color: '#15803d', fontWeight: 800, textTransform: 'uppercase' }}>Nombre Encontrado</span>
                                <span style={{ color: '#166534', fontWeight: 700, fontSize: '1rem' }}>{name}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default IDLookupField;
