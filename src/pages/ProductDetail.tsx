import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import ProductImageGallery from "../components/product/ProductImageGallery";
import ProductInfo from "../components/product/ProductInfo";
import ProductDescription from "../components/product/ProductDescription";
import ProductCarousel from "../components/content/ProductCarousel";

import { Product, CATEGORIES } from "../types/product";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

import { ProductService } from "../services/ProductService";

const ProductDetailContent = ({ id }: { id?: string }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    if (id) {
      ProductService.getProductById(id).then(p => {
        if (!live) return;
        setProduct(p || null);
        setIsLoading(false);
      }).catch(() => { if (live) { setError('Não foi possível carregar o produto. Tente novamente.'); setProduct(null); setIsLoading(false); } });
    }
    return () => { live = false; };
  }, [id]);

  if (isLoading) {
    return (
      <main id="main-content" className="min-h-screen bg-background flex items-center justify-center" role="status">
        <div className="animate-pulse text-muted-foreground">Carregando produto...</div>
      </main>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main id="main-content" className="store-container py-20 text-center">
          <h1 className="text-2xl">{error || 'Produto não encontrado'}</h1>
          {error && <button className="button-secondary mt-4" onClick={() => window.location.reload()}>Tentar novamente</button>}
          <Link to="/" className="text-primary-gold mt-4 block">Voltar ao início</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="store-container pt-8 pb-32 md:pb-12">
        <section className="w-full">
          {/* Breadcrumb - Show above image on smaller screens */}
          <div className="lg:hidden mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/category/${typeof product.category === 'object' ? product.category.slug : product.category.toLowerCase()}`}>
                      {typeof product.category === 'object' ? product.category.name : (CATEGORIES[product.category as keyof typeof CATEGORIES] || product.category)}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{product.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <ProductImageGallery key={product.id} imageUrl={product.imageUrl} name={product.name} />

            <div className="lg:pl-12 mt-8 lg:mt-0 lg:sticky lg:top-28 lg:h-fit">
              <ProductInfo key={product.id} product={product} />
              <ProductDescription product={product} />
            </div>
          </div>
        </section>

        <section className="w-full mt-16 lg:mt-24">
          <div className="mb-4 px-6">
            <h2 className="text-sm font-light text-foreground">Você também pode gostar</h2>
          </div>
          <ProductCarousel />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default function ProductDetail() {
  const { id } = useParams();
  return <ProductDetailContent key={id} id={id} />;
}
