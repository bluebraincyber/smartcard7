'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeft, Store, Loader2, Check, X } from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
}

interface SlugCheckResult {
  available: boolean
  reason?: string
  message: string
}

export default function NewStorePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [slugChecking, setSlugChecking] = useState(false)
  const [slugCheckResult, setSlugCheckResult] = useState<SlugCheckResult | null>(null)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    phone: '',
    address: '',
    businessType: 'general',
    requiresAddress: false,
    templateId: ''
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Erro ao buscar templates:', error)
    }
  }

  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugCheckResult(null)
      return
    }

    setSlugChecking(true)
    try {
      const response = await fetch('/api/slugs/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ slug })
      })
      
      if (response.ok) {
        const result = await response.json()
        setSlugCheckResult(result)
      }
    } catch (error) {
      console.error('Erro ao verificar slug:', error)
    } finally {
      setSlugChecking(false)
    }
  }

  const handleSlugChange = (value: string) => {
    const normalizedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    setFormData(prev => ({ ...prev, slug: normalizedSlug }))
    
    // Debounce slug check
    const timeoutId = setTimeout(() => {
      checkSlugAvailability(normalizedSlug)
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!slugCheckResult?.available) {
      setError('Por favor, escolha um slug válido e disponível')
      return
    }

    setLoading(true)
    setError('')

    try {
      const endpoint = formData.templateId 
        ? '/api/stores/create-with-template'
        : '/api/stores'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          whatsapp: formData.phone // Mapear phone para whatsapp
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({} as any))
        setError((data as any)?.error || 'Erro ao criar loja')
        return
      }

      const created = await response.json()
      const newId = String((created as any)?.id ?? (created as any)?.store?.id ?? '')
      if (!newId) {
        console.error('Resposta inesperada ao criar loja:', created)
        setError('Erro ao criar loja: resposta inesperada do servidor')
        return
      }

      // Se usou template, vai direto para o dashboard; senão, onboarding
      if (formData.templateId) {
        router.push(`/dashboard/store/${newId}`)
      } else {
        router.push(`/dashboard/store/${newId}/onboarding`)
      }
    } catch (error) {
      setError('Erro ao criar loja')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Nova Loja</h1>
        <p className="mt-1 text-sm text-gray-600">
          Crie seu cartão digital em poucos minutos
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Template Selection */}
              {templates.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Escolha seu Nicho de Negócio
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {/* Criar do Zero */}
                    <div 
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        formData.templateId === '' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, templateId: '' }))}
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Store className="h-6 w-6 text-gray-600" />
                        </div>
                        <h3 className="font-medium text-gray-900">Criar do Zero</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Comece com uma loja em branco e personalize tudo
                        </p>
                      </div>
                      {formData.templateId === '' && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-5 w-5 text-blue-500" />
                        </div>
                      )}
                    </div>
                    
                    {/* Templates */}
                    {templates.map((template) => (
                      <div 
                        key={template.id}
                        className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          formData.templateId === template.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, templateId: template.id }))}
                      >
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Store className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="font-medium text-gray-900">{template.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {template.description}
                          </p>
                        </div>
                        {formData.templateId === template.id && (
                          <div className="absolute top-2 right-2">
                            <Check className="h-5 w-5 text-blue-500" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Os templates incluem categorias e produtos pré-definidos que você pode personalizar.
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome da Loja *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
                  placeholder="Ex: Barbearia do João"
                  value={formData.name}
                  onChange={(e) => {
                    const { value } = e.target
                    setFormData(prev => ({ ...prev, name: value }))
                    
                    // Auto-generate slug from name
                    const autoSlug = value
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/[^a-z0-9\s-]/g, '')
                      .replace(/\s+/g, '-')
                      .replace(/-+/g, '-')
                      .trim()
                    
                    handleSlugChange(autoSlug)
                  }}
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                  Identificador único *
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    https://
                  </span>
                  <input
                    type="text"
                    name="slug"
                    id="slug"
                    required
                    className="flex-1 block w-full rounded-none border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
                    placeholder="minha-loja"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                  />
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    .smartcard.app
                  </span>
                  <div className="ml-2 flex items-center">
                    {slugChecking && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                    {!slugChecking && slugCheckResult && (
                      slugCheckResult.available ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )
                    )}
                  </div>
                </div>
                {slugCheckResult && (
                  <div className={`mt-2 p-2 rounded-md ${
                    slugCheckResult.available 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`text-sm font-medium ${
                      slugCheckResult.available ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {slugCheckResult.message}
                    </p>
                  </div>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  Este será o endereço do seu cartão digital. Use apenas letras, números e hífens.
                </p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
                  placeholder="Descreva brevemente seu negócio..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
                  Tipo de Negócio
                </label>
                <select
                  name="businessType"
                  id="businessType"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  value={formData.businessType}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
                >
                  <option value="general">Geral</option>
                  <option value="restaurant">Restaurante</option>
                  <option value="beauty">Beleza e Estética</option>
                  <option value="retail">Varejo</option>
                  <option value="services">Serviços</option>
                  <option value="health">Saúde</option>
                  <option value="automotive">Automotivo</option>
                  <option value="education">Educação</option>
                </select>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
                <p className="mt-2 text-sm text-gray-500">
                  Número para onde os clientes enviarão as mensagens
                </p>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Endereço
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
                  placeholder="Rua, número, bairro, cidade"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="requiresAddress"
                    id="requiresAddress"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.requiresAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, requiresAddress: e.target.checked }))}
                  />
                  <label htmlFor="requiresAddress" className="ml-2 block text-sm text-gray-900">
                    Solicitar endereço dos clientes
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Marque se você faz entregas ou precisa do endereço dos clientes
                </p>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Erro ao criar loja
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Link
                  href="/dashboard"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={loading || !slugCheckResult?.available || !formData.name || !formData.slug || !formData.phone}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Loja'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

