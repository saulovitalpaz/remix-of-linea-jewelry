import fs from "node:fs";
import path from "node:path";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  LevelFormat,
  PageBreak,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";

const OUTPUT = path.resolve("docs/manual/Manual-do-Usuario-Chique-Detalhes.docx");

const CREAM = "FBF7EF";
const CREAM_DARK = "F2E8D5";
const GOLD = "9A6B22";
const GOLD_LIGHT = "E8D4AE";
const CHARCOAL = "2F2A25";
const MUTED = "6F675F";
const WHITE = "FFFFFF";
const GREEN = "277A53";
const RED = "A33D36";
const LINE = "C9BBA5";

const noBorder = { style: BorderStyle.NIL, size: 0, color: WHITE };
const thinBorder = { style: BorderStyle.SINGLE, size: 8, color: LINE };
const dashedBorder = { style: BorderStyle.DASHED, size: 12, color: GOLD };

const permissions = [
  ["Função", "Administrador", "Gerência", "Vendedor"],
  ["Painel geral", "Sim", "—", "—"],
  ["Consultar produtos e estoque", "Sim", "Sim", "Sim"],
  ["Cadastrar, editar e excluir produtos", "Sim", "Sim", "—"],
  ["Gerenciar categorias", "Sim", "—", "—"],
  ["Registrar vendas", "Sim", "Sim", "Sim"],
  ["Escolher data retroativa da venda", "Sim", "Sim", "—"],
  ["Consultar fluxo de caixa", "Sim", "—*", "—"],
  ["Excluir movimentação financeira", "Sim", "—", "—"],
  ["Campanha / popup e usuários", "Sim", "—", "—"],
];

