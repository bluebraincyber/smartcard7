'use client'

import Link from 'next/link'
import { Store, Smartphone, MessageCircle, BarChart3, User } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

export default function HomePage() {
  const { data: session, status } = useSession()
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Store className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-2xl font-bold text-foreground">SmartCard</h1>
            </Link>
            <div className="flex items-center space-x-4">
              {status === 'loading' ? (
                <div className="flex items-center space-x-4">
                  <div className="animate-pulse bg-muted h-8 w-16 rounded"></div>
                  <div className="animate-pulse bg-muted h-8 w-20 rounded"></div>
                </div>
              ) : session ? (
                <div className="flex items-center space-x-4">
                  <span className="text-foreground hidden sm:inline">Olá, {session.user?.name || session.user?.email}</span>
                  <Link
                    href="/dashboard"
                    className="flex items-center text-primary hover:opacity-80 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <User className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Meu Painel</span>
                    <span className="sm:hidden">Painel</span>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-opacity shadow-sm"
                  >
                    Criar Conta
                  </Link>
                </>
              )}
              
              {/* Fallback - sempre mostrar opções de login se algo der errado */}
              {status !== 'loading' && !session && (
                <div className="flex items-center space-x-2 ml-2">
                  <span className="text-xs text-muted-foreground">|</span>
                  <Link
                    href="/auth/login"
                    className="text-xs text-primary hover:opacity-80"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-foreground sm:text-5xl md:text-6xl">
            <span className="block">Cartão Digital</span>
            <span className="block text-primary">Inteligente</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Crie seu catálogo digital em minutos. Seus clientes navegam, escolhem e enviam pedidos direto no WhatsApp.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                href="/auth/register"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:opacity-90 md:py-4 md:text-lg md:px-10 transition-opacity"
              >
                Começar Agora
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link
                href="/auth/login"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-card hover:bg-muted md:py-4 md:text-lg md:px-10 border-2 border-primary transition-colors"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
          
          {/* Link de login adicional */}
          <div className="mt-4 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-primary hover:opacity-80 underline"
            >
              Acessar minha conta existente
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground mb-4">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                100% Mobile
              </h3>
              <p className="text-muted-foreground">
                Otimizado para dispositivos móveis. Seus clientes acessam facilmente pelo celular.
              </p>
            </div>

            <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-secondary text-secondary-foreground mb-4">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Integração WhatsApp
              </h3>
              <p className="text-muted-foreground">
                Pedidos são enviados automaticamente para seu WhatsApp com todas as informações.
              </p>
            </div>

            <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-accent text-accent-foreground mb-4">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Analytics Simples
              </h3>
              <p className="text-muted-foreground">
                Acompanhe visitas, cliques e performance do seu cartão digital.
              </p>
            </div>
          </div>
        </div>

        {/* Demo Section */}
        <div id="demo" className="mt-20 bg-card rounded-lg shadow-lg p-8 border border-border">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-foreground mb-4">
              Como Funciona
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Seu cartão digital personalizado com sua própria URL
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Cliente Acessa
                </h3>
                <p className="text-muted-foreground">
                  Pelo link ou QR Code do seu cartão digital
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Escolhe Produtos
                </h3>
                <p className="text-muted-foreground">
                  Navega pelo catálogo e seleciona os itens desejados
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Envia no WhatsApp
                </h3>
                <p className="text-muted-foreground">
                  Mensagem formatada é enviada automaticamente
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-extrabold text-foreground mb-4">
            Pronto para começar?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Crie seu cartão digital em menos de 5 minutos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:opacity-90 transition-opacity"
            >
              Criar Meu Cartão Digital
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center px-8 py-3 border-2 border-primary text-base font-medium rounded-md text-primary bg-card hover:bg-muted transition-colors"
            >
              Fazer Login
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 SmartCard. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}