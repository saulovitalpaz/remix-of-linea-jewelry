# Design do manual do usuário — três perfis

## Objetivo

Criar um manual do usuário em português brasileiro para o painel administrativo da Chique Detalhes. O documento deve ensinar, passo a passo, as funções disponíveis aos perfis Administrador, Gerência e Vendedor, usando wireframes esquemáticos e espaços reservados para que capturas reais sejam adicionadas posteriormente.

## Entregável

- Arquivo final em formato `.docx`.
- Manual visual organizado por perfil.
- Identidade visual inspirada na aplicação: creme, dourado discreto e texto escuro.
- Wireframes nativos no documento, formados por caixas, tabelas, rótulos e marcadores numerados.
- Um quadro “INSERIR PRINT REAL AQUI” após cada procedimento principal, acompanhado de legenda sugerida.
- Sumário, numeração de páginas e controle de versão.

## Público e linguagem

O manual será usado por pessoas que operam a loja no dia a dia. A linguagem será direta, acolhedora e operacional. Cada instrução começará com um verbo de ação e evitará termos técnicos desnecessários.

## Estrutura

1. Capa e controle de versão.
2. Como usar este manual.
3. Acesso ao painel, identificação do perfil e encerramento da sessão.
4. Matriz comparativa de permissões.
5. Administrador.
6. Gerência.
7. Vendedor.
8. Mensagens, erros comuns e solução de problemas.
9. Checklist de boas práticas.

## Conteúdo por perfil

### Administrador

- Visão geral do painel e navegação.
- Produtos: cadastrar, editar, excluir, atualizar estoque e definir destaque da página inicial.
- Categorias: cadastrar, editar e excluir.
- Vendas: registrar itens do catálogo, adicionar itens avulsos, escolher data e forma de pagamento, escrever observações, conferir o total, confirmar e consultar o histórico recente.
- Fluxo de caixa: consultar indicadores, filtrar período e tipo, registrar entrada ou saída, categorizar despesas e retiradas, emitir relatório e excluir movimentações.
- Campanha/pop-up: enviar imagem, ativar, desativar e excluir.
- Usuários: criar acesso e escolher perfil.

### Gerência

- Produtos e estoque: cadastrar, editar e excluir.
- Vendas: registrar itens do catálogo e avulsos, selecionar data atual ou retroativa, forma de pagamento, observações e confirmação.
- Histórico recente de lançamentos.
- Fluxo de caixa: consultar, filtrar, lançar entradas e saídas e emitir relatório.
- Limitações: não acessa configurações de usuários, campanha/pop-up, categorias exclusivas da administração nem exclusão de movimentações quando a interface restringir a ação.

### Vendedor

- Consultar produtos disponíveis.
- Registrar vendas do catálogo.
- Adicionar item avulso.
- Selecionar forma de pagamento e incluir observações.
- Conferir total e confirmar venda com baixa automática de estoque.
- Consultar o próprio histórico recente.
- Limitações: somente vendas do dia atual; sem gestão de produtos, categorias, usuários, campanhas ou fluxo de caixa.

## Padrão de cada procedimento

1. Título da tarefa.
2. Indicação dos perfis autorizados.
3. Resultado esperado.
4. Caminho no menu.
5. Passos numerados.
6. Wireframe esquemático com marcadores numéricos.
7. Quadro para captura real futura.
8. Nota, cuidado ou confirmação esperada, quando aplicável.

## Sistema visual

O documento usará o preset `compact_reference_guide`, com desvios nomeados para a marca: fundo creme claro em elementos de apoio, dourado escuro em títulos e bordas de destaque e carvão para o texto. Os wireframes serão monocromáticos com realces dourados, para permanecerem legíveis quando impressos em escala de cinza.

Os wireframes mostrarão apenas controles relevantes ao procedimento. Cada marcador numérico no desenho corresponderá ao mesmo número no passo a passo. Os espaços para prints terão proporção horizontal, borda tracejada, instrução centralizada e uma linha de legenda editável.

## Regras de precisão

- As permissões serão derivadas do código atual e do README do projeto.
- O manual não apresentará checkout on-line, estorno ou edição de venda como recursos existentes.
- Vendedores só poderão registrar vendas do dia atual.
- Administradores e gerentes poderão selecionar datas de venda.
- A exclusão de movimentações do fluxo de caixa será descrita como exclusiva do Administrador.
- O registro de venda informará que o estoque é baixado automaticamente.
- Campos e ações serão nomeados de acordo com os textos presentes na interface.

## Validação

- Revisar consistência entre permissões, capítulos e matriz de acesso.
- Verificar ausência de marcadores pendentes, exceto os espaços intencionais para prints.
- Renderizar o `.docx` em PNG e inspecionar todas as páginas.
- Corrigir quebras, cortes, sobreposições, tabelas apertadas e wireframes ilegíveis antes da entrega.
