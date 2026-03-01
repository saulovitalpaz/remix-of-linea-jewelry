import { useEffect } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";

const TermsOfService = () => {
  useEffect(() => {
    document.title = "Termos de Serviço - Linea Jewelry";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-6">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <header className="mb-12 text-center">
            <h1 className="text-4xl font-light text-foreground mb-4">Termos de Serviço</h1>
            <p className="text-muted-foreground">Última atualização: 15 de janeiro de 2024</p>
          </header>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Aceitação dos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ao acessar e utilizar o site e os serviços da Linea Jewelry Inc., você aceita e concorda em estar vinculado aos termos e disposições deste contrato. Estes Termos de Serviço regem o uso do nosso site, produtos e serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Licença de Uso</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                É concedida permissão para baixar temporariamente uma cópia dos materiais no site da Linea Jewelry Inc. apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título, e sob esta licença você não pode:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Modificar ou copiar os materiais</li>
                <li>Usar os materiais para qualquer finalidade comercial ou para exibição pública</li>
                <li>Tentar descompilar ou fazer engenharia reversa de qualquer software contido no site</li>
                <li>Remover quaisquer direitos autorais ou outras notações de propriedade dos materiais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Informações e Disponibilidade de Produtos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Esforçamo-nos para fornecer informações precisas sobre os produtos, incluindo descrições, preços e disponibilidade. No entanto, não garantimos que as descrições dos produtos ou outros conteúdos sejam precisos, completos, confiáveis ou livres de erros. Reservamo-nos o direito de modificar ou descontinuar produtos sem aviso prévio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Pedidos e Pagamento</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-light text-foreground mb-2">Aceitação de Pedidos</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Todos os pedidos estão sujeitos à aceitação e disponibilidade. Reservamo-nos o direito de recusar ou cancelar qualquer pedido por qualquer motivo, incluindo, mas não se limitando a, disponibilidade do produto, erros nas informações do produto ou suspeita de fraude.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-light text-foreground mb-2">Termos de Pagamento</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    O pagamento é devido no momento da compra. Aceitamos os principais cartões de crédito e outros métodos de pagamento conforme exibido durante o checkout. Todos os preços estão em USD, a menos que especificado de outra forma.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Envio e Entrega</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Faremos todos os esforços para enviar os pedidos dentro dos prazos especificados. No entanto, as datas de entrega são estimativas e não somos responsáveis por atrasos causados por transportadoras ou circunstâncias fora do nosso controle.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                O risco de perda e o título dos produtos passam para você após a entrega à transportadora. Não somos responsáveis por pacotes perdidos, roubados ou danificados depois de terem sido entregues no endereço fornecido.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Devoluções e Trocas</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Queremos que você esteja completamente satisfeito com sua compra. Devoluções e trocas são aceitas dentro de 30 dias após a entrega, sujeitas às seguintes condições:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Os itens devem estar na condição e embalagem originais</li>
                <li>Itens personalizados ou customizados são de venda final</li>
                <li>Os custos de envio de devolução são de responsabilidade do cliente</li>
                <li>Os reembolsos serão processados no método de pagamento original</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Garantia e Cuidados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nossas joias vêm com uma garantia limitada contra defeitos de fabricação. Esta garantia não cobre danos decorrentes de desgaste normal, cuidado inadequado ou acidentes. Instruções de cuidados adequados são fornecidas com cada compra e em nosso site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Propriedade Intelectual</h2>
              <p className="text-muted-foreground leading-relaxed">
                Todo o conteúdo deste site, incluindo, mas não se limitando a, textos, gráficos, logotipos, imagens e software, é de propriedade da Linea Jewelry Inc. e está protegido por leis de direitos autorais, marcas registradas e outras leis de propriedade intelectual. O uso não autorizado é proibido.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground leading-relaxed">
                Em hipótese alguma a Linea Jewelry Inc. ou seus fornecedores serão responsáveis por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro, ou devido à interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em nosso site ou produtos, mesmo que tenhamos sido notificados da possibilidade de tais danos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Política de Privacidade</h2>
              <p className="text-muted-foreground leading-relaxed">
                Sua privacidade é importante para nós. Por favor, revise nossa Política de Privacidade, que também rege o uso do nosso site e serviços, para entender nossas práticas em relação às suas informações pessoais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Lei Aplicável</h2>
              <p className="text-muted-foreground leading-relaxed">
                Estes termos e condições são regidos e interpretados de acordo com as leis do Estado de Nova York, e você se submete irrevogavelmente à jurisdição exclusiva dos tribunais naquele estado ou localidade.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Alterações nos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Reservamo-nos o direito de revisar estes Termos de Serviço a qualquer momento sem aviso prévio. Ao usar este site, você concorda em estar vinculado à versão atual destes Termos de Serviço.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-foreground mb-4">Informações de Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Se você tiver alguma dúvida sobre estes Termos de Serviço, entre em contato conosco em:
              </p>
              <div className="mt-4 text-muted-foreground">
                <p>E-mail: legal@lineajewelry.com</p>
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

export default TermsOfService;
