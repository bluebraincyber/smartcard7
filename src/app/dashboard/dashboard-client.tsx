'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Store as StoreIcon, Plus, Eye, BarChart3, Users, Activity, AlertCircle } from 'lucide-react'
import { Session } from 'next-auth'
import PageViewsChart from '@/components/analytics/PageViewsChart'
import React from 'react'

interface Store {
  id: string
  name: string
  slug: string
  isActive: boolean
  _count: {
    categories: number
  }
}

interface Analytics {
  totalVisits: number
  totalClicks: number
  totalStores: number
  totalSales: number
}

interface DashboardClientProps {
  session: Session
}

export default function DashboardClient({ session }: DashboardClientProps) {
  const [stores, setStores] = useState<Store[]>([])
  const [analytics, setAnalytics] = useState<Analytics>({
    totalVisits: 0,
    totalClicks: 0,
    totalStores: 0,
    totalSales: 0,
  })
  const [pageViewsData, setPageViewsData] = useState<{ name: string; views: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<{ message: string; retry?: () => void } | null>(null)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        await Promise.all([fetchStores(), fetchAnalytics(), fetchPageViews()])
        setError(null)
      } catch (err) {
        // Errors already handled in each fetch
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores')
      if (response.ok) {
        const data = await response.json()
        const userStores = data.stores || []
        setStores(userStores)
      } else {
        throw new Error('Falha ao carregar as lojas')
      }
    } catch (error) {
      console.error('Erro ao buscar lojas:', error)
      setError({
        message: 'Não foi possível carregar suas lojas. Por favor, tente novamente.',
        retry: fetchStores
      })
      throw error
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/summary')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        throw new Error('Falha ao carregar as estatísticas')
      }
    } catch (error) {
      console.error('Erro ao buscar analytics:', error)
      setError(prev => ({
        message: 'Não foi possível carregar as estatísticas. Alguns dados podem estar indisponíveis.',
        retry: fetchAnalytics
      }))
      throw error
    }
  }

  const fetchPageViews = async () => {
    try {
      const response = await fetch('/api/analytics/page-views')
      if (response.ok) {
        const data = await response.json()
        setPageViewsData(data.pageViews || [])
      }
    } catch (error) {
      console.error('Erro ao buscar visualizações de página:', error)
      // Não seta erro para manter UX
    }
  }

  const quickActions = [
    {
      title: 'Nova Loja',
      description: 'Criar loja para cartões',
      icon: Plus,
      href: '/dashboard/stores/new',
      color: 'blue' as const,
    },
    {
      title: 'Relatórios',
      description: 'Acompanhe métricas',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'orange' as const,
    },
    {
      title: 'Suporte',
      description: 'Ajuda e suporte',
      icon: AlertCircle,
      href: '/support',
      color: 'purple' as const,
    },
    {
      title: 'Financeiro',
      description: 'Receitas e despesas',
      href: '/dashboard/finance',
      icon: Activity,
      color: 'green' as const,
    },
  ]

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card backdrop-blur-sm rounded-2xl shadow-xl border border-border p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10 mb-6">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-3">Ocorreu um erro</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">{error.message}</p>
          {error.retry && (
            <button
              onClick={error.retry}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
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
            <span className="mt-4 text-foreground font-medium">Carregando dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-foreground bg-card hover:bg-accent rounded-xl shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm border border-border">
                <BarChart3 className="mr-2 h-4 w-4 text-primary" />
                <span className="font-semibold">Dashboard Principal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="relative mb-8">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-primary shadow-lg mb-6 relative z-10">
              <BarChart3 className="h-10 w-10 text-primary-foreground" />
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/50 dark:bg-primary/60 rounded-full blur-3xl animate-pulse"></div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {`Bem-vindo, ${session.user?.name || session.user?.email}!`} <span className="block sm:inline">Gerencie seus cartões digitais e acompanhe o desempenho</span>
          </p>
        </div>

        {/* Analytics Overview Cards */}
        <div className="bg-card backdrop-blur-sm rounded-3xl shadow-xl border border-border p-8 mb-12 transition-colors duration-200">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Visão Geral</h2>
            <p className="text-muted-foreground">Métricas principais da sua conta</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Card de Lojas */}
            <div className="bg-card backdrop-blur-sm rounded-2xl shadow-lg border border-border p-4 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <StoreIcon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  LOJAS
                </span>
              </div>
              <div className="mt-auto">
                <div className="text-xl font-bold text-foreground">
                  {analytics.totalStores}
                </div>
                <p className="text-xs text-muted-foreground">Total de lojas</p>
              </div>
            </div>

            {/* Card de Visitas */}
            <div className="bg-card backdrop-blur-sm rounded-2xl shadow-lg border border-border p-4 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-purple-500/10">
                  <Eye className="w-5 h-5 text-purple-500" />
                </div>
                <span className="text-[10px] font-medium text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full">
                  VISITAS
                </span>
              </div>
              <div className="mt-auto">
                <div className="text-xl font-bold text-foreground">
                  {analytics.totalVisits.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Visitas totais</p>
              </div>
            </div>

            {/* Card de Cliques */}
            <div className="bg-card backdrop-blur-sm rounded-2xl shadow-lg border border-border p-4 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-green-500/10">
                  <Users className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-[10px] font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                  CLICKS
                </span>
              </div>
              <div className="mt-auto">
                <div className="text-xl font-bold text-foreground">
                  {analytics.totalClicks.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total de cliques</p>
              </div>
            </div>

            {/* Card de Vendas */}
            <div className="bg-card backdrop-blur-sm rounded-2xl shadow-lg border border-border p-4 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-blue-500/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-500">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                    <path d="M3 6h18"></path>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                </div>
                <span className="text-[10px] font-medium text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                  VENDAS
                </span>
              </div>
              <div className="mt-auto">
                <div className="text-xl font-bold text-foreground">
                  {(analytics.totalSales || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total de vendas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card backdrop-blur-sm rounded-3xl shadow-xl border border-border p-8 mb-12 transition-colors duration-200">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Ações Rápidas</h2>
            <p className="text-muted-foreground">Acesse rapidamente as principais funcionalidades</p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {quickActions.map((action, index) => (
              <QuickActionCard
                  key={`quick-action-${index}`}
                  href={action.href}
                  icon={action.icon}
                  title={action.title}
                  description={action.description}
                  color={action.color}
              />
            ))}
          </div>
        </div>

        {/* Page Views Chart */}
        {pageViewsData.length > 0 && (
          <div className="bg-card backdrop-blur-sm rounded-3xl shadow-xl border border-border p-8 mb-12 transition-colors duration-200">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Visualizações por Página</h2>
              <p className="text-muted-foreground">Acompanhe o desempenho das suas páginas</p>
            </div>
            <div className="w-full overflow-x-auto">
              <PageViewsChart data={pageViewsData} />
            </div>
          </div>
        )}

        {/* Stores Section */}
        <div className="bg-card backdrop-blur-sm rounded-3xl shadow-xl border border-border p-8 transition-colors duration-200">
          <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Suas Lojas</h2>
              <p className="text-muted-foreground">Gerencie todas as suas lojas digitais</p>
            </div>

            <Link
              href="/dashboard/store/new"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-md transition-all hover:shadow-lg hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Loja
            </Link>
          </div>

          {stores.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-muted mb-6">
                <StoreIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Nenhuma loja criada</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                Comece criando sua primeira loja digital e transforme seu negócio
              </p>
              <Link
                href="/dashboard/store/new"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-lg font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Plus className="h-5 w-5 mr-3" />
                Criar Primeira Loja
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StoreCard({ store }: { store: Store }) {
  return (
    <div className="group relative">
      <Link
        href={`/dashboard/store/${store.id}`}
        className="block h-full bg-muted/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-border hover:shadow-2xl transition-all duration-300 group-hover:border-primary/50"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-primary group-hover:bg-primary/90 flex items-center justify-center transition-all duration-300 shadow-md group-hover:shadow-lg">
              <StoreIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary truncate transition-colors mb-1">{store.name}</h3>
              <p className="text-sm text-muted-foreground group-hover:text-foreground font-medium transition-colors">/{store.slug}</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
              store.isActive
                ? 'bg-success/10 text-success border border-success/20'
                : 'bg-warning/10 text-warning border border-warning/20'
            }`}
          >
            {store.isActive ? 'Ativa' : 'Inativa'}
          </span>
        </div>

        <div className="bg-card/50 rounded-xl p-4 text-center group-hover:bg-card/70 transition-all duration-300 mb-6">
          <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors mb-1">{store._count.categories}</div>
          <div className="text-xs font-medium text-muted-foreground group-hover:text-foreground uppercase tracking-wider transition-colors">Categorias</div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Ver detalhes</span>
          <span className="inline-flex items-center text-primary group-hover:text-primary/80 text-sm font-medium transition-all duration-200">
            Gerenciar
            <svg className="w-4 h-4 ml-1 -mr-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </Link>
    </div>
  )
}

function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
  color,
}: {
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  description: string
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colorClasses = {
    blue: {
      bg: 'bg-primary',
      text: 'text-primary',
      border: 'border-primary/20 group-hover:border-primary/40',
      bgHover: 'bg-primary/10'
    },
    green: {
      bg: 'bg-green-500',
      text: 'text-green-600',
      border: 'border-green-500/20 group-hover:border-green-500/40',
      bgHover: 'bg-green-500/10'
    },
    purple: {
      bg: 'bg-purple-500',
      text: 'text-purple-600',
      border: 'border-purple-500/20 group-hover:border-purple-500/40',
      bgHover: 'bg-purple-500/10'
    },
    orange: {
      bg: 'bg-orange-500',
      text: 'text-orange-600',
      border: 'border-orange-500/20 group-hover:border-orange-500/40',
      bgHover: 'bg-orange-500/10'
    }
  }

  const classes = colorClasses[color]

  return (
    <Link
      href={href}
      className={`group relative flex flex-col h-full p-4 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-200 overflow-hidden ${classes.border} min-h-[140px]`}
    >
      <div className="flex flex-col h-full">
        {/* Ícone */}
        <div className={`p-2 rounded-lg ${classes.bgHover} w-10 h-10 flex items-center justify-center mb-3`}>
          <Icon className={`w-4 h-4 ${classes.text}`} />
        </div>
        
        {/* Título */}
        <h3 className={`text-sm font-semibold ${classes.text} mb-1`}>
          {title}
        </h3>
        
        {/* Descrição */}
        <p className="text-xs text-muted-foreground leading-tight">
          {description}
        </p>
      </div>
    </Link>
  )
}
