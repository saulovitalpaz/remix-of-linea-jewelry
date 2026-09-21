# Chique Detalhes — auditoria e plano de correção

**Objetivo:** uniformizar a vitrine, remover dados demonstrativos e implementar administração com permissões verificadas no servidor.
**Arquitetura:** preservar React/Vite, Express e Prisma/PostgreSQL. Centralizar o cliente HTTP e o card de produto. Manter vendas via WhatsApp e o registro interno de caixa.
**Restrições:** preservar alterações locais e o hash da senha de Bárbara. Não executar sincronização destrutiva de banco. Não publicar dados de teste no catálogo.

## Evidências iniciais

- `src/index.css:6` — tokens hexadecimais incompatíveis com `hsl(var(...))` do Tailwind; tokens de componentes ausentes.
- `src/pages/Index.tsx:186` — card 3:4, diferente de 4:5 no catálogo e quadrado no carrossel.
- `src/components/product/ProductImageGallery.tsx:17` — fotos demonstrativas adicionadas a todos os produtos.
- `src/components/product/ProductDescription.tsx:95` — SKU, materiais e avaliações fictícios.
- `src/components/category/FilterSortBar.tsx:32` — filtros e ordenação sem ligação com o catálogo.
- `src/components/category/ProductGrid.tsx:20` — efeito dependente de callback instável, ausência de estado de erro/paginação real.
- `src/services/ProductService.ts:6` — fallback para localhost em produção e cache antigo apresentado como dados atuais.
- `src/components/content/MarketingModal.tsx:31` — modal sem gestão de foco, Escape ou nome acessível.
- `src/pages/Admin.tsx:84` — estoque editado não é enviado; popup inativo não pode ser recuperado após recarregar.
- `backend/src/index.ts:73` — segredo JWT fixo, autenticação sem autorização por perfil.
- `backend/src/index.ts:272` — preço confiado ao cliente, quantidade sem validação e estoque pode ficar negativo.
- `backend/src/utils/object-storage.ts` — upload deve usar o bucket S3-compatible Railway; credenciais somente no ambiente do Backend.
- `README.md:1` — documentação Next.js incorreta para o runtime Vite.
- Verificação inicial: TypeScript frontend falha por dependências ausentes; lint falha por plugin ausente; backend compila.
- Site público não acessível por HTTP neste ambiente; isso não confirma indisponibilidade global.

## Decisões aprovadas

Admin: produtos, vendas, popup e criação de usuários. Gerência: produtos e vendas. Vendedor: consulta de produtos e registro de vendas. Login Bárbara Paz, preservando passwordHash existente. Identidade visual creme/dourado, cards 4:5 uniformes, menus expansíveis com foco visível e movimento reduzido.

## Execução e verificação

- [x] Backend: aplicação testável, validação, autenticação, usuários e popup transacional; testes HTTP locais aprovados.
- [x] Migração preparada: nome/login/perfil com preservação de hashes; aplicação remota não executada.
- [x] Frontend: cliente HTTP tipado, erros visíveis, cards compartilhados, busca/filtros/paginação na URL, detalhes reais e popup acessível.
- [x] Admin: login por nome, sessão validada, formulários de produto/estoque/registro de vendas e configurações de popup/usuários por perfil.
- [x] Ferramentas/docs: dependências, typecheck e lint executáveis, README e exemplos de ambiente atualizados.
- [x] Validar localmente: quatro testes, TypeScript frontend/backend, lint sem erros, builds, Prisma validate/generate e audits sem vulnerabilidades.
- [ ] Inspeção visual no navegador e integração PostgreSQL real: indisponíveis nesta sessão; limites registrados em `docs/store-audit.md`.
- [ ] Publicação e aplicação do SQL remoto: suspensas conforme instrução do usuário.

Referências: [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md), [Express security](https://expressjs.com/en/advanced/best-practice-security/).
