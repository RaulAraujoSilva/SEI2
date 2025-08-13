# Update Manager (componente e página opcional /atualizacoes)

Objetivo
- Atualizar todos os processos sob demanda ou por agendamento.

Modos
- Sob Demanda: Atualizar agora
- Agendado:
  - Diária (horário HH:mm)
  - Intervalo (em horas)

Persistência
- Produção: tabela schedules
- Protótipo: localStorage

Integração
- Atualizar agora → POST /api/processes/update-now
- Salvar agendamento → POST /api/schedule
- Cron (produção) → chama /api/cron/update

Checklist
- [ ] Atualização sob demanda com feedback
- [ ] Agendamento salvo e próxima execução calculada
- [ ] Integração com Cron
