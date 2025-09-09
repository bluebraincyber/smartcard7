'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, X } from 'lucide-react'

interface Store {
  id: string
  name: string
  slug?: string // Adicionar slug
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
    image: ''
  })

  useEffect(() => {
    fetchStoreAndCategory()
  }, [params.id, params.categoryId])

  const fetchStoreAndCategory = async () => {
    try {
      console.log('Buscando dados para store:', params.id, 'categoria:', params.categoryId)
      
      // Buscar dados da loja
      const storeResponse = await fetch(`/api/stores/${params.id}`)
      if (storeResponse.ok) {
        const storeData = await storeResponse.json()
        console.log('Store data:', storeData)
        
        setStore({
          id: storeData.id,
          name: storeData.name,
          slug: storeData.slug
        })
        
        // Encontrar categoria específica - CORRIGIDO: comparar como string
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.price) {
      alert('Nome e preço são obrigatórios')
      return
    }

    const priceToSend = parseFloat(formData.price.replace(',', '.'));

    console.log('Sending item data:', {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      price: priceToSend,
      image: formData.image.trim() || null,
      categoryId: parseInt(String(params.categoryId)), // CORRIGIDO: garantir que seja número
      slug: store.slug // Adicionar slug se disponível
    });

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
          categoryId: parseInt(String(params.categoryId)), // CORRIGIDO: garantir que seja número
          slug: store?.slug // Adicionar slug se disponível
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Verificar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 5MB.')
      return
    }

    // Verificar tipo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem.')
      return
    }

    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({
          ...prev,
          image: data.url
        }))
      } else {
        alert('Erro ao fazer upload da imagem')
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro ao fazer upload da imagem')
    }
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
          Novo Item - {category.name}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Adicione um novo item à categoria "{category.name}" na loja {store.name}
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome do Item *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Ex: Pizza Margherita"
              />
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Descreva o item..."
              />
            </div>

            {/* Preço */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Preço *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">R$</span>
                </div>
                <input
                  type="number"
                  name="price"
                  id="price"
                  required
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="block w-full pl-12 pr-12 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Upload de Imagem */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Imagem do Item
              </label>
              <div className="mt-1">
                {formData.image ? (
                  <div className="relative inline-block">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Fazer upload de imagem</span>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="sr-only"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG até 5MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-3">
              <Link
                href={`/dashboard/store/${params.id}`}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={creating}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
