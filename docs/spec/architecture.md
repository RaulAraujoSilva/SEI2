# Arquitetura e Fluxos

Arquitetura de Alto Nível
```mermaid title="Arquitetura de Alto Nível" type="diagram"
graph LR;
  A["Browser #40;Cliente#41;"]B["Next.js #40;App Router#41;"];
  BC["UI #40;shadcn#47;ui#41;"];
  BD["API Routes #47; Server Actions"];
  DE["Serviços Internos #40;Importação#44; Relatórios#44; Atualização#41;"];
  EF["Banco de Dados #40;SQL#41;"];
  EG["Jobs Agendados #40;Cron#41;"];
