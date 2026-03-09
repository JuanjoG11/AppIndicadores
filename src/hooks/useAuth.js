import { useState } from 'react';

/**
 * useAuth - Custom hook para la gestión de autenticación
 * Extrae toda la lógica de login/logout del componente App
 */
export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState(null);

    const handleLogin = (user) => {
        setCurrentUser(user);
        // Guardar referencia básica en sessionStorage (no datos sensibles)
        sessionStorage.setItem('zentra_user_role', user.role);
        sessionStorage.setItem('zentra_user_name', user.name);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('zentra_user_role');
        sessionStorage.removeItem('zentra_user_name');
    };

    return {
        currentUser,
        handleLogin,
        handleLogout,
    };
};
