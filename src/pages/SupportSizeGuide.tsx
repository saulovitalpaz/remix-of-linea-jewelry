import { useEffect } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

const SupportSizeGuide = () => {
    useEffect(() => {
        document.title = "Guia de Medidas - Chique Detalhes";
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="pt-6">
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <header className="mb-12 text-center">
                        <h1 className="text-4xl font-light text-foreground mb-4">Guia de Medidas</h1>
                        <p className="text-muted-foreground">Encontre o tamanho ideal para você.</p>
                    </header>

                    <div className="prose prose-lg max-w-none space-y-12 text-muted-foreground leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-light text-foreground mb-4">Anéis</h2>
                            <p>
                                Para medir seu anel, utilize uma fita métrica ou um barbante ao redor do dedo que deseja usar a peça. Marque o ponto de encontro e meça com uma régua.
                            </p>
                            <div className="overflow-x-auto mt-4">
                                <table className="w-full border-collapse border border-border">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="border border-border p-2">Aro</th>
                                            <th className="border border-border p-2">Medida (cm)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td className="border border-border p-2 text-center">12</td><td className="border border-border p-2 text-center">5.20</td></tr>
                                        <tr><td className="border border-border p-2 text-center">14</td><td className="border border-border p-2 text-center">5.40</td></tr>
                                        <tr><td className="border border-border p-2 text-center">16</td><td className="border border-border p-2 text-center">5.60</td></tr>
                                        <tr><td className="border border-border p-2 text-center">18</td><td className="border border-border p-2 text-center">5.80</td></tr>
                                        <tr><td className="border border-border p-2 text-center">20</td><td className="border border-border p-2 text-center">6.00</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-light text-foreground mb-4">Colares</h2>
                            <p>Nossos colares possuem diferentes comprimentos para se ajustar ao seu estilo:</p>
                            <ul className="list-disc list-inside space-y-2">
                                <li><strong>Choker:</strong> 35cm a 40cm (ajustado ao pescoço)</li>
                                <li><strong>Curto:</strong> 45cm a 50cm (altura da clavícula)</li>
                                <li><strong>Médio:</strong> 55cm a 60cm (altura do peito)</li>
                                <li><strong>Longo:</strong> 70cm ou mais</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-light text-foreground mb-4">Pulseiras</h2>
                            <p>
                                O tamanho padrão para pulseiras femininas é de 18cm a 19cm. Para saber sua medida, envolva o pulso com uma fita métrica sem apertar.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-light text-foreground mb-4">Bolsas</h2>
                            <p>
                                As dimensões de cada bolsa (altura x largura x profundidade) estão detalhadas na descrição individual de cada produto. Fique atento para escolher o tamanho que melhor atende suas necessidades diárias.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default SupportSizeGuide;
