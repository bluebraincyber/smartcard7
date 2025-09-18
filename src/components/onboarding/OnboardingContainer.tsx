'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { OnboardingWizard, type WizardStep } from './OnboardingWizard'

interface OnboardingContainerProps {
  steps: WizardStep[]
  onComplete: () => Promise<void> | void
  onCancel?: () => void
  storageKey?: string
  className?: string
  title?: string
  description?: string
}

type OnboardingState = 'idle' | 'loading' | 'error' | 'success' | 'empty'

export function OnboardingContainer({
  steps,
  onComplete,
  onCancel,
  storageKey = 'onboarding_progress',
  className,
  title = 'Configuração Inicial',
  description = 'Vamos configurar sua conta para começar a usar a plataforma.',
}: OnboardingContainerProps) {
  const router = useRouter()
  const [state, setState] = React.useState<OnboardingState>('loading')
  const [error, setError] = React.useState<string | null>(null)

  // Handle onboarding completion
  const handleComplete = async () => {
    try {
      setState('loading')
      await onComplete()
      setState('success')
      
      toast({
        title: 'Configuração concluída!',
        description: 'Sua conta está pronta para uso.',
        variant: 'success',
      })
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err) {
      console.error('Error completing onboarding:', err)
      setState('error')
      setError(
        err instanceof Error ? err.message : 'Ocorreu um erro ao salvar as configurações.'
      )
      
      toast({
        title: 'Erro',
        description: 'Não foi possível concluir a configuração. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  // Handle cancellation
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  // Check if we have any steps
  React.useEffect(() => {
    if (steps.length === 0) {
      setState('empty')
    } else {
      setState('idle')
    }
  }, [steps])

  // Render loading state
  if (state === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando configurações...</p>
      </div>
    )
  }

  // Render error state
  if (state === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-6 text-center">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold">Ocorreu um erro</h2>
        <p className="text-muted-foreground max-w-md">
          {error || 'Não foi possível carregar a configuração. Por favor, tente novamente.'}
        </p>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={handleCancel}>
            Voltar
          </Button>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </div>
    )
  }

  // Render empty state
  if (state === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-6 text-center">
        <div className="rounded-full bg-muted p-3">
          <Info className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Nada para configurar</h2>
        <p className="text-muted-foreground max-w-md">
          Todas as configurações já foram concluídas. Você pode começar a usar a plataforma.
        </p>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">
          Ir para o painel
        </Button>
      </div>
    )
  }

  // Render success state (after completion)
  if (state === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-6 text-center">
        <div className="rounded-full bg-success/10 p-3">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>
        <h2 className="text-2xl font-bold">Configuração concluída!</h2>
        <p className="text-muted-foreground max-w-md">
          Sua conta está pronta para uso. Redirecionando...
        </p>
      </div>
    )
  }

  // Render the onboarding wizard
  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>
      
      <OnboardingWizard
        steps={steps}
        onComplete={handleComplete}
        onCancel={handleCancel}
        storageKey={storageKey}
      />
    </div>
  )
}
