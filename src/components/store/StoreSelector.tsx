'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Store, Check, Plus } from 'lucide-react'
import Link from 'next/link'

interface Store {
  id: string
  name: string
  slug: string
  isactive: boolean
  categories?: number
  products?: number
}

interface StoreSelectorProps {
  currentStoreId: string
  currentStoreName: string
  className?: string
}

export default function StoreSelector({ currentStoreId, currentStoreName, className = '' }: StoreSelectorProps) {
  const router = useRouter()
  const [stores, setStores] = useState<Store[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stores')
      if (response.ok) {
        const data = await response.json()
        const mappedStores = (data.stores || []).map((store: any) => ({
          id: store.id,
          name: store.name,
          slug: store.slug,
          isactive: store.isActive ?? store.isactive ?? true,
          categories: store._count?.categories || 0,
          products: store._count?.products || 0,
        }))
        setStores(mappedStores)
      }
    } catch (error) {
      console.error('Erro ao buscar lojas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStoreChange = (storeId: string) => {
    setIsOpen(false)
    router.push(`/dashboard/store/${storeId}`)
  }

  // Filtrar lojas ativas primeiro, depois inativas
  const activeStores = stores.filter(store => store.isactive)
  const inactiveStores = stores.filter(store => !store.isactive)
  const allStores = [...activeStores, ...inactiveStores]

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 w-full max-w-sm px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Store className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-gray-900 truncate">
              {currentStoreName}
            </p>
            <p className="text-xs text-gray-500">
              Trocar loja • {stores.length} disponível{stores.length !== 1 ? 'is' : ''}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-2 max-h-80 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-3 text-center text-sm text-gray-500">
                Carregando lojas...
              </div>
            ) : stores.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <Store className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-3">Nenhuma loja encontrada</p>
                <Link
                  href="/dashboard/store/new"
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Criar Primeira Loja
                </Link>
              </div>
            ) : (
              <>
                {/* Lista de Lojas Ativas */}
                {activeStores.length > 0 && (
                  <>
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Lojas Ativas ({activeStores.length})
                    </div>
                    {activeStores.map((store) => (
                      <button
                        key={store.id}
                        onClick={() => handleStoreChange(store.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                          store.id === currentStoreId ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {store.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {store.categories || 0} categorias • {store.products || 0} produtos
                          </p>
                        </div>
                        {store.id === currentStoreId && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </>
                )}

                {/* Lista de Lojas Inativas */}
                {inactiveStores.length > 0 && (
                  <>
                    {activeStores.length > 0 && (
                      <div className="border-t border-gray-100 my-2"></div>
                    )}
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      Lojas Inativas ({inactiveStores.length})
                    </div>
                    {inactiveStores.map((store) => (
                      <button
                        key={store.id}
                        onClick={() => handleStoreChange(store.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors opacity-75 ${
                          store.id === currentStoreId ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-medium text-gray-600 truncate">
                            {store.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            Inativa • {store.categories || 0} categorias • {store.products || 0} produtos
                          </p>
                        </div>
                        {store.id === currentStoreId && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </>
                )}

                {/* Botão Criar Nova Loja */}
                <div className="border-t border-gray-100 mt-2">
                  <Link
                    href="/dashboard/store/new"
                    className="w-full flex items-center space-x-3 px-4 py-3 text-blue-600 hover:bg-blue-50 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <Plus className="w-3 h-3 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">Criar Nova Loja</p>
                      <p className="text-xs text-blue-500">Configure uma nova loja digital</p>
                    </div>
                  </Link>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}