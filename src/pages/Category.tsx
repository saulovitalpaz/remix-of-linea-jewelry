import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import ProductGrid from '@/components/category/ProductGrid';
import { ProductService } from '@/services/ProductService';
import { errorMessage } from '@/services/api';
import { filterCatalog } from '@/lib/catalog';
import type { Product, CategoryModel } from '@/types/product';

export default function Category() {
  const { category = 'all' } = useParams();
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => {
    let live = true;
    Promise.all([ProductService.getProducts(), ProductService.getCategories()])
      .then(([items, groups]) => { if (live) { setProducts(items); setCategories(groups); } })
      .catch(e => { if (live) setError(errorMessage(e)); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [retry]);
  const update = (key: string, value: string) => {
    setParams(previous => { const next = new URLSearchParams(previous); if (value) next.set(key, value); else next.delete(key); if (key !== 'page') next.delete('page'); return next; }, { replace: key === 'q' });
  };
  const query = params.get('q') || '';
  const sort = params.get('sort') || 'newest';
  const price = params.get('price') || '';
  const available = params.get('available') === '1';
  const filtered = filterCatalog(products, { category, query, available, price, sort });
  const pages = Math.max(1, Math.ceil(filtered.length / 24));
  const requestedPage = Number(params.get('page') || 1);
  const page = Number.isInteger(requestedPage) ? Math.max(1, Math.min(pages, requestedPage)) : 1;
  const title = category === 'all' ? 'Todos os produtos' : categories.find(c => c.slug === category)?.name || 'Coleção';
  return <div className="min-h-screen"><Header /><main id="main-content" className="store-container py-10 md:py-14">
    <nav aria-label="Navegação estrutural" className="mb-6 text-sm text-muted-foreground"><Link to="/">Início</Link><span aria-hidden="true"> / </span>{title}</nav>
    <h1 className="mb-3 text-3xl md:text-5xl">{title}</h1>
    <p className="mb-8 text-muted-foreground">Encontre o detalhe que combina com você.</p>
    <div className="mb-6 flex flex-wrap items-end gap-4 border-b border-border pb-6">
      <label className="min-w-0 flex-1 text-sm">Buscar no catálogo<input className="field mt-2" name="q" type="search" placeholder="Nome do produto…" value={query} onChange={e => update('q', e.target.value)} /></label>
      <label className="text-sm">Ordenar por<select className="field mt-2" value={sort} onChange={e => update('sort', e.target.value)}><option value="newest">Mais recentes</option><option value="price-low">Menor preço</option><option value="price-high">Maior preço</option><option value="name">Nome A–Z</option></select></label>
      <button className="button-secondary" aria-expanded={filtersOpen} aria-controls="catalog-filters" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={18} aria-hidden="true" />Filtros</button>
    </div>
    {filtersOpen && <div id="catalog-filters" className="mb-6 flex flex-wrap items-center gap-5 rounded-2xl border border-border bg-card p-5 animate-fade-in">
      <label className="text-sm">Faixa de preço<select className="field mt-2" value={price} onChange={e => update('price', e.target.value)}><option value="">Todos os preços</option><option value="under50">Até R$ 50</option><option value="50to150">De R$ 50 a R$ 150</option><option value="over150">Acima de R$ 150</option></select></label>
      <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={available} onChange={e => update('available', e.target.checked ? '1' : '')} />Somente disponíveis</label>
      <button className="button-secondary" onClick={() => setParams({})}>Limpar filtros</button>
    </div>}
    <p className="mb-5 text-sm text-muted-foreground" role="status">{loading ? 'Carregando catálogo…' : error ? '' : filtered.length + (filtered.length === 1 ? ' produto' : ' produtos')}</p>
    {error ? <div className="status-panel" role="alert"><p>{error}</p><button className="button-secondary mt-4" onClick={() => { setLoading(true); setError(''); setRetry(retry + 1); }}>Tentar novamente</button></div>
      : loading ? <div className="grid grid-cols-2 gap-6 lg:grid-cols-4" aria-hidden="true">{[1,2,3,4].map(i => <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />)}</div>
      : filtered.length ? <ProductGrid products={filtered.slice((page - 1) * 24, page * 24)} />
      : <div className="status-panel"><h2 className="text-xl">Nenhum produto encontrado</h2><p className="mt-2 text-muted-foreground">Experimente outra busca ou consulte o catálogo completo.</p><Link className="button-secondary mt-5" to="/category/all">Ver catálogo</Link></div>}
    {!loading && !error && pages > 1 && <nav aria-label="Paginação" className="mt-10 flex items-center justify-center gap-4"><button className="button-secondary" disabled={page === 1} onClick={() => update('page', String(page - 1))}>Anterior</button><span aria-live="polite">{page} de {pages}</span><button className="button-secondary" disabled={page === pages} onClick={() => update('page', String(page + 1))}>Próxima</button></nav>}
  </main><Footer /></div>;
}
