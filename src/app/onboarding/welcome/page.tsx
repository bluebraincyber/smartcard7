'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer'
import { useOnboarding } from '@/contexts/onboarding-context'

export default function WelcomePage() {
  const router = useRouter()
  const { nextStep } = useOnboarding()

  const handleGetStarted = () => {
    nextStep()
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  return (
    <OnboardingContainer
      title="Bem-vindo ao SmartCard"
      description="Vamos configurar sua conta para começar a usar a plataforma."
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">O que você vai precisar:</h3>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Informações básicas da sua empresa</li>
            <li>Dados de contato</li>
            <li>Endereço completo</li>
            <li>Produtos ou serviços que você oferece</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button onClick={handleGetStarted} className="w-full sm:w-auto">
            Começar Configuração
          </Button>
          <Button 
            onClick={handleSkip} 
            variant="outline" 
            className="w-full sm:w-auto"
          >
            Configurar Depois
          </Button>
        </div>
      </div>
    </OnboardingContainer>
  )
}