const MANUAL_SECTIONS = [
  {
    profile: "Administrador",
    intro: "Acesso completo ao painel: visão geral, catálogo, categorias, vendas, caixa, campanha e usuários.",
    procedures: [
      {
        title: "Conhecer o Painel Geral",
        access: "Administrador",
        result: "Localizar indicadores e atalhos para as principais áreas da loja.",
        path: "Painel administrativo > Painel Geral",
        steps: [
          "Confira os cartões Produtos, Unidades, Categorias e Esgotados.",
          "Use Ver loja pública para abrir a vitrine em outra aba.",
          "Escolha um atalho: Fluxo de Caixa, Registrar Vendas, Catálogo & Estoque ou Configurações & Usuários.",
          "Consulte o valor estimado do estoque e as categorias ativas na parte inferior.",
        ],
        wireframe: [
          ["[ CHIQUE DETALHES ]", "Usuário: Administrador", "[ Sair ]"],
          ["1  Produtos: 48", "1  Unidades: 126", "1  Esgotados: 3"],
          ["2  [ Ver loja pública ]", "3  [ Fluxo de Caixa ]", "3  [ Registrar Vendas ]"],
          ["3  [ Catálogo & Estoque ]", "3  [ Configurações ]", "4  Valor do estoque"],
        ],
      },
      {
        title: "Cadastrar um produto",
        access: "Administrador e Gerência",
        result: "Adicionar um produto à vitrine e ao estoque.",
        path: "Produtos e estoque > Novo produto",
        steps: [
          "Clique em Novo produto.",
          "Preencha Nome do Produto, Categoria, Preço (R$) e Estoque.",
          "Escreva a Descrição do produto.",
          "Envie uma foto JPEG, PNG ou WebP de até 5 MB, ou escolha uma imagem existente da galeria.",
          "Revise os dados e clique em Salvar produto.",
          "Confirme a mensagem de sucesso e verifique o novo item na tabela.",
        ],
        wireframe: [
          ["Produtos e estoque", "", "[ 1  Novo produto ]"],
          ["2  Nome do Produto", "2  Categoria", "2  Preço / Estoque"],
          ["3  Descrição", "4  Imagem / Galeria", "Prévia"],
          ["[ Cancelar ]", "", "[ 5  Salvar produto ]"],
        ],
        note: "Preço deve ser maior que zero. Estoque usa número inteiro e pode começar em zero.",
      },
      {
        title: "Editar, destacar ou excluir um produto",
        access: "Administrador e Gerência",
        result: "Manter informações e disponibilidade do catálogo atualizadas.",
        path: "Produtos e estoque > tabela Catálogo de Produtos",
        steps: [
          "Localize o produto na tabela.",
          "Clique na estrela para incluir ou remover o item dos Destaques da Homepage.",
          "Clique em Editar, altere os campos necessários e salve.",
          "Para remover o produto, clique em Excluir e confirme a pergunta exibida.",
          "Clique em Atualizar se precisar recarregar a lista.",
        ],
        wireframe: [
          ["Produto", "Preço / Estoque", "Ações"],
          ["Brinco Aurora", "R$ 89,90  |  4 un.", "2  ☆   3  Editar   4  Excluir"],
          ["Colar Luz", "R$ 119,90 | 0 un.", "★   Editar   Excluir"],
          ["", "", "5  [ Atualizar ]"],
        ],
        warning: "A exclusão é permanente. Confirme primeiro se o produto não deve apenas ficar com estoque zero.",
      },
      {
        title: "Gerenciar categorias",
        access: "Administrador",
        result: "Organizar as seções usadas na vitrine e no cadastro de produtos.",
        path: "Categorias",
        steps: [
          "Clique em Categorias no menu.",
          "Para criar, preencha Nome, Identificador (slug), Descrição e escolha uma ilustração.",
          "Clique em Adicionar categoria.",
          "Para alterar, clique em Editar, faça os ajustes e salve.",
          "Para remover, clique em Excluir. A ação fica indisponível quando existem produtos vinculados.",
        ],
        wireframe: [
          ["Nova categoria", "Categorias cadastradas", "Ações"],
          ["2  Nome / Slug", "Semijoias  (18 produtos)", "4  Editar"],
          ["2  Descrição / Ilustração", "Bolsas (6 produtos)", "5  Excluir"],
          ["3  [ Adicionar categoria ]", "Infantil (0 produtos)", "Excluir"],
        ],
      },
      {
        title: "Registrar uma venda",
        access: "Todos os perfis",
        result: "Registrar a receita e dar baixa automática nas peças vendidas.",
        path: "Registrar vendas",
        steps: [
          "Localize cada produto vendido e informe a Quantidade vendida.",
          "Se houver item fora do catálogo, use Adicionar item avulso e informe descrição, preço e quantidade.",
          "Administrador e Gerência podem selecionar a Data da venda; Vendedor registra somente o dia atual.",
          "Escolha a Forma de pagamento.",
          "Escreva uma observação quando necessário.",
          "Confira as peças, os itens avulsos e o Total da venda.",
          "Clique em Confirmar vendas e aceite a confirmação final.",
          "Verifique a mensagem de sucesso e o Histórico recente dos seus lançamentos.",
        ],
        wireframe: [
          ["Registrar Vendas", "Resumo de hoje", "Faturamento / peças"],
          ["1  Produto | Estoque | Quantidade", "2  + Item avulso", "3  Data"],
          ["4  Forma de pagamento", "5  Observações", "6  Total: R$ 239,80"],
          ["8  Histórico recente", "", "7  [ Confirmar vendas ]"],
        ],
        warning: "A confirmação reduz o estoque e cria uma entrada no fluxo de caixa. Revise quantidades e valores antes de continuar.",
      },
      {
        title: "Controlar o fluxo de caixa",
        access: "Administrador",
        result: "Acompanhar entradas, saídas, vendas e saldo por período.",
        path: "Fluxo de Caixa",
        steps: [
          "Escolha as datas inicial e final para filtrar o período.",
          "Use o filtro de tipo quando quiser exibir apenas entradas ou saídas.",
          "Confira Total de Entradas, Total de Saídas, Saldo e Vendas.",
          "Para um novo lançamento, escolha Entrada ou Saída, categoria, valor, descrição, data, forma de pagamento e observações.",
          "Clique em Salvar movimentação.",
          "Use Emitir relatório para visualizar e exportar os dados do período.",
          "Na tabela, confira data, descrição, usuário responsável e valor.",
        ],
        wireframe: [
          ["Fluxo de Caixa", "1  De / Até", "2  Tipo: Todos"],
          ["3  Entradas", "3  Saídas", "3  Saldo / Vendas"],
          ["4  Nova movimentação", "Tipo / Categoria / Valor", "5  [ Salvar ]"],
          ["7  Histórico financeiro", "Usuário / Data / Valor", "6  [ Emitir relatório ]"],
        ],
      },
      {
        title: "Excluir uma movimentação financeira",
        access: "Administrador",
        result: "Corrigir um lançamento indevido e recalcular o saldo.",
        path: "Fluxo de Caixa > Histórico financeiro > Ações",
        steps: [
          "Localize a movimentação que foi lançada incorretamente.",
          "Confira a descrição, o valor, a data e o usuário responsável.",
          "Clique no ícone Excluir na coluna Ações.",
          "Leia o aviso; em vendas, a entrada financeira será removida e o saldo recalculado.",
          "Confirme a exclusão e aguarde a mensagem de sucesso.",
        ],
        wireframe: [
          ["Data", "Descrição / Usuário", "Valor / Ações"],
          ["18/09/2026", "Venda registrada — Bárbara", "+ R$ 189,90   3  Excluir"],
          ["18/09/2026", "Material de embalagem", "− R$ 35,00    Excluir"],
          ["", "4  Aviso de confirmação", "5  [ Confirmar ]"],
        ],
        warning: "Excluir uma entrada de venda no caixa não recompõe automaticamente o estoque vendido.",
      },
      {
        title: "Gerenciar a campanha da homepage",
        access: "Administrador",
        result: "Publicar, pausar ou substituir o popup promocional da vitrine.",
        path: "Configurações > Popup da homepage",
        steps: [
          "Confira a prévia e o status da campanha atual.",
          "Clique em Ativar popup ou Desativar popup para mudar a visibilidade.",
          "Para substituir, selecione uma nova imagem JPEG, PNG ou WebP de até 5 MB.",
          "Clique em Salvar e ativar campanha.",
          "Confirme a mensagem Nova campanha salva e ativada.",
        ],
        wireframe: [
          ["Popup da homepage", "Prévia da campanha", "Status"],
          ["1  Imagem atual", "[ imagem vertical ]", "Ativo"],
          ["3  Nova imagem", "Selecionar arquivo", "2  [ Desativar popup ]"],
          ["", "", "4  [ Salvar e ativar ]"],
        ],
        note: "O popup aparece uma vez por sessão para cada visitante.",
      },
      {
        title: "Criar um usuário e escolher o perfil",
        access: "Administrador",
        result: "Criar um acesso individual com as permissões corretas.",
        path: "Configurações > Usuários e permissões",
        steps: [
          "Informe Nome de acesso com nome e sobrenome.",
          "Crie uma Senha inicial com pelo menos 6 caracteres.",
          "Escolha o perfil: Admin, Gerência ou Vendedor.",
          "Confira a descrição de acesso mostrada abaixo do perfil.",
          "Clique em Criar usuário.",
          "Compartilhe a senha por um canal privado e peça a confirmação do primeiro acesso.",
        ],
        wireframe: [
          ["Usuários e permissões", "Novo acesso", "Equipe atual"],
          ["1  Nome de acesso", "2  Senha inicial", "Bárbara — Admin"],
          ["3  Perfil: Vendedor", "4  Consulta e registra vendas", "Ana — Gerência"],
          ["", "5  [ Criar usuário ]", "Carlos — Vendedor"],
        ],
        warning: "Nunca envie senhas em grupos públicos ou registre a senha dentro deste manual.",
      },
    ],
  },
  {
    profile: "Gerência",
    intro: "Opera vendas e mantém produtos e estoque. No painel atual, o menu visível contém Registrar vendas e Produtos e estoque.",
    procedures: [
      {
        title: "Atualizar produtos e estoque",
        access: "Gerência",
        result: "Manter nome, preço, estoque, descrição e imagem corretos.",
        path: "Produtos e estoque",
        steps: [
          "Confira os cartões de produtos, unidades, destaques e esgotados.",
          "Clique em Novo produto para cadastrar um item ou em Editar na linha existente.",
          "Ajuste os dados e a imagem necessários.",
          "Salve e confirme a mensagem de sucesso.",
          "Use Excluir apenas quando o item realmente não deve mais aparecer no catálogo.",
        ],
        wireframe: [
          ["Produtos e estoque", "Indicadores", "[ Novo produto ]"],
          ["Produto", "Preço / Estoque", "2  Editar / Excluir"],
          ["3  Formulário de edição", "Campos e imagem", "4  [ Salvar ]"],
          ["", "", "5  Ação de exclusão"],
        ],
      },
      {
        title: "Registrar venda atual ou retroativa",
        access: "Gerência",
        result: "Registrar vendas da equipe com a data correta.",
        path: "Registrar vendas",
        steps: [
          "Informe as quantidades dos produtos e adicione itens avulsos quando necessário.",
          "Escolha a Data da venda. Use data retroativa somente para corrigir omissão de lançamento.",
          "Selecione a Forma de pagamento e preencha as observações.",
          "Confira o total e confirme as vendas.",
          "Verifique o lançamento no histórico recente.",
        ],
        wireframe: [
          ["Registrar Vendas", "Produtos", "Quantidade"],
          ["1  Itens do catálogo", "1  Item avulso", "2  Data da venda"],
          ["3  Pagamento", "3  Observações", "4  Total"],
          ["5  Histórico recente", "", "4  [ Confirmar vendas ]"],
        ],
        warning: "Não use uma data retroativa para deslocar vendas entre períodos sem autorização da administração.",
      },
      {
        title: "Entender os limites da Gerência",
        access: "Gerência",
        result: "Evitar tentativas de acesso a ações exclusivas da Administração.",
        path: "Menu do painel",
        steps: [
          "Use Registrar vendas para os lançamentos diários.",
          "Use Produtos e estoque para manter o catálogo.",
          "Solicite ao Administrador alterações de categorias, campanha, usuários ou exclusões financeiras.",
          "Não compartilhe seu acesso; cada lançamento deve manter o nome do responsável.",
        ],
        wireframe: [
          ["Menu da Gerência", "Disponível", "Solicitar ao Admin"],
          ["1  Registrar vendas", "Sim", ""],
          ["2  Produtos e estoque", "Sim", ""],
          ["Categorias / Configurações / Caixa", "", "3  Administração"],
        ],
        note: "O backend possui regras financeiras para perfis de gestão, mas o menu atual expõe o Fluxo de Caixa somente ao Administrador.",
      },
    ],
  },
  {
    profile: "Vendedor",
    intro: "Consulta o estoque e registra vendas do dia atual. Não altera produtos, categorias, campanhas, usuários ou caixa.",
    procedures: [
      {
        title: "Consultar produtos disponíveis",
        access: "Vendedor",
        result: "Confirmar disponibilidade e preço antes de registrar a venda.",
        path: "Produtos e estoque",
        steps: [
          "Abra Produtos e estoque.",
          "Consulte os indicadores de unidades e itens esgotados.",
          "Localize o produto na tabela e confira preço e estoque.",
          "Clique em Atualizar quando precisar recarregar os dados.",
          "Se houver divergência, comunique a Gerência antes de vender.",
        ],
        wireframe: [
          ["Produtos e estoque", "2  Indicadores", "4  [ Atualizar ]"],
          ["Produto", "Preço", "3  Estoque"],
          ["Brinco Aurora", "R$ 89,90", "4 unidades"],
          ["Colar Luz", "R$ 119,90", "Esgotado"],
        ],
      },
      {
        title: "Registrar uma venda do dia",
        access: "Vendedor",
        result: "Concluir o lançamento com estoque, caixa e autoria atualizados.",
        path: "Registrar vendas",
        steps: [
          "Informe a Quantidade vendida ao lado de cada produto.",
          "Adicione itens avulsos, se existirem, com descrição, preço e quantidade.",
          "Confirme a data exibida; o perfil Vendedor registra somente o dia atual.",
          "Escolha a Forma de pagamento.",
          "Inclua uma observação quando ajudar a identificar a venda.",
          "Confira o total e clique em Confirmar vendas.",
          "Aceite a confirmação final e aguarde a mensagem de sucesso.",
        ],
        wireframe: [
          ["Registrar Vendas", "1  Produto / Quantidade", "Resumo de hoje"],
          ["2  + Item avulso", "3  Data de hoje", "Peças vendidas"],
          ["4  Forma de pagamento", "5  Observações", "6  Total"],
          ["", "", "6  [ Confirmar vendas ]"],
        ],
        warning: "Nunca confirme uma venda com quantidade maior que o estoque disponível.",
      },
      {
        title: "Consultar o próprio histórico recente",
        access: "Todos os perfis",
        result: "Conferir os lançamentos feitos pelo usuário conectado.",
        path: "Registrar vendas > Histórico recente dos seus lançamentos",
        steps: [
          "Role a página até o histórico recente.",
          "Confira data, horário, descrição, observação, pagamento, unidades e valor.",
          "Compare o lançamento com o comprovante ou anotação da venda.",
          "Se identificar erro, não duplique o lançamento: comunique a Administração.",
        ],
        wireframe: [
          ["Histórico recente", "Data / Descrição", "Pagamento / Valor"],
          ["1  Registro 1", "21/09  Venda registrada", "PIX  R$ 89,90"],
          ["2  Registro 2", "21/09  Venda + item avulso", "Dinheiro R$ 149,90"],
          ["", "3  Conferir comprovante", "4  Informar divergência"],
        ],
      },
      {
        title: "Entender os limites do Vendedor",
        access: "Vendedor",
        result: "Usar somente as funções autorizadas e preservar a rastreabilidade.",
        path: "Menu do painel",
        steps: [
          "Use Registrar vendas para lançamentos do dia atual.",
          "Use Produtos e estoque somente para consulta.",
          "Peça à Gerência ajustes de produto ou estoque.",
          "Peça ao Administrador correções financeiras, usuários, categorias ou campanhas.",
          "Clique em Sair ao terminar, principalmente em dispositivo compartilhado.",
        ],
        wireframe: [
          ["Menu do Vendedor", "Pode fazer", "Não pode fazer"],
          ["1  Registrar vendas", "Venda do dia", "Data retroativa"],
          ["2  Produtos e estoque", "Consultar", "Editar / Excluir"],
          ["5  [ Sair ]", "", "Caixa / Configurações"],
        ],
      },
    ],
  },
];

