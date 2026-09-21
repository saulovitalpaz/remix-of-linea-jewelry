import { useEffect, useState } from 'react';
import { Package, AlertTriangle, Layers, ShoppingBag } from 'lucide-react';
import type { Product, CategoryModel } from '@/types/product';
import type { CashFlowData } from '@/types/cashFlow';
import { api, errorMessage } from '@/services/api';
import { formatCurrency } from '@/lib/format';

interface AdminDashboardProps {
  products: Product[];
  categories: CategoryModel[];
}

export default function AdminDashboard({ products, categories }: AdminDashboardProps) {
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
    { label: 'Produtos', value: products.length, icon: Package },
    { label: 'Unidades', value: totalStock, icon: ShoppingBag },
    { label: 'Categorias', value: categories.length, icon: Layers },
    { label: 'Esgotados', value: outOfStockCount, icon: AlertTriangle },
  ];

  return (
    <div className="space-y-5" aria-label="Painel de Controle Administrador">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {metrics.map(metric => (
          <div key={metric.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
              <span>{metric.label}</span>
              <metric.icon size={17} className="shrink-0" aria-hidden="true" />
            </div>
            <p className={`mt-1 text-2xl font-bold tabular-nums ${metric.label === 'Esgotados' && metric.value > 0 ? 'text-destructive' : ''}`}>
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold">Resumo do Valor em Estoque</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">Estoque atual · preços vigentes</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{formatCurrency(totalCatalogValue)}</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-4" aria-live="polite">
            <p className="text-sm text-muted-foreground">Vendas de {monthLabel}</p>
            {error ? (
              <div className="mt-2 text-sm">
                <p role="alert" className="text-destructive">{error}</p>
                <button className="button-secondary mt-2" onClick={() => { setError(''); setMonthlySales(null); setRetry(value => value + 1); }}>Tentar novamente</button>
              </div>
            ) : <p className="mt-1 text-2xl font-bold tabular-nums">{monthlySales === null ? 'Carregando…' : formatCurrency(monthlySales)}</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
