import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  FileText, 
  RefreshCw, 
  Trash2, 
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  UserCheck
} from 'lucide-react';
import { api, errorMessage } from '@/services/api';
import type { AdminUser, Role } from '@/types/admin';
import { ROLE_LABELS } from '@/types/admin';
import type { 
  CashFlowData, 
  CashTransaction, 
  TransactionType, 
  TransactionCategory, 
  PaymentMethod 
} from '@/types/cashFlow';
import { 
  CATEGORY_LABELS, 
  TYPE_LABELS, 
  PAYMENT_METHOD_LABELS 
} from '@/types/cashFlow';
import { formatCurrency } from '@/lib/format';
import CashFlowReportModal from './CashFlowReportModal';

interface CashFlowManagerProps {
  user: AdminUser;
}

type PeriodMode = 'daily' | 'weekly' | 'monthly' | 'custom';

export default function CashFlowManager({ user }: CashFlowManagerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const salesOnly = searchParams.get('category') === 'SALE';
  const [data, setData] = useState<CashFlowData>({
    summary: { totalInflows: 0, totalOutflows: 0, netBalance: 0, salesTotal: 0, transactionCount: 0 },
    transactions: [],
  });
  const [refreshing, setLoading] = useState(true);
  const [loadedPeriod, setLoadedPeriod] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Period filters
  const [periodMode, setPeriodMode] = useState<PeriodMode>(searchParams.get('period') === 'monthly' ? 'monthly' : 'daily');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedMonth, setSelectedMonth] = useState(() => /^\d{4}-(0[1-9]|1[0-2])$/.test(searchParams.get('month') || '') ? searchParams.get('month')! : new Date().toISOString().slice(0, 7));
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().slice(0, 10));

  // Modals
  const [showNewModal, setShowNewModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // New Transaction Form state
  const [formType, setFormType] = useState<TransactionType>('OUTFLOW');
  const [formCategory, setFormCategory] = useState<TransactionCategory>('EXPENSE');
  const [formAmount, setFormAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('PIX');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formNotes, setFormNotes] = useState('');

  const canPickDate = user.role === 'ADMIN' || user.role === 'MANAGER';

  // Calculate start and end date query params
  const { startDate, endDate, periodLabel } = useMemo(() => {
    const today = new Date();
    if (periodMode === 'daily') {
      const [year, month, day] = selectedDate.split('-').map(Number);
      const d = new Date(year, (month || 1) - 1, day || 1);
      const isToday = selectedDate === today.toISOString().slice(0, 10);
      return {
        startDate: selectedDate,
        endDate: selectedDate,
        periodLabel: isToday ? `Hoje (${d.toLocaleDateString('pt-BR')})` : `Diário (${d.toLocaleDateString('pt-BR')})`,
      };
    }

    if (periodMode === 'weekly') {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      const startIso = start.toISOString().slice(0, 10);
      const endIso = today.toISOString().slice(0, 10);
      return {
        startDate: startIso,
        endDate: endIso,
        periodLabel: `Últimos 7 dias (${start.toLocaleDateString('pt-BR')} a ${today.toLocaleDateString('pt-BR')})`,
      };
    }

    if (periodMode === 'monthly') {
      const [year, month] = selectedMonth.split('-').map(Number);
      const start = new Date(year, (month || 1) - 1, 1);
      const end = new Date(year, month || 1, 0);
      const monthName = start.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      return {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        periodLabel: `Mensal (${monthName.charAt(0).toUpperCase() + monthName.slice(1)})`,
      };
    }

    // Custom
    const start = new Date(customStart + 'T00:00:00');
    const end = new Date(customEnd + 'T00:00:00');
    return {
      startDate: customStart,
      endDate: customEnd,
      periodLabel: `Período (${start.toLocaleDateString('pt-BR')} a ${end.toLocaleDateString('pt-BR')})`,
    };
  }, [periodMode, selectedDate, selectedMonth, customStart, customEnd]);
  const periodKey = `${startDate}:${endDate}:${salesOnly}`;
  const loading = refreshing || loadedPeriod !== periodKey;

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (salesOnly) { params.set('category', 'SALE'); params.set('type', 'INFLOW'); }
      const res = await api<CashFlowData>(`/cash-flow?${params.toString()}`, {}, true);
      setData(res);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
      setLoadedPeriod(periodKey);
    }
  }

  useEffect(() => {
    let live = true;
    const params = new URLSearchParams({ startDate, endDate });
    if (salesOnly) { params.set('category', 'SALE'); params.set('type', 'INFLOW'); }
    api<CashFlowData>(`/cash-flow?${params}`, {}, true)
      .then(result => { if (live) { setData(result); setError(''); } })
      .catch(err => { if (live) setError(errorMessage(err)); })
      .finally(() => { if (live) { setLoading(false); setLoadedPeriod(periodKey); } });
    return () => { live = false; };
  }, [startDate, endDate, periodKey, salesOnly]);

  async function handleCreateTransaction(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const body = {
        type: formType,
        category: formCategory,
        amount: Number(formAmount),
        description: formDescription,
        paymentMethod: formPaymentMethod,
        date: canPickDate ? formDate : undefined,
        notes: formNotes,
      };
      await api<CashTransaction>('/cash-flow', {
        method: 'POST',
        body: JSON.stringify(body),
      }, true);

      setMessage('Movimentação registrada com sucesso.');
      setShowNewModal(false);
      setPeriodMode('daily');
      setSelectedDate(formDate);
      setFormAmount('');
      setFormDescription('');
      setFormNotes('');
      setFormDate(new Date().toISOString().slice(0, 10));
      if (startDate === formDate && endDate === formDate) await loadData();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteTransaction(id: string, isSale = false) {
    const confirmMsg = isSale
      ? 'Tem certeza que deseja excluir esta entrada de venda do fluxo de caixa? O saldo será recalculado.'
      : 'Tem certeza que deseja excluir esta movimentação de caixa?';
    if (!window.confirm(confirmMsg)) return;
    if (busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await api(`/cash-flow/${id}`, { method: 'DELETE' }, true);
      setMessage(isSale ? 'Entrada de venda excluída com sucesso.' : 'Movimentação excluída com sucesso.');
      await loadData();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }


  return (
    <div className="space-y-6 animate-fade-in" aria-label="Fluxo de Caixa">
      {salesOnly && <div className="flex items-center justify-between gap-3 rounded-xl bg-primary/5 p-3"><span>Exibindo somente entradas de vendas</span><button className="button-secondary" onClick={() => setSearchParams({ tab: 'cashflow' })}>Ver todas as movimentações</button></div>}
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="text-primary" size={26} /> Fluxo de Caixa
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Entradas, despesas e saldo da loja.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowReportModal(true)}
            disabled={loading || data.transactions.length === 0}
            className="button-secondary flex items-center gap-1.5 text-xs sm:text-sm"
            title="Gerar e imprimir relatório detalhado"
          >
            <FileText size={16} />
            <span>Gerar Relatório</span>
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="button-primary flex items-center gap-1.5 text-xs sm:text-sm"
          >
            <Plus size={16} />
            <span>Nova movimentação</span>
          </button>
          <button
            onClick={loadData}
            disabled={loading || busy}
            className="button-secondary p-2 sm:px-3"
            title="Atualizar dados"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="notice-error flex items-center gap-2" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div className="notice-success flex items-center gap-2" role="status">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Period Filter Selector */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Filter size={18} className="text-primary" />
            <span>Filtrar Período:</span>
          </div>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {periodLabel}
          </span>
        </div>

        {/* Filter Mode Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPeriodMode('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              periodMode === 'daily'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Diário
          </button>
          <button
            onClick={() => setPeriodMode('weekly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              periodMode === 'weekly'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Semanal (7 dias)
          </button>
          <button
            onClick={() => setPeriodMode('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              periodMode === 'monthly'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setPeriodMode('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              periodMode === 'custom'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Período Personalizado
          </button>
        </div>

        {/* Date Inputs based on selected mode */}
        <div className="pt-2 border-t border-border flex flex-wrap items-center gap-4 text-xs">
          {periodMode === 'daily' && (
            <label className="flex items-center gap-2 font-medium">
              <span>Selecione a data:</span>
              <input
                type="date"
                className="field text-xs py-1 px-2.5 w-auto"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
                className="button-secondary text-[11px] py-1 px-2"
              >
                Hoje
              </button>
            </label>
          )}

          {periodMode === 'monthly' && (
            <label className="flex items-center gap-2 font-medium">
              <span>Selecione o mês/ano:</span>
              <input
                type="month"
                className="field text-xs py-1 px-2.5 w-auto"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setSelectedMonth(new Date().toISOString().slice(0, 7))}
                className="button-secondary text-[11px] py-1 px-2"
              >
                Mês Atual
              </button>
            </label>
          )}

          {periodMode === 'custom' && (
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 font-medium">
                <span>De:</span>
                <input
                  type="date"
                  className="field text-xs py-1 px-2.5 w-auto"
                  value={customStart}
                  onChange={e => setCustomStart(e.target.value)}
                />
              </label>
              <label className="flex items-center gap-2 font-medium">
                <span>Até:</span>
                <input
                  type="date"
                  className="field text-xs py-1 px-2.5 w-auto"
                  value={customEnd}
                  onChange={e => setCustomEnd(e.target.value)}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Inflows */}
        <div className="admin-stat bg-card p-5 rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Entradas</span>
            <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <strong className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            +{formatCurrency(data.summary.totalInflows)}
          </strong>
          <p className="mt-1 text-xs text-muted-foreground">
            Vendas: {formatCurrency(data.summary.salesTotal)}
          </p>
        </div>

        {/* Outflows */}
        <div className="admin-stat bg-card p-5 rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Saídas / Despesas</span>
            <TrendingDown size={18} className="text-destructive" />
          </div>
          <strong className="text-2xl sm:text-3xl font-bold text-destructive tabular-nums">
            -{formatCurrency(data.summary.totalOutflows)}
          </strong>
          <p className="mt-1 text-xs text-muted-foreground">
            Retiradas e despesas do caixa
          </p>
        </div>

        {/* Net Balance */}
        <div className="admin-stat bg-card p-5 rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Saldo Líquido</span>
            <DollarSign size={18} className={data.summary.netBalance >= 0 ? "text-emerald-600" : "text-destructive"} />
          </div>
          <strong className={`text-2xl sm:text-3xl font-bold tabular-nums ${data.summary.netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
            {formatCurrency(data.summary.netBalance)}
          </strong>
          <p className="mt-1 text-xs text-muted-foreground">
            Entradas (-) Saídas
          </p>
        </div>

        {/* Total Transactions */}
        <div className="admin-stat bg-card p-5 rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Movimentações</span>
            <UserCheck size={18} className="text-primary" />
          </div>
          <strong className="text-2xl sm:text-3xl font-bold tabular-nums">
            {data.summary.transactionCount}
          </strong>
          <p className="mt-1 text-xs text-muted-foreground">
            registros no período
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Lançamentos do Caixa</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Movimentações e responsáveis.
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            {data.transactions.length} {data.transactions.length === 1 ? 'item' : 'itens'}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Carregando movimentações do caixa…
          </div>
        ) : data.transactions.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Nenhuma movimentação registrada no período selecionado.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.transactions.map(t => {
              const isPositive = t.type === 'INFLOW';
              const dt = new Date(t.date);
              return <li key={t.id} className="flex items-start gap-1 px-3 sm:px-5 hover:bg-muted/20">
                <details className="cash-entry min-w-0 flex-1">
                  <summary className="grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 py-2 focus-visible:outline-primary">
                    <span className="truncate font-medium" title={t.description}>{t.description}</span>
                    <span className={`row-span-2 font-semibold tabular-nums whitespace-nowrap ${isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'}`}>{isPositive ? '+' : '−'}{formatCurrency(t.amount)}</span>
                    <span className="truncate text-xs text-muted-foreground">{dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} · {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · {CATEGORY_LABELS[t.category]} · {t.userName}</span>
                  </summary>
                  <dl className="grid gap-2 pb-4 text-sm sm:grid-cols-2">
                    <div><dt className="text-muted-foreground">Descrição</dt><dd>{t.description}</dd></div>
                    <div><dt className="text-muted-foreground">Tipo / categoria</dt><dd>{TYPE_LABELS[t.type]} · {CATEGORY_LABELS[t.category]}</dd></div>
                    <div><dt className="text-muted-foreground">Pagamento</dt><dd>{t.paymentMethod ? PAYMENT_METHOD_LABELS[t.paymentMethod] : 'Não informado'}</dd></div>
                    <div><dt className="text-muted-foreground">Responsável</dt><dd>{t.userName} · {ROLE_LABELS[t.userRole as Role] || t.userRole}</dd></div>
                    <div><dt className="text-muted-foreground">Data</dt><dd>{dt.toLocaleString('pt-BR')}</dd></div>
                    {t.notes && <div><dt className="text-muted-foreground">Observações</dt><dd>{t.notes}</dd></div>}
                  </dl>
                </details>
                {user.role === 'ADMIN' && <button type="button" disabled={busy} onClick={() => handleDeleteTransaction(t.id, t.category === 'SALE')} className="icon-button mt-1 text-muted-foreground hover:text-destructive" aria-label={`Excluir lançamento: ${t.description}`}><Trash2 size={16} /></button>}
              </li>;
            })}
          </ul>
        )}
      </div>

      {/* Modal: New Manual Transaction (Despesa / Retirada / Suprimento) */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-label="Nova movimentação de caixa" className="max-h-[90dvh] overflow-y-auto w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Plus size={20} className="text-primary" /> Nova Movimentação de Caixa
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4">
              {error && <p className="notice-error" role="alert">{error}</p>}
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setFormType('OUTFLOW'); setFormCategory('EXPENSE'); }}
                  className={`p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    formType === 'OUTFLOW'
                      ? 'border-destructive bg-destructive/10 text-destructive'
                      : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  Saída / Despesa / Retirada
                </button>
                <button
                  type="button"
                  onClick={() => { setFormType('INFLOW'); setFormCategory('SUPPLY'); }}
                  className={`p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    formType === 'INFLOW'
                      ? 'border-emerald-600 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  Entrada / Suprimento
                </button>
              </div>

              {/* Category */}
              <label className="block text-xs font-medium">
                Categoria
                <select
                  className="field mt-1 text-xs"
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value as TransactionCategory)}
                  required
                >
                  {formType === 'OUTFLOW' ? (
                    <>
                      <option value="EXPENSE">Despesa Operacional</option>
                      <option value="WITHDRAWAL">Retirada / Sangria de Caixa</option>
                      <option value="OTHER">Outra Saída</option>
                    </>
                  ) : (
                    <>
                      <option value="SUPPLY">Suprimento / Aporte de Troco</option>
                      <option value="SALE">Venda Avulsa</option>
                      <option value="OTHER">Outra Entrada</option>
                    </>
                  )}
                </select>
              </label>

              {/* Amount and Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-medium">
                  Valor (R$)
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="1000000"
                    required
                    placeholder="0,00"
                    className="field mt-1 text-xs"
                    value={formAmount}
                    onChange={e => setFormAmount(e.target.value)}
                  />
                </label>

                <label className="text-xs font-medium">
                  Forma de Pagamento
                  <select
                    className="field mt-1 text-xs"
                    value={formPaymentMethod}
                    onChange={e => setFormPaymentMethod(e.target.value as PaymentMethod)}
                    required
                  >
                    <option value="DINHEIRO">Dinheiro</option>
                    <option value="PIX">PIX</option>
                    <option value="CARTAO_DEBITO">Cartão de Débito</option>
                    <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </label>
              </div>

              {/* Description */}
              <label className="block text-xs font-medium">
                Descrição da movimentação
                <input
                  type="text"
                  maxLength={200}
                  required
                  placeholder="Ex: Compra de embalagens para joias, sangria de caixa..."
                  className="field mt-1 text-xs"
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                />
              </label>

              {/* Date (Retroactive allowed for admin / manager) */}
              {canPickDate ? (
                <label className="block text-xs font-medium">
                  Data do lançamento (Lançamento retroativo permitido)
                  <input
                    type="date"
                    required
                    max={new Date().toISOString().slice(0, 10)}
                    className="field mt-1 text-xs"
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                  />
                </label>
              ) : (
                <p className="text-xs text-muted-foreground bg-muted p-2 rounded-lg">
                  Data: <strong>Hoje ({new Date().toLocaleDateString('pt-BR')})</strong> — Lançamentos retroativos são restritos a administradores e gerência.
                </p>
              )}

              {/* Notes */}
              <label className="block text-xs font-medium">
                Observações adicionais (opcional)
                <textarea
                  maxLength={2000}
                  rows={2}
                  className="field mt-1 text-xs"
                  placeholder="Ex: Comprovante guardado na gaveta do caixa..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                />
              </label>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setShowNewModal(false)}
                  className="button-secondary text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="button-primary text-xs"
                >
                  {busy ? 'Salvando…' : 'Salvar Movimentação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <CashFlowReportModal
          data={data}
          periodLabel={periodLabel}
          currentUserName={user.name}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
