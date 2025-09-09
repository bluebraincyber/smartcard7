'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'

interface Store {
  id: string
  name: string
  slug: string
}

interface Category {
  id: string
  name: string
  order: number
  isactive: boolean
  _count: {
    items: number
  }
}

export default function CategoriesPage() {
  const params = useParams()
  const [store, setStore] = useState<Store | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchStoreAndCategories()
  }, [params.id])

  const fetchStoreAndCategories = async () => {
    try {
      console.log('🔍 Buscando dados para store ID:', params.id)
      
      // Buscar store que já inclui categories
      const storeResponse = await fetch(`/api/stores/${params.id}`)
      
      console.log('📡 Response status:', storeResponse.status)
      
      if (storeResponse.ok) {
        const storeData = await storeResponse.json()
        console.log('📦 Store data recebido:', storeData)
        console.log('📂 Categories no store data:', storeData.categories)
        console.log('Tipo de storeData.categories:', typeof storeData.categories, Array.isArray(storeData.categories) ? 'É array' : 'Não é array')
        
        setStore({
          id: storeData.id,
          name: storeData.name,
          slug: storeData.slug
        })
        
        // Extrair e formatar categorias do store
        const categoriesWithCount = (storeData.categories || []).map((cat: any) => {
          console.log('🏷️ Processando categoria:', cat)
          return {
            id: cat.id,
            name: cat.name,
            order: cat.order || 0,
            isactive: cat.isactive !== false, // Default true se undefined
            _count: {
              items: Array.isArray(cat.items) ? cat.items.length : 0
            }
          }
        })
        
        console.log('✅ Categories formatadas:', categoriesWithCount)
        setCategories(categoriesWithCount)
      } else {
        console.error('❌ Response não OK:', storeResponse.status, storeResponse.statusText)
      }
    } catch (error) {
      console.error('💥 Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    setCreating(true)
    try {
      const response = await fetch(`/api/stores/${params.id}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategoryName.trim()
        }),
      })

      if (response.ok) {
        const newCategory = await response.json()
        setCategories(prev => [...prev, newCategory])
        setNewCategoryName('')
        setShowNewForm(false)
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
    } finally {
      setCreating(false)
    }
  }

  const toggleCategoryStatus = async (categoryId: string, isactive: boolean) => {
    try {
      const response = await fetch(`/api/stores/${params.id}/categories/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isactive: !isactive }),
      })

      if (response.ok) {
        setCategories(prev => 
          prev.map(cat => 
            cat.id === categoryId ? { ...cat, isactive: !isactive } : cat
          )
        )
      }
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error)
    }
  }

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Todos os itens serão removidos.')) {
      return
    }

    try {
      const response = await fetch(`/api/stores/${params.id}/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCategories(prev => prev.filter(cat => cat.id !== categoryId))
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
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
    <div>
      <div className="mb-8">
        <Link
          href={`/dashboard/store/${params.id}`}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar à Loja
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Categorias - {store?.name}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Organize seus produtos em categorias
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Suas Categorias</h2>
            <button
              onClick={() => setShowNewForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </button>
          </div>

          {showNewForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <form onSubmit={handleCreateCategory} className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Nome da categoria"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={creating || !newCategoryName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? 'Criando...' : 'Criar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewForm(false)
                    setNewCategoryName('')
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </form>
            </div>
          )}

          {categories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma categoria criada</h3>
              <p className="text-gray-500 mb-4">
                Crie categorias para organizar seus produtos
              </p>
              <button
                onClick={() => setShowNewForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Categoria
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {category._count.items} {category._count.items === 1 ? 'item' : 'itens'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleCategoryStatus(category.id, category.isactive)}
                      className={`p-2 rounded-md ${
                        category.isactive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={category.isactive ? 'Desativar categoria' : 'Ativar categoria'}
                    >
                      {category.isactive ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>

                    <Link
                      href={`/dashboard/store/${params.id}/categories/${category.id}/items`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Gerenciar itens"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>

                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Excluir categoria"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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