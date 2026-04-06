import { useState } from 'react';

/**
 * useAuth - Gestión de autenticación con soporte de marca activa (activeBrand)
 * Soporta usuarios con login por proveedor (Logística / Facturación)
 * y usuarios sin separación de proveedor (resto de áreas).
 */
export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState(null);

    const handleLogin = (user) => {
        setCurrentUser(user);
        // Solo guardamos info no sensible en sessionStorage
        sessionStorage.setItem('zentra_user_role', user.role);
        sessionStorage.setItem('zentra_user_name', user.name);
        sessionStorage.setItem('zentra_user_cargo', user.cargo);
        sessionStorage.setItem('zentra_user_company', user.company || 'TYM');
        if (user.activeBrand) {
            sessionStorage.setItem('zentra_user_brand', user.activeBrand);
        }
    };

    const handleLogout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('zentra_user_role');
        sessionStorage.removeItem('zentra_user_name');
        sessionStorage.removeItem('zentra_user_cargo');
        sessionStorage.removeItem('zentra_user_company');
        sessionStorage.removeItem('zentra_user_brand');
    };

    return {
        currentUser,
        handleLogin,
        handleLogout,
    };
};
