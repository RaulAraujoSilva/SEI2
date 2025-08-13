-- Schema inicial

CREATE TABLE IF NOT EXISTS processos (
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

CREATE TABLE IF NOT EXISTS protocolos (
  id UUID PRIMARY KEY,
  processo_id UUID NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  tipo TEXT NOT NULL,
  data DATE,
  data_inclusao DATE,
  unidade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS andamentos (
  id UUID PRIMARY KEY,
  processo_id UUID NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  data_hora TIMESTAMP WITH TIME ZONE,
  unidade TEXT,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS observacoes (
  id UUID PRIMARY KEY,
  processo_id UUID NOT NULL REFERENCES processos(id) ON DELETE CASCADE,
  autor TEXT NOT NULL,
  texto TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY,
  mode TEXT NOT NULL CHECK (mode IN ('manual','scheduled')),
  type TEXT CHECK (type IN ('daily','interval')),
  daily_time TEXT,
  interval_hours INTEGER,
  next_run TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
