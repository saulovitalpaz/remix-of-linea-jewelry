import type { Product } from '../types/product';

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

export function filterTeamProducts(products: Product[], filters: { query?: string; stock?: string; selection?: string }) {
  const query = normalize(filters.query?.trim() || '');
  return products.filter(product => {
    const category = typeof product.category === 'object' ? product.category.name : product.category;
    return (!query || normalize(`${product.name} ${category}`).includes(query))
      && (filters.stock !== 'out' || product.stock === 0)
      && (filters.stock !== 'available' || product.stock > 0)
      && (filters.selection !== 'featured' || product.featured)
      && (filters.selection !== 'offer' || product.onOffer);
  });
}

export function goalProgress(target: number | null, total: number) {
  if (!target || target <= 0) return { percent: 0, remaining: 0, achieved: false };
  const targetCents = Math.round(target * 100);
  const totalCents = Math.round(total * 100);
  return {
    percent: Math.min(100, Math.max(0, Math.floor(totalCents / targetCents * 100))),
    remaining: Math.max(0, targetCents - totalCents) / 100,
    achieved: totalCents >= targetCents,
  };
}

export function bestSellers(products: Product[]) {
  return products.filter(product => product.salesCount > 0)
    .sort((a, b) => b.salesCount - a.salesCount || a.name.localeCompare(b.name, 'pt-BR')).slice(0, 5);
}

export function salesMonth(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit' }).formatToParts(date);
  return `${parts.find(part => part.type === 'year')!.value}-${parts.find(part => part.type === 'month')!.value}`;
}

export function salesDay(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)!.value).join('-');
}
