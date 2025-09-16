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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-20 animate-pulse"></div>
            </div>
            <span className="mt-4 text-gray-700 font-medium">Carregando categorias...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-4 mb-6">
            <Link
              href={`/dashboard/store/${params.id}`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white/80 hover:bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm border border-gray-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar à Loja
            </Link>
          </div>
          
          {/* Hero Section */}
          <div className="text-center">
            <div className="relative mb-8">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg mb-6">
                <Plus className="h-10 w-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 opacity-20 rounded-full blur-xl scale-150"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Categorias - {store?.name}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Organize seus produtos em categorias para facilitar a navegação dos clientes
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200">
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Suas Categorias</h2>
                <p className="mt-1 text-sm text-gray-600">Gerencie as categorias da sua loja</p>
              </div>
              <button
                onClick={() => setShowNewForm(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Categoria
              </button>
            </div>
          </div>
          
          <div className="p-8">

            {showNewForm && (
              <div className="mb-8 p-6 border-2 border-dashed border-purple-200 rounded-2xl bg-purple-50/50 backdrop-blur-sm">
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Nova Categoria
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Bebidas, Pratos Principais, Sobremesas..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200"
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewForm(false)
                        setNewCategoryName('')
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={creating || !newCategoryName.trim()}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {creating ? 'Criando...' : 'Criar Categoria'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {categories.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-purple-100 mb-6">
                  <Plus className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Nenhuma categoria criada</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                  Crie categorias para organizar seus produtos e facilitar a navegação dos clientes
                </p>
                <button
                  onClick={() => setShowNewForm(true)}
                  className="inline-flex items-center px-8 py-4 border border-transparent shadow-sm text-lg font-medium rounded-2xl text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                >
                  <Plus className="mr-3 h-6 w-6" />
                  Criar Primeira Categoria
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="group bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:shadow-purple-100 hover:-translate-y-1 hover:border-purple-300 transition-all duration-300"
                  >
                    {/* Header da Categoria */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-300 mb-1">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-500 group-hover:text-purple-500 transition-colors duration-300">
                          {category._count.items} {category._count.items === 1 ? 'item' : 'itens'}
                        </p>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                        category.isactive
                          ? 'bg-green-100 text-green-700 border border-green-200 group-hover:bg-green-200 group-hover:border-green-300'
                          : 'bg-gray-100 text-gray-500 border border-gray-200 group-hover:bg-gray-200 group-hover:border-gray-300'
                      }`}>
                        {category.isactive ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleCategoryStatus(category.id, category.isactive)}
                          className={`p-2 rounded-xl transition-all duration-200 ${
                            category.isactive
                              ? 'text-green-600 hover:bg-green-50 hover:text-green-700'
                              : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                          }`}
                          title={category.isactive ? 'Desativar categoria' : 'Ativar categoria'}
                        >
                          {category.isactive ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="p-2 text-brand-blue hover:bg-brand-blue/10 hover:text-brand-blue/90 rounded-xl transition-all duration-200"
                          title="Excluir categoria"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <Link
                        href={`/dashboard/store/${params.id}/categories/${category.id}/items`}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all duration-200 group-hover:bg-purple-100"
                        title="Gerenciar itens"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Gerenciar
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}