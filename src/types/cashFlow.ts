export type TransactionType = 'INFLOW' | 'OUTFLOW';
export type TransactionCategory = 'SALE' | 'EXPENSE' | 'WITHDRAWAL' | 'SUPPLY' | 'OTHER';
export type PaymentMethod = 'DINHEIRO' | 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'OUTRO';

export interface CashTransaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: string;
  paymentMethod?: string | null;
  notes?: string | null;
  userId?: string | null;
  userName: string;
  userRole: string;
  dailySalesId?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CashFlowSummary {
  totalInflows: number;
  totalOutflows: number;
  netBalance: number;
  salesTotal: number;
  transactionCount: number;
}

export interface CashFlowData {
  summary: CashFlowSummary;
  transactions: CashTransaction[];
}

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  SALE: 'Venda de Produtos',
  EXPENSE: 'Despesa Operacional',
  WITHDRAWAL: 'Retirada / Sangria',
  SUPPLY: 'Suprimento / Aporte',
  OTHER: 'Outro',
};

export const TYPE_LABELS: Record<TransactionType, string> = {
  INFLOW: 'Entrada (+)',
  OUTFLOW: 'Saída (-)',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  DINHEIRO: 'Dinheiro',
  PIX: 'PIX',
  CARTAO_CREDITO: 'Cartão de Crédito',
  CARTAO_DEBITO: 'Cartão de Débito',
  OUTRO: 'Outro',
};
