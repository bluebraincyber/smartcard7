'use client'

import { useRouter } from 'next/navigation'
import { OnboardingProvider } from '@/contexts/onboarding-context'
import { useEffect } from 'react'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  // This is a mock function that would be replaced with your actual API call
  const submitOnboarding = async (data: any) => {
    console.log('Submitting onboarding data:', data)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    // In a real app, you would call your API here
    // await api.submitOnboarding(data)
  }

  // Redirect to welcome page if accessed directly
  useEffect(() => {
    const path = window.location.pathname
    if (path === '/onboarding') {
      router.push('/onboarding/welcome')
    }
  }, [router])

  return (
    <OnboardingProvider onSubmit={submitOnboarding}>
      <div className="min-h-screen bg-background">
        <main className="container py-8">
          {children}
        </main>
      </div>
    </OnboardingProvider>
  )
}
