import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import { ProductService } from '@/services/ProductService';
import type { CategoryModel } from '@/types/product';

const Footer = () => {
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  useEffect(() => { let live = true; ProductService.getCategories().then(data => { if (live) setCategories(data); }).catch(() => {}); return () => { live = false; }; }, []);
  return (
    <footer className="w-full bg-white text-black pt-8 pb-2 px-6 border-t border-[#e5e5e5]">
      <div className="mx-auto max-w-screen-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8">
          {/* Brand - Left side */}
          <div>
            <h3 className="text-2xl font-bold gold-text mb-4">Chique Detalhes</h3>
            <p className="text-sm font-light text-black/70 leading-relaxed max-w-md mb-6">
              O encanto em cada detalhe. Acessórios infantis, semijoias e beleza em um espaço romântico e clean.
            </p>

            {/* Contact Information */}
            <div className="space-y-4 text-sm font-light text-black/70">
              <div>
                <p className="font-normal text-black mb-1">Nosso Quiosque</p>
                <p>Av. Juracy Magalhães, 3340 - Quiosque 115</p>
                <p>Boa Vista, Vitória da Conquista - BA</p>
                <p>CEP: 45055-900</p>
              </div>
              <div>
                <p className="font-normal text-black mb-1">Contato</p>
                <p>(77) 98859-0306</p>
                <p>contato@chiquedetalhes.com.br</p>
              </div>
            </div>
          </div>

          {/* Link lists - Right side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Loja */}
            <div>
              <h4 className="text-sm font-normal mb-4">Loja</h4>
              <ul className="space-y-2">
                <li><Link to="/category/all" className="text-sm text-black/70 hover:text-black">Todos os produtos</Link></li>
                {categories.map(category => <li key={category.id}><Link to={'/category/' + category.slug} className="text-sm text-black/70 hover:text-black">{category.name}</Link></li>)}
              </ul>
            </div>

            {/* Suporte */}
            <div>
              <h4 className="text-sm font-normal mb-4">Suporte</h4>
              <ul className="space-y-2">
                <li><Link to="/support/size-guide" className="text-sm font-light text-black/70 hover:text-black transition-colors">Guia de Medidas</Link></li>
                <li><Link to="/support/care" className="text-sm font-light text-black/70 hover:text-black transition-colors">Cuidados</Link></li>
                <li><Link to="/support/returns" className="text-sm font-light text-black/70 hover:text-black transition-colors">Trocas & Devoluções</Link></li>
                <li><Link to="/support/shipping" className="text-sm font-light text-black/70 hover:text-black transition-colors">Envios</Link></li>
              </ul>
            </div>

            {/* Redes Sociais */}
            <div>
              <h4 className="text-sm font-normal mb-4">Redes Sociais</h4>
              <ul className="space-y-2">
                <li><a href="https://wa.me/5577988590306" target="_blank" rel="noopener noreferrer" className="text-sm font-light text-black/70 hover:text-black transition-colors">WhatsApp</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section - edge to edge separator */}
      <div className="border-t border-[#e5e5e5] -mx-6 px-6 pt-2">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-4 md:flex-row justify-between items-center">
          <div className="text-sm font-light text-black mb-2 md:mb-0">
            <p>© {new Date().getFullYear()} Chique Detalhes. Todos os direitos reservados.</p>
            <p className="text-[10px] opacity-60 mt-1 uppercase">
              LOJA DE VARIEDADES FONSECA LTDA | CNPJ: 64.469.155/0001-54
            </p>
          </div>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-sm font-light text-black hover:text-black/70 transition-colors">
              Privacidade
            </Link>
            <Link to="/terms" className="text-sm font-light text-black hover:text-black/70 transition-colors">
              Termos de Uso
            </Link>
            <Link to="/admin" className="text-sm font-light text-black/40 hover:text-yellow-700 transition-colors">
              Painel Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
