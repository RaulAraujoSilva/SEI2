# Setup Rápido

1) Variáveis de ambiente
- Crie `.env.local` com:
  - DATABASE_URL: URL do Neon (PostgreSQL Serverless)
  - FETCH_TIMEOUT_MS=20000
  - FETCH_RETRIES=2
  - FETCH_RETRY_BASE_MS=500
  - IMPORT_CONCURRENCY=3
  - WEB_SCRAPE_URL=https://sei.rj.gov.br/sei/modulos/pesquisa/md_pesq_processo_exibir.php?IC2o8Z7ACQH4LdQ4jJLJzjPBiLtP6l2FsQacllhUf-duzEubalut9yvd8-CzYYNLu7pd-wiM0k633-D6khhQNWcmSDZ7pQiEU0-fzi-haycwfope5I8xSVFCcuFRAsbo

2) Banco de dados
- Execute as migrações:
  - pnpm db:migrate

3) Rodando local
- npm install
- npm run dev
- Acesse:
  - / — Importar
  - /processos — Lista
  - /dashboard — Dashboard
  - /relatorio — Relatório

4) Vercel Cron (produção)
- Configure o cron para chamar /api/cron/update no intervalo desejado.

Dicas
- Sem DATABASE_URL, as rotas de API retornam mocks (para desenvolvimento de UI).
