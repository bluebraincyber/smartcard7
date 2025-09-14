'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, X } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

interface Store {
  id: string
  name: string
  slug?: string
}

interface Category {
  id: string
  name: string
}

export default function NewItemPage() {
  const params = useParams()
  const router = useRouter()
  const [store, setStore] = useState<Store | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    isactive: true,
    isavailable: true
  })

  useEffect(() => {
    fetchStoreAndCategory()
  }, [params.id, params.categoryId])

  const fetchStoreAndCategory = async () => {
    try {
      console.log('Buscando dados para store:', params.id, 'categoria:', params.categoryId)
      
      const storeResponse = await fetch(`/api/stores/${params.id}`)
      if (storeResponse.ok) {
        const storeData = await storeResponse.json()
        console.log('Store data:', storeData)
        
        setStore({
          id: storeData.id,
          name: storeData.name,
          slug: storeData.slug
        })
        
        const foundCategory = storeData.categories?.find((cat: any) => String(cat.id) === String(params.categoryId))
        console.log('Procurando categoria ID:', params.categoryId)
        console.log('Categorias disponíveis:', storeData.categories?.map((c: any) => ({ id: c.id, name: c.name })))
        console.log('Categoria encontrada:', foundCategory)
        
        if (foundCategory) {
          setCategory({
            id: foundCategory.id,
            name: foundCategory.name
          })
        } else {
          console.error('Categoria não encontrada')
        }
      } else {
        console.error('Erro ao buscar store:', storeResponse.status)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleToggleChange = (field: 'isactive' | 'isavailable') => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({
      ...prev,
      image: url
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.price) {
      alert('Nome e preço são obrigatórios')
      return
    }

    const priceToSend = parseFloat(formData.price.replace(',', '.'))

    console.log('Sending item data:', {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      price: priceToSend,
      image: formData.image.trim() || null,
      categoryId: parseInt(String(params.categoryId)),
      isactive: formData.isactive,
      isarchived: !formData.isavailable,
      slug: store?.slug
    })

    setCreating(true)
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          price: priceToSend,
          image: formData.image.trim() || null,
          categoryId: parseInt(String(params.categoryId)),
          isactive: formData.isactive,
          isarchived: !formData.isavailable,
          slug: store?.slug
        }),
      })

      if (response.ok) {
        console.log('✅ Item criado com sucesso!')
        router.push(`/dashboard/store/${params.id}`)
      } else {
        const errorData = await response.json()
        console.log('❌ Erro na resposta:', response.status, errorData)
        alert('Erro ao criar item: ' + (errorData.error || 'Erro desconhecido'))
      }
    } catch (error) {
      console.error('Erro ao criar item:', error)
      alert('Erro ao criar item')
    } finally {
      setCreating(false)
    }
  }

  // Componente Toggle Switch
  const ToggleSwitch = ({ 
    enabled, 
    onChange, 
    disabled = false 
  }: {
    enabled: boolean
    onChange: () => void
    disabled?: boolean
  }) => {
    return (
      <button
        type="button"
        onClick={() => !disabled && onChange()}
        disabled={disabled}
        className={`
          w-10 h-5 relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${enabled 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-gray-200 hover:bg-gray-300'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        role="switch"
        aria-checked={enabled}
      >
        <span className="sr-only">{enabled ? 'Desativar' : 'Ativar'}</span>
        <span
          className={`
            w-4 h-4 inline-block rounded-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out
            ${enabled ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!store || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-2">Loja ou categoria não encontrada</h2>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800"
          >
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/store/${params.id}`}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar à Loja
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Novo Item - {category.name}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Adicione um novo item à categoria "{category.name}" na loja {store.name}
          </p>
        </div>

        {/* Modal-style Card */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden max-w-4xl mx-auto">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Criar Produto</h2>
              <Link
                href={`/dashboard/store/${params.id}`}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </Link>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna Esquerda - Imagem */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Imagem do Produto</h3>
                  <div className="w-full max-w-sm">
                    <ImageUpload
                      onUpload={handleImageUpload}
                      currentImage={formData.image}
                      type="item"
                      storeid={store.id}
                      placeholder="Arraste ou clique para adicionar imagem"
                      variant="medium"
                    />
                  </div>
                </div>
                
                {/* Coluna Direita - Campos */}
                <div className="space-y-4">
                  {/* Nome do Produto */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Produto
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Pizza Margherita"
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Descreva o produto..."
                    />
                  </div>

                  {/* Preço */}
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Preço (R$)
                    </label>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      required
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    {/* Produto Ativo */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Produto Ativo</label>
                        <p className="text-xs text-gray-500">Visível na loja</p>
                      </div>
                      <ToggleSwitch
                        enabled={formData.isactive}
                        onChange={() => handleToggleChange('isactive')}
                      />
                    </div>

                    {/* Produto Disponível */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Produto Disponível</label>
                        <p className="text-xs text-gray-500">Em estoque</p>
                      </div>
                      <ToggleSwitch
                        enabled={formData.isavailable}
                        onChange={() => handleToggleChange('isavailable')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer com botões */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <Link
                href={`/dashboard/store/${params.id}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Criando...' : 'Criar Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
