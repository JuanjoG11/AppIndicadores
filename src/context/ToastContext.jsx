import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

// ─── Context ────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

// ─── Toast Types Config ──────────────────────────────────────────────────────
const TOAST_TYPES = {
    success: {
        icon: <CheckCircle2 size={18} />,
        color: '#10b981',
        bg: '#ecfdf5',
        border: '#a7f3d0',
    },
    error: {
        icon: <XCircle size={18} />,
        color: '#ef4444',
        bg: '#fef2f2',
        border: '#fecaca',
    },
    info: {
        icon: <Info size={18} />,
        color: '#2563eb',
        bg: '#eff6ff',
        border: '#bfdbfe',
    },
    warning: {
        icon: <AlertTriangle size={18} />,
        color: '#f59e0b',
        bg: '#fffbeb',
        border: '#fde68a',
    },
};

// ─── Single Toast Component ──────────────────────────────────────────────────
const Toast = ({ id, type = 'info', message, onClose }) => {
    const config = TOAST_TYPES[type] || TOAST_TYPES.info;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1.25rem',
                background: config.bg,
                border: `1px solid ${config.border}`,
                borderLeft: `4px solid ${config.color}`,
                borderRadius: '14px',
                boxShadow: '0 8px 24px -4px rgba(0,0,0,0.1)',
                minWidth: '300px',
                maxWidth: '420px',
                animation: 'toastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Shimmer bar */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '3px',
                width: '100%',
                background: config.color,
                opacity: 0.3,
                animation: 'toastProgress 4s linear forwards',
            }} />

            <span style={{ color: config.color, flexShrink: 0, display: 'flex' }}>
                {config.icon}
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', flex: 1, lineHeight: 1.4 }}>
                {message}
            </span>
            <button
                onClick={() => onClose(id)}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                    borderRadius: '6px',
                    flexShrink: 0,
                    transition: 'color 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.color = '#475569'}
                onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
            >
                <X size={16} />
            </button>
        </div>
    );
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(0);

    const addToast = useCallback((type, message, duration = 4000) => {
        const id = ++idRef.current;
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => removeToast(id), duration);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={addToast}>
            {children}

            {/* Toast Container */}
            <div
                style={{
                    position: 'fixed',
                    bottom: '1.5rem',
                    right: '1.5rem',
                    zIndex: 99999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    alignItems: 'flex-end',
                    pointerEvents: 'none',
                }}
            >
                {toasts.map(toast => (
                    <div key={toast.id} style={{ pointerEvents: 'all' }}>
                        <Toast {...toast} onClose={removeToast} />
                    </div>
                ))}
            </div>

            <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    }
        }
        @keyframes toastProgress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
        </ToastContext.Provider>
    );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};
