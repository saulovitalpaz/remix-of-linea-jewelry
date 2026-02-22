import React, { useState, useEffect } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { Product, CATEGORIES, Category } from "../types/product";
import { ProductService } from "../services/ProductService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Admin = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        setProducts(ProductService.getProducts());
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct?.name || !editingProduct?.price || !editingProduct?.category) return;

        const productToSave: Product = {
            id: editingProduct.id || Date.now().toString(),
            name: editingProduct.name,
            price: Number(editingProduct.price),
            category: editingProduct.category as Category,
            description: editingProduct.description || "",
            imageUrl: editingProduct.imageUrl || "/quioske.jpeg",
            isPublic: true,
            createdAt: editingProduct.createdAt || new Date().toISOString(),
        };

        const updatedProducts = ProductService.saveProduct(productToSave);
        setProducts(updatedProducts);
        setEditingProduct(null);
        setIsAdding(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir este produto?")) {
            const updatedProducts = ProductService.deleteProduct(id);
            setProducts(updatedProducts);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-6 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Gerenciamento de Produtos</h1>
                    <Button onClick={() => { setEditingProduct({}); setIsAdding(true); }}>
                        Adicionar Produto
                    </Button>
                </div>

                {(isAdding || editingProduct?.id) && (
                    <Card className="mb-12 gold-border animate-fade-in">
                        <CardHeader>
                            <CardTitle>{isAdding ? "Novo Produto" : "Editar Produto"}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Nome</label>
                                        <Input
                                            value={editingProduct?.name || ""}
                                            onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                            placeholder="Nome do produto"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Preço (R$)</label>
                                        <Input
                                            type="number"
                                            value={editingProduct?.price || ""}
                                            onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Categoria</label>
                                        <select
                                            className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md text-sm"
                                            value={editingProduct?.category || ""}
                                            onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value as Category })}
                                        >
                                            <option value="">Selecione...</option>
                                            {Object.keys(CATEGORIES).map(cat => (
                                                <option key={cat} value={cat}>{CATEGORIES[cat as Category]}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">URL da Imagem</label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={editingProduct?.imageUrl || ""}
                                                onChange={e => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                                                placeholder="/quioske.jpeg"
                                                className="flex-1"
                                            />
                                            {editingProduct?.imageUrl && (
                                                <div className="h-10 w-10 rounded border overflow-hidden shrink-0">
                                                    <img src={editingProduct.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground italic mt-1">* Simulação: cole a URL da imagem acima.</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Descrição</label>
                                    <Textarea
                                        value={editingProduct?.description || ""}
                                        onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                        placeholder="Detalhes do produto"
                                        rows={4}
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Salvar Alterações</Button>
                                    <Button onClick={() => { setEditingProduct(null); setIsAdding(false); }} className="bg-gray-200 text-black hover:bg-gray-300 transition-colors px-4 py-2 rounded-md text-sm">Cancelar</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                        <Card key={product.id} className="relative group product-card">
                            <CardContent className="p-4">
                                <div className="aspect-square mb-4 overflow-hidden rounded-lg product-image-container">
                                    <img src={product.imageUrl || "/quioske.jpeg"} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="font-bold text-lg">{product.name}</h3>
                                <p className="text-primary-gold font-bold">R$ {product.price.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground uppercase mt-1">{CATEGORIES[product.category]}</p>

                                <div className="flex gap-2 mt-4">
                                    <Button onClick={() => { setEditingProduct(product); setIsAdding(false); }} className="bg-primary text-white px-3 py-1 text-xs rounded">Editar</Button>
                                    <Button onClick={() => handleDelete(product.id)} className="bg-destructive text-white px-3 py-1 text-xs rounded">Excluir</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Admin;
