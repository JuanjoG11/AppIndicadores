// Áreas reales de TYM/TAT basadas en el Excel
export const areas = [
  {
    id: 'logistica',
    name: 'Logística',
    description: 'Gestión integral de entregas, picking y almacenamiento',
    responsible: 'Jefe de Logística',
    color: '#1e40af'
  },
  {
    id: 'talento-humano',
    name: 'Gestión Humana',
    description: 'Gestión de recursos humanos',
    responsible: 'Jefe de Talento Humano',
    color: '#dc2626'
  },
  {
    id: 'caja',
    name: 'Caja',
    description: 'Control de efectivo y cierres',
    responsible: 'Caja',
    color: '#7c3aed'
  },
  {
    id: 'cartera',
    name: 'Cartera',
    description: 'Gestión de cuentas por cobrar',
    responsible: 'Cartera',
    color: '#0891b2'
  },
  {
    id: 'contabilidad',
    name: 'Contabilidad',
    description: 'Cierres contables y reportes',
    responsible: 'Contabilidad',
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
    name: 'Información e Inventario',
    description: 'Control de inventarios y precios',
    responsible: 'Información/Inventario',
    color: '#8b5cf6'
  }
];

export const getAreaById = (id) => areas.find(area => area.id === id);
export const getAreaColor = (id) => areas.find(area => area.id === id)?.color || '#6b7280';
