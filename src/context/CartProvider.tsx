import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { CartContext } from './cart-context';
import { addCartItem, changeCartQuantity, parseCart, CART_KEY } from '@/lib/cart';
import type { Cart, CartProduct } from '@/lib/cart';

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const cart = parseCart(raw);
    if (raw && !cart) localStorage.removeItem(CART_KEY);
    return cart;
  } catch { return null; }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(readCart);
  const [open, setOpen] = useState(false);

  function save(next: Cart | null) {
    const value = next?.items.length ? next : null;
    setCart(value);
    try { if (value) localStorage.setItem(CART_KEY, JSON.stringify(value)); else localStorage.removeItem(CART_KEY); } catch { /* Keep the current tab usable when storage is unavailable. */ }
  }

  useEffect(() => {
    const sync = (event: StorageEvent) => { if (event.key === CART_KEY || event.key === null) setCart(readCart()); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  useEffect(() => {
    if (!cart) return;
    const timeout = window.setTimeout(() => {
      const saved = readCart();
      if (saved && saved.expiresAt > Date.now()) { setCart(saved); return; }
      setCart(null);
      try { localStorage.removeItem(CART_KEY); } catch { /* Storage may be disabled. */ }
    }, Math.max(0, cart.expiresAt - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [cart]);

  function add(product: CartProduct, quantity: number) {
    const active = cart && cart.expiresAt > Date.now() ? cart : null;
    if (product.stock < 1 || (!active?.items.some(item => item.id === product.id) && (active?.items.length || 0) >= 50)) return false;
    save(addCartItem(active, product, quantity));
    setOpen(true);
    return true;
  }

  function changeQuantity(id: string, quantity: number) {
    if (cart && cart.expiresAt > Date.now()) save(changeCartQuantity(cart, id, quantity));
    else save(null);
  }

  return <CartContext.Provider value={{ cart, open, setOpen, add, changeQuantity }}>{children}</CartContext.Provider>;
}
