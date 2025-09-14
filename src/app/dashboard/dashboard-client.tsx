'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Store, Plus, Eye, BarChart3, Users } from 'lucide-react'
import { Session } from 'next-auth'

interface Store {
  id: string
  name: string
  slug: string
  isActive: boolean  // Mudando para isActive
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStores()
    fetchAnalytics()
  }, [])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores')
      if (response.ok) {
        const data = await response.json()
        const userStores = data.stores || []
        setStores(userStores)
        
        // Não redirecionar automaticamente para evitar loops
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Bem-vindo, {session.user?.name || session.user?.email}! Gerencie seus cartões digitais e acompanhe o desempenho
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-4 sm:p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Store className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                    Total de Lojas
                  </dt>
                  <dd className="text-lg sm:text-xl font-medium text-gray-900">
                    {analytics.totalStores}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                    Visitas Totais
                  </dt>
                  <dd className="text-lg sm:text-xl font-medium text-gray-900">
                    {analytics.totalVisits}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                    Cliques WhatsApp
                  </dt>
                  <dd className="text-lg sm:text-xl font-medium text-gray-900">
                    {analytics.totalClicks}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stores */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Suas Lojas
            </h3>
            <Link
              href="/dashboard/store/new"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Loja
            </Link>
          </div>

          {stores.length === 0 ? (
            <div className="text-center py-12">
              <Store className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Nenhuma loja criada
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece criando sua primeira loja digital
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/store/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Loja
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="relative rounded-lg border border-gray-300 bg-white px-4 py-4 sm:px-6 sm:py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <div className="flex-shrink-0">
                    <Store className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/dashboard/store/${store.id}`} className="focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                        {store.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        smartcardweb.com.br/{store.slug}
                      </p>
                      <p className="text-xs text-gray-400">
                        {store._count.categories} categorias
                      </p>
                    </Link>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium ${
                      store.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {store.isActive ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}