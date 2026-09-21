# Auditoria Railway — 20/09/2026

## Escopo e status

Auditoria somente leitura por subagente: configurações locais, `railway status --json`, HTTP GET público e documentação oficial. A consulta inicial dentro do sandbox retornou `Unauthorized`; a repetição autorizada fora do sandbox funcionou. Portanto, o impedimento registrado anteriormente em `railway-status.md` foi superado para a consulta de status.

Nenhum deploy, `railway up`, alteração de domínio, variável, serviço ou banco foi executado. Nenhum conteúdo de variável secreta foi consultado. A proibição de publicação até a conclusão de todos os upgrades permanece vigente.

Projeto consultado: `remix-linea-of-jewelry`, ambiente `production`.

| Serviço | Último deployment informado pela CLI | Porta pública de destino | Origem/build |
| --- | --- | --- | --- |
| Frontend | SUCCESS, 21/07/2026 22:24 UTC | 8080 | Railpack, Vite SPA, Caddy 2.11.1 |
| Backend | SUCCESS, 21/07/2026 22:13 UTC | 3001 | Railpack, Node 22.22.0, `railway.toml` |
| Postgres | SUCCESS, 23/08/2026 06:46 UTC | 5432 em domínio HTTP cadastrado | Imagem `postgres-ssl:17`, volume persistente |

`SUCCESS` descreve o deployment, não uma validação completa da aplicação. A API pública também respondeu na consulta abaixo. O item `practical-drum` da captura não aparece na lista atual de serviços retornada pela CLI; não foi tratado como serviço ativo nem removido.

## Resultado das consultas públicas

| GET | HTTP / tipo | Resultado |
| --- | --- | --- |
| `https://chiquedetalhes.com.br/` | 200, HTML | Homepage servida |
| `https://chiquedetalhes.com.br/api/products` | 200, HTML, 813 bytes | Retorna o HTML da SPA, não JSON; não há proxy funcional nessa rota |
| `https://backend-production-f06a.up.railway.app/` | 200, HTML | Processo do backend acessível |
| `https://backend-production-f06a.up.railway.app/api/health` | 200, JSON | Endpoint público acessível; não foi inspecionada sua implementação publicada |
| `https://backend-production-f06a.up.railway.app/api/products` | 200, JSON, 2 bytes | Catálogo público vazio (`[]`) no momento da consulta |
| `https://backend-production-f06a.up.railway.app/api/categories` | GET concluído, JSON | 5 categorias existentes: Brincos, Colares, Anéis, Pulseiras e Conjuntos |
| `https://backend-production-f06a.up.railway.app/api/popup/active` | GET concluído, JSON | `null`: nenhuma campanha ativa no momento da consulta |

Não houve login, tentativa de senha nem teste de escrita remoto. Dados privados e integridade do banco não foram auditados nesta etapa.

O cadastro de produtos pode utilizar as cinco categorias já existentes; a ausência de produtos não decorre de uma lista de categorias vazia. Slugs públicos confirmados: `brincos`, `colares`, `aneis`, `pulseiras`, `conjuntos`. A consulta de campanha ativa não comprova ausência de campanhas inativas.

Verificação adicional do JavaScript público: a homepage carrega `/assets/index-CalIiv0V.js`, cujo cliente de produtos usa a base `https://backend-production-f06a.up.railway.app/api`. Portanto, o frontend publicado já aponta ao backend correto. Isso comprova o valor incorporado ao bundle, mas não permite distinguir variável de build de constante no código. Nenhuma variável Railway foi lida. O alerta sobre `/api` abaixo refere-se a futuros builds sem configuração adequada, não a um erro de URL comprovado na versão publicada.

## Dois serviços e o subdomínio da API

Recomendação: manter **Frontend + Backend + Postgres**. O frontend entrega os arquivos React/Vite; o backend executa autenticação, permissões, vendas e acesso ao banco. `api.chiquedetalhes.com.br` é um endereço adicional para o **Backend existente**, não substitui o serviço nem exige criar um terceiro serviço de aplicação.