function run(text, options = {}) {
  return new TextRun({ text, font: "Calibri", color: CHARCOAL, size: 22, ...options });
}

function paragraph(text, options = {}) {
  return new Paragraph({
    children: [run(text, options.run)],
    spacing: { after: 120, line: 300 },
    ...options,
  });
}

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ text, heading: level, keepNext: true });
}

function cell(text, options = {}) {
  const fill = options.fill ?? WHITE;
  return new TableCell({
    width: options.width ? { size: options.width, type: WidthType.DXA } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    shading: { type: ShadingType.CLEAR, fill, color: "auto" },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    borders: options.borders ?? { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
    children: [
      new Paragraph({
        alignment: options.align ?? AlignmentType.LEFT,
        spacing: { after: 0, line: 260 },
        children: [run(String(text), { bold: options.bold, color: options.color ?? CHARCOAL, size: options.size ?? 20 })],
      }),
    ],
  });
}

function addPermissionTable() {
  const widths = [3960, 1800, 1800, 1800];
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: widths,
    rows: permissions.map((row, ri) => new TableRow({
      tableHeader: ri === 0,
      children: row.map((value, ci) => cell(value, {
        width: widths[ci],
        fill: ri === 0 ? GOLD : ri % 2 ? CREAM : WHITE,
        color: ri === 0 ? WHITE : CHARCOAL,
        bold: ri === 0 || ci === 0,
        align: ci === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
      })),
    })),
  });
}

