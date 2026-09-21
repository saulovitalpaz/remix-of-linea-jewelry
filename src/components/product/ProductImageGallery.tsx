import { useState } from 'react';
import { ImageOff, Expand } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
export default function ProductImageGallery({ imageUrl, name }: { imageUrl?: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  if (!imageUrl || failed) return <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-2xl bg-muted text-muted-foreground"><ImageOff aria-hidden="true" /><p>Foto em breve</p></div>;
  return <Dialog><DialogTrigger asChild><button aria-label={'Ampliar foto de ' + name} className="group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted">
    <img src={imageUrl} alt={name} width={640} height={800} fetchPriority="high" onError={() => setFailed(true)} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /><Expand className="absolute bottom-4 right-4 rounded bg-white p-2 text-foreground" size={40} aria-hidden="true" />
  </button></DialogTrigger><DialogContent className="max-h-[90dvh] max-w-3xl overflow-auto"><DialogTitle>{name}</DialogTitle><DialogDescription>Foto ampliada do produto.</DialogDescription><img src={imageUrl} alt={name} className="max-h-[70dvh] w-full object-contain" /></DialogContent></Dialog>;
}
