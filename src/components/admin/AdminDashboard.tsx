import { Link } from 'react-router-dom';
import { 
  Package, 
  Receipt, 
  Settings as SettingsIcon, 
  Plus, 
  ExternalLink, 
  AlertTriangle, 
  Layers, 
  ShoppingBag, 
  Users, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Store
} from 'lucide-react';
import type { Product, CategoryModel } from '@/types/product';
import type { AdminUser } from '@/types/admin';
import { formatCurrency } from '@/lib/format';

interface AdminDashboardProps {
  user: AdminUser;
  products: Product[];
  categories: CategoryModel[];
  onNavigate: (tab: string) => void;
  onNewProduct: () => void;
}

export default function AdminDashboard({ user, products, categories, onNavigate, onNewProduct }: AdminDashboardProps) {
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalCatalogValue = products.reduce((sum, p) => sum + Math.round(p.price * 100) * p.stock, 0) / 100;

  return (
    <div className="space-y-8 animate-fade-in" aria-label="Painel de Controle Administrador">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-border bg-gradient-to-r from-card via-card to-primary/5 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
              <Sparkles size={14} aria-hidden="true" /> Visão Geral do Administrador
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Painel de Controle</h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Gerencie catálogo, vendas, equipe e configurações da loja Chique Detalhes.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link 
              to="/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="button-secondary flex items-center gap-2 text-xs sm:text-sm"
            >
              <Store size={16} aria-hidden="true" />
              <span>Ver loja pública</span>
              <ExternalLink size={14} aria-hidden="true" />
            </Link>
            <button 
              onClick={onNewProduct} 
              className="button-primary flex items-center gap-2 text-xs sm:text-sm"
            >
              <Plus size={16} aria-hidden="true" />
              <span>Novo produto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="admin-stat bg-card p-5 rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Produtos</span>
            <Package size={18} className="text-primary" />
          </div>
          <strong className="text-2xl sm:text-3xl font-bold">{products.length}</strong>
          <p className="mt-1 text-xs text-muted-foreground">itens cadastrados</p>
        </div>

        <div className="admin-stat bg-card p-5 rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Unidades</span>
            <ShoppingBag size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <strong className="text-2xl sm:text-3xl font-bold">{totalStock}</strong>
          <p className="mt-1 text-xs text-muted-foreground">peças em estoque</p>
        </div>

        <div className="admin-stat bg-card p-5 rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Categorias</span>
            <Layers size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <strong className="text-2xl sm:text-3xl font-bold">{categories.length}</strong>
          <p className="mt-1 text-xs text-muted-foreground">seções da loja</p>
        </div>

        <div className="admin-stat bg-card p-5 rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Esgotados</span>
            <AlertTriangle size={18} className={outOfStockCount > 0 ? "text-destructive" : "text-muted-foreground"} />
          </div>
          <strong className={`text-2xl sm:text-3xl font-bold ${outOfStockCount > 0 ? 'text-destructive' : ''}`}>{outOfStockCount}</strong>
          <p className="mt-1 text-xs text-muted-foreground">produtos zerados</p>
        </div>
      </div>

      {/* Main Shortcuts Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-primary" />
          Ações Principais & Atalhos de Gerenciamento
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Shortcut 1: Fast Sales */}
          <div 
            onClick={() => onNavigate('sales')}
            className="group cursor-pointer rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Receipt size={24} />
              </div>
              <ArrowRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Registrar Vendas</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Acesso rápido para vendedor ou gerência registrar caixa e dar baixa no estoque.
            </p>
            <span className="inline-flex items-center text-xs font-semibold text-primary">
              Ir para vendas rápidas &rarr;
            </span>
          </div>

          {/* Shortcut 2: Manage Products */}
          <div 
            onClick={() => onNavigate('products')}
            className="group cursor-pointer rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Package size={24} />
              </div>
              <ArrowRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Catálogo & Estoque</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Visualizar, editar preços, atualizar estoque e excluir produtos cadastrados.
            </p>
            <span className="inline-flex items-center text-xs font-semibold text-primary">
              Gerenciar {products.length} produtos &rarr;
            </span>
          </div>

          {/* Shortcut 3: System Settings */}
          <div 
            onClick={() => onNavigate('settings')}
            className="group cursor-pointer rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <SettingsIcon size={24} />
              </div>
              <ArrowRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Configurações & Usuários</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Criar novos acessos da equipe (Vendedores/Gerência) e ativar popup marketing.
            </p>
            <span className="inline-flex items-center text-xs font-semibold text-primary">
              Configurações gerais &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* Additional Management Widgets */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Inventory Summary Widget */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-base font-semibold mb-3 flex items-center justify-between">
            <span>Resumo do Valor em Estoque</span>
            <span className="text-xs font-normal text-muted-foreground">Preços vigentes</span>
          </h3>
          <div className="mb-4 rounded-xl bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Valor total estimado do estoque atual</p>
            <p className="text-2xl font-bold tabular-nums text-foreground mt-1">
              {formatCurrency(totalCatalogValue)}
            </p>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
            <span>Produtos em falta: <strong className={outOfStockCount > 0 ? "text-destructive" : "text-foreground"}>{outOfStockCount}</strong></span>
            <button 
              onClick={() => onNavigate('products')} 
              className="text-primary hover:underline font-medium"
            >
              Revisar catálogo
            </button>
          </div>
        </div>

        {/* Categories Quick Reference Widget */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-base font-semibold mb-3 flex items-center justify-between">
            <span>Categorias Ativas</span>
            <span className="text-xs font-medium text-primary">{categories.length} cadastradas</span>
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((cat) => (
              <span 
                key={cat.id} 
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium"
              >
                <span>{cat.name}</span>
                <span className="text-muted-foreground text-[10px]">
                  ({products.filter(p => (typeof p.category === 'object' ? p.category.id : p.categoryId) === cat.id).length})
                </span>
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
            <span>Todas as seções da loja</span>
            <button 
              onClick={onNewProduct} 
              className="text-primary hover:underline font-medium flex items-center gap-1"
            >
              <Plus size={12} /> Adicionar produto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
