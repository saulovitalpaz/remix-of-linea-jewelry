'use client';

import { useState, useEffect } from 'react';
import { Product, CATEGORIES, Category } from '../types/product';
import styles from './admin.module.css';

export default function AdminDashboard() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [newProduct, setNewProduct] = useState({
        name: '',
        category: 'infantil' as Category,
        price: 0,
        description: '',
        isPublic: true
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct),
        });
        if (res.ok) {
            setNewProduct({ name: '', category: 'infantil', price: 0, description: '', isPublic: true });
            fetchProducts();
        }
    };

    return (
        <div className={styles.adminContainer}>
            <header className={styles.adminHeader}>
                <h1>Painel Administrativo</h1>
                <a href="/" className="romantic-button">Ver Site Público</a>
            </header>

            <section className="clean-card">
                <h2 style={{ marginBottom: '1.5rem' }}>Cadastrar Novo Produto</h2>
                <form onSubmit={handleSubmit} className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label>Nome do Produto</label>
                        <input
                            type="text"
                            value={newProduct.name}
                            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                            placeholder="Ex: Bolsa Infantil Rosa"
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Categoria</label>
                        <select
                            value={newProduct.category}
                            onChange={e => setNewProduct({ ...newProduct, category: e.target.value as Category })}
                        >
                            {Object.entries(CATEGORIES).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Preço (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={newProduct.price}
                            onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Descrição</label>
                        <textarea
                            value={newProduct.description}
                            onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                            placeholder="Detalhes do produto..."
                        />
                    </div>
                    <button type="submit" className="romantic-button" style={{ gridColumn: 'span 2' }}>
                        Salvar Produto
                    </button>
                </form>
            </section>

            <div className={styles.productList}>
                <h2>Lista de Produtos</h2>
                {loading ? (
                    <p>Carregando...</p>
                ) : (
                    <table className={styles.productTable}>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Categoria</th>
                                <th>Preço</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id}>
                                    <td>{p.name}</td>
                                    <td>{CATEGORIES[p.category]}</td>
                                    <td>R$ {p.price.toFixed(2)}</td>
                                    <td>
                                        <span className={`${styles.badge} ${p.isPublic ? styles.badgeActive : ''}`}>
                                            {p.isPublic ? 'Público' : 'Rascunho'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
