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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-foreground">Nova Loja</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie seu cartão digital em poucos minutos
          </p>
        </div>

        <div className="max-w-2xl">
          <div className="bg-card shadow rounded-lg border border-border">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Template Selection */}
                {templates.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-4">
                      Escolha seu Nicho de Negócio
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {/* Criar do Zero */}
                      <div 
                        className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          formData.templateId === '' 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-border/80'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, templateId: '' }))}
                      >
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-3 bg-muted rounded-lg flex items-center justify-center">
                            <Store className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <h3 className="font-medium text-foreground">Criar do Zero</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Comece com uma loja em branco e personalize tudo
                          </p>
                        </div>
                        {formData.templateId === '' && (
                          <div className="absolute top-2 right-2">
                            <Check className="h-5 w-5 text-primary" />
                          </div>
                        )}
                      </div>
                      
                      {/* Templates */}
                      {templates.map((template) => (
                        <div 
                          key={template.id}
                          className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            formData.templateId === template.id 
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-border/80'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, templateId: template.id }))}
                        >
                          <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                              <Store className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <h3 className="font-medium text-foreground">{template.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                          </div>
                          {formData.templateId === template.id && (
                            <div className="absolute top-2 right-2">
                              <Check className="h-5 w-5 text-primary" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Os templates incluem categorias e produtos pré-definidos que você pode personalizar.
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground">
                    Nome da Loja *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    className="mt-1 block w-full border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm text-foreground placeholder-muted-foreground bg-background"
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
                  <label htmlFor="slug" className="block text-sm font-medium text-foreground">
                    Identificador único *
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground text-sm">
                      https://
                    </span>
                    <input
                      type="text"
                      name="slug"
                      id="slug"
                      required
                      className="flex-1 block w-full rounded-none border-border focus:ring-primary focus:border-primary sm:text-sm text-foreground placeholder-muted-foreground bg-background"
                      placeholder="minha-loja"
                      value={formData.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                    />
                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-border bg-muted text-muted-foreground text-sm">
                      .smartcard.app
                    </span>
                    <div className="ml-2 flex items-center">
                      {slugChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      {!slugChecking && slugCheckResult && (
                        slugCheckResult.available ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-brand-blue" />
                        )
                      )}
                    </div>
                  </div>
                  {slugCheckResult && (
                    <div className={`mt-2 p-2 rounded-md ${
                      slugCheckResult.available 
                        ? 'bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800/30' 
                        : 'bg-brand-blue/10 border border-brand-blue/20 dark:bg-brand-blue/10 dark:border-brand-blue/30'
                    }`}>
                      <p className={`text-sm font-medium ${
                        slugCheckResult.available ? 'text-green-700 dark:text-green-400' : 'text-brand-blue dark:text-brand-blue/90'
                      }`}>
                        {slugCheckResult.message}
                      </p>
                    </div>
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">
                    Este será o endereço do seu cartão digital. Use apenas letras, números e hífens.
                  </p>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-foreground">
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    className="mt-1 block w-full border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm text-foreground placeholder-muted-foreground bg-background"
                    placeholder="Descreva brevemente seu negócio..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium text-foreground">
                    Tipo de Negócio
                  </label>
                  <select
                    name="businessType"
                    id="businessType"
                    className="mt-1 block w-full border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm text-foreground bg-background"
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
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    required
                    className="mt-1 block w-full border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm text-foreground placeholder-muted-foreground bg-background"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Número para onde os clientes enviarão as mensagens
                  </p>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-foreground">
                    Endereço
                  </label>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    className="mt-1 block w-full border-border rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm text-foreground placeholder-muted-foreground bg-background"
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
                      className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                      checked={formData.requiresAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, requiresAddress: e.target.checked }))}
                    />
                    <label htmlFor="requiresAddress" className="ml-2 block text-sm text-foreground">
                      Solicitar endereço dos clientes
                    </label>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Marque se você faz entregas ou precisa do endereço dos clientes
                  </p>
                </div>

                {error && (
                  <div className="rounded-md bg-brand-blue/10 border border-brand-blue/20 dark:bg-brand-blue/10 dark:border-brand-blue/30 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-brand-blue" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-brand-blue dark:text-brand-blue/90">
                          Erro ao criar loja
                        </h3>
                        <div className="mt-2 text-sm text-brand-blue dark:text-brand-blue/90">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <Link
                    href="/dashboard"
                    className="bg-background py-2 px-4 border border-border rounded-md shadow-sm text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={loading || !slugCheckResult?.available || !formData.name || !formData.slug || !formData.phone}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
    </div>
  )
}
