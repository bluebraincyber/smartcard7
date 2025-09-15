'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Check, X } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

interface Store {
  id: string
  name: string
  slug: string
  description?: string
  phone: string
  address?: string
  businessType: string
  requiresAddress: boolean
  isactive: boolean
}

interface SlugCheckResult {
  available: boolean
  reason?: string
  message: string
}

interface EditStoreClientProps {
  store: Store
}

export default function EditStoreClient({ store }: EditStoreClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [slugChecking, setSlugChecking] = useState(false)
  const [slugCheckResult, setSlugCheckResult] = useState<SlugCheckResult | null>(null)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: store.name,
    slug: store.slug,
    description: store.description || '',
    phone: store.phone || '',
    address: store.address || '',
    businessType: store.businessType || 'general',
    requiresAddress: store.requiresAddress || false,
    coverImage: '',
    profileImage: ''
  })

  const checkSlugAvailability = useCallback(async (slug: string) => {
    if (!slug || slug === store.slug) {
      setSlugCheckResult(null)
      return
    }

    setSlugChecking(true)
    try {
      const response = await fetch(`/api/stores/check-slug?slug=${encodeURIComponent(slug)}`)
      const result = await response.json()
      setSlugCheckResult(result)
    } catch (error) {
      console.error('Erro ao verificar slug:', error)
      setSlugCheckResult({
        available: false,
        message: 'Erro ao verificar disponibilidade'
      })
    } finally {
      setSlugChecking(false)
    }
  }, [store.slug])

  const handleSlugChange = (value: string) => {
    const slug = value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
    setFormData(prev => ({ ...prev, slug }))
    
    // Debounce slug check
    const timeoutId = setTimeout(() => {
      checkSlugAvailability(slug)
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (slugCheckResult && !slugCheckResult.available) {
      setError('O slug escolhido não está disponível')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/stores/${store.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar loja')
      }

      router.push(`/dashboard/store/${store.id}`)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <Link
            href={`/dashboard/store/${store.id}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white/80 hover:bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm border border-gray-200 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a Loja
          </Link>
          
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="relative mb-8">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg mb-6">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowLeft className="h-6 w-6 text-white transform rotate-180" />
                      </div>
            </div>
            </div>
            </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-20 rounded-full blur-xl scale-150"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Editar Loja
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Atualize as informações e configurações da sua loja
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-8 p-8">
            {error && (
              <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-2xl p-6">
                <div className="flex">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mr-4">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-800 mb-1">Erro ao salvar</h3>
                    <div className="text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Campos Principais - Grid Layout */}
            <div className="bg-gray-50/50 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome da Loja */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome da Loja *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                  placeholder="Ex: Minha Loja Incrível"
                />
              </div>

              {/* Tipo de Negócio */}
              <div>
                <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
                  Tipo de Negócio
                </label>
                <select
                  id="businessType"
                  value={formData.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                >
                  <option value="general">Geral</option>
                  <option value="restaurant">Restaurante</option>
                  <option value="retail">Varejo</option>
                  <option value="service">Serviços</option>
                </select>
              </div>
            </div>

            {/* Slug */}
            <div className="bg-blue-50/50 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">URL da Loja</h3>
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                  URL da Loja *
                </label>
                <div className="mt-1 flex rounded-xl shadow-sm">
                  <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm font-medium">
                    /
                  </span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      id="slug"
                      required
                      value={formData.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className="block w-full border-gray-300 rounded-none rounded-r-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                      placeholder="minha-loja"
                    />
                    {slugChecking && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
                {slugCheckResult && (
                  <div className={`mt-3 flex items-center text-sm font-medium px-3 py-2 rounded-xl ${
                    slugCheckResult.available 
                      ? 'text-green-700 bg-green-50 border border-green-200' 
                      : 'text-red-700 bg-red-50 border border-red-200'
                  }`}>
                    {slugCheckResult.available ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    {slugCheckResult.message}
                  </div>
                )}
              </div>
            </div>

            {/* Descrição */}
            <div className="bg-gray-50/50 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Descrição</h3>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descrição da Loja
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                  placeholder="Descreva sua loja e o que vocês oferecem..."
                />
                <p className="mt-2 text-xs text-gray-500">
                  Esta descrição aparecerá na página principal da sua loja
                </p>
              </div>
            </div>

            {/* Contato - Grid Layout */}
            <div className="bg-green-50/50 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Informações de Contato</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* WhatsApp */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                  placeholder="(11) 99999-9999"
                />
              </div>

              {/* Endereço */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Endereço
                </label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
                  placeholder="Rua, número, bairro, cidade"
                />
              </div>
            </div>

            {/* Imagens - Layout Otimizado */}
            <div className="bg-purple-50/50 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Imagens da Loja</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem de Capa
                </label>
                <ImageUpload
                  onUpload={(url) => handleInputChange('coverImage', url)}
                  currentImage={formData.coverImage}
                  type="store"
                  storeid={store.id}
                  variant="medium"
                  placeholder="Arraste e solte ou clique para selecionar"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Imagem de fundo da sua loja (recomendado: 800x400px)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo/Perfil
                </label>
                <ImageUpload
                  onUpload={(url) => handleInputChange('profileImage', url)}
                  currentImage={formData.profileImage}
                  type="store"
                  storeid={store.id}
                  variant="medium"
                  placeholder="Clique para adicionar logo"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Logo da sua empresa (recomendado: quadrado 400x400px)
                </p>
              </div>
            </div>

            {/* Configurações */}
            <div className="bg-orange-50/50 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Configurações Adicionais</h3>
              <div>
                <div className="flex items-center">
                  <input
                    id="requiresAddress"
                    type="checkbox"
                    checked={formData.requiresAddress}
                    onChange={(e) => handleInputChange('requiresAddress', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requiresAddress" className="ml-3 block text-sm font-medium text-gray-900">
                    Solicitar endereço do cliente nos pedidos
                  </label>
                </div>
                <p className="mt-2 text-xs text-gray-500 ml-7">
                  Quando ativado, os clientes precisarão informar o endereço ao fazer pedidos
                </p>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
              <Link
                href={`/dashboard/store/${store.id}`}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading || (slugCheckResult && !slugCheckResult.available)}
                className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}