import { useState } from 'react';

/**
 * Intenta restaurar la sesión guardada en sessionStorage.
 * Retorna el objeto de usuario o null si no hay sesión válida.
 */
const restoreSession = () => {
    const role = sessionStorage.getItem('zentra_user_role');
    const name = sessionStorage.getItem('zentra_user_name');
    if (!role || !name) return null;

    // activeBrand puede ser un array serializado o un string simple
    let activeBrand = null;
    const rawBrand = sessionStorage.getItem('zentra_user_brand');
    if (rawBrand) {
        try {
            activeBrand = JSON.parse(rawBrand);
        } catch {
            activeBrand = rawBrand;
        }
    }

    // authorizedAreas siempre se guarda como JSON
    let authorizedAreas = ['all'];
    const rawAreas = sessionStorage.getItem('zentra_user_areas');
    if (rawAreas) {
        try {
            authorizedAreas = JSON.parse(rawAreas);
        } catch {
            authorizedAreas = ['all'];
        }
    }

    return {
        name,
        role,
        cargo: sessionStorage.getItem('zentra_user_cargo') || '',
        company: sessionStorage.getItem('zentra_user_company') || 'TYM',
        activeBrand,
        authorizedAreas,
        isKiosk: sessionStorage.getItem('zentra_user_kiosk') === 'true',
    };
};

/**
 * useAuth - Gestión de autenticación con soporte de marca activa (activeBrand)
 * Soporta usuarios con login por proveedor (Logística / Facturación)
 * y usuarios sin separación de proveedor (resto de áreas).
 * La sesión persiste al recargar la página (F5) usando sessionStorage.
 */
export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState(() => restoreSession());

    const handleLogin = (user) => {
        setCurrentUser(user);
        // Persistir sesión en sessionStorage
        sessionStorage.setItem('zentra_user_role', user.role);
        sessionStorage.setItem('zentra_user_name', user.name);
        sessionStorage.setItem('zentra_user_cargo', user.cargo || '');
        sessionStorage.setItem('zentra_user_company', user.company || 'TYM');
        sessionStorage.setItem('zentra_user_areas', JSON.stringify(user.authorizedAreas || ['all']));
        if (user.activeBrand !== undefined && user.activeBrand !== null) {
            sessionStorage.setItem('zentra_user_brand', JSON.stringify(user.activeBrand));
        } else {
            sessionStorage.removeItem('zentra_user_brand');
        }
        sessionStorage.setItem('zentra_user_kiosk', user.isKiosk ? 'true' : 'false');
    };

    const handleLogout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('zentra_user_role');
        sessionStorage.removeItem('zentra_user_name');
        sessionStorage.removeItem('zentra_user_cargo');
        sessionStorage.removeItem('zentra_user_company');
        sessionStorage.removeItem('zentra_user_brand');
        sessionStorage.removeItem('zentra_user_areas');
        sessionStorage.removeItem('zentra_user_kiosk');
    };

    return {
        currentUser,
        handleLogin,
        handleLogout,
    };
};
