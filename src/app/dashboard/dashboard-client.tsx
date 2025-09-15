'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Store, Plus, Eye, BarChart3, Users, TrendingUp, Activity, Calendar, ShoppingBag } from 'lucide-react'
import { Session } from 'next-auth'
import PageViewsChart from '@/components/analytics/PageViewsChart'

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
}

interface DashboardClientProps {
  session: Session
}

export default function DashboardClient({ session }: DashboardClientProps) {
  const router = useRouter()
  const [stores, setStores] = useState<Store[]>([])
  const [analytics, setAnalytics] = useState<Analytics>({
    totalVisits: 0,
    totalClicks: 0,
    totalStores: 0
  })
  const [pageViewsData, setPageViewsData] = useState<{
    name: string;
    views: number;
  }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStores()
    fetchAnalytics()
    fetchPageViews()
  }, [])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores')
      if (response.ok) {
        const data = await response.json()
        const userStores = data.stores || []
        setStores(userStores)
      }
    } catch (error) {
      console.error('Erro ao buscar lojas:', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/summary')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Erro ao buscar analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPageViews = async () => {
    try {
      const response = await fetch('/api/analytics/page-views')
      if (response.ok) {
        const data = await response.json()
        setPageViewsData(data.pageViews)
      }
    } catch (error) {
      console.error('Erro ao buscar visualizações de página:', error)
    }
  }

  // Quick actions for dashboard
  const quickActions = [
    {
      title: 'Nova Loja',
      description: 'Crie uma nova loja digital',
      href: '/dashboard/store/new',
      icon: Plus,
      color: 'green'
    },
    {
      title: 'Gerenciar Produtos',
      description: 'Categorias e produtos das lojas',
      href: '/dashboard/products',
      icon: ShoppingBag,
      color: 'blue'
    },
    {
      title: 'Analytics',
      description: 'Visualize métricas e relatórios',
      href: '/dashboard/analytics',
      icon: BarChart3,
      color: 'purple'
    },
    {
      title: 'Financeiro',
      description: 'Controle receitas e despesas',
      href: '/dashboard/finance',
      icon: Activity,
      color: 'orange'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-20 animate-pulse"></div>
            </div>
            <span className="mt-4 text-gray-700 font-medium">Carregando dashboard...</span>
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
        {/* Header - Hero Section */}
        <div className="text-center mb-12">
          <div className="relative mb-8">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg mb-6">
              <BarChart3 className="h-10 w-10 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-20 rounded-full blur-xl scale-150"></div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Bem-vindo, {session.user?.name || session.user?.email}! Gerencie seus cartões digitais e acompanhe o desempenho
          </p>
        </div>

        {/* Analytics Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Total Stores */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                LOJAS
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {analytics.totalStores}
            </div>
            <p className="text-sm text-gray-600">Total de lojas</p>
          </div>

          {/* Total Visits */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                VISITAS
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {analytics.totalVisits.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Visitas totais</p>
          </div>

          {/* WhatsApp Clicks */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                CLICKS
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {analytics.totalClicks.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Cliques WhatsApp</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-8 mb-12">
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

        {/* Page Views Chart */}
        {pageViewsData.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-8 mb-12">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Visualizações por Página</h2>
              <p className="text-gray-600">Acompanhe o desempenho das suas páginas</p>
            </div>
            <PageViewsChart data={pageViewsData} />
          </div>
        )}

        {/* Stores Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Suas Lojas
              </h2>
              <p className="text-gray-600">Gerencie todas as suas lojas digitais</p>
            </div>
            <Link
              href="/dashboard/store/new"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Loja
            </Link>
          </div>

          {stores.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gray-100 mb-6">
                <Store className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Store Card Component
function StoreCard({ store }: { store: Store }) {
  return (
    <div className="group relative">
      {/* Hover Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-105"></div>
      
      <Link
        href={`/dashboard/store/${store.id}`}
        className="block w-full h-full bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300 group-hover:border-blue-200 group-hover:bg-white/90"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 flex items-center justify-center transition-all duration-300 shadow-md group-hover:shadow-lg">
              <Store className="w-6 h-6 text-white" />
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

        {/* Stats */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center group-hover:from-white group-hover:to-gray-50 transition-all duration-300 shadow-sm group-hover:shadow mb-6">
          <div className="text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors mb-1">
            {store._count.categories}
          </div>
          <div className="text-xs font-medium text-gray-500 group-hover:text-gray-600 uppercase tracking-wider transition-colors">
            Categorias
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
            Ver detalhes
          </span>
          <span className="inline-flex items-center text-blue-600 group-hover:text-blue-700 text-sm font-medium transition-all duration-200">
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