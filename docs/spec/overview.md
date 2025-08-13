# Visão Geral

Nome: SEI Manager — Sistema de Importação e Acompanhamento de Processos SEI

Objetivo:
- Importar processos do SEI por URL ou em lote
- Acompanhar protocolos e andamentos
- Editar metadados customizados (assunto, concessionária, títulos, tipo)
- Gerar relatório unificado (Excel)
- Atualizar processos sob demanda ou por agendamento

Principais Páginas:
- /dashboard
- / (Importar)
- /processos
- /relatorio
- [opcional] /atualizacoes (Update Manager dedicado)

Componentes-chave:
- Navigation (sidebar)
- ProcessPreview
- ProcessDetailModal
- ProcessListPage
- UnifiedReport
- BatchImport
- UpdateManager

Princípios:
- App Router (Next.js) e componentes server/client
- UI com shadcn/ui e tons pastéis (responsivo)
- Acessibilidade como padrão (labels, aria, tooltips)
- Exportação no cliente (Blob) para compatibilidade em prévias
