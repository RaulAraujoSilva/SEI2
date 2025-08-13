# Checklist de Desenvolvimento — SEI Manager

Instruções
- Atualize os checkboxes conforme concluir tarefas.
- Não avance de fase sem cumprir todos os “Requisitos para avançar”.
- Referências: `docs/spec/*`, rotas em `app/api/*`, SQL em `scripts/sql/*`.

Legenda
- [ ] pendente  | [x] feito  | [~] em progresso

## Etapa 0 — Setup do Ambiente e Padrões
Tarefas
- [x] Adicionar dependências de parse e testes: `cheerio`, `vitest`, `tsx`.
- [x] Adicionar scripts npm: `test`, `test:watch`, `test:ci`.
- [x] `lib/utils/date.ts`: helpers `parseDateBR` (dd/MM/yyyy) e `parseDateTimeBR` (dd/MM/yyyy HH:mm).
- [x] Variáveis de ambiente: `DATABASE_URL` (Neon/Postgres), limites e timeouts (`IMPORT_CONCURRENCY`, `FETCH_TIMEOUT_MS`, `FETCH_RETRIES`, `FETCH_RETRY_BASE_MS`).
- [x] Documentar setup rápido em `docs/SETUP.md` (atualizado com envs, migração e Vercel Cron).

Testes
- [x] Smoke test do runner (Vitest) e testes dos helpers de data (incluindo timezone).

Requisitos para avançar
- [x] Testes do utilitário de data verdes e reprodutíveis.
- [x] Build ok; lint sem erros nos arquivos alterados (baseline legado será tratado na Etapa 6).

---

## Etapa 1 — Parser SEI (Web scraping)
Tarefas
- [x] `lib/scrapers/sei.ts` com SRP (sem efeitos colaterais):
  - [x] `fetchHtml(url)` com User-Agent, timeout e tratamento de 4xx/5xx.
  - [x] `parseAutuacao($)` — número, tipo, data de geração, interessado(s).
  - [x] `parseProtocolos($)` — tabela “Lista de Protocolos”.
  - [x] `parseAndamentos($)` — tabela “Lista de Andamentos”.
  - [x] Normalização de datas (ISO UTC) e strings (trim, espaços, caracteres não imprimíveis).
  - [x] Tratar “Acesso Restrito” (retornar metadados disponíveis + flag `acessoRestrito: true`).
- [x] Fixtures HTML em `tests/fixtures/sei/` para cenários reais (2 URLs de exemplo) e variações.

Testes (unitários)
- [x] Autuação: extrai todos os campos, inclusive acentos e múltiplos interessados.
- [x] Protocolos: mapeia colunas e datas; ignora linhas vazias.
- [x] Andamentos: parse de data/hora, unidade e descrição; ordenação preservada.
- [x] Variações: encoding, campos ausentes opcionais, página de acesso restrito.

Requisitos para avançar
- [x] 100% dos campos existentes nas páginas de exemplo corretamente mapeados e normalizados.
- [x] Robustez a pequenas variações de HTML (classes/espaços/Qtd colunas).
- [x] Cobertura de testes do parser suficiente (cenários críticos) e verde local/CI.

Evidências
- Parser e fetch:
  - `lib/scrapers/sei.ts` — `fetchHtml`, `parseAutuacao`, `parseProtocolos`, `parseAndamentos`, `parseSei`
  - `lib/utils/date.ts` — `parseDateBR`, `parseDateTimeBR`, `normalizeText`
- Fixtures e testes:
  - `tests/fixtures/sei/exemplo1.html`, `tests/fixtures/sei/exemplo_restrito.html`
  - `tests/scrapers/sei.test.ts`, `tests/utils/date.test.ts`

---

## Etapa 2 — Persistência e Upsert (idempotência)
Tarefas
- [x] Repositórios SQL:
  - [x] `lib/repositories/processos.ts` — `upsertProcessoByNumero` (retorna `processo_id`).
  - [x] `lib/repositories/processos.ts` — `refreshProcessoDerivados` (MAX data_hora e última unidade).
  - [x] `lib/repositories/protocolos.ts` — `upsertProtocolosBulk` (ignorar duplicatas por chave natural).
  - [x] `lib/repositories/andamentos.ts` — `upsertAndamentosBulk` (idem).
