import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, X, ArrowRight, Menu } from 'lucide-react';
import { ProductService } from '@/services/ProductService';
import type { CategoryModel } from '@/types/product';

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const searchInput = useRef<HTMLInputElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  useEffect(() => { let live = true; ProductService.getCategories().then(data => { if (live) setCategories(data); }).catch(() => {}); return () => { live = false; }; }, []);
  useEffect(() => { if (searchOpen) searchInput.current?.focus(); }, [searchOpen]);
  useEffect(() => { const media = window.matchMedia('(max-width: 767px)'); const update = () => { setMobile(media.matches); setMenuOpen(false); }; media.addEventListener('change', update); return () => media.removeEventListener('change', update); }, []);
  const links = <><Link to="/" onClick={() => setMenuOpen(false)}>Início</Link><Link to="/category/all" onClick={() => setMenuOpen(false)}>Todos os produtos</Link>{categories.map(category => <Link key={category.id} to={'/category/' + category.slug} onClick={() => setMenuOpen(false)}>{category.name}</Link>)}<Link to="/#nossa-loja" onClick={() => setMenuOpen(false)}>Visite nossa loja</Link></>;
  return <nav aria-label="Navegação principal" className={`mx-auto max-w-screen-lg rounded-2xl border transition-colors duration-300 ${menuOpen || searchOpen ? "border-border bg-background/95 shadow-sm backdrop-blur-md" : "border-transparent bg-background/45 backdrop-blur-sm"}`} onKeyDown={e => { if (e.key === 'Escape') { if (searchOpen) { setSearchOpen(false); searchButton.current?.focus(); } else if (menuOpen && !mobile) { setMenuOpen(false); menuButton.current?.focus(); } } }}>
    <div className="flex min-h-16 items-center gap-3 px-4 md:px-6">
      <button ref={menuButton} type="button" className="flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-1 focus-visible:ring-2 focus-visible:ring-primary" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="site-menu" onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }}><img src="/Logo 1.png" alt="" width={64} height={56} className="h-14 w-16 object-contain" /><Menu size={19} aria-hidden="true" /></button>
      {!mobile && menuOpen && <div id="site-menu" className="desktop-site-menu flex min-w-0 flex-1 items-center gap-x-5 overflow-x-auto whitespace-nowrap text-sm text-foreground/75">{links}</div>}
      <div className="ml-auto flex items-center"><button ref={searchButton} className="icon-button" aria-label="Buscar produtos" aria-expanded={searchOpen} aria-controls="site-search" onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }}><Search size={21} aria-hidden="true" /></button></div>
    </div>
    {searchOpen && <form id="site-search" role="search" className="flex gap-3 border-t border-border p-4 animate-fade-in" onSubmit={e => { e.preventDefault(); if (query.trim()) navigate('/category/all?q=' + encodeURIComponent(query.trim())); }}><label className="min-w-0 flex-1"><span className="sr-only">Buscar produtos</span><input ref={searchInput} className="field" type="search" name="q" value={query} onChange={e => setQuery(e.target.value)} placeholder="O que você procura?" /></label><button className="button-primary" aria-label="Pesquisar"><ArrowRight size={20} aria-hidden="true" /></button></form>}
    <Dialog.Root open={mobile && menuOpen} onOpenChange={setMenuOpen}><Dialog.Portal><Dialog.Overlay className="site-menu-overlay fixed inset-0 z-50 bg-black/15 backdrop-blur-[5px]" /><Dialog.Content id="site-menu" onCloseAutoFocus={e => { e.preventDefault(); menuButton.current?.focus(); }} className="site-menu-drawer fixed bottom-3 left-3 top-3 z-50 flex w-[min(76vw,18rem)] flex-col overflow-y-auto overscroll-contain rounded-3xl border border-white/70 bg-background/95 p-5 shadow-2xl backdrop-blur-xl"><div className="mb-4 flex items-center justify-between"><Dialog.Title className="font-serif text-xl">Navegação</Dialog.Title><Dialog.Close className="icon-button" aria-label="Fechar menu"><X size={20} aria-hidden="true" /></Dialog.Close></div><Dialog.Description className="sr-only">Acesse as páginas da loja.</Dialog.Description><div className="site-menu-links flex flex-col">{links}</div></Dialog.Content></Dialog.Portal></Dialog.Root>
  </nav>;
}
