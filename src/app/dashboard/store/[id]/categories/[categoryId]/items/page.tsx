'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { AdminProductCard } from '@/components/ui/AdminProductCard'

interface Store {
  id: string
  name: string
  slug: string
}

interface Category {
  id: string
  name: string
}

interface Item {
  id: string
  name: string
  description?: string
  price?: number
  image?: string
  order: number
  isactive: boolean
  isarchived: boolean
}

export default function ItemsPage() {
  const params = useParams()
  const [store, setStore] = useState<Store | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: ''
  })

  const fetchData = useCallback(async () => {
    try {
      const [storeResponse, categoryResponse, itemsResponse] = await Promise.all([
        fetch(`/api/stores/${params.id}`),
        fetch(`/api/stores/${params.id}/categories/${params.categoryId}`),
        fetch(`/api/stores/${params.id}/categories/${params.categoryId}/items`)
      ])

      if (storeResponse.ok) {
        const storeData = await storeResponse.json()
        setStore(storeData)
      }

      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json()
        setCategory(categoryData)
      }

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json()
        setItems(itemsData)
      }
    } catch {
      console.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [params.id, params.categoryId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: ''
    })
    setEditingItem(null)
    setShowNewForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setCreating(true)
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: formData.price ? parseFloat(formData.price) : null,
        image: formData.image.trim() || null
      }

      const url = editingItem
        ? `/api/stores/${params.id}/categories/${params.categoryId}/items/${editingItem.id}`
        : `/api/stores/${params.id}/categories/${params.categoryId}/items`
      
      const method = editingItem ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const itemData = await response.json()
        
        if (editingItem) {
          setItems(prev => 
            prev.map(item => 
              item.id === editingItem.id ? itemData : item
            )
          )
        } else {
          setItems(prev => [...prev, itemData])
        }
        
        resetForm()
      }
    } catch (error) {
      console.error('Erro ao salvar item:', error)
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (item: Item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price ? item.price.toString() : '',
      image: item.image || ''
    })
    setShowNewForm(true)
  }

  const handleToggleActive = async (itemId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/stores/${params.id}/categories/${params.categoryId}/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isactive: isActive }),
      })

      if (response.ok) {
        setItems(prev => 
          prev.map(item => 
            item.id === itemId ? { ...item, isactive: isActive } : item
          )
        )
      }
    } catch (error) {
      console.error('Erro ao atualizar status do item:', error)
    }
  }

  const handleTogglePause = async (itemId: string, isPaused: boolean) => {
    try {
      const response = await fetch(`/api/stores/${params.id}/categories/${params.categoryId}/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isarchived: isPaused }),
      })

      if (response.ok) {
        setItems(prev => 
          prev.map(item => 
            item.id === itemId ? { ...item, isarchived: isPaused } : item
          )
        )
      }
    } catch (error) {
      console.error('Erro ao pausar/retomar item:', error)
    }
  }

  const handleDuplicate = async (itemId: string) => {
    const itemToDuplicate = items.find(item => item.id === itemId)
    if (!itemToDuplicate) return

    try {
      const payload = {
        name: `${itemToDuplicate.name} (Cópia)`,
        description: itemToDuplicate.description,
        price: itemToDuplicate.price,
        image: itemToDuplicate.image
      }

      const response = await fetch(`/api/stores/${params.id}/categories/${params.categoryId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const newItem = await response.json()
        setItems(prev => [...prev, newItem])
      }
    } catch (error) {
      console.error('Erro ao duplicar item:', error)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) {
      return
    }

    try {
      const response = await fetch(`/api/stores/${params.id}/categories/${params.categoryId}/items/${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setItems(prev => prev.filter(item => item.id !== itemId))
      }
    } catch (error) {
      console.error('Erro ao excluir item:', error)
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
            <span className="mt-4 text-gray-700 font-medium">Carregando produtos...</span>
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
              href={`/dashboard/store/${params.id}/categories`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white/80 hover:bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm border border-gray-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar às Categorias
            </Link>
          </div>
          
          {/* Hero Section */}
          <div className="text-center">
            <div className="relative mb-8">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg mb-6">
                <Plus className="h-10 w-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-20 rounded-full blur-xl scale-150"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              {category?.name} - {store?.name}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Gerencie os produtos desta categoria
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200">
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Produtos da Categoria</h2>
                <p className="mt-1 text-sm text-gray-600">Adicione e gerencie os produtos desta categoria</p>
              </div>
              <button
                onClick={() => setShowNewForm(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </button>
            </div>
          </div>
          
          <div className="p-8">

            {showNewForm && (
              <div className="mb-8 p-6 border-2 border-dashed border-green-200 rounded-2xl bg-green-50/50 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  {editingItem ? 'Editar Produto' : 'Novo Produto'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Produto *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all duration-200"
                        placeholder="Ex: Corte Masculino, Barba Completa..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preço</label>
                      <div className="relative rounded-xl shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm font-medium">R$</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                          className="pl-12 w-full border-gray-300 rounded-xl shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all duration-200"
                          placeholder="25,00"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all duration-200"
                      placeholder="Descreva o produto ou serviço..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL da Imagem</label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all duration-200"
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={creating || !formData.name.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {creating ? 'Salvando...' : (editingItem ? 'Atualizar Produto' : 'Criar Produto')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-green-100 mb-6">
                  <Plus className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Nenhum produto criado</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                  Adicione produtos a esta categoria para começar a vender
                </p>
                <button
                  onClick={() => setShowNewForm(true)}
                  className="inline-flex items-center px-8 py-4 border border-transparent shadow-sm text-lg font-medium rounded-2xl text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-200"
                >
                  <Plus className="mr-3 h-6 w-6" />
                  Criar Primeiro Produto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {items.map((item) => (
                <AdminProductCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  description={item.description}
                  price={item.price || 0}
                  image={item.image}
                  isActive={item.isactive}
                  isPaused={item.isarchived}
                  onToggleActive={handleToggleActive}
                  onTogglePause={handleTogglePause}
                  onEdit={() => startEdit(item)}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
