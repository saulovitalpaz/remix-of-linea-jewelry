import { useEffect } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = "Política de Privacidade - Linea Jewelry";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-6">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-light text-foreground mb-4">Política de Privacidade</h1>
            <p className="text-muted-foreground">Última atualização: 15 de janeiro de 2024</p>
          </header>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Introdução</h2>
              <p className="text-muted-foreground leading-relaxed">
                Na Linea Jewelry Inc. ("nós", "nosso" ou "conosco"), respeitamos a sua privacidade e estamos comprometidos em proteger seus dados pessoais. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você visita nosso site, realiza uma compra ou interage com nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Informações que Coletamos</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-light text-foreground mb-2">Informações Pessoais</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Podemos coletar informações pessoais que você nos fornece diretamente, incluindo:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                    <li>Nome, endereço de e-mail e informações de contato</li>
                    <li>Endereços de cobrança e entrega</li>
                    <li>Informações de pagamento (processadas de forma segura por provedores terceirizados)</li>
                    <li>Preferências de conta e configurações de comunicação</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-light text-foreground mb-2">Informações de Uso</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Coletamos automaticamente certas informações sobre seu dispositivo e padrões de uso, incluindo endereço IP, tipo de navegador, páginas visitadas e dados de interação para melhorar nossos serviços e a experiência do usuário.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Como Usamos Suas Informações</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Usamos as informações que coletamos para diversos fins, incluindo:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Processar e atender seus pedidos</li>
                <li>Fornecer suporte ao cliente e responder a consultas</li>
                <li>Enviar comunicações promocionais (com seu consentimento)</li>
                <li>Melhorar a funcionalidade do nosso site e a experiência do usuário</li>
                <li>Prevenir fraudes e garantir a segurança</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Compartilhamento e Divulgação de Informações</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Não vendemos, trocamos ou alugamos suas informações pessoais para terceiros. Podemos compartilhar suas informações apenas nas seguintes circunstâncias:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Com prestadores de serviços que nos auxiliam na operação do nosso negócio</li>
                <li>Quando exigido por lei ou para proteger nossos direitos</li>
                <li>Em conexão com uma transação comercial (fusão, aquisição, etc.)</li>
                <li>Com seu consentimento explícito</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Segurança de Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Implementamos medidas técnicas e organizacionais apropriadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum método de transmissão pela internet ou armazenamento eletrônico é 100% seguro.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Seus Direitos e Escolhas</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Dependendo da sua localização, você pode ter certos direitos em relação às suas informações pessoais:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Acesso às suas informações pessoais</li>
                <li>Correção de informações imprecisas ou incompletas</li>
                <li>Exclusão de suas informações pessoais</li>
                <li>Oposição ou restrição ao processamento</li>
                <li>Portabilidade de dados</li>
                <li>Retirada de consentimento (quando aplicável)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Cookies e Rastreamento</h2>
              <p className="text-muted-foreground leading-relaxed">
                Usamos cookies e tecnologias de rastreamento semelhantes para melhorar sua experiência de navegação, analisar o tráfego do site e personalizar o conteúdo. Você pode controlar as configurações de cookies através das preferências do seu navegador, embora isso possa afetar a funcionalidade do site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Alterações nesta Política</h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos atualizar esta Política de Privacidade de tempos em tempos. Notificaremos você sobre quaisquer alterações significativas publicando a nova política em nosso site e atualizando a data de "Última atualização" acima.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Se você tiver alguma dúvida sobre esta Política de Privacidade ou nossas práticas de privacidade, entre em contato conosco em:
              </p>
              <div className="mt-4 text-muted-foreground">
                <p>E-mail: privacy@lineajewelry.com</p>
                <p>Telefone: (77) 98859-0306</p>
                <p>Endereço: Av. Juracy Magalhães, 3340 - Quiosque 115, Boa Vista, Vitória da Conquista - BA</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
