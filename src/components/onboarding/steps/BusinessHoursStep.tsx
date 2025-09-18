'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Clock, Clock9, Clock3, Clock12 } from 'lucide-react'
import { cn } from '@/lib/utils'

type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface BusinessHours {
  dayOfWeek: DayOfWeek
  isOpen: boolean
  openingTime: string
  closingTime: string
  allDay: boolean
}

const DAYS = [
  { id: 0, name: 'Domingo', shortName: 'Dom' },
  { id: 1, name: 'Segunda-feira', shortName: 'Seg' },
  { id: 2, name: 'Terça-feira', shortName: 'Ter' },
  { id: 3, name: 'Quarta-feira', shortName: 'Qua' },
  { id: 4, name: 'Quinta-feira', shortName: 'Qui' },
  { id: 5, name: 'Sexta-feira', shortName: 'Sex' },
  { id: 6, name: 'Sábado', shortName: 'Sáb' },
] as const

const DEFAULT_HOURS: Omit<BusinessHours, 'dayOfWeek'> = {
  isOpen: true,
  openingTime: '09:00',
  closingTime: '18:00',
  allDay: false,
}

export interface BusinessHoursStepProps {
  initialData?: BusinessHours[]
  onDataChange: (data: {
    businessHours: BusinessHours[]
    timezone: string
    isValid: boolean
  }) => void
}

