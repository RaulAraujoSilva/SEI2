# Modal de Detalhes do Processo

Objetivo
- Exibir dados detalhados e permitir edição de metadados.

Seções
- Cabeçalho: número do processo, link SEI, fechar
- Autuação: Processo, Tipo, Data de Geração, Interessado
- Metadados editáveis:
  - Assunto (texto longo)
  - Concessionária (select)
  - Títulos (select)
  - Tipo (select)
- Listas:
  - Protocolos (destaque para novos)
  - Andamentos (destaque para novos)
- Observações:
  - Campo para adicionar
  - Lista com autor e data

Ações
- Editar/Salvar: valida e persiste (PUT /api/processes/:id)
- Cancelar edição
- Salvar Observação (POST /api/observacoes)

Acessibilidade
- Dialog com aria-modal, foco inicial, teclas de escape/tab cycling

Checklist
- [ ] Edição e persistência dos campos customizados
- [ ] Observações com autor e timestamp
- [ ] Destaques de novos itens
- [ ] A11y completa
