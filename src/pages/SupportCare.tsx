import { useEffect } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

const SupportCare = () => {
    useEffect(() => {
        document.title = "Cuidados - Chique Detalhes";
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="pt-6">
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <header className="mb-12 text-center">
                        <h1 className="text-4xl font-light text-foreground mb-4">Cuidados com suas Peças</h1>
                        <p className="text-muted-foreground">Saiba como manter o brilho e a qualidade dos seus acessórios por muito mais tempo.</p>
                    </header>

                    <div className="prose prose-lg max-w-none space-y-12 text-muted-foreground leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-light text-foreground mb-4">Semijoias e Bijuterias</h2>
                            <ul className="list-disc list-inside space-y-3">
                                <li><strong>Evite contato com químicos:</strong> Perfumes, cremes e produtos de limpeza podem oxidar o banho. Aplique perfume 10 minutos antes de colocar a peça.</li>
                                <li><strong>Não use no mar ou piscina:</strong> O cloro e o sal são altamente corrosivos para acessórios.</li>
                                <li><strong>Retire ao praticar exercícios:</strong> O suor excessivo pode alterar a cor do banho com o tempo.</li>
                                <li><strong>Armazenamento:</strong> Guarde suas peças individualmente em saquinhos de tecido ou divisórias para evitar atrito e nós em correntes.</li>
                                <li><strong>Limpeza:</strong> Utilize apenas uma flanela seca e macia após o uso.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-light text-foreground mb-4">Bolsas e Acessórios</h2>
                            <ul className="list-disc list-inside space-y-3">
                                <li>Evite exposição direta e prolongada ao sol para não desbotar o material.</li>
                                <li>Limpe apenas com um pano levemente umedecido e sabão neutro. Nunca utilize álcool.</li>
                                <li>Para manter o formato original, preencha a bolsa com papel de seda quando não estiver em uso.</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default SupportCare;