function profileBanner(profile, intro) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2200, 7160],
    rows: [new TableRow({ tableHeader: true, children: [
      cell(profile.toUpperCase(), { width: 2200, fill: GOLD, color: WHITE, bold: true, align: AlignmentType.CENTER, size: 22 }),
      cell(intro, { width: 7160, fill: CREAM_DARK, color: CHARCOAL, size: 20 }),
    ] })],
  });
}

function metaBox(proc) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1600, 7760],
    rows: [
      new TableRow({ tableHeader: true, children: [cell("ACESSO", { width: 1600, fill: GOLD_LIGHT, bold: true }), cell(proc.access, { width: 7760, fill: CREAM })] }),
      new TableRow({ children: [cell("OBJETIVO", { width: 1600, fill: GOLD_LIGHT, bold: true }), cell(proc.result, { width: 7760, fill: CREAM })] }),
      new TableRow({ children: [cell("CAMINHO", { width: 1600, fill: GOLD_LIGHT, bold: true }), cell(proc.path, { width: 7760, fill: CREAM })] }),
    ],
  });
}

function wireframe(title, rows) {
  const children = [
    new TableRow({ tableHeader: true, children: [
      new TableCell({
        columnSpan: 3,
        shading: { type: ShadingType.CLEAR, fill: CHARCOAL, color: "auto" },
        margins: { top: 90, bottom: 90, left: 140, right: 140 },
        borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
        children: [new Paragraph({ spacing: { after: 0 }, children: [run(`WIREFRAME — ${title}`, { bold: true, color: WHITE, size: 20 })] })],
      }),
    ] }),
  ];
  for (const row of rows) {
    children.push(new TableRow({ children: row.map((value, index) => cell(value || " ", {
      width: 3120,
      fill: index === 0 ? CREAM : WHITE,
      size: 18,
      align: AlignmentType.CENTER,
    })) }));
  }
  return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [3120, 3120, 3120], rows: children });
}

