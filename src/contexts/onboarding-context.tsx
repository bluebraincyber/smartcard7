'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { OnboardingData, onboardingSchema } from '@/app/onboarding/types'

interface OnboardingContextType {
  currentStep: number
  totalSteps: number
  goToStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  formMethods: ReturnType<typeof useForm<OnboardingData>>
  onSubmit: SubmitHandler<OnboardingData>
  isSubmitting: boolean
}

const OnboardingContext = React.createContext<OnboardingContextType | undefined>(
  undefined
)

const STEPS = [
  'welcome',
  'business-info',
  'template-selection',
  'products',
  'review',
] as const

export function OnboardingProvider({
  children,
  initialData,
  onSubmit,
}: {
  children: React.ReactNode
  initialData?: Partial<OnboardingData>
  onSubmit: (data: OnboardingData) => Promise<void>
}) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const formMethods = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      businessInfo: {
        businessName: '',
        businessEmail: '',
        phone: '',
        cnpj: '',
        address: {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          zipCode: '',
        },
      },
      template: {
        templateId: '',
        primaryColor: '#3b82f6',
        secondaryColor: '#60a5fa',
      },
      products: {
        products: [],
      },
      ...initialData,
    },
  })

  const totalSteps = STEPS.length

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step)
      window.scrollTo(0, 0)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    } else {
      router.back()
    }
  }

  const handleSubmit: SubmitHandler<OnboardingData> = async (data) => {
    if (currentStep < totalSteps - 1) {
      nextStep()
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit(data)
    } catch (error) {
      console.error('Error submitting onboarding data:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormProvider {...formMethods}>
      <OnboardingContext.Provider
        value={{
          currentStep,
          totalSteps,
          goToStep,
          nextStep,
          prevStep,
          formMethods,
          onSubmit: handleSubmit,
          isSubmitting,
        }}
      >
        {children}
      </OnboardingContext.Provider>
    </FormProvider>
  )
}

export function useOnboarding() {
  const context = React.useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