- [x] Índices/constraints (dedupe):
  - [x] `scripts/sql/0002_indexes.sql`: `ux_protocolos_processo_numero (processo_id, numero)`.
  - [x] `scripts/sql/0002_indexes.sql`: `ux_andamentos_processo_data_unidade_desc (processo_id, data_hora, unidade, descricao)`.
- [x] Campos derivados em `processos`: atualizar `data_ultimo_andamento` (MAX) e `ultima_unidade` (do último andamento).
- [x] `lib/services/importer.ts`: orquestra parser + upserts + atualização de derivados; transacional por processo.

Testes (integração com DB)
- [~] Inserção inicial: 1 processo → N protocolos/andamentos persistidos. (teste presente; 1 ajuste pendente na contagem de inserts)
- [x] Reimportação idêntica: 0 duplicatas (contagens inalteradas). (teste `tests/integration/importer.db.test.ts`)
- [x] Incremental: adicionar 1 protocolo e 1 andamento no fixture → apenas novos inseridos. (teste `tests/integration/importer.db.test.ts`)
- [x] Derivados: `data_ultimo_andamento` e `ultima_unidade` condizem com o último andamento. (validação no mesmo arquivo de teste)

Notas
- Adicionada coluna `source_url` em `processos` para suportar Etapa 4 (update-now) via URL original.
 - Pré-condição: para executar testes de integração, configurar `DATABASE_URL` e rodar `pnpm db:migrate`.

Requisitos para avançar
- [~] Idempotência comprovada (sem duplicatas) e incrementos corretos. (reimportação e incremental ok; ajuste pontual no cenário de inserção inicial)
- [x] Índices únicos aplicados e verificados no banco.

Evidências
- Repositórios:
  - `lib/repositories/processes.ts` — `upsertProcessoByNumero`, `refreshProcessoDerivados`, `listProcesses`
  - `lib/repositories/protocolos.ts` — `upsertProtocolosBulk`, `listProtocolosByProcessoId`
  - `lib/repositories/andamentos.ts` — `upsertAndamentosBulk`, `listAndamentosByProcessoId`
- Serviço de importação:
  - `lib/services/importer.ts` — orquestração parser → upsert → derivados
- Índices e migrações:
  - `scripts/sql/0002_indexes.sql` — índices de dedupe
  - `scripts/sql/0003_add_source_url.sql` — coluna/índice `source_url`
- Testes:
  - Unit: `tests/services/importer.test.ts`
  - Integração (aguardando DB): `tests/integration/importer.db.test.ts`

---

## Etapa 3 — Rotas de Importação
Tarefas
- [x] `POST /api/import/capture`: usa scraper e retorna preview `{ processo, protocolos[], andamentos[] }` sem persistir.
- [x] `POST /api/import/batch`: processa `{ urls[] }` com limite de concorrência (ex.: 3–5), agrega `{ success, failed, items[] }`.
- [x] Validação com `zod` (já iniciado) e mensagens claras de erro.

Testes
- [x] Unit (mocks do scraper): sucesso, timeout, HTML inválido, 404.
- [ ] Integração: lote com mistura sucesso/erro; tempos razoáveis; respostas determinísticas.

Requisitos para avançar
- [ ] Lote N produz relatório consistente e resiliente a falhas parciais.
- [x] Nenhuma persistência ocorre via `capture` (somente preview).

Evidências
- Rotas:
  - `app/api/import/capture/route.ts` — fetch + parse, preview
  - `app/api/import/batch/route.ts` — concorrência com `IMPORT_CONCURRENCY`
- Testes:
  - `tests/api/import.capture.test.ts`, `tests/api/import.batch.test.ts`
 - UI consome rota real de capture:
   - `components/process-import-page.tsx` — função `captureProcess` chama `/api/import/capture` e faz o mapping do preview para o componente

