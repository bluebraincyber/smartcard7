'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Store, Plus, Eye, BarChart3, Users, TrendingUp, Activity, Calendar, ShoppingBag } from 'lucide-react'
import { Session } from 'next-auth'
import PageViewsChart from '@/components/analytics/PageViewsChart'

// Import responsive components
import { ResponsiveContainer, ResponsivePageHeader, ResponsiveCard, ResponsiveGrid } from '@/components/ui/ResponsiveLayout'
import { ResponsiveButton } from '@/components/ui/ResponsiveForms'
import { useResponsive, useMobileLayout } from '@/hooks/useResponsive'

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
  const { isMobile } = useResponsive()
  const isMobileLayout = useMobileLayout()
  
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
      title: isMobileLayout ? 'Produtos' : 'Gerenciar Produtos',
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
      description: isMobileLayout ? 'Receitas e despesas' : 'Controle receitas e despesas',
      href: '/dashboard/finance',
      icon: Activity,
      color: 'orange'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <ResponsiveContainer size="full" padding="lg">
          <div className="flex flex-col items-center justify-center min-h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-border border-t-primary"></div>
              <div className="absolute inset-0 rounded-full bg-primary opacity-20 animate-pulse"></div>
            </div>
            <span className="mt-4 text-foreground font-medium">
              {isMobileLayout ? 'Carregando...' : 'Carregando dashboard...'}
            </span>
          </div>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveContainer size="full" padding="none">
        {/* Header Section */}
        <div className="space-mobile border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="text-center">
            {/* Dashboard Icon - Smaller on mobile */}
            <div className="relative mb-4 sm:mb-6">
              <div className={`mx-auto flex items-center justify-center rounded-2xl bg-primary shadow-lg mb-4 sm:mb-6 ${
                isMobileLayout ? 'h-16 w-16' : 'h-20 w-20'
              }`}>
                <BarChart3 className={`text-primary-foreground ${
                  isMobileLayout ? 'h-8 w-8' : 'h-10 w-10'
                }`} />
              </div>
              {!isMobileLayout && (
                <div className="absolute inset-0 bg-primary opacity-20 rounded-full blur-xl scale-150"></div>
              )}
            </div>
            
            <h1 className={`font-bold text-foreground mb-2 sm:mb-4 ${
              isMobileLayout ? 'text-2xl sm:text-3xl' : 'text-4xl'
            }`}>
              Dashboard
            </h1>
            
            <p className={`text-muted-foreground max-w-2xl mx-auto leading-relaxed ${
              isMobileLayout ? 'text-base px-4' : 'text-xl'
            }`}>
              {isMobileLayout 
                ? `Olá, ${session.user?.name || 'Usuário'}! Gerencie seus cartões digitais`
                : `Bem-vindo, ${session.user?.name || session.user?.email}! Gerencie seus cartões digitais e acompanhe o desempenho`
              }
            </p>
          </div>
        </div>

        {/* Analytics Overview Cards */}
        <div className="space-mobile">
          <ResponsiveGrid
            cols={{ default: 1, sm: 2, lg: 3 }}
            gap="md"
          >
            {/* Total Stores Card */}
            <ResponsiveCard className="card-hover" padding="md">
              <div className="flex items-center justify-between mb-4">
                <div className={`rounded-xl bg-primary flex items-center justify-center ${
                  isMobileLayout ? 'w-10 h-10' : 'w-12 h-12'
                }`}>
                  <Store className={`text-primary-foreground ${
                    isMobileLayout ? 'w-5 h-5' : 'w-6 h-6'
                  }`} />
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  LOJAS
                </span>
              </div>
              <div className={`font-bold text-foreground mb-1 ${
                isMobileLayout ? 'text-xl' : 'text-2xl'
              }`}>
                {analytics.totalStores}
              </div>
              <p className="text-sm text-muted-foreground">
                {isMobileLayout ? 'Lojas' : 'Total de lojas'}
              </p>
            </ResponsiveCard>

            {/* Total Visits Card */}
            <ResponsiveCard className="card-hover" padding="md">
              <div className="flex items-center justify-between mb-4">
                <div className={`rounded-xl bg-secondary flex items-center justify-center ${
                  isMobileLayout ? 'w-10 h-10' : 'w-12 h-12'
                }`}>
                  <Eye className={`text-secondary-foreground ${
                    isMobileLayout ? 'w-5 h-5' : 'w-6 h-6'
                  }`} />
                </div>
                <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-1 rounded-full">
                  VISITAS
                </span>
              </div>
              <div className={`font-bold text-foreground mb-1 ${
                isMobileLayout ? 'text-xl' : 'text-2xl'
              }`}>
                {analytics.totalVisits.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                {isMobileLayout ? 'Visitas' : 'Visitas totais'}
              </p>
            </ResponsiveCard>

            {/* WhatsApp Clicks Card */}
            <ResponsiveCard className="card-hover" padding="md">
              <div className="flex items-center justify-between mb-4">
                <div className={`rounded-xl bg-accent flex items-center justify-center ${
                  isMobileLayout ? 'w-10 h-10' : 'w-12 h-12'
                }`}>
                  <Users className={`text-accent-foreground ${
                    isMobileLayout ? 'w-5 h-5' : 'w-6 h-6'
                  }`} />
                </div>
                <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">
                  CLICKS
                </span>
              </div>
              <div className={`font-bold text-foreground mb-1 ${
                isMobileLayout ? 'text-xl' : 'text-2xl'
              }`}>
                {analytics.totalClicks.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                {isMobileLayout ? 'WhatsApp' : 'Cliques WhatsApp'}
              </p>
            </ResponsiveCard>
          </ResponsiveGrid>
        </div>

        {/* Quick Actions */}
        <div className="space-mobile">
          <ResponsiveCard padding="lg">
            <div className="mb-6 text-center sm:text-left">
              <h2 className={`font-semibold text-foreground mb-2 ${
                isMobileLayout ? 'text-xl' : 'text-2xl'
              }`}>
                Ações Rápidas
              </h2>
              <p className="text-muted-foreground">
                {isMobileLayout 
                  ? 'Acesse as principais funcionalidades'
                  : 'Acesse rapidamente as principais funcionalidades'
                }
              </p>
            </div>
            
            <ResponsiveGrid
              cols={{ default: 1, xs: 2, md: 4 }}
              gap="md"
            >
              {quickActions.map((action, index) => (
                <QuickActionCard
                  key={index}
                  href={action.href}
                  icon={action.icon}
                  title={action.title}
                  description={action.description}
                  color={action.color as any}
                  isMobile={isMobileLayout}
                />
              ))}
            </ResponsiveGrid>
          </ResponsiveCard>
        </div>

        {/* Page Views Chart - Hidden on small mobile */}
        {pageViewsData.length > 0 && (
          <div className="space-mobile hidden sm:block">
            <ResponsiveCard padding="lg">
              <div className="mb-6">
                <h2 className={`font-semibold text-foreground mb-2 ${
                  isMobileLayout ? 'text-lg' : 'text-xl'
                }`}>
                  Visualizações por Página
                </h2>
                <p className="text-muted-foreground">
                  Acompanhe o desempenho das suas páginas
                </p>
              </div>
              <div className="w-full overflow-x-auto">
                <PageViewsChart data={pageViewsData} />
              </div>
            </ResponsiveCard>
          </div>
        )}

        {/* Stores Section */}
        <div className="space-mobile">
          <ResponsiveCard padding="lg">
            <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className={`font-semibold text-foreground mb-2 ${
                  isMobileLayout ? 'text-xl' : 'text-2xl'
                }`}>
                  {isMobileLayout ? 'Lojas' : 'Suas Lojas'}
                </h2>
                <p className="text-muted-foreground">
                  {isMobileLayout 
                    ? 'Gerencie suas lojas digitais'
                    : 'Gerencie todas as suas lojas digitais'
                  }
                </p>
              </div>
              
              <Link href="/dashboard/store/new">
                <ResponsiveButton
                  size={isMobileLayout ? 'md' : 'lg'}
                  leftIcon={<Plus className="h-4 w-4" />}
                  fullWidth={isMobileLayout}
                >
                  Nova Loja
                </ResponsiveButton>
              </Link>
            </div>

            {stores.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className={`mx-auto flex items-center justify-center rounded-2xl bg-muted mb-6 ${
                  isMobileLayout ? 'h-12 w-12' : 'h-16 w-16'
                }`}>
                  <Store className={`text-muted-foreground ${
                    isMobileLayout ? 'h-6 w-6' : 'h-8 w-8'
                  }`} />
                </div>
                <h3 className={`font-semibold text-foreground mb-3 ${
                  isMobileLayout ? 'text-lg' : 'text-xl'
                }`}>
                  Nenhuma loja criada
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed px-4">
                  {isMobileLayout
                    ? 'Crie sua primeira loja digital'
                    : 'Comece criando sua primeira loja digital e transforme seu negócio'
                  }
                </p>
                <Link href="/dashboard/store/new">
                  <ResponsiveButton
                    size={isMobileLayout ? 'lg' : 'xl'}
                    leftIcon={<Plus className="h-5 w-5" />}
                  >
                    {isMobileLayout ? 'Criar Loja' : 'Criar Primeira Loja'}
                  </ResponsiveButton>
                </Link>
              </div>
            ) : (
              <ResponsiveGrid
                cols={{ default: 1, sm: 2, lg: 3 }}
                gap="md"
              >
                {stores.map((store) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    isMobile={isMobileLayout}
                  />
                ))}
              </ResponsiveGrid>
            )}
          </ResponsiveCard>
        </div>
      </ResponsiveContainer>
    </div>
  )
}

