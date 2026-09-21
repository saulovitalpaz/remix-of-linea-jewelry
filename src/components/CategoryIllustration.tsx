import { categoryIllustration } from '@/lib/category-illustrations';

export default function CategoryIllustration({ emoji, imageUrl, className = 'h-8 w-8' }: { emoji?: string | null; imageUrl?: string | null; className?: string }) {
  const src = imageUrl || categoryIllustration(emoji);
  return src ? <img src={src} alt="" width={96} height={96} className={`${className} object-contain`} loading="lazy" /> : <span aria-hidden="true">{emoji || '💎'}</span>;
}
