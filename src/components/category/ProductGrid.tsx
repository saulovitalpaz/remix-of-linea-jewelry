import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Pagination from "./Pagination";
import productsData from "../../data/products.json";
import { Product, CATEGORIES } from "../../types/product";

import { ProductService } from "../../services/ProductService";

interface ProductGridProps {
  category?: string;
}

const ProductGrid = ({ category }: ProductGridProps) => {
  const [products, setProducts] = (import.meta.env.SSR ? [productsData as Product[], () => { }] : useState<Product[]>([])) as [Product[], React.Dispatch<React.SetStateAction<Product[]>>];
  const [isLoading, setIsLoading] = useState(true);

  (import.meta.env.SSR ? () => { } : useEffect)(() => {
    ProductService.getProducts().then(allProducts => {
      const filtered = category && category !== 'all'
        ? allProducts.filter(p => p.category.toLowerCase() === category.toLowerCase())
        : allProducts;
      setProducts(filtered);
      setIsLoading(false);
    });
  }, [category]);

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
                <div className="space-y-2 px-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em]">
                    {CATEGORIES[product.category as keyof typeof CATEGORIES] || product.category}
                  </p>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm md:text-base font-medium text-foreground leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-base font-bold text-primary-gold">
                      R$ {product.price.toFixed(2)}
                    </p>
                  </div>
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
