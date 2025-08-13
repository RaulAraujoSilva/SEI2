# Modelo de Dados (SQL Proposto)

Tabela: processos
\`\`\`sql
CREATE TABLE processos (
  id UUID PRIMARY KEY,
  numero TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL,
  interessado TEXT NOT NULL,
  data_geracao DATE,
  ultima_unidade TEXT,
  data_ultimo_andamento DATE,
  assunto TEXT,
  concessionaria TEXT,
  titulo TEXT,
  tipo_custom TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

Tabela: protocolos
\`\`\`sql
CREATE TABLE protocolos (
  id UUID PRIMARY KEY,
  processo_id UUID NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  tipo TEXT NOT NULL,
  data DATE,
  data_inclusao DATE,
  unidade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_protocolos_processo_id ON protocolos(processo_id);
\`\`\`

Tabela: andamentos
\`\`\`sql
CREATE TABLE andamentos (
  id UUID PRIMARY KEY,
  processo_id UUID NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  data_hora TIMESTAMP WITH TIME ZONE,
  unidade TEXT,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_andamentos_processo_id ON andamentos(processo_id);
CREATE INDEX idx_andamentos_data_hora ON andamentos(data_hora);
\`\`\`

Tabela: observacoes
\`\`\`sql
CREATE TABLE observacoes (
  id UUID PRIMARY KEY,
  processo_id UUID NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  autor TEXT NOT NULL,
  texto TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_observacoes_processo_id ON observacoes(processo_id);
\`\`\`

Tabela: schedules
\`\`\`sql
CREATE TABLE schedules (
  id UUID PRIMARY KEY,
  mode TEXT NOT NULL CHECK (mode IN ('manual','scheduled')),
  type TEXT NOT NULL CHECK (type IN ('daily','interval')),
  daily_time TEXT,
  interval_hours INTEGER,
  next_run TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

Notas:
- Usar UUID v4
- Índices em campos de busca: numero, data_ultimo_andamento
- Considerar exclusão lógica (deleted_at) se necessário
