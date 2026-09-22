# Revisão do portal de vendas — 22/09/2026

Implementado o escopo aprovado: atalhos e ranking no dashboard; cinco opções por categoria; exclusão de acessos preservando vendas; metas pessoais; ofertas privadas; filtros e fotos de referência internas; rodapé compacto e tipografia inspirada na marca.

Melhorias adicionais: busca por produto/categoria sem depender de acentos, resumo de todos os produtos selecionados mesmo ao trocar filtros, isolamento de falhas no carregamento do histórico e alinhamento de datas de venda ao fuso de São Paulo. A bonificação da meta é exclusivamente visual.

## Verificações

- `npm test`: 21 testes aprovados (15 backend e 6 de regras compartilhadas/interface).
- `npm run build`: typecheck e build frontend aprovados, 1.699 módulos.
- `npm --prefix backend run build`: aprovado.
- `npm run lint`: zero erros; sete avisos preexistentes de Fast Refresh nos componentes de UI.
- Revisão independente de código: sem bloqueios críticos ou importantes após corrigir seleção oculta e datas sem horário.
- Revisão de código visual com `web-design-guidelines`: acessibilidade, semântica, foco, alvos de toque e responsividade considerados. O navegador integrado não estava disponível; não foi possível verificar visualmente a renderização ao vivo.

## Regressões cobertas

Os testes verificam ofertas ausentes das respostas públicas, permissões de alteração, preservação de flags em edição, exclusão sem perda de vendas e invalidação do acesso, metas separadas por usuário e mês, limites mensais no horário de São Paulo, lançamento de data sem horário e respectivos relatórios, ranking, filtros, progresso antes de 100% e cinco opções específicas por categoria.

## Entrega

O usuário autorizou commit e push em `origin/main`, seguidos de upload dos serviços Frontend e Backend com `railway up --detach`. Os upgrades SQL são idempotentes e executados na inicialização do Backend. A confirmação dos uploads será registrada na mensagem de entrega, sem consulta ao status posterior do deploy.
