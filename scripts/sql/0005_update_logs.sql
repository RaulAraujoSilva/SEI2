-- Tabelas para monitoramento de atualizações

-- Logs de jobs de atualização (manual ou agendado)
CREATE TABLE IF NOT EXISTS update_job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('manual', 'scheduled')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  finished_at TIMESTAMP WITH TIME ZONE,
  total_processes INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  novos_protocolos INTEGER NOT NULL DEFAULT 0,
  novos_andamentos INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs de atualização por processo
CREATE TABLE IF NOT EXISTS process_update_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id VARCHAR(255) NOT NULL REFERENCES update_job_logs(job_id) ON DELETE CASCADE,
  process_id UUID NOT NULL,
  numero VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed')),
  novos_protocolos INTEGER DEFAULT 0,
  novos_andamentos INTEGER DEFAULT 0,
  duration INTEGER, -- em millisegundos
  error_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_update_job_logs_started_at ON update_job_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_update_job_logs_status ON update_job_logs(status);
CREATE INDEX IF NOT EXISTS idx_update_job_logs_type ON update_job_logs(type);
CREATE INDEX IF NOT EXISTS idx_process_update_logs_job_id ON process_update_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_process_update_logs_timestamp ON process_update_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_process_update_logs_process_id ON process_update_logs(process_id);