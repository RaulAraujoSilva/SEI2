CREATE INDEX IF NOT EXISTS idx_processos_numero ON processos(numero);
CREATE INDEX IF NOT EXISTS idx_processos_data_ultimo_andamento ON processos(data_ultimo_andamento);
CREATE INDEX IF NOT EXISTS idx_protocolos_processo_id ON protocolos(processo_id);
CREATE INDEX IF NOT EXISTS idx_andamentos_processo_id ON andamentos(processo_id);
CREATE INDEX IF NOT EXISTS idx_andamentos_data_hora ON andamentos(data_hora);
CREATE INDEX IF NOT EXISTS idx_observacoes_processo_id ON observacoes(processo_id);
-- Dedupe e idempotência
CREATE UNIQUE INDEX IF NOT EXISTS ux_protocolos_processo_numero ON protocolos(processo_id, numero);
CREATE UNIQUE INDEX IF NOT EXISTS ux_andamentos_processo_data_unidade_desc ON andamentos(processo_id, data_hora, unidade, descricao);
