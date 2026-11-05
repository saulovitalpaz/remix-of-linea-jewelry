import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Clock } from 'lucide-react';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import type { Product, CategoryModel } from '@/types/product';
import { ProductService } from '@/services/ProductService';
import { errorMessage } from '@/services/api';
import { MarketingModal } from '@/components/content/MarketingModal';
import ProductGrid from '@/components/category/ProductGrid';

function getCategoryIllustration(category: CategoryModel): string {
  if (category.emoji) return category.emoji;
  const s = (category.slug || '').toLowerCase();
  const n = (category.name || '').toLowerCase();
  if (s.includes('semijoia') || n.includes('semijoia') || s.includes('joia') || n.includes('brinco')) return '💎';
  if (s.includes('bolsa') || n.includes('bolsa') || s.includes('carteira')) return '👜';
  if (s.includes('make') || n.includes('make') || s.includes('beleza') || n.includes('batom')) return '💄';
  if (s.includes('infantil') || n.includes('infantil') || s.includes('kids') || n.includes('bebe')) return '🧸';
  if (s.includes('acessorio') || n.includes('acessório') || s.includes('relogio')) return '👑';
  return '✨';
}

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const retryCatalog = () => { setLoading(true); setError(''); setRetry(value => value + 1); };
  useEffect(() => {
    let live = true;
    Promise.all([ProductService.getProducts(), ProductService.getCategories()])
      .then(([items, groups]) => { if (live) { setProducts(items); setCategories(groups); } })
      .catch(e => { if (live) setError(errorMessage(e)); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [retry]);

  const featuredItems = products.filter(p => p.featured);
  const displayItems = featuredItems.length > 0 ? featuredItems : products;

  return <div className="min-h-screen"><MarketingModal /><Header /><main id="main-content">
    <section className="store-container py-10 text-center md:py-20">
      <img src="/logo-completo.png" alt="Chique Detalhes" width={1355} height={1160} fetchPriority="high" className="mx-auto mb-6 h-44 w-auto max-w-full object-contain md:h-60" />
      <p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-primary">Acessórios, beleza e delicadeza</p>
      <h1 className="mx-auto max-w-3xl text-3xl leading-tight sm:text-4xl md:text-6xl">Pequenos detalhes.<br /><span className="text-primary">Seu jeito de brilhar.</span></h1>
      <p className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground sm:text-base md:text-lg">Descubra nossa seleção de semijoias, bolsas, beleza e acessórios infantis.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3"><Link to="/category/all" className="button-primary">Explorar produtos<ArrowRight size={18} aria-hidden="true" /></Link><a href="#nossa-loja" className="button-secondary">Visite nossa loja</a></div>
    </section>

    {categories.length > 0 && <section id="colecoes" className="store-container py-8 md:py-14"><div className="mb-6"><p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">Encontre seu estilo</p><h2 className="text-2xl md:text-4xl">Nossas categorias</h2></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{categories.map(category => <Link key={category.id} to={'/category/' + category.slug} className="group flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-primary sm:p-4">
        {category.icon ? <img src={category.icon} alt="" width={48} height={48} loading="lazy" className="h-12 w-12 shrink-0 object-contain" /> : <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-2xl" aria-hidden="true">{getCategoryIllustration(category)}</span>}
        <span className="min-w-0 flex-1"><span className="block font-serif text-base font-semibold">{category.name}</span>{category.description && <span className="mt-1 line-clamp-2 text-xs text-muted-foreground">{category.description}</span>}</span><ArrowRight size={16} className="shrink-0 text-primary" aria-hidden="true" />
      </Link>)}</div>
    </section>}

    <section id="produtos" className="store-container py-8 md:py-14"><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">{featuredItems.length > 0 ? 'Curadoria especial' : 'Nossa seleção'}</p><h2 className="text-2xl md:text-4xl">{featuredItems.length > 0 ? 'Destaques da loja' : 'Novidades da loja'}</h2></div><Link to="/category/all" className="inline-flex min-h-10 items-center gap-1.5 text-xs font-semibold text-primary hover:underline sm:text-sm">Ver todo o catálogo<ArrowRight size={16} aria-hidden="true" /></Link></div>
      {error ? <div className="status-panel" role="alert"><p>{error}</p><button className="button-secondary mt-4" onClick={retryCatalog}>Tentar novamente</button></div> : loading ? <p className="status-panel" role="status">Carregando produtos…</p> : displayItems.length ? <ProductGrid products={displayItems.slice(0, 4)} /> : <div className="status-panel"><h3 className="text-xl">Novidades em breve</h3><p className="mt-3 text-sm text-muted-foreground">Nosso catálogo está sendo preparado. Conheça as peças no quiosque ou fale com nossa equipe.</p><a className="button-secondary mt-5" href="https://wa.me/5577988590306" target="_blank" rel="noopener noreferrer">Falar pelo WhatsApp</a></div>}
    </section>

    <section id="nossa-loja" className="store-container py-10 md:py-20"><div className="grid items-center gap-6 rounded-3xl border border-border bg-card p-4 sm:p-8 lg:grid-cols-2 lg:gap-12">
      <div><p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Vamos nos encontrar</p><h2 className="text-2xl sm:text-3xl md:text-4xl">O encanto de escolher de perto.</h2><p className="mt-3 text-sm text-muted-foreground sm:text-base">Visite nosso quiosque em Vitória da Conquista e encontre seus novos favoritos.</p>
        <div className="mt-6 space-y-4"><div className="flex gap-3"><MapPin className="mt-0.5 shrink-0 text-primary" size={18} aria-hidden="true" /><div className="text-xs sm:text-sm"><h3 className="mb-1 font-sans font-semibold">Nosso endereço</h3><p>Av. Juracy Magalhães, 3340 — Quiosque 115<br />Boa Vista, Vitória da Conquista — BA</p></div></div><div className="flex gap-3"><Clock className="mt-0.5 shrink-0 text-primary" size={18} aria-hidden="true" /><div className="text-xs sm:text-sm"><h3 className="mb-1 font-sans font-semibold">Horário de atendimento</h3><p>Segunda a sábado: 10h às 22h<br />Domingos: 14h às 20h</p></div></div></div>
        <a href="https://www.google.com/maps/dir/?api=1&destination=Av.+Juracy+Magalh%C3%A3es,+3340,+Vit%C3%B3ria+da+Conquista" target="_blank" rel="noopener noreferrer" className="button-primary mt-6 text-xs sm:text-sm">Como chegar<ArrowRight size={16} aria-hidden="true" /></a>
      </div><iframe title="Localização do quiosque Chique Detalhes" src="https://maps.google.com/maps?q=Av.%20Juracy%20Magalh%C3%A3es,%203340%20-%20Vit%C3%B3ria%20da%20Conquista&t=&z=15&ie=UTF8&iwloc=&output=embed" width="600" height="450" loading="lazy" referrerPolicy="no-referrer" className="aspect-[4/3] h-auto w-full rounded-2xl border-0 bg-muted" />
    </div></section>
  </main><Footer /></div>;
}
