# Tela: Lista de Processos (/processos)

Objetivo
- Pesquisar, filtrar, visualizar e agir.

Filtros
- Busca por número, tipo, interessado e assunto
- Atalhos de período: Hoje, 7 dias, 30 dias

Grid (compacta)
- Colunas: Ações | Processo | Tipo | Interessado | Assunto | Última Unidade | Data Andamento | Protocolos | Andamentos
- Ações (primeira coluna):
  - Detalhar/Editar (olho) → abre modal
  - Abrir no SEI (external-link) → nova aba
  - Deletar (lixeira) → confirmação; DELETE /api/processes/:id
  - Tooltips e aria-labels

Estados
- Marcador visual quando há updates (ex.: borda lateral)
- Paginação (quando necessário)

Checklist
- [ ] Filtro por termo e período
- [ ] Ações funcionais com tooltips
- [ ] Modal de detalhes com edição
- [ ] Deleção com confirmação e feedback
- [ ] Badges de novos itens
