'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, Check, Store, Utensils, Scissors, Coffee, Sparkles, Package, Plus, Trash2, Save, X } from 'lucide-react'
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
  const id = typeof (params as { id?: string | string[] })?.id === 'string' 
    ? (params as { id: string }).id 
    : Array.isArray((params as { id?: string | string[] })?.id) 
      ? (params as { id: string[] }).id[0] 
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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/store/${store.id}`}
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a Loja
          </Link>
          
          <div className="text-center">
            <Store className="mx-auto h-12 w-12 text-primary mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Bem-vindo ao SmartCard!
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Vamos configurar sua loja <strong>{store.name}</strong> em poucos passos
            </p>
          </div>

          {/* Progress Steps - Responsivo Compacto */}
          <div className="flex justify-center mb-6 px-2">
            <div className="flex items-center w-full max-w-xs">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step > 1 ? <Check className="h-3 w-3" /> : '1'}
              </div>
              <div className={`flex-1 h-0.5 mx-1 ${
                step >= 2 ? 'bg-primary' : 'bg-border'
              }`}></div>
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step > 2 ? <Check className="h-3 w-3" /> : '2'}
              </div>
              <div className={`flex-1 h-0.5 mx-1 ${
                step >= 3 ? 'bg-blue-600' : 'bg-gray-200'
              }`}></div>
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > 3 ? <Check className="h-3 w-3" /> : '3'}
              </div>
              <div className={`flex-1 h-0.5 mx-1 ${
                step >= 4 ? 'bg-blue-600' : 'bg-gray-200'
              }`}></div>
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > 4 ? <Check className="h-3 w-3" /> : '4'}
              </div>
              <div className={`flex-1 h-0.5 mx-1 ${
                step >= 5 ? 'bg-blue-600' : 'bg-gray-200'
              }`}></div>
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                step >= 5 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > 5 ? <Check className="h-3 w-3" /> : '5'}
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="bg-card rounded-lg shadow-sm p-8 text-center border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Escolha como começar
            </h2>
            <p className="text-muted-foreground mb-8">
              Você pode usar um template pronto para seu tipo de negócio ou começar do zero
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <button
                onClick={() => setStep(2)}
                className="p-6 border-2 border-primary/20 rounded-lg hover:border-primary hover:bg-primary/10 transition-colors"
              >
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Usar Template
                </h3>
                <p className="text-muted-foreground text-sm">
                  Comece com categorias e produtos pré-definidos para seu tipo de negócio
                </p>
              </button>
              
              <button
                onClick={skipOnboarding}
                className="p-6 border-2 border-border rounded-lg hover:border-border/80 hover:bg-muted/50 transition-colors"
              >
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Começar do Zero
                </h3>
                <p className="text-muted-foreground text-sm">
                  Criar suas próprias categorias e produtos manualmente
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Template Selection */}
        {step === 2 && (
          <div className="bg-card rounded-lg shadow-sm p-8 border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
              Escolha um template
            </h2>
            <p className="text-muted-foreground mb-8 text-center">
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
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-border/80 hover:bg-muted/50'
                    }`}
                  >
                    <IconComponent className={`h-8 w-8 mb-4 ${
                      selectedTemplate === template.id ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {template.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {template.description}
                    </p>
                    {selectedTemplate === template.id && (
                      <div className="mt-4">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {error && (
              <div className="text-destructive text-sm mb-4 text-center">{error}</div>
            )}

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-border rounded-md text-foreground hover:bg-muted"
              >
                Voltar
              </button>
              <button
                onClick={applyTemplate}
                disabled={!selectedTemplate || loading}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Aplicando...' : 'Aplicar Template'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Store Image */}
        {step === 3 && (
          <div className="bg-card rounded-lg shadow-sm p-8 border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
              Adicione uma imagem para sua loja
            </h2>
            <p className="text-muted-foreground mb-8 text-center">
              Uma boa imagem ajuda os clientes a identificar sua loja. Você pode adicionar o logo ou uma foto representativa.
            </p>
            
            <div className="max-w-md mx-auto mb-8">
              <ImageUpload
                onUpload={handleStoreImageUpload}
                currentImage={store?.image}
                type="store"
                storeid={store?.id || ''}
                placeholder="Adicione a imagem da sua loja"
                variant="medium"
              />
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-border rounded-md text-foreground hover:bg-muted"
              >
                Voltar
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Próximo
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Categories with Products Grid */}
        {step === 4 && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Organize seu catálogo em categorias
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Categorias ajudam os clientes a encontrar produtos mais facilmente.
              </p>
            </div>

            {/* Lista de Categorias com Grid de Produtos */}
            <div className="space-y-6 mb-6 max-w-4xl mx-auto">
              {store?.categories?.map((category) => {
                const categoryItems = store?.items?.filter(item => item.categoryId === category.id) || []
                
                return (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {/* Header da Categoria */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{category.name}</h3>
                        {category.description && (
                          <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors"
                        title="Remover categoria"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Imagem da Categoria */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Imagem da categoria
                      </label>
                      <div className="w-20 h-20">
                        <ImageUpload
                          onUpload={(url) => handleCategoryImageUpload(category.id, url)}
                          currentImage={category.image}
                          type="category"
                          storeid={store?.id || ''}
                          placeholder="Imagem"
                          variant="compact"
                        />
                      </div>
                    </div>

                    {/* Grid de Produtos da Categoria */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-800 text-sm">
                          Produtos ({categoryItems.length})
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {/* Produtos Existentes */}
                        {categoryItems.map((item) => (
                          <div key={item.id} className="group relative bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                            {/* Imagem do Produto */}
                            <div className="aspect-square mb-2">
                              <ImageUpload
                                onUpload={(url) => handleItemImageUpload(item.id, url)}
                                currentImage={item.image}
                                type="item"
                                storeid={store?.id || ''}
                                placeholder="Produto"
                                variant="compact"
                              />
                            </div>
                            
                            {/* Info do Produto */}
                            <div className="text-center">
                              <h5 className="font-medium text-gray-900 text-xs truncate" title={item.name}>
                                {item.name}
                              </h5>
                              <p className="text-green-600 font-semibold text-xs mt-1">
                                R$ {item.price.toFixed(2)}
                              </p>
                            </div>
                            
                            {/* Botão Delete - Aparece no Hover */}
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition-all duration-200"
                              title="Remover produto"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        
                        {/* Card "Novo Item" */}
                        <div
                          onClick={() => {
                            setNewItem({ ...newItem, categoryId: category.id })
                            setShowAddItem(true)
                          }}
                          className="group cursor-pointer transition-all duration-200 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-lg aspect-square flex flex-col items-center justify-center bg-gray-50 hover:shadow-md"
                        >
                          {/* Ícone + com animação */}
                          <div className="w-8 h-8 rounded-full border-2 border-gray-400 group-hover:border-blue-500 group-hover:bg-blue-500 flex items-center justify-center transition-all duration-200 group-hover:scale-110">
                            <Plus className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-200" />
                          </div>
                          
                          {/* Texto */}
                          <p className="mt-2 text-xs font-medium text-gray-500 group-hover:text-blue-600 transition-colors duration-200 text-center">
                            Novo Item
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }) || []}
              
              {/* Card "Nova Categoria" quando não há categorias ou botão adicional */}
              <div
                onClick={() => setShowAddCategory(true)}
                className="group cursor-pointer transition-all duration-200 border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 rounded-lg p-6 flex flex-col items-center justify-center bg-blue-25 hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-full border-2 border-blue-400 group-hover:border-blue-600 group-hover:bg-blue-600 flex items-center justify-center transition-all duration-200 group-hover:scale-110">
                  <Plus className="w-6 h-6 text-blue-400 group-hover:text-white transition-colors duration-200" />
                </div>
                <p className="mt-3 text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
                  Nova Categoria
                </p>
              </div>
            </div>

            {/* Formulário Nova Categoria - Compacto e Responsivo */}
            {showAddCategory && (
              <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50 mb-6 max-w-2xl mx-auto">
                <h3 className="font-semibold text-gray-900 mb-3 text-center">Nova Categoria</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Categoria *
                    </label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Ex: Bebidas, Lanches, Sobremesas"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição (opcional)
                    </label>
                    <input
                      type="text"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Descrição da categoria"
                    />
                  </div>
                </div>
                <div className="flex justify-center gap-3 mt-4">
                  <button
                    onClick={handleAddCategory}
                    disabled={!newCategory.name.trim() || saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center text-sm font-medium"
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
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 text-sm font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Formulário Novo Item - Compacto */}
            {showAddItem && (
              <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50 mb-6 max-w-2xl mx-auto">
                <h3 className="font-semibold text-gray-900 mb-3 text-center">Novo Produto</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Produto *
                    </label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição (opcional)
                    </label>
                    <input
                      type="text"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      placeholder="Descrição do produto"
                    />
                  </div>
                </div>
                <div className="flex justify-center gap-3 mt-4">
                  <button
                    onClick={handleAddItem}
                    disabled={!newItem.name.trim() || !newItem.categoryId || saving}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center text-sm font-medium"
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
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 text-sm font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Botões de Navegação */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
              <button
                onClick={() => setStep(3)}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={() => setStep(5)}
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
                            variant="small"
                            className="mx-auto"
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