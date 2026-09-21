import { categoryIllustration } from '@/lib/category-illustrations';

export default function CategoryIllustration({ emoji, className = 'h-8 w-8' }: { emoji?: string | null; className?: string }) {
  const src = categoryIllustration(emoji);
  return src ? <img src={src} alt="" width={96} height={96} className={`${className} object-contain`} loading="lazy" /> : <span aria-hidden="true">{emoji || '💎'}</span>;
}
