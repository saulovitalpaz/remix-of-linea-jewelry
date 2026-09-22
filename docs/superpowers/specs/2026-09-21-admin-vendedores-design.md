# Dashboard, vendedores e rodapé

## Escopo proposto

Manter a identidade visual e os componentes existentes em React. Evoluir a API Express e o banco Prisma para persistir metas e ofertas internas, com autorização no servidor.

1. Dashboard admin: card de atalhos para a homepage e para abrir diretamente o formulário de novo produto. Card de mais vendidos com os cinco primeiros produtos por unidades vendidas (`salesCount` acumulado), sem incluir produtos sem vendas. Cada item abre a referência visual interna.
2. Categorias: cinco opções específicas por categoria, incluindo anéis, brincos, colares, conjuntos e pulseiras, além de infantil, semijoias, maquiagem e bolsas. Categorias personalizadas recebem cinco opções de fallback. Manter a seleção já salva e imagens personalizadas.
3. Usuários: exclusão pelo admin com confirmação na interface. Preservar integralmente `DailySales` e `CashTransaction`, incluindo identificador e nome históricos. Invalidar acesso da conta excluída pela verificação existente de usuário em cada requisição autenticada. Impedir exclusão da própria conta e do último administrador.
4. Vendedor: faturamento e indicadores diários calculados exclusivamente para o usuário autenticado. Meta em reais cadastrada pelo próprio vendedor para cada mês. Mostrar vendas pessoais do mês, meta, restante `max(meta - vendido, 0)` e percentual. Usar o fuso America/Sao_Paulo. Sem meta cadastrada, exibir convite para cadastrar. Ao atingir a meta, apresentar selo/troféu e mensagem de conquista; a bonificação é visual, sem cálculo de comissão ou pagamento.
5. Produtos para vendedor: exatamente três cards de resumo clicáveis — esgotados, destaques da homepage e produtos em oferta. Cada card filtra o catálogo correspondente, com opção de limpar filtro. Admin controla a marcação de oferta no formulário de produto; esse indicador é independente de destaque e preço e não modifica a homepage. Não expor a marcação interna na API pública de catálogo.
6. Referência de produto: clicar no produto ou selecioná-lo para venda expande um card interno com suas imagens disponíveis e nome. Manter o registro de venda no painel. Link secundário discreto permite abrir a página pública. O modelo atual possui uma imagem por produto; exibir a imagem disponível sem criar um novo sistema de galeria.
7. Rodapé: condensar apresentação, endereço, contato, loja, suporte e atendimento no próprio footer. Reduzir espaços e agrupar informações repetidas, com colunas responsivas, texto legível e links acessíveis. Preservar informações legais, navegação e mapa.

## Abordagem e alternativas

Recomendação: persistir metas mensais em tabela própria e ofertas como marcação interna de produto; excluir a conta mantendo os registros históricos independentes já existentes. Metas por mês evitam sobrescrever o passado.

Alternativas: guardar metas somente no navegador perderia sincronização entre dispositivos; desativar usuários manteria a conta, mas não atenderia literalmente à exclusão solicitada. Não adotar essas opções.

## Arquivos e dados envolvidos

- `src/pages/Admin.tsx`, `src/components/admin/AdminDashboard.tsx` e `Settings.tsx`: navegação, cards, usuários, filtros e referência visual.
- `src/lib/category-illustrations.ts` e `CategoryManager.tsx`: opções por categoria.
- `src/components/footer/Footer.tsx`: composição compacta e responsiva.
- `backend/src/app.ts`, validação, schema Prisma e SQL de upgrade: exclusão, isolamento de indicadores, metas e ofertas internas.
- Tipos e serviços compartilhados: transportar os novos dados com contratos explícitos.

## Validação prevista

### Plano visual — skills solicitadas

Aplicar `ui-ux-pro-max` para orientar composição e interação e `web-design-guidelines`, adicionada por solicitação do usuário, para revisar o resultado conforme as diretrizes atuais da Vercel. Escopo: dashboard, cards e filtros de produtos, formulário de meta, conquista visual, referência expansível de produto e footer.

- Preservar a identidade visual atual, com hierarquia clara e espaçamento compacto no rodapé.
- Verificar navegação por teclado, foco visível, nomes acessíveis de botões, semântica de links e campos com rótulos.
- Mostrar progresso também em valores e texto, sem depender apenas de cor; respeitar preferência por movimento reduzido na conquista visual.
- Verificar contraste, quebra de textos, áreas de toque e ausência de rolagem horizontal em celular e desktop.
- Prever carregamento, erro, ausência de dados e confirmação de exclusão com mensagens claras.
- Registrar achados da revisão em formato `arquivo:linha` e corrigir os problemas no escopo antes da entrega.

Testes da API para exclusão sem perda de histórico, bloqueio de acesso da conta removida, permissões de oferta e meta, separação entre vendedores e períodos mensais. Verificar ranking, filtros, estado sem meta e conquista. Rodar testes existentes, typecheck, lint e build. Validar visualmente os fluxos disponíveis e o rodapé em larguras de celular e desktop quando houver navegador disponível. Alterações de banco devem vir acompanhadas de script de upgrade idempotente integrado à inicialização.

## Ampliação autorizada

Em 21/09/2026 o usuário autorizou toda a implementação, melhorias adicionais pertinentes a um portal de vendas, revisão de fontes e tamanhos inspirada na palavra “Detalhes” da logomarca, commit, push para `origin/main` e `railway up`. A entrega deve confirmar o envio ao Railway sem acompanhar o status posterior do deploy. As melhorias adicionais incluem busca combinada com filtros, resumo completo dos itens selecionados e tratamento independente de falhas no histórico.
