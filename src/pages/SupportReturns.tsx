import { useEffect } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

const SupportReturns = () => {
    useEffect(() => {
        document.title = "Trocas & Devoluções - Chique Detalhes";
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="pt-6">
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <header className="mb-12 text-center">
                        <h1 className="text-4xl font-light text-foreground mb-4">Política de Trocas & Devoluções</h1>
                        <p className="text-muted-foreground">Transparência e respeito ao consumidor.</p>
                    </header>

                    <div className="prose prose-lg max-w-none space-y-12 text-muted-foreground leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-light text-foreground mb-4">Arrependimento de Compra</h2>
                            <p>
                                De acordo com o Código de Defesa do Consumidor, você tem até <strong>7 dias corridos</strong> após o recebimento do produto para solicitar a devolução por arrependimento. O produto deve estar em perfeitas condições e com a etiqueta fixada.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-light text-foreground mb-4">Trocas por Defeito</h2>
                            <p>
                                Caso sua peça apresente algum defeito de fabricação, o prazo para solicitação de troca é de <strong>30 dias</strong>. A garantia não cobre danos causados por mau uso (quedas, contato com químicos ou falta de cuidados básicos).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-light text-foreground mb-4">Como solicitar</h2>
                            <p>
                                Para iniciar o processo de troca ou devolução, entre em contato através do nosso WhatsApp: <strong>(77) 98859-0306</strong> informando o número do pedido e o motivo da solicitação.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default SupportReturns;
