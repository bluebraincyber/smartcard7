'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Check, X } from 'lucide-react'

type BusinessType = 'general' | 'restaurant' | 'beauty' | 'retail' | 'services' | 'health' | 'automotive' | 'education'

const BUSINESS_TYPES = [
  { value: 'general', label: 'Geral' },
  { value: 'restaurant', label: 'Restaurante' },
  { value: 'beauty', label: 'Beleza e Estética' },
  { value: 'retail', label: 'Varejo' },
  { value: 'services', label: 'Serviços' },
  { value: 'health', label: 'Saúde' },
  { value: 'automotive', label: 'Automotivo' },
  { value: 'education', label: 'Educação' },
]

interface StoreBasicInfoStepProps {
  initialData?: {
    name: string
    slug: string
    description: string
    businessType: BusinessType
    phone: string
  }
  onDataChange: (data: {
    name: string
    slug: string
    description: string
    businessType: BusinessType
    phone: string
    isValid: boolean
  }) => void
}

export function StoreBasicInfoStep({ initialData, onDataChange }: StoreBasicInfoStepProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    businessType: initialData?.businessType || 'general' as BusinessType,
    phone: initialData?.phone || '',
  })
  
  const [slugCheck, setSlugCheck] = useState<{
    loading: boolean
    available: boolean | null
    message: string
  }>({
    loading: false,
    available: null,
    message: ''
  })
  
  const [slugTimeout, setSlugTimeout] = useState<NodeJS.Timeout | null>(null)

  // Verificar disponibilidade do slug
  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugCheck({
        loading: false,
        available: false,
        message: 'O identificador deve ter pelo menos 3 caracteres'
      })
      return
    }

    setSlugCheck(prev => ({ ...prev, loading: true }))
    
    try {
      const response = await fetch('/api/slugs/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      })
      
      if (response.ok) {
        const result = await response.json()
        setSlugCheck({
          loading: false,
          available: result.available,
          message: result.message
        })
      } else {
        throw new Error('Erro ao verificar disponibilidade')
      }
    } catch (error) {
      console.error('Erro ao verificar slug:', error)
      setSlugCheck({
        loading: false,
        available: false,
        message: 'Erro ao verificar disponibilidade. Tente novamente.'
      })
    }
  }

  // Atualizar slug baseado no nome
  const updateSlugFromName = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    setFormData(prev => ({
      ...prev,
      slug
    }))
    
    // Agendar verificação do slug
    if (slugTimeout) clearTimeout(slugTimeout)
    const timeout = setTimeout(() => checkSlugAvailability(slug), 500)
    setSlugTimeout(timeout as unknown as NodeJS.Timeout)
  }

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (slugTimeout) clearTimeout(slugTimeout)
    }
  }, [slugTimeout])

  // Notificar mudanças no formulário
  useEffect(() => {
    const isValid = Boolean(
      formData.name.length >= 3 &&
      formData.slug.length >= 3 &&
      formData.phone.replace(/\D/g, '').length >= 10 &&
      slugCheck.available === true
    )

    onDataChange({
      ...formData,
      isValid
    })
  }, [formData, slugCheck.available])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    
    // Formatar telefone: (99) 99999-9999
    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
    } else if (value.length > 5) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3')
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
    } else if (value.length > 0) {
      value = value.replace(/^(\d*)/, '($1')
    }
    
    setFormData(prev => ({
      ...prev,
      phone: value
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="name">Nome da Loja *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => {
            const value = e.target.value
            setFormData(prev => ({ ...prev, name: value }))
            if (!formData.slug || formData.slug === '') {
              updateSlugFromName(value)
            }
          }}
          placeholder="Ex: Barbearia do João"
          className="mt-1"
        />
        <p className="mt-1 text-sm text-muted-foreground">
          O nome que aparecerá no seu cartão digital
        </p>
      </div>

      <div>
        <Label htmlFor="slug">Identificador único *</Label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
            https://
          </span>
          <div className="relative flex-1">
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => {
                const value = e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, '')
                  .replace(/-+/g, '-')
                  .replace(/^-|-$/g, '')
                
                setFormData(prev => ({
                  ...prev,
                  slug: value
                }))
                
                // Verificar disponibilidade após um atraso
                if (slugTimeout) clearTimeout(slugTimeout)
                const timeout = setTimeout(() => checkSlugAvailability(value), 500)
                setSlugTimeout(timeout as unknown as NodeJS.Timeout)
              }}
              className="rounded-l-none"
              placeholder="sua-loja"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {slugCheck.loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : slugCheck.available === true ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : slugCheck.available === false ? (
                <X className="h-4 w-4 text-destructive" />
              ) : null}
            </div>
          </div>
          <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-input bg-muted text-muted-foreground text-sm">
            .smartcard.app
          </span>
        </div>
        {slugCheck.message && (
          <p className={`mt-1 text-sm ${
            slugCheck.available ? 'text-green-600' : 'text-destructive'
          }`}>
            {slugCheck.message}
          </p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          Este será o endereço do seu cartão digital. Use apenas letras, números e hífens.
        </p>
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            description: e.target.value
          }))}
          placeholder="Descreva brevemente seu negócio..."
          className="mt-1"
          rows={3}
        />
        <p className="mt-1 text-sm text-muted-foreground">
          Uma breve descrição que aparecerá na página inicial da sua loja
        </p>
      </div>

      <div>
        <Label htmlFor="businessType">Tipo de Negócio</Label>
        <select
          id="businessType"
          value={formData.businessType}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            businessType: e.target.value as BusinessType
          }))}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {BUSINESS_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-muted-foreground">
          Isso nos ajuda a personalizar sua experiência
        </p>
      </div>

      <div>
        <Label htmlFor="phone">WhatsApp *</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={handlePhoneChange}
          placeholder="(99) 99999-9999"
          className="mt-1"
        />
        <p className="mt-1 text-sm text-muted-foreground">
          Número para onde os clientes enviarão as mensagens
        </p>
      </div>
    </div>
  )
}
