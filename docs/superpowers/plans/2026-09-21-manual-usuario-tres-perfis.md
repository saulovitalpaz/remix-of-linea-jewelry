# Manual do usuário dos três perfis — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produzir um manual `.docx` completo, visual e operacional para Administrador, Gerência e Vendedor, com wireframes esquemáticos e espaços reservados para capturas reais.

**Architecture:** Um script Python isolado gera o documento com `python-docx`, utilizando componentes reutilizáveis para estilos, procedimentos, wireframes, espaços de captura e rodapé. O conteúdo é derivado do código atual, passa por auditorias estruturais e termina em renderização para PNG com inspeção visual de todas as páginas.

**Tech Stack:** Python 3, python-docx, OOXML, renderizador DOCX do skill Documents e LibreOffice headless.

## Global Constraints

- Escrever em português brasileiro, com linguagem direta e operacional.
- Organizar o conteúdo por perfil: Administrador, Gerência e Vendedor.
- Usar o preset `compact_reference_guide` com identidade creme, dourado discreto e carvão.
- Incluir wireframe numerado e quadro “INSERIR PRINT REAL AQUI” em cada procedimento principal.
- Não documentar checkout on-line, edição de venda ou estorno como recursos existentes.
- Informar que vendedores só registram vendas do dia atual e que a venda baixa o estoque automaticamente.
- Reservar exclusão de movimentações do fluxo de caixa ao Administrador.
- Entregar somente o `.docx` final; imagens de QA permanecem internas.

---

## Estrutura de arquivos

- Criar `scripts/build_user_manual.py`: conteúdo, componentes visuais e geração determinística do DOCX.
- Criar `docs/manual/Manual-do-Usuario-Chique-Detalhes.docx`: artefato final.
- Criar temporariamente `tmp/manual-render/`: PNGs de QA que não serão entregues nem versionados.

### Task 1: Consolidar conteúdo e permissões

**Files:**
- Read: `src/pages/Admin.tsx`
- Read: `src/components/admin/AdminDashboard.tsx`
- Read: `src/components/admin/CashFlowManager.tsx`
- Read: `src/components/admin/CategoryManager.tsx`
- Read: `src/components/admin/Settings.tsx`
- Read: `backend/src/app.ts`
- Read: `backend/src/validation.ts`
- Read: `README.md`
- Create: `scripts/build_user_manual.py`

**Interfaces:**
- Consumes: rótulos, ações e regras de acesso do sistema atual.
- Produces: constante `MANUAL_SECTIONS`, uma lista de capítulos e procedimentos usada pela geração visual.

- [ ] **Step 1: Mapear os menus e campos exibidos por perfil**

Registrar em `MANUAL_SECTIONS` o título, perfis autorizados, objetivo, caminho, passos, alertas e rótulos do wireframe de cada procedimento.

- [ ] **Step 2: Conferir cada permissão contra frontend e backend**

Executar:

```powershell
rg -n "user\.role|permit\(|canManage|canPickDate" src/pages/Admin.tsx src/components/admin backend/src
```

Expected: referências explícitas aos perfis `ADMIN`, `MANAGER` e `SELLER`, incluindo restrição de data e exclusão no fluxo de caixa.

- [ ] **Step 3: Auditar escopo e linguagem**

Executar:

```powershell
rg -n "checkout|estorno|editar venda" scripts/build_user_manual.py
```

Expected: nenhuma ocorrência apresentada como função disponível.

### Task 2: Implementar o sistema visual e os componentes do documento

**Files:**
- Modify: `scripts/build_user_manual.py`
- Create: `docs/manual/Manual-do-Usuario-Chique-Detalhes.docx`

**Interfaces:**
- Consumes: `MANUAL_SECTIONS` da Task 1.
- Produces: `build_document(output_path: Path) -> None`, `add_procedure(...)`, `add_wireframe(...)` e `add_screenshot_placeholder(...)`.

- [ ] **Step 1: Configurar página, estilos e tokens**

Aplicar Letter retrato, margens de 1 polegada, Calibri 11 pt, corpo com 6 pt após e espaçamento 1,25; H1 16 pt, H2 13 pt, H3 12 pt; cores de marca nomeadas `CREAM`, `GOLD`, `CHARCOAL` e `MUTED`.

- [ ] **Step 2: Criar componentes reutilizáveis**

Implementar capa, controle de versão, matriz de permissões, selo de perfil, passos numerados, notas, wireframes tabulares, quadro de captura, cabeçalho discreto e rodapé com número de página.

