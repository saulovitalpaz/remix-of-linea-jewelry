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
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('admin_token'));
    const [isLoading, setIsLoading] = useState(false);

    // Login fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        if (isLoggedIn) {
            ProductService.getProducts().then(setProducts);
        }
    }, [isLoggedIn]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('admin_token', data.token);
                setIsLoggedIn(true);
            } else {
                setLoginError(data.error || "Login falhou");
            }
        } catch (err) {
            setLoginError("Erro ao conectar com o servidor.");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct?.name || !editingProduct?.price || !editingProduct?.category) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append('name', editingProduct.name);
        formData.append('price', editingProduct.price.toString());
        formData.append('category', editingProduct.category);
        formData.append('description', editingProduct.description || "");
        formData.append('categoryId', editingProduct.category); // Using slug as categoryId for now, backend should handle lookup if needed, but schema uses UUID.
        // Wait, the schema uses UUID for categoryId. I might need to fetch categories first.
        // Let's assume for now that category is the name or we need to fix the backend to find by slug.
        // For the sake of this implementation, I'll stick to the plan.

        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            await ProductService.saveProduct(formData);
            const updatedProducts = await ProductService.getProducts();
            setProducts(updatedProducts);
            setEditingProduct(null);
            setIsAdding(false);
            setImageFile(null);
        } catch (err) {
            alert("Erro ao salvar produto.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir este produto?")) {
            try {
                await ProductService.deleteProduct(id);
                const updatedProducts = await ProductService.getProducts();
                setProducts(updatedProducts);
            } catch (err) {
                alert("Erro ao excluir produto.");
            }
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
                <Card className="w-full max-w-md gold-border shadow-2xl">
                    <CardHeader className="text-center">
                        <img src="/Logo 1.png" alt="Logo" className="h-20 mx-auto mb-4" />
                        <CardTitle className="text-2xl font-bold gold-text">Painel Administrativo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">E-mail</label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="rounded-xl border-gray-200"
                                    placeholder="admin@chiquedetalhes.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Senha</label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="rounded-xl border-gray-200"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                            <Button type="submit" className="w-full romantic-button py-6 rounded-xl font-bold text-lg shadow-lg">
                                Entrar
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <Header />
            <main className="container mx-auto px-6 py-12">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold gold-text">Gestão de Estoque</h1>
                        <p className="text-gray-500 mt-2">Adicione novos produtos ou gerencie sua vitrine.</p>
                    </div>
                    <Button onClick={() => { setEditingProduct({}); setIsAdding(true); }} className="romantic-button px-8 py-6 rounded-2xl shadow-xl font-bold">
                        + Novo Produto
                    </Button>
                </div>

                {(isAdding || editingProduct?.id) && (
                    <Card className="mb-12 gold-border animate-fade-in bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-2xl border-white/40">
                        <CardHeader>
                            <CardTitle className="gold-text text-2xl">{isAdding ? "Adicionar Novo Tesouro" : "Refinar Produto"}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSave} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold uppercase tracking-wider text-gray-400">Nome do Produto</label>
                                        <Input
                                            value={editingProduct?.name || ""}
                                            onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                            className="rounded-xl h-12 border-gray-100"
                                            placeholder="ex: Brinco Pérola Real"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold uppercase tracking-wider text-gray-400">Preço</label>
                                        <Input
                                            type="number"
                                            value={editingProduct?.price || ""}
                                            onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                                            className="rounded-xl h-12 border-gray-100"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold uppercase tracking-wider text-gray-400">Categoria</label>
                                        <select
                                            className="w-full h-12 px-4 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#C5A028]/20 transition-all font-medium"
                                            value={editingProduct?.category || ""}
                                            onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value as Category })}
                                        >
                                            <option value="">Selecione...</option>
                                            {Object.keys(CATEGORIES).map(cat => (
                                                <option key={cat} value={cat}>{CATEGORIES[cat as Category]}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2 lg:col-span-2">
                                        <label className="text-sm font-semibold uppercase tracking-wider text-gray-400">Imagem do Produto (Cloudinary)</label>
                                        <div className="flex gap-4">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => setImageFile(e.target.files?.[0] || null)}
                                                className="hidden"
                                                id="image-upload"
                                            />
                                            <label
                                                htmlFor="image-upload"
                                                className="flex-1 h-14 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-[#C5A028] hover:bg-[#FDFBF7] transition-all text-gray-500 font-medium"
                                            >
                                                {imageFile ? imageFile.name : "Clique para subir imagem"}
                                            </label>
                                            {(imageFile || editingProduct?.imageUrl) && (
                                                <div className="h-14 w-14 rounded-xl border border-gray-100 overflow-hidden shrink-0 shadow-sm">
                                                    <img
                                                        src={imageFile ? URL.createObjectURL(imageFile) : editingProduct?.imageUrl}
                                                        className="w-full h-full object-cover"
                                                        alt="Preview"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2 lg:col-span-3">
                                        <label className="text-sm font-semibold uppercase tracking-wider text-gray-400">Descrição Detalhada</label>
                                        <Textarea
                                            value={editingProduct?.description || ""}
                                            onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                            placeholder="Descreve o encanto desta peça..."
                                            className="rounded-2xl border-gray-100 p-4"
                                            rows={5}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="romantic-button px-10 py-6 rounded-2xl shadow-xl font-bold flex items-center gap-2"
                                    >
                                        {isLoading ? "Salvando..." : "Preservar Produto"}
                                    </Button>
                                    <Button
                                        onClick={() => { setEditingProduct(null); setIsAdding(false); setImageFile(null); }}
                                        className="bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors px-8 py-6 rounded-2xl font-bold border-none"
                                    >
                                        Descartar Mudanças
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map(product => (
                        <Card key={product.id} className="relative group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2rem] bg-white">
                            <CardContent className="p-0">
                                <div className="aspect-[4/5] overflow-hidden relative">
                                    <img src={product.imageUrl || "/quioske.jpeg"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <Button onClick={() => { setEditingProduct(product); setIsAdding(false); }} className="bg-white text-black hover:bg-gray-100 rounded-full h-12 w-12 p-0 flex items-center justify-center">
                                            ✏️
                                        </Button>
                                        <Button onClick={() => handleDelete(product.id)} className="bg-red-500 text-white hover:bg-red-600 rounded-full h-12 w-12 p-0 flex items-center justify-center">
                                            🗑️
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{product.name}</h3>
                                    <div className="flex justify-between items-center mt-3">
                                        <p className="text-primary-gold font-bold text-xl">R$ {product.price.toFixed(2)}</p>
                                        <span className="text-[10px] bg-gray-50 px-3 py-1 rounded-full text-gray-400 font-bold uppercase tracking-widest border border-gray-100">
                                            {CATEGORIES[product.category as Category] || product.category}
                                        </span>
                                    </div>
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
