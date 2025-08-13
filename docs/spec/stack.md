# Stack e Tecnologias Recomendadas

Front-end
- Next.js (App Router) com Server Components e Route Handlers — padrão moderno com renderização híbrida e APIs no mesmo projeto.
- shadcn/ui + Tailwind + Lucide — biblioteca de UI acessível e produtiva; tons pastéis já padronizados.
- React Hook Form + Zod — validação robusta e tipada.
- XLSX (cliente) — exportação via ArrayBuffer + Blob (compatível com ambiente de preview).

Back-end (no mesmo projeto)
- Route Handlers (app/api) — endpoints HTTP REST simples para importação, processos, relatórios e atualização.
- Server Actions — quando for conveniente para submit direto de formulários.

Banco de dados
- Neon (PostgreSQL serverless) — alto desempenho, conexão via @neondatabase/serverless.
- Sem ORM inicialmente (SQL direto), facilitando adoção progressiva e controle fino de queries.

Agendamento/Jobs
- Vercel Cron — chama /api/cron/update para iniciar a atualização em lote.

Armazenamento & Cache (opcional)
- Vercel Blob — anexos/arquivos gerados.
- Upstash (Redis) — caches de curto prazo e enfileiramento simples.

Observações
- App Router e Route Handlers são o caminho recomendado no Next.js atual, simplificando API e UI em um mesmo repositório.