- [ ] **Step 3: Montar capítulos e procedimentos**

Gerar introdução, acesso, matriz de permissões, capítulos dos três perfis, solução de problemas e checklist final. Manter o wireframe e seus passos no mesmo bloco lógico sempre que houver espaço.

- [ ] **Step 4: Gerar o DOCX**

Executar:

```powershell
python scripts/build_user_manual.py
```

Expected: `docs/manual/Manual-do-Usuario-Chique-Detalhes.docx` existente e com tamanho superior a 20 KB.

### Task 3: Auditar estrutura e acessibilidade

**Files:**
- Test: `docs/manual/Manual-do-Usuario-Chique-Detalhes.docx`

**Interfaces:**
- Consumes: DOCX da Task 2.
- Produces: evidência de títulos, tabelas e imagens/descrições estruturalmente válidas.

- [ ] **Step 1: Auditar títulos e seções**

Executar:

```powershell
python C:/Users/saulo/.codex/plugins/cache/openai-primary-runtime/documents/26.521.10419/skills/documents/scripts/heading_audit.py docs/manual/Manual-do-Usuario-Chique-Detalhes.docx
python C:/Users/saulo/.codex/plugins/cache/openai-primary-runtime/documents/26.521.10419/skills/documents/scripts/section_audit.py docs/manual/Manual-do-Usuario-Chique-Detalhes.docx
```

Expected: hierarquia contínua de títulos e seção Letter retrato com margens configuradas.

- [ ] **Step 2: Auditar acessibilidade**

Executar:

```powershell
python C:/Users/saulo/.codex/plugins/cache/openai-primary-runtime/documents/26.521.10419/skills/documents/scripts/a11y_audit.py docs/manual/Manual-do-Usuario-Chique-Detalhes.docx
```

Expected: ausência de falhas críticas; linhas de cabeçalho das tabelas marcadas e hierarquia navegável.

- [ ] **Step 3: Verificar o conteúdo extraído**

Abrir o DOCX por `python-docx` e afirmar programaticamente que contém os termos `Administrador`, `Gerência`, `Vendedor`, `INSERIR PRINT REAL AQUI`, `Fluxo de Caixa`, `Registrar vendas` e `baixa automática`.

### Task 4: Renderizar e fazer inspeção visual

**Files:**
- Test: `docs/manual/Manual-do-Usuario-Chique-Detalhes.docx`
- Create temporarily: `tmp/manual-render/page-*.png`

**Interfaces:**
- Consumes: DOCX auditado da Task 3.
- Produces: páginas PNG aprovadas visualmente e o DOCX final corrigido.

- [ ] **Step 1: Renderizar todas as páginas**

Executar:

```powershell
python C:/Users/saulo/.codex/plugins/cache/openai-primary-runtime/documents/26.521.10419/skills/documents/render_docx.py docs/manual/Manual-do-Usuario-Chique-Detalhes.docx --output_dir tmp/manual-render
```

Expected: um arquivo `page-N.png` não vazio para cada página.

- [ ] **Step 2: Inspecionar todas as páginas em 100%**

Confirmar: ausência de texto cortado, sobreposição, tabelas quebradas, wireframes ilegíveis, espaços excessivos, títulos órfãos, rodapés deslocados e placeholders apertados.

- [ ] **Step 3: Corrigir e renderizar novamente**

Se houver defeito, ajustar `scripts/build_user_manual.py`, gerar novamente o DOCX e repetir a renderização completa até todas as páginas passarem.

- [ ] **Step 4: Verificar o artefato final**

Executar:

```powershell
Get-Item docs/manual/Manual-do-Usuario-Chique-Detalhes.docx | Select-Object FullName,Length,LastWriteTime
git status --short
```

Expected: DOCX final presente, não vazio, e somente arquivos planejados aparecendo como alterações relacionadas ao manual.

### Task 5: Registrar a entrega

**Files:**
- Add: `scripts/build_user_manual.py`
- Add: `docs/manual/Manual-do-Usuario-Chique-Detalhes.docx`

**Interfaces:**
- Consumes: artefato aprovado na Task 4.
- Produces: commit rastreável com o gerador e o manual final.

- [ ] **Step 1: Registrar os arquivos**

```powershell
git add -- scripts/build_user_manual.py docs/manual/Manual-do-Usuario-Chique-Detalhes.docx
git commit -m "docs: adicionar manual dos tres perfis"
```

Expected: commit criado sem incluir arquivos de renderização temporários.
