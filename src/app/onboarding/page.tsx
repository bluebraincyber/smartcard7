import { redirect } from 'next/navigation'

export default function OnboardingPage() {
  // This will be intercepted by the client-side redirect in the layout
  // This is just a fallback
  redirect('/onboarding/welcome')
}
