# Status Railway — 20/09/2026

Consulta somente leitura: `railway status --json`.
Primeira tentativa dentro do sandbox: `Unauthorized. Please login with railway login`.
Repetição autorizada fora do sandbox: concluída com sucesso, sem necessidade de novo login.

Projeto confirmado: `remix-linea-of-jewelry`, ambiente `production`. Frontend, Backend e Postgres têm último deployment com status `SUCCESS`. Frontend usa Vite SPA/Caddy na porta de destino 8080; Backend usa Node na porta de destino 3001. O banco não foi consultado diretamente.

Deploy autorizado em 21/09/2026: Frontend `c1ce6642-93c6-48e1-a221-92cc20e13081` e Backend `2bf15de9-3f09-479d-89f3-82c8f868d5d8` concluíram com `SUCCESS`. O primeiro deploy do Backend (`2970d298-f788-4efe-95e6-044d39fbcc06`) falhou no healthcheck porque `JWT_SECRET` estava ausente ou vazio; um novo segredo aleatório foi configurado no serviço e o redeploy ficou saudável. `/api/health` respondeu HTTP 200 e `https://chiquedetalhes.com.br` respondeu HTTP 200.

O recurso de bucket exibido no projeto ainda não está vinculado ao Backend: a listagem de variáveis do serviço contém `JWT_SECRET`, mas nenhuma `STORAGE_*`. É necessário usar `Add to Service` no bucket para o Backend antes de testar uploads. Nenhuma credencial do bucket foi coletada ou gravada neste repositório.

Verificação HTTP pública: homepage 200 HTML; Backend `/api/health` 200 JSON; Backend `/api/products` 200 JSON com catálogo vazio (`[]`). A rota `/api/products` no domínio da homepage devolve HTML da SPA, portanto não funciona como proxy.

Bundle público da homepage `/assets/index-CalIiv0V.js` inspecionado em 20/09/2026: a constante de base da API contém `https://backend-production-f06a.up.railway.app/api` e é utilizada por `fetch` em `/products`. Assim, a versão atualmente publicada aponta à API correta; o risco do fallback relativo `/api` diz respeito a novos builds sem a configuração necessária. O bundle não permite determinar se essa URL veio de variável de build ou de código fixo. Nenhum comando de leitura de variáveis Railway foi utilizado.

Auditoria e recomendações: [railway-analysis.md](./railway-analysis.md). Nenhuma variável sensível foi coletada. A migração do banco não foi executada; apenas os deploys autorizados e a configuração do `JWT_SECRET` foram realizados.

Os deploys autorizados foram concluídos; manter futuras migrações e alterações remotas separadas da publicação até revisão.
