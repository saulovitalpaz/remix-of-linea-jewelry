export interface CartProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
}

export interface CartItem extends CartProduct { quantity: number }
export interface Cart { expiresAt: number; items: CartItem[] }

export const CART_KEY = 'chique_cart_v1';
const CART_DURATION = 24 * 60 * 60 * 1000;

export function parseCart(raw: string | null, now = Date.now()): Cart | null {
  if (!raw) return null;
  try {
    const cart = JSON.parse(raw) as Cart;
    if (!cart || !Number.isFinite(cart.expiresAt) || cart.expiresAt <= now || !Array.isArray(cart.items) || cart.items.length > 50) return null;
    if (cart.items.some(item => !item || typeof item.id !== 'string' || !item.id || typeof item.name !== 'string' || !item.name || !Number.isFinite(item.price) || item.price <= 0 || !Number.isInteger(item.stock) || item.stock < 1 || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > item.stock || (item.imageUrl != null && typeof item.imageUrl !== 'string'))) return null;
    if (new Set(cart.items.map(item => item.id)).size !== cart.items.length) return null;
    return cart;
  } catch { return null; }
}

export function addCartItem(cart: Cart | null, product: CartProduct, quantity: number, now = Date.now()): Cart {
  const active = cart && cart.expiresAt > now && cart.items.length ? cart : { expiresAt: now + CART_DURATION, items: [] };
  const existing = active.items.find(item => item.id === product.id);
  const item = { id: product.id, name: product.name, price: product.price, stock: product.stock, imageUrl: product.imageUrl, quantity: Math.min(product.stock, (existing?.quantity || 0) + Math.max(1, Math.floor(quantity))) };
  return { ...active, items: existing ? active.items.map(current => current.id === product.id ? item : current) : [...active.items, item] };
}

export function changeCartQuantity(cart: Cart, id: string, quantity: number): Cart {
  return { ...cart, items: cart.items.flatMap(item => item.id !== id ? [item] : quantity <= 0 ? [] : [{ ...item, quantity: Math.min(item.stock, Math.floor(quantity)) }]) };
}

export function whatsappMessage(items: CartItem[], purpose: 'purchase' | 'questions', link?: string): string {
  const intro = purpose === 'purchase' ? 'Olá! Gostaria de comprar:' : 'Olá! Tenho dúvidas sobre:';
  return [intro, ...items.map(item => `${item.quantity}x ${item.name}`), ...(purpose === 'purchase' && link ? [`Concluir venda: ${link}`] : [])].join('\n');
}
