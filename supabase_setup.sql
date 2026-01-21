-- Ejecuta este SQL en el Editor SQL de tu proyecto de Supabase

CREATE TABLE IF NOT EXISTS kpi_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kpi_id TEXT NOT NULL,
  value FLOAT8,
  cargo TEXT,
  additional_data JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Realtime para esta tabla
ALTER PUBLICATION supabase_realtime ADD TABLE kpi_updates;

-- Deshabilitar RLS temporalmente para simplificar la alimentación (según lo acordado)
ALTER TABLE kpi_updates DISABLE ROW LEVEL SECURITY;
