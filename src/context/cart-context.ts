import { createContext, useContext } from 'react';
import type { Cart, CartProduct } from '@/lib/cart';

export interface CartContextValue {
  cart: Cart | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (product: CartProduct, quantity: number) => boolean;
  changeQuantity: (id: string, quantity: number) => void;
}

export const CartContext = createContext<CartContextValue | null>(null);
export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('CartProvider ausente.');
  return value;
}
