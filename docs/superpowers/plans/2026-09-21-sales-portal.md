# Portal de vendas — plano de implementação

> Execução com `superpowers:subagent-driven-development`, integração e revisão antes da publicação.

**Objetivo:** concluir o escopo aprovado em `../specs/2026-09-21-admin-vendedores-design.md`, aprimorar tipografia e publicar em origin/main e Railway.

**Arquitetura:** React/Vite consome Express/Prisma. Metas mensais persistidas por usuário; oferta interna protegida por autenticação. Preservar registros de vendas ao excluir contas.

## Restrições

- Fuso America/Sao_Paulo; dinheiro calculado em centavos.
- Bonificação exclusivamente visual. Nenhuma oferta altera preço ou homepage.
- Não apagar histórico de vendas. Não expor ofertas na API pública.
- Preservar identidade visual e acessibilidade; usar web-design-guidelines na revisão.
- Usuário autorizou implementação completa, commit, push origin main e railway up; não acompanhar status posterior do deploy.

## Tarefas

- [x] API e persistência: testes HTTP de exclusão, isolamento diário, metas e ofertas. Modificar `backend/src/app.ts`, `schema.ts`, `index.ts`, schema Prisma e SQL de upgrade. `GET/PUT /api/sales/goal` retorna `{month, target, totalRevenue}` para o usuário atual; PUT aceita `{month, target}`. `GET /api/admin/products` retorna catálogo autenticado com `onOffer`; PUT/POST de produto só aceita alteração de `onOffer` por ADMIN. `DELETE /api/users/:id` preserva registros e bloqueia autoexclusão/último admin.
- [x] Interface de vendas: `src/pages/Admin.tsx`, novos componentes `SellerGoalCard.tsx` e `ProductReference.tsx`, tipos e serviços. Usar catálogo privado, ofertas, busca e filtros com URL, cards vinculados, meta individual e fotos expansíveis. Manter formulários e erros acessíveis.
- [x] Dashboard e equipe: `AdminDashboard.tsx` e `Settings.tsx`. Atalhos homepage/novo produto, ranking acumulado de cinco mais vendidos, exclusão de conta com confirmação e preservação do histórico.
- [x] Visual e categorias: `Footer.tsx`, folhas de estilo, configuração de fontes, `category-illustrations.ts` e `CategoryManager.tsx`. Cinco opções específicas por categoria, rodapé compacto, tipografia inspirada na palavra Detalhes da marca com tamanhos e pesos legíveis. Revisar a logomarca antes de escolher fontes.
- [x] Verificar: `npm --prefix backend test`, `npm --prefix backend run build`, `npm run lint`, `npm run build`. Revisão independente de código; revisão visual desktop/celular quando browser disponível.
- [ ] Publicar: revisar diff e arquivos, commit de todo trabalho da tarefa, `git push origin main`, `railway up --detach` no serviço/projeto vinculado; registrar confirmação de envio sem consultar status de deploy.
