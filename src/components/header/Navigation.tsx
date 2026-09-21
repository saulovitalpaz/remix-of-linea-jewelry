import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Search, X, ArrowRight } from 'lucide-react';
import { ProductService } from '@/services/ProductService';
import type { CategoryModel } from '@/types/product';

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const searchInput = useRef<HTMLInputElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => { let live = true; ProductService.getCategories().then(data => { if (live) setCategories(data); }).catch(() => {}); return () => { live = false; }; }, []);
  useEffect(() => { if (searchOpen) searchInput.current?.focus(); }, [searchOpen]);
  return <nav aria-label="Navegação principal" className="mx-auto max-w-screen-xl rounded-2xl border border-border bg-background/95 shadow-sm backdrop-blur-md" onKeyDown={e => { if (e.key === 'Escape') { if (searchOpen) searchButton.current?.focus(); else menuButton.current?.focus(); setSearchOpen(false); setMenuOpen(false); } }}>
    <div className="flex h-20 items-center justify-between gap-4 px-4 md:px-6">
      <Link to="/" className="shrink-0"><img src="/Logo 1.png" alt="Chique Detalhes — início" width={64} height={56} className="h-14 w-16 object-contain" /></Link>
      <div className="hidden min-w-0 items-center gap-5 xl:flex"><Link className="nav-link" to="/category/all">Todos os produtos</Link>{categories.map(category => <Link className="nav-link" key={category.id} to={'/category/' + category.slug}>{category.name}</Link>)}</div>
      <div className="flex items-center gap-1"><button ref={searchButton} className="icon-button" aria-label="Buscar produtos" aria-expanded={searchOpen} aria-controls="site-search" onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }}><Search size={21} aria-hidden="true" /></button><button ref={menuButton} className="icon-button xl:hidden" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="site-menu" onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }}>{menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button></div>
    </div>
    {searchOpen && <form id="site-search" role="search" className="flex gap-3 border-t border-border p-4 animate-fade-in" onSubmit={e => { e.preventDefault(); if (query.trim()) navigate('/category/all?q=' + encodeURIComponent(query.trim())); }}><label className="min-w-0 flex-1"><span className="sr-only">Buscar produtos</span><input ref={searchInput} className="field" type="search" name="q" value={query} onChange={e => setQuery(e.target.value)} placeholder="O que você procura?" /></label><button className="button-primary" aria-label="Pesquisar"><ArrowRight size={20} aria-hidden="true" /></button></form>}
    {menuOpen && <div id="site-menu" className="max-h-[65dvh] overflow-y-auto overscroll-contain border-t border-border p-4 animate-fade-in xl:hidden"><Link className="mobile-nav-link" to="/category/all">Todos os produtos</Link>{categories.map(category => <Link className="mobile-nav-link" key={category.id} to={'/category/' + category.slug}>{category.name}</Link>)}<Link className="mobile-nav-link" to="/#nossa-loja">Visite nossa loja</Link></div>}
  </nav>;
}