---

## Etapa 4 — Atualização On-demand e Cron
Tarefas
- [x] `POST /api/processes/update-now`: percorre processos, reexecuta parser e faz upsert delta; retorna contagem agregada.
- [x] `POST /api/schedule`: persiste configuração em `schedules` e calcula `next_run`.
- [x] `GET /api/cron/update`: lê `schedules`, executa atualização e retorna estatísticas.
- [x] Backoff simples para 429/5xx e timeouts no fetch; logging estruturado. (ver `lib/scrapers/sei.ts#fetchHtml` e `lib/logger.ts`)

Testes (integração)
- [x] Cenário sem alterações: delta == 0. (teste `tests/integration/update_now.db.test.ts`)
- [ ] Cenário com novos andamentos/protocolos: delta > 0 e campos derivados atualizados.
- [ ] Cron aciona atualização e retorna métricas (processados/novos/erros).

Requisitos para avançar
- [ ] Atualização delta confiável, sem duplicações, com métricas corretas.

Evidências
- Rotas e repositórios:
  - `app/api/processes/update-now/route.ts`
  - `app/api/cron/update/route.ts`
  - `app/api/schedule/route.ts`, `lib/repositories/schedules.ts`
- Teste (smoke sem DB):
  - `tests/api/update-now.test.ts`

---

## Etapa 5 — Rotas de Processos e Relatório (DB real)
Tarefas
- [x] Completar rotas `GET/POST/PUT/DELETE /api/processes` usando SQL dos repositórios.
- [x] `GET /api/report`: montar payload unificado por período com processos + protocolos + andamentos.
- [ ] Ajustes mínimos na UI para consumir dados reais (substituir seeds por chamadas às APIs reais).

Testes
- [x] Integração: filtros `q`, `start`, `end`. (teste `tests/integration/report_and_filters.db.test.ts`)
- [ ] E2E: Importar → Salvar → Listar → Editar → Relatório → Exportar (conforme `docs/spec/testing.md`).

Requisitos para avançar
- [ ] UI existente opera com dados reais sem regressões.

Evidências
- Processos CRUD/consulta:
  - `app/api/processes/route.ts` — POST real + GET lista
  - `app/api/processes/[id]/route.ts` — GET detalhado, PUT metadados, DELETE
- Relatório:
  - `app/api/report/route.ts` — consulta por período com protocolos/andamentos
- Testes (mock/fallback):
  - `tests/api/processes.crud.test.ts`

---

## Etapa 6 — Observabilidade e Hardening
Tarefas
- [x] Logs estruturados (tempo de fetch, tamanho HTML, contagens por processo, erros). (ver `lib/logger.ts` e logs nas rotas)
- [x] Limites e performance: `IMPORT_CONCURRENCY`, `FETCH_TIMEOUT_MS` via env.
- [x] Healthchecks: `GET /api/health` e `GET /api/health/db` com verificações adicionais.

Testes
- [ ] Injeção de falhas: timeouts, 5xx, HTML parcial.
- [ ] Carga: lote médio (ex.: 100 URLs) dentro do SLO definido.

Requisitos para avançar
- [ ] SLOs mínimos atingidos; sem regressões de memória/tempo.

---

## Etapa 7 — Documentação e Operação
Tarefas
- [x] Atualizar `docs/spec/api.md` e `docs/spec/data-model.md` conforme implementado.
- [x] `CHANGELOG.md` com entradas por etapa.
- [x] Guia operacional: execução local, migrações SQL (`scripts/sql/0001_init.sql`, `0002_indexes.sql`), agendamento de cron.

Requisitos para encerrar
- [ ] Documentação atualizada e suficiente para onboarding.
- [ ] Lint/Tipos/Build/Testes verdes no CI.

---

Racionais (curto)
- SRP/OCP: separar parser (HTML→DTO) de persistência (DTO→SQL) e rotas (orquestração).
- DIP: rotas dependem de serviços e repositórios via contratos simples.
- Clean Code: nomes descritivos, funções curtas, invariantes via índices únicos, idempotência explícita.
