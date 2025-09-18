'use client'

import { CheckCircle2, Clock, CreditCard, MapPin, Palette, Phone, Store, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface BusinessHours {
  dayOfWeek: number
  isOpen: boolean
  openingTime: string
  closingTime: string
  allDay: boolean
}

interface ReviewStepProps {
  storeData: {
    name: string
    slug: string
    description?: string
    businessType: string
    phone: string
    address?: string
    requiresAddress: boolean
    primaryColor: string
    coverImage?: string
    profileImage?: string
    logoImage?: string
  }
  deliveryData: {
    deliveryFee: number
    deliveryRadius: number
    deliveryTime: string
    deliveryAreas: Array<{
      neighborhood: string
      fee: number
      estimatedTime: string
    }>
  }
  paymentData: {
    paymentMethods: string[]
    cashChange: boolean
    additionalFees: Array<{
      type: 'percentage' | 'fixed'
      value: number
      appliesTo: string[]
      description: string
    }>
  }
  businessHoursData: {
    businessHours: BusinessHours[]
    timezone: string
  }
  onEdit: (step: number) => void
  onSubmit: () => void
  isSubmitting: boolean
}

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

const PAYMENT_METHOD_NAMES: Record<string, string> = {
  pix: 'PIX',
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  cash: 'Dinheiro',
  bank_transfer: 'Transferência Bancária'
}

export function ReviewStep({ 
  storeData, 
  deliveryData, 
  paymentData, 
  businessHoursData, 
  onEdit, 
  onSubmit,
  isSubmitting 
}: ReviewStepProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatTimeRange = (openingTime: string, closingTime: string, allDay: boolean) => {
    if (allDay) return '24 horas'
    return `${openingTime} - ${closingTime}`
  }

  const getBusinessDays = () => {
    return businessHoursData.businessHours
      .filter(day => day.isOpen)
      .map(day => ({
        name: DAY_NAMES[day.dayOfWeek],
        hours: formatTimeRange(day.openingTime, day.closingTime, day.allDay)
      }))
  }

  const getPaymentMethods = () => {
    return paymentData.paymentMethods.map(method => ({
      name: PAYMENT_METHOD_NAMES[method] || method,
      details: method === 'cash' && paymentData.cashChange ? '(Com troco)' : ''
    }))
  }

  const getDeliveryInfo = () => {
    if (!storeData.requiresAddress) return 'Não requer endereço'
    
    const baseInfo = [
      `Taxa: ${formatCurrency(deliveryData.deliveryFee)}`,
      `Raio: ${deliveryData.deliveryRadius} km`,
      `Tempo: ${deliveryData.deliveryTime.replace('-', ' a ')} min`
    ]
    
    if (deliveryData.deliveryAreas.length > 0) {
      baseInfo.push(`${deliveryData.deliveryAreas.length} área(s) personalizada(s)`)
    }
    
    return baseInfo.join(' • ')
  }

  const sections = [
    {
      title: 'Informações da Loja',
      icon: Store,
      onEdit: () => onEdit(0),
      items: [
        { label: 'Nome', value: storeData.name },
        { label: 'URL', value: `https://${storeData.slug}.smartcard.app` },
        { label: 'Descrição', value: storeData.description || 'Não informada' },
        { label: 'Tipo de Negócio', value: storeData.businessType },
        { label: 'WhatsApp', value: storeData.phone }
      ]
    },
    {
      title: 'Endereço e Entrega',
      icon: MapPin,
      onEdit: () => onEdit(1),
      items: [
        { 
          label: 'Endereço', 
          value: storeData.address || 'Não informado',
          icon: storeData.address ? CheckCircle2 : XCircle,
          iconClass: storeData.address ? 'text-green-500' : 'text-muted-foreground'
        },
        { 
          label: 'Requer endereço', 
          value: storeData.requiresAddress ? 'Sim' : 'Não',
          icon: storeData.requiresAddress ? CheckCircle2 : XCircle,
          iconClass: storeData.requiresAddress ? 'text-green-500' : 'text-muted-foreground'
        },
        { 
          label: 'Entrega', 
          value: getDeliveryInfo(),
          icon: storeData.requiresAddress ? CheckCircle2 : XCircle,
          iconClass: storeData.requiresAddress ? 'text-green-500' : 'text-muted-foreground'
        }
      ]
    },
    {
      title: 'Personalização',
      icon: Palette,
      onEdit: () => onEdit(2),
      items: [
        { 
          label: 'Cor Principal', 
          value: (
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-2 border" 
                style={{ backgroundColor: storeData.primaryColor }}
              />
              <span>{storeData.primaryColor.toUpperCase()}</span>
            </div>
          )
        },
        { 
          label: 'Imagens', 
          value: [
            storeData.coverImage ? 'Capa' : '',
            storeData.profileImage ? 'Perfil' : '',
            storeData.logoImage ? 'Logo' : ''
          ].filter(Boolean).join(', ') || 'Nenhuma imagem adicionada'
        }
      ]
    },
    {
      title: 'Pagamentos',
      icon: CreditCard,
      onEdit: () => onEdit(3),
      items: [
        { 
          label: 'Métodos de Pagamento', 
          value: getPaymentMethods().map(p => `${p.name} ${p.details}`).join(', ')
        },
        ...(paymentData.additionalFees.length > 0 ? [
          {
            label: 'Taxas Adicionais',
            value: (
              <ul className="list-disc list-inside space-y-1">
                {paymentData.additionalFees.map((fee, i) => (
                  <li key={i}>
                    {fee.description}: {fee.type === 'percentage' 
                      ? `${fee.value}%` 
                      : formatCurrency(fee.value)
                    } (aplicado em: {fee.appliesTo.map(m => PAYMENT_METHOD_NAMES[m] || m).join(', ')})
                  </li>
                ))}
              </ul>
            )
          }
        ] : [])
      ]
    },
    {
      title: 'Horário de Funcionamento',
      icon: Clock,
      onEdit: () => onEdit(4),
      items: [
        {
          label: 'Dias e Horários',
          value: (
            <div className="space-y-1">
              {getBusinessDays().map((day, i) => (
                <div key={i} className="flex">
                  <span className="w-24 font-medium">{day.name}:</span>
                  <span>{day.hours}</span>
                </div>
              ))}
            </div>
          )
        },
        {
          label: 'Fuso Horário',
          value: businessHoursData.timezone
        }
      ]
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Revise suas informações</h2>
        <p className="text-muted-foreground">
          Confira todas as informações antes de finalizar o cadastro da sua loja.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section, sectionIndex) => (
          <Card key={sectionIndex}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center">
                  <section.icon className="h-5 w-5 mr-2 text-muted-foreground" />
                  {section.title}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={section.onEdit}
                  disabled={isSubmitting}
                >
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-sm font-medium text-muted-foreground flex items-start">
                      {item.icon ? (
                        <item.icon className={`inline-block h-4 w-4 mr-1.5 mt-0.5 ${item.iconClass || ''}`} />
                      ) : null}
                      {item.label}
                    </div>
                    <div className="md:col-span-3 text-sm">
                      {typeof item.value === 'string' ? (
                        <p className={!item.value || item.value === 'Não informado' ? 'text-muted-foreground' : ''}>
                          {item.value || '—'}
                        </p>
                      ) : (
                        item.value
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-4 border-t">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Você poderá alterar essas informações a qualquer momento nas configurações da sua loja.
          </p>
          <Button 
            onClick={onSubmit} 
            disabled={isSubmitting}
            className="min-w-40"
          >
            {isSubmitting ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Confirmar e Criar Loja'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
