# Separação dos uploads Railway

Estado informado pelo usuário: a raiz local está vinculada ao serviço Frontend e `backend/` ao serviço Backend. Isso seleciona destinos distintos; não muda a arquitetura nem cria uma API por si só.

O Frontend pode fazer build a partir da raiz de um monorepo. A presença de `backend/` no contexto de build não a torna pública automaticamente: a configuração atual do Railpack/Caddy publica `dist`. Ainda assim, o backend não é necessário nesse contexto.

Foi adicionado `.railwayignore` na raiz para excluir `backend/`, o protótipo Next.js `app/`, artefatos locais, documentação e arquivos de ambiente. `backend/.railwayignore` reapresenta o conteúdo do backend quando ele é escolhido explicitamente como raiz de upload, removendo depois dependências, artefatos, testes e arquivos privados. Nenhum arquivo de aplicação foi apagado por essas regras.

## Publicação autorizada em 21/09/2026

O usuário autorizou commit, push para `origin/main` e `railway up` após concluir e verificar os upgrades do portal de vendas. Enviar ambos os serviços com `--detach` e registrar a confirmação do upload, sem acompanhar o status posterior do deploy. As instruções abaixo definem os contextos; o resultado efetivo fica no registro de entrega desta implementação.

| Serviço | Contexto esperado no pacote | Root Directory remoto |
| --- | --- | --- |
| Frontend | Conteúdo da raiz filtrado por `.railwayignore`; `package.json` Vite na raiz | `/` |
| Backend | Conteúdo de `backend/`, com seu `package.json` e `railway.toml` na raiz do pacote | `/` |

Para tornar explícito o segundo caso em uma publicação futura, a CLI oferece `--path-as-root` com um argumento de caminho. Na raiz do repositório, o formato seria `railway up ./backend --path-as-root --service Backend`; dentro de `backend/`, o equivalente é indicar `.` como caminho com `--path-as-root`. Selecionar o serviço explicitamente evita depender apenas do último vínculo local. Não basta supor que entrar na pasta altera a raiz de empacotamento.

Se a estratégia mudar para enviar o repositório inteiro ao backend, remover a exclusão incompatível desse contexto e configurar `/backend` no serviço, além de `/backend/railway.toml` como arquivo de configuração. Não combinar essa estratégia com um pacote que já tenha o backend na raiz.

Não usar `--no-gitignore` como solução para arquivos faltantes. `VITE_API_URL` deve existir nas variáveis de build do Frontend; os segredos de banco/JWT/Cloudinary ficam somente no Backend. Os `.env` locais não são enviados.

## Verificação realizada e limite

Foi inspecionado o help local da CLI 4.30.5 e seu código oficial: o empacotamento usa `.railwayignore`, `.gitignore`, e a opção `--path-as-root` define o caminho e o prefixo do pacote. Uma checagem local dos padrões com `rg` manteve os arquivos de aplicação necessários e excluiu o backend do contexto frontend e os ambientes privados; os modelos `.env.example` podem permanecer pela precedência das regras e não contêm segredos. Essa checagem não reproduz integralmente o empacotador da CLI. Nenhum comando de upload foi executado, portanto o arquivo final enviado ao Railway ainda não foi produzido/inspecionado. Antes da futura publicação, conferir o serviço selecionado, a raiz e as variáveis de build.

Fontes: [Deploy pela CLI](https://docs.railway.com/cli/deploying), [implementação da CLI 4.30.5](https://github.com/railwayapp/cli/blob/v4.30.5/src/commands/up.rs).
