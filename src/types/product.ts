export type Category = 'infantil' | 'semijoias' | 'make' | 'bolsas';

export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    description: string;
    imageUrl?: string;
    stock: number;
    salesCount: number;
    categoryId?: string;
    isPublic?: boolean;
    createdAt?: string;
}

export interface CategoryModel {
    id: string;
    name: string;
    slug: string;
    description?: string;
    emoji?: string;
}

export const CATEGORIES: Record<Category, string> = {
    infantil: 'Linha Infantil',
    semijoias: 'Semijoias & Bijuterias',
    make: 'Beleza & Make',
    bolsas: 'Bolsas Femininas'
};
