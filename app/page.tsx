'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Logo from "./components/Logo";
import styles from "./page.module.css";
import { Product, CATEGORIES } from "./types/product";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.slice(0, 4))); // Show 4 latest
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Logo />
        <nav className={styles.nav}>
          <a href="#inicio">Início</a>
          <a href="#produtos">Categorias</a>
          <a href="#novidades">Novidades</a>
          <a href="#quem-somos">Quem Somos</a>
        </nav>
        <button className="romantic-button">Fale Conosco</button>
      </header>

      <main>
        <section id="inicio" className={styles.hero} style={{ minHeight: '600px' }}>
          <Image
            src="/quioske.jpeg"
            alt="Quiosque Chique Detalhes"
            fill
            className={styles.heroImage}
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className={styles.heroContent}>
            <h1>Chique <span className="gold-text">Detalhes</span></h1>
            <p>O encanto em cada detalhe. Acessórios infantis, semijoias e beleza em um espaço romântico e clean.</p>
            <a href="#produtos" className="romantic-button">Conheça nossa linha</a>
          </div>
        </section>

        <section id="produtos" className={styles.section}>
          <h2 className={styles.sectionTitle}>Nossas Categorias</h2>
          <div className={styles.productLines}>
            <div className={styles.lineCard}>
              <div className={styles.cardContent}>
                <h3>Linha Infantil</h3>
                <p>Bolsas e acessórios delicados para as pequenas brilharem.</p>
              </div>
            </div>
            <div className={styles.lineCard}>
              <div className={styles.cardContent}>
                <h3>Semijoias & Bijuterias</h3>
                <p>Elegância e sofisticação em peças selecionadas para você.</p>
              </div>
            </div>
            <div className={styles.lineCard}>
              <div className={styles.cardContent}>
                <h3>Beleza & Make</h3>
                <p>Produtos de maquiagem essenciais para o seu dia a dia.</p>
              </div>
            </div>
          </div>
        </section>

        {products.length > 0 && (
          <section id="novidades" className={styles.section} style={{ background: 'var(--light-grey)' }}>
            <h2 className={styles.sectionTitle}>Novidades Recentes</h2>
            <div className={styles.productLines}>
              {products.map(p => (
                <div key={p.id} className={styles.lineCard}>
                  <div className={styles.cardContent}>
                    <h3>{p.name}</h3>
                    <p style={{ color: 'var(--primary-gold)', fontWeight: 'bold' }}>R$ {p.price.toFixed(2)}</p>
                    <p style={{ fontSize: '0.9rem' }}>{CATEGORIES[p.category]}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="quem-somos" className={styles.section}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 className={styles.sectionTitle}>Romantismo & Minimalismo</h2>
            <p>Localizado no shopping, o quiosque Chique Detalhes nasceu para trazer uma experiência de compra leve e encantadora. Nosso foco é oferecer produtos de alta qualidade com um atendimento personalizado.</p>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2026 Chique Detalhes. Todos os direitos reservados.</p>
        <p>Shopping Center | Novo Hamburgo - RS</p>
      </footer>
    </div>
  );
}
