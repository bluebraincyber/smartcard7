'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Calculator, Plus, CreditCard, PiggyBank, Receipt } from 'lucide-react'
import Link from 'next/link'

export default function FinancePage() {
  const router = useRouter()

  // Mock data - substituir por dados reais da API
  const [financeData, setFinanceData] = useState({
    balance: 15750.80,
    monthlyRevenue: 8450.00,
    monthlyExpenses: 3200.50,
    netProfit: 5249.50,
    transactions: 47,
    pendingPayments: 3
  })

  const quickActions = [
    {
      title: 'Entradas & Saídas',
      description: 'Registre receitas e despesas',
      href: '/dashboard/finance/ledger',
      icon: Receipt,
      color: 'blue'
    },
    {
      title: 'Relatórios',
      description: 'Visualize relatórios financeiros',
      href: '/dashboard/finance/reports',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Calculadora',
      description: 'Calcule preços e margens',
      href: '/dashboard/finance/calculator',
      icon: Calculator,
      color: 'purple'
    },
    {
      title: 'Configurações',
      description: 'Configure categorias e métodos',
      href: '/dashboard/finance/settings',
      icon: CreditCard,
      color: 'orange'
    }
  ]

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
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg mb-6">
              <DollarSign className="h-10 w-10 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-20 rounded-full blur-xl scale-150"></div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Gestão Financeira
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Controle completo das finanças do seu negócio em um só lugar
          </p>
        </div>

        {/* Finance Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Saldo Total */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                SALDO
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              R$ {financeData.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-gray-600">Saldo atual</p>
          </div>

          {/* Receitas do Mês */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                RECEITAS
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              R$ {financeData.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-gray-600">Este mês</p>
          </div>

          {/* Despesas do Mês */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full">
                DESPESAS
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              R$ {financeData.monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-gray-600">Este mês</p>
          </div>

          {/* Lucro Líquido */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                LUCRO
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              R$ {financeData.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-sm text-gray-600">Lucro líquido</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-8 mb-12">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Ações Rápidas
            </h2>
            <p className="text-gray-600">
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
                color={action.color as any}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Atividade Recente</h2>
            <Link
              href="/dashboard/finance/ledger"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Ver todas →
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Venda - Produto XYZ</p>
                  <p className="text-xs text-gray-500">Hoje às 14:30</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-green-600">+R$ 89,90</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Fornecedor ABC</p>
                  <p className="text-xs text-gray-500">Ontem às 09:15</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-red-600">-R$ 245,50</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Venda - Serviço Premium</p>
                  <p className="text-xs text-gray-500">Ontem às 16:45</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-green-600">+R$ 159,00</span>
            </div>
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