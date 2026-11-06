import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, ShoppingBag, TrendingUp } from 'lucide-react';
import ProductReference from './ProductReference';
import { bestSellers, monthlyCashFlowParams } from '@/lib/sales-portal';
import type { Product } from '@/types/product';
import type { CashFlowData } from '@/types/cashFlow';
import { api, errorMessage } from '@/services/api';
import { formatCurrency } from '@/lib/format';

interface AdminDashboardProps {
  products: Product[];
}

export default function AdminDashboard({ products }: AdminDashboardProps) {
  const [monthlyTotals, setMonthlyTotals] = useState<{ sales: number; expenses: number } | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const now = new Date();
  const month = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit' }).formatToParts(now);
  const year = month.find(part => part.type === 'year')!.value;
  const monthNumber = month.find(part => part.type === 'month')!.value;
  const monthKey = `${year}-${monthNumber}`;
  const monthLabel = now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', month: 'long', year: 'numeric' });

  useEffect(() => {
    let live = true;
    Promise.all([
      api<CashFlowData>(`/cash-flow?${monthlyCashFlowParams(monthKey, 'SALE')}`, {}, true),
      api<CashFlowData>(`/cash-flow?${monthlyCashFlowParams(monthKey, 'EXPENSE')}`, {}, true),
    ])
      .then(([sales, expenses]) => { if (live) setMonthlyTotals({ sales: sales.summary.salesTotal, expenses: expenses.summary.totalOutflows }); })
      .catch(err => { if (live) setError(errorMessage(err)); });
    return () => { live = false; };
  }, [year, monthNumber, monthKey, retry]);

  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const leaders = bestSellers(products);
  const outOfStockCount = products.filter(product => product.stock === 0).length;
  const totalCatalogValue = products.reduce((sum, product) => sum + Math.round(product.price * 100) * product.stock, 0) / 100;
  const metrics = [
    { label: 'Produtos cadastrados', value: products.length, icon: Package, to: '?tab=products&stock=all' },
    { label: 'Unidades em estoque', value: totalStock, icon: ShoppingBag, to: '?tab=products&stock=available' },
    { label: 'Produtos esgotados', value: outOfStockCount, icon: AlertTriangle, to: '?tab=products&stock=out' },
  ];

  return (
    <div className="space-y-5" aria-label="Painel de Controle Administrador">
      <div className="max-w-4xl space-y-4">
        <section className="rounded-2xl border border-border bg-card p-4 sm:p-5" aria-labelledby="financial-summary">
          <h2 id="financial-summary" className="mb-3 text-base font-semibold">Resumo financeiro</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            <Link to="?tab=products&stock=available" className="rounded-xl bg-muted/50 p-3 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary">
              <p className="text-sm text-muted-foreground">Estoque atual · preços vigentes</p>
              <p className="mt-1 text-xl font-bold tabular-nums">{formatCurrency(totalCatalogValue)}</p>
            </Link>
            <Link to={`?tab=cashflow&period=monthly&month=${monthKey}&category=SALE&type=INFLOW`} className="rounded-xl bg-muted/50 p-3 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary">
              <p className="text-sm text-muted-foreground">Vendas de {monthLabel}</p>
              <p className="mt-1 text-xl font-bold tabular-nums">{monthlyTotals ? formatCurrency(monthlyTotals.sales) : error ? 'Indisponível' : 'Carregando…'}</p>
            </Link>
            <div className="rounded-xl bg-muted/50 p-3" aria-live="polite">
              <p className="text-sm text-muted-foreground">Despesas de {monthLabel}</p>
              <p className="mt-1 text-xl font-bold tabular-nums">{monthlyTotals ? formatCurrency(monthlyTotals.expenses) : error ? 'Indisponível' : 'Carregando…'}</p>
            </div>
          </div>
          {error && <div className="mt-3 flex flex-wrap items-center gap-2 text-sm"><p role="alert" className="text-destructive">{error}</p><button className="button-secondary" onClick={() => { setError(''); setMonthlyTotals(null); setRetry(value => value + 1); }}>Tentar novamente</button></div>}
        </section>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {metrics.map(metric => (
            <Link to={metric.to} key={metric.label} className={`admin-stat min-w-0 p-3 hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary ${metric.label === 'Produtos esgotados' && metric.value > 0 ? 'border-destructive bg-destructive/5' : ''}`}>
              <div className="flex items-start justify-between gap-2 text-sm text-muted-foreground"><span>{metric.label}</span><metric.icon size={17} className="hidden shrink-0 sm:block" aria-hidden="true" /></div>
              <p className={`mt-auto text-2xl font-semibold tabular-nums ${metric.label === 'Produtos esgotados' && metric.value > 0 ? 'text-destructive' : ''}`}>{metric.value}</p>
            </Link>
          ))}
        </div>
      </div>

      {outOfStockCount > 0 && <div className="rounded-xl bg-destructive/5 p-4">
        <p className="font-semibold text-destructive">Precisam de reposição</p>
        <div className="mt-2 flex flex-wrap gap-2">{products.filter(product => product.stock === 0).map(product => <Link key={product.id} to="?tab=products&stock=out" className="rounded-lg border border-destructive/30 px-3 py-2 text-sm hover:bg-destructive/10">{product.name} · esgotado</Link>)}</div>
      </div>}


      <section className="admin-panel" aria-labelledby="bestsellers-title">
        <div className="flex items-center gap-2"><TrendingUp size={20} className="text-primary" aria-hidden="true" /><h2 id="bestsellers-title" className="text-lg">Produtos mais vendidos</h2></div>
        <p className="mt-1 text-sm text-muted-foreground">Os 5 líderes em unidades vendidas · total acumulado</p>
        {leaders.length ? <ol className="mt-4 divide-y divide-border">{leaders.map((product, index) => <li key={product.id} className="flex items-start gap-3 py-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-primary" aria-label={`${index + 1}º lugar`}>{index + 1}</span>
          <div className="min-w-0 flex-1"><ProductReference product={product} expanded={expandedId === product.id} onToggle={() => setExpandedId(expandedId === product.id ? null : product.id)} /></div>
          <div className="shrink-0 text-right"><strong className="text-lg tabular-nums">{product.salesCount}</strong><p className="text-xs text-muted-foreground">{product.salesCount === 1 ? 'unidade' : 'unidades'}</p></div>
        </li>)}</ol> : <p className="mt-5 rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">O ranking aparecerá assim que houver vendas de produtos do catálogo.</p>}
      </section>
    </div>
  );
}
