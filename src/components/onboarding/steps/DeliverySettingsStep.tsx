'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

export interface DeliverySettingsStepProps {
  initialData?: {
    address?: string
    requiresAddress: boolean
    deliveryFee: number
    deliveryRadius: number
    deliveryTime: string
    deliveryAreas: Array<{
      neighborhood: string
      fee: number
      estimatedTime: string
    }>
  }
  onDataChange: (data: {
    address: string
    requiresAddress: boolean
    deliveryFee: number
    deliveryRadius: number
    deliveryTime: string
    deliveryAreas: Array<{
      neighborhood: string
      fee: number
      estimatedTime: string
    }>
    isValid: boolean
  }) => void
}

export function DeliverySettingsStep({ 
  initialData, 
  onDataChange 
}: DeliverySettingsStepProps) {
  const [formData, setFormData] = useState({
    address: initialData?.address || '',
    requiresAddress: initialData?.requiresAddress || false,
    deliveryFee: initialData?.deliveryFee || 0,
    deliveryRadius: initialData?.deliveryRadius || 5,
    deliveryTime: initialData?.deliveryTime || '30-60',
    deliveryAreas: initialData?.deliveryAreas || [],
    showAdvanced: false
  })

  const [newArea, setNewArea] = useState({
    neighborhood: '',
    fee: 0,
    estimatedTime: '30-60'
  })

  // Notificar mudanças no formulário
  useEffect(() => {
    const isValid = true // Esta etapa é sempre válida, pois é opcional
    
    onDataChange({
      address: formData.address,
      requiresAddress: formData.requiresAddress,
      deliveryFee: formData.deliveryFee,
      deliveryRadius: formData.deliveryRadius,
      deliveryTime: formData.deliveryTime,
      deliveryAreas: formData.deliveryAreas,
      isValid
    })
  }, [formData])

  const handleAddArea = () => {
    if (!newArea.neighborhood || newArea.fee < 0) return

    setFormData(prev => ({
      ...prev,
      deliveryAreas: [
        ...prev.deliveryAreas,
        {
          neighborhood: newArea.neighborhood,
          fee: Number(newArea.fee),
          estimatedTime: newArea.estimatedTime
        }
      ]
    }))

    // Limpar o formulário
    setNewArea({
      neighborhood: '',
      fee: 0,
      estimatedTime: '30-60'
    })
  }

  const removeArea = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deliveryAreas: prev.deliveryAreas.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="requiresAddress">Solicitar endereço dos clientes</Label>
          <Switch
            id="requiresAddress"
            checked={formData.requiresAddress}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, requiresAddress: checked }))
            }
          />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {formData.requiresAddress 
            ? 'Os clientes precisarão informar o endereço ao fazer pedidos.'
            : 'Os clientes não precisarão informar endereço.'}
        </p>
      </div>

      {formData.requiresAddress && (
        <>
          <div>
            <Label htmlFor="address">Endereço da Loja</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, address: e.target.value }))
              }
              placeholder="Ex: Rua Exemplo, 123 - Centro, Cidade - Estado"
              className="mt-1"
            />
            <p className="mt-1 text-sm text-muted-foreground">
              Este endereço será usado para calcular distâncias de entrega.
            </p>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Configurações de Entrega</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="deliveryFee">Taxa de Entrega Padrão (R$)</Label>
                <Input
                  id="deliveryFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.deliveryFee}
                  onChange={(e) => 
                    setFormData(prev => ({
                      ...prev,
                      deliveryFee: parseFloat(e.target.value) || 0
                    }))
                  }
                  className="mt-1 w-32"
                />
              </div>

              <div>
                <Label htmlFor="deliveryRadius">Raio de Entrega (km)</Label>
                <Input
                  id="deliveryRadius"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.deliveryRadius}
                  onChange={(e) => 
                    setFormData(prev => ({
                      ...prev,
                      deliveryRadius: parseFloat(e.target.value) || 0
                    }))
                  }
                  className="mt-1 w-32"
                />
              </div>

              <div>
                <Label htmlFor="deliveryTime">Tempo Médio de Entrega</Label>
                <select
                  id="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={(e) => 
                    setFormData(prev => ({
                      ...prev,
                      deliveryTime: e.target.value
                    }))
                  }
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="30-45">30-45 minutos</option>
                  <option value="45-60">45-60 minutos</option>
                  <option value="60-90">1-1.5 horas</option>
                  <option value="90-120">1.5-2 horas</option>
                  <option value="120-180">2-3 horas</option>
                  <option value="180-240">3-4 horas</option>
                  <option value="240-1440">4+ horas</option>
                </select>
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Áreas de Entrega Personalizadas</h4>
                  <button
                    type="button"
                    onClick={() => 
                      setFormData(prev => ({ 
                        ...prev, 
                        showAdvanced: !prev.showAdvanced 
                      }))
                    }
                    className="text-sm text-primary hover:underline"
                  >
                    {formData.showAdvanced ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>

                {formData.showAdvanced && (
                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="areaNeighborhood">Bairro</Label>
                        <Input
                          id="areaNeighborhood"
                          value={newArea.neighborhood}
                          onChange={(e) => 
                            setNewArea(prev => ({
                              ...prev,
                              neighborhood: e.target.value
                            }))
                          }
                          placeholder="Nome do bairro"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="areaFee">Taxa (R$)</Label>
                        <Input
                          id="areaFee"
                          type="number"
                          min="0"
                          step="0.01"
                          value={newArea.fee}
                          onChange={(e) => 
                            setNewArea(prev => ({
                              ...prev,
                              fee: parseFloat(e.target.value) || 0
                            }))
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="areaTime">Tempo</Label>
                        <select
                          id="areaTime"
                          value={newArea.estimatedTime}
                          onChange={(e) => 
                            setNewArea(prev => ({
                              ...prev,
                              estimatedTime: e.target.value
                            }))
                          }
                          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="30-45">30-45 minutos</option>
                          <option value="45-60">45-60 minutos</option>
                          <option value="60-90">1-1.5 horas</option>
                          <option value="90-120">1.5-2 horas</option>
                          <option value="120-180">2-3 horas</option>
                          <option value="180-240">3-4 horas</option>
                          <option value="240-1440">4+ horas</option>
                        </select>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleAddArea}
                      disabled={!newArea.neighborhood}
                      className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      + Adicionar área
                    </button>

                    {formData.deliveryAreas.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h5 className="text-sm font-medium">Áreas cadastradas:</h5>
                        <div className="space-y-2">
                          {formData.deliveryAreas.map((area, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-background rounded border">
                              <div>
                                <p className="font-medium">{area.neighborhood}</p>
                                <p className="text-sm text-muted-foreground">
                                  R$ {area.fee.toFixed(2)} • {area.estimatedTime.includes('-') 
                                    ? area.estimatedTime.replace('-', ' a ') + ' min' 
                                    : area.estimatedTime}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeArea(index)}
                                className="text-destructive hover:text-destructive/80"
                              >
                                Remover
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
