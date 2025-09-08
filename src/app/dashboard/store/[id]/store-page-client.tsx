'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Plus, Edit, Trash2, Eye, ExternalLink } from 'lucide-react'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import ProductEditModal from '@/components/ui/ProductEditModal'

interface Store {
  id: string
  name: string
  slug: string
  description?: string
  whatsapp: string
  address?: string
  primaryColor: string
  isactive: boolean
  categories: Category[]
}

interface Category {
  id: string
  name: string
  isactive: boolean
  items: Item[]
}

interface Item {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  isactive: boolean
  isAvailable: boolean
}

interface StorePageClientProps {
  store: Store
}

export default function StorePageClient({ store: initialStore }: StorePageClientProps) {
  const router = useRouter()
  const [store, setStore] = useState<Store>(initialStore)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} })
  const [editModal, setEditModal] = useState<{
    isOpen: boolean
    product: Item | null
  }>({ isOpen: false, product: null })

  const fetchStore = async () => {
    try {
      const response = await fetch(`/api/stores/${store.id}`)
      if (response.ok) {
        const data = await response.json()
        setStore(data)
      }
    } catch (error) {
      console.error('Erro ao recarregar loja:', error)
    }
  }

  const toggleStoreStatus = async () => {
    try {
      const response = await fetch(`/api/stores/${store.id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isactive: !store.isactive,
        }),
      })

      if (response.ok) {
        setStore({ ...store, isactive: !store.isactive })
      }
    } catch {
      console.error('Erro ao alternar status da loja')
    }
  }

  const toggleCategoryStatus = async (categoryId: string, isactive: boolean) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isactive: !isactive }),
      })

      if (response.ok) {
        fetchStore() // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error)
    }
  }

  const toggleItemStatus = async (itemId: string, isactive: boolean) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isactive: !isactive }),
      })

      if (response.ok) {
        fetchStore() // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao atualizar item:', error)
    }
  }

  const toggleItemAvailability = async (itemId: string, isAvailable: boolean) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAvailable: !isAvailable }),
      })

      if (response.ok) {
        fetchStore() // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error)
    }
  }

  const deleteCategory = async (categoryId: string) => {
    setDeletingCategoryId(categoryId)
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchStore() // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao deletar categoria:', error)
    } finally {
      setDeletingCategoryId(null)
    }
  }

  const deleteItem = async (itemId: string) => {
    setDeletingItemId(itemId)
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchStore() // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao deletar item:', error)
    } finally {
      setDeletingItemId(null)
    }
  }

  const deleteStore = async () => {
    if (deleteConfirmText !== store.name) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/stores/${store.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Erro ao deletar loja:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/${store.slug}`}
                target="_blank"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Eye className="mr-2 h-4 w-4" />
                Visualizar Loja
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href={`/dashboard/store/${store.id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar Loja
              </Link>
            </div>
          </div>
        </div>

        {/* Store Info */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
                <p className="mt-1 text-sm text-gray-600">
                  smartcardweb.com.br/{store.slug}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  store.isactive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {store.isactive ? 'Ativa' : 'Inativa'}
                </span>
                <button
                  onClick={toggleStoreStatus}
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    store.isactive
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  }`}
                >
                  {store.isactive ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">WhatsApp</dt>
                <dd className="mt-1 text-sm text-gray-900">{store.whatsapp || 'Não informado'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Endereço</dt>
                <dd className="mt-1 text-sm text-gray-900">{store.address || 'Não informado'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Cor Principal</dt>
                <dd className="mt-1 flex items-center">
                  <div 
                    className="w-4 h-4 rounded mr-2" 
                    style={{ backgroundColor: store.primaryColor }}
                  ></div>
                  <span className="text-sm text-gray-900">{store.primaryColor}</span>
                </dd>
              </div>
            </div>
            {store.description && (
              <div className="mt-4">
                <dt className="text-sm font-medium text-gray-500">Descrição</dt>
                <dd className="mt-1 text-sm text-gray-900">{store.description}</dd>
              </div>
            )}
          </div>
        </div>

        {/* Categories and Items */}
        <div className="space-y-6">
          {store.categories.map((category) => (
            <div key={category.id} className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-medium text-gray-900">{category.name}</h2>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      category.isactive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.isactive ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/dashboard/store/${store.id}/category/${category.id}/item/new`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Novo Item
                    </Link>
                    <button
                      onClick={() => toggleCategoryStatus(category.id, category.isactive)}
                      className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        category.isactive
                          ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                          : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      }`}
                    >
                      {category.isactive ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => setConfirmModal({
                        isOpen: true,
                        title: 'Deletar Categoria',
                        message: `Tem certeza que deseja deletar a categoria "${category.name}"? Esta ação não pode ser desfeita.`,
                        onConfirm: () => {
                          deleteCategory(category.id)
                          setConfirmModal({ ...confirmModal, isOpen: false })
                        }
                      })}
                      disabled={deletingCategoryId === category.id}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4">
                {category.items.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum item nesta categoria</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.items.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        {item.image && (
                          <div className="mb-3">
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={200}
                              height={150}
                              className="w-full h-32 object-cover rounded"
                            />
                          </div>
                        )}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            )}
                            <p className="text-lg font-bold text-gray-900 mt-2">
                              R$ {Number(item.price || 0).toFixed(2)}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                item.isactive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {item.isactive ? 'Ativo' : 'Inativo'}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                item.isAvailable 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {item.isAvailable ? 'Disponível' : 'Indisponível'}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-1 ml-2">
                            <button
                              onClick={() => setEditModal({ isOpen: true, product: item })}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => toggleItemStatus(item.id, item.isactive)}
                              className={`p-1 ${
                                item.isactive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                              }`}
                              title={item.isactive ? 'Desativar' : 'Ativar'}
                            >
                              {item.isactive ? '🔴' : '🟢'}
                            </button>
                            <button
                              onClick={() => toggleItemAvailability(item.id, item.isAvailable)}
                              className={`p-1 ${
                                item.isAvailable ? 'text-yellow-600 hover:text-yellow-800' : 'text-blue-600 hover:text-blue-800'
                              }`}
                              title={item.isAvailable ? 'Marcar como indisponível' : 'Marcar como disponível'}
                            >
                              {item.isAvailable ? '⏸️' : '▶️'}
                            </button>
                            <button
                              onClick={() => setConfirmModal({
                                isOpen: true,
                                title: 'Deletar Item',
                                message: `Tem certeza que deseja deletar o item "${item.name}"? Esta ação não pode ser desfeita.`,
                                onConfirm: () => {
                                  deleteItem(item.id)
                                  setConfirmModal({ ...confirmModal, isOpen: false })
                                }
                              })}
                              disabled={deletingItemId === item.id}
                              className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                              title="Deletar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Delete Store Section */}
        <div className="mt-12 bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-900 mb-4">Zona de Perigo</h3>
          <p className="text-sm text-red-700 mb-4">
            Deletar esta loja removerá permanentemente todos os dados, incluindo categorias e itens. Esta ação não pode ser desfeita.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Deletar Loja
          </button>
        </div>
      </div>

      {/* Delete Store Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Deletar Loja</h3>
              <p className="text-sm text-gray-600 mb-4">
                Esta ação não pode ser desfeita. Para confirmar, digite o nome da loja: <strong>{store.name}</strong>
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Digite o nome da loja"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteConfirmText('')
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={deleteStore}
                  disabled={deleteConfirmText !== store.name || isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deletando...' : 'Deletar Loja'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />

      {/* Product Edit Modal */}
      <ProductEditModal
        isOpen={editModal.isOpen}
        product={editModal.product}
        onClose={() => setEditModal({ isOpen: false, product: null })}
        onSave={() => {
          fetchStore()
          setEditModal({ isOpen: false, product: null })
        }}
      />
    </div>
  )
}