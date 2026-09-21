# Auditoria local — 20/09/2026

Implementação local baseada no plano de correção, com critérios de web-design-guidelines e ui-ux-pro-max: identidade creme/dourado, tokens HSL coerentes, cards compartilhados 4:5, foco visível, alvos de toque, menu expansível, estados de erro e vazio e movimento reduzido. O link de pular conteúdo alcança as páginas ativas, incluindo suporte, políticas e estados de carregamento.

## Alterações verificadas no código

- Catálogo público usa produtos e categorias da API, sem preencher falhas com estoque fictício. Busca ignora acentos; filtros, ordenação e paginação são refletidos na URL. Imagens ausentes exibem fallback explícito. Detalhes não inventam avaliações, SKU ou fotos.
- Cliente HTTP centraliza URL, autenticação e erros. O frontend usa sessionStorage e valida a sessão; administração respeita os perfis exibidos pelo servidor.
- API verifica o usuário e o perfil no banco a cada operação protegida. JWT aceita HS256 com emissor e audiência específicos e validade de oito horas. Login tem limite por IP/processo. As respostas de usuários omitem passwordHash.
- Produtos validam nome, categoria, preço e estoque. Vendas consultam preço no banco, decrementam estoque somente quando suficiente e persistem totais em transação. ADMIN, MANAGER e SELLER podem registrar vendas; não há histórico, edição ou estorno de vendas nesta versão.
- Popup usa transação e lock consultivo PostgreSQL para serializar ativação. ADMIN consegue recuperar a última campanha inativa. Upload limita tamanho e formatos, verifica assinatura inicial do arquivo e grava no bucket S3-compatible Railway com chave aleatória e cache imutável.
- SQL aditivo preparado para nome/login/perfil. A troca de identificação para Bárbara Paz não altera a coluna passwordHash. Não há criação automática de senha padrão.

## Evidência executada

| Verificação | Resultado |
| --- | --- |
| `npm run build` na raiz | Sucesso; inclui TypeScript estrito do app e configuração Vite |
| Bundle Vite 6.4.3 | JS 386,18 kB / gzip 119,26 kB; CSS 74,89 kB / gzip 13,33 kB |
| `npm run lint` | Zero erros; sete avisos de Fast Refresh em exports utilitários de componentes UI |
| `npm run build` em backend | Sucesso, TypeScript estrito |
| `npm test` em backend | Quatro testes aprovados, zero falhas ou skips |
| `npx prisma validate` | Schema válido |
| `npx prisma generate` | Cliente Prisma 6.19.2 gerado com sucesso |
| `npm audit --audit-level=low` na raiz e backend | Zero vulnerabilidades reportadas em ambos |

Testes HTTP cobrem acesso negado, perfis, autenticação, validação e atualização de estoque usando stub local de banco. Testes do catálogo exercitam o helper utilizado pela página: busca com acentos, disponibilidade, preço e preservação da lista original. Não equivalem a teste de concorrência ou rollback em PostgreSQL real.

Os overrides de deepmerge-ts/effect em @prisma/config e a atualização de tsx removem os alertas de dependências conhecidos no momento desta execução. Geração, validação Prisma e build passaram com os overrides. A auditoria de dependências não comprova ausência de falhas de aplicação.

## Revisão e limites

Revisão local dos caminhos críticos de autenticação, RBAC, registro de vendas e configuração confirmou autorização no servidor e ausência de confiança no preço enviado pelo cliente. O limitador de login em memória requer armazenamento compartilhado se houver múltiplas réplicas. Há sete avisos de desenvolvimento relacionados ao Fast Refresh; não foram ocultados para produzir um lint artificialmente limpo.

O navegador integrado não apresentou instância disponível; nenhuma inspeção visual, navegação por teclado real ou captura de tela foi executada. Também não foram exercitados PostgreSQL real, uploads S3 reais ou fluxos autenticados em produção. Testes de integração devem usar ambiente isolado antes da futura publicação. Os diretórios Next.js e módulos legados não roteados foram preservados, sem compor o runtime ativo.

O código local ainda não está publicado. Migração, criação de usuários e qualquer escrita no banco remoto permanecem não executadas. As credenciais Cloudinary expostas anteriormente precisam ser revogadas no provedor; a remoção dos arquivos atuais não revoga o segredo nem o apaga do histórico Git. As credenciais do bucket não foram coletadas nem adicionadas aos arquivos. A senha existente de Bárbara permanece preservada pelo SQL preparado.

Consulte [README](../README.md), [plano](superpowers/plans/2026-09-20-store-repair.md), [estado Railway](railway-status.md) e [separação de uploads](railway-upload.md). O uso das skills orientou os ajustes de consistência e acessibilidade; não substitui validação visual pendente.
