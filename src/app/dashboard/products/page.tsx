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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Ocorreu um erro</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">{errorState.message}</p>
          {errorState.retry && (
            <button
              onClick={handleRetry}
              className="w-full flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-20 animate-pulse"></div>
            </div>
            <span className="mt-4 text-gray-700 font-medium">Carregando suas lojas...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - Layout Melhorado */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white/80 hover:bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm border border-gray-200"
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
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg mb-6">
                <Package className="h-10 w-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-20 rounded-full blur-xl scale-150"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Gerenciar Produtos
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Escolha uma loja para gerenciar categorias, produtos e visualizar dados de desempenho
            </p>
          </div>

          {/* Store Selection - Layout Aprimorado */}
          {stores.length === 0 ? (
            /* No Stores - Design Melhorado */
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-12 mb-8 text-center">
              <div className="mb-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gray-100 mb-6">
                  <Store className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Nenhuma loja criada
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                  Para começar a gerenciar produtos, você precisa criar sua primeira loja digital
                </p>
              </div>
              <Link
                href="/dashboard/store/new"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-2xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="mr-3 h-6 w-6" />
                Criar Primeira Loja
              </Link>
            </div>
          ) : (
            /* Store Selection - Grid Responsivo Melhorado */
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-8 mb-12">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {hasMultipleStores ? 'Selecione uma Loja' : 'Sua Loja'}
                </h2>
                <p className="text-gray-600">
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
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-105"></div>
      
      <button
        onClick={onClick}
        className={`w-full h-full flex flex-col bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border hover:shadow-2xl transition-all duration-300 text-left group-hover:border-blue-200 group-hover:bg-white/90 ${
          inactive 
            ? 'border-gray-200 opacity-75 hover:opacity-100' 
            : 'border-gray-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
              inactive 
                ? 'bg-gray-100' 
                : 'bg-gradient-to-br from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 group-hover:shadow-lg'
            }`}>
              <Store className={`w-7 h-7 transition-colors ${
                inactive 
                  ? 'text-gray-400' 
                  : 'text-white'
              }`} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-800 truncate transition-colors mb-1">
                {store.name}
              </h3>
              <p className="text-sm text-gray-500 group-hover:text-gray-600 font-medium transition-colors">
                /{store.slug}
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
            store.isActive
              ? 'bg-green-100 text-green-700 border border-green-200 group-hover:bg-green-200 group-hover:border-green-300'
              : 'bg-amber-100 text-amber-700 border border-amber-200 group-hover:bg-amber-200 group-hover:border-amber-300'
          }`}>
            {store.isActive ? 'Ativa' : 'Inativa'}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center group-hover:from-white group-hover:to-gray-50 transition-all duration-300 shadow-sm group-hover:shadow">
            <div className="text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors mb-1">
              {store.categories || 0}
            </div>
            <div className="text-xs font-medium text-gray-500 group-hover:text-gray-600 uppercase tracking-wider transition-colors">
              Categorias
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center group-hover:from-white group-hover:to-gray-50 transition-all duration-300 shadow-sm group-hover:shadow">
            <div className="text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors mb-1">
              {store.products || 0}
            </div>
            <div className="text-xs font-medium text-gray-500 group-hover:text-gray-600 uppercase tracking-wider transition-colors">
              Produtos
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-100 group-hover:border-gray-200 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
              <span className="inline-flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                {store.views30d ? `${store.views30d} views` : 'Sem views'}
              </span>
            </div>
            <span className={`inline-flex items-center text-sm font-medium transition-all duration-200 ${
              inactive 
                ? 'text-gray-500' 
                : 'text-blue-600 group-hover:text-blue-700'
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
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-105"></div>
      
      <Link
        href="/dashboard/store/new"
        className="w-full h-full flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-2 border-dashed border-gray-300 hover:border-green-400 hover:shadow-2xl transition-all duration-300 text-center group-hover:bg-white/90 min-h-[280px]"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 group-hover:from-green-600 group-hover:to-green-700 flex items-center justify-center mb-6 transition-all duration-300 shadow-md group-hover:shadow-lg">
          <Plus className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-600 mb-3 transition-colors">
          Nova Loja
        </h3>
        <p className="text-sm text-gray-500 group-hover:text-gray-600 mb-6 max-w-[200px] mx-auto leading-relaxed transition-colors">
          Crie uma nova loja digital para expandir seus negócios
        </p>
        <div className="inline-flex items-center text-green-600 text-sm font-medium group-hover:text-green-700 transition-all duration-200">
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
  icon: any
  title: string
  description: string
  color: 'green' | 'purple' | 'blue'
}) {
  const colorClasses = {
    green: {
      bg: 'from-green-500 to-green-600 group-hover:from-green-600 group-hover:to-green-700',
      text: 'text-green-600 group-hover:text-green-700',
      border: 'group-hover:border-green-200'
    },
    purple: {
      bg: 'from-purple-500 to-purple-600 group-hover:from-purple-600 group-hover:to-purple-700',
      text: 'text-purple-600 group-hover:text-purple-700',
      border: 'group-hover:border-purple-200'
    },
    blue: {
      bg: 'from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700',
      text: 'text-blue-600 group-hover:text-blue-700',
      border: 'group-hover:border-blue-200'
    }
  }

  const classes = colorClasses[color]

  return (
    <div className="group relative">
      {/* Hover Background Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color === 'green' ? 'from-green-50 to-green-100' : color === 'purple' ? 'from-purple-50 to-purple-100' : 'from-blue-50 to-blue-100'} rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-105`}></div>
      
      <Link
        href={href}
        className={`block w-full h-full bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300 text-center ${classes.border}`}
      >
        <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br ${classes.bg} transition-all duration-300 mb-6 shadow-md group-hover:shadow-lg`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
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