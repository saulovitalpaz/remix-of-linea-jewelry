export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function text(value: unknown, label: string, max = 160): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new HttpError(400, `${label} inválido.`);
  return value.trim().normalize('NFC');
}
export function number(value: unknown, label: string, integer = false): number {
  if ((typeof value !== 'number' && typeof value !== 'string') || value === '') throw new HttpError(400, `${label} inválido.`);
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1_000_000 || (integer && !Number.isInteger(parsed))) throw new HttpError(400, `${label} inválido.`);
  return parsed;
}
export const roles = ['ADMIN', 'MANAGER', 'SELLER'] as const;
export type Role = typeof roles[number];
export const normalizeUsername = (value: unknown) => text(value, 'Nome de acesso', 100).toLocaleLowerCase('pt-BR').replace(/\s+/g, ' ');

export const transactionTypes = ['INFLOW', 'OUTFLOW'] as const;
export type TransactionType = typeof transactionTypes[number];

export const transactionCategories = ['SALE', 'EXPENSE', 'WITHDRAWAL', 'SUPPLY', 'OTHER'] as const;
export type TransactionCategory = typeof transactionCategories[number];

export const paymentMethods = ['DINHEIRO', 'PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'OUTRO'] as const;
export type PaymentMethod = typeof paymentMethods[number];

export function validateSaleDate(value: unknown, userRole: Role): Date {
  const now = new Date();
  if (value === undefined || value === null || value === '') {
    return now;
  }
  if (typeof value !== 'string') throw new HttpError(400, 'Data inválida.');
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) throw new HttpError(400, 'Data inválida.');

  // Check if date is in the future
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  if (parsed.getTime() > endOfToday.getTime() + 24 * 60 * 60 * 1000) {
    throw new HttpError(400, 'A data informada não pode ser futura.');
  }

  // Minimum reasonable date (e.g., 2020-01-01)
  if (parsed.getFullYear() < 2020) {
    throw new HttpError(400, 'A data informada é muito antiga.');
  }

  if (userRole === 'SELLER') {
    const todayIso = now.toISOString().slice(0, 10);
    const inputIso = value.slice(0, 10);
    const brToday = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);
    if (inputIso !== todayIso && inputIso !== brToday) {
      throw new HttpError(403, 'Vendedores só podem lançar vendas referentes ao dia atual. Lançamentos retroativos são restritos a administradores e gerentes.');
    }
  }

  return parsed;
}

export function validateTransaction(body: Record<string, unknown>, userRole: Role) {
  const type = body?.type as TransactionType;
  if (!transactionTypes.includes(type)) {
    throw new HttpError(400, 'Tipo de movimentação inválido (deve ser INFLOW ou OUTFLOW).');
  }

  const category = body?.category as TransactionCategory;
  if (!transactionCategories.includes(category)) {
    throw new HttpError(400, 'Categoria inválida.');
  }

  const amount = number(body?.amount, 'Valor');
  if (amount <= 0 || Math.abs(amount * 100 - Math.round(amount * 100)) > 0.00001) {
    throw new HttpError(400, 'Informe um valor positivo com até duas casas decimais.');
  }

  const description = text(body?.description, 'Descrição', 200);
  const paymentMethod = body?.paymentMethod ? text(body.paymentMethod, 'Forma de pagamento', 50) : null;
  const notes = body?.notes ? text(body.notes, 'Observações', 2000) : null;
  const date = validateSaleDate(body?.date, userRole);

  return { type, category, amount, description, paymentMethod, notes, date };
}

export function salesItems(value: unknown): { productId: string; quantity: number }[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 200) throw new HttpError(400, 'Informe de 1 a 200 itens.');
  const merged = new Map<string, number>();
  for (const item of value) {
    if (!item || typeof item !== 'object') throw new HttpError(400, 'Item inválido.');
    const id = text(item.productId, 'Produto');
    const quantity = number(item.quantity, 'Quantidade', true);
    if (quantity < 1) throw new HttpError(400, 'Quantidade deve ser maior que zero.');
    merged.set(id, (merged.get(id) ?? 0) + quantity);
  }
  return [...merged].sort(([a], [b]) => a.localeCompare(b)).map(([productId, quantity]) => ({ productId, quantity }));
}

