import { X, Printer, Download, Calendar, DollarSign, ArrowDownRight, ArrowUpRight, UserCheck } from 'lucide-react';
import type { CashFlowData } from '@/types/cashFlow';
import { CATEGORY_LABELS, TYPE_LABELS, PAYMENT_METHOD_LABELS } from '@/types/cashFlow';
import { ROLE_LABELS } from '@/types/admin';
import type { Role } from '@/types/admin';
import { formatCurrency } from '@/lib/format';

interface CashFlowReportModalProps {
  data: CashFlowData;
  periodLabel: string;
  currentUserName: string;
  onClose: () => void;
}

export default function CashFlowReportModal({
  data,
  periodLabel,
  currentUserName,
  onClose,
}: CashFlowReportModalProps) {
  const { summary, transactions } = data;
  const emissionDate = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date());

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = [
      'Data',
      'Hora',
      'Tipo',
      'Categoria',
      'Descrição',
      'Forma de Pagamento',
      'Usuário Responsável',
      'Cargo / Perfil',
      'Valor (R$)',
      'Observações',
    ];

    const rows = transactions.map(t => {
      const dt = new Date(t.date);
      const dateStr = !isNaN(dt.getTime()) ? dt.toLocaleDateString('pt-BR') : '';
      const timeStr = !isNaN(dt.getTime()) ? dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
      const typeStr = TYPE_LABELS[t.type] || t.type;
      const catStr = CATEGORY_LABELS[t.category] || t.category;
      const paymentStr = t.paymentMethod ? (PAYMENT_METHOD_LABELS[t.paymentMethod] || t.paymentMethod) : '-';
      const roleStr = ROLE_LABELS[t.userRole as Role] || t.userRole;
      const amountStr = t.amount.toFixed(2).replace('.', ',');
      const notesClean = (t.notes || '').replace(/"/g, '""');
      const descClean = (t.description || '').replace(/"/g, '""');

      return [
        `"${dateStr}"`,
        `"${timeStr}"`,
        `"${typeStr}"`,
        `"${catStr}"`,
        `"${descClean}"`,
        `"${paymentStr}"`,
        `"${t.userName}"`,
        `"${roleStr}"`,
        `"${amountStr}"`,
        `"${notesClean}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-fluxo-caixa-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-sm print:static print:bg-transparent print:p-0">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col rounded-2xl border border-border bg-card shadow-2xl print:max-h-none print:border-none print:shadow-none print:w-full">
        {/* Modal Toolbar - Hidden during print */}
        <div className="flex items-center justify-between border-b border-border p-4 print:hidden">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">Relatório de Fluxo de Caixa</h3>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {transactions.length} registros
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="button-secondary flex items-center gap-1.5 text-xs py-1.5 px-3"
              title="Baixar planilha CSV"
            >
              <Download size={14} /> Exportar CSV
            </button>
            <button
              onClick={handlePrint}
              className="button-primary flex items-center gap-1.5 text-xs py-1.5 px-3"
              title="Imprimir ou Salvar como PDF"
            >
              <Printer size={14} /> Imprimir / PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Fechar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 print:p-0 print:overflow-visible">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <img src="/Logo 1.png" alt="Chique Detalhes" className="h-10 w-auto object-contain" />
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Chique Detalhes</h1>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Relatório Financeiro & Fluxo de Caixa
                  </p>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-muted-foreground space-y-1">
              <p className="flex items-center sm:justify-end gap-1.5 font-medium text-foreground">
                <Calendar size={14} className="text-primary" />
                <span>Período: <strong>{periodLabel}</strong></span>
              </p>
              <p>Emitido em: {emissionDate}</p>
              <p>Gerado por: <strong>{currentUserName}</strong></p>
            </div>
          </div>

          {/* Consolidated Financial Summary */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Total de Entradas</span>
                <ArrowUpRight size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                +{formatCurrency(summary.totalInflows)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Vendas: {formatCurrency(summary.salesTotal)}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Total de Saídas</span>
                <ArrowDownRight size={16} className="text-destructive" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-destructive tabular-nums">
                -{formatCurrency(summary.totalOutflows)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Retiradas e despesas
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Saldo Líquido</span>
                <DollarSign size={16} className={summary.netBalance >= 0 ? "text-emerald-600" : "text-destructive"} />
              </div>
              <p className={`text-lg sm:text-xl font-bold tabular-nums ${summary.netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                {formatCurrency(summary.netBalance)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Entradas - Saídas
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Lançamentos</span>
                <UserCheck size={16} className="text-primary" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground tabular-nums">
                {summary.transactionCount}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                registros no período
              </p>
            </div>
          </div>

          {/* Transactions Table with User Identification */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center justify-between">
              <span>Detalhamento dos Lançamentos & Usuários Responsáveis</span>
              <span className="text-xs font-normal text-muted-foreground">
                Exibindo {transactions.length} registros
              </span>
            </h4>

            {transactions.length === 0 ? (
              <p className="rounded-xl border border-border p-6 text-center text-sm text-muted-foreground">
                Nenhuma movimentação de caixa registrada no período selecionado.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/70 font-semibold">
                    <tr>
                      <th className="p-3">Data / Hora</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Categoria</th>
                      <th className="p-3">Descrição / Detalhes</th>
                      <th className="p-3">Pagamento</th>
                      <th className="p-3">Responsável</th>
                      <th className="p-3 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.map(t => {
                      const dt = new Date(t.date);
                      const isPositive = t.type === 'INFLOW';
                      return (
                        <tr key={t.id} className="hover:bg-muted/30">
                          <td className="p-3 whitespace-nowrap tabular-nums">
                            <div>{dt.toLocaleDateString('pt-BR')}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${isPositive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                              {isPositive ? 'Entrada' : 'Saída'}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap font-medium">
                            {CATEGORY_LABELS[t.category] || t.category}
                          </td>
                          <td className="p-3 max-w-[200px] truncate" title={t.description}>
                            <div>{t.description}</div>
                            {t.notes && <div className="text-[10px] text-muted-foreground truncate">{t.notes}</div>}
                          </td>
                          <td className="p-3 whitespace-nowrap text-muted-foreground">
                            {t.paymentMethod ? (PAYMENT_METHOD_LABELS[t.paymentMethod] || t.paymentMethod) : '-'}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <div className="font-semibold text-foreground">{t.userName}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {ROLE_LABELS[t.userRole as Role] || t.userRole}
                            </div>
                          </td>
                          <td className={`p-3 text-right whitespace-nowrap font-bold tabular-nums ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                            {isPositive ? '+' : '-'}{formatCurrency(t.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Report Footer / Signature lines for physical printing */}
          <div className="hidden print:flex justify-between pt-16 text-xs text-center border-t border-border mt-12">
            <div className="w-56">
              <div className="border-t border-foreground pt-1 font-semibold">{currentUserName}</div>
              <div className="text-muted-foreground">Responsável pela Emissão</div>
            </div>
            <div className="w-56">
              <div className="border-t border-foreground pt-1 font-semibold">Gerência / Administração</div>
              <div className="text-muted-foreground">Conferência de Caixa</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
