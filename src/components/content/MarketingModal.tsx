import { useState, useEffect } from 'react';
import { ProductService } from '@/services/ProductService';
import type { MarketingPopup } from '@/types/admin';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
export function MarketingModal() {
  const [popup, setPopup] = useState<MarketingPopup | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let live = true;
    ProductService.getActivePopup().then(data => {
      if (!live || !data?.active) return;
      const key = 'seen_popup_' + data.id + '_' + data.updatedAt;
      let seen = false;
      try { seen = !!sessionStorage.getItem(key); } catch { /* Storage can be disabled. */ }
      if (!seen) { setPopup(data); setOpen(true); try { sessionStorage.setItem(key, '1'); } catch { /* Popup still remains dismissible. */ } }
    }).catch(() => { /* A campaign outage must not block shopping. */ });
    return () => { live = false; };
  }, []);
  return <Dialog open={open} onOpenChange={setOpen}>{popup && <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl"><DialogTitle>Novidades Chique Detalhes</DialogTitle><DialogDescription>Confira nossa campanha da temporada.</DialogDescription><img src={popup.imageUrl} alt="Campanha Chique Detalhes" width={600} height={800} onError={() => setOpen(false)} className="max-h-[65dvh] w-full object-contain" /></DialogContent>}</Dialog>;
}
