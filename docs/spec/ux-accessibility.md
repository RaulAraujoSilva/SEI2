# UX & Acessibilidade

Princípios
- Layout responsivo, densidade controlada (tabelas compactas por padrão)
- Claridade de ações: tooltips, ícones e textos acessíveis

Tabelas
- Cabeçalhos <th> com escopo
- Quebras de linha em campos longos (whitespace-normal, break-words)
- Estados vazios com mensagens claras

Diálogos/Modais
- aria-modal, foco inicial no título ou primeiro campo
- Escape para fechar, trap de foco

Feedback
- aria-live em mensagens de status
- Toasts para sucesso/erro
- Skeletons em carregamento

Cores
- Tons pastéis; checar contraste mínimo em textos sobre badges/botões