function screenshotPlaceholder(title) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({ tableHeader: true, height: { value: 1560 }, children: [new TableCell({
      verticalAlign: VerticalAlign.CENTER,
      shading: { type: ShadingType.CLEAR, fill: CREAM, color: "auto" },
      margins: { top: 160, bottom: 160, left: 160, right: 160 },
      borders: { top: dashedBorder, bottom: dashedBorder, left: dashedBorder, right: dashedBorder },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [run("INSERIR PRINT REAL AQUI", { bold: true, color: GOLD, size: 24 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [run(`Legenda sugerida: ${title} no painel da Chique Detalhes.`, { italic: true, color: MUTED, size: 18 })] }),
      ],
    })] })],
  });
}

function callout(label, text, tone = "note") {
  const color = tone === "warning" ? RED : GREEN;
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1200, 8160],
    rows: [new TableRow({ tableHeader: true, children: [
      cell(label.toUpperCase(), { width: 1200, fill: color, color: WHITE, bold: true, align: AlignmentType.CENTER, size: 18 }),
      cell(text, { width: 8160, fill: CREAM, color: CHARCOAL, size: 19 }),
    ] })],
  });
}

function addProcedure(proc) {
  const blocks = [
    heading(proc.title, HeadingLevel.HEADING_2),
    metaBox(proc),
    paragraph(""),
    heading("Passo a passo", HeadingLevel.HEADING_3),
    ...proc.steps.map((step) => new Paragraph({
      numbering: { reference: "manual-numbering", level: 0 },
      spacing: { after: 80, line: 300 },
      children: [run(step)],
    })),
    paragraph(""),
    wireframe(proc.title, proc.wireframe),
    paragraph("Os números no wireframe correspondem aos passos acima.", { run: { italic: true, color: MUTED, size: 18 } }),
    screenshotPlaceholder(proc.title),
  ];
  if (proc.note) blocks.push(paragraph(""), callout("Nota", proc.note));
  if (proc.warning) blocks.push(paragraph(""), callout("Atenção", proc.warning, "warning"));
  blocks.push(new Paragraph({ children: [new PageBreak()] }));
  return blocks;
}

