import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, Package, Settings as SettingsIcon, Receipt, LogOut, Plus, Pencil, Trash2, Layers, Star, ImageIcon, X, Check, CircleDollarSign, Download } from 'lucide-react';
import Settings from '@/components/admin/Settings';
import AdminDashboard from '@/components/admin/AdminDashboard';
import CategoryManager from '@/components/admin/CategoryManager';
import CashFlowManager from '@/components/admin/CashFlowManager';
import ProductReference from '@/components/admin/ProductReference';
import SellerGoalCard from '@/components/admin/SellerGoalCard';
import { filterTeamProducts, salesDay } from '@/lib/sales-portal';
import type { Product, CategoryModel } from '@/types/product';
import type { AdminUser } from '@/types/admin';
import { ROLE_LABELS } from '@/types/admin';
import { ProductService } from '@/services/ProductService';
import { api, errorMessage, session } from '@/services/api';
import { formatCurrency } from '@/lib/format';
import '@/admin.css';

interface Draft {
  id?: string;
  name: string;
  price: string;
  stock: string;
  categoryId: string;
  description: string;
  imageUrl?: string;
  featured?: boolean;
  onOffer?: boolean;
}

interface CustomSaleItem {
  id: string;
  description: string;
  price: string;
  quantity: number;
}

interface SalesHistoryData {
  todaySummary: {
    totalRevenue: number;
    salesCount: number;
    itemsSold: number;
  };
  userRecentSales: Array<{
    id: string;
    date: string;
    createdAt: string;
    totalRevenue: number;
    itemsSold: number;
    notes?: string;
    paymentMethod?: string;
    description?: string;
  }>;
}

