# Verificação de Configuração

Siga estes passos para confirmar que tudo está correto.

1) Ambiente
- DATABASE_URL definido? (Neon/Postgres com sslmode=require)
- Rode: GET /api/health
  - Esperado: { ok: true, timestamp: ... }

2) Conexão com o Banco
- Rode: GET /api/health/db
  - Sem DATABASE_URL: usingMock: true
  - Com DATABASE_URL:
    - connected: true
    - tables.processos/protocolos/andamentos: true (se scripts aplicados)
    - counts com números #62; 0 após seed

3) Schema aplicado
- Execute scripts/sql/0001_init.sql e 0002_indexes.sql
- Rode novamente /api/health/db e confirme tables.* = true

4) Seed
- Rode scripts/seed.ts (Node 18+)
- /api/health/db deve mostrar counts.processos #62; 0

5) Endpoints principais
- GET /api/processes
  - Deve listar itens do DB (se vazio, retorna [])
- POST /api/processes (body mínimo: numero, tipo, interessado)
  - Esperado: 201 com { id }
- GET /api/report?start=YYYY-MM-DD&end=YYYY-MM-DD
  - Esperado: { processos: [...] }

6) UI rápida
- /relatorio
  - Gerar Relatório → deve consumir /api/report
  - Exportar Excel → baixa arquivo via Blob
- Observação: /processos ainda usa mocks locais para UI; a integração com API será o próximo passo.

Dúvidas comuns
- Se /api/health/db retorna connected: false
  - Verifique credenciais, firewall, sslmode=require, e se o banco está online
- Se tables.* = false
  - Rode os scripts SQL do diretório scripts/sql
