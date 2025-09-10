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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/store/${store.id}`}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a Loja
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Editar Loja</h1>
          <p className="mt-1 text-sm text-gray-600">
            Atualize as informações da sua loja
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <X className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Erro</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Ex: Minha Loja Incrível"
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                URL da Loja *
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  smartcardweb.com.br/
                </span>
                <div className="relative flex-1">
                  <input
                    type="text"
                    id="slug"
                    required
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="block w-full border-gray-300 rounded-none rounded-r-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="minha-loja"
                  />
                  {slugChecking && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              {slugCheckResult && (
                <div className={`mt-2 flex items-center text-sm ${
                  slugCheckResult.available ? 'text-green-600' : 'text-red-600'
                }`}>
                  {slugCheckResult.available ? (
                    <Check className="h-4 w-4 mr-1" />
                  ) : (
                    <X className="h-4 w-4 mr-1" />
                  )}
                  {slugCheckResult.message}
                </div>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Descreva sua loja..."
              />
            </div>

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
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Rua, número, bairro, cidade"
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
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="general">Geral</option>
                <option value="restaurant">Restaurante</option>
                <option value="retail">Varejo</option>
                <option value="service">Serviços</option>
              </select>
            </div>

            {/* Imagens */}
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
                  className="w-full h-32"
                  placeholder="Clique para adicionar uma imagem de capa"
                />
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
                  className="w-full h-32"
                  placeholder="Clique para adicionar um logo"
                />
              </div>
            </div>

            {/* Configurações */}
            <div>
              <div className="flex items-center">
                <input
                  id="requiresAddress"
                  type="checkbox"
                  checked={formData.requiresAddress}
                  onChange={(e) => handleInputChange('requiresAddress', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requiresAddress" className="ml-2 block text-sm text-gray-900">
                  Solicitar endereço do cliente nos pedidos
                </label>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Link
                href={`/dashboard/store/${store.id}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading || (slugCheckResult && !slugCheckResult.available)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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