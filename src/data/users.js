/**
 * ZENTRA - Tabla de Usuarios del Sistema
 * 
 * Áreas con login por proveedor: LOGÍSTICA y FACTURACIÓN
 *   TYM → Alpina, Zenú, Fleischmann
 *   TAT → Unilever, Familia
 *
 * Resto de áreas: login simple por área (sin separación de proveedor)
 * Gerente: acceso total, cambia empresa desde el dashboard
 */

export const SYSTEM_USERS = [

    // ═══════════════════════════════════════════
    // GERENCIA - Acceso total
    // ═══════════════════════════════════════════
    {
        username: 'gerente',
        password: 'Zentra2026!',
        name: 'Gerencia General',
        role: 'Gerente',
        cargo: 'Gerente',
        company: 'TYM',         // Empresa por defecto (puede cambiar en dashboard)
        activeBrand: null,       // Ve todas las marcas
        allowedAreas: ['all'],
        color: '#2563eb',
        icon: 'ShieldCheck'
    },

    // ═══════════════════════════════════════════
    // LOGÍSTICA  - TYM (por proveedor)
    // ═══════════════════════════════════════════
    {
        username: 'log_alpina',
        password: 'Log_Alpina26',
        name: 'Logística · Alpina',
        role: 'Analista',
        cargo: 'LOGISTICA',
        company: 'TYM',
        activeBrand: 'ALPINA',
        allowedAreas: ['logistica'],
        color: '#0ea5e9',
        icon: 'Truck'
    },
    {
        username: 'log_zenu',
        password: 'Log_Zenu26',
        name: 'Logística · Zenú',
        role: 'Analista',
        cargo: 'LOGISTICA',
        company: 'TYM',
        activeBrand: 'ZENU',
        allowedAreas: ['logistica'],
        color: '#0ea5e9',
        icon: 'Truck'
    },
    {
        username: 'log_fleisch',
        password: 'Log_Fleisch26',
        name: 'Logística · Fleischmann',
        role: 'Analista',
        cargo: 'LOGISTICA',
        company: 'TYM',
        activeBrand: 'FLEISCHMANN',
        allowedAreas: ['logistica'],
        color: '#0ea5e9',
        icon: 'Truck'
    },

    // ═══════════════════════════════════════════
    // LOGÍSTICA - TAT (por proveedor)
    // ═══════════════════════════════════════════
    {
        username: 'log_unilever',
        password: 'Log_Unilever26',
        name: 'Logística · Unilever',
        role: 'Analista',
        cargo: 'LOGISTICA',
        company: 'TAT',
        activeBrand: 'UNILEVER',
        allowedAreas: ['logistica'],
        color: '#0ea5e9',
        icon: 'Truck'
    },
    {
        username: 'log_familia',
        password: 'Log_Familia26',
        name: 'Logística · Familia',
        role: 'Analista',
        cargo: 'LOGISTICA',
        company: 'TAT',
        activeBrand: 'FAMILIA',
        allowedAreas: ['logistica'],
        color: '#0ea5e9',
        icon: 'Truck'
    },

    // ═══════════════════════════════════════════
    // FACTURACIÓN - TYM (por proveedor)
    // ═══════════════════════════════════════════
    {
        username: 'fact_alpina',
        password: 'Fact_Alpina26',
        name: 'Facturación · Alpina',
        role: 'Analista',
        cargo: 'FACTURACION',
        company: 'TYM',
        activeBrand: 'ALPINA',
        allowedAreas: ['facturacion'],
        color: '#06b6d4',
        icon: 'ClipboardList'
    },
    {
        username: 'fact_zenu',
        password: 'Fact_Zenu26',
        name: 'Facturación · Zenú',
        role: 'Analista',
        cargo: 'FACTURACION',
        company: 'TYM',
        activeBrand: 'ZENU',
        allowedAreas: ['facturacion'],
        color: '#06b6d4',
        icon: 'ClipboardList'
    },
    {
        username: 'fact_fleisch',
        password: 'Fact_Fleisch26',
        name: 'Facturación · Fleischmann',
        role: 'Analista',
        cargo: 'FACTURACION',
        company: 'TYM',
        activeBrand: 'FLEISCHMANN',
        allowedAreas: ['facturacion'],
        color: '#06b6d4',
        icon: 'ClipboardList'
    },

    // ═══════════════════════════════════════════
    // FACTURACIÓN - TAT (por proveedor)
    // ═══════════════════════════════════════════
    {
        username: 'fact_unilever',
        password: 'Fact_Unilever26',
        name: 'Facturación · Unilever',
        role: 'Analista',
        cargo: 'FACTURACION',
        company: 'TAT',
        activeBrand: 'UNILEVER',
        allowedAreas: ['facturacion'],
        color: '#06b6d4',
        icon: 'ClipboardList'
    },
    {
        username: 'fact_familia',
        password: 'Fact_Familia26',
        name: 'Facturación · Familia',
        role: 'Analista',
        cargo: 'FACTURACION',
        company: 'TAT',
        activeBrand: 'FAMILIA',
        allowedAreas: ['facturacion'],
        color: '#06b6d4',
        icon: 'ClipboardList'
    },

    // ═══════════════════════════════════════════
    // GESTIÓN HUMANA (sin separación de proveedor)
    // ═══════════════════════════════════════════
    {
        username: 'rrhh_tym',
        password: 'RRHH_TYM26',
        name: 'Gestión Humana · TYM',
        role: 'Analista',
        cargo: 'GESTIÓN HUMANA',
        company: 'TYM',
        activeBrand: null,
        allowedAreas: ['talento-humano'],
        color: '#8b5cf6',
        icon: 'HeartHandshake'
    },
    {
        username: 'rrhh_tat',
        password: 'RRHH_TAT26',
        name: 'Gestión Humana · TAT',
        role: 'Analista',
        cargo: 'GESTIÓN HUMANA',
        company: 'TAT',
        activeBrand: null,
        allowedAreas: ['talento-humano'],
        color: '#8b5cf6',
        icon: 'HeartHandshake'
    },

    // ═══════════════════════════════════════════
    // CONTADOR (sin separación de proveedor)
    // ═══════════════════════════════════════════
    {
        username: 'contador_tym',
        password: 'Conta_TYM26',
        name: 'Contabilidad · TYM',
        role: 'Analista',
        cargo: 'CONTADOR',
        company: 'TYM',
        activeBrand: null,
        allowedAreas: ['contabilidad', 'caja', 'cartera'],
        color: '#f59e0b',
        icon: 'Calculator'
    },
    {
        username: 'contador_tat',
        password: 'Conta_TAT26',
        name: 'Contabilidad · TAT',
        role: 'Analista',
        cargo: 'CONTADOR',
        company: 'TAT',
        activeBrand: null,
        allowedAreas: ['contabilidad', 'caja', 'cartera'],
        color: '#f59e0b',
        icon: 'Calculator'
    },

    // ═══════════════════════════════════════════
    // CAJA (sin separación de proveedor)
    // ═══════════════════════════════════════════
    {
        username: 'caja_tym',
        password: 'Caja_TYM26',
        name: 'Caja · TYM',
        role: 'Analista',
        cargo: 'CAJA',
        company: 'TYM',
        activeBrand: null,
        allowedAreas: ['caja'],
        color: '#6366f1',
        icon: 'Banknote'
    },
    {
        username: 'caja_tat',
        password: 'Caja_TAT26',
        name: 'Caja · TAT',
        role: 'Analista',
        cargo: 'CAJA',
        company: 'TAT',
        activeBrand: null,
        allowedAreas: ['caja'],
        color: '#6366f1',
        icon: 'Banknote'
    },

    // ═══════════════════════════════════════════
    // CARTERA (sin separación de proveedor)
    // ═══════════════════════════════════════════
    {
        username: 'cartera_tym',
        password: 'Cart_TYM26',
        name: 'Cartera · TYM',
        role: 'Analista',
        cargo: 'CARTERA',
        company: 'TYM',
        activeBrand: null,
        allowedAreas: ['cartera'],
        color: '#f43f5e',
        icon: 'Wallet'
    },
    {
        username: 'cartera_tat',
        password: 'Cart_TAT26',
        name: 'Cartera · TAT',
        role: 'Analista',
        cargo: 'CARTERA',
        company: 'TAT',
        activeBrand: null,
        allowedAreas: ['cartera'],
        color: '#f43f5e',
        icon: 'Wallet'
    },

    // ═══════════════════════════════════════════
    // COMERCIAL (sin separación de proveedor)
    // ═══════════════════════════════════════════
    {
        username: 'comercial_tym',
        password: 'Com_TYM26',
        name: 'Comercial · TYM',
        role: 'Analista',
        cargo: 'ANALISTA DE INFORMACIÓN',
        company: 'TYM',
        activeBrand: null,
        allowedAreas: ['comercial', 'administrativo'],
        color: '#ec4899',
        icon: 'Target'
    },
    {
        username: 'comercial_tat',
        password: 'Com_TAT26',
        name: 'Comercial · TAT',
        role: 'Analista',
        cargo: 'ANALISTA DE INFORMACIÓN',
        company: 'TAT',
        activeBrand: null,
        allowedAreas: ['comercial', 'administrativo'],
        color: '#ec4899',
        icon: 'Target'
    },
];

/**
 * Valida credenciales y retorna el usuario si son correctas
 */
export const authenticateUser = (username, password) => {
    const user = SYSTEM_USERS.find(
        u => u.username.toLowerCase() === username.toLowerCase().trim() &&
             u.password === password
    );
    return user || null;
};
