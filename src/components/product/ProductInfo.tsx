import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Minus, Plus } from "lucide-react";
import { Product, CATEGORIES } from "../../types/product";

interface ProductInfoProps {
  product: Product;
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const buyViaWhatsApp = () => {
    const message = encodeURIComponent(`Olá! Gostaria de encomendar ${quantity}x ${product.name} (R$ ${product.price.toFixed(2)} cada). Total: R$ ${(product.price * quantity).toFixed(2)}.`);
    window.open(`https://wa.me/5551999999999?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb - Show only on desktop */}
      <div className="hidden lg:block">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Início</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/category/${product.category.toLowerCase()}`}>{CATEGORIES[product.category as keyof typeof CATEGORIES] || product.category}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Product title and price */}
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-light text-muted-foreground mb-1">{CATEGORIES[product.category as keyof typeof CATEGORIES]}</p>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground">{product.name}</h1>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-gold">R$ {product.price.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Product choices/options could go here */}

      {/* Quantity and Add to Cart */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-light text-foreground">Quantidade</span>
          <div className="flex items-center border border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={decrementQuantity}
              className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="h-10 flex items-center px-4 text-sm font-light min-w-12 justify-center border-l border-r border-border">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={incrementQuantity}
              className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={buyViaWhatsApp}
            className="w-full h-14 bg-green-600 text-white hover:bg-green-700 font-bold rounded-lg flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
            Comprar pelo WhatsApp
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 border-foreground text-foreground hover:bg-foreground/5 font-light"
          >
            Adicionar à sacola
          </Button>
        </div>
      </div>

      <div className="pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Pagamento:</strong> Aceitamos PIX, Cartão e Dinheiro.<br />
          <strong>Entrega:</strong> Retirada no Quiosque ou Motoboy.
        </p>
      </div>
    </div>
  );
};

export default ProductInfo;
