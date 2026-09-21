import type { Product } from '../types/product';

interface CatalogFilters {
  query?: string;
  sort?: string;
  category?: string;
  available?: boolean;
  price?: string;
}

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function filterCatalog(products: Product[], filters: CatalogFilters = {}): Product[] {
  const { query = '', sort = 'newest', category = 'all', available = false, price = '' } = filters;
  return products.filter(product => {
    const slug = typeof product.category === 'object' ? product.category.slug : product.category;
    return (category === 'all' || slug === category)
      && normalize(`${product.name} ${product.description || ''}`).includes(normalize(query.trim()))
      && (!available || product.stock > 0)
      && (price === 'under50' ? product.price <= 50 : price === '50to150' ? product.price > 50 && product.price <= 150 : price === 'over150' ? product.price > 150 : true);
  }).sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : sort === 'name' ? a.name.localeCompare(b.name, 'pt-BR') : (b.createdAt || '').localeCompare(a.createdAt || ''));
}
