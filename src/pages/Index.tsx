import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { Product, CATEGORIES } from "../types/product";
import { ProductService } from "../services/ProductService";

const FEATURED_CATEGORIES = [
  {
    label: "Linha Infantil",
    slug: "infantil",
    description: "Bolsas e acessórios delicados para as pequenas brilharem.",
    emoji: "🎀",
  },
  {
    label: "Semijoias & Bijuterias",
    slug: "semijoias",
    description: "Elegância e sofisticação em peças selecionadas para você.",
    emoji: "💍",
  },
  {
    label: "Beleza & Make",
    slug: "make",
    description: "Produtos de maquiagem essenciais para o seu dia a dia.",
    emoji: "💄",
  },
];

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(ProductService.getProducts());
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* ─── HERO ─── */}
        <section
          id="inicio"
          className="relative w-full h-[75vh] min-h-[500px] overflow-hidden flex items-center justify-center"
        >
          <img
            src="/quioske.jpeg"
            alt="Quiosque Chique Detalhes"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

          {/* Content */}
          <div className="relative z-10 text-center text-white px-6 max-w-3xl mx-auto">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-300 mb-4 font-light">
              Shopping Novo Hamburgo
            </p>
            <h1 className="text-5xl md:text-7xl font-bold mb-5 leading-tight drop-shadow-lg">
              Chique{" "}
              <span className="text-yellow-400">Detalhes</span>
            </h1>
            <p className="text-lg md:text-xl text-white/85 mb-8 font-light max-w-xl mx-auto">
              O encanto em cada detalhe. Acessórios infantis, semijoias e
              beleza em um espaço romântico e clean.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#produtos"
                className="bg-yellow-500 hover:bg-yellow-400 text-white font-medium px-8 py-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-yellow-500/30 hover:scale-105"
              >
                Ver produtos
              </a>
              <a
                href="#nossa-loja"
                className="border border-white/60 text-white hover:bg-white/10 px-8 py-3 rounded-full transition-all duration-200 font-light"
              >
                Nossa loja
              </a>
            </div>
          </div>
        </section>

        {/* ─── CATEGORIAS ─── */}
        <section id="produtos" className="py-16 px-4 md:px-8 max-w-screen-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Nossas Categorias
            </h2>
            <p className="text-gray-500 font-light">
              Escolha a categoria e explore nossas peças
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="group bg-white border border-gray-100 rounded-2xl p-8 hover:border-yellow-300 hover:shadow-lg transition-all duration-300 flex flex-col gap-3"
              >
                <span className="text-4xl">{cat.emoji}</span>
                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-yellow-600 transition-colors">
                  {cat.label}
                </h3>
                <p className="text-sm text-gray-500 font-light leading-relaxed">
                  {cat.description}
                </p>
                <span className="mt-2 text-sm font-medium text-yellow-600 group-hover:underline">
                  Ver coleção →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── NOVIDADES ─── */}
        {products.length > 0 && (
          <section className="py-16 px-4 md:px-8 bg-gray-50">
            <div className="max-w-screen-xl mx-auto">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-bold text-gray-800">
                  Novidades
                </h2>
                <Link
                  to="/category/all"
                  className="text-sm text-yellow-600 hover:underline font-medium"
                >
                  Ver tudo →
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {products.slice(0, 4).map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="aspect-square overflow-hidden bg-gray-50">
                      <img
                        src={product.imageUrl || "/quioske.jpeg"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                        {CATEGORIES[product.category as keyof typeof CATEGORIES] || product.category}
                      </p>
                      <h3 className="text-sm font-medium text-gray-800 leading-snug mb-1">
                        {product.name}
                      </h3>
                      <p className="text-base font-bold text-yellow-600">
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
        <section id="nossa-loja" className="py-16 px-4 md:px-8 max-w-screen-xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Nossa Loja Física
            </h2>
            <p className="text-gray-500 font-light">
              Visite nosso quiosque e conheça de perto a delicadeza de nossas peças
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-stretch">
            {/* Info */}
            <div className="lg:w-1/3 bg-white border border-gray-100 rounded-2xl p-8 flex flex-col justify-between gap-6 shadow-sm">
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-0.5 shrink-0">📍</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Endereço</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Shopping Center Novo Hamburgo<br />
                      R. Joaquim Nabuco, 1205<br />
                      Novo Hamburgo - RS
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-0.5 shrink-0">🕐</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Horários</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Seg a Sáb: 10h às 22h<br />
                      Dom: 14h às 20h
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-yellow-500 mt-0.5 shrink-0">📱</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">WhatsApp</p>
                    <p className="text-sm text-gray-500 mt-1">
                      +55 (51) 99999-9999
                    </p>
                  </div>
                </div>
              </div>

              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Shopping+Center+Novo+Hamburgo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-yellow-500 hover:bg-yellow-400 text-white font-medium px-6 py-3 rounded-full transition-all duration-200 text-sm"
              >
                Como chegar →
              </a>
            </div>

            {/* Map */}
            <div className="lg:w-2/3 min-h-[350px] rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3467.485123456789!2d-51.127654!3d-29.683412!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9519426f8b1c4b1d%3A0x6b8b8b8b8b8b8b8b!2sShopping%20Center%20Novo%20Hamburgo!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "350px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

        {/* ─── QUEM SOMOS ─── */}
        <section className="py-16 px-4 md:px-8 bg-gray-50">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Romantismo & Minimalismo
            </h2>
            <p className="text-gray-500 font-light leading-relaxed">
              Nascemos para oferecer uma experiência de compra leve e encantadora.
              Nosso foco é a curadoria de acessórios que celebram a beleza nos
              pequenos detalhes, com um atendimento que faz você se sentir em casa.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
