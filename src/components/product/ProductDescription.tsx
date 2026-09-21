import type { Product } from '@/types/product';
export default function ProductDescription({ product }: { product: Product }) {
  return <div className="mt-8 divide-y divide-border border-y border-border">
    <details open className="product-details"><summary>Descrição do produto</summary><p className="whitespace-pre-line pb-6 text-sm leading-relaxed text-muted-foreground">{product.description || 'Consulte nossa equipe para saber mais sobre esta peça.'}</p></details>
    <details className="product-details"><summary>Disponibilidade</summary><p className="pb-6 text-sm text-muted-foreground">{product.stock > 0 ? product.stock + ' unidade(s) em estoque. Confirme a disponibilidade no atendimento.' : 'Produto esgotado no momento.'}</p></details>
    <details className="product-details"><summary>Atendimento e retirada</summary><p className="pb-6 text-sm text-muted-foreground">Converse com nossa equipe pelo WhatsApp para combinar pagamento, retirada no quiosque ou entrega.</p></details>
  </div>;
}
