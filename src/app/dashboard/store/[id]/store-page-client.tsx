'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit, Trash2, Eye, ExternalLink } from 'lucide-react'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import ProductEditModal from '@/components/ui/ProductEditModal'
import { AdminProductCard } from '@/components/ui/AdminProductCard'

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
  isarchived: boolean
}

interface StorePageClientProps {
  store: Store
}

export default function StorePageClient({ store: initialStore }: StorePageClientProps) {
  const router = useRouter()
  const [store, setStore] = useState<Store>({
    ...initialStore,
    categories: initialStore.categories?.map(category => ({
      ...category,
      items: category.items || []
    })) || []
  })

  useEffect(() => {
    fetchStore()
  }, [])

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
    onClose: () => void
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {}, onClose: () => {} })
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

  // Handler para o AdminProductCard - ativar/desativar
  const handleToggleActive = async (itemId: string, isActive: boolean) => {
    try {
      console.log('🔄 Alterando status do item:', itemId, 'para', isActive)
      
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isactive: isActive }),
      })

      if (response.ok) {
        const updatedItem = await response.json()
        console.log('✅ Item atualizado no servidor:', updatedItem)
        
        // Atualizar o estado local imediatamente
        setStore(prevStore => ({
          ...prevStore,
          categories: prevStore.categories.map(category => ({
            ...category,
            items: category.items.map(item => 
              item.id === itemId 
                ? { ...item, isactive: updatedItem.isactive }
                : item
            )
          }))
        }))
        
        console.log('✅ Estado local atualizado')
      } else {
        console.error('❌ Erro na resposta:', response.status)
      }
    } catch (error) {
      console.error('💥 Erro ao atualizar item:', error)
    }
  }

  // Handler para o AdminProductCard - pausar/retomar
  const handleTogglePause = async (itemId: string, isPaused: boolean) => {
    try {
      console.log('🔄 Alterando disponibilidade do item:', itemId, 'para Indisponível:', isPaused)
      
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isarchived: isPaused }),
      })

      if (response.ok) {
        const updatedItem = await response.json()
        console.log('✅ Item atualizado no servidor:', updatedItem)
        
        // Atualizar o estado local imediatamente
        setStore(prevStore => ({
          ...prevStore,
          categories: prevStore.categories.map(category => ({
            ...category,
            items: category.items.map(item => 
              item.id === itemId 
                ? { ...item, isarchived: updatedItem.isarchived }
                : item
            )
          }))
        }))
        
        console.log('✅ Estado local atualizado')
      } else {
        console.error('❌ Erro na resposta:', response.status)
      }
    } catch (error) {
      console.error('💥 Erro ao atualizar disponibilidade:', error)
    }
  }

  // Handler para o AdminProductCard - editar
  const handleEdit = (itemId: string) => {
    const item = store.categories
      .flatMap(cat => cat.items)
      .find(item => item.id === itemId)
    
    if (item) {
      setEditModal({ isOpen: true, product: item })
    }
  }

  // Handler para o AdminProductCard - duplicar
  const handleDuplicate = async (itemId: string) => {
    const item = store.categories
      .flatMap(cat => cat.items)
      .find(item => item.id === itemId)
    
    if (!item) return

    // Encontrar a categoria do item
    const category = store.categories.find(cat => 
      cat.items.some(i => i.id === itemId)
    )
    
    if (!category) return

    try {
      const payload = {
        name: `${item.name} (Cópia)`,
        description: item.description,
        price: item.price,
        image: item.image,
        isactive: item.isactive,
        isarchived: item.isarchived
      }

      const response = await fetch(`/api/stores/${store.id}/categories/${category.id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        console.log('✅ Item duplicado com sucesso')
        fetchStore() // Recarregar dados
      } else {
        console.error('❌ Erro ao duplicar:', response.status)
        const errorText = await response.text()
        console.error('❌ Detalhes do erro:', errorText)
      }
    } catch (error) {
      console.error('💥 Erro ao duplicar item:', error)
    }
  }

  // Handler para o AdminProductCard - excluir
  const handleDelete = async (itemId: string) => {
    const item = store.categories
      .flatMap(cat => cat.items)
      .find(item => item.id === itemId)
    
    if (!item) return

    setConfirmModal({
      isOpen: true,
      title: 'Excluir Item',
      message: `Tem certeza que deseja excluir o item "${item.name}"? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/items/${itemId}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            console.log('✅ Item excluído com sucesso')
            fetchStore() // Recarregar dados
          }
        } catch (error) {
          console.error('Erro ao excluir item:', error)
        }
        setConfirmModal({ ...confirmModal, isOpen: false })
      },
      onClose: () => setConfirmModal({ ...confirmModal, isOpen: false })
    })
  }

  const deleteCategory = async (categoryId: string) => {
    console.log('🗑️ Iniciando exclusão da categoria:', categoryId)
    setDeletingCategoryId(categoryId)
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        console.log('✅ Categoria deletada com sucesso')
        fetchStore() // Recarregar dados
      } else {
        const errorData = await response.json().catch(() => null)
        console.error('❌ Erro da API:', errorData)
      }
    } catch (error) {
      console.error('💥 Erro de rede ao deletar categoria:', error)
    } finally {
      setDeletingCategoryId(null)
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

        {/* Categories Section Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Categorias e Produtos</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Organize seus produtos em categorias para facilitar a navegação dos clientes
                </p>
              </div>
              <Link
                href={`/dashboard/store/${store.id}/categories`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Categoria
              </Link>
            </div>
          </div>
        </div>

        {/* Categories and Items */}
        <div className="space-y-8">
          {store.categories.length === 0 ? (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma categoria criada</h3>
                <p className="text-gray-500 mb-4">
                  Crie categorias para organizar seus produtos e facilitar a navegação dos clientes
                </p>
                <Link
                  href={`/dashboard/store/${store.id}/categories`}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Categoria
                </Link>
              </div>
            </div>
          ) : (
            store.categories.map((category) => (
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
                        },
                        onClose: () => setConfirmModal({ ...confirmModal, isOpen: false })
                      })} 
                      disabled={deletingCategoryId === category.id}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-6">
                {category.items?.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item nesta categoria</h3>
                    <p className="text-gray-500 mb-4">
                      Adicione itens para começar a vender
                    </p>
                    <Link
                      href={`/dashboard/store/${store.id}/category/${category.id}/item/new`}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Primeiro Item
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {category.items.map((item) => (
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
                        onEdit={handleEdit}
                        onDuplicate={handleDuplicate}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
          )}
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowDeleteModal(false)}>
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
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
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />

      {/* Product Edit Modal */}
      <ProductEditModal
        isOpen={editModal.isOpen}
        product={editModal.product}
        onClose={() => setEditModal({ isOpen: false, product: null })}
        onSave={async (productData) => {
          if (editModal.product) {
            try {
              console.log('💾 Salvando produto:', productData)
              
              const response = await fetch(`/api/items/${editModal.product.id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  name: productData.name,
                  description: productData.description,
                  price: productData.price,
                  image: productData.image,
                  isactive: productData.isactive,
                  isarchived: productData.isarchived
                }),
              })
              
              if (response.ok) {
                console.log('✅ Produto salvo com sucesso')
                fetchStore() // Recarregar dados após sucesso
              } else {
                console.error('❌ Erro ao salvar produto:', response.status)
                const errorData = await response.json().catch(() => ({}))
                console.error('Detalhes do erro:', errorData)
              }
            } catch (error) {
              console.error('💥 Erro de rede ao salvar produto:', error)
            }
          }
          setEditModal({ isOpen: false, product: null })
        }}
      />
    </div>
  )
}
