import { Product } from '../types/product';
import productsData from '../data/products.json';

const STORAGE_KEY = 'chique_detalhes_products';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const ProductService = {
    getProducts: async (): Promise<Product[]> => {
        try {
            const response = await fetch(`${API_URL}/products`);
            if (response.ok) return await response.json();
        } catch (e) {
            console.warn('Backend not available, using local storage.');
        }

        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                return productsData as Product[];
            }
        }
        return productsData as Product[];
    },

    getProductById: async (id: string): Promise<Product | undefined> => {
        try {
            const response = await fetch(`${API_URL}/products/${id}`);
            if (response.ok) return await response.json();
        } catch (e) {
            console.warn('Backend not available, using local storage.');
        }

        const products = await ProductService.getProducts();
        return products.find(p => p.id === id);
    },

    saveProduct: async (product: FormData): Promise<Product> => {
        const token = localStorage.getItem('admin_token');
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: product
        });

        if (!response.ok) throw new Error('Failed to save product');
        return await response.json();
    },

    deleteProduct: async (id: string): Promise<void> => {
        const token = localStorage.getItem('admin_token');
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to delete product');
    }
};
