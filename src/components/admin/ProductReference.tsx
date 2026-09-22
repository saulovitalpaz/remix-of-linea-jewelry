import { ChevronDown, ExternalLink, ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useId } from 'react';
import type { Product } from '@/types/product';

export default function ProductReference({ product, expanded, onToggle }: {
  product: Product; expanded: boolean; onToggle: () => void;
}) {
  const panelId = useId();
  return <div className="min-w-0">
    <button type="button" className="flex w-full items-center gap-2 rounded-lg text-left font-medium hover:text-primary"
      aria-expanded={expanded} aria-controls={panelId} onClick={onToggle}>
      <span className="min-w-0 break-words">{product.name}</span>
      <ChevronDown size={16} aria-hidden="true" className={`shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
    </button>
    <p className="text-xs text-muted-foreground">{typeof product.category === 'object' ? product.category.name : product.category}</p>
    {product.onOffer && <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">Oferta para a equipe</span>}
    <div id={panelId} hidden={!expanded} className="mt-3 rounded-xl border border-border bg-muted/30 p-3">
      {expanded && (product.imageUrl
        ? <img src={product.imageUrl} alt={`Referência de ${product.name}`} width={320} height={320} loading="lazy" className="max-h-64 w-full rounded-lg bg-card object-contain" />
        : <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground"><ImageIcon size={20} aria-hidden="true" />Produto sem foto cadastrada.</p>)}
      <Link to={'/product/' + encodeURIComponent(product.id)} target="_blank" rel="noopener noreferrer"
        className="mt-2 inline-flex min-h-11 items-center gap-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">
        Ver na loja pública <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (abre em nova aba)</span>
      </Link>
    </div>
  </div>;
}
