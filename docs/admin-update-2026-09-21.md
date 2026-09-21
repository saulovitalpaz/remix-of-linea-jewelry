# Atualização do painel e imagens

## Interface

- Barra inferior fixa para ADMIN, MANAGER e SELLER, com ações limitadas ao perfil e espaço inferior que inclui a área segura do dispositivo.
- ADMIN: Painel, Caixa, Produtos e Ajustes. Registro de venda é submenu do Caixa. Gerência e vendedor mantêm Vendas e Produtos.
- Dashboard com três indicadores na mesma linha: produtos cadastrados, unidades em estoque e produtos esgotados.
- Tipografia Montserrat no painel: título principal 24–30 px, títulos de página 24 px, títulos de cards 18 px, subtítulos 16 px, corpo 14 px, metadados 12 px.
- Tabelas adaptadas a blocos com rótulos abaixo de 1024 px, sem esconder valores ou exigir arraste horizontal. Relatórios impressos preservam tabelas.
- Seletor de dez ilustrações Fluent Emoji 3D com arquivos locais e licença MIT em `public/emoji/LICENSE.txt`. Mantém os valores Unicode no banco, sem migração. A loja renderiza a ilustração selecionada.
- Logo 1 extraída/refinada com imagegen a partir da logo completa; limpeza complementar do canal alfa e inspeção sobre fundo branco. Arquivo PNG transparente de 1774 × 887.

## Bucket / Railway

Não vincular o bucket ao frontend. Todas as credenciais permanecem no backend.

O backend aceita os nomes `STORAGE_*` existentes, os aliases AWS e as referências diretas do Railway:

| Configuração | Nome atual | Alternativas |
| --- | --- | --- |
| Endpoint | STORAGE_ENDPOINT | AWS_ENDPOINT_URL_S3, AWS_ENDPOINT_URL, ENDPOINT |
| Região | STORAGE_REGION | AWS_REGION, AWS_DEFAULT_REGION, REGION |
| Bucket S3 | STORAGE_BUCKET | AWS_S3_BUCKET_NAME, AWS_BUCKET_NAME, BUCKET |
| Chave | STORAGE_ACCESS_KEY_ID | AWS_ACCESS_KEY_ID, ACCESS_KEY_ID |
| Segredo | STORAGE_SECRET_ACCESS_KEY | AWS_SECRET_ACCESS_KEY, SECRET_ACCESS_KEY |

Não usar RAILWAY_BUCKET_NAME no lugar de BUCKET: são identificadores diferentes. STORAGE_PUBLIC_BASE_URL deve ficar vazio para bucket privado; só preencher se houver CDN público real.

Uploads continuam nos endpoints multipart de produtos e campanha. O backend salva uma URL estável `/api/images/products/...`; a leitura é autenticada entre backend e S3, e a imagem do catálogo é entregue publicamente pela API. O frontend resolve esse caminho usando VITE_API_URL, inclusive quando os serviços estão em domínios diferentes. Não são gravadas URLs assinadas com expiração no banco.

É necessário publicar frontend e backend para aplicar o conjunto. Nenhum deploy foi executado. Testes locais usam um servidor S3 simulado: não confirmam credenciais/configuração do bucket de produção. URLs antigas que apontem diretamente para o bucket privado devem ser substituídas reenviando a imagem.

## Referências e revisão

- [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md): foco, nomes acessíveis, labels, overflow e hierarquia de texto.
- [Fluent Emoji](https://github.com/microsoft/fluentui-emoji): opção 3D escolhida; [Noto Emoji](https://github.com/googlefonts/noto-emoji) foi avaliado como alternativa ilustrativa.
- [Railway Storage Buckets](https://docs.railway.com/storage-buckets): variáveis e acesso privado.

O navegador integrado não estava disponível para inspeção visual interativa. A busca Python da UI/UX Pro Max também estava indisponível; foram aplicadas as regras gerais da própria skill.

Validação: builds frontend/backend e oito testes de backend aprovados, incluindo round-trip de upload/leitura com S3 simulado e permissões por perfil. ESLint dos arquivos alterados aprovado. O lint global ainda aponta usos de `any` preexistentes em `backend/tests/api.test.ts` e avisos em componentes UI não alterados.

## Sessão

O acesso administrativo permanece salvo no `localStorage` do navegador por 24 horas, permitindo reabrir o webapp e compartilhar a sessão entre abas no mesmo dispositivo. O frontend remove o token quando a janela local vence; o backend também emite JWT com expiração de um dia, portanto a sessão não pode ser prolongada apenas alterando o relógio da interface. Sair remove imediatamente o token e o prazo salvo.

Quando o navegador expõe a instalação PWA, o cabeçalho do painel mostra `Instalar app`. O botão usa o prompt nativo, desaparece após a instalação e não aparece quando o painel já está em modo standalone. Navegadores que não oferecem o evento de instalação continuam usando o painel normalmente.
