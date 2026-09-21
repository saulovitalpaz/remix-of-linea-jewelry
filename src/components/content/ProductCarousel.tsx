import { useEffect, useState } from 'react';
import { ProductService } from '@/services/ProductService';
import type { Product } from '@/types/product';
import ProductCard from '@/components/product/ProductCard';
export default function ProductCarousel() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => { let live = true; ProductService.getProducts().then(items => { if (live) setProducts(items.slice(0, 4)); }).catch(() => {}); return () => { live = false; }; }, []);
  if (!products.length) return null;
  return <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">{products.map(product => <ProductCard key={product.id} product={product} />)}</div>;
}
