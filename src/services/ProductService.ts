import type { Product, CategoryModel } from '../types/product';
import { CATEGORIES_DATA } from '../types/product';
import type { MarketingPopup } from '../types/admin';
import { api, ApiError } from './api';

export const ProductService = {
  getProducts: () => api<Product[]>('/products'),
  getProductById: async (id: string): Promise<Product | undefined> => {
    try { return await api<Product>('/products/' + encodeURIComponent(id)); }
    catch (error) { if (error instanceof ApiError && error.status === 404) return undefined; throw error; }
  },
  saveProduct: (body: FormData, id?: string) => api<Product>(id ? '/products/' + encodeURIComponent(id) : '/products', { method: id ? 'PUT' : 'POST', body }, true),
  deleteProduct: (id: string) => api<void>('/products/' + encodeURIComponent(id), { method: 'DELETE' }, true),
  getCategories: async (): Promise<CategoryModel[]> => {
    const categories = await api<CategoryModel[]>('/categories');
    return categories.map(category => ({
      ...category,
      icon: CATEGORIES_DATA[category.slug as keyof typeof CATEGORIES_DATA]?.icon,
    }));
  },
  getActivePopup: () => api<MarketingPopup | null>('/popup/active'),
};
