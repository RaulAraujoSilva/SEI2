# Tela: Relatório Unificado (/relatorio)

Objetivo
- Gerar dataset unificado por período e exportar em Excel.

Filtros
- Data Inicial e Final
- Botão Gerar Relatório
- Botão Exportar Excel (após resultado)

Grid de Resultados (compacta)
- Colunas: Processo | Tipo | Interessado | Última Unidade | Data Andamento | Protocolos | Andamentos
- Quebras de linha em Tipo e Interessado
- Totais em rodapé

Exportação
- Geração workbook em memória (ArrayBuffer) e download via Blob

Checklist
- [ ] Geração via GET /api/report?start&end
- [ ] Exportação XLSX via Blob
- [ ] Layout alinhado à lista de processos
- [ ] Totais exibidos
