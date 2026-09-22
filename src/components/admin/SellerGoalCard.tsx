import { useEffect, useState } from 'react';
import { Target, Trophy } from 'lucide-react';
import { api, errorMessage } from '@/services/api';
import { formatCurrency } from '@/lib/format';
import { goalProgress, salesMonth } from '@/lib/sales-portal';

interface SalesGoal { month: string; target: number | null; totalRevenue: number }

export default function SellerGoalCard({ refreshKey }: { refreshKey: number }) {
  const month = salesMonth();
  const [goal, setGoal] = useState<SalesGoal | null>(null);
  const [target, setTarget] = useState('');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let live = true;
    api<SalesGoal>('/sales/goal?month=' + month, {}, true)
      .then(data => { if (live) { setError(''); setGoal(data); setTarget(data.target === null ? '' : String(data.target)); } })
      .catch(e => { if (live) setError(errorMessage(e)); });
    return () => { live = false; };
  }, [month, refreshKey, retry]);
  const progress = goalProgress(goal?.target ?? null, goal?.totalRevenue ?? 0);
  const monthLabel = new Date(`${month}-15T12:00:00-03:00`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' });

  return <section className={`admin-panel mb-6 ${progress.achieved ? 'border-primary/40 bg-accent/40' : ''}`} aria-labelledby="seller-goal-title">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 id="seller-goal-title" className="flex items-center gap-2 text-lg"><Target size={20} aria-hidden="true" />Minha meta mensal</h2>
        <p className="mt-1 text-sm text-muted-foreground">{monthLabel} · somente minhas vendas</p></div>
      {goal?.target && !editing ? <button type="button" className="button-secondary" onClick={() => { setEditing(true); setMessage(''); }}>Editar meta</button> : null}
    </div>
    {error && <p className="notice-error mt-4" role="alert">{error} <button type="button" className="underline" onClick={() => setRetry(value => value + 1)}>Tentar novamente</button></p>}
    {!goal && !error && <p className="mt-4 text-sm" role="status">Carregando sua meta…</p>}
    {goal && <>
      <div className="my-5 grid gap-3 sm:grid-cols-3">
        <div><p className="text-sm text-muted-foreground">Vendido no mês</p><p className="text-2xl font-semibold tabular-nums">{formatCurrency(goal.totalRevenue)}</p></div>
        <div><p className="text-sm text-muted-foreground">Minha meta</p><p className="text-xl font-semibold tabular-nums">{goal.target ? formatCurrency(goal.target) : 'Ainda não definida'}</p></div>
        {goal.target ? <div><p className="text-sm text-muted-foreground">Falta para alcançar</p><p className="text-xl font-semibold tabular-nums">{formatCurrency(progress.remaining)}</p></div> : null}
      </div>
      {goal.target ? <>
        <div className="mb-2 flex justify-between gap-3 text-sm"><span>Progresso do mês</span><strong className="tabular-nums">{progress.percent}%</strong></div>
        <progress className="h-3 w-full overflow-hidden rounded-full accent-primary" value={progress.percent} max={100} aria-label="Progresso da minha meta mensal">{progress.percent}%</progress>
        {progress.achieved && <div className="mt-4 flex items-center gap-3 rounded-xl border border-primary/20 bg-card p-4" role="status">
          <Trophy size={32} className="shrink-0 text-primary" aria-hidden="true" />
          <div><p className="font-semibold text-primary">Meta conquistada!</p><p className="text-sm text-muted-foreground">Seu resultado merece destaque. Parabéns pelas vendas deste mês!</p></div>
        </div>}
      </> : <p className="text-sm text-muted-foreground">Defina sua meta para acompanhar cada conquista do mês.</p>}
      {(!goal.target || editing) && <form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={async event => {
        event.preventDefault();
        if (busy) return;
        const value = Number(target);
        if (!Number.isFinite(value) || value <= 0 || value > 1000000) { setError('Informe uma meta entre R$ 0,01 e R$ 1.000.000,00.'); return; }
        setBusy(true); setError(''); setMessage('');
        try { setGoal(await api<SalesGoal>('/sales/goal', { method: 'PUT', body: JSON.stringify({ month, target: value }) }, true)); setEditing(false); setMessage('Sua meta foi salva.'); }
        catch (e) { setError(errorMessage(e)); }
        finally { setBusy(false); }
      }}>
        <label className="min-w-0 flex-1 text-sm font-medium">Meta de {monthLabel} (R$)
          <input className="field mt-1" name="monthly-target" type="number" inputMode="decimal" min="0.01" max="1000000" step="0.01" required autoComplete="off" value={target} onChange={event => setTarget(event.target.value)} />
        </label>
        <button className="button-primary" disabled={busy}>{busy ? 'Salvando…' : 'Salvar meta'}</button>
        {goal.target ? <button type="button" className="button-secondary" disabled={busy} onClick={() => { setEditing(false); setTarget(String(goal.target)); }}>Cancelar</button> : null}
      </form>}
    </>}
    {message && <p className="mt-3 text-sm text-primary" role="status">{message}</p>}
  </section>;
}
