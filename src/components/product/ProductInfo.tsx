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
import { formatCurrency } from '@/lib/format';

interface ProductInfoProps {
  product: Product;
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => setQuantity(prev => Math.min(product.stock, prev + 1));
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const buyViaWhatsApp = () => {
    if (product.stock < 1 || quantity > product.stock) return;
    const message = encodeURIComponent(`Olá! Gostaria de encomendar ${quantity}x ${product.name} (${formatCurrency(product.price)} cada). Total: ${formatCurrency(product.price * quantity)}. ${window.location.href}`);
    window.open(`https://wa.me/5577988590306?text=${message}`, '_blank', 'noopener,noreferrer');
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

      {/* Product title and price */}
      <div className="space-y-2">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-light text-muted-foreground mb-1">
              {typeof product.category === 'object' ? product.category.name : (CATEGORIES[product.category as keyof typeof CATEGORIES] || product.category)}
            </p>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground">{product.name}</h1>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{formatCurrency(product.price)}</p>
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
              aria-label="Diminuir quantidade"
              disabled={quantity <= 1 || product.stock === 0}
              className="h-11 w-11 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none"
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
              aria-label="Aumentar quantidade"
              disabled={quantity >= product.stock}
              className="h-11 w-11 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50 transition-all md:static md:p-0 md:bg-transparent md:border-none md:shadow-none md:z-auto flex flex-col gap-3">
          <Button
            onClick={buyViaWhatsApp}
            disabled={product.stock === 0}
            className="w-full h-14 bg-[#16763b] text-white hover:bg-[#105c2d] font-bold rounded-2xl flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
            {product.stock > 0 ? 'Comprar pelo WhatsApp' : 'Produto esgotado'}
          </Button>

          <p className="text-center text-xs text-muted-foreground">Confirme disponibilidade e entrega com nossa equipe.</p>
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
