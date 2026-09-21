# Revisão do administrativo — 21/09/2026

Critérios: [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) e ui-ux-pro-max (hierarquia, densidade, conteúdo longo e navegação).

Achados na versão anterior:

- `src/admin.css:27` — regra global anulava `truncate`; nomes e descrições aumentavam as linhas.
- `src/admin.css:49` — tabelas responsivas repetiam rótulos e distribuíam cada lançamento em várias linhas.
- `src/components/admin/CategoryManager.tsx:227` — categoria empilhava título, slug, descrição, contagem e ações.
- `src/components/admin/AdminDashboard.tsx:44` — indicadores sem navegação para os dados.
- `src/components/admin/CashFlowReportModal.tsx:28` — impressão incluía a aplicação e não definia margens de relatório.

Correções: estoque e categorias compactos; lançamentos em duas linhas com detalhes expansíveis; indicadores vinculados a filtros na URL; identificação nominal dos esgotados; imagem transparente ou cinco emojis por categoria; relatório isolado em portal com A4, margens, marca, título, observações e assinaturas.

Validação: builds TypeScript/Vite e backend; testes HTTP e armazenamento incluindo bytes preservados no upload de categoria, autorização, conservação da imagem ao editar e retorno ao emoji. Lint direcionado aos arquivos alterados. O lint geral contém sete erros preexistentes de `no-explicit-any` em `backend/tests/api.test.ts`.

Limite: nenhum navegador disponível no runtime desta sessão; impressão física, PDF e layout visual não foram conferidos em navegador.
