import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { Product, CATEGORIES } from "../types/product";
import { ProductService } from "../services/ProductService";
import { MarketingModal } from "../components/content/MarketingModal";

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    ProductService.getProducts().then(setProducts);
    ProductService.getCategories().then(setCategories);
  }, []);

  return (
    <div className="min-h-screen bg-transparent font-sans selection:bg-yellow-100 selection:text-yellow-900 relative">

      {/* ─── GLOBAL AMBIENT EDGE GRADIENTS (inline styles for reliability) ─── */}
      <div
        className="pointer-events-none fixed inset-y-0 left-0 w-12 md:w-24 z-40"
        style={{ background: 'linear-gradient(to right, rgba(197,160,40,0.08), transparent)' }}
      />
      <div
        className="pointer-events-none fixed inset-y-0 right-0 w-12 md:w-24 z-40"
        style={{ background: 'linear-gradient(to left, rgba(197,160,40,0.08), transparent)' }}
      />

      <MarketingModal />

      <Header />

      <main className="relative z-10">
        {/* ─── HERO ─── */}
        <section
          id="inicio"
          className="relative w-full flex items-center justify-center px-4 md:px-6 py-12 md:py-16"
        >
          <div className="w-full max-w-screen-xl mx-auto flex flex-col items-center text-center">
            {/* Logo */}
            <div className="mb-8 md:mb-12 animate-fade-in">
              <img
                src="/Logo 1.png"
                alt="Chique Detalhes"
                className="h-32 sm:h-44 md:h-56 lg:h-64 w-auto object-contain mx-auto transition-transform duration-500 hover:scale-105"
              />
            </div>
            {/* Tagline */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-500 mb-10 md:mb-12 font-light leading-relaxed max-w-[90%] md:max-w-xl mx-auto">
              Onde o romantismo encontra o minimalismo.<br className="hidden sm:block" />
              Descubra nossa curadoria exclusiva.
            </p>
            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-2 sm:px-0">
              <a
                href="#produtos"
                className="romantic-button w-full sm:w-auto text-white font-bold px-8 md:px-12 py-4 md:py-5 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 text-center text-base md:text-lg tracking-wide"
              >
                Explorar Coleções
              </a>
              <a
                href="#nossa-loja"
                className="w-full sm:w-auto font-bold px-8 md:px-12 py-4 md:py-5 rounded-2xl transition-all duration-300 text-center text-base md:text-lg bg-white hover:bg-yellow-50/50"
                style={{ border: '2px solid rgba(197,160,40,0.3)', color: '#b38d1e' }}
              >
                Nossa Loja Física
              </a>
            </div>
          </div>
        </section>

        {/* ─── CATEGORIAS ─── */}
        <section id="produtos" className="py-14 md:py-24 px-4 md:px-8 max-w-screen-xl mx-auto">
          <div className="max-w-xl mx-auto text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-3">
              Nossas Categorias
            </h2>
            <div className="h-1 w-16 md:w-20 mx-auto mb-4 md:mb-6 rounded-full" style={{ background: '#C5A028' }} />
            <p className="text-gray-500 font-light text-sm md:text-lg">
              Curadoria pensada em cada detalhe para momentos especiais.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group relative overflow-hidden bg-white/10 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-10 hover:shadow-2xl transition-all duration-500 flex flex-col border border-white/20"
              >
                <div className="mb-4 md:mb-8 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 flex justify-between items-start">
                  <span className="text-4xl md:text-5xl bg-white/50 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-2xl shadow-sm">{cat.emoji}</span>
                  <div className="w-8 h-8 rounded-full bg-white/40 flex items-center justify-center group-hover:bg-[#C5A028] group-hover:text-white transition-colors">
                    <span className="text-sm">→</span>
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-[#b38d1e] transition-colors mb-2 md:mb-3">
                  {cat.name}
                </h3>
                <p className="text-gray-500 font-light leading-relaxed mb-4 md:mb-6 text-sm md:text-base line-clamp-2">
                  {cat.description}
                </p>
                <div className="mt-auto flex items-center text-xs md:text-sm font-bold group-hover:translate-x-2 transition-transform duration-300" style={{ color: '#C5A028' }}>
                  VER COLEÇÃO <span className="ml-2">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── NOVIDADES ─── */}
        {products.length > 0 && (
          <section className="py-14 md:py-24 px-4 md:px-8 border-y border-white/10">
            <div className="max-w-screen-xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 md:mb-12 gap-3">
                <div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                    Destaques da Temporada
                  </h2>
                  <p className="text-gray-500 font-light text-base md:text-lg">As peças mais amadas de nossa coleção.</p>
                </div>
                <Link
                  to="/category/all"
                  className="group flex items-center justify-center w-full sm:w-auto bg-yellow-50 sm:bg-transparent py-4 sm:py-2 rounded-xl text-sm md:text-base font-bold transition-all hover:bg-yellow-100/50"
                  style={{ color: '#C5A028' }}
                >
                  VER TODO O CATÁLOGO
                  <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                </Link>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-10">
                {products.slice(0, 4).map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="product-card group"
                  >
                    <div className="aspect-[3/4] overflow-hidden rounded-xl md:rounded-2xl bg-gray-100 mb-3 md:mb-6 shadow-sm">
                      <img
                        src={product.imageUrl || "/Logo 1.png"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-3 bg-white/50 backdrop-blur-sm rounded-xl mt-[-10px] relative z-10 mx-2 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white">
                      <p className="text-xs md:text-xs font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: '#C5A028' }}>
                        {CATEGORIES[product.category as keyof typeof CATEGORIES] || product.category}
                      </p>
                      <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 leading-tight mb-2 group-hover:text-[#b38d1e] transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                        R$ {product.price.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── NOSSA LOJA ─── */}
        <section id="nossa-loja" className="py-14 md:py-24 px-4 md:px-8 max-w-screen-xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-20 items-center">

            <div className="lg:w-1/2 space-y-6 md:space-y-8 animate-fade-in order-2 lg:order-1">
              <div className="space-y-3 md:space-y-4 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900">
                  Visite Nosso <br /> <span className="gold-text">Quiosque Físico</span>
                </h2>
                <p className="text-gray-500 font-light text-sm md:text-lg">
                  Sinta a qualidade e o brilho de perto em nosso espaço exclusivo em Vitória da Conquista.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <div>
                  <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center mb-3 mx-auto lg:mx-0">
                    <span className="text-lg">📍</span>
                  </div>
                  <h4 className="font-bold mb-1 text-center lg:text-left uppercase text-xs tracking-widest" style={{ color: '#C5A028' }}>Localização</h4>
                  <p className="text-gray-500 text-sm leading-relaxed text-center lg:text-left">
                    Av. Juracy Magalhães, 3340<br />
                    Quiosque 115 - Boa Vista<br />
                    Vitória da Conquista - BA
                  </p>
                </div>
                <div>
                  <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center mb-3 mx-auto lg:mx-0">
                    <span className="text-lg">🕐</span>
                  </div>
                  <h4 className="font-bold mb-1 text-center lg:text-left uppercase text-xs tracking-widest" style={{ color: '#C5A028' }}>Atendimento</h4>
                  <p className="text-gray-500 text-sm leading-relaxed text-center lg:text-left">
                    Segunda a Sábado: 10h às 22h<br />
                    Domingos: 14h às 20h
                  </p>
                </div>
              </div>

              <div className="flex justify-center lg:justify-start">
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Av.+Juracy+Magalhães,+3340+-+Boa+Vista,+Vitória+da+Conquista+-+BA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-900 text-white font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-lg text-sm md:text-base"
                >
                  Abrir no Google Maps <span>↗</span>
                </a>
              </div>
            </div>

            {/* Map */}
            <div className="lg:w-1/2 w-full order-1 lg:order-2">
              <div className="aspect-square sm:aspect-video lg:aspect-square w-full rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 md:border-8 border-white/50 relative group">
                <iframe
                  src="https://maps.google.com/maps?q=Av.%20Juracy%20Magalh%C3%A3es,%203340%20-%20Vit%C3%B3ria%20da%20Conquista&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ─── QUEM SOMOS ─── */}
        <section className="py-16 md:py-32 px-4 md:px-8 bg-black text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 md:w-64 h-40 md:h-64 rounded-full blur-[80px] md:blur-[100px] -translate-y-1/2 translate-x-1/2" style={{ background: 'rgba(197,160,40,0.10)' }} />
          <div className="absolute bottom-0 left-0 w-40 md:w-64 h-40 md:h-64 rounded-full blur-[80px] md:blur-[100px] translate-y-1/2 -translate-x-1/2" style={{ background: 'rgba(230,200,120,0.05)' }} />

          <div className="max-w-4xl mx-auto text-center relative z-10 px-4">
            <span className="text-3xl md:text-5xl mb-6 md:mb-10 block" style={{ color: '#C5A028' }}>"</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-5 md:mb-8 leading-tight">
              Curadoria que inspira, <br className="hidden sm:block" /> detalhes que <span className="italic font-serif" style={{ color: '#E6C878' }}>encantam</span>.
            </h2>
            <p className="text-white/60 font-light text-base md:text-xl leading-relaxed max-w-2xl mx-auto">
              Nascemos do desejo de transformar o simples em extraordinário. Cada peça em nosso quiosque é selecionada para refletir sua personalidade de forma leve e romântica.
            </p>
            <div className="mt-8 md:mt-12 h-px w-20 md:w-24 mx-auto" style={{ background: 'rgba(197,160,40,0.3)' }} />
            <p className="mt-6 md:mt-8 font-bold tracking-widest text-[10px] md:text-xs" style={{ color: '#C5A028' }}>CHIQUE DETALHES • EST. 2024</p>
          </div>
        </section>
      </main>

      <Footer />
    </div >
  );
};

export default Index;