function cover() {
  return [
    new Paragraph({ spacing: { before: 800, after: 160 }, alignment: AlignmentType.CENTER, children: [run("CHIQUE DETALHES", { bold: true, color: GOLD, size: 30, characterSpacing: 60 })] }),
    new Paragraph({ spacing: { before: 520, after: 180 }, alignment: AlignmentType.CENTER, children: [run("Manual do Usuário", { bold: true, color: CHARCOAL, size: 52 })] }),
    new Paragraph({ spacing: { after: 420 }, alignment: AlignmentType.CENTER, children: [run("Painel administrativo — Administrador, Gerência e Vendedor", { color: MUTED, size: 26 })] }),
    new Table({
      width: { size: 7200, type: WidthType.DXA },
      columnWidths: [2400, 2400, 2400],
      alignment: AlignmentType.CENTER,
      rows: [new TableRow({ tableHeader: true, children: [
        cell("ADMINISTRADOR", { width: 2400, fill: GOLD, color: WHITE, bold: true, align: AlignmentType.CENTER }),
        cell("GERÊNCIA", { width: 2400, fill: CREAM_DARK, bold: true, align: AlignmentType.CENTER }),
        cell("VENDEDOR", { width: 2400, fill: CREAM, bold: true, align: AlignmentType.CENTER }),
      ] })],
    }),
    new Paragraph({ spacing: { before: 900, after: 120 }, alignment: AlignmentType.CENTER, children: [run("VERSÃO 1.0", { bold: true, color: GOLD, size: 20 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [run("21 de setembro de 2026", { color: MUTED, size: 20 })] }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function frontMatter() {
  return [
    heading("Controle do documento"),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [1800, 2500, 5060],
      rows: [
        new TableRow({ tableHeader: true, children: [cell("Versão", { width: 1800, fill: GOLD, color: WHITE, bold: true }), cell("Data", { width: 2500, fill: GOLD, color: WHITE, bold: true }), cell("Descrição", { width: 5060, fill: GOLD, color: WHITE, bold: true })] }),
        new TableRow({ children: [cell("1.0", { width: 1800 }), cell("21/09/2026", { width: 2500 }), cell("Primeira edição do manual dos três perfis.", { width: 5060 })] }),
      ],
    }),
    paragraph(""),
    heading("Como usar este manual"),
    paragraph("Procure primeiro o capítulo do seu perfil. Em cada tarefa, leia o objetivo, siga os passos numerados e use o wireframe para localizar os controles. O espaço tracejado foi preparado para receber uma captura real do sistema."),
    callout("Dica", "Depois de inserir um print, mantenha a legenda sugerida e acrescente a data da captura para facilitar futuras atualizações."),
    paragraph(""),
    heading("Sumário", HeadingLevel.HEADING_2),
    ...[
      "1. Acesso e segurança",
      "2. Matriz de permissões",
      "3. Administrador",
      "4. Gerência",
      "5. Vendedor",
      "6. Mensagens e solução de problemas",
      "7. Checklist de boas práticas",
    ].map((item) => paragraph(item, { run: { bold: true, color: GOLD } })),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function accessSection() {
  return [
    heading("1. Acesso e segurança"),
    heading("Entrar no painel", HeadingLevel.HEADING_2),
    paragraph("Acesse a área administrativa fornecida pela loja. Na tela Acesso da equipe, digite o Nome de acesso e a Senha, depois clique em Entrar."),
    wireframe("Acesso da equipe", [
      ["CHIQUE DETALHES", "", "Acesso exclusivo"],
      ["1  Nome de acesso", "Digite seu nome", ""],
      ["2  Senha", "••••••••", ""],
      ["", "3  [ Entrar ]", ""],
    ]),
    paragraph("Após entrar, confira seu nome e o perfil exibido abaixo da saudação. Se o perfil estiver incorreto, saia e avise o Administrador."),
    paragraph(""),
    screenshotPlaceholder("Tela Acesso da equipe"),
    paragraph(""),
    callout("Segurança", "Clique em Sair ao finalizar. Não compartilhe seu usuário e não deixe o painel aberto em dispositivos de uso comum.", "warning"),
    new Paragraph({ children: [new PageBreak()] }),
    heading("2. Matriz de permissões"),
    paragraph("Use esta matriz como referência rápida. O sistema valida o perfil em cada operação protegida."),
    addPermissionTable(),
    paragraph("* O serviço possui regras financeiras para Administração e Gerência, porém o menu atual apresenta o Fluxo de Caixa somente ao Administrador.", { run: { italic: true, color: MUTED, size: 18 } }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function supportSection() {
  const issues = [
    ["Mensagem", "O que significa", "Como agir"],
    ["Nome ou senha incorretos", "Credencial não reconhecida.", "Confira a digitação. Se persistir, procure o Administrador."],
    ["Seu perfil não tem permissão", "A ação pertence a outro perfil.", "Não tente contornar. Solicite ao responsável autorizado."],
    ["Estoque insuficiente", "A quantidade supera o saldo atual.", "Atualize a tela, confira a peça física e ajuste a quantidade."],
    ["Selecione uma imagem", "Nenhum arquivo foi escolhido.", "Escolha JPEG, PNG ou WebP com até 5 MB."],
    ["Falha ao carregar", "A API ou a conexão não respondeu.", "Verifique a internet, clique em Atualizar/Recarregar e tente novamente."],
  ];
  const widths = [2500, 2800, 4060];
  return [
    heading("6. Mensagens e solução de problemas"),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: widths,
      rows: issues.map((row, ri) => new TableRow({ tableHeader: ri === 0, children: row.map((value, ci) => cell(value, {
        width: widths[ci], fill: ri === 0 ? GOLD : ri % 2 ? CREAM : WHITE, color: ri === 0 ? WHITE : CHARCOAL, bold: ri === 0,
      })) })),
    }),
    paragraph(""),
    callout("Regra", "Quando houver dúvida sobre uma venda já confirmada, anote data, horário, usuário, valor e forma de pagamento antes de procurar a Administração."),
    new Paragraph({ children: [new PageBreak()] }),
    heading("7. Checklist de boas práticas"),
    ...[
      "Confirmar produto, quantidade e preço antes de registrar a venda.",
      "Usar o usuário individual de quem realizou a operação.",
      "Registrar a forma de pagamento correta.",
      "Utilizar observações para exceções e informações úteis.",
      "Não duplicar uma venda para tentar corrigir um erro.",
      "Manter estoque e imagens atualizados.",
      "Compartilhar senhas somente por canal privado.",
      "Sair do painel ao terminar o uso.",
      "Comunicar divergências à pessoa responsável pelo perfil adequado.",
    ].map((item) => new Paragraph({
      spacing: { after: 100, line: 300 },
      children: [run("☐  ", { bold: true, color: GOLD, size: 24 }), run(item)],
    })),
    paragraph(""),
    callout("Fim", "Manual preparado para receber capturas reais. Ao atualizar o sistema, revise também os wireframes, a matriz de permissões e a versão deste documento."),
  ];
}

function buildDocument() {
  const children = [...cover(), ...frontMatter(), ...accessSection()];
  let chapter = 3;
  for (const section of MANUAL_SECTIONS) {
    children.push(heading(`${chapter}. ${section.profile}`), profileBanner(section.profile, section.intro), paragraph(""));
    for (const proc of section.procedures) children.push(...addProcedure(proc));
    chapter += 1;
  }
  children.push(...supportSection());

  return new Document({
    creator: "Chique Detalhes",
    title: "Manual do Usuário — Painel Administrativo",
    description: "Manual esquemático dos perfis Administrador, Gerência e Vendedor.",
    styles: {
      default: { document: { run: { font: "Calibri", size: 22, color: CHARCOAL }, paragraph: { spacing: { after: 120, line: 300 } } } },
      paragraphStyles: [
        { id: "Title", name: "Title", basedOn: "Normal", next: "Normal", run: { font: "Calibri", size: 52, bold: true, color: CHARCOAL }, paragraph: { spacing: { before: 0, after: 60 } } },
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Calibri", size: 32, bold: true, color: GOLD }, paragraph: { spacing: { before: 360, after: 200 }, keepNext: true, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Calibri", size: 26, bold: true, color: GOLD }, paragraph: { spacing: { before: 280, after: 140 }, keepNext: true, outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Calibri", size: 24, bold: true, color: CHARCOAL }, paragraph: { spacing: { before: 200, after: 100 }, keepNext: true, outlineLevel: 2 } },
      ],
    },
    numbering: {
      config: [{
        reference: "manual-numbering",
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 540, hanging: 270 }, spacing: { after: 80, line: 300 } }, run: { bold: true, color: GOLD } },
        }],
      }],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440, header: 708, footer: 708 },
        },
      },
      headers: {
        default: new Header({ children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD_LIGHT, space: 4 } },
          spacing: { after: 0 },
          children: [run("CHIQUE DETALHES  |  MANUAL DO USUÁRIO", { bold: true, color: MUTED, size: 16, characterSpacing: 30 })],
        })] }),
      },
      footers: {
        default: new Footer({ children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 0 },
          children: [run("Versão 1.0  •  Página ", { color: MUTED, size: 16 }), new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", color: MUTED, size: 16 })],
        })] }),
      },
      children,
    }],
  });
}

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
const buffer = await Packer.toBuffer(buildDocument());
fs.writeFileSync(OUTPUT, buffer);
console.log(`${OUTPUT} | ${buffer.length} bytes | ${MANUAL_SECTIONS.reduce((sum, section) => sum + section.procedures.length, 0)} procedimentos`);
