import { Product } from '../types/product';
import productsData from '../data/products.json';

const STORAGE_KEY = 'chique_detalhes_products';

export const ProductService = {
    getProducts: (): Product[] => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error parsing stored products', e);
                return productsData as Product[];
            }
        }

        // Initialize with JSON data
        localStorage.setItem(STORAGE_KEY, JSON.stringify(productsData));
        return productsData as Product[];
    },

    getProductById: (id: string): Product | undefined => {
        const products = ProductService.getProducts();
        return products.find(p => p.id === id);
    },

    saveProduct: (product: Product): Product[] => {
        const products = ProductService.getProducts();
        const index = products.findIndex(p => p.id === product.id);

        let newProducts;
        if (index >= 0) {
            newProducts = [...products];
            newProducts[index] = product;
        } else {
            newProducts = [...products, product];
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
        return newProducts;
    },

    deleteProduct: (id: string): Product[] => {
        const products = ProductService.getProducts();
        const newProducts = products.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
        return newProducts;
    }
};