// Store Card Component - Updated for responsiveness
function StoreCard({ store, isMobile }: { store: Store; isMobile: boolean }) {
  return (
    <div className="group relative">
      <ResponsiveCard hover className="h-full">
        <Link
          href={`/dashboard/store/${store.id}`}
          className="block p-4 sm:p-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <div className={`rounded-2xl bg-primary group-hover:bg-primary/90 flex items-center justify-center transition-all duration-300 shadow-md ${
                isMobile ? 'w-10 h-10' : 'w-12 h-12 sm:w-14 sm:h-14'
              }`}>
                <Store className={`text-primary-foreground ${
                  isMobile ? 'w-5 h-5' : 'w-5 h-5 sm:w-6 sm:h-6'
                }`} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={`font-semibold text-foreground group-hover:text-primary truncate transition-colors mb-1 ${
                  isMobile ? 'text-base' : 'text-lg'
                }`}>
                  {store.name}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground font-medium transition-colors">
                  /{store.slug}
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
              store.isActive
                ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                : 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
            }`}>
              {store.isActive ? 'Ativa' : 'Inativa'}
            </span>
          </div>

          {/* Stats */}
          <div className="bg-muted/50 rounded-xl p-3 sm:p-4 text-center group-hover:bg-muted/70 transition-all duration-300 mb-4 sm:mb-6">
            <div className={`font-bold text-foreground group-hover:text-primary transition-colors mb-1 ${
              isMobile ? 'text-xl' : 'text-2xl'
            }`}>
              {store._count.categories}
            </div>
            <div className="text-xs font-medium text-muted-foreground group-hover:text-foreground uppercase tracking-wider transition-colors">
              Categorias
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              {isMobile ? 'Ver' : 'Ver detalhes'}
            </span>
            <span className="inline-flex items-center text-primary group-hover:text-primary/80 text-sm font-medium transition-all duration-200">
              Gerenciar
              <svg className="w-4 h-4 ml-1 -mr-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </Link>
      </ResponsiveCard>
    </div>
  )
}