Uma consolidação em um único serviço de aplicação seria tecnicamente possível se o Express também servisse `dist` e o fallback de rotas da SPA. Exigiria alterar build, roteamento e operação; não é necessária para corrigir este projeto e não foi implementada nesta auditoria. Os domínios atuais já permitem operar separadamente. [Documentação de serviços](https://docs.railway.com/services), [domínios](https://docs.railway.com/networking/domains).

## Por que os dois mostram Root Directory `/`

`Root Directory` representa o diretório dentro da fonte enviada; não representa a branch Git `main`. Os serviços atualmente têm `source.repo=null` e `source.image=null`, compatíveis com publicação via CLI. A CLI informa root vazio/nulo nos deployments. O backend carregou `railway.toml` na raiz, enquanto no repositório local esse arquivo está em `backend/`; isso sugere envio da pasta backend como raiz, mas os metadados não provam o comando histórico utilizado.

Assim, `/` nos dois **não comprova configuração errada**: é correto quando cada upload já contém apenas sua aplicação. Se a fonte passar a ser o repositório completo, usar Frontend `/` e Backend `/backend`, com caminho de configuração `/backend/railway.toml`. Não combinar `/backend` no serviço com um pacote enviado que já tenha removido esse prefixo. Apenas entrar em uma subpasta no terminal não deve ser considerado garantia do contexto enviado. [Monorepos](https://docs.railway.com/deployments/monorepo), [contexto de envio pela CLI](https://docs.railway.com/cli/deploying).

## Configuração proposta para publicação futura

Esta tabela é uma especificação para revisão; nenhuma configuração remota foi aplicada.

| Item | Frontend | Backend |
| --- | --- | --- |
| Raiz, se enviar repositório completo | `/` | `/backend` |
| Instalação/build | `npm ci` e `npm run build` | `npm ci` e `npm run build`; postinstall gera Prisma Client |
| Processo | Caddy do Railpack servindo `dist`, com fallback SPA | `npm start` → `node dist/index.js` |
| Interface/porta | Porta efetivamente usada pelo Caddy, atualmente destino 8080 | `0.0.0.0` e `process.env.PORT`, fallback local 3001 |
| Domínios | `chiquedetalhes.com.br`, `www.chiquedetalhes.com.br` | Railway atual; opcionalmente `api.chiquedetalhes.com.br` |
| Healthcheck | Página estática | Preferir `/api/health` após validar sua consulta ao banco |

O frontend publicado já foi identificado como SPA pelo Railpack e usa Caddy; ausência de script `start` na raiz não implica falha nesse modo. Não substituir por `vite preview` para produção. `backend/nixpacks.toml` não controla o builder atual, identificado como Railpack. [Suporte Node/SPA do Railpack](https://railpack.com/languages/node/).

No código local, `src/services/api.ts` usa `VITE_API_URL` e fallback `/api`. Como o domínio principal atualmente devolve HTML em `/api/products`, o build separado precisa de `VITE_API_URL=https://backend-production-f06a.up.railway.app/api`, ou `https://api.chiquedetalhes.com.br/api` depois da configuração e validação do novo domínio. É configuração pública incorporada ao JavaScript, não lugar para senhas. Alterá-la exige um novo build do frontend. Alternativamente, seria necessário implementar e validar um proxy real de `/api`, que não existe no comportamento público observado.

O futuro domínio `api` deve ser adicionado ao Backend, com a porta efetiva do processo e o registro DNS solicitado pelo Railway. Não basta criar DNS sem cadastrar o domínio no serviço. Preservar CORS permitindo as origens do site. O navegador não acessa `*.railway.internal`: esses nomes destinam-se à comunicação entre serviços, como Backend → Postgres. [Domínios](https://docs.railway.com/networking/domains), [rede privada](https://docs.railway.com/networking/private-networking).

## Pendências e riscos observados

1. **Contexto do próximo build:** selecionar explicitamente o serviço e uma única estratégia de raiz antes de publicar, para evitar enviar o frontend ao Backend por engano.
2. **URL da API:** o fallback relativo `/api` não funciona no frontend publicado atual; definir a URL pública no build ou implementar proxy.
3. **Postgres:** existe domínio HTTP `postgres-production-1efc.up.railway.app` apontando à porta 5432. PostgreSQL usa TCP, portanto esse domínio HTTP não é necessário ao funcionamento do banco. Isso não prova existência de TCP Proxy nem exposição SQL efetiva. Recomenda-se Backend → Postgres pela rede privada; nenhuma rede foi alterada e nenhum acesso SQL foi realizado.
4. **Healthcheck:** configuração local `backend/railway.toml` ainda usa `/`, que apenas comprova processo acessível; revisar para `/api/health` na versão pronta, depois de validar conexão ao banco e migração.
5. **Mudança de usuários:** upgrades de schema/identidade devem ser validados com backup e estratégia de migração antes da publicação conjunta. A auditoria não executou migração nem alterou a senha existente.
6. **Segredos e proxy:** valores de `DATABASE_URL`, `JWT_SECRET`, Cloudinary e configuração de proxy não foram coletados. Validar presença e requisitos na preparação final, sem copiá-los para documentação. O limitador de login local depende de identificação correta do IP atrás do proxy; conferir topologia antes de configurar `TRUST_PROXY_HOPS`.

Nenhuma conclusão aqui autoriza publicar. A análise registra a arquitetura e os bloqueios técnicos para a preparação local continuar.
