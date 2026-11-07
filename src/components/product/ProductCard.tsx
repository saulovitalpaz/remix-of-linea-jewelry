import { Link } from 'react-router-dom';
import { ImageOff, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '@/types/product';
import { formatCurrency } from '@/lib/format';
import { useCart } from '@/context/cart-context';

export default function ProductCard({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState('');
  const { add } = useCart();
  return <article className="product-card group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card"><Link to={`/product/${product.id}`} className="flex flex-1 flex-col">
    <div className="relative aspect-[4/5] overflow-hidden bg-muted">
      {product.imageUrl && !failed ? <img src={product.imageUrl} alt={product.name} width={480} height={600} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground"><ImageOff aria-hidden="true" /><span className="text-sm">Foto em breve</span></div>}
      {product.stock === 0 && <span className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-xs text-foreground">Esgotado</span>}
    </div>
    <div className="flex flex-1 flex-col gap-2 p-3 sm:p-5">
      <p className="line-clamp-1 text-xs text-muted-foreground">{typeof product.category === 'object' ? product.category.name : product.category}</p>
      <h3 className="line-clamp-2 min-h-[2.75rem] font-sans text-sm font-semibold leading-snug text-foreground sm:text-base">{product.name}</h3>
      <div className="mt-auto flex items-center justify-between gap-2 pt-2"><p className="font-semibold tabular-nums">{formatCurrency(product.price)}</p><ArrowUpRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /></div>
    </div>
  </Link><div className="px-3 pb-3 sm:px-5 sm:pb-5"><button type="button" className="button-secondary w-full text-sm" disabled={product.stock < 1} aria-label={`Adicionar ${product.name} à sacola`} onClick={() => { if (!add(product, 1)) setError('Limite de 50 produtos.'); else setError(''); }}>{product.stock > 0 ? 'Adicionar à sacola' : 'Esgotado'}</button>{error && <p className="mt-2 text-xs text-destructive" role="alert">{error}</p>}</div></article>;
}
