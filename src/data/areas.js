// Áreas reales de TYM/TAT basadas en el Excel
export const areas = [
  {
    id: 'logistica-entrega',
    name: 'Logística de Entrega',
    description: 'Gestión de entregas y distribución',
    responsible: 'Jefe de Logística',
    color: '#1e40af'
  },
  {
    id: 'logistica-picking',
    name: 'Logística de Picking',
    description: 'Separación y alistamiento de productos',
    responsible: 'Jefe de Logística',
    color: '#059669'
  },
  {
    id: 'logistica-deposito',
    name: 'Logística de Depósito',
    description: 'Gestión de bodega y almacenamiento',
    responsible: 'Jefe de Logística',
    color: '#d97706'
  },
  {
    id: 'talento-humano',
    name: 'Talento Humano',
    description: 'Gestión de recursos humanos',
    responsible: 'Jefe de Talento Humano',
    color: '#dc2626'
  },
  {
    id: 'caja',
    name: 'Caja',
    description: 'Control de efectivo y cierres',
    responsible: 'Controller',
    color: '#7c3aed'
  },
  {
    id: 'cartera',
    name: 'Cartera',
    description: 'Gestión de cuentas por cobrar',
    responsible: 'Analista de Cartera',
    color: '#0891b2'
  },
  {
    id: 'contabilidad',
    name: 'Contabilidad',
    description: 'Cierres contables y reportes',
    responsible: 'Contadora',
    color: '#65a30d'
  },
  {
    id: 'comercial',
    name: 'Comercial',
    description: 'Ventas y gestión comercial',
    responsible: 'Coordinador por Marca',
    color: '#ea580c'
  },
  {
    id: 'administrativo',
    name: 'Administrativo',
    description: 'Control de inventarios y precios',
    responsible: 'Analista de Inventarios',
    color: '#8b5cf6'
  }
];

export const getAreaById = (id) => areas.find(area => area.id === id);
export const getAreaColor = (id) => areas.find(area => area.id === id)?.color || '#6b7280';
