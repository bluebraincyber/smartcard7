'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff, DollarSign } from 'lucide-react'

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
  isAvailable: boolean
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

  useEffect(() => {
    fetchData()
  }, [params.id, params.categoryId, fetchData])

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

  const toggleItemStatus = async (itemId: string, field: 'isactive' | 'isAvailable', currentValue: boolean) => {
    try {
      const response = await fetch(`/api/stores/${params.id}/categories/${params.categoryId}/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: !currentValue }),
      })

      if (response.ok) {
        setItems(prev => 
          prev.map(item => 
            item.id === itemId ? { ...item, [field]: !currentValue } : item
          )
        )
      }
    } catch (error) {
      console.error('Erro ao atualizar item:', error)
    }
  }

  const deleteItem = async (itemId: string) => {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/dashboard/store/${params.id}/categories`}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar às Categorias
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          {category?.name} - {store?.name}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Gerencie os itens desta categoria
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Itens da Categoria</h2>
            <button
              onClick={() => setShowNewForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Item
            </button>
          </div>

          {showNewForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? 'Editar Item' : 'Novo Item'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Nome do item"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Descrição do item"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Preço</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">R$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="pl-12 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">URL da Imagem</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !formData.name.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creating ? 'Salvando...' : (editingItem ? 'Atualizar' : 'Criar')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item criado</h3>
              <p className="text-gray-500 mb-4">
                Adicione itens a esta categoria
              </p>
              <button
                onClick={() => setShowNewForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {item.image && (
                    <div className="relative w-full h-32 mb-3">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900 flex-1">
                      {item.name}
                    </h3>
                    <div className="flex items-center space-x-1 ml-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.isactive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.isactive ? 'Ativo' : 'Inativo'}
                      </span>
                      {!item.isAvailable && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Indisponível
                        </span>
                      )}
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {item.price && (
                    <div className="flex items-center text-sm font-medium text-green-600 mb-3">
                      <DollarSign className="h-4 w-4 mr-1" />
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleItemStatus(item.id, 'isactive', item.isactive)}
                        className={`p-1 rounded ${
                          item.isactive
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={item.isactive ? 'Desativar item' : 'Ativar item'}
                      >
                        {item.isactive ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>

                      <button
                        onClick={() => startEdit(item)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar item"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Excluir item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => toggleItemStatus(item.id, 'isAvailable', item.isAvailable)}
                      className={`text-xs px-2 py-1 rounded ${
                        item.isAvailable
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {item.isAvailable ? 'Disponível' : 'Indisponível'}
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