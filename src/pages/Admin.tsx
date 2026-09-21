import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Package, Settings as SettingsIcon, Receipt, LogOut, Plus, Pencil, Trash2, Layers, Star, ImageIcon, X, Check, CircleDollarSign } from 'lucide-react';
import Settings from '@/components/admin/Settings';
import AdminDashboard from '@/components/admin/AdminDashboard';
import CategoryManager from '@/components/admin/CategoryManager';
import CashFlowManager from '@/components/admin/CashFlowManager';
import type { Product, CategoryModel } from '@/types/product';
import type { AdminUser } from '@/types/admin';
import { ROLE_LABELS } from '@/types/admin';
import { ProductService } from '@/services/ProductService';
import { api, errorMessage, session } from '@/services/api';
import { formatCurrency } from '@/lib/format';

interface Draft {
  id?: string;
  name: string;
  price: string;
  stock: string;
  categoryId: string;
  description: string;
  imageUrl?: string;
  featured?: boolean;
}

const emptyDraft: Draft = { name: '', price: '', stock: '0', categoryId: '', description: '', imageUrl: '', featured: false };

export default function Admin() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(() => !!session.get());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [tab, setTab] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [sales, setSales] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [salePaymentMethod, setSalePaymentMethod] = useState('PIX');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const logout = () => {
    session.clear();
    setUser(null);
    setPassword('');
    setProducts([]);
    setDraft(null);
    setSales({});
    setNotes('');
    setSaleDate(new Date().toISOString().slice(0, 10));
    setSalePaymentMethod('PIX');
    setTab('');
  };


  useEffect(() => {
    let live = true;
    const expired = () => { setUser(null); setError('Sessão expirada. Entre novamente.'); };
    window.addEventListener('session-expired', expired);
    if (session.get()) api<AdminUser>('/auth/me', {}, true).then(data => { if (live) setUser(data); }).catch(e => { if (live) setError(errorMessage(e)); }).finally(() => { if (live) setChecking(false); });
    return () => { live = false; window.removeEventListener('session-expired', expired); };
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const [items, groups] = await Promise.all([ProductService.getProducts(), ProductService.getCategories()]);
      setProducts(items);
      setCategories(groups);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let live = true;
    if (user) {
      const defaultTab = user.role === 'ADMIN' ? 'dashboard' : 'sales';
      setTab(current => current || defaultTab);
      Promise.all([ProductService.getProducts(), ProductService.getCategories()])
        .then(([items, groups]) => { if (live) { setProducts(items); setCategories(groups); } })
        .catch(e => { if (live) setError(errorMessage(e)); })
        .finally(() => { if (live) setLoading(false); });
    }
    return () => { live = false; };
  }, [user]);

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
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'cashflow', label: 'Fluxo de Caixa', icon: CircleDollarSign },
    { id: 'sales', label: 'Registrar vendas', icon: Receipt },
    { id: 'products', label: 'Produtos e estoque', icon: Package },
    { id: 'categories', label: 'Categorias', icon: Layers },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon },
  ] : [
    { id: 'sales', label: 'Registrar vendas', icon: Receipt },
    { id: 'products', label: 'Produtos e estoque', icon: Package },
  ];

  const activeTab = tab || (user.role === 'ADMIN' ? 'dashboard' : 'sales');

  // Available image URLs from existing products in same category (or all)
  const categoryGalleryImages = Array.from(
    new Set(
      products
        .filter(p => p.imageUrl && (!draft?.categoryId || p.categoryId === draft.categoryId || (typeof p.category === 'object' && p.category.id === draft.categoryId)))
        .map(p => p.imageUrl as string)
    )
  );

  const previewImageSrc = image ? URL.createObjectURL(image) : draft?.imageUrl || null;

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="store-container flex min-h-16 items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Chique Detalhes</p>
            <p className="truncate text-sm font-semibold">{user.name}</p>
          </div>
          <button className="button-secondary shrink-0 px-3 sm:px-4" onClick={logout}>
            <LogOut size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <main id="main-content" className="store-container py-6 sm:py-10">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 sm:mb-8">
          <div>
            <p className="mb-2 text-sm text-muted-foreground">{ROLE_LABELS[user.role]}</p>
            <h1 className="text-2xl sm:text-3xl">Olá, {user.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              {activeTab === 'sales' ? 'Registro de vendas da equipe e baixa de estoque.' : activeTab === 'cashflow' ? 'Controle financeiro de entradas, saídas, despesas e relatórios.' : activeTab === 'dashboard' ? 'Visão geral e atalhos de gerenciamento.' : activeTab === 'categories' ? 'Gerencie as categorias de produtos da loja.' : 'Acompanhe os produtos e as vendas da loja.'}
            </p>
          </div>
        </div>

        <nav aria-label="Seções do painel" className="mb-6 -mx-1 flex max-w-full gap-2 overflow-x-auto border-b border-border px-1 pb-3 sm:mb-8 sm:flex-wrap sm:overflow-visible sm:pb-5">
          {navItems.map(item => (
            <button
              key={item.id}
              aria-current={activeTab === item.id ? 'page' : undefined}
              className={(activeTab === item.id ? 'button-primary' : 'button-secondary') + ' shrink-0 whitespace-nowrap'}
              onClick={() => {
                if (draft && !window.confirm('Descartar as alterações do produto?')) return;
                setDraft(null);
                setTab(item.id);
                setError('');
                setMessage('');
              }}
            >
              <item.icon size={18} aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </nav>

        {error && <p className="notice-error mb-6" role="alert">{error}</p>}
        {message && <p className="notice-success mb-6" role="status">{message}</p>}

        {activeTab === 'dashboard' && user.role === 'ADMIN' ? (
          <AdminDashboard
            user={user}
            products={products}
            categories={categories}
            onNavigate={(targetTab) => { setDraft(null); setTab(targetTab); setError(''); setMessage(''); }}
            onNewProduct={() => { setTab('products'); setDraft({ ...emptyDraft, categoryId: categories[0]?.id || '' }); setImage(null); setError(''); setMessage(''); }}
          />
        ) : activeTab === 'cashflow' && user.role === 'ADMIN' ? (
          <CashFlowManager user={user} />
        ) : activeTab === 'categories' && user.role === 'ADMIN' ? (
          <CategoryManager categories={categories} onRefresh={refresh} />
        ) : activeTab === 'settings' && user.role === 'ADMIN' ? (
          <Settings />
        ) : (

          <>
            {/* Stat cards rendered ONLY for products tab */}
            {activeTab === 'products' && (
              <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="admin-stat"><span>Produtos cadastrados</span><strong>{products.length}</strong></div>
                <div className="admin-stat"><span>Unidades em estoque</span><strong>{products.reduce((sum, p) => sum + p.stock, 0)}</strong></div>
                <div className="admin-stat"><span>Destaques Homepage</span><strong className="text-amber-600 dark:text-amber-400">{products.filter(p => p.featured).length}</strong></div>
                <div className="admin-stat"><span>Produtos esgotados</span><strong className="text-destructive">{products.filter(p => p.stock === 0).length}</strong></div>
              </div>
            )}

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl">{activeTab === 'products' ? 'Catálogo de Produtos' : 'Registrar Vendas'}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeTab === 'sales' ? `${products.length} produtos disponíveis em estoque para venda.` : `Clique no ícone de estrela ⭐ para exibir o produto na seção de Destaques da Homepage.`}
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
                  <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => { setDraft(null); setImage(null); }}>
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
                        <input key={draft.id || 'new'} className="field mt-1 text-xs" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setImage(e.target.files?.[0] || null)} />
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
                        <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setShowGalleryModal(false)}>
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

            {loading ? <p role="status">Carregando produtos…</p> : !products.length ? <div className="status-panel">Nenhum produto cadastrado.</div> : (
              <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
                <table className="min-w-[40rem] w-full text-left text-sm">
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
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-muted/20">
                        {activeTab === 'products' && (
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => toggleFeaturedProduct(product)}
                              className={`p-1.5 rounded-lg transition-colors ${product.featured ? 'text-amber-500 hover:bg-amber-500/10' : 'text-muted-foreground/40 hover:text-amber-500 hover:bg-muted'}`}
                              title={product.featured ? 'Remover dos destaques da homepage' : 'Destacar na homepage'}
                            >
                              <Star size={18} className={product.featured ? 'fill-amber-500' : ''} />
                            </button>
                          </td>
                        )}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover bg-muted" />
                            ) : (
                              <div className="h-10 w-10 shrink-0 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs font-semibold">
                                {product.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <Link className="font-medium hover:underline" to={'/product/' + product.id}>{product.name}</Link>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {typeof product.category === 'object' ? product.category.name : product.category}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap p-4 tabular-nums font-semibold">{formatCurrency(product.price)}</td>
                        <td className="p-4 tabular-nums">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                            {product.stock} un.
                          </span>
                        </td>
                        <td className="p-4">
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
                              onChange={e => setSales({ ...sales, [product.id]: Number(e.target.value) })}
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
                                    featured: product.featured
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
                            <Link className="underline text-xs" to={'/product/' + product.id}>Ver produto</Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'sales' && (
              <form
                className="admin-panel mt-6 space-y-5"
                onSubmit={e => {
                  e.preventDefault();
                  const itemsSoldData = Object.entries(sales).filter(([, quantity]) => quantity > 0).map(([productId, quantity]) => ({ productId, quantity }));
                  if (!itemsSoldData.length) { setError('Informe ao menos uma venda.'); return; }
                  if (itemsSoldData.some(item => !Number.isInteger(item.quantity) || item.quantity > (products.find(p => p.id === item.productId)?.stock || 0))) {
                    setError('Confira as quantidades e o estoque disponível.'); return;
                  }
                  if (!window.confirm('Confirmar o registro das vendas e a baixa no estoque?')) return;
                  run(async () => {
                    await api('/sales/close-day', {
                      method: 'POST',
                      body: JSON.stringify({
                        itemsSoldData,
                        notes,
                        date: canManage ? saleDate : undefined,
                        paymentMethod: salePaymentMethod,
                      })
                    }, true);
                    setSales({});
                    setNotes('');
                    setSaleDate(new Date().toISOString().slice(0, 10));
                    await refresh();
                    setMessage('Vendas registradas e fluxo de caixa atualizado.');
                  });
                }}
              >
                {/* Date control and Payment method */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {canManage ? (
                    <label className="block text-sm font-medium">
                      Data da venda / lançamento
                      <input
                        type="date"
                        required
                        max={new Date().toISOString().slice(0, 10)}
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
                        Hoje ({new Date().toLocaleDateString('pt-BR')})
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

                <label className="block text-sm font-medium">Observações sobre as vendas do dia
                  <textarea className="field mt-2" maxLength={2000} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ex: Pagamentos em PIX / Cartão de Crédito..." />
                </label>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p>Total estimado <strong className="ml-2 text-xl tabular-nums">{formatCurrency(products.reduce((sum, p) => sum + Math.round(p.price * 100) * (sales[p.id] || 0), 0) / 100)}</strong></p>
                  <button className="button-primary" disabled={busy || loading}>{busy ? 'Registrando…' : 'Confirmar vendas'}</button>
                </div>
                <p className="text-sm text-muted-foreground">O servidor confere os preços e o estoque ao confirmar.</p>
              </form>
            )}

          </>
        )}
      </main>
    </div>
  );
}
