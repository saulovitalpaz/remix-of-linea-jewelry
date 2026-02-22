export type Category = 'infantil' | 'semijoias' | 'make' | 'bolsas';

export interface Product {
    id: string;
    name: string;
    category: Category;
    price: number;
    description: string;
    imageUrl?: string;
    isPublic: boolean;
    createdAt: string;
}

export const CATEGORIES: Record<Category, string> = {
    infantil: 'Linha Infantil',
    semijoias: 'Semijoias & Bijuterias',
    make: 'Beleza & Make',
    bolsas: 'Bolsas Femininas'
};
