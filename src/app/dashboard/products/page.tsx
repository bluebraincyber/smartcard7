'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Store, Package, Plus, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useStores } from '@/hooks/useStores'

interface Store {
  id: string
  name: string
  slug: string
  isActive: boolean
  categories: number
  products: number
  views30d?: number
  updatedAt?: string
  // Add any other missing properties that might be used in the StoreCard component
}

interface ErrorState {
  message: string;
  retry?: () => void;
}

export default function ProductsPage() {
  const router = useRouter()
  const { stores, loading, error, refetch: fetchStores, hasMultipleStores } = useStores()
  const [errorState, setErrorState] = useState<ErrorState | null>(null)

  // Handle errors from useStores
  useEffect(() => {
    if (error) {
      setErrorState({
        message: 'Erro ao carregar as lojas. Por favor, tente novamente.',
        retry: fetchStores
      })
    }
  }, [error, fetchStores])

  const handleStoreSelect = (storeId: string) => {
    try {
      // CORREÇÃO: Redirecionar para a página principal da loja, não para products
      router.push(`/dashboard/store/${storeId}`)
    } catch (error) {
      console.error('Navigation error:', error)
      setErrorState({
        message: 'Erro ao navegar para a loja. Por favor, tente novamente.'
      })
    }
  }

  const activeStores = stores?.filter(store => store.isActive) || []
  const inactiveStores = stores?.filter(store => !store.isActive) || []
  
  const handleRetry = () => {
    setErrorState(null)
    fetchStores()
  }

  if (errorState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-border text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10 mb-6">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-3">Ocorreu um erro</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">{errorState.message}</p>
          {errorState.retry && (
            <button
              onClick={handleRetry}
              className="btn-primary w-full"
            >
              Tentar novamente
            </button>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-border border-t-primary"></div>
              <div className="absolute inset-0 rounded-full bg-primary opacity-20 animate-pulse"></div>
            </div>
            <span className="mt-4 text-foreground font-medium">Carregando suas lojas...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - Layout Melhorado */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-card hover:bg-muted rounded-xl shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm border border-border"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content - Layout Centralizado e Melhorado */}
        <div className="max-w-5xl mx-auto">
          {/* Hero Section - Design Melhorado */}
          <div className="text-center mb-12">
            <div className="relative mb-8">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-primary shadow-lg mb-6">
                <Package className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 bg-primary opacity-20 rounded-full blur-xl scale-150"></div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Gerenciar Produtos
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Escolha uma loja para gerenciar categorias, produtos e visualizar dados de desempenho
            </p>
          </div>

          {/* Store Selection - Layout Aprimorado */}
          {stores.length === 0 ? (
            /* No Stores - Design Melhorado */
            <div className="bg-card backdrop-blur-sm rounded-3xl shadow-xl border border-border p-12 mb-8 text-center">
              <div className="mb-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-muted mb-6">
                  <Store className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">
                  Nenhuma loja criada
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                  Para começar a gerenciar produtos, você precisa criar sua primeira loja digital
                </p>
              </div>
              <Link
                href="/dashboard/store/new"
                className="btn-primary inline-flex items-center px-8 py-4 text-lg"
              >
                <Plus className="mr-3 h-6 w-6" />
                Criar Primeira Loja
              </Link>
            </div>
          ) : (
            /* Store Selection - Grid Responsivo Melhorado */
            <div className="bg-card backdrop-blur-sm rounded-3xl shadow-xl border border-border p-8 mb-12">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  {hasMultipleStores ? 'Selecione uma Loja' : 'Sua Loja'}
                </h2>
                <p className="text-muted-foreground">
                  {hasMultipleStores 
                    ? 'Clique em uma loja para gerenciar seus produtos' 
                    : 'Gerencie os produtos da sua loja'
                  }
                </p>
              </div>
              
              {/* Store Cards Grid - Layout Aprimorado */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {/* Active Stores */}
                {activeStores.map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    onClick={() => handleStoreSelect(store.id)}
                  />
                ))}
                
                {/* Inactive Stores */}
                {inactiveStores.map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    onClick={() => handleStoreSelect(store.id)}
                    inactive
                  />
                ))}
                
                {/* Create New Store Card */}
                <CreateStoreCard />
              </div>
            </div>
          )}

          {/* Quick Actions - Layout em Grid Melhorado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <QuickActionCard
              href="/dashboard/store/new"
              icon={Plus}
              title="Nova Loja"
              description="Crie uma nova loja digital para expandir seus negócios"
              color="green"
            />

            <QuickActionCard
              href="/dashboard/analytics"
              icon={TrendingUp}
              title="Analytics"
              description="Visualize dados de desempenho e vendas das suas lojas"
              color="purple"
            />

            <QuickActionCard
              href="/dashboard"
              icon={Store}
              title="Dashboard"
              description="Visão geral de todas as suas lojas e métricas"
              color="blue"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Store Card Component - Design Aprimorado
function StoreCard({ 
  store, 
  onClick, 
  inactive = false 
}: { 
  store: Store
  onClick: () => void
  inactive?: boolean 
}) {
  return (
    <div className="group relative">
      {/* Hover Background Effect */}
      <div className="absolute inset-0 bg-muted/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-105"></div>
      
      <button
        onClick={onClick}
        className={`w-full h-full flex flex-col bg-card backdrop-blur-sm p-6 rounded-2xl shadow-lg border hover:shadow-2xl transition-all duration-300 text-left group-hover:border-primary/50 ${
          inactive 
            ? 'border-border opacity-75 hover:opacity-100' 
            : 'border-border'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
              inactive 
                ? 'bg-muted' 
                : 'bg-primary group-hover:bg-primary/90 group-hover:shadow-lg'
            }`}>
              <Store className={`w-7 h-7 transition-colors ${
                inactive 
                  ? 'text-muted-foreground' 
                  : 'text-primary-foreground'
              }`} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary truncate transition-colors mb-1">
                {store.name}
              </h3>
              <p className="text-sm text-muted-foreground group-hover:text-foreground font-medium transition-colors">
                /{store.slug}
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
            store.isActive
              ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 group-hover:bg-green-200 group-hover:border-green-300 dark:group-hover:bg-green-900/30'
              : 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 group-hover:bg-amber-200 group-hover:border-amber-300 dark:group-hover:bg-amber-900/30'
          }`}>
            {store.isActive ? 'Ativa' : 'Inativa'}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-muted rounded-xl p-4 text-center group-hover:bg-muted/70 transition-all duration-300 shadow-sm group-hover:shadow">
            <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors mb-1">
              {store.categories || 0}
            </div>
            <div className="text-xs font-medium text-muted-foreground group-hover:text-foreground uppercase tracking-wider transition-colors">
              Categorias
            </div>
          </div>
          <div className="bg-muted rounded-xl p-4 text-center group-hover:bg-muted/70 transition-all duration-300 shadow-sm group-hover:shadow">
            <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors mb-1">
              {store.products || 0}
            </div>
            <div className="text-xs font-medium text-muted-foreground group-hover:text-foreground uppercase tracking-wider transition-colors">
              Produtos
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-border group-hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              <span className="inline-flex items-center">
                <svg className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                {store.views30d ? `${store.views30d} views` : 'Sem views'}
              </span>
            </div>
            <span className={`inline-flex items-center text-sm font-medium transition-all duration-200 ${
              inactive 
                ? 'text-muted-foreground' 
                : 'text-primary group-hover:text-primary/80'
            }`}>
              Gerenciar
              <svg className="w-4 h-4 ml-1 -mr-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </button>
    </div>
  )
}

// Create Store Card Component - Design Aprimorado
function CreateStoreCard() {
  return (
    <div className="group relative">
      {/* Hover Background Effect */}
      <div className="absolute inset-0 bg-secondary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-105"></div>
      
      <Link
        href="/dashboard/store/new"
        className="w-full h-full flex flex-col items-center justify-center bg-card backdrop-blur-sm p-6 rounded-2xl shadow-lg border-2 border-dashed border-border hover:border-secondary/50 hover:shadow-2xl transition-all duration-300 text-center min-h-[280px]"
      >
        <div className="w-16 h-16 rounded-2xl bg-secondary group-hover:bg-secondary/90 flex items-center justify-center mb-6 transition-all duration-300 shadow-md group-hover:shadow-lg">
          <Plus className="w-7 h-7 text-secondary-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground group-hover:text-secondary mb-3 transition-colors">
          Nova Loja
        </h3>
        <p className="text-sm text-muted-foreground group-hover:text-foreground mb-6 max-w-[200px] mx-auto leading-relaxed transition-colors">
          Crie uma nova loja digital para expandir seus negócios
        </p>
        <div className="inline-flex items-center text-secondary text-sm font-medium group-hover:text-secondary/80 transition-all duration-200">
          Criar Agora
          <svg className="w-4 h-4 ml-2 -mr-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </div>
  )
}

// Quick Action Card Component - Novo Componente
function QuickActionCard({ 
  href, 
  icon: Icon, 
  title, 
  description, 
  color 
}: {
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  description: string
  color: 'green' | 'purple' | 'blue'
}) {
  const colorClasses = {
    green: {
      bg: 'bg-secondary group-hover:bg-secondary/90',
      text: 'text-secondary group-hover:text-secondary/80',
      border: 'group-hover:border-secondary/50',
      bgHover: 'bg-secondary/10'
    },
    purple: {
      bg: 'bg-accent group-hover:bg-accent/90',
      text: 'text-accent group-hover:text-accent/80',
      border: 'group-hover:border-accent/50',
      bgHover: 'bg-accent/10'
    },
    blue: {
      bg: 'bg-primary group-hover:bg-primary/90',
      text: 'text-primary group-hover:text-primary/80',
      border: 'group-hover:border-primary/50',
      bgHover: 'bg-primary/10'
    }
  }

  const classes = colorClasses[color]

  return (
    <div className="group relative">
      {/* Hover Background Effect */}
      <div className={`absolute inset-0 ${classes.bgHover} rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-105`}></div>
      
      <Link
        href={href}
        className={`block w-full h-full bg-card backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-border hover:shadow-2xl transition-all duration-300 text-center ${classes.border}`}
      >
        <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-2xl ${classes.bg} transition-all duration-300 mb-6 shadow-md group-hover:shadow-lg`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-3 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {description}
        </p>
        <div className={`inline-flex items-center ${classes.text} text-sm font-medium transition-all duration-200`}>
          Acessar
          <svg className="w-4 h-4 ml-2 -mr-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </div>
  )
}