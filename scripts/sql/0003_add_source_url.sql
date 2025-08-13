ALTER TABLE processos
  ADD COLUMN IF NOT EXISTS source_url TEXT;

CREATE INDEX IF NOT EXISTS idx_processos_source_url ON processos(source_url);


