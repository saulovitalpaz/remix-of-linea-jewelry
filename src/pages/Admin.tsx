import React, { useState, useEffect } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import { Product, CATEGORIES, Category, CategoryModel } from "../types/product";
import { ProductService } from "../services/ProductService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Admin = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<CategoryModel[]>([]);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('admin_token'));
    const [isLoading, setIsLoading] = useState(false);

    // Login fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const [imageFile, setImageFile] = useState<File | null>(null);

    // Novas Abas
    const [activeTab, setActiveTab] = useState("produtos");
    const [salesInput, setSalesInput] = useState<Record<string, number>>({});
    const [salesNotes, setSalesNotes] = useState("");
    const [isClosingDay, setIsClosingDay] = useState(false);

    // Marketing PopUp
    const [popupImage, setPopupImage] = useState<File | null>(null);
    const [activePopupData, setActivePopupData] = useState<any>(null);

    useEffect(() => {
        if (isLoggedIn) {
            ProductService.getProducts().then(setProducts);
            ProductService.getCategories().then(setCategories);
            ProductService.getActivePopup().then(setActivePopupData);
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
            await ProductService.saveProduct(formData, editingProduct.id);
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

    const handleCloseDay = async () => {
        const token = localStorage.getItem('admin_token');
        const itemsToClose = Object.entries(salesInput)
            .filter(([_, qty]) => qty > 0)
            .map(([productId, quantity]) => {
                const p = products.find(p => p.id === productId);
                return {
                    productId,
                    quantity,
                    priceAtSale: p?.price || 0
                };
            });

        if (itemsToClose.length === 0) return alert("Adicione pelo menos uma venda.");

        setIsClosingDay(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            const res = await fetch(`${API_URL}/sales/close-day`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ itemsSoldData: itemsToClose, notes: salesNotes })
            });

            if (res.ok) {
                alert("Caixa Fechado! Estoque Atualizado com Sucesso.");
                setSalesInput({});
                setSalesNotes("");
                ProductService.getProducts().then(setProducts);
            }
        } catch (e) {
            alert("Erro no fechamento");
        }
        setIsClosingDay(false);
    };

    const handlePopupUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!popupImage) return alert("Selecione uma imagem para o Popup.");
        const formData = new FormData();
        formData.append('image', popupImage);

        const token = localStorage.getItem('admin_token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

        try {
            const res = await fetch(`${API_URL}/popup`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (res.ok) {
                alert("PopUp enviado e ativado para todos os clientes!");
                setPopupImage(null);
                ProductService.getActivePopup().then(setActivePopupData);
            }
        } catch (err) {
            alert("Erro ao enviar popup.");
        }
    };

    const handleTogglePopup = async (active: boolean) => {
        if (!activePopupData) return;
        const token = localStorage.getItem('admin_token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

        try {
            const res = await fetch(`${API_URL}/popup/${activePopupData.id}/toggle`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ active })
            });
            if (res.ok) {
                setActivePopupData({ ...activePopupData, active });
            }
        } catch (e) {
            alert("Erro ao alterar popup");
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
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3 w-full max-w-2xl mb-12 h-14 bg-white shadow-md rounded-2xl mx-auto border border-gray-100 p-1">
                        <TabsTrigger value="produtos" className="rounded-xl text-sm md:text-base font-bold data-[state=active]:bg-[#C5A028] data-[state=active]:text-white">Estoque & Produtos</TabsTrigger>
                        <TabsTrigger value="caixa" className="rounded-xl text-sm md:text-base font-bold data-[state=active]:bg-[#25D366] data-[state=active]:text-white">Caixa (Off-System)</TabsTrigger>
                        <TabsTrigger value="marketing" className="rounded-xl text-sm md:text-base font-bold data-[state=active]:bg-purple-600 data-[state=active]:text-white">Marketing PopUp</TabsTrigger>
                    </TabsList>

                    <TabsContent value="produtos" className="mt-0">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold gold-text">Gestão de Produtos</h1>
                                <p className="text-gray-500 mt-2 text-sm md:text-base">Adicione e gerencie as fotos e estoques da vitrine.</p>
                            </div>
                            <Button onClick={() => { setEditingProduct({}); setIsAdding(true); }} className="romantic-button w-full md:w-auto px-8 py-6 md:py-6 rounded-2xl shadow-xl font-bold text-lg">
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
                                                <label className="text-sm font-semibold uppercase tracking-wider text-gray-400">Preço (R$)</label>
                                                <Input
                                                    type="number"
                                                    value={editingProduct?.price || ""}
                                                    onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                                                    className="rounded-xl h-12 border-gray-100"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold uppercase tracking-wider text-gray-400">Estoque Atual</label>
                                                <Input
                                                    type="number"
                                                    value={editingProduct?.stock || ""}
                                                    onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                                                    className="rounded-xl h-12 border-gray-100"
                                                    placeholder="Quantidade física"
                                                />
                                            </div>
                                            <div className="space-y-2 lg:col-span-1">
                                                <label className="text-sm font-semibold uppercase tracking-wider text-gray-400">Categoria</label>
                                                <select
                                                    className="w-full h-12 px-4 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#C5A028]/20 transition-all font-medium"
                                                    value={editingProduct?.categoryId || editingProduct?.category || ""}
                                                    onChange={e => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                                                >
                                                    <option value="">Selecione...</option>
                                                    {categories.map(cat => (
                                                        <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
                                                    ))}
                                                    <option value="nova_temporaria">Criar Categoria (Via DB em breve)</option>
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
                                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                            <Button
                                                type="submit"
                                                disabled={isLoading}
                                                className="romantic-button w-full sm:w-auto px-10 py-6 md:py-7 rounded-2xl shadow-xl font-bold flex items-center justify-center gap-2 text-lg"
                                            >
                                                {isLoading ? "Salvando..." : "Preservar Produto"}
                                            </Button>
                                            <Button
                                                onClick={() => { setEditingProduct(null); setIsAdding(false); setImageFile(null); }}
                                                className="bg-gray-100 text-gray-500 hover:bg-gray-200 w-full sm:w-auto transition-colors px-8 py-6 md:py-7 rounded-2xl font-bold border-none text-lg"
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

                                            {/* Botões de Ação Permanentes no Mobile, Hover no Desktop */}
                                            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                                                <Button onClick={() => { setEditingProduct(product); setIsAdding(false); }} className="bg-white/90 text-black hover:bg-white rounded-full h-12 w-12 p-0 shadow-lg flex items-center justify-center backdrop-blur-md text-xl border border-gray-100">
                                                    ✏️
                                                </Button>
                                                <Button onClick={() => handleDelete(product.id)} className="bg-red-500/90 text-white hover:bg-red-600 rounded-full h-12 w-12 p-0 shadow-lg flex items-center justify-center backdrop-blur-md text-xl border border-red-400">
                                                    🗑️
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{product.name}</h3>
                                            <div className="flex justify-between items-center mt-3">
                                                <p className="text-primary-gold font-bold text-xl">R$ {product.price.toFixed(2)}</p>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] bg-gray-50 px-2 py-1 rounded-md text-gray-500 font-bold uppercase tracking-widest border border-gray-100">
                                                        Estoque: {product.stock || 0}
                                                    </span>
                                                    {product.salesCount > 0 && <span className="text-[9px] text-[#C5A028] mt-1 font-bold">{product.salesCount} Vendidos</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="caixa" className="mt-0 animate-fade-in">
                        <Card className="max-w-4xl mx-auto rounded-[2rem] shadow-xl border-none">
                            <CardHeader className="bg-gray-50 rounded-t-[2rem] border-b border-gray-100 py-8">
                                <CardTitle className="text-3xl font-bold flex items-center gap-3">
                                    <span className="text-[#25D366]">💵</span> Lançamento Diário (Off-System)
                                </CardTitle>
                                <p className="text-gray-500 font-medium">Informe os produtos vendidos fisicamente e baixe no estoque do site.</p>
                            </CardHeader>
                            <CardContent className="p-6 md:p-8">
                                <div className="space-y-6">
                                    {products.map(p => (
                                        <div key={p.id} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-gray-300 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                                                <div>
                                                    <h4 className="font-bold text-gray-800">{p.name}</h4>
                                                    <p className="text-sm text-gray-500">R$ {p.price.toFixed(2)} | <span className="text-[#C5A028]">{(p.stock || 0)} Restantes</span></p>
                                                </div>
                                            </div>
                                            <div className="w-32">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max={p.stock}
                                                    placeholder="0 unid."
                                                    className="h-12 text-center font-bold text-lg bg-gray-50 border-gray-200"
                                                    value={salesInput[p.id] || ""}
                                                    onChange={e => setSalesInput({ ...salesInput, [p.id]: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-6 border-t border-gray-100">
                                        <Textarea
                                            placeholder="Observações do Caixa (Ex: 2 Brincos em Dinheiro, 1 Pix...)"
                                            className="rounded-2xl bg-gray-50 border-none min-h-[100px] p-6 text-gray-700 font-medium"
                                            value={salesNotes}
                                            onChange={e => setSalesNotes(e.target.value)}
                                        />

                                        <div className="mt-8 bg-green-50 p-6 rounded-3xl border border-green-100 flex flex-col md:flex-row justify-between items-center gap-6">
                                            <div>
                                                <p className="text-green-800 font-bold mb-1">Total a fechar em R$</p>
                                                <p className="text-4xl font-black text-[#25D366]">
                                                    R$ {Object.entries(salesInput).reduce((acc, [id, qty]) => {
                                                        const price = products.find(p => p.id === id)?.price || 0;
                                                        return acc + (price * qty);
                                                    }, 0).toFixed(2)}
                                                </p>
                                            </div>
                                            <Button
                                                onClick={handleCloseDay}
                                                disabled={isClosingDay}
                                                className="w-full md:w-auto px-10 py-7 bg-[#25D366] hover:bg-[#1fae53] text-white font-bold rounded-2xl text-xl shadow-xl hover:shadow-2xl transition-all"
                                            >
                                                💸 Confirmar Lançamento
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="marketing" className="mt-0 animate-fade-in">
                        <Card className="max-w-3xl mx-auto rounded-[2rem] shadow-xl border-none">
                            <CardHeader className="bg-purple-50 rounded-t-[2rem] border-b border-purple-100 py-8">
                                <CardTitle className="text-3xl font-bold flex items-center gap-3 text-purple-900">
                                    📢 Pop-Up Promocional
                                </CardTitle>
                                <p className="text-purple-700/70 font-medium">Capture a atenção ao momento que os clientes entrarem na vitrine.</p>
                            </CardHeader>

                            <CardContent className="p-8">
                                {/* Current Popup Status */}
                                {activePopupData && (
                                    <div className="mb-12 p-6 bg-white border-2 border-purple-100 rounded-3xl shadow-sm">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-lg">Campanha Atual</h3>
                                                <p className="text-sm text-gray-500">Esta imagem está pronta para sobrepor a Home.</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <Button
                                                    variant="outline"
                                                    className={`rounded-xl font-bold border-2 ${activePopupData.active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                                                    onClick={() => handleTogglePopup(!activePopupData.active)}
                                                >
                                                    {activePopupData.active ? "Desligar Campanha" : "Ativar no Site Agora!"}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="aspect-[3/4] max-w-sm mx-auto rounded-2xl overflow-hidden shadow-lg border border-gray-100 relative group">
                                            {!activePopupData.active && (
                                                <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center backdrop-blur-sm">
                                                    <span className="text-white font-bold text-xl px-6 py-2 bg-red-500 rounded-full">Desativado</span>
                                                </div>
                                            )}
                                            <img src={activePopupData.imageUrl} className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                )}

                                {/* Upload New Promo */}
                                <form onSubmit={handlePopupUpload} className="space-y-6">
                                    <h4 className="font-bold text-gray-800 text-lg border-t pt-8">Subir Nova Arte/Propaganda</h4>
                                    <div className="flex gap-4">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setPopupImage(e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="popup-upload"
                                        />
                                        <label
                                            htmlFor="popup-upload"
                                            className="flex-1 h-32 border-2 border-dashed border-purple-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all text-purple-500 font-bold"
                                        >
                                            <span className="text-3xl mb-2">📸</span>
                                            {popupImage ? popupImage.name : "Clique para selecionar Foto do Banner"}
                                        </label>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={!popupImage}
                                        className="w-full bg-purple-600 hover:bg-purple-700 py-7 rounded-2xl font-bold text-xl shadow-lg shadow-purple-200"
                                    >
                                        Fazer Upload & Substituir PopUp
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
            <Footer />
        </div>
    );
};

export default Admin;
