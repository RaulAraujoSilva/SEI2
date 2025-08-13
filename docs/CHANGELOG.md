# CHANGELOG

## 2025-08-12

- Lint/Typing: remoções de `any`, remoção de imports não usados, tipagem dos retornos em `app/api/report/route.ts`, `components/process-import-page.tsx`, `components/unified-report.tsx`, `lib/repositories/{andamentos,protocolos}.ts`, e ajustes no `components/ui/chart.tsx`.
- DB wrapper: adicionados tipos `RawQueryResult` e `RawSqlClient` para uso de `raw.query`.
- Repositórios: `andamentos` e `protocolos` agora usam `raw.query` tipado; `processes` evita depender de `RETURNING` e busca `id` por `numero` após upsert.
- UI: página `/processos` conectada ao backend real (`GET /api/processes`) com filtros por período e busca; estados de carregamento/erro.
- Relatório: função de export com tipos explícitos; remoção de ícones não usados.
- Documentação: `docs/spec/api.md` atualizado aos contratos atuais; mantido `docs/spec/data-model.md` coerente; criado `docs/CHANGELOG.md`.
- Testes: lint limpo; testes unitários verdes; integração com DB pendente de revalidação local (checar `DATABASE_URL` e migrações).




