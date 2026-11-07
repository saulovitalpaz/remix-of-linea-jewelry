import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ImageOff, Minus, Plus, X } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { whatsappMessage } from '@/lib/cart';
import { formatCurrency } from '@/lib/format';
import { api, errorMessage } from '@/services/api';

export default function CartDrawer() {
  const { cart, open, setOpen, changeQuantity } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const items = cart?.items || [];
  const total = items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0) / 100;

  async function purchase() {
    if (!cart || cart.expiresAt <= Date.now() || !items.length || busy) return;
    setBusy(true); setError('');
    const popup = window.open('about:blank', '_blank');
    if (popup) popup.opener = null;
    try {
      const { token } = await api<{ token: string }>('/quotes', { method: 'POST', body: JSON.stringify({ items: items.map(item => ({ productId: item.id, quantity: item.quantity })) }) });
      const link = new URL('/admin', window.location.origin);
      link.searchParams.set('tab', 'sales');
      link.searchParams.set('quote', token);
      const url = `https://wa.me/5577988590306?text=${encodeURIComponent(whatsappMessage(items, 'purchase', link.toString()))}`;
      if (popup) popup.location.replace(url); else window.location.assign(url);
    } catch (cause) {
      popup?.close();
      setError(errorMessage(cause));
    } finally { setBusy(false); }
  }

  function questions() {
    if (!cart || cart.expiresAt <= Date.now() || !items.length) return;
    const message = whatsappMessage(items, 'questions');
    window.open(`https://wa.me/5577988590306?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }

  return <Dialog.Root open={open} onOpenChange={setOpen}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/40" />
      <Dialog.Content className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-md flex-col bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div><Dialog.Title className="font-serif text-2xl">Sua sacola</Dialog.Title><Dialog.Description className="mt-1 text-sm text-muted-foreground">Itens salvos por 24 horas.</Dialog.Description></div>
          <Dialog.Close className="icon-button" aria-label="Fechar sacola"><X size={20} aria-hidden="true" /></Dialog.Close>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {!items.length ? <p className="py-12 text-center text-sm text-muted-foreground">Sua sacola está vazia.</p> : <ul className="divide-y divide-border">
            {items.map(item => <li key={item.id} className="flex gap-4 py-4 first:pt-0">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">{item.imageUrl ? <img src={item.imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><ImageOff size={20} aria-hidden="true" /></div>}</div>
              <div className="min-w-0 flex-1"><p className="font-semibold">{item.name}</p><p className="mt-1 text-sm">{formatCurrency(item.price)}</p>
                <div className="mt-2 flex items-center gap-2"><button type="button" className="icon-button" aria-label={`Diminuir quantidade de ${item.name}`} onClick={() => changeQuantity(item.id, item.quantity - 1)}><Minus size={16} aria-hidden="true" /></button><span className="min-w-4 text-center tabular-nums">{item.quantity}</span><button type="button" className="icon-button" aria-label={`Aumentar quantidade de ${item.name}`} disabled={item.quantity >= item.stock} onClick={() => changeQuantity(item.id, item.quantity + 1)}><Plus size={16} aria-hidden="true" /></button><button type="button" className="ml-auto min-h-11 text-sm text-muted-foreground underline" onClick={() => changeQuantity(item.id, 0)}>Remover</button></div>
              </div>
            </li>)}
          </ul>}
        </div>
        {items.length > 0 && <div className="space-y-3 border-t border-border p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="flex justify-between font-semibold"><span>Total estimado</span><span>{formatCurrency(total)}</span></div>
          <p className="text-xs text-muted-foreground">Preço e disponibilidade serão confirmados pela equipe.</p>
          {error && <p role="alert" className="notice-error">{error}</p>}
          <button type="button" className="button-primary w-full" disabled={busy} onClick={purchase}>{busy ? 'Preparando…' : 'Solicitar compra pelo WhatsApp'}</button>
          <button type="button" className="button-secondary w-full" disabled={busy} onClick={questions}>Tirar dúvidas pelo WhatsApp</button>
        </div>}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