export function BusinessHoursStep({ 
  initialData, 
  onDataChange 
}: BusinessHoursStepProps) {
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>(() => {
    if (initialData && initialData.length > 0) {
      return initialData
    }
    
    // Criar horários padrão para cada dia da semana
    return DAYS.map(day => ({
      ...DEFAULT_HOURS,
      dayOfWeek: day.id as DayOfWeek,
      isOpen: day.id !== 0 // Fechado no domingo por padrão
    }))
  })
  
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [copyToAll, setCopyToAll] = useState<{
    isOpen: boolean
    openingTime: string
    closingTime: string
    allDay: boolean
  } | null>(null)

  // Notificar mudanças no formulário
  useEffect(() => {
    onDataChange({
      businessHours,
      timezone,
      isValid: true // Sempre válido, pois tem valores padrão
    })
  }, [businessHours, timezone])

  const handleDayToggle = (dayId: DayOfWeek, isOpen: boolean) => {
    const updatedHours = businessHours.map(hour =>
      hour.dayOfWeek === dayId
        ? {
            ...hour,
            isOpen,
            openingTime: isOpen ? (hour.openingTime || '09:00') : '',
            closingTime: isOpen ? (hour.closingTime || '18:00') : ''
          }
        : hour
    )
    setBusinessHours(updatedHours)
  }

  const handleTimeChange = (dayId: DayOfWeek, field: 'openingTime' | 'closingTime', time: string) => {
    const updatedHours = businessHours.map(hour =>
      hour.dayOfWeek === dayId
        ? { ...hour, [field]: time, allDay: false }
        : hour
    )
    setBusinessHours(updatedHours)
  }

  const toggleAllDay = (dayId: DayOfWeek) => {
    const day = businessHours.find(h => h.dayOfWeek === dayId)
    if (!day) return

    const updatedHours = businessHours.map(hour =>
      hour.dayOfWeek === dayId
        ? {
            ...hour,
            allDay: !day.allDay,
            openingTime: !day.allDay ? '00:00' : '09:00',
            closingTime: !day.allDay ? '23:59' : '18:00'
          }
        : hour
    )
    setBusinessHours(updatedHours)
  }

  const getDayHours = (dayId: DayOfWeek) => {
    return businessHours.find(h => h.dayOfWeek === dayId) || { ...DEFAULT_HOURS, dayOfWeek: dayId }
  }

  const handleCopySettings = () => {
    const selectedDay = businessHours.find(h => h.dayOfWeek === 1) // Segunda-feira como referência
    if (selectedDay) {
      setCopyToAll({
        isOpen: selectedDay.isOpen,
        openingTime: selectedDay.openingTime,
        closingTime: selectedDay.closingTime,
        allDay: selectedDay.allDay
      })
      
      // Aplicar a todos os dias úteis (segunda a sexta)
      const updatedHours = businessHours.map(hour => {
        if (hour.dayOfWeek >= 1 && hour.dayOfWeek <= 5) { // Segunda a sexta
          return {
            ...hour,
            isOpen: selectedDay.isOpen,
            openingTime: selectedDay.openingTime,
            closingTime: selectedDay.closingTime,
            allDay: selectedDay.allDay
          }
        }
        return hour
      })
      
      setBusinessHours(updatedHours)
    }
  }

  const handleCopyToAllDays = () => {
    if (!copyToAll) return
    
    const updatedHours = businessHours.map(hour => ({
      ...hour,
      isOpen: copyToAll.isOpen,
      openingTime: copyToAll.openingTime,
      closingTime: copyToAll.closingTime,
      allDay: copyToAll.allDay
    }))
    
    setBusinessHours(updatedHours)
    setCopyToAll(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Horário de Funcionamento</h3>
        <p className="text-sm text-muted-foreground">
          Defina os horários em que sua loja está aberta para atendimento.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <Label>Fuso Horário</Label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
              <option value="America/Manaus">Manaus (GMT-4)</option>
              <option value="America/Rio_Branco">Rio Branco (GMT-5)</option>
              <option value="America/Noronha">Fernando de Noronha (GMT-2)</option>
            </select>
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-6"
            onClick={handleCopySettings}
          >
            Copiar horários da Segunda para dias úteis
          </Button>
        </div>

        {copyToAll && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700 flex items-center justify-between">
            <span>Deseja aplicar esses horários para todos os dias?</span>
            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setCopyToAll(null)}
              >
                Cancelar
              </Button>
              <Button 
                type="button" 
                size="sm"
                onClick={handleCopyToAllDays}
              >
                Aplicar para todos
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {DAYS.map((day) => {
            const dayHours = getDayHours(day.id as DayOfWeek)
            const isOpen = dayHours.isOpen

            return (
              <div
                key={day.id}
                className="flex flex-col space-y-2 p-4 rounded-lg border bg-card/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id={`day-${day.id}`}
                      checked={isOpen}
                      onCheckedChange={(checked) => handleDayToggle(day.id as DayOfWeek, checked)}
                    />
                    <Label htmlFor={`day-${day.id}`} className="font-medium">
                      {day.name}
                    </Label>
                  </div>

                  {isOpen && (
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant={dayHours.allDay ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleAllDay(day.id as DayOfWeek)}
                        className="text-xs h-7 px-2"
                      >
                        <Clock12 className="h-3.5 w-3.5 mr-1" />
                        {dayHours.allDay ? 'Dia Todo' : 'Dia Todo'}
                      </Button>
                    </div>
                  )}
                </div>

                {isOpen && !dayHours.allDay && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 pl-9">
                    <div>
                      <Label htmlFor={`opening-${day.id}`} className="text-xs text-muted-foreground">
                        Abertura
                      </Label>
                      <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Clock9 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <input
                          type="time"
                          id={`opening-${day.id}`}
                          value={dayHours.openingTime}
                          onChange={(e) => handleTimeChange(day.id as DayOfWeek, 'openingTime', e.target.value)}
                          className="pl-10 block w-full rounded-md border border-input bg-background py-1.5 text-sm shadow-sm focus:ring-1 focus:ring-ring focus:ring-offset-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`closing-${day.id}`} className="text-xs text-muted-foreground">
                        Fechamento
                      </Label>
                      <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Clock3 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <input
                          type="time"
                          id={`closing-${day.id}`}
                          value={dayHours.closingTime}
                          onChange={(e) => handleTimeChange(day.id as DayOfWeek, 'closingTime', e.target.value)}
                          className="pl-10 block w-full rounded-md border border-input bg-background py-1.5 text-sm shadow-sm focus:ring-1 focus:ring-ring focus:ring-offset-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                          min={dayHours.openingTime}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="pt-4 border-t">
        <h4 className="text-sm font-medium mb-3">Feriados e Datas Especiais</h4>
        <div className="p-4 bg-muted/30 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground mb-3">
            Você pode configurar horários especiais para feriados diretamente no painel da sua loja após a conclusão do cadastro.
          </p>
          <Button type="button" variant="outline" size="sm">
            Gerenciar feriados
          </Button>
        </div>
      </div>
    </div>
  )
}
