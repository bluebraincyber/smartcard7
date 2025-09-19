'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import { ArrowLeft, BarChart3, Users, TrendingDown, Clock, Download, RefreshCw, Eye, MousePointer, Globe, Calendar } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Dynamically import charts
const ActiveUsers24hChart = dynamic(() => import('@/components/charts/ActiveUsers24hChart'), {
  ssr: false,
  loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg" />
})

// Tipos para os dados
interface ActiveUserData {
  name: string
  users: number
}

interface PageViewData {
  name: string
  views: number
}

interface MetricsData {
  totalUsers: { value: string; change: number }
  bounceRate: { value: string; change: number }
  avgSession: { value: string; change: number }
  totalViews: { value: string; change: number }
}

interface AnalyticsData {
  activeUsers: ActiveUserData[]
  pageViews: PageViewData[]
  metrics: MetricsData
}

// Função para gerar dados simulados baseados no período
const generateMockData = (days: number): AnalyticsData => {
  const now = new Date()
  const activeUsers: ActiveUserData[] = []
  const pageViews: PageViewData[] = []
  
  // Gerar dados de usuários ativos para o período
  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    const baseUsers = 300 + (Math.sin(i) * 100)
    const randomVariation = Math.floor(Math.random() * 200) - 100
    const users = Math.max(100, Math.floor(baseUsers + randomVariation))
    
    activeUsers.push({
      name: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      users: users
    })
  }
  
  // Gerar visualizações de página
  const pages = ['Dashboard', 'Produtos', 'Financeiro', 'Configurações', 'Relatórios', 'Perfil']
  pages.forEach(page => {
    pageViews.push({
      name: page,
      views: Math.floor(Math.random() * 1000) + 100
    })
  })
  
  const totalUsers = activeUsers.reduce((sum, day) => sum + day.users, 0)
  const totalViews = pageViews.reduce((sum, page) => sum + page.views, 0)
  
  return {
    activeUsers,
    pageViews,
    metrics: {
      totalUsers: { 
        value: totalUsers > 1000 ? `${(totalUsers / 1000).toFixed(1)}K` : totalUsers.toString(),
        change: Math.floor(Math.random() * 20) - 5
      },
      totalViews: { 
        value: totalViews > 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews.toString(),
        change: Math.floor(Math.random() * 25) - 10
      },
      bounceRate: { 
        value: `${Math.floor(Math.random() * 30) + 15}%`, 
        change: Math.floor(Math.random() * 10) - 5
      },
      avgSession: { 
        value: `${Math.floor(Math.random() * 5) + 2}.${Math.floor(Math.random() * 9)} min`, 
        change: Math.floor(Math.random() * 15) - 5
      }
    }
  }
}

// Generate mock data for ActiveUsers24hChart
const generate24hActiveUsersData = () => {
  const data = []
  const now = new Date()
  for (let i = 23; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 60 * 60 * 1000)
    data.push({ x: date, y: Math.floor(Math.random() * 500) + 200 })
  }
  return data
}

