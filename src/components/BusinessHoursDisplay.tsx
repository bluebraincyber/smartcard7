'use client'

import { Clock, Clock9, Clock3, Clock12, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BusinessHours } from './BusinessHoursInput'

const DAYS = [
  { id: 0, name: 'Domingo', shortName: 'Dom' },
  { id: 1, name: 'Segunda-feira', shortName: 'Seg' },
  { id: 2, name: 'Terça-feira', shortName: 'Ter' },
  { id: 3, name: 'Quarta-feira', shortName: 'Qua' },
  { id: 4, name: 'Quinta-feira', shortName: 'Qui' },
  { id: 5, name: 'Sexta-feira', shortName: 'Sex' },
  { id: 6, name: 'Sábado', shortName: 'Sáb' },
]

interface BusinessHoursDisplayProps {
  businessHours: BusinessHours[]
  timezone?: string
  className?: string
}

export function BusinessHoursDisplay({ 
  businessHours = [], 
  timezone = 'America/Sao_Paulo',
  className 
}: BusinessHoursDisplayProps) {
  // Se não houver horários definidos, retorna null
  if (!businessHours || businessHours.length === 0) {
    return null
  }

  // Verifica se a loja está aberta agora
  const getCurrentStatus = () => {
    const now = new Date()
    const today = now.getDay() // 0 (Domingo) a 6 (Sábado)
    const currentTime = now.getHours() * 100 + now.getMinutes() // Formato HHMM
    
    const todayHours = businessHours.find(h => h.dayOfWeek === today)
    
    if (!todayHours || !todayHours.isOpen) {
      return { isOpen: false, nextOpening: null }
    }
    
    if (todayHours.allDay) {
      return { isOpen: true, nextClosing: null }
    }
    
    const openingTime = parseInt(todayHours.openingTime?.replace(':', '') || '0')
    const closingTime = parseInt(todayHours.closingTime?.replace(':', '') || '2359')
    
    if (currentTime >= openingTime && currentTime <= closingTime) {
      // Encontrar o próximo horário de fechamento
      return { 
        isOpen: true, 
        nextClosing: todayHours.closingTime,
        closingTime: todayHours.closingTime
      }
    } else if (currentTime < openingTime) {
      // Ainda não abriu hoje
      return { 
        isOpen: false, 
        nextOpening: todayHours.openingTime,
        openingTime: todayHours.openingTime
      }
    } else {
      // Já fechou hoje, encontrar o próximo dia de funcionamento
      for (let i = 1; i <= 7; i++) {
        const nextDay = (today + i) % 7
        const nextDayHours = businessHours.find(h => h.dayOfWeek === nextDay && h.isOpen)
        
        if (nextDayHours) {
          return { 
            isOpen: false, 
            nextOpening: {
              day: DAYS[nextDay].name,
              time: nextDayHours.openingTime
            }
          }
        }
      }
      
      return { isOpen: false, nextOpening: null }
    }
  }
  
  const { isOpen, nextOpening, nextClosing, closingTime, openingTime } = getCurrentStatus()

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Horário de Funcionamento</h3>
        <div className={cn(
          'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
          isOpen 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
        )}>
          {isOpen ? (
            <>
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Aberto Agora
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
              Fechado Agora
            </>
          )}
        </div>
      </div>
      
      {isOpen && nextClosing && (
        <p className="text-sm text-foreground/80">
          Fecha às <span className="font-medium">{nextClosing}</span>
        </p>
      )}
      
      {!isOpen && nextOpening && typeof nextOpening === 'object' && (
        <p className="text-sm text-foreground/80">
          Próxima abertura: <span className="font-medium">{nextOpening.day} às {nextOpening.time}</span>
        </p>
      )}
      
      {!isOpen && nextOpening && typeof nextOpening === 'string' && (
        <p className="text-sm text-foreground/80">
          Abre às <span className="font-medium">{nextOpening}</span>
        </p>
      )}
      
      <div className="space-y-2 mt-4">
        {DAYS.map((day) => {
          const dayHours = businessHours.find(h => h.dayOfWeek === day.id)
          const isToday = new Date().getDay() === day.id
          
          return (
            <div 
              key={day.id} 
              className={cn(
                'flex items-center justify-between py-2 px-3 rounded-lg',
                isToday ? 'bg-primary/5' : ''
              )}
            >
              <span className={cn('text-sm', isToday ? 'font-medium' : '')}>
                {day.name}
              </span>
              
              <div className="flex items-center space-x-2">
                {dayHours?.isOpen ? (
                  <>
                    {dayHours.allDay ? (
                      <span className="text-sm text-muted-foreground">24 horas</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {dayHours.openingTime} - {dayHours.closingTime}
                      </span>
                    )}
                    <Check className="h-4 w-4 text-green-500" />
                  </>
                ) : (
                  <>
                    <span className="text-sm text-muted-foreground">Fechado</span>
                    <X className="h-4 w-4 text-muted-foreground/50" />
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="pt-2">
        <p className="text-xs text-muted-foreground text-right">
          Fuso horário: {timezone}
        </p>
      </div>
    </div>
  )
}
