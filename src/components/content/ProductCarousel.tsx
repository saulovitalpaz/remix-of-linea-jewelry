import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import pantheonImage from "@/assets/pantheon.jpg";
import eclipseImage from "@/assets/eclipse.jpg";
import haloImage from "@/assets/halo.jpg";
import obliqueImage from "@/assets/oblique.jpg";
import lintelImage from "@/assets/lintel.jpg";
import shadowlineImage from "@/assets/shadowline.jpg";
import organicEarring from "@/assets/organic-earring.png";
import linkBracelet from "@/assets/link-bracelet.png";

import { useState, useEffect } from "react";
import { ProductService } from "../../services/ProductService";
import { Product, CATEGORIES } from "../../types/product";

const ProductCarousel = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ProductService.getProducts().then(all => {
      // Shuffle and take 6 random products
      const shuffled = [...all].sort(() => 0.5 - Math.random());
      setProducts(shuffled.slice(0, 8));
      setIsLoading(false);
    });
  }, []);

  if (isLoading || products.length === 0) return null;
  return (
    <section className="w-full mb-16 px-6">
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="">
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="basis-1/2 md:basis-1/3 lg:basis-1/4 pr-2 md:pr-4"
            >
              <Link to={`/product/${product.id}`}>
                <Card className="border-none shadow-none bg-transparent group">
                  <CardContent className="p-0">
                    <div className="aspect-square mb-3 overflow-hidden bg-muted/10 relative">
                      <img
                        src={product.imageUrl || "/quioske.jpeg"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-black/[0.03]"></div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#C5A028' }}>
                        {CATEGORIES[product.category as keyof typeof CATEGORIES] || product.category}
                      </p>
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-800 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-sm font-bold text-gray-900">
                          R$ {product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default ProductCarousel;