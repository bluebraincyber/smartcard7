'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'bank_transfer'

export interface PaymentSettingsStepProps {
  initialData?: {
    paymentMethods: PaymentMethod[]
    bankAccount?: {
      bankCode: string
      agency: string
      account: string
      accountType: 'checking' | 'savings'
      document: string
      legalName: string
    }
    pixKey?: string
    pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'
    cashChange: boolean
    additionalFees: Array<{
      type: 'percentage' | 'fixed'
      value: number
      appliesTo: PaymentMethod[]
      description: string
    }>
  }
  onDataChange: (data: {
    paymentMethods: PaymentMethod[]
    bankAccount?: {
      bankCode: string
      agency: string
      account: string
      accountType: 'checking' | 'savings'
      document: string
      legalName: string
    }
    pixKey?: string
    pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'
    cashChange: boolean
    additionalFees: Array<{
      type: 'percentage' | 'fixed'
      value: number
      appliesTo: PaymentMethod[]
      description: string
    }>
    isValid: boolean
  }) => void
}

const PAYMENT_METHODS = [
  { id: 'pix', name: 'PIX', description: 'Pagamento instantâneo' },
  { id: 'credit_card', name: 'Cartão de Crédito', description: 'Até 12x' },
  { id: 'debit_card', name: 'Cartão de Débito', description: 'À vista' },
  { id: 'cash', name: 'Dinheiro', description: 'Pagamento na entrega' },
  { id: 'bank_transfer', name: 'Transferência Bancária', description: 'Dados bancários' },
] as const

const BANKS = [
  { code: '001', name: 'Banco do Brasil' },
  { code: '033', name: 'Santander' },
  { code: '077', name: 'Inter' },
  { code: '104', name: 'Caixa Econômica Federal' },
  { code: '212', name: 'Original' },
  { code: '237', name: 'Bradesco' },
  { code: '260', name: 'Nubank' },
  { code: '336', name: 'C6 Bank' },
  { code: '341', name: 'Itaú' },
  { code: '422', name: 'Banco Safra' },
  { code: '655', name: 'Neon' },
  { code: '000', name: 'Outro' },
]

export function PaymentSettingsStep({ 
  initialData, 
  onDataChange 
}: PaymentSettingsStepProps) {
  const [formData, setFormData] = useState({
    paymentMethods: initialData?.paymentMethods || ['pix', 'cash'] as PaymentMethod[],
    bankAccount: initialData?.bankAccount || {
      bankCode: '',
      agency: '',
      account: '',
      accountType: 'checking' as const,
      document: '',
      legalName: ''
    },
    pixKey: initialData?.pixKey || '',
    pixKeyType: initialData?.pixKeyType || 'random' as const,
    cashChange: initialData?.cashChange || false,
    additionalFees: initialData?.additionalFees || [],
    showBankForm: false,
    showPixForm: false,
    showFeeForm: false,
    newFee: {
      type: 'percentage' as 'percentage' | 'fixed',
      value: 0,
      appliesTo: [] as PaymentMethod[],
      description: ''
    }
  })

  // Notificar mudanças no formulário
  useEffect(() => {
    const isValid = formData.paymentMethods.length > 0
    
    onDataChange({
      paymentMethods: formData.paymentMethods,
      bankAccount: formData.paymentMethods.includes('bank_transfer') ? formData.bankAccount : undefined,
      pixKey: formData.paymentMethods.includes('pix') ? formData.pixKey : undefined,
      pixKeyType: formData.paymentMethods.includes('pix') ? formData.pixKeyType : undefined,
      cashChange: formData.cashChange,
      additionalFees: formData.additionalFees,
      isValid
    })
  }, [formData])

  const togglePaymentMethod = (method: PaymentMethod) => {
    setFormData(prev => {
      const methods = [...prev.paymentMethods]
      const index = methods.indexOf(method)
      
      if (index > -1) {
        methods.splice(index, 1)
      } else {
        methods.push(method)
      }
      
      return { ...prev, paymentMethods: methods }
    })
  }

  const toggleFeePaymentMethod = (method: PaymentMethod) => {
    setFormData(prev => {
      const appliesTo = [...prev.newFee.appliesTo]
      const index = appliesTo.indexOf(method)
      
      if (index > -1) {
        appliesTo.splice(index, 1)
      } else {
        appliesTo.push(method)
      }
      
      return { 
        ...prev, 
        newFee: { 
          ...prev.newFee, 
          appliesTo 
        } 
      }
    })
  }

  const addFee = () => {
    if (
      formData.newFee.description && 
      formData.newFee.value > 0 && 
      formData.newFee.appliesTo.length > 0
    ) {
      setFormData(prev => ({
        ...prev,
        additionalFees: [...prev.additionalFees, { ...prev.newFee }],
        newFee: {
          type: 'percentage',
          value: 0,
          appliesTo: [],
          description: ''
        },
        showFeeForm: false
      }))
    }
  }

  const removeFee = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalFees: prev.additionalFees.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Métodos de Pagamento</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Selecione os métodos de pagamento que você aceita em sua loja.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PAYMENT_METHODS.map(method => (
            <Card 
              key={method.id}
              className={cn(
                'cursor-pointer transition-all',
                formData.paymentMethods.includes(method.id as PaymentMethod)
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-muted-foreground/30'
              )}
              onClick={() => togglePaymentMethod(method.id as PaymentMethod)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    'flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full',
                    formData.paymentMethods.includes(method.id as PaymentMethod)
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  )}>
                    <span className="text-lg font-medium">{method.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {method.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {method.description}
                    </p>
                  </div>
                  <div className={cn(
                    'flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center',
                    formData.paymentMethods.includes(method.id as PaymentMethod)
                      ? 'bg-primary border-primary text-white'
                      : 'border-muted-foreground/30'
                  )}>
                    {formData.paymentMethods.includes(method.id as PaymentMethod) && (
                      <svg className="h-3 w-3" viewBox="0 0 12 10">
                        <path 
                          fill="currentColor" 
                          d="M10.28 1.28L3.987 7.575 1.695 5.28A1 1 0 00.28 6.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 1.28z"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Configuração do PIX */}
      {formData.paymentMethods.includes('pix') && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Configuração do PIX</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  showPixForm: !prev.showPixForm 
                }))}
              >
                {formData.showPixForm ? 'Ocultar' : 'Configurar'}
              </Button>
            </div>
          </CardHeader>
          
          {formData.showPixForm && (
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pixKeyType">Tipo de Chave PIX</Label>
                <select
                  id="pixKeyType"
                  value={formData.pixKeyType}
                  onChange={(e) => 
                    setFormData(prev => ({
                      ...prev,
                      pixKeyType: e.target.value as any,
                      pixKey: '' // Resetar a chave ao mudar o tipo
                    }))
                  }
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">E-mail</option>
                  <option value="phone">Telefone</option>
                  <option value="random">Chave Aleatória</option>
                </select>
              </div>

              <div>
                <Label htmlFor="pixKey">
                  Chave PIX
                  {formData.pixKeyType === 'random' && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                            <Info className="h-3 w-3" />
                            <span className="sr-only">Sobre chaves aleatórias</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm max-w-xs">
                            Uma chave aleatória será gerada automaticamente pelo nosso sistema.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </Label>
                
                {formData.pixKeyType === 'random' ? (
                  <div className="mt-1 px-3 py-2 text-sm text-muted-foreground bg-muted/50 rounded-md">
                    Uma chave aleatória será gerada automaticamente.
                  </div>
                ) : (
                  <Input
                    id="pixKey"
                    value={formData.pixKey}
                    onChange={(e) => 
                      setFormData(prev => ({
                        ...prev,
                        pixKey: e.target.value
                      }))
                    }
                    placeholder={
                      formData.pixKeyType === 'cpf' ? '000.000.000-00' :
                      formData.pixKeyType === 'cnpj' ? '00.000.000/0000-00' :
                      formData.pixKeyType === 'email' ? 'seu@email.com' :
                      formData.pixKeyType === 'phone' ? '(00) 00000-0000' : ''
                    }
                    className="mt-1"
                  />
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Configuração de Troco */}
      {formData.paymentMethods.includes('cash') && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pagamento em Dinheiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <Switch
                id="cashChange"
                checked={formData.cashChange}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, cashChange: checked }))
                }
              />
              <Label htmlFor="cashChange">
                Oferecer troco para pagamento em dinheiro
              </Label>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {formData.cashChange 
                ? 'Você precisará informar o valor para troco quando o cliente pagar em dinheiro.'
                : 'Os clientes devem informar o valor exato para pagamento.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Configuração de Taxas Adicionais */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Taxas Adicionais</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFormData(prev => ({ 
                ...prev, 
                showFeeForm: !prev.showFeeForm 
              }))}
            >
              {formData.showFeeForm ? 'Cancelar' : 'Adicionar Taxa'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {formData.showFeeForm && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
              <div>
                <Label>Descrição da Taxa</Label>
                <Input
                  value={formData.newFee.description}
                  onChange={(e) => 
                    setFormData(prev => ({
                      ...prev,
                      newFee: {
                        ...prev.newFee,
                        description: e.target.value
                      }
                    }))
                  }
                  placeholder="Ex: Taxa de entrega, Taxa de serviço, etc."
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Taxa</Label>
                  <select
                    value={formData.newFee.type}
                    onChange={(e) => 
                      setFormData(prev => ({
                        ...prev,
                        newFee: {
                          ...prev.newFee,
                          type: e.target.value as 'percentage' | 'fixed'
                        }
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="percentage">Percentual (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>
                
                <div>
                  <Label>
                    {formData.newFee.type === 'percentage' 
                      ? 'Valor (%)' 
                      : 'Valor (R$)'}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step={formData.newFee.type === 'percentage' ? '0.1' : '0.01'}
                    value={formData.newFee.value}
                    onChange={(e) => 
                      setFormData(prev => ({
                        ...prev,
                        newFee: {
                          ...prev.newFee,
                          value: parseFloat(e.target.value) || 0
                        }
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Aplicar aos métodos:</Label>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHODS
                    .filter(method => formData.paymentMethods.includes(method.id as PaymentMethod))
                    .map(method => (
                      <button
                        key={method.id}
                        type="button"
                        className={cn(
                          'px-3 py-1 text-sm rounded-full border',
                          formData.newFee.appliesTo.includes(method.id as PaymentMethod)
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-background border-border text-muted-foreground hover:border-muted-foreground/50'
                        )}
                        onClick={() => toggleFeePaymentMethod(method.id as PaymentMethod)}
                      >
                        {method.name}
                      </button>
                    ))
                  }
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  onClick={addFee}
                  disabled={
                    !formData.newFee.description || 
                    formData.newFee.value <= 0 ||
                    formData.newFee.appliesTo.length === 0
                  }
                >
                  Adicionar Taxa
                </Button>
              </div>
            </div>
          )}
          
          {formData.additionalFees.length > 0 ? (
            <div className="space-y-2">
              {formData.additionalFees.map((fee, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{fee.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {fee.type === 'percentage' 
                        ? `${fee.value}%` 
                        : `R$ ${fee.value.toFixed(2).replace('.', ',')}`}
                      {' • Aplicado em: '}
                      {fee.appliesTo.map((methodId, i) => {
                        const method = PAYMENT_METHODS.find(m => m.id === methodId)
                        return (
                          <span key={methodId}>
                            {method?.name}
                            {i < fee.appliesTo.length - 1 ? ', ' : ''}
                          </span>
                        )
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeFee(index)}
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma taxa adicional cadastrada.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
