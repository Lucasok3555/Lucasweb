import React, { useState } from "react";

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8 text-indigo-600"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17V5l7 6-7 6z" />
            </svg>
            <span className="text-xl font-bold text-gray-900">Lightstream</span>
          </div>

          <nav className="hidden md:flex space-x-8 text-sm font-medium">
            <a href="#features" className="hover:text-indigo-600 transition-colors">
              Funcionalidades
            </a>
            <a href="#platforms" className="hover:text-indigo-600 transition-colors">
              Plataformas
            </a>
            <a href="#integrations" className="hover:text-indigo-600 transition-colors">
              Integrações
            </a>
            <a href="#analytics" className="hover:text-indigo-600 transition-colors">
              Análise
            </a>
            <a href="#security" className="hover:text-indigo-600 transition-colors">
              Segurança
            </a>
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <nav className="flex flex-col p-4 space-y-4 text-sm font-medium">
              <a
                href="#features"
                className="hover:text-indigo-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Funcionalidades
              </a>
              <a
                href="#platforms"
                className="hover:text-indigo-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Plataformas
              </a>
              <a
                href="#integrations"
                className="hover:text-indigo-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Integrações
              </a>
              <a
                href="#analytics"
                className="hover:text-indigo-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Análise
              </a>
              <a
                href="#security"
                className="hover:text-indigo-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Segurança
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-indigo-50 to-white">
        <div className="container mx-auto px-4 flex flex-col-reverse md:flex-row items-center">
          <div className="md:w-1/2 mt-10 md:mt-0">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Stream profissional sem complicações
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md">
              Crie e transmita conteúdo de alta qualidade diretamente do seu navegador para Twitch, YouTube, Facebook e muito mais.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
                Começar agora
              </button>
              <button className="px-6 py-3 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors shadow-md">
                Ver demonstração
              </button>
            </div>
          </div>
          <div className="md:w-1/2">
            <img
              src="https://picsum.photos/id/10/600/400" 
              alt="Interface do Lightstream"
              className="rounded-lg shadow-xl w-full max-w-lg mx-auto transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Funcionalidades poderosas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Transmissão Multiplataforma",
                description:
                  "Transmita simultaneamente para Twitch, YouTube, Facebook, LinkedIn, Kick, Restream e outras plataformas.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621a3 3 0 01-.879-2.122V17.25M12 12l-3-3m0 0l3-3m-3 3h6m-1.5 1.5L21 12m-1.5 1.5L12 21m-7.5-7.5L12 6"
                    />
                  </svg>
                ),
              },
              {
                title: "Elementos Visuais Flexíveis",
                description:
                  "Adicione webcam, imagens, textos personalizados, telas de apresentação e alertas ao vivo com arrastar e soltar.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41A2.25 2.25 0 0118.99 12H5.25a2.25 2.25 0 00-1.591 3.75z"
                    />
                  </svg>
                ),
              },
              {
                title: "Gravação na Nuvem",
                description:
                  "Grave automaticamente suas transmissões na nuvem para revisão ou publicação posterior.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                    />
                  </svg>
                ),
              },
              {
                title: "Controle Remoto",
                description:
                  "Inicie, pare ou altere elementos da transmissão remotamente via dispositivo móvel ou outro computador.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                    />
                  </svg>
                ),
              },
              {
                title: "Modo Studio",
                description:
                  "Visualize previamente suas cenas antes de colocá-las no ar para transições suaves e controladas.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.113z"
                    />
                  </svg>
                ),
              },
              {
                title="Legendas ao Vivo",
                description:
                  "Aumente a acessibilidade com legendas ao vivo, alcançando um público maior, inclusive espectadores silenciosos.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                ),
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gray-50 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section id="platforms" className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Plataformas Suportadas</h2>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
            {["Twitch", "YouTube", "Facebook", "LinkedIn", "Kick", "Restream"].map(
              (platform, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center min-w-[120px]"
                >
                  <span className="font-medium text-gray-700">{platform}</span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Integrações</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Alertas em Tempo Real</h3>
              <ul className="space-y-2 text-gray-600 list-disc pl-5">
                <li>Novos seguidores</li>
                <li>Doações</li>
                <li>Assinaturas</li>
                <li>Presentes (Gifts)</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Fontes Externas</h3>
              <ul className="space-y-2 text-gray-600 list-disc pl-5">
                <li>Câmeras USB ou webcams</li>
                <li>Microfones e dispositivos de áudio</li>
                <li>Telas compartilhadas ou janelas específicas</li>
                <li>Fontes via NDI (Network Device Interface)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics */}
      <section id="analytics" className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <img
                src="https://picsum.photos/id/12/600/400" 
                alt="Análise de métricas"
                className="rounded-lg shadow-lg w-full max-w-md mx-auto"
              />
            </div>
            <div className="md:w-1/2 md:pl-12">
              <h2 className="text-3xl font-bold mb-6">Análise Detalhada</h2>
              <p className="text-gray-600 mb-6">
                Após cada transmissão, o Lightstream fornece dados detalhados sobre:
              </p>
              <ul className="space-y-2 text-gray-600 list-disc pl-5">
                <li>Duração da transmissão</li>
                <li>Qualidade do sinal</li>
                <li>Conexão e latência</li>
                <li>Público médio e pico de espectadores</li>
              </ul>
              <p className="text-gray-600 mt-6">
                Essas métricas ajudam você a entender o desempenho e melhorar futuras transmissões.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row-reverse items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <img
                src="https://picsum.photos/id/14/600/400" 
                alt="Segurança"
                className="rounded-lg shadow-lg w-full max-w-md mx-auto"
              />
            </div>
            <div className="md:w-1/2 md:pr-12">
              <h2 className="text-3xl font-bold mb-6">Segurança Profissional</h2>
              <p className="text-gray-600 mb-6">
                O Lightstream garante transmissões seguras com criptografia de ponta a ponta e controle rigoroso de acesso às contas.
              </p>
              <ul className="space-y-2 text-gray-600 list-disc pl-5">
                <li>Criptografia de ponta a ponta</li>
                <li>Controle rigoroso de acesso</li>
                <li>Proteção de dados pessoais e empresariais</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para começar?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Experimente o Lightstream gratuitamente e leve suas transmissões ao próximo nível.
          </p>
          <button className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
            Começar Agora
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 text-indigo-400"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17V5l7 6-7 6z" />
                </svg>
                <span className="text-xl font-bold">Lightstream</span>
              </div>
              <p className="text-gray-400 max-w-xs">
                Ferramenta de streaming profissional baseada na nuvem.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold mb-4">Produtos</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Transmissão
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Gravação
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Modo Studio
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Suporte</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Documentação
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Ajuda
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Contato
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Empresa</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Sobre
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Carreiras
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Lightstream. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}