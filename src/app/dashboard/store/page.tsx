'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Store, Plus, Eye, BarChart3, Edit, Settings, ExternalLink, Power, PowerOff, Package } from 'lucide-react'

interface Store {
  id: string
  name: string
  slug: string
  description?: string
  isActive: boolean  // Mudando para isActive com A maiúsculo
  createdAt: string
  _count: {
    categories: number
    analytics: number
  }
}

export default function MyStoresPage() {
  const { data: session } = useSession()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores')
      if (response.ok) {
        const data = await response.json()
        // Mapear para garantir que isactive vire isActive
        const mappedStores = (data.stores || []).map((store: any) => ({
          ...store,
          isActive: store.isActive || store.isactive // Suporta ambos os formatos
        }))
        setStores(mappedStores)
      } else {
        setError('Erro ao carregar lojas')
      }
    } catch (error) {
      setError('Erro ao carregar lojas')
    } finally {
      setLoading(false)
    }
  }

  const toggleStoreStatus = async (storeId: string, currentStatus: boolean) => {
    try {
      // Debug: log da requisição
      console.log('Toggling store:', { storeId, currentStatus })
      
      // Não precisa enviar body, a API apenas alterna o estado
      const response = await fetch(`/api/stores/${storeId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      // Debug: log da resposta
      console.log('Toggle response status:', response.status)
      
      if (response.ok) {
        const updatedStore = await response.json()
        console.log('Updated store:', updatedStore)
        
        // Atualizar o store no estado com a resposta da API
        setStores(stores.map(store => 
          store.id === storeId 
            ? { ...store, isActive: updatedStore.isActive }
            : store
        ))
      } else {
        // Pegar detalhes do erro
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Toggle error response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        
        // Mostrar mensagem de erro mais específica
        const errorMessage = errorData.error || `Erro ao alterar status da loja (${response.status})`
        setError(errorMessage)
        setTimeout(() => setError(''), 5000) // Limpar erro após 5 segundos
      }
    } catch (error) {
      console.error('Toggle catch error:', error)
      setError('Erro de conexão ao alterar status da loja')
      setTimeout(() => setError(''), 5000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Minhas Lojas</h1>
            <p className="mt-1 text-sm text-gray-600">
              Gerencie todas as suas lojas digitais
            </p>
          </div>
          <Link
            href="/dashboard/store/new"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Loja
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

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
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start min-w-0 flex-1">
                    <Store className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3 flex-shrink-0 mt-1" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                        {store.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        smartcardweb.com.br/{store.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleStoreStatus(store.id, store.isActive)}
                      className={`p-2 rounded-full transition-colors ${
                        store.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={store.isActive ? 'Desativar loja' : 'Ativar loja'}
                    >
                      {store.isActive ? (
                        <Power className="h-5 w-5" />
                      ) : (
                        <PowerOff className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {store.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {store.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    store.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {store.isActive ? 'Ativa' : 'Inativa'}
                  </span>
                  <span>{store._count.categories} categorias</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/store/${store.id}`}
                      className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Ver
                    </Link>
                    <Link
                      href={`/dashboard/store/${store.id}/edit`}
                      className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Editar
                    </Link>
                    <Link
                      href={`/dashboard/store/${store.id}/categories`}
                      className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Package className="mr-1 h-3 w-3" />
                      Gerenciar Produtos
                    </Link>
                    <Link
                      href={`/dashboard/store/${store.id}/analytics`}
                      className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <BarChart3 className="mr-1 h-3 w-3" />
                      Analytics
                    </Link>
                  </div>
                  <a
                    href={`/${store.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded text-blue-600 hover:text-blue-500 w-full sm:w-auto"
                  >
                    <ExternalLink className="mr-1 h-3 w-3" />
                    Abrir
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
