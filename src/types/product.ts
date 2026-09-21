export type Category = 'infantil' | 'semijoias' | 'make' | 'bolsas';

export interface Product {
    id: string;
    name: string;
    category: string | CategoryModel;
    price: number;
    description: string | null;
    imageUrl?: string | null;
    stock: number;
    salesCount: number;
    featured?: boolean;
    categoryId?: string;
    isPublic?: boolean;
    createdAt?: string;
}

export interface CategoryModel {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    emoji?: string | null;
    icon?: string | null;
    _count?: { products: number };
}

export const CATEGORIES_DATA: Record<Category, { name: string; description: string; emoji: string; icon: string }> = {
    infantil: {
        name: 'Linha Infantil',
        emoji: '🧸',
        icon: '/icons/infantil.png',
        description: 'Um universo de ternura e encanto. Acessórios delicados que celebram a doçura da infância com estilo e segurança.'
    },
    semijoias: {
        name: 'Semijoias & Bijuterias',
        emoji: '💎',
        icon: '/icons/semijoias.png',
        description: 'Elegância que transcende o tempo. Peças selecionadas com acabamento impecável para realçar sua luz.'
    },
    make: {
        name: 'Beleza & Make',
        emoji: '💄',
        icon: '/icons/make.png',
        description: 'O toque final para sua melhor versão. Curadoria de itens de beleza que unem sofisticação e cuidado.'
    },
    bolsas: {
        name: 'Bolsas Femininas',
        emoji: '👜',
        icon: '/icons/bolsas.png',
        description: 'Design, praticidade e personalidade. Nossa coleção de bolsas para acompanhar todos os momentos.'
    }
};

export const CATEGORIES: Record<Category, string> = {
    infantil: CATEGORIES_DATA.infantil.name,
    semijoias: CATEGORIES_DATA.semijoias.name,
    make: CATEGORIES_DATA.make.name,
    bolsas: CATEGORIES_DATA.bolsas.name
};
