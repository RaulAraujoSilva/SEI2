# Testes

Níveis
- Unidade: normalização de dados de importação, geradores de payloads
- Integração: rotas /api/processes, /api/report
- E2E: fluxo Importar → Salvar → Listar → Editar → Relatório → Exportar

Cenários E2E (exemplos)
- Importar URL válida, visualizar preview e salvar
- Importação em lote com mistura de sucesso/erro
- Edição de metadados no modal e persistência
- Geração de relatório por período e exportação XLSX
- Deleção com confirmação e atualização da tabela
- Atualizar agora (lote) com resultado de itens alterados

Boas práticas
- Fixtures para dados de exemplo SEI
- Testes idempotentes (cleanup nas tabelas)
- Mocks para chamadas externas ao SEI
