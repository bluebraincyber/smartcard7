'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, Check, Store, Utensils, Scissors, Coffee, Sparkles, Package, Plus, Trash2, Save } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

interface Template {
  id: string
  name: string
  description: string
}

interface Category {
  id: string
  name: string
  description?: string
  image?: string
}

interface Item {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  categoryId: string
}

interface Store {
  id: string
  name: string
  slug: string
  description?: string
  whatsapp: string
  address?: string
  primaryColor: string
  isactive: boolean
  image?: string
  categories: Category[]
  items: Item[]
}

const templateIcons: Record<string, React.ComponentType> = {
  lanchonete: Utensils,
  hamburgueria: Utensils,
  barbearia: Scissors,
  doceria: Coffee,
  salao: Sparkles,
  geral: Package
}

export default function OnboardingPage() {
  const params = useParams()
  const router = useRouter()
  useSession()
  // params.id pode ser string | string[] | undefined. Normalize:
  const id = typeof (params as any)?.id === 'string' 
    ? (params as any).id 
    : Array.isArray((params as any)?.id) 
      ? (params as any).id[0] 
      : undefined

  const [store, setStore] = useState<Store | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', description: '' })
  const [newItem, setNewItem] = useState({ 
    name: '', 
    description: '', 
    price: 0, 
    categoryId: '' 
  })
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)

  // fetchStore recebe o id por argumento para não fechar sobre um id undefined
  const fetchStore = useCallback(async (storeid: string) => {
    try {
      const response = await fetch(`/api/stores/${storeid}`)
      if (response.ok) {
        const data = await response.json()
        setStore(data)
      }
    } catch (e) {
      console.error('Erro ao buscar loja', e)
    }
  }, [])

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (e) {
      console.error('Erro ao buscar templates', e)
    }
  }, [])

  useEffect(() => {
    // Templates não dependem do id
    fetchTemplates()

    // Só busca a loja se houver id válido
    if (id) fetchStore(id)
  }, [id, fetchStore, fetchTemplates])

  const applyTemplate = async () => {
    if (!selectedTemplate) {
      setError('Por favor, selecione um template')
      return
    }

    if (!id) {
      setError('ID da loja inválido')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/stores/${id}/apply-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId: selectedTemplate }),
      })

      if (response.ok) {
        await fetchStore(id) // Recarregar dados da loja
        setStep(3)
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao aplicar template')
      }
    } catch {
      setError('Erro ao aplicar template')
    } finally {
      setLoading(false)
    }
  }

  const handleStoreImageUpload = (url: string) => {
    if (store) {
      setStore({ ...store, image: url })
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.name.trim() || !store) return

    setSaving(true)
    try {
      const response = await fetch(`/api/stores/${store.id}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      })

      if (response.ok) {
        const category = await response.json()
        setStore({
          ...store,
          categories: [...store.categories, category]
        })
        setNewCategory({ name: '', description: '' })
        setShowAddCategory(false)
      }
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!store) return

    try {
      const response = await fetch(`/api/stores/${store.id}/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setStore({
          ...store,
          categories: store.categories.filter(c => c.id !== categoryId),
          items: store.items.filter(i => i.categoryId !== categoryId)
        })
      }
    } catch (error) {
      console.error('Erro ao deletar categoria:', error)
    }
  }

  const handleCategoryImageUpload = (categoryId: string, url: string) => {
    if (!store) return
    
    setStore({
      ...store,
      categories: store.categories.map(c => 
        c.id === categoryId ? { ...c, image: url } : c
      )
    })
  }

  const handleAddItem = async () => {
    if (!newItem.name.trim() || !newItem.categoryId || !store) return

    setSaving(true)
    try {
      const response = await fetch(`/api/stores/${store.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      })

      if (response.ok) {
        const item = await response.json()
        setStore({
          ...store,
          items: [...store.items, item]
        })
        setNewItem({ name: '', description: '', price: 0, categoryId: '' })
        setShowAddItem(false)
      }
    } catch (error) {
      console.error('Erro ao adicionar item:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!store) return

    try {
      const response = await fetch(`/api/stores/${store.id}/items/${itemId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setStore({
          ...store,
          items: store.items.filter(i => i.id !== itemId)
        })
      }
    } catch (error) {
      console.error('Erro ao deletar item:', error)
    }
  }

  const handleItemImageUpload = (itemId: string, url: string) => {
    if (!store) return
    
    setStore({
      ...store,
      items: store.items.map(i => 
        i.id === itemId ? { ...i, image: url } : i
      )
    })
  }

  const skipOnboarding = () => {
    if (id) router.push(`/dashboard/store/${id}`)
    else router.push('/dashboard')
  }

  const finishOnboarding = () => {
    if (id) router.push(`/dashboard/store/${id}`)
    else router.push('/dashboard')
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="mt-4 text-gray-600">ID da loja não encontrado.</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline mt-2 inline-block">Voltar ao Dashboard</Link>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/store/${store.id}`}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a Loja
          </Link>
          
          <div className="text-center">
            <Store className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo ao SmartCard!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Vamos configurar sua loja <strong>{store.name}</strong> em poucos passos
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > 1 ? <Check className="h-4 w-4" /> : '1'}
              </div>
              <div className={`h-1 w-16 ${
                step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > 2 ? <Check className="h-4 w-4" /> : '2'}
              </div>
              <div className={`h-1 w-16 ${
                step >= 3 ? 'bg-blue-600' : 'bg-gray-200'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > 3 ? <Check className="h-4 w-4" /> : '3'}
              </div>
              <div className={`h-1 w-16 ${
                step >= 4 ? 'bg-blue-600' : 'bg-gray-200'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > 4 ? <Check className="h-4 w-4" /> : '4'}
              </div>
              <div className={`h-1 w-16 ${
                step >= 5 ? 'bg-blue-600' : 'bg-gray-200'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 5 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > 5 ? <Check className="h-4 w-4" /> : '5'}
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Escolha como começar
            </h2>
            <p className="text-gray-600 mb-8">
              Você pode usar um template pronto para seu tipo de negócio ou começar do zero
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <button
                onClick={() => setStep(2)}
                className="p-6 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Usar Template
                </h3>
                <p className="text-gray-600 text-sm">
                  Comece com categorias e produtos pré-definidos para seu tipo de negócio
                </p>
              </button>
              
              <button
                onClick={skipOnboarding}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Começar do Zero
                </h3>
                <p className="text-gray-600 text-sm">
                  Criar suas próprias categorias e produtos manualmente
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Template Selection */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Escolha um template
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              Selecione o template que melhor se adequa ao seu negócio
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {templates.map((template) => {
                const IconComponent = templateIcons[template.id] || Package
                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-6 border-2 rounded-lg transition-colors text-left ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className={`h-8 w-8 mb-4 ${
                      selectedTemplate === template.id ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {template.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {template.description}
                    </p>
                    {selectedTemplate === template.id && (
                      <div className="mt-4">
                        <Check className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {error && (
              <div className="text-red-600 text-sm mb-4 text-center">{error}</div>
            )}

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                onClick={applyTemplate}
                disabled={!selectedTemplate || loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Aplicando...' : 'Aplicar Template'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Store Image */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Adicione uma imagem para sua loja
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              Uma boa imagem ajuda os clientes a identificar sua loja. Você pode adicionar o logo ou uma foto representativa.
            </p>
            
            <div className="max-w-md mx-auto mb-8">
              <ImageUpload
                onUpload={handleStoreImageUpload}
                currentImage={store?.image}
                type="store"
                storeid={store?.id || ''}
                placeholder="Adicione a imagem da sua loja"
              />
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Categories */}
        {step === 4 && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Organize seu catálogo em categorias
                </h2>
                <p className="text-gray-600 mt-1">
                  Categorias ajudam os clientes a encontrar produtos mais facilmente.
                </p>
              </div>
              <button
                onClick={() => setShowAddCategory(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </button>
            </div>

            {/* Lista de Categorias */}
            <div className="space-y-4 mb-6">
              {store?.categories?.map((category) => (
                <div key={category.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      {category.description && (
                        <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-700 ml-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="mt-4 max-w-xs">
                    <ImageUpload
                      onUpload={(url) => handleCategoryImageUpload(category.id, url)}
                      currentImage={category.image}
                      type="category"
                      storeid={store?.id || ''}
                      placeholder="Imagem da categoria"
                      className="h-32"
                    />
                  </div>
                </div>
              )) || []}
            </div>

            {/* Formulário Nova Categoria */}
            {showAddCategory && (
              <div className="border rounded-lg p-4 bg-gray-50 mb-6">
                <h3 className="font-medium text-gray-900 mb-4">Nova Categoria</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Categoria *
                    </label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Bebidas, Lanches, Sobremesas"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Descrição opcional da categoria"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleAddCategory}
                      disabled={!newCategory.name.trim() || saving}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setShowAddCategory(false)
                        setNewCategory({ name: '', description: '' })
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                onClick={() => setStep(5)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Products */}
        {step === 5 && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Adicione produtos ao seu catálogo
                </h2>
                <p className="text-gray-600 mt-1">
                  Adicione fotos, preços e descrições para seus produtos.
                </p>
              </div>
              <button
                onClick={() => setShowAddItem(true)}
                disabled={!store?.categories?.length}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </button>
            </div>

            {!store?.categories?.length && (
              <div className="text-center py-8 text-gray-500">
                <p>Você precisa criar pelo menos uma categoria antes de adicionar produtos.</p>
                <button
                  onClick={() => setStep(4)}
                  className="text-blue-600 hover:underline mt-2"
                >
                  Voltar para Categorias
                </button>
              </div>
            )}

            {/* Lista de Produtos por Categoria */}
            {store?.categories?.map((category) => {
              const categoryItems = store?.items?.filter(item => item.categoryId === category.id) || []
              
              return (
                <div key={category.id} className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{category.name}</h3>
                  
                  {categoryItems.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                      <p>Nenhum produto nesta categoria ainda.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryItems.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-lg font-semibold text-green-600 mt-1">
                                R$ {item.price.toFixed(2)}
                              </p>
                              {item.description && (
                                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-700 ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <ImageUpload
                            onUpload={(url) => handleItemImageUpload(item.id, url)}
                            currentImage={item.image}
                            type="item"
                            storeid={store?.id || ''}
                            placeholder="Foto do produto"
                            className="h-32"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            }) || []}

            {/* Formulário Novo Produto */}
            {showAddItem && (
              <div className="border rounded-lg p-4 bg-gray-50 mt-6">
                <h3 className="font-medium text-gray-900 mb-4">Novo Produto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Produto *
                    </label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Hambúrguer Artesanal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria *
                    </label>
                    <select
                      value={newItem.categoryId}
                      onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione uma categoria</option>
                      {store?.categories?.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      )) || []}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Descrição opcional do produto"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={handleAddItem}
                    disabled={!newItem.name.trim() || !newItem.categoryId || saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar
                  </button>
                  <button
                    onClick={() => {
                      setShowAddItem(false)
                      setNewItem({ name: '', description: '', price: 0, categoryId: '' })
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-center space-x-4 mt-8">
              <button
                onClick={() => setStep(4)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Voltar
              </button>
              <button
                onClick={finishOnboarding}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <Check className="h-4 w-4 mr-2" />
                Finalizar Configuração
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}