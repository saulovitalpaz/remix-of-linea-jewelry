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
