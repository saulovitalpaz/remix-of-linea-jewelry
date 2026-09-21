import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import { ProductService } from '@/services/ProductService';
import type { CategoryModel } from '@/types/product';

const Footer = () => {
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  useEffect(() => { let live = true; ProductService.getCategories().then(data => { if (live) setCategories(data); }).catch(() => {}); return () => { live = false; }; }, []);
  return (
    <footer className="w-full bg-white text-black pt-8 pb-4 px-4 sm:px-6 border-t border-[#e5e5e5]">
      <div className="mx-auto max-w-screen-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Brand - Left side */}
          <div className="lg:col-span-5">
            <h3 className="text-xl sm:text-2xl font-bold gold-text mb-3">Chique Detalhes</h3>
            <p className="text-xs sm:text-sm font-light text-black/70 leading-relaxed max-w-md mb-5">
              O encanto em cada detalhe. Acessórios infantis, semijoias e beleza em um espaço romântico e clean.
            </p>

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-light text-black/70">
              <div>
                <p className="font-semibold text-black mb-1">Nosso Quiosque</p>
                <p>Av. Juracy Magalhães, 3340 — Q. 115</p>
                <p>Boa Vista, Vitória da Conquista — BA</p>
                <p>CEP: 45055-900</p>
              </div>
              <div>
                <p className="font-semibold text-black mb-1">Contato</p>
                <p>(77) 98859-0306</p>
                <p>contato@chiquedetalhes.com.br</p>
              </div>
            </div>
          </div>

          {/* Link lists - Right side (2-col on mobile) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#e5e5e5]">
            {/* Loja */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-black mb-3">Loja</h4>
              <ul className="space-y-1.5 text-xs text-black/70">
                <li><Link to="/category/all" className="hover:text-black transition-colors">Todos os produtos</Link></li>
                {categories.map(category => <li key={category.id}><Link to={'/category/' + category.slug} className="hover:text-black transition-colors truncate block">{category.name}</Link></li>)}
              </ul>
            </div>

            {/* Suporte */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-black mb-3">Suporte</h4>
              <ul className="space-y-1.5 text-xs text-black/70">
                <li><Link to="/support/size-guide" className="hover:text-black transition-colors">Guia de Medidas</Link></li>
                <li><Link to="/support/care" className="hover:text-black transition-colors">Cuidados</Link></li>
                <li><Link to="/support/returns" className="hover:text-black transition-colors">Trocas & Devoluções</Link></li>
                <li><Link to="/support/shipping" className="hover:text-black transition-colors">Envios</Link></li>
              </ul>
            </div>

            {/* Redes e Acesso */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-black mb-3">Atendimento</h4>
              <ul className="space-y-1.5 text-xs text-black/70">
                <li><a href="https://wa.me/5577988590306" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors font-medium text-emerald-700">WhatsApp (77) 98859-0306</a></li>
                <li><Link to="/admin" className="hover:text-yellow-700 transition-colors">Acesso Equipe / Admin</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="border-t border-[#e5e5e5] -mx-4 sm:-mx-6 px-4 sm:px-6 pt-4">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-3 sm:flex-row justify-between items-center text-center sm:text-left">
          <div className="text-xs font-light text-black/70">
            <p>© {new Date().getFullYear()} Chique Detalhes. Todos os direitos reservados.</p>
            <p className="text-[10px] opacity-60 mt-0.5 uppercase">
              LOJA DE VARIEDADES FONSECA LTDA | CNPJ: 64.469.155/0001-54
            </p>
          </div>
          <div className="flex space-x-4 text-xs font-light text-black/70">
            <Link to="/privacy" className="hover:text-black transition-colors">Privacidade</Link>
            <Link to="/terms" className="hover:text-black transition-colors">Termos de Uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
