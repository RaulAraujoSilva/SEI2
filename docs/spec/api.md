# API e Contratos (Atual)

Importação
- POST /api/import/capture
  - body: { url: string }
  - 200: { numero, tipo, dataGeracao, interessado, protocolos: Array<{ numero, tipo, data, dataInclusao, unidade }>, andamentos: Array<{ dataHora, unidade, descricao }> }
  - 400: { message }
- POST /api/import/batch
  - body: { urls: string[] }
  - 200: { success: number, failed: number, items: Array<{ url, status, message? }> }

Processos
- GET /api/processes
  - query: { q?, start?, end?, page?, pageSize? }
  - 200: { items: Processo[], total: number }
- GET /api/processes/:id
  - 200: ProcessoDetalhado
- POST /api/processes
  - body: ProcessoDetalhado
  - 201: { id }
- PUT /api/processes/:id
  - body: { assunto?, concessionaria?, titulo?, tipoCustom?, ... }
  - 200: { ok: true }
- DELETE /api/processes/:id
  - 200: { ok: true }

Relatórios
- GET /api/report
  - query: { start, end }
  - 200: { processos: ReportData[] }
  - ReportData: { processo, tipo, interessado, dataGeracao, ultimaUnidade, dataUltimoAndamento, protocolos: Array<{ numero, tipo, data, dataInclusao, unidade }>, andamentos: Array<{ dataHora, unidade, descricao }> }

Atualização
- POST /api/processes/update-now
  - body: { scope?: 'all'|'delta', since?: string }
  - 200: { processes, novosProtocolos, novosAndamentos }
- POST /api/schedule
  - body: { mode: 'manual'|'scheduled', type: 'daily'|'interval', dailyTime?, intervalHours? }
  - 200: { nextRun }

Cron
- GET /api/cron/update
  - 200: { ok: true, processed: number }

Erros e Convenções
- 4xx para erros do cliente (validação, não encontrado)
- 5xx para exceções
- Mensagens amigáveis e detalhamento opcional em dev
