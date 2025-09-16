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
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-border border-t-primary"></div>
            </div>
          </div>
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
              <div className="absolute inset-0 rounded-full bg-primary/20 opacity-20 animate-pulse"></div>
            </div>
            <span className="mt-4 text-foreground font-medium">Carregando suas lojas...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
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

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="relative mb-8">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-primary shadow-lg mb-6">
              <Store className="h-10 w-10 text-primary-foreground" />
            </div>
            <div className="absolute inset-0 bg-primary/20 opacity-20 rounded-full blur-xl scale-150"></div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Minhas Lojas
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Gerencie todas as suas lojas digitais em um só lugar
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6 mb-12">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar lojas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-background text-foreground"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'archived')}
                className="px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-background text-foreground"
              >
                <option value="all">Todas</option>
                <option value="active">Ativas</option>
                <option value="archived">Arquivadas</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'az' | 'views')}
                className="px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-background text-foreground"
              >
                <option value="recent">Mais recentes</option>
                <option value="az">A-Z</option>
                <option value="views">Mais visualizadas</option>
              </select>

              {/* Create Button */}
              <Link
                href="/dashboard/store/new"
                className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Loja
              </Link>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 backdrop-blur-sm border border-destructive/20 rounded-2xl p-6 mb-8">
            <div className="text-destructive font-medium">{error}</div>
          </div>
        )}

        {/* No Stores - Empty State */}
        {stores.length === 0 && !loading && (
          <div className="bg-card backdrop-blur-sm rounded-3xl shadow-xl border border-border p-16 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-muted mb-6">
              <Store className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-3">
              Nenhuma loja criada
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              Comece criando sua primeira loja digital e transforme seu negócio
            </p>
            <Link
              href="/dashboard/store/new"
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-2xl text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg hover:shadow-xl transition-all duration-200"
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
                    <h2 className="text-2xl font-semibold text-foreground mb-2">Lojas Ativas</h2>
                    <p className="text-muted-foreground">Lojas atualmente em funcionamento</p>
                  </div>
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-success/10 text-success border border-success/20">
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
                    <h2 className="text-2xl font-semibold text-foreground mb-2">Lojas Arquivadas</h2>
                    <p className="text-muted-foreground">Lojas temporariamente desativadas</p>
                  </div>
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-muted text-muted-foreground border border-border">
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
              <div className="bg-card backdrop-blur-sm rounded-3xl shadow-xl border border-border p-16 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-muted mb-6">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Nenhuma loja encontrada
                </h3>
                <p className="text-muted-foreground mb-8">
                  {searchQuery 
                    ? `Nenhuma loja encontrada para "${searchQuery}"`
                    : `Nenhuma loja ${statusFilter === 'active' ? 'ativa' : 'arquivada'} encontrada`
                  }
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
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
          <div className="bg-card backdrop-blur-sm rounded-3xl shadow-xl border border-border p-8 mt-12">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Ações Rápidas
              </h2>
              <p className="text-muted-foreground">
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
      <div className={`absolute inset-0 bg-gradient-to-br ${isArchived ? 'from-muted/50 to-muted' : 'from-primary/5 to-primary/10'} rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-105`}></div>
      
      <div className={`w-full h-full bg-card backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-border hover:shadow-2xl transition-all duration-300 group-hover:border-primary/20 group-hover:bg-card/90 ${
        isArchived ? 'opacity-75 hover:opacity-100' : ''
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
              isArchived 
                ? 'bg-muted group-hover:bg-muted/80' 
                : 'bg-gradient-to-br from-primary to-primary/80 group-hover:from-primary/90 group-hover:to-primary group-hover:shadow-lg'
            }`}>
              <Store className={`w-6 h-6 ${isArchived ? 'text-muted-foreground' : 'text-primary-foreground'}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-foreground/90 truncate transition-colors mb-1">
                {store.name}
              </h3>
              <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 font-medium transition-colors">
                /{store.slug}
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
            store.status === 'active'
              ? 'bg-success/10 text-success border border-success/20 group-hover:bg-success/20 group-hover:border-success/30'
              : 'bg-muted text-muted-foreground border border-border group-hover:bg-muted/80 group-hover:border-border/80'
          }`}>
            {store.status === 'active' ? 'Ativa' : 'Arquivada'}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-muted/30 to-muted/50 rounded-xl p-4 text-center group-hover:from-background group-hover:to-muted/30 transition-all duration-300 shadow-sm group-hover:shadow dark:from-muted/20 dark:to-muted/40">
            <div className="text-2xl font-bold text-foreground group-hover:text-foreground/90 transition-colors mb-1">
              {store.categories}
            </div>
            <div className="text-xs font-medium text-muted-foreground group-hover:text-muted-foreground/80 uppercase tracking-wider transition-colors">
              Categorias
            </div>
          </div>
          <div className="bg-gradient-to-br from-muted/30 to-muted/50 rounded-xl p-4 text-center group-hover:from-background group-hover:to-muted/30 transition-all duration-300 shadow-sm group-hover:shadow dark:from-muted/20 dark:to-muted/40">
            <div className="text-2xl font-bold text-foreground group-hover:text-foreground/90 transition-colors mb-1">
              {store.products}
            </div>
            <div className="text-xs font-medium text-muted-foreground group-hover:text-muted-foreground/80 uppercase tracking-wider transition-colors">
              Produtos
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/store/${store.id}`}
              className="inline-flex items-center px-3 py-2 text-xs font-medium text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 rounded-lg transition-all duration-200"
            >
              <Package className="w-3 h-3 mr-1" />
              Produtos
            </Link>
            <Link
              href={`/dashboard/store/${store.id}/analytics`}
              className="inline-flex items-center px-3 py-2 text-xs font-medium text-secondary hover:text-secondary/80 bg-secondary/10 hover:bg-secondary/20 rounded-lg transition-all duration-200"
            >
              <BarChart3 className="w-3 h-3 mr-1" />
              Analytics
            </Link>
          </div>
          
          <button
            onClick={() => onToggleStatus(store.id, store.status === 'active' ? 'archived' : 'active')}
            className={`inline-flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
              store.status === 'active'
                ? 'text-warning hover:text-warning/80 bg-warning/10 hover:bg-warning/20'
                : 'text-success hover:text-success/80 bg-success/10 hover:bg-success/20'
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
        <div className="mt-4 pt-4 border-t border-border group-hover:border-border/80 transition-colors">
          <div className="flex items-center text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
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
      bg: 'bg-primary group-hover:bg-primary/90',
      text: 'text-primary group-hover:text-primary/80',
      border: 'group-hover:border-primary/20',
      bgHover: 'from-primary/5 to-primary/10'
    },
    green: {
      bg: 'bg-success group-hover:bg-success/90',
      text: 'text-success group-hover:text-success/80',
      border: 'group-hover:border-success/20',
      bgHover: 'from-success/5 to-success/10'
    },
    purple: {
      bg: 'bg-secondary group-hover:bg-secondary/90',
      text: 'text-secondary group-hover:text-secondary/80',
      border: 'group-hover:border-secondary/20',
      bgHover: 'from-secondary/5 to-secondary/10'
    },
    orange: {
      bg: 'bg-warning group-hover:bg-warning/90',
      text: 'text-warning group-hover:text-warning/80',
      border: 'group-hover:border-warning/20',
      bgHover: 'from-warning/5 to-warning/10'
    }
  }

  const classes = colorClasses[color]

  return (
    <div className="group relative">
      {/* Hover Background Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${classes.bgHover} rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-105`}></div>
      
      <Link
        href={href}
        className={`block w-full h-full bg-card backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-border hover:shadow-2xl transition-all duration-300 text-center ${classes.border}`}
      >
        <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-2xl ${classes.bg} transition-all duration-300 mb-6 shadow-md group-hover:shadow-lg`}>
          <Icon className="h-7 w-7 text-primary-foreground" />
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