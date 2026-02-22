import { useEffect } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

const SupportShipping = () => {
    useEffect(() => {
        document.title = "Envios - Chique Detalhes";
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="pt-6">
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <header className="mb-12 text-center">
                        <h1 className="text-4xl font-light text-foreground mb-4">Política de Envios</h1>
                        <p className="text-muted-foreground">Como fazemos seu pedido chegar com carinho e segurança.</p>
                    </header>

                    <div className="prose prose-lg max-w-none space-y-12 text-muted-foreground leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-light text-foreground mb-4">Prazos de Entrega</h2>
                            <p>
                                Após a confirmação do pagamento, temos um prazo de até <strong>2 dias úteis</strong> para a postagem do seu pedido. O prazo total de entrega dependerá da sua região e da modalidade de frete escolhida (PAC, SEDEX ou transportadora).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-light text-foreground mb-4">Rastreamento</h2>
                            <p>
                                Assim que seu pedido for postado, você receberá um código de rastreamento por WhatsApp ou E-mail para acompanhar cada passo da entrega.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-light text-foreground mb-4">Áreas de Entrega</h2>
                            <p>
                                Entregamos em todo o território nacional através dos Correios e transportadoras parceiras (Jadlog, Loggi).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-light text-foreground mb-4">Frete Grátis</h2>
                            <p>
                                Fique atento às nossas campanhas sazonais de frete grátis para determinadas regiões ou valores mínimos de compra, informados na barra de avisos da loja.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default SupportShipping;
