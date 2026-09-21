import { Link } from 'react-router-dom';
import { ImageOff, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '@/types/product';
import { formatCurrency } from '@/lib/format';

export default function ProductCard({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);
  return <Link to={`/product/${product.id}`} className="product-card group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card">
    <div className="relative aspect-[4/5] overflow-hidden bg-muted">
      {product.imageUrl && !failed ? <img src={product.imageUrl} alt={product.name} width={480} height={600} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground"><ImageOff aria-hidden="true" /><span className="text-sm">Foto em breve</span></div>}
      {product.stock === 0 && <span className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-xs text-foreground">Esgotado</span>}
    </div>
    <div className="flex flex-1 flex-col gap-2 p-3 sm:p-5">
      <p className="line-clamp-1 text-xs text-muted-foreground">{typeof product.category === 'object' ? product.category.name : product.category}</p>
      <h3 className="line-clamp-2 min-h-[2.75rem] font-sans text-sm font-semibold leading-snug text-foreground sm:text-base">{product.name}</h3>
      <div className="mt-auto flex items-center justify-between gap-2 pt-2"><p className="font-semibold tabular-nums">{formatCurrency(product.price)}</p><ArrowUpRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /></div>
    </div>
  </Link>;
}
