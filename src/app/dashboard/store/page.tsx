'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Plus, Store, Search, Filter, SortAsc, Eye, Package, Layers, BarChart3, Settings, Archive, Play } from 'lucide-react'

type StoreStatus = 'active' | 'archived'

export interface Store {
  id: string
  name: string
  slug: string
  description?: string
  isActive: boolean
  url: string
  status: 'active' | 'archived'
  categories: number
  products: number
  views30d?: number
  updatedAt?: string
  _count: {
    categories: number
    products: number
    analytics: number
  }
}

export default function MyStoresPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'az' | 'views'>('recent')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/stores')
      if (response.ok) {
        const data = await response.json()
        const mappedStores = (data.stores || []).map((store: any) => ({
          ...store,
          isActive: store.isActive ?? store.isactive ?? true,
          status: (store.isActive ?? store.isactive ?? true) ? 'active' : 'archived',
          url: `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/${store.slug}`,
          categories: store._count?.categories || 0,
          products: store._count?.products || 0,
          _count: {
            categories: store._count?.categories || 0,
            products: store._count?.products || 0,
            analytics: store._count?.analytics || 0,
          },
        }))
        setStores(mappedStores)
      } else {
        setError('Failed to fetch stores')
      }
    } catch (error) {
      setError('Failed to fetch stores')
      console.error('Error fetching stores:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  // Filter and sort stores
  const filteredStores = useMemo(() => {
    let filtered = stores

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(store => 
        store.name.toLowerCase().includes(query) ||
        store.slug.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(store => store.status === statusFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'az':
          return a.name.localeCompare(b.name)
        case 'views':
          return (b.views30d || 0) - (a.views30d || 0)
        case 'recent':
        default:
          if (!a.updatedAt || !b.updatedAt) return 0
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

    // Group by status
    const activeStores = filtered.filter(store => store.status === 'active')
    const archivedStores = filtered.filter(store => store.status === 'archived')

    return { activeStores, archivedStores }
  }, [stores, searchQuery, statusFilter, sortBy])

  const handleToggleStatus = useCallback(async (storeId: string, status: 'active' | 'archived') => {
    try {
      const response = await fetch(`/api/stores/${storeId}/toggle`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Falha ao atualizar o status da loja')
      }

      const updatedStore = await response.json()

      setStores((prevStores: Store[]) =>
        prevStores.map(store =>
          store.id === storeId 
            ? { 
                ...store, 
                isActive: updatedStore.isActive,
                status: updatedStore.isActive ? 'active' : 'archived',
                updatedAt: updatedStore.updatedAt
              } 
            : store
        )
      )
    } catch (err) {
      setError('Falha ao atualizar o status da loja')
      console.error('Erro ao atualizar status da loja:', err)
    }
  }, [])

  const quickActions = [
    {
      title: 'Nova Loja',
      description: 'Crie uma nova loja digital',
      href: '/dashboard/store/new',
      icon: Plus,
      color: 'green'
    },
    {
      title: 'Analytics Geral',
      description: 'Veja métricas de todas as lojas',
      href: '/dashboard/analytics',
      icon: BarChart3,
      color: 'purple'
    },
    {
      title: 'Configurações',
      description: 'Gerencie configurações globais',
      href: '/dashboard/settings',
      icon: Settings,
      color: 'blue'
    },
    {
      title: 'Relatórios',
      description: 'Exporte dados e relatórios',
      href: '/dashboard/reports',
      icon: Package,
      color: 'orange'
    }
  ]

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
          </div>
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
        {/* Header */}
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

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="relative mb-8">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg mb-6">
              <Store className="h-10 w-10 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-20 rounded-full blur-xl scale-150"></div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Minhas Lojas
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Gerencie todas as suas lojas digitais em um só lugar
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 mb-12">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar lojas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'archived')}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Todas</option>
                <option value="active">Ativas</option>
                <option value="archived">Arquivadas</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'az' | 'views')}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="recent">Mais recentes</option>
                <option value="az">A-Z</option>
                <option value="views">Mais visualizadas</option>
              </select>

              {/* Create Button */}
              <Link
                href="/dashboard/store/new"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Loja
              </Link>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-2xl p-6 mb-8">
            <div className="text-red-800 font-medium">{error}</div>
          </div>
        )}

        {/* No Stores - Empty State */}
        {stores.length === 0 && !loading && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-16 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gray-100 mb-6">
              <Store className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Nenhuma loja criada
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Comece criando sua primeira loja digital e transforme seu negócio
            </p>
            <Link
              href="/dashboard/store/new"
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-2xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="mr-3 h-6 w-6" />
              Criar Primeira Loja
            </Link>
          </div>
        )}

        {/* Stores Grid */}
        {stores.length > 0 && (
          <div className="space-y-12">
            {/* Active Stores */}
            {filteredStores.activeStores.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Lojas Ativas</h2>
                    <p className="text-gray-600">Lojas atualmente em funcionamento</p>
                  </div>
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-700 border border-green-200">
                    {filteredStores.activeStores.length} loja{filteredStores.activeStores.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredStores.activeStores.map((store) => (
                    <StoreCard
                      key={store.id}
                      store={store}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Archived Stores */}
            {filteredStores.archivedStores.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Lojas Arquivadas</h2>
                    <p className="text-gray-600">Lojas temporariamente desativadas</p>
                  </div>
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                    {filteredStores.archivedStores.length} loja{filteredStores.archivedStores.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredStores.archivedStores.map((store) => (
                    <StoreCard
                      key={store.id}
                      store={store}
                      onToggleStatus={handleToggleStatus}
                      isArchived={true}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* No Results */}
            {filteredStores.activeStores.length === 0 && filteredStores.archivedStores.length === 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-16 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gray-100 mb-6">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Nenhuma loja encontrada
                </h3>
                <p className="text-gray-600 mb-8">
                  {searchQuery 
                    ? `Nenhuma loja encontrada para "${searchQuery}"`
                    : `Nenhuma loja ${statusFilter === 'active' ? 'ativa' : 'arquivada'} encontrada`
                  }
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Limpar busca
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {stores.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-8 mt-12">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Ações Rápidas
              </h2>
              <p className="text-gray-600">
                Acesse rapidamente as principais funcionalidades
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <QuickActionCard
                  key={index}
                  href={action.href}
                  icon={action.icon}
                  title={action.title}
                  description={action.description}
                  color={action.color as any}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Store Card Component
function StoreCard({ 
  store, 
  onToggleStatus, 
  isArchived = false 
}: { 
  store: Store
  onToggleStatus: (storeId: string, status: 'active' | 'archived') => void
  isArchived?: boolean 
}) {
  return (
    <div className="group relative">
      {/* Hover Background Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${isArchived ? 'from-gray-50 to-gray-100' : 'from-blue-50 to-blue-100'} rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-105`}></div>
      
      <div className={`w-full h-full bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border hover:shadow-2xl transition-all duration-300 group-hover:border-blue-200 group-hover:bg-white/90 ${
        isArchived ? 'opacity-75 hover:opacity-100' : ''
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
              isArchived 
                ? 'bg-gray-100 group-hover:bg-gray-200' 
                : 'bg-gradient-to-br from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 group-hover:shadow-lg'
            }`}>
              <Store className={`w-6 h-6 ${isArchived ? 'text-gray-400' : 'text-white'}`} />
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
            store.status === 'active'
              ? 'bg-green-100 text-green-700 border border-green-200 group-hover:bg-green-200 group-hover:border-green-300'
              : 'bg-gray-100 text-gray-700 border border-gray-200 group-hover:bg-gray-200 group-hover:border-gray-300'
          }`}>
            {store.status === 'active' ? 'Ativa' : 'Arquivada'}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center group-hover:from-white group-hover:to-gray-50 transition-all duration-300 shadow-sm group-hover:shadow">
            <div className="text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors mb-1">
              {store.categories}
            </div>
            <div className="text-xs font-medium text-gray-500 group-hover:text-gray-600 uppercase tracking-wider transition-colors">
              Categorias
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center group-hover:from-white group-hover:to-gray-50 transition-all duration-300 shadow-sm group-hover:shadow">
            <div className="text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors mb-1">
              {store.products}
            </div>
            <div className="text-xs font-medium text-gray-500 group-hover:text-gray-600 uppercase tracking-wider transition-colors">
              Produtos
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/store/${store.id}`}
              className="inline-flex items-center px-3 py-2 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200"
            >
              <Package className="w-3 h-3 mr-1" />
              Produtos
            </Link>
            <Link
              href={`/dashboard/store/${store.id}/analytics`}
              className="inline-flex items-center px-3 py-2 text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all duration-200"
            >
              <BarChart3 className="w-3 h-3 mr-1" />
              Analytics
            </Link>
          </div>
          
          <button
            onClick={() => onToggleStatus(store.id, store.status === 'active' ? 'archived' : 'active')}
            className={`inline-flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
              store.status === 'active'
                ? 'text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100'
                : 'text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100'
            }`}
          >
            {store.status === 'active' ? (
              <>
                <Archive className="w-3 h-3 mr-1" />
                Arquivar
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-1" />
                Ativar
              </>
            )}
          </button>
        </div>

        {/* Footer with views */}
        <div className="mt-4 pt-4 border-t border-gray-100 group-hover:border-gray-200 transition-colors">
          <div className="flex items-center text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
            <Eye className="w-4 h-4 mr-2" />
            {store.views30d ? `${store.views30d} visualizações (30d)` : 'Sem visualizações'}
          </div>
        </div>
      </div>
    </div>
  )
}

// Quick Action Card Component
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
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colorClasses = {
    blue: {
      bg: 'from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700',
      text: 'text-blue-600 group-hover:text-blue-700',
      border: 'group-hover:border-blue-200',
      bgHover: 'from-blue-50 to-blue-100'
    },
    green: {
      bg: 'from-green-500 to-green-600 group-hover:from-green-600 group-hover:to-green-700',
      text: 'text-green-600 group-hover:text-green-700',
      border: 'group-hover:border-green-200',
      bgHover: 'from-green-50 to-green-100'
    },
    purple: {
      bg: 'from-purple-500 to-purple-600 group-hover:from-purple-600 group-hover:to-purple-700',
      text: 'text-purple-600 group-hover:text-purple-700',
      border: 'group-hover:border-purple-200',
      bgHover: 'from-purple-50 to-purple-100'
    },
    orange: {
      bg: 'from-orange-500 to-orange-600 group-hover:from-orange-600 group-hover:to-orange-700',
      text: 'text-orange-600 group-hover:text-orange-700',
      border: 'group-hover:border-orange-200',
      bgHover: 'from-orange-50 to-orange-100'
    }
  }

  const classes = colorClasses[color]

  return (
    <div className="group relative">
      {/* Hover Background Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${classes.bgHover} rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-105`}></div>
      
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