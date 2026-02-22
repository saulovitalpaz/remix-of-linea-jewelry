import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Pagination from "./Pagination";

import { Product, CATEGORIES } from "../../types/product";

import { ProductService } from "../../services/ProductService";

interface ProductGridProps {
  category?: string;
  onLoad?: (count: number) => void;
}

const ProductGrid = ({ category, onLoad }: ProductGridProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  (import.meta.env.SSR ? () => { } : useEffect)(() => {
    ProductService.getProducts().then(allProducts => {
      const filtered = category && category !== 'all'
        ? allProducts.filter(p => p.category.toLowerCase() === category.toLowerCase())
        : allProducts;

      setProducts(filtered);
      setIsLoading(false);
      if (onLoad) onLoad(filtered.length);
    });
  }, [category, onLoad]);

  const filteredProducts = products;

  return (
    <section className="w-full px-6 mb-16 animate-fade-in">
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
        {filteredProducts.map((product) => (
          <Link key={product.id} to={`/product/${product.id}`} className="product-card group">
            <Card
              className="border-none shadow-none bg-transparent cursor-pointer"
            >
              <CardContent className="p-0">
                <div className="aspect-[4/5] mb-4 overflow-hidden product-image-container bg-muted/10 relative">
                  <img
                    src={product.imageUrl || "/quioske.jpeg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                </div>
                <div className="p-3 bg-white/50 backdrop-blur-sm rounded-xl mt-[-20px] relative z-10 mx-2 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: '#C5A028' }}>
                    {CATEGORIES[product.category as keyof typeof CATEGORIES] || product.category}
                  </p>
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 leading-tight mb-2 group-hover:text-[#b38d1e] transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                    R$ {product.price.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-muted-foreground italic">Nenhum produto encontrado nesta categoria.</p>
          </div>
        )}
      </div>

      {filteredProducts.length > 24 && <Pagination />}
    </section>
  );
};

export default ProductGrid;
