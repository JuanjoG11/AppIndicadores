-- Ejecuta este SQL en el Editor SQL de tu proyecto de Supabase

CREATE TABLE IF NOT EXISTS kpi_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kpi_id TEXT NOT NULL,
  value FLOAT8,
  cargo TEXT,
  additional_data JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Tabla para metas personalizadas por el Gerente
CREATE TABLE IF NOT EXISTS kpi_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kpi_id TEXT NOT NULL,
  brand TEXT, -- Opcional, para metas por marca
  meta_value FLOAT8 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- Habilitar Realtime para esta tabla
ALTER PUBLICATION supabase_realtime ADD TABLE kpi_targets;

-- Deshabilitar RLS temporalmente
ALTER TABLE kpi_targets DISABLE ROW LEVEL SECURITY;
