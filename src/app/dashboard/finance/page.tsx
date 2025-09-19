'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Calculator, CreditCard, PiggyBank, Receipt, Ticket } from 'lucide-react'
import Link from 'next/link'

interface QuickActionCardProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const QuickActionCard = ({ 
  href, 
  icon: Icon, 
  title, 
  description, 
  color 
}: QuickActionCardProps) => {
  const colorClasses = {
    blue: {
      bg: 'bg-primary group-hover:bg-primary/90',
      text: 'text-primary group-hover:text-primary/80',
      border: 'group-hover:border-primary/50',
      bgHover: 'bg-primary/10'
    },
    green: {
      bg: 'bg-green-500 group-hover:bg-green-600',
      text: 'text-green-600 group-hover:text-green-700',
      border: 'group-hover:border-green-500/50',
      bgHover: 'bg-green-100'
    },
    purple: {
      bg: 'bg-purple-500 group-hover:bg-purple-600',
      text: 'text-purple-600 group-hover:text-purple-700',
      border: 'group-hover:border-purple-500/50',
      bgHover: 'bg-purple-100'
    },
    orange: {
      bg: 'bg-orange-500 group-hover:bg-orange-600',
      text: 'text-orange-600 group-hover:text-orange-700',
      border: 'group-hover:border-orange-500/50',
      bgHover: 'bg-orange-100'
    }
  }

  return (
    <Link
      href={href}
      className={`group relative flex flex-col items-center p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300 overflow-hidden ${colorClasses[color].border}`}
    >
      <div className={`absolute top-0 right-0 w-full h-1 ${colorClasses[color].bg}`}></div>
      <div className={`w-12 h-12 rounded-xl ${colorClasses[color].bgHover} flex items-center justify-center mb-4`}>
        <Icon className={`w-6 h-6 ${colorClasses[color].text}`} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground text-center">{description}</p>
    </Link>
  )
}

export default function FinancePage() {
  // Mock data - substituir por dados reais da API
  const [financeData, setFinanceData] = useState({
    balance: 15750.80,
    monthlyRevenue: 8450.00,
    monthlyExpenses: 3200.50,
    netProfit: 5249.50,
    transactions: 47,
    pendingPayments: 3,
    averageTicket: 0
  })

  // Calcular ticket médio (receita mensal / número de transações)
  useEffect(() => {
    if (financeData.transactions > 0) {
      setFinanceData(prev => ({
        ...prev,
        averageTicket: prev.monthlyRevenue / prev.transactions
      }))
    }
  }, [financeData.monthlyRevenue, financeData.transactions])

  const quickActions = [
    {
      title: 'Entradas & Saídas',
      description: 'Registre receitas e despesas',
      href: '/dashboard/finance/ledger',
      icon: Receipt,
      color: 'blue' as const
    },
    {
      title: 'Relatórios',
      description: 'Visualize relatórios financeiros',
      href: '/dashboard/finance/reports',
      icon: TrendingUp,
      color: 'green' as const
    },
    {
      title: 'Calculadora',
      description: 'Calcule preços e margens',
      href: '/dashboard/finance/calculator',
      icon: Calculator,
      color: 'purple' as const
    },
    {
      title: 'Configurações',
      description: 'Configure categorias e métodos',
      href: '/dashboard/finance/settings',
      icon: CreditCard,
      color: 'orange' as const
    }
  ]

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
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-success shadow-lg mb-6 relative z-10">
              <DollarSign className="h-10 w-10 text-success-foreground" />
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-success/30 dark:bg-success/40 rounded-full blur-2xl animate-pulse"></div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Gestão Financeira
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Controle completo das finanças do seu negócio em um só lugar
          </p>
        </div>

        {/* Finance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {/* Saldo Total */}
          <div className="bg-card backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                SALDO
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              R$ {financeData.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-muted-foreground">Saldo atual</p>
          </div>

          {/* Receitas do Mês */}
          <div className="bg-card backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-success flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                RECEITAS
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              R$ {financeData.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-muted-foreground">Este mês</p>
          </div>

          {/* Despesas do Mês */}
          <div className="bg-card backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-destructive flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-destructive-foreground" />
              </div>
              <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                DESPESAS
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              R$ {financeData.monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-muted-foreground">Este mês</p>
          </div>

          {/* Lucro Líquido */}
          <div className="bg-card backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                <Calculator className="w-6 h-6 text-accent-foreground" />
              </div>
              <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">
                LUCRO
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              R$ {financeData.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-muted-foreground">Lucro líquido</p>
          </div>

          {/* Ticket Médio */}
          <div className="bg-card backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                TICKET MÉDIO
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              R$ {financeData.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-muted-foreground">
              {financeData.transactions} {financeData.transactions === 1 ? 'venda' : 'vendas'} no mês
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card backdrop-blur-sm rounded-3xl shadow-xl border border-border p-8 mb-12">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Ações Rápidas
            </h2>
            <p className="text-muted-foreground">
              Acesse rapidamente as principais funcionalidades financeiras
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
                color={action.color}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card backdrop-blur-sm rounded-3xl shadow-xl border border-border p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Atividade Recente</h2>
            <Link
              href="/dashboard/finance/ledger"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Ver todas →
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Venda - Produto XYZ</p>
                  <p className="text-xs text-muted-foreground">Hoje às 14:30</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-success">+R$ 89,90</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Fornecedor ABC</p>
                  <p className="text-xs text-muted-foreground">Ontem às 09:15</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-destructive">-R$ 245,50</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Venda - Serviço Premium</p>
                  <p className="text-xs text-muted-foreground">Ontem às 16:45</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-success">+R$ 159,00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
