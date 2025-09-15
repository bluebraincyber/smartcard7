'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Eye, MousePointer, MessageCircle, TrendingUp } from 'lucide-react'

interface AnalyticsData {
  totalViews: number
  totalClicks: number
  totalWhatsAppClicks: number
  viewsThisMonth: number
  clicksThisMonth: number
  dailyViews: Array<{ date: string; views: number; clicks: number }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/summary')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Erro ao carregar analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Dados de exemplo para demonstração
  const mockData = {
    totalViews: 127,
    totalClicks: 23,
    totalWhatsAppClicks: 18,
    viewsThisMonth: 89,
    clicksThisMonth: 15,
    dailyViews: [
      { date: '01/12', views: 12, clicks: 2 },
      { date: '02/12', views: 8, clicks: 1 },
      { date: '03/12', views: 15, clicks: 3 },
      { date: '04/12', views: 22, clicks: 4 },
      { date: '05/12', views: 18, clicks: 2 },
      { date: '06/12', views: 25, clicks: 5 },
      { date: '07/12', views: 27, clicks: 6 },
    ]
  }

  const data = analytics || mockData

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Acompanhe o desempenho dos seus cartões digitais
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Visualizações Totais</p>
                <p className="text-2xl font-semibold text-gray-900">{data.totalViews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MousePointer className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cliques Totais</p>
                <p className="text-2xl font-semibold text-gray-900">{data.totalClicks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cliques WhatsApp</p>
                <p className="text-2xl font-semibold text-gray-900">{data.totalWhatsAppClicks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {data.totalViews > 0 ? ((data.totalWhatsAppClicks / data.totalViews) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Views Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Visualizações Diárias (Últimos 7 dias)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.dailyViews}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Visualizações"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Clicks Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cliques Diários (Últimos 7 dias)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.dailyViews}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="clicks" 
                  fill="#10B981"
                  name="Cliques"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo de Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{data.viewsThisMonth}</p>
              <p className="text-sm text-gray-600">Visualizações este mês</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{data.clicksThisMonth}</p>
              <p className="text-sm text-gray-600">Cliques este mês</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {data.viewsThisMonth > 0 ? ((data.clicksThisMonth / data.viewsThisMonth) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-gray-600">Taxa de engajamento</p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Dicas para melhorar seu desempenho</h3>
          <ul className="text-blue-800 space-y-2">
            <li>• Mantenha seu catálogo sempre atualizado com produtos em destaque</li>
            <li>• Use descrições atrativas e preços competitivos</li>
            <li>• Compartilhe o link do seu cartão digital nas redes sociais</li>
            <li>• Responda rapidamente às mensagens no WhatsApp</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

