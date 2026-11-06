# Check-up de testes e operação

Atualizado em 05/11/2026. Os documentos anteriores são registros históricos, não uma lista de tarefas atuais.

## Validação local

- `npm test`: 22 testes passaram; incluem API com banco simulado, bucket simulado, vendas, metas e regras do catálogo.
- `npm run build` e `npm --prefix backend run build`: passaram.
- `npm run lint -- --max-warnings=0`: zero erros e zero avisos; exportações de utilitários foram separadas dos componentes, mantendo a regra de Fast Refresh ativa.
- `npm audit` completo informou zero vulnerabilidades no frontend e no backend. A dependência transitiva do lint foi atualizada para a versão corrigida e o nodemon não utilizado foi removido.
- Inspeção com Playwright/Chrome: homepage, menus desktop e celular, dashboard, meta e relatório foram conferidos. O painel usou dados simulados; Escape foi verificado em ambos os menus. O PDF de exemplo preservou os itens, observações e assinaturas em uma página. Essa amostra não garante ausência de falhas ou redundâncias em outras telas e tamanhos.

## Produção observada

O commit `46bd6ae` foi publicado no frontend e backend, ambos com deployment SUCCESS. A API de saúde e o catálogo responderam HTTP 200; o catálogo consultou o banco e retornou dois produtos e cinco categorias. As duas imagens de produtos responderam HTTP 200 via backend com credenciais privadas do bucket. Não foram executados novos uploads nem vendas reais na verificação.

Nos logs das 24 horas consultadas havia três avisos do Caddy: endpoint administrativo desabilitado e HTTP/2 e HTTP/3 ignorados na conexão interna sem TLS. O PostgreSQL registrou conexões encerradas pelo cliente na troca do backend, além de checkpoints normais classificados como erro pelo coletor. Não foram identificadas mensagens de erro ou aviso no log de execução do backend nesse recorte. Os builds anteriores registraram avisos de npm, descontinuação do Recharts 2 e vulnerabilidades do lockfile então implantado; os lockfiles foram corrigidos neste conjunto de alterações; a auditoria precisa ser repetida quando as dependências forem atualizadas.

Os logs são uma amostra temporal e não provam saúde contínua. Backups, restauração, autenticação e fluxos de escrita não foram exercitados no banco real. O serviço não expõe a chave do bucket ao frontend. Vendas antigas sem nomes salvos não podem ser reconstruídas automaticamente.

## Próximas verificações reais

- Complementar a inspeção visual com dados reais autorizados, outros tamanhos e relatório com múltiplas páginas.
- Em ambiente de teste, registrar uma venda e conferir estoque, histórico e relatório; testar upload e leitura de imagem.
- Monitorar conexões PostgreSQL e revisar backup/restauração; acompanhar novas versões e auditorias das ferramentas de desenvolvimento.

Os arquivos `railpack.json` usam instalação a partir do lockfile e removem a variável obsoleta `NPM_CONFIG_PRODUCTION` apenas nos comandos npm, preservando as dependências de desenvolvimento no build. O backend inicia diretamente pelo Node. A eficácia em produção deve ser confirmada pelos logs após o deploy.