const emptyDraft: Draft = { name: '', price: '', stock: '0', categoryId: '', description: '', imageUrl: '', featured: false };

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Admin() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(() => !!session.get());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || '';
  const setTab = (value: string) => setSearchParams(value ? { tab: value } : {});
  const stockFilter = ['out', 'available'].includes(searchParams.get('stock') || '') ? searchParams.get('stock')! : 'all';
  const selectionFilter = searchParams.get('selection') || 'all';
  const query = searchParams.get('q') || '';
  const referenceId = searchParams.get('product');
  const updateFilters = (values: Record<string, string>) => setSearchParams(previous => {
    const next = new URLSearchParams(previous);
    for (const [key, value] of Object.entries(values)) { if (value && value !== 'all') next.set(key, value); else next.delete(key); }
    return next;
  }, { replace: true });
  const displayedProducts = filterTeamProducts(products, { query, stock: stockFilter, selection: selectionFilter });
  const productSection = searchParams.get('section') === 'categories' ? 'categories' : 'products';
  const setProductSection = (section: 'products' | 'categories') => setSearchParams({ tab: 'products', section });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>();
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [sales, setSales] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [saleDate, setSaleDate] = useState(() => salesDay());
  const [salePaymentMethod, setSalePaymentMethod] = useState('PIX');
  const [customItems, setCustomItems] = useState<CustomSaleItem[]>([]);
  const [newCustomDesc, setNewCustomDesc] = useState('');
  const [newCustomPrice, setNewCustomPrice] = useState('');
  const [newCustomQty, setNewCustomQty] = useState(1);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [salesHistory, setSalesHistory] = useState<SalesHistoryData | null>(null);
  const [salesRevision, setSalesRevision] = useState(0);
  const [showRecentSales, setShowRecentSales] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useEffect(() => {
    return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); };
  }, [imagePreview]);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    if (standalone) return;
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstallPrompt(null);
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function installWebApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstallPrompt(null);
  }

  const logout = () => {
    session.clear();
    setUser(null);
    setPassword('');
    setProducts([]);
    setDraft(null);
    setSales({});
    setNotes('');
    setSaleDate(salesDay());
    setSalePaymentMethod('PIX');
    setCustomItems([]);
    setSalesHistory(null);
    setTab('');
  };



  useEffect(() => {
    let live = true;
    const expired = () => { setUser(null); setError('Sessão expirada. Entre novamente.'); };
    window.addEventListener('session-expired', expired);
    if (session.get()) api<AdminUser>('/auth/me', {}, true).then(data => { if (live) setUser(data); }).catch(e => { if (live) setError(errorMessage(e)); }).finally(() => { if (live) setChecking(false); });
    return () => { live = false; window.removeEventListener('session-expired', expired); };
  }, []);

  async function loadSalesHistory() {
    try {
      const res = await api<SalesHistoryData>('/sales/history', {}, true);
      setSalesHistory(res);
    } catch (error) {
      setSalesHistory(null);
      setError(errorMessage(error));
    }
  }

  async function refresh() {
    setLoading(true);
    try {
      const [items, groups] = await Promise.all([ProductService.getTeamProducts(), ProductService.getCategories(), loadSalesHistory()]);
      setProducts(items);
      setCategories(groups);
      setSalesRevision(value => value + 1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let live = true;
    if (user) {
      Promise.all([ProductService.getTeamProducts(), ProductService.getCategories(), api<SalesHistoryData>('/sales/history', {}, true).catch(e => { if (live) setError(errorMessage(e)); return null; })])
        .then(([items, groups, history]) => { if (live) { setProducts(items); setCategories(groups); setSalesHistory(history); } })
        .catch(e => { if (live) setError(errorMessage(e)); })
        .finally(() => { if (live) setLoading(false); });
    }
    return () => { live = false; };
  }, [user]);

  useEffect(() => {
    let live = true;
    if (user && tab === 'sales') {
      api<SalesHistoryData>('/sales/history', {}, true).then(data => { if (live) setSalesHistory(data); }).catch(e => { if (live) { setSalesHistory(null); setError(errorMessage(e)); } });
    }
    return () => { live = false; };
  }, [user, tab]);


  useEffect(() => {
    if (!draft) return;
    const prevent = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', prevent);
    return () => window.removeEventListener('beforeunload', prevent);
  }, [draft]);

  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setError(''); setMessage('');
    try { await action(); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }

  function login(e: FormEvent) {
    e.preventDefault();
    run(async () => {
      const data = await api<{ token: string; user: AdminUser }>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
      session.set(data.token);
      setUser(data.user);
      setTab(data.user.role === 'ADMIN' ? 'dashboard' : 'sales');
      setPassword('');
    });
  }

  const saveProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    run(async () => {
      const body = new FormData();
      for (const key of ['name', 'price', 'stock', 'categoryId', 'description'] as const) body.append(key, draft[key]);
      body.append('featured', String(Boolean(draft.featured)));
      if (user?.role === 'ADMIN') body.append('onOffer', String(Boolean(draft.onOffer)));
      if (draft.imageUrl) body.append('imageUrl', draft.imageUrl);
      if (image) { if (image.size > 5 * 1024 * 1024) throw new Error('A imagem deve ter no máximo 5 MB.'); body.append('image', image); }
      await ProductService.saveProduct(body, draft.id);
      setDraft(null); setImage(null); await refresh(); setMessage('Produto salvo com sucesso.');
    });
  };

  const toggleFeaturedProduct = (product: Product) => {
    run(async () => {
      const updated = await ProductService.toggleFeatured(product.id);
      setProducts(prev => prev.map(p => p.id === updated.id ? { ...p, featured: updated.featured } : p));
      setMessage(updated.featured ? `"${product.name}" adicionado aos destaques da homepage!` : `"${product.name}" removido dos destaques.`);
    });
  };

  if (checking) return <main id="main-content" className="store-container py-20" role="status">Verificando sessão…</main>;

  if (!user) return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-muted/30 p-4 sm:p-6">
      <section className="admin-panel w-full max-w-md">
        <div className="mb-6 text-center">
          <img src="/Logo 1.png" alt="Chique Detalhes" width={220} height={120} className="mx-auto h-24 w-auto object-contain sm:h-28" />
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Chique Detalhes</p>
        </div>
        <h1 className="text-center text-2xl">Acesso da equipe</h1>
        <p className="mb-8 mt-2 text-center text-sm text-muted-foreground">Entre com seu nome de acesso e senha.</p>
        <form onSubmit={login} className="space-y-5">
          <label className="block text-sm font-medium">Nome de acesso
            <input className="field mt-2" name="username" autoComplete="username" required maxLength={100} value={username} onChange={e => setUsername(e.target.value)} placeholder="Digite seu nome de acesso" />
          </label>
          <label className="block text-sm font-medium">Senha
            <input className="field mt-2" name="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          {error && <p className="notice-error" role="alert">{error}</p>}
          <button className="button-primary w-full" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-foreground">Acesso exclusivo para a equipe Chique Detalhes.</p>
      </section>
    </main>
  );

  const navItems = user.role === 'ADMIN' ? [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'cashflow', label: 'Caixa', icon: CircleDollarSign },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'settings', label: 'Ajustes', icon: SettingsIcon },
  ] : [
    { id: 'sales', label: 'Vendas', icon: Receipt },
    { id: 'products', label: 'Produtos', icon: Package },
  ];

  const activeTab = tab || (user.role === 'ADMIN' ? 'dashboard' : 'sales');
  const activeNav = user.role === 'ADMIN' && activeTab === 'sales' ? 'cashflow' : activeTab;

  // Available image URLs from existing products in same category (or all)
  const categoryGalleryImages = Array.from(
    new Set(
      products
        .filter(p => p.imageUrl && (!draft?.categoryId || p.categoryId === draft.categoryId || (typeof p.category === 'object' && p.category.id === draft.categoryId)))
        .map(p => p.imageUrl as string)
    )
  );

  const previewImageSrc = image ? imagePreview : draft?.imageUrl || null;

  return (
    <div className="admin-shell min-h-screen bg-muted/30">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="store-container flex min-h-16 items-center justify-between gap-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/" className="shrink-0"><img src="/Logo 1.png" alt="Chique Detalhes — início" width={64} height={56} className="h-14 w-16 object-contain" /></Link>
            <p className="truncate text-sm font-semibold">{user.name}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {installPrompt && (
              <button className="button-secondary px-3 sm:px-4" onClick={installWebApp}>
                <Download size={18} aria-hidden="true" />
                <span className="hidden sm:inline">Instalar app</span>
                <span className="sr-only sm:hidden">Instalar webapp</span>
              </button>
            )}
            <button aria-label="Sair da conta" className="button-secondary px-3 sm:px-4" onClick={logout}>
              <LogOut size={18} aria-hidden="true" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" className="store-container py-6 sm:py-10">
        {activeTab === 'dashboard' && user.role === 'ADMIN' && <div className="mb-6 flex flex-wrap items-start justify-between gap-4 sm:mb-8">
          <div>
            <p className="mb-2 text-sm text-muted-foreground">{ROLE_LABELS[user.role]}</p>
            <h1 className="text-2xl sm:text-3xl">{new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite'}, {user.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Visão geral do catálogo, estoque e vendas da loja.
            </p>
          </div>
        </div>}

        <nav aria-label="Seções do painel" className="admin-bottom-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              aria-current={activeNav === item.id ? 'page' : undefined}
              className={'admin-nav-item' + (activeNav === item.id ? ' is-active' : '')}
              onClick={() => {
                if (draft && !window.confirm('Descartar as alterações do produto?')) return;
                setDraft(null);
                setTab(item.id);
                setError('');
                setMessage('');
                window.scrollTo({ top: 0 });
              }}
            >
              <item.icon size={18} className="shrink-0" aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </nav>

        {user.role === 'ADMIN' && activeNav === 'cashflow' && (
          <nav aria-label="Fluxo de caixa" className="mb-6 flex flex-wrap gap-2">
            <button className={activeTab === 'cashflow' ? 'button-primary' : 'button-secondary'} aria-current={activeTab === 'cashflow' ? 'page' : undefined} onClick={() => setTab('cashflow')}><CircleDollarSign size={18} aria-hidden="true" />Fluxo de caixa</button>
            <button className={activeTab === 'sales' ? 'button-primary' : 'button-secondary'} aria-current={activeTab === 'sales' ? 'page' : undefined} onClick={() => setTab('sales')}><Receipt size={18} aria-hidden="true" />Registrar venda</button>
          </nav>
        )}

        {error && <p className="notice-error mb-6" role="alert">{error}</p>}
        {message && <p className="notice-success mb-6" role="status">{message}</p>}

        {activeTab === 'products' && user.role === 'ADMIN' && (
          <nav aria-label="Produtos e estoque" className="mb-6 flex flex-wrap gap-2">
            {(['products', 'categories'] as const).map(section => (
              <button key={section} className={productSection === section ? 'button-primary' : 'button-secondary'}
                aria-current={productSection === section ? 'page' : undefined}
                onClick={() => {
                  if (draft && !window.confirm('Descartar as alterações do produto?')) return;
                  setDraft(null); setProductSection(section);
                }}>
                {section === 'products' ? <Package size={18} aria-hidden="true" /> : <Layers size={18} aria-hidden="true" />}
                {section === 'products' ? 'Produtos' : 'Categorias'}
              </button>
            ))}
          </nav>
        )}

        {activeTab === 'dashboard' && user.role === 'ADMIN' ? (
          <AdminDashboard
            products={products}
            onAddProduct={() => { setDraft({ ...emptyDraft, categoryId: categories[0]?.id || '' }); setImage(null); setTab('products'); }}
          />
        ) : activeTab === 'cashflow' && user.role === 'ADMIN' ? (
          <CashFlowManager user={user} />
        ) : activeTab === 'products' && productSection === 'categories' && user.role === 'ADMIN' ? (
          <CategoryManager categories={categories} onRefresh={refresh} />
        ) : activeTab === 'settings' && user.role === 'ADMIN' ? (
          <Settings currentUserId={user.id} />
        ) : (

          <>
            {/* Stat cards rendered ONLY for products tab */}
            {activeTab === 'products' && user.role !== 'SELLER' && (
              <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="admin-stat"><span>Produtos cadastrados</span><strong>{products.length}</strong></div>
                <div className="admin-stat"><span>Unidades em estoque</span><strong>{products.reduce((sum, p) => sum + p.stock, 0)}</strong></div>
                <div className="admin-stat"><span>Destaques Homepage</span><strong className="text-amber-600 dark:text-amber-400">{products.filter(p => p.featured).length}</strong></div>
                <div className="admin-stat"><span>Produtos esgotados</span><strong className="text-destructive">{products.filter(p => p.stock === 0).length}</strong></div>
              </div>
            )}

            {activeTab === 'products' && user.role === 'SELLER' && <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { label: 'Produtos esgotados', count: products.filter(p => p.stock === 0).length, to: '?tab=products&stock=out', active: stockFilter === 'out' },
                { label: 'Destaques da homepage', count: products.filter(p => p.featured).length, to: '?tab=products&selection=featured', active: selectionFilter === 'featured' },
                { label: 'Produtos em oferta', count: products.filter(p => p.onOffer).length, to: '?tab=products&selection=offer', active: selectionFilter === 'offer' },
              ].map(metric => <Link key={metric.label} to={metric.to} className={`admin-stat hover:bg-accent/40 ${metric.active ? 'border-primary bg-accent/30' : ''}`} aria-current={metric.active ? 'true' : undefined}>
                <span>{metric.label}</span><strong>{metric.count}</strong><span>Ver produtos →</span>
              </Link>)}
            </div>}

            {activeTab === 'sales' && <SellerGoalCard key={user.id} refreshKey={salesRevision} />}

            {/* Stat cards rendered for sales tab */}
            {activeTab === 'sales' && salesHistory && (
              <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="admin-stat">
                  <span>Minhas vendas hoje</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(salesHistory.todaySummary.totalRevenue)}
                  </strong>
                </div>
                <div className="admin-stat">
                  <span>Meus registros hoje</span>
                  <strong>{salesHistory.todaySummary.salesCount} {salesHistory.todaySummary.salesCount === 1 ? 'venda' : 'vendas'}</strong>
                </div>
                <div className="admin-stat">
                  <span>Minhas peças vendidas hoje</span>
                  <strong>{salesHistory.todaySummary.itemsSold} {salesHistory.todaySummary.itemsSold === 1 ? 'peça' : 'peças'}</strong>
                </div>
              </div>
            )}

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl">{activeTab === 'products' ? 'Catálogo de Produtos' : 'Registrar Vendas'}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeTab === 'sales' ? `${products.filter(p => p.stock > 0).length} produtos com estoque. Selecione as quantidades para registrar a venda.` : canManage ? 'Gerencie o catálogo e selecione os destaques da homepage.' : 'Consulte fotos, estoque e oportunidades de venda.'}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="button-secondary" disabled={loading || busy} onClick={() => run(refresh)}>Atualizar</button>
                {activeTab === 'products' && canManage && (
                  <button className="button-primary" onClick={() => { setDraft({ ...emptyDraft, categoryId: categories[0]?.id || '' }); setImage(null); }}>
                    <Plus size={18} aria-hidden="true" />Novo produto
                  </button>
                )}
              </div>
            </div>

            {draft && canManage && (
              <form className="admin-panel mb-8 space-y-5 border-2 border-primary/20" onSubmit={saveProduct}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">{draft.id ? 'Editar produto' : 'Novo produto'}</h3>
                  <button type="button" aria-label="Fechar edição do produto" className="icon-button text-muted-foreground hover:text-foreground" onClick={() => { setDraft(null); setImage(null); }}>
                    <X size={20} />
                  </button>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="text-sm font-medium">Nome do Produto
                    <input className="field mt-2" required maxLength={160} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} />
                  </label>
                  <label className="text-sm font-medium">Categoria
                    <select className="field mt-2" required value={draft.categoryId} onChange={e => setDraft({ ...draft, categoryId: e.target.value })}>
                      <option value="">Selecione…</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.emoji ? `${c.emoji} ` : ''}{c.name}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-medium">Preço (R$)
                    <input className="field mt-2" type="number" inputMode="decimal" min="0.01" max="1000000" step="0.01" required value={draft.price} onChange={e => setDraft({ ...draft, price: e.target.value })} />
                  </label>
                  <label className="text-sm font-medium">Estoque
                    <input className="field mt-2" type="number" inputMode="numeric" min="0" max="1000000" step="1" required value={draft.stock} onChange={e => setDraft({ ...draft, stock: e.target.value })} />
                  </label>
                </div>

                <label className="block text-sm font-medium">Descrição
                  <textarea className="field mt-2 min-h-24" maxLength={5000} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex min-h-11 items-center gap-3 rounded-xl border border-border p-3 text-sm">
                    <input type="checkbox" name="featured" className="h-5 w-5 accent-primary" checked={Boolean(draft.featured)} onChange={event => setDraft({ ...draft, featured: event.target.checked })} />
                    Destacar na homepage
                  </label>
                  {user.role === 'ADMIN' && <label className="flex min-h-11 items-center gap-3 rounded-xl border border-primary/30 bg-accent/20 p-3 text-sm">
                    <input type="checkbox" name="onOffer" className="h-5 w-5 accent-primary" checked={Boolean(draft.onOffer)} onChange={event => setDraft({ ...draft, onOffer: event.target.checked })} />
                    <span>Produto em oferta<span className="block text-xs text-muted-foreground">Visível para a equipe. Não altera preço nem homepage.</span></span>
                  </label>}
                </div>

                {/* Photo & Gallery picker section */}
                <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-4">
                  <span className="text-sm font-semibold flex items-center gap-2">
                    <ImageIcon size={18} /> Imagem do produto
                  </span>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    {previewImageSrc ? (
                      <div className="relative h-24 w-24 rounded-lg border border-border overflow-hidden bg-background">
                        <img src={previewImageSrc} alt="Preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          className="absolute top-1 right-1 rounded-full bg-background/80 p-1 text-destructive hover:bg-background"
                          onClick={() => { setImage(null); setDraft({ ...draft, imageUrl: '' }); }}
                          title="Remover imagem"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-border bg-background text-muted-foreground text-xs text-center p-2">
                        Sem foto
                      </div>
                    )}

                    <div className="flex-1 space-y-2">
                      <label className="block text-xs font-medium text-muted-foreground">
                        Fazer upload de nova foto (JPEG, PNG, WebP; até 5 MB):
                        <input key={draft.id || 'new'} className="field mt-1 text-xs" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { const file = e.target.files?.[0] || null; setImage(file); setImagePreview(file ? URL.createObjectURL(file) : undefined); }} />
                      </label>
                      {categoryGalleryImages.length > 0 && (
                        <button
                          type="button"
                          className="button-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                          onClick={() => setShowGalleryModal(true)}
                        >
                          <ImageIcon size={14} /> Selecionar das fotos da categoria ({categoryGalleryImages.length})
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal for Selecting Category Photos */}
                {showGalleryModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-xl rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
                      <div className="flex items-center justify-between pb-2 border-b border-border">
                        <h4 className="font-bold text-lg flex items-center gap-2">
                          <ImageIcon size={20} /> Galeria de Imagens da Categoria
                        </h4>
                        <button type="button" aria-label="Fechar galeria" className="icon-button text-muted-foreground hover:text-foreground" onClick={() => setShowGalleryModal(false)}>
                          <X size={20} />
                        </button>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Clique em uma imagem abaixo para associá-la a este produto:
                      </p>

                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 overflow-y-auto p-1 flex-1">
                        {categoryGalleryImages.map((url, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={`relative group h-24 rounded-lg border-2 overflow-hidden bg-muted transition-all ${draft.imageUrl === url ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-transparent hover:border-primary/50'}`}
                            onClick={() => {
                              setDraft({ ...draft, imageUrl: url });
                              setImage(null);
                              setShowGalleryModal(false);
                            }}
                          >
                            <img src={url} alt={`Galeria ${idx + 1}`} className="h-full w-full object-cover" />
                            {draft.imageUrl === url && (
                              <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center text-amber-500">
                                <Check size={24} className="bg-background rounded-full p-1" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-border flex justify-end">
                        <button type="button" className="button-secondary text-xs" onClick={() => setShowGalleryModal(false)}>
                          Fechar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!categories.length && <p className="notice-error">Cadastre as categorias antes de adicionar produtos.</p>}

                <div className="flex flex-wrap gap-3">
                  <button className="button-primary" disabled={busy || !categories.length}>{busy ? 'Salvando…' : 'Salvar produto'}</button>
                  <button className="button-secondary" type="button" disabled={busy} onClick={() => { if (window.confirm('Descartar as alterações do produto?')) { setDraft(null); setImage(null); } }}>Cancelar</button>
                </div>
              </form>
            )}

            <div id="catalog-filters" className="mb-4 grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm font-medium">Buscar produto
                <input className="field mt-1" name="product-search" type="search" autoComplete="off" placeholder="Nome ou categoria…" value={query} onChange={event => updateFilters({ q: event.target.value })} />
              </label>
              <label className="text-sm font-medium">Estoque
                <select className="field mt-1" value={stockFilter} onChange={event => updateFilters({ stock: event.target.value })}>
                  <option value="all">Todos os estoques</option><option value="available">Com estoque</option><option value="out">Esgotados</option>
                </select>
              </label>
              <label className="text-sm font-medium">Seleção
                <select className="field mt-1" value={selectionFilter} onChange={event => updateFilters({ selection: event.target.value })}>
                  <option value="all">Todos os produtos</option><option value="featured">Destaques da homepage</option><option value="offer">Produtos em oferta</option>
                </select>
              </label>
              <button type="button" className="button-secondary" disabled={!query && stockFilter === 'all' && selectionFilter === 'all'} onClick={() => updateFilters({ q: '', stock: '', selection: '' })}>Limpar filtros</button>
            </div>
            <p className="mb-3 text-sm text-muted-foreground" role="status">{loading ? 'Atualizando catálogo…' : `${displayedProducts.length} de ${products.length} produtos`}</p>

            {loading ? <p role="status">Carregando produtos…</p> : !products.length ? <div className="status-panel">Nenhum produto cadastrado.</div> : (
              <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
                <table className="responsive-table inventory-table w-full text-left text-sm">
                  <caption className="sr-only">Produtos, preços, estoque e ações</caption>
                  <thead className="border-b border-border bg-muted">
                    <tr>
                      {activeTab === 'products' && <th scope="col" className="p-4 w-12 text-center" title="Destaque Homepage">Destaque</th>}
                      <th scope="col" className="p-4">Produto</th>
                      <th scope="col" className="p-4">Preço</th>
                      <th scope="col" className="p-4">Estoque</th>
                      <th scope="col" className="p-4">{activeTab === 'sales' ? 'Quantidade vendida' : 'Ações'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {!displayedProducts.length && <tr><td colSpan={5} className="p-4 text-muted-foreground">Nenhum produto neste filtro.</td></tr>}
                    {displayedProducts.map(product => (
                      <tr key={product.id} className="hover:bg-muted/20">
                        {activeTab === 'products' && (
                          <td data-label="Destaque" className="p-4 text-center">
                            <button
                              type="button"
                              disabled={busy || !canManage}
                              onClick={() => toggleFeaturedProduct(product)}
                              className={`p-1.5 rounded-lg transition-colors ${product.featured ? 'text-amber-500 hover:bg-amber-500/10' : 'text-muted-foreground/40 hover:text-amber-500 hover:bg-muted'}`}
                              title={product.featured ? 'Remover dos destaques da homepage' : 'Destacar na homepage'}
                              aria-label={`${product.featured ? 'Remover destaque de' : 'Destacar'} ${product.name}`}
                              aria-pressed={Boolean(product.featured)}
                            >
                              <Star size={18} className={product.featured ? 'fill-amber-500' : ''} />
                            </button>
                          </td>
                        )}
                        <td data-label="Produto" className="p-4">
                          <div className="flex items-center gap-3">
                            {product.imageUrl ? (
                              <button type="button" className="shrink-0 rounded-lg" aria-label={`Ver foto de ${product.name}`} onClick={() => updateFilters({ product: referenceId === product.id ? '' : product.id })}><img src={product.imageUrl} alt="" width={40} height={40} loading="lazy" className="h-10 w-10 rounded-lg object-cover bg-muted" /></button>
                            ) : (
                              <div className="h-10 w-10 shrink-0 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs font-semibold">
                                {product.name.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <ProductReference product={product} expanded={referenceId === product.id} onToggle={() => updateFilters({ product: referenceId === product.id ? '' : product.id })} />
                            </div>
                          </div>
                        </td>
                        <td data-label="Preço" className="whitespace-nowrap p-4 tabular-nums font-semibold">{formatCurrency(product.price)}</td>
                        <td data-label="Estoque" className="p-4 tabular-nums">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                            {product.stock === 0 ? 'Esgotado' : `${product.stock} un.`}
                          </span>
                        </td>
                        <td data-label={activeTab === 'sales' ? 'Quantidade vendida' : 'Ações'} className="p-4">
                          {activeTab === 'sales' ? (
                            <input
                              aria-label={'Quantidade vendida de ' + product.name}
                              className="field w-24"
                              type="number"
                              min="0"
                              max={product.stock}
                              step="1"
                              value={sales[product.id] || ''}
                              disabled={!product.stock || busy}
                              onChange={e => { const quantity = Number(e.target.value); setSales({ ...sales, [product.id]: quantity }); if (quantity > 0) updateFilters({ product: product.id }); }}
                            />
                          ) : canManage ? (
                            <div className="flex items-center gap-2">
                              <button
                                className="icon-button"
                                aria-label={'Editar ' + product.name}
                                onClick={() => {
                                  setDraft({
                                    id: product.id,
                                    name: product.name,
                                    price: String(product.price),
                                    stock: String(product.stock),
                                    categoryId: product.categoryId || (typeof product.category === 'object' ? product.category.id : product.category),
                                    description: product.description || '',
                                    imageUrl: product.imageUrl || '',
                                    featured: product.featured,
                                    onOffer: product.onOffer,
                                  });
                                  setImage(null);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                              >
                                <Pencil size={18} aria-hidden="true" />
                              </button>
                              <button
                                className="icon-button text-destructive"
                                disabled={busy}
                                aria-label={'Excluir ' + product.name}
                                onClick={() => {
                                  if (window.confirm('Excluir o produto ' + product.name + '?')) {
                                    run(async () => {
                                      await ProductService.deleteProduct(product.id);
                                      await refresh();
                                      setMessage('Produto excluído com sucesso.');
                                    });
                                  }
                                }}
                              >
                                <Trash2 size={18} aria-hidden="true" />
                              </button>
                            </div>
                          ) : (
                            <button type="button" className="button-secondary px-3 text-xs" disabled={!product.stock} onClick={() => setSearchParams({ tab: 'sales', product: product.id, q: product.name })}>Vender</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'sales' && (
              <>
                <form
                  className="admin-panel mt-6 space-y-6"
                  onSubmit={e => {
                    e.preventDefault();
                    const itemsSoldData = Object.entries(sales).filter(([, quantity]) => quantity > 0).map(([productId, quantity]) => ({ productId, quantity }));
                    const customItemsData = customItems.map(ci => ({
                      description: ci.description,
                      price: parseFloat(ci.price),
                      quantity: ci.quantity
                    }));
                    if (!itemsSoldData.length && !customItemsData.length) {
                      setError('Informe ao menos um produto do catálogo ou item avulso.');
                      return;
                    }
                    if (itemsSoldData.some(item => !Number.isInteger(item.quantity) || item.quantity > (products.find(p => p.id === item.productId)?.stock || 0))) {
                      setError('Confira as quantidades e o estoque disponível dos produtos do catálogo.');
                      return;
                    }
                    if (!window.confirm('Confirmar o registro das vendas e a baixa no estoque?')) return;
                    run(async () => {
                      await api('/sales/close-day', {
                        method: 'POST',
                        body: JSON.stringify({
                          itemsSoldData: itemsSoldData.length ? itemsSoldData : undefined,
                          customItems: customItemsData.length ? customItemsData : undefined,
                          notes,
                          date: canManage ? saleDate : undefined,
                          paymentMethod: salePaymentMethod,
                        })
                      }, true);
                      setSales({});
                      setCustomItems([]);
                      setNotes('');
                      setSaleDate(salesDay());
                      await refresh();
                      setMessage('Vendas registradas e fluxo de caixa atualizado.');
                    });
                  }}
                >
                  {/* Venda Avulsa / Itens Adicionais */}
                  {Object.values(sales).some(quantity => quantity > 0) && <section aria-labelledby="selected-products-title" className="rounded-xl border border-primary/25 bg-accent/20 p-4">
                    <h3 id="selected-products-title" className="text-base font-semibold">Produtos nesta venda</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Confira todos os itens selecionados, inclusive os que não aparecem no filtro atual.</p>
                    <ul className="mt-3 divide-y divide-border">{products.filter(product => (sales[product.id] || 0) > 0).map(product => <li key={product.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="min-w-0 flex-1"><button type="button" className="min-h-11 text-left font-medium hover:text-primary" onClick={() => { updateFilters({ product: product.id, q: product.name, stock: '', selection: '' }); document.getElementById('catalog-filters')?.scrollIntoView({ block: 'start' }); }}>{product.name}</button>
                        <p className="text-sm text-muted-foreground">{sales[product.id]} × {formatCurrency(product.price)} = {formatCurrency(Math.round(product.price * 100) * sales[product.id] / 100)}</p></div>
                      <button type="button" className="button-secondary text-destructive" aria-label={`Remover ${product.name} desta venda`} disabled={busy} onClick={() => setSales(previous => { const next = { ...previous }; delete next[product.id]; return next; })}>Remover</button>
                    </li>)}</ul>
                  </section>}
                  <div className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-base flex items-center gap-2">
                          <Plus size={18} className="text-primary" /> Venda Avulsa / Itens Especiais
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Adicione itens avulsos ou serviços sem necessidade de estoque no catálogo (ex: ajustes, gravações, peças sob encomenda).
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-12 items-end">
                      <div className="sm:col-span-6">
                        <label className="text-xs font-medium text-muted-foreground block mb-1">
                          Descrição do item avulso
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Ajuste de anel, gravação, encomenda especial..."
                          className="field text-sm"
                          value={newCustomDesc}
                          onChange={e => setNewCustomDesc(e.target.value)}
                          maxLength={200}
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-xs font-medium text-muted-foreground block mb-1">
                          Valor unitário (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0,00"
                          className="field text-sm"
                          value={newCustomPrice}
                          onChange={e => setNewCustomPrice(e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="text-xs font-medium text-muted-foreground block mb-1">
                          Qtd
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="field text-sm"
                          value={newCustomQty}
                          onChange={e => setNewCustomQty(Math.max(1, parseInt(e.target.value) || 1))}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          className="button-secondary w-full text-xs py-2 flex items-center justify-center gap-1.5"
                          onClick={() => {
                            const desc = newCustomDesc.trim();
                            const priceNum = parseFloat(newCustomPrice.replace(',', '.'));
                            if (!desc) {
                              setError('Informe a descrição do item avulso.');
                              return;
                            }
                            if (isNaN(priceNum) || priceNum <= 0) {
                              setError('Informe um valor válido para o item avulso.');
                              return;
                            }
                            setCustomItems(prev => [
                              ...prev,
                              {
                                id: String(Date.now() + Math.random()),
                                description: desc,
                                price: priceNum.toFixed(2),
                                quantity: newCustomQty
                              }
                            ]);
                            setNewCustomDesc('');
                            setNewCustomPrice('');
                            setNewCustomQty(1);
                            setError('');
                          }}
                        >
                          <Plus size={16} /> Adicionar
                        </button>
                      </div>
                    </div>

                    {customItems.length > 0 && (
                      <div className="rounded-xl border border-border overflow-hidden mt-3">
                        <table className="responsive-table w-full text-left text-xs">
                          <thead className="bg-muted/60 text-muted-foreground font-semibold">
                            <tr>
                              <th scope="col" className="p-3">Item avulso</th>
                              <th scope="col" className="p-3 text-center">Qtd</th>
                              <th scope="col" className="p-3">Valor unitário</th>
                              <th scope="col" className="p-3">Subtotal</th>
                              <th scope="col" className="p-3 w-10 text-center">Remover</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border bg-background">
                            {customItems.map(ci => (
                              <tr key={ci.id} className="hover:bg-muted/20">
                                <td data-label="Item avulso" className="p-3 font-medium">{ci.description}</td>
                                <td data-label="Quantidade" className="p-3 text-center tabular-nums">{ci.quantity}</td>
                                <td data-label="Valor unitário" className="p-3 tabular-nums">{formatCurrency(parseFloat(ci.price))}</td>
                                <td data-label="Subtotal" className="p-3 font-semibold tabular-nums">
                                  {formatCurrency(parseFloat(ci.price) * ci.quantity)}
                                </td>
                                <td data-label="Remover" className="p-3 text-center">
                                  <button
                                    type="button"
                                    className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                                    onClick={() => setCustomItems(prev => prev.filter(item => item.id !== ci.id))}
                                    title="Remover item avulso"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Date control and Payment method */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {canManage ? (
                      <label className="block text-sm font-medium">
                        Data da venda / lançamento
                        <input
                          type="date"
                          required
                          max={salesDay()}
                          className="field mt-2"
                          value={saleDate}
                          onChange={e => setSaleDate(e.target.value)}
                        />
                        <span className="text-xs text-muted-foreground mt-1 block">
                          Lançamento retroativo permitido para Admin e Gerência.
                        </span>
                      </label>
                    ) : (
                      <div className="rounded-xl border border-border bg-muted/40 p-3.5">
                        <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Data da venda
                        </span>
                        <p className="mt-1 text-sm font-bold text-foreground">
                          Hoje ({new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })})
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Perfil Vendedor: somente lançamentos do dia atual são permitidos.
                        </p>
                      </div>
                    )}

                    <label className="block text-sm font-medium">
                      Forma de pagamento predominante
                      <select
                        className="field mt-2"
                        value={salePaymentMethod}
                        onChange={e => setSalePaymentMethod(e.target.value)}
                      >
                        <option value="DINHEIRO">Dinheiro em Espécie</option>
                        <option value="PIX">PIX</option>
                        <option value="CARTAO_DEBITO">Cartão de Débito</option>
                        <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                        <option value="OUTRO">Outro / Misto</option>
                      </select>
                      <span className="text-xs text-muted-foreground mt-1 block">
                        Registrado no fluxo de caixa da loja.
                      </span>
                    </label>
                  </div>

                  <label className="block text-sm font-medium">Observações sobre as vendas
                    <textarea className="field mt-2" maxLength={2000} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ex: Pagamentos em PIX / Cartão de Crédito..." />
                  </label>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total estimado:</p>
                      <p className="text-2xl font-bold tabular-nums text-foreground">
                        {formatCurrency(
                          (products.reduce((sum, p) => sum + Math.round(p.price * 100) * (sales[p.id] || 0), 0) +
                           customItems.reduce((sum, ci) => sum + Math.round(parseFloat(ci.price || '0') * 100) * ci.quantity, 0)) / 100
                        )}
                      </p>
                      {customItems.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          (Catálogo: {formatCurrency(products.reduce((sum, p) => sum + Math.round(p.price * 100) * (sales[p.id] || 0), 0) / 100)} | Avulso: {formatCurrency(customItems.reduce((sum, ci) => sum + Math.round(parseFloat(ci.price || '0') * 100) * ci.quantity, 0) / 100)})
                        </p>
                      )}
                    </div>
                    <button className="button-primary" disabled={busy || loading}>{busy ? 'Registrando…' : 'Confirmar vendas'}</button>
                  </div>
                  <p className="text-xs text-muted-foreground">O servidor confere os preços e o estoque dos produtos de catálogo ao confirmar.</p>
                </form>

                {/* Histórico das Últimas Vendas do Usuário Conectado */}
                {salesHistory?.userRecentSales && salesHistory.userRecentSales.length > 0 && (
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 mt-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-base flex items-center gap-2">
                          <Receipt size={18} className="text-primary" /> Minhas Últimas Vendas Registradas
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Histórico recente dos seus lançamentos no sistema ({salesHistory.userRecentSales.length} {salesHistory.userRecentSales.length === 1 ? 'registro' : 'registros'}).
                        </p>
                      </div>
                      <button
                        type="button"
                        className="button-secondary text-xs py-1 px-3"
                        onClick={() => setShowRecentSales(!showRecentSales)}
                      >
                        {showRecentSales ? 'Ocultar' : 'Exibir'}
                      </button>
                    </div>

                    {showRecentSales && (
                      <div className="overflow-x-auto rounded-xl border border-border">
                        <table className="responsive-table w-full text-left text-sm">
                          <thead className="bg-muted/60 text-muted-foreground text-xs font-semibold">
                            <tr>
                              <th scope="col" className="p-3">Data / Registro</th>
                              <th scope="col" className="p-3">Descrição / Observações</th>
                              <th scope="col" className="p-3">Pagamento</th>
                              <th scope="col" className="p-3 text-center">Peças</th>
                              <th scope="col" className="p-3 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border bg-background text-xs">
                            {salesHistory.userRecentSales.map(sale => (
                              <tr key={sale.id} className="hover:bg-muted/20">
                                <td data-label="Data" className="p-3 whitespace-nowrap">
                                  <span className="font-medium text-foreground block">
                                    {new Date(sale.date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground">
                                    {new Date(sale.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}
                                  </span>
                                </td>
                                <td data-label="Descrição" className="p-3">
                                  <p className="font-medium text-foreground">{sale.description || 'Venda registrada'}</p>
                                  {sale.notes && (
                                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 italic">
                                      "{sale.notes}"
                                    </p>
                                  )}
                                </td>
                                <td data-label="Pagamento" className="p-3 whitespace-nowrap">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-foreground">
                                    {sale.paymentMethod || 'Não informado'}
                                  </span>
                                </td>
                                <td data-label="Peças" className="p-3 text-center font-medium tabular-nums">
                                  {sale.itemsSold} un.
                                </td>
                                <td data-label="Total" className="p-3 text-right font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                                  {formatCurrency(sale.totalRevenue)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

          </>
        )}
      </main>
    </div>
  );
}
