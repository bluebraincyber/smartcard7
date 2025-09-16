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
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <Link
            href={`/dashboard/store/${store.id}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-card/80 hover:bg-card rounded-xl shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm border border-border mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a Loja
          </Link>
          
          <div className="text-center mb-8">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-20 rounded-full blur-xl scale-150"></div>
              <div className="relative z-10 mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <ArrowLeft className="h-6 w-6 text-primary-foreground transform rotate-180" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
              Editar Loja
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Atualize as informações e configurações da sua loja
            </p>
          </div>
        </div>

        <div className="bg-card/90 backdrop-blur-sm rounded-3xl shadow-xl border border-border">
          <form onSubmit={handleSubmit} className="space-y-8 p-8">
            {error && (
              <div className="bg-destructive/10 backdrop-blur-sm border border-destructive/20 rounded-2xl p-6">
                <div className="flex">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center mr-4">
                    <X className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-destructive mb-1">Erro ao salvar</h3>
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {/* Basic Info */}
              <div className="bg-muted/30 backdrop-blur-sm rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Informações Básicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground">
                      Nome da Loja *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="mt-1 block w-full border-border rounded-xl shadow-sm focus:ring-primary focus:border-primary sm:text-sm transition-all duration-200 bg-background text-foreground"
                      placeholder="Ex: Minha Loja Incrível"
                    />
                  </div>

                  <div>
                    <label htmlFor="businessType" className="block text-sm font-medium text-foreground">
                      Tipo de Negócio
                    </label>
                    <select
                      id="businessType"
                      value={formData.businessType}
                      onChange={(e) => handleInputChange('businessType', e.target.value)}
                      className="mt-1 block w-full border-border rounded-xl shadow-sm focus:ring-primary focus:border-primary sm:text-sm transition-all duration-200 bg-background text-foreground"
                    >
                      <option value="general">Geral</option>
                      <option value="restaurant">Restaurante</option>
                      <option value="retail">Varejo</option>
                      <option value="service">Serviços</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-8 border-t border-border">
                <Link
                  href={`/dashboard/store/${store.id}`}
                  className="px-6 py-3 text-sm font-medium text-foreground bg-background border border-border rounded-xl hover:bg-muted hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={loading || (slugCheckResult && !slugCheckResult.available)}
                  className="px-6 py-3 text-sm font-medium text-primary-foreground bg-gradient-to-r from-primary to-primary/80 border border-transparent rounded-xl hover:from-primary/90 hover:to-primary/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}