# Checklists (Tela a Tela e Ações)

Dashboard
- [ ] KPIs com dados reais
- [ ] Exportar Relatório navega para /relatorio
- [ ] Atualizar dispara job e mostra feedback
- [ ] Listas e gráficos com estados de loading e erro
- [ ] Acessibilidade e tooltips

Importar (/)
- [ ] Validação de URL do SEI
- [ ] Captura com feedback (loading/status)
- [ ] Salvar processo e relacionamentos
- [ ] Exportar preview (XLSX/CSV)
- [ ] Importação em lote com relatório final
- [ ] Update Manager presente e funcional
- [ ] A11y (aria-live, labels)

Lista de Processos (/processos)
- [ ] Filtro por número/tipo/interessado/assunto
- [ ] Filtros de período (Hoje/7/30)
- [ ] Ações: Detalhar/Editar, Abrir no SEI, Deletar (confirmação)
- [ ] Modal de detalhes sincroniza alterações
- [ ] Badges de novos itens e totalizadores
- [ ] Paginação quando necessário
- [ ] A11y: tooltips, foco, teclado

Modal de Detalhes
- [ ] Editar/Salvar metadados (assunto, concessionária, títulos, tipo)
- [ ] Observações: criar e listar
- [ ] Protocolos/Andamentos com destaque de novos
- [ ] A11y: aria-modal, foco, escape

Relatório (/relatorio)
- [ ] Gerar por período
- [ ] Exportar Excel via Blob
- [ ] Tabela compacta com quebras de linha
- [ ] Totais (processos, protocolos, andamentos)

Update Manager
- [ ] Atualizar agora (POST /api/processes/update-now)
- [ ] Agendamento (POST /api/schedule)
- [ ] Próxima execução visível
- [ ] Integração com Cron