// Quick Action Card Component - Updated for responsiveness
function QuickActionCard({ 
  href, 
  icon: Icon, 
  title, 
  description, 
  color,
  isMobile
}: {
  href: string
  icon: any
  title: string
  description: string
  color: 'blue' | 'green' | 'purple' | 'orange'
  isMobile: boolean
}) {
  const colorClasses = {
    blue: {
      bg: 'bg-primary group-hover:bg-primary/90',
      text: 'text-primary group-hover:text-primary/80',
      border: 'group-hover:border-primary/50',
      bgHover: 'bg-primary/5'
    },
    green: {
      bg: 'bg-secondary group-hover:bg-secondary/90',
      text: 'text-secondary group-hover:text-secondary/80',
      border: 'group-hover:border-secondary/50',
      bgHover: 'bg-secondary/5'
    },
    purple: {
      bg: 'bg-accent group-hover:bg-accent/90',
      text: 'text-accent group-hover:text-accent/80',
      border: 'group-hover:border-accent/50',
      bgHover: 'bg-accent/5'
    },
    orange: {
      bg: 'bg-destructive group-hover:bg-destructive/90',
      text: 'text-destructive group-hover:text-destructive/80',
      border: 'group-hover:border-destructive/50',
      bgHover: 'bg-destructive/5'
    }
  }

  const classes = colorClasses[color]

  return (
    <div className="group relative">
      <ResponsiveCard hover className="h-full">
        <Link
          href={href}
          className="block p-4 sm:p-6 text-center h-full flex flex-col"
        >
          <div className={`mx-auto flex items-center justify-center rounded-2xl ${classes.bg} transition-all duration-300 mb-4 shadow-md group-hover:shadow-lg ${
            isMobile ? 'h-12 w-12' : 'h-14 w-14 sm:h-16 sm:w-16'
          }`}>
            <Icon className={`text-white ${
              isMobile ? 'h-6 w-6' : 'h-6 w-6 sm:h-7 sm:w-7'
            }`} />
          </div>
          
          <h3 className={`font-semibold text-foreground mb-2 transition-colors flex-shrink-0 ${
            isMobile ? 'text-sm' : 'text-base sm:text-lg'
          }`}>
            {title}
          </h3>
          
          <p className={`text-muted-foreground leading-relaxed mb-4 flex-1 ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}>
            {description}
          </p>
          
          <div className={`inline-flex items-center ${classes.text} font-medium transition-all duration-200 ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}>
            Acessar
            <svg className="w-4 h-4 ml-1 sm:ml-2 -mr-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </ResponsiveCard>
    </div>
  )
}
