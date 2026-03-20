-- Configuración de Tablas con Seguridad de Nivel de Fila (RLS) para Multi-tenancy
-- Este archivo prepara la base de datos para manejar múltiples empresas de forma aislada.

CREATE TABLE IF NOT EXISTS kpi_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id TEXT NOT NULL, -- Identificador de la empresa (ej: 'TYM', 'TAT', 'EMPRESA_CLIENTE_1')
  kpi_id TEXT NOT NULL,
  value FLOAT8,
  cargo TEXT,
  additional_data JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kpi_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id TEXT NOT NULL, -- Identificador de la empresa
  kpi_id TEXT NOT NULL,
  brand TEXT,
  meta_value FLOAT8 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- ==========================================
-- 🔐 HABILITAR SEGURIDAD (RLS)
-- ==========================================

ALTER TABLE kpi_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_targets ENABLE ROW LEVEL SECURITY;

-- Nota: Para un entorno SaaS real, estas políticas deben usar 'auth.uid()' 
-- o claims personalizados en Supabase Auth. Como estamos en fase de implementación,
-- creamos políticas que permitan el flujo por company_id.

DROP POLICY IF EXISTS "Permitir lectura por empresa" ON kpi_updates;
CREATE POLICY "Permitir lectura por empresa" ON kpi_updates
FOR SELECT USING (true); -- En producción, cambiar true por (company_id = current_setting('app.current_company_id'))

DROP POLICY IF EXISTS "Permitir inserción por empresa" ON kpi_updates;
CREATE POLICY "Permitir inserción por empresa" ON kpi_updates
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir gestión de metas por empresa" ON kpi_targets;
CREATE POLICY "Permitir gestión de metas por empresa" ON kpi_targets
FOR ALL USING (true);

-- ==========================================
-- ⚡ CONFIGURACIÓN DE REALTIME
-- ==========================================

ALTER PUBLICATION supabase_realtime ADD TABLE kpi_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE kpi_targets;

