import React, { useState, useEffect } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { Product, CATEGORIES } from "../types/product";
import styles from "../App.module.css";
import { Link } from "react-router-dom";

import { ProductService } from "../services/ProductService";

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(ProductService.getProducts());
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section id="inicio" className={styles.hero} style={{ minHeight: '600px', position: 'relative', overflow: 'hidden' }}>
          <img
            src="/quioske.jpeg"
            alt="Quiosque Chique Detalhes"
            className={styles.heroImage}
            style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
          />
          <div className={`${styles.heroContent} bg-black/30 w-full h-full flex flex-col justify-center items-center px-6`}>
            <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg text-white">Chique <span className="text-primary-gold">Detalhes</span></h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl drop-shadow-md">O encanto em cada detalhe. Acessórios infantis, semijoias e beleza em um espaço romântico e clean.</p>
            <a href="#produtos" className="romantic-button bg-primary-gold hover:bg-primary-gold/90 text-white px-8 py-3 rounded-full text-lg transition-transform hover:scale-105 shadow-xl">Conheça nossa linha</a>
          </div>
        </section>

        {/* Categories Section */}
        <section id="produtos" className={styles.section + " animate-fade-in"}>
          <h2 className={styles.sectionTitle}>Nossas Categorias</h2>
          <div className={styles.productLines}>
            <Link to="/category/infantil" className={styles.lineCard}>
              <div className={styles.cardContent}>
                <h3>Linha Infantil</h3>
                <p>Bolsas e acessórios delicados para as pequenas brilharem.</p>
              </div>
            </Link>
            <Link to="/category/semijoias" className={styles.lineCard}>
              <div className={styles.cardContent}>
                <h3>Semijoias & Bijuterias</h3>
                <p>Elegância e sofisticação em peças selecionadas para você.</p>
              </div>
            </Link>
            <Link to="/category/make" className={styles.lineCard}>
              <div className={styles.cardContent}>
                <h3>Beleza & Make</h3>
                <p>Produtos de maquiagem essenciais para o seu dia a dia.</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Recent Products Section */}
        {products.length > 0 && (
          <section id="novidades" className={styles.section + " animate-fade-in"} style={{ background: 'var(--light-grey)' }}>
            <h2 className={styles.sectionTitle}>Novidades Recentes</h2>
            <div className={styles.productLines}>
              {products.slice(0, 4).map(p => (
                <Link to={`/product/${p.id}`} key={p.id} className={styles.lineCard}>
                  <div className={styles.cardContent}>
                    <h3>{p.name}</h3>
                    <p style={{ color: 'var(--primary-gold)', fontWeight: 'bold' }}>R$ {p.price.toFixed(2)}</p>
                    <p style={{ fontSize: '0.9rem' }}>{CATEGORIES[p.category as keyof typeof CATEGORIES]}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Physical Store Section */}
        <section id="nossa-loja" className={styles.section + " animate-fade-in"} style={{ background: 'var(--light-grey)' }}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-primary-gold">Nossa Loja Física</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Visite nosso quiosque e conheça de perto a delicadeza de nossas peças em um ambiente acolhedor e exclusivo.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-stretch">
              {/* Info Card */}
              <div className="lg:w-1/3 bg-white p-8 rounded-2xl shadow-sm border border-border flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-6">Chique Detalhes</h3>
                  <div className="space-y-6">
                    <div className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-gold mt-1 shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                      <div>
                        <p className="font-medium">Endereço</p>
                        <p className="text-sm text-muted-foreground">Shopping Center Novo Hamburgo<br />R. Joaquim Nabuco, 1205<br />Novo Hamburgo - RS</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-gold mt-1 shrink-0"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                      <div>
                        <p className="font-medium">Horários</p>
                        <p className="text-sm text-muted-foreground">Seg a Sáb: 10h às 22h<br />Dom: 14h às 20h</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-gold mt-1 shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                      <div>
                        <p className="font-medium">WhatsApp</p>
                        <p className="text-sm text-muted-foreground">+55 (51) 99999-9999</p>
                      </div>
                    </div>
                  </div>
                </div>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Shopping+Center+Novo+Hamburgo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="romantic-button mt-8 w-full text-center"
                >
                  Como Chegar
                </a>
              </div>

              {/* Map */}
              <div className="lg:w-2/3 h-[400px] lg:h-auto min-h-[400px] rounded-2xl overflow-hidden shadow-sm border border-border">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3467.485123456789!2d-51.127654!3d-29.683412!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9519426f8b1c4b1d%3A0x6b8b8b8b8b8b8b8b!2sShopping%20Center%20Novo%20Hamburgo!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        <section id="quem-somos" className={styles.section + " animate-fade-in"}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 className={styles.sectionTitle}>Romantismo & Minimalismo</h2>
            <p>Nascemos para oferecer uma experiência de compra leve e encantadora. Nosso foco é a curadoria de acessórios que celebram a beleza nos pequenos detalhes, com um atendimento que faz você se sentir em casa.</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