const initialData: AnalyticsData = {
  activeUsers: [],
  pageViews: [],
  metrics: {
    totalUsers: { value: '0', change: 0 },
    totalViews: { value: '0', change: 0 },
    bounceRate: { value: '0%', change: 0 },
    avgSession: { value: '0 min', change: 0 }
  }
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30')
  const [isLoading, setIsLoading] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(initialData)

  // Gerar dados baseados no período selecionado
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        const days = parseInt(dateRange)
        const result = generateMockData(days)
        setAnalyticsData(result)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [dateRange])
  
  const activeUsers24hData = useMemo(() => generate24hActiveUsersData(), [dateRange])

  function downloadCSV() {
    const rows = [
      ['Data', 'Usuários Ativos'],
      ...analyticsData.activeUsers.map((r: { name: string; users: number }) => [r.name, String(r.users)])
    ]
    const csv = rows.map((r: any[]) => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics_${dateRange}dias.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const quickActions = [
    {
      title: 'Relatório Completo',
      description: 'Gere relatório detalhado dos dados',
      action: downloadCSV,
      icon: Download,
      color: 'blue'
    },
    {
      title: 'Atualizar Dados',
      description: 'Sincronize com dados mais recentes',
      action: () => window.location.reload(),
      icon: RefreshCw,
      color: 'green'
    },
    {
      title: 'Configurar Alertas',
      description: 'Defina alertas para métricas importantes',
      action: () => alert('Em desenvolvimento'),
      icon: Clock,
      color: 'purple'
    },
    {
      title: 'Insights Avançados',
      description: 'Análises detalhadas de comportamento',
      action: () => alert('Em desenvolvimento'),
      icon: BarChart3,
      color: 'orange'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-border border-t-warning"></div>
              <div className="absolute inset-0 rounded-full bg-warning opacity-20 animate-pulse"></div>
            </div>
            <span className="mt-4 text-foreground font-medium">Carregando analytics...</span>
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
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-warning shadow-lg mb-6 relative z-10">
              <BarChart3 className="h-10 w-10 text-warning-foreground" />
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-warning/30 dark:bg-warning/40 rounded-full blur-2xl animate-pulse"></div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Analytics
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Acompanhe o desempenho da sua aplicação com métricas detalhadas e insights valiosos
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex justify-center mb-12">
          <div className="bg-card backdrop-blur-sm rounded-2xl shadow-lg border border-border p-2">
            <div className="flex items-center space-x-1">
              {[
                { value: '7', label: '7 dias' },
                { value: '30', label: '30 dias' },
                { value: '90', label: '90 dias' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDateRange(option.value as '7' | '30' | '90')}
                  className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    dateRange === option.value
                      ? 'bg-warning text-warning-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  disabled={isLoading}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Users */}
          <div className="bg-card backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className={`flex items-center text-xs font-medium ${
                analyticsData.metrics.totalUsers.change >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {analyticsData.metrics.totalUsers.change >= 0 ? '+' : ''}{analyticsData.metrics.totalUsers.change}%
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {analyticsData.metrics.totalUsers.value}
            </div>
            <p className="text-sm text-muted-foreground">Total de usuários</p>
          </div>

          {/* Total Views */}
          <div className="bg-card backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <Eye className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div className={`flex items-center text-xs font-medium ${
                analyticsData.metrics.totalViews.change >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {analyticsData.metrics.totalViews.change >= 0 ? '+' : ''}{analyticsData.metrics.totalViews.change}%
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {analyticsData.metrics.totalViews.value}
            </div>
            <p className="text-sm text-muted-foreground">Visualizações</p>
          </div>

          {/* Bounce Rate */}
          <div className="bg-card backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-warning flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center text-xs font-medium ${
                analyticsData.metrics.bounceRate.change <= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {analyticsData.metrics.bounceRate.change >= 0 ? '+' : ''}{analyticsData.metrics.bounceRate.change}%
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {analyticsData.metrics.bounceRate.value}
            </div>
            <p className="text-sm text-muted-foreground">Taxa de rejeição</p>
          </div>

          {/* Average Session */}
          <div className="bg-card backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-warning flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning-foreground" />
              </div>
              <div className={`flex items-center text-xs font-medium ${
                analyticsData.metrics.avgSession.change >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {analyticsData.metrics.avgSession.change >= 0 ? '+' : ''}{analyticsData.metrics.avgSession.change}%
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {analyticsData.metrics.avgSession.value}
            </div>
            <p className="text-sm text-muted-foreground">Duração média</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Active Users Chart */}
          <div className="bg-card backdrop-blur-sm rounded-3xl shadow-xl border border-border p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">Usuários Ativos (24h)</h2>
              <p className="text-muted-foreground">Atividade dos usuários nas últimas 24 horas</p>
            </div>
            <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-lg" />}>
              <ActiveUsers24hChart data={activeUsers24hData} height={256} maWindow={7} />
            </Suspense>
          </div>

          {/* Page Views Chart */}
          <div className="bg-card backdrop-blur-sm rounded-3xl shadow-xl border border-border p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">Visualizações por Página</h2>
              <p className="text-muted-foreground">Páginas mais acessadas no período</p>
            </div>
            <PageViewsChart data={analyticsData.pageViews} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card backdrop-blur-sm rounded-3xl shadow-xl border border-border p-8 mb-12">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Ações Rápidas
            </h2>
            <p className="text-muted-foreground">
              Ferramentas para análise e exportação de dados
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                action={action.action}
                icon={action.icon}
                title={action.title}
                description={action.description}
                color={action.color as any}
              />
            ))}
          </div>
        </div>

        {/* Geographic Data */}
        <div className="bg-card backdrop-blur-sm rounded-3xl shadow-xl border border-border p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Distribuição Geográfica</h2>
            <p className="text-muted-foreground">Localização dos usuários por região</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map Placeholder */}
            <div className="lg:col-span-2">
              <div className="h-80 bg-muted rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-foreground font-medium">Mapa Interativo</p>
                  <p className="text-sm text-muted-foreground mt-1">Integração em desenvolvimento</p>
                </div>
              </div>
            </div>

            {/* Geographic Stats */}
            <div className="space-y-4">
              {[
                { country: 'Brasil', percentage: 78, users: '2.4K' },
                { country: 'Estados Unidos', percentage: 12, users: '387' },
                { country: 'Portugal', percentage: 6, users: '194' },
                { country: 'Argentina', percentage: 4, users: '129' }
              ].map((stat, index) => (
                <div key={index} className="bg-muted rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{stat.country}</span>
                    <span className="text-sm text-muted-foreground">{stat.users}</span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.percentage}% do total</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Page Views Chart Component
function PageViewsChart({ data }: { data: PageViewData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Nenhum dado disponível
      </div>
    )
  }

  const maxViews = Math.max(...data.map(item => item.views))

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="w-20 text-sm text-muted-foreground text-right font-medium">{item.name}</div>
          <div className="flex-1 flex items-center gap-3">
            <div className="flex-1 bg-border rounded-full h-3 overflow-hidden">
              <div 
                className="bg-warning h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(item.views / maxViews) * 100}%` }}
              />
            </div>
            <span className="text-sm text-foreground font-semibold w-16 text-right">
              {item.views.toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// Quick Action Card Component
function QuickActionCard({ 
  action, 
  icon: Icon, 
  title, 
  description, 
  color 
}: {
  action: () => void
  icon: any
  title: string
  description: string
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colorClasses = {
    blue: {
      bg: 'bg-primary group-hover:bg-primary/90',
      text: 'text-primary group-hover:text-primary/80',
      border: 'group-hover:border-primary/50',
      bgHover: 'bg-primary/10'
    },
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
    orange: {
      bg: 'bg-destructive group-hover:bg-destructive/90',
      text: 'text-destructive group-hover:text-destructive/80',
      border: 'group-hover:border-destructive/50',
      bgHover: 'bg-destructive/10'
    }
  }

  const classes = colorClasses[color]

  return (
    <div className="group relative">
      {/* Hover Background Effect */}
      <div className={`absolute inset-0 ${classes.bgHover} rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-105`}></div>
      
      <button
        onClick={action}
        className={`w-full h-full bg-card backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-border hover:shadow-2xl transition-all duration-300 text-center ${classes.border}`}
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
          Executar
          <svg className="w-4 h-4 ml-2 -mr-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </div>
  )
}