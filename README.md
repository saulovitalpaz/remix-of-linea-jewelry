# Chique Detalhes

Vitrine React 19/Vite e API Express 5/Prisma/PostgreSQL. O frontend ativo está em `src/`; `app/` e arquivos Next.js são remanescentes inativos, preservados fora do build. As compras são combinadas pelo WhatsApp; o painel `/admin` registra produtos e vendas internas, sem checkout de pagamento.

## Desenvolvimento local

Requer Node.js 22 ou superior. Na raiz, execute `npm ci` e `npm run dev` para abrir o Vite em `http://localhost:5173`. Em `backend/`, execute `npm ci`, configure um `.env` local conforme `.env.example` e execute `npm run dev`. A API usa a porta 3001; o Vite encaminha `/api` para ela. Use um PostgreSQL local já provisionado para testar persistência.

`VITE_API_URL`, quando definido, deve terminar em `/api`; é uma variável pública incorporada durante o build. Em produção com serviços separados, precisa apontar para o backend HTTPS. Sem essa variável, é necessário um proxy de `/api` no mesmo domínio. Nunca coloque credenciais em variáveis `VITE_*`.

O backend requer `DATABASE_URL` e `JWT_SECRET` exclusivo com pelo menos 32 caracteres. Uploads usam o bucket S3-compatible do Railway: `STORAGE_ENDPOINT`, `STORAGE_REGION`, `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY_ID` e `STORAGE_SECRET_ACCESS_KEY`; `STORAGE_PUBLIC_BASE_URL` é opcional para CDN/domínio público. `CORS_ORIGINS` é uma lista separada por vírgulas. Configure `TRUST_PROXY_HOPS` somente após conferir a cadeia de proxies.

## Perfis e autenticação

Login por nome e senha, com token de oito horas em `sessionStorage`. Cada operação protegida consulta o perfil atual no banco.

| Perfil | Produtos/categorias | Registrar vendas | Popup/usuários |
| --- | --- | --- | --- |
| ADMIN | Gerenciar | Sim | Gerenciar |
| MANAGER | Gerenciar | Sim | Não |
| SELLER | Consultar | Sim | Não |

O script `backend/prisma/upgrades/20260920_users.sql` prepara nome, login único e perfil. A conta legada de Bárbara passa a usar **Bárbara Paz**, preservando `passwordHash`. O script não cria senha nem administrador padrão. Antes da aplicação futura, revisar o SQL e fazer backup. `npm run db:upgrade` modifica o banco indicado por `DATABASE_URL`: **não foi executado nesta implementação**. O comando legado `db:sync` não deve ser usado para atualizar produção.

## API

Respostas são JSON; erros usam `{ "error": "mensagem" }`. Endpoints protegidos recebem `Authorization: Bearer <token>`.

| Método e caminho | Acesso / conteúdo |
| --- | --- |
| POST `/api/auth/login` | Público; `{ username, password }` |
| GET `/api/auth/me` | Sessão atual |
| GET `/api/categories` | Público |
| POST `/api/categories` | ADMIN/MANAGER; nome, slug, descrição |
| GET `/api/products` | Público; `?categorySlug=` opcional |
| GET `/api/products/:id` | Público; 404 quando ausente |
| POST `/api/products` | ADMIN/MANAGER; nome, preço, estoque, categoryId, descrição e imagem opcional |
| PUT `/api/products/:id` | ADMIN/MANAGER; mesmos campos completos |
| DELETE `/api/products/:id` | ADMIN/MANAGER |
| POST `/api/sales/close-day` | Todos os perfis; `{ itemsSoldData: [{ productId, quantity }], notes? }` |
| GET `/api/popup/active` | Público; campanha ativa ou null |
| GET `/api/popup` | ADMIN; última campanha, inclusive inativa |
| POST `/api/popup` | ADMIN; multipart com imagem |
| PUT `/api/popup/:id/toggle` | ADMIN; `{ active: boolean }` |
| DELETE `/api/popup/:id` | ADMIN |
| GET/POST `/api/users` | ADMIN; criação com `{ name, password, role }` |
| GET `/api/health` | Saúde da API e conexão PostgreSQL |

Produtos aceitam JSON ou multipart; uploads usam o campo `image`, JPEG/PNG/WebP e limite de 5 MB. Preço deve ser positivo com até duas casas decimais; estoque e quantidade são inteiros. O registro de venda calcula valores com preços do banco e atualiza estoque em transação. Histórico, edição e estorno de vendas não fazem parte dos endpoints atuais.

## Validação e operação

Na raiz: `npm run typecheck`, `npm run lint`, `npm run build`. Em `backend/`: `npm run build`, `npm test`, `npx prisma validate` e `npx prisma generate`. Os testes HTTP usam um banco simulado, sem escrever em produção; incluem filtros reais compartilhados com o catálogo. O build frontend não depende da pasta backend.

Os overrides de `@prisma/config` atualizam `deepmerge-ts` e `effect` para versões corrigidas sem migrar o projeto para outra versão principal do Prisma. Reavaliar esses overrides na próxima atualização do Prisma. O limitador de login está em memória por processo; múltiplas réplicas exigem armazenamento compartilhado.

Publicação e alterações do banco remoto permanecem suspensas até a conclusão dos upgrades solicitados. Consulte [preparação de upload Railway](docs/railway-upload.md), [estado observado](docs/railway-status.md) e [auditoria local](docs/store-audit.md). Credenciais Cloudinary anteriormente expostas precisam ser revogadas no provedor; removê-las do código não as invalida. As credenciais do bucket devem permanecer somente nas variáveis do Backend Railway.
