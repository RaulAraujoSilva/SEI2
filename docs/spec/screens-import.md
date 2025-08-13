# Tela: Importar Processos (/)

Objetivo
- Capturar processos do SEI via URL e em lote; revisar e salvar.

Seções
- Formulário: URL do SEI + botão "Capturar Dados"
- Status: info/sucesso/erro
- ProcessPreview: dados da autuação, protocolos, andamentos
- Ações: Confirmar e Salvar, Limpar, Visualizar, Exportar
- Importação em Lote (BatchImport)
- Update Manager (Atualizar agora / Agendado)
- Processos Recentes

Botões & Ações
- Capturar Dados → POST /api/import/capture
- Confirmar e Salvar → POST /api/processes
- Limpar → resetar estado
- Visualizar → abrir modal ou navegar para /processos focando o item
- Exportar (preview) → XLSX/CSV no cliente
- Processar Lote → POST /api/import/batch
- Atualizar agora / Salvar agendamento → ver Update Manager

Validações
- URL do SEI válida
- Evitar duplicidade (já existente no BD)

Acessibilidade
- aria-live no status
- Labels em inputs
- Tooltips em ações

Checklist
- [ ] Validação de URL
- [ ] Chamada de captura e feedback
- [ ] Persistência do processo e relacionamentos
- [ ] Exportação do preview
- [ ] Importação em lote com resumo
- [ ] Update Manager integrado
