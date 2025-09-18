'use client'

import { ReactNode, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WizardStep {
  id: string
  title: string
  description?: string
  component: ReactNode
  validate?: () => boolean
}

interface OnboardingWizardProps {
  steps: WizardStep[]
  onComplete: () => void
  onCancel: () => void
  storageKey?: string
  className?: string
}

export function OnboardingWizard({
  steps,
  onComplete,
  onCancel,
  storageKey = 'onboarding_progress',
  className
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Carregar progresso salvo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProgress = localStorage.getItem(storageKey)
      if (savedProgress) {
        try {
          const { step, completed } = JSON.parse(savedProgress)
          setCurrentStep(step)
          setCompletedSteps(completed || [])
        } catch (e) {
          console.error('Erro ao carregar progresso:', e)
        }
      }
      setIsLoading(false)
    }
  }, [storageKey])

  // Salvar progresso
  const saveProgress = (step: number, completed: number[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ step, completed })
      )
    }
  }

  const goToStep = (step: number) => {
    // Validação do passo atual antes de sair
    const currentStepData = steps[currentStep]
    if (currentStepData.validate && !currentStepData.validate()) {
      return
    }

    // Marcar como concluído se for um novo passo
    if (!completedSteps.includes(currentStep) && step > currentStep) {
      const newCompletedSteps = [...new Set([...completedSteps, currentStep])]
      setCompletedSteps(newCompletedSteps)
      saveProgress(step, newCompletedSteps)
    } else {
      saveProgress(step, completedSteps)
    }

    setCurrentStep(step)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1)
    }
  }

  const completeOnboarding = () => {
    // Marcar todos os passos como concluídos
    const allSteps = Array.from({ length: steps.length }, (_, i) => i)
    setCompletedSteps(allSteps)
    saveProgress(steps.length - 1, allSteps)
    
    // Limpar o progresso salvo
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey)
    }
    
    onComplete()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className={cn("w-full max-w-4xl mx-auto bg-card rounded-xl shadow-lg overflow-hidden border border-border", className)}>
      {/* Cabeçalho com progresso */}
      <div className="px-6 pt-6">
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <p className="mt-2 text-sm text-muted-foreground text-right">
            Etapa {currentStep + 1} de {steps.length}
          </p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {currentStepData.title}
          </h2>
          {currentStepData.description && (
            <p className="text-muted-foreground mt-1">
              {currentStepData.description}
            </p>
          )}
        </div>
      </div>

      {/* Conteúdo do passo atual */}
      <div className="px-6 py-4">
        {currentStepData.component}
      </div>

      {/* Navegação */}
      <div className="border-t border-border bg-muted/30 px-6 py-4 flex justify-between items-center">
        <div>
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isLoading}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          
          {!isLastStep ? (
            <Button
              onClick={nextStep}
              disabled={isLoading}
            >
              Próximo
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={completeOnboarding}
              disabled={isLoading}
            >
              <Check className="mr-2 h-4 w-4" />
              Concluir Configuração
            </Button>
          )}
        </div>
      </div>
      
      {/* Navegação por etapas (opcional) */}
      <div className="border-t border-border bg-muted/10 p-4">
        <div className="flex justify-center space-x-4">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                currentStep === index 
                  ? "bg-primary text-primary-foreground"
                  : completedSteps.includes(index)
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              disabled={isLoading}
            >
              {completedSteps.includes(index) && currentStep !== index ? (
                <Check className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
