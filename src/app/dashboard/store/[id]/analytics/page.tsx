'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, TrendingUp, MessageCircle, Eye, Users } from 'lucide-react'
import Link from 'next/link'

interface AnalyticsData {
  period: string
  summary: {
    totalViews: number
    totalWhatsappClicks: number
    conversionRate: number
    whatsappByType: Record<string, number>
  }
  chartData: Array<{
    date: string
    visits: number
    whatsappClicks: number
  }>
}

interface Store {
  id: string
  name: string
  slug: string
}

export default function StoreAnalyticsPage() {
  const params = useParams()
  const [store, setStore] = useState<Store | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7d')

  const fetchStore = useCallback(async () => {
    try {
      const response = await fetch(`/api/stores/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setStore(data)
      }
    } catch {
      console.error('Erro ao carregar loja')
    }
  }, [params.id])

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`/api/stores/${params.id}/analytics?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch {
      console.error('Erro ao carregar analytics')
    } finally {
      setLoading(false)
    }
  }, [params.id, period])

  useEffect(() => {
    fetchStore()
    fetchAnalytics()
  }, [fetchStore, fetchAnalytics])

  const getTypeDisplayName = (type: string) => {
    const names: Record<string, string> = {
      order: 'Pedidos',
      catalog: 'Catálogo',
      general: 'Geral'
    }
    return names[type] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link
            href={`/dashboard/store/${params.id}`}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Analytics - {store?.name}
            </h1>
            <p className="text-gray-600">Métricas e desempenho da sua loja</p>
          </div>
          <div className="flex space-x-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
            </select>
          </div>
        </div>
      </div>

      {analytics && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Visualizações</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.summary.totalViews}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cliques WhatsApp</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.summary.totalWhatsappClicks}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.summary.conversionRate}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Engajamento</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.summary.totalViews > 0 ? 'Ativo' : 'Baixo'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Daily Activity Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Atividade Diária
              </h3>
              <div className="space-y-4">
                {analytics.chartData.map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit'
                      })}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">
                          {day.visits} visitas
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-600">
                          {day.whatsappClicks} cliques
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp Clicks by Type */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Cliques por Tipo
              </h3>
              <div className="space-y-4">
                {Object.entries(analytics.summary.whatsappByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {getTypeDisplayName(type)}
                    </div>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${(count / analytics.summary.totalWhatsappClicks) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Insights e Recomendações
            </h3>
            <div className="space-y-3">
              {analytics.summary.conversionRate > 10 && (
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                  <p className="text-sm text-gray-600">
                    Excelente taxa de conversão! Seus visitantes estão engajados.
                  </p>
                </div>
              )}
              {analytics.summary.conversionRate < 5 && analytics.summary.totalViews > 10 && (
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
                  <p className="text-sm text-gray-600">
                    Taxa de conversão baixa. Considere melhorar a apresentação dos produtos ou adicionar mais informações.
                  </p>
                </div>
              )}
              {analytics.summary.totalViews === 0 && (
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
                  <p className="text-sm text-gray-600">
                    Nenhuma visita registrada. Compartilhe o link da sua loja para começar a receber visitantes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}