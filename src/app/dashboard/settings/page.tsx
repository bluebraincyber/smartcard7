'use client'

import { Suspense, useState } from 'react'
import { ArrowLeft, User, Shield, Bell, Zap, Download, RefreshCw, HelpCircle, LogOut, Trash2, Settings, Globe, Palette, Database } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Dynamically import settings components
const AccountSettingsCard = dynamic(
  () => import('@/components/settings/AccountSettingsCard'),
  { ssr: false, loading: () => <SettingsCardSkeleton /> }
)

const SecuritySettingsCard = dynamic(
  () => import('@/components/settings/SecuritySettingsCard'),
  { ssr: false, loading: () => <SettingsCardSkeleton /> }
)

const NotificationsSettingsCard = dynamic(
  () => import('@/components/settings/NotificationsSettingsCard'),
  { ssr: false, loading: () => <SettingsCardSkeleton /> }
)

const IntegrationsCard = dynamic(
  () => import('@/components/settings/IntegrationsCard'),
  { ssr: false, loading: () => <SettingsCardSkeleton /> }
)

function SettingsCardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
        <div className="h-10 bg-muted rounded animate-pulse"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
        <div className="h-10 bg-muted rounded animate-pulse"></div>
      </div>
      <div className="pt-2">
        <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account')

  const settingsSections = [
    {
      id: 'account',
      title: 'Informações da Conta',
      description: 'Atualize suas informações pessoais',
      icon: User,
      color: 'blue',
      component: AccountSettingsCard
    },
    {
      id: 'security',
      title: 'Segurança',
      description: 'Gerencie sua senha e configurações de segurança',
      icon: Shield,
      color: 'green',
      component: SecuritySettingsCard
    },
    {
      id: 'notifications',
      title: 'Notificações',
      description: 'Configure suas preferências de notificação',
      icon: Bell,
      color: 'purple',
      component: NotificationsSettingsCard
    },
    {
      id: 'integrations',
      title: 'Integrações',
      description: 'Conecte seus serviços favoritos',
      icon: Zap,
      color: 'orange',
      component: IntegrationsCard
    }
  ]

  const quickActions = [
    {
      title: 'Exportar Dados',
      description: 'Baixe todos os seus dados',
      action: () => alert('Exportando dados...'),
      icon: Download,
      color: 'blue'
    },
    {
      title: 'Sincronizar Conta',
      description: 'Atualize dados em tempo real',
      action: () => alert('Sincronizando...'),
      icon: RefreshCw,
      color: 'green'
    },
    {
      title: 'Central de Ajuda',
      description: 'Encontre respostas e suporte',
      action: () => alert('Abrindo ajuda...'),
      icon: HelpCircle,
      color: 'purple'
    },
    {
      title: 'Preferências',
      description: 'Customize sua experiência',
      action: () => alert('Abrindo preferências...'),
      icon: Palette,
      color: 'orange'
    }
  ]

  const colorClasses = {
    blue: {
      bg: 'bg-primary',
      text: 'text-primary',
      bgLight: 'bg-primary/10',
      bgHover: 'bg-primary/10'
    },
    green: {
      bg: 'bg-secondary',
      text: 'text-secondary',
      bgLight: 'bg-secondary/10',
      bgHover: 'bg-secondary/10'
    },
    purple: {
      bg: 'bg-accent',
      text: 'text-accent',
      bgLight: 'bg-accent/10',
      bgHover: 'bg-accent/10'
    },
    orange: {
      bg: 'bg-destructive',
      text: 'text-destructive',
      bgLight: 'bg-destructive/10',
      bgHover: 'bg-destructive/10'
    }
  }

  const activeSection = settingsSections.find(section => section.id === activeTab)
  const ActiveComponent = activeSection?.component

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
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-muted shadow-lg mb-6">
              <Settings className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="absolute inset-0 bg-muted opacity-20 rounded-full blur-xl scale-150"></div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Configurações
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Gerencie suas preferências, segurança e configurações de conta
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-card backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-foreground mb-6">Configurações</h2>
              <nav className="space-y-2">
                {settingsSections.map((section) => {
                  const Icon = section.icon
                  const colors = colorClasses[section.color as keyof typeof colorClasses]
                  const isActive = activeTab === section.id
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveTab(section.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                        isActive
                          ? `${colors.bgLight} ${colors.text} shadow-sm`
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span className="font-medium">{section.title}</span>
                    </button>
                  )
                })}
              </nav>

              {/* Account Status */}
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4">Status da Conta</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                    <span className="text-sm text-muted-foreground">Conta verificada</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                    <span className="text-sm text-muted-foreground">E-mail confirmado</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-warning rounded-full mr-3"></div>
                    <span className="text-sm text-muted-foreground">2FA desabilitado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Active Settings Section */}
            {activeSection && (
              <div className="bg-card backdrop-blur-sm rounded-3xl shadow-xl border border-border p-8">
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 rounded-xl ${colorClasses[activeSection.color as keyof typeof colorClasses].bgLight} flex items-center justify-center mr-4`}>
                      <activeSection.icon className={`w-6 h-6 ${colorClasses[activeSection.color as keyof typeof colorClasses].text}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground">
                        {activeSection.title}
                      </h2>
                      <p className="text-muted-foreground">
                        {activeSection.description}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Suspense fallback={<SettingsCardSkeleton />}>
                  {ActiveComponent && <ActiveComponent />}
                </Suspense>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-card backdrop-blur-sm rounded-3xl shadow-xl border border-border p-8">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Ações Rápidas
                </h2>
                <p className="text-muted-foreground">
                  Acesse rapidamente funcionalidades importantes
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Danger Zone */}
            <div className="bg-card backdrop-blur-sm rounded-3xl shadow-xl border border-destructive/20 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-destructive mb-2">
                  Zona de Perigo
                </h2>
                <p className="text-muted-foreground">
                  Ações irreversíveis que afetam sua conta
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="flex items-center justify-center px-6 py-4 text-destructive bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 hover:border-destructive/30 rounded-xl transition-all duration-200 font-medium">
                  <LogOut className="w-5 h-5 mr-3" />
                  Sair de todos os dispositivos
                </button>
                <button className="flex items-center justify-center px-6 py-4 text-destructive bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 hover:border-destructive/30 rounded-xl transition-all duration-200 font-medium">
                  <Trash2 className="w-5 h-5 mr-3" />
                  Excluir conta permanentemente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
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
        className={`w-full h-full bg-card backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-border hover:shadow-2xl transition-all duration-300 text-left ${classes.border}`}
      >
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${classes.bg} transition-all duration-300 flex items-center justify-center shadow-md group-hover:shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        <div className={`mt-4 inline-flex items-center ${classes.text} text-sm font-medium transition-all duration-200`}>
          Executar
          <svg className="w-4 h-4 ml-2 -mr-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </div>
  )
}