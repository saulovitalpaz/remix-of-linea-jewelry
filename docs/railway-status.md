# Status Railway — 20/09/2026

Consulta somente leitura: `railway status --json`.
Primeira tentativa dentro do sandbox: `Unauthorized. Please login with railway login`.
Repetição autorizada fora do sandbox: concluída com sucesso, sem necessidade de novo login.

Projeto confirmado: `remix-linea-of-jewelry`, ambiente `production`. Frontend, Backend e Postgres têm último deployment com status `SUCCESS`. Frontend usa Vite SPA/Caddy na porta de destino 8080; Backend usa Node na porta de destino 3001. O banco não foi consultado diretamente.

Verificação HTTP pública: homepage 200 HTML; Backend `/api/health` 200 JSON; Backend `/api/products` 200 JSON com catálogo vazio (`[]`). A rota `/api/products` no domínio da homepage devolve HTML da SPA, portanto não funciona como proxy.

Bundle público da homepage `/assets/index-CalIiv0V.js` inspecionado em 20/09/2026: a constante de base da API contém `https://backend-production-f06a.up.railway.app/api` e é utilizada por `fetch` em `/products`. Assim, a versão atualmente publicada aponta à API correta; o risco do fallback relativo `/api` diz respeito a novos builds sem a configuração necessária. O bundle não permite determinar se essa URL veio de variável de build ou de código fixo. Nenhum comando de leitura de variáveis Railway foi utilizado.

Auditoria e recomendações: [railway-analysis.md](./railway-analysis.md). Nenhuma variável sensível foi coletada. Nenhuma migração, alteração remota ou publicação foi executada.

Restrição do usuário: não executar `railway up` enquanto os upgrades atuais e futuros não estiverem completos. Manter validação local e separar a publicação.
