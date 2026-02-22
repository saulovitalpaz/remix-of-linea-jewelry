import { NextResponse } from 'next/server';
import { Product } from '@/types/product';

// This is a mock persistence. In a real scenario, use a DB.
let products: Product[] = [];

export async function GET() {
    return NextResponse.json(products);
}

export async function POST(request: Request) {
    const data = await request.json();
    const newProduct: Product = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
    };
    products.push(newProduct);
    return NextResponse.json(newProduct);
}
