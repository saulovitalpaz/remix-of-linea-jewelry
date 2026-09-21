import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, ShoppingBag } from 'lucide-react';
import type { Product } from '@/types/product';
import type { CashFlowData } from '@/types/cashFlow';
import { api, errorMessage } from '@/services/api';
import { formatCurrency } from '@/lib/format';

interface AdminDashboardProps {
  products: Product[];
}

export default function AdminDashboard({ products }: AdminDashboardProps) {
  const [monthlySales, setMonthlySales] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const now = new Date();
  const month = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit' }).formatToParts(now);
  const year = month.find(part => part.type === 'year')!.value;
  const monthNumber = month.find(part => part.type === 'month')!.value;
  const monthKey = `${year}-${monthNumber}`;
  const monthLabel = now.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', month: 'long', year: 'numeric' });

  useEffect(() => {
    let live = true;
    const lastDay = new Date(Number(year), Number(monthNumber), 0).getDate();
    api<CashFlowData>(`/cash-flow?startDate=${monthKey}-01&endDate=${monthKey}-${lastDay}&category=SALE&type=INFLOW`, {}, true)
      .then(data => { if (live) setMonthlySales(data.summary.salesTotal); })
      .catch(err => { if (live) setError(errorMessage(err)); });
    return () => { live = false; };
  }, [year, monthNumber, monthKey, retry]);

  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const outOfStockCount = products.filter(product => product.stock === 0).length;
  const totalCatalogValue = products.reduce((sum, product) => sum + Math.round(product.price * 100) * product.stock, 0) / 100;
  const metrics = [
    { label: 'Produtos cadastrados', value: products.length, icon: Package, to: '?tab=products&stock=all' },
    { label: 'Unidades em estoque', value: totalStock, icon: ShoppingBag, to: '?tab=products&stock=available' },
    { label: 'Produtos esgotados', value: outOfStockCount, icon: AlertTriangle, to: '?tab=products&stock=out' },
  ];

  return (
    <div className="space-y-5" aria-label="Painel de Controle Administrador">
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {metrics.map(metric => (
          <Link to={metric.to} key={metric.label} className={`admin-stat min-w-0 p-3 sm:p-5 hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary ${metric.label === 'Produtos esgotados' && metric.value > 0 ? 'border-destructive bg-destructive/5' : ''}`}>
            <div className="flex items-start justify-between gap-2 text-sm text-muted-foreground">
              <span>{metric.label}</span>
              <metric.icon size={17} className="hidden shrink-0 sm:block" aria-hidden="true" />
            </div>
            <p className={`mt-auto text-2xl font-semibold tabular-nums ${metric.label === 'Produtos esgotados' && metric.value > 0 ? 'text-destructive' : ''}`}>
              {metric.value}
            </p>
          </Link>
        ))}
      </div>

      {outOfStockCount > 0 && <div className="rounded-xl bg-destructive/5 p-4">
        <p className="font-semibold text-destructive">Precisam de reposição</p>
        <div className="mt-2 flex flex-wrap gap-2">{products.filter(product => product.stock === 0).map(product => <Link key={product.id} to="?tab=products&stock=out" className="rounded-lg border border-destructive/30 px-3 py-2 text-sm hover:bg-destructive/10">{product.name} · esgotado</Link>)}</div>
      </div>}

      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold">Resumo do Valor em Estoque</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="?tab=products&stock=available" className="rounded-xl bg-muted/50 p-4 hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary">
            <p className="text-sm text-muted-foreground">Estoque atual · preços vigentes</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{formatCurrency(totalCatalogValue)}</p>
          </Link>
          <div className="rounded-xl bg-muted/50 p-4" aria-live="polite">
            <Link to={`?tab=cashflow&period=monthly&month=${monthKey}&category=SALE&type=INFLOW`} className="block text-sm text-muted-foreground hover:underline">Vendas de {monthLabel}</Link>
            {error ? (
              <div className="mt-2 text-sm">
                <p role="alert" className="text-destructive">{error}</p>
                <button className="button-secondary mt-2" onClick={() => { setError(''); setMonthlySales(null); setRetry(value => value + 1); }}>Tentar novamente</button>
              </div>
            ) : <Link to={`?tab=cashflow&period=monthly&month=${monthKey}&category=SALE&type=INFLOW`} className="block mt-1 text-2xl font-bold tabular-nums hover:underline focus-visible:ring-2 focus-visible:ring-primary">{monthlySales === null ? 'Carregando…' : formatCurrency(monthlySales)}</Link>}
          </div>
        </div>
      </section>
    </div>
  );
}
