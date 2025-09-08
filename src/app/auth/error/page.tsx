import { Suspense } from 'react'
import { ErrorCard } from './error-card'

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<p>Verificando erro...</p>}>
      <ErrorCard />
    </Suspense>
  )
}
