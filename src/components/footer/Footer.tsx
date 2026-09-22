import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductService } from '@/services/ProductService';
import type { CategoryModel } from '@/types/product';

const linkClass = 'inline-flex min-h-11 items-center text-sm text-black/70 transition-colors hover:text-primary';

export default function Footer() {
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  useEffect(() => {
    let active = true;
    ProductService.getCategories().then(data => { if (active) setCategories(data); }).catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <footer className="border-t border-border bg-white px-4 py-7 text-black sm:px-6 sm:py-8">
      <div className="mx-auto max-w-screen-xl">
        <div className="grid grid-cols-2 gap-x-5 gap-y-6 md:gap-x-8 xl:grid-cols-[1.35fr_1fr_1fr_1fr]">
          <section aria-labelledby="footer-brand" className="col-span-2 min-w-0 md:col-span-1 xl:col-span-1">
            <h2 id="footer-brand" className="leading-none">
              <span className="block font-serif text-xl tracking-[0.14em] text-primary">CHIQUE</span>
              <span className="brand-script -mt-1 block text-4xl text-neutral-700">Detalhes</span>
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-black/70">Semijoias, bolsas, beleza e acessórios infantis escolhidos com carinho.</p>
            <address className="mt-3 text-sm not-italic leading-6 text-black/70">
              Av. Juracy Magalhães, 3340, Q. 115<br />Boa Vista, Vitória da Conquista — BA · CEP 45055-900
            </address>
          </section>

          <nav aria-labelledby="footer-store" className="col-span-2 md:col-span-1 xl:col-span-1">
            <h2 id="footer-store" className="text-sm font-semibold uppercase tracking-wider">Loja</h2>
            <ul className="mt-1 grid grid-cols-2 gap-x-4">
              <li><Link to="/category/all" className={linkClass}>Todos os produtos</Link></li>
              {categories.map(category => <li key={category.id} className="min-w-0"><Link to={`/category/${category.slug}`} className={`${linkClass} max-w-full truncate`}>{category.name}</Link></li>)}
            </ul>
          </nav>

          <nav aria-labelledby="footer-support" className="min-w-0">
            <h2 id="footer-support" className="text-sm font-semibold uppercase tracking-wider">Suporte</h2>
            <ul className="mt-1 grid gap-x-4 sm:grid-cols-2">
              <li><Link to="/support/size-guide" className={linkClass}>Guia de medidas</Link></li>
              <li><Link to="/support/care" className={linkClass}>Cuidados</Link></li>
              <li><Link to="/support/returns" className={linkClass}>Trocas & devoluções</Link></li>
              <li><Link to="/support/shipping" className={linkClass}>Envios</Link></li>
            </ul>
          </nav>

          <section aria-labelledby="footer-service" className="min-w-0">
            <h2 id="footer-service" className="text-sm font-semibold uppercase tracking-wider">Atendimento</h2>
            <ul className="mt-1">
              <li><a href="https://wa.me/5577988590306" target="_blank" rel="noopener noreferrer" className={linkClass}>WhatsApp: (77) 98859-0306</a></li>
              <li><a href="mailto:contato@chiquedetalhes.com.br" className={`${linkClass} break-all`}>contato@chiquedetalhes.com.br</a></li>
              <li><Link to="/admin" className={linkClass}>Acesso da equipe</Link></li>
            </ul>
          </section>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-border pt-4 text-xs leading-5 text-black/60 sm:flex-row sm:items-end sm:justify-between">
          <div><p>© {new Date().getFullYear()} Chique Detalhes. Todos os direitos reservados.</p><p>LOJA DE VARIEDADES FONSECA LTDA · CNPJ 64.469.155/0001-54</p></div>
          <nav aria-label="Informações legais" className="flex flex-wrap gap-x-5">
            <Link to="/privacy" className={`${linkClass} text-xs`}>Privacidade</Link><Link to="/terms" className={`${linkClass} text-xs`}>Termos de uso</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
