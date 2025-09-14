'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Iniciando login...')
      
      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      })

      console.log('Resultado do signIn:', result)

      if (result?.error) {
        console.log('Erro no login:', result.error)
        setError('Email ou senha incorretos')
        setIsLoading(false)
        return
      }

      if (result?.ok) {
        console.log('Login bem-sucedido, verificando sessão...')
        
        // Aguardar um pouco para a sessão ser atualizada
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Verificar se a sessão foi criada
        const session = await getSession()
        console.log('Sessão após login:', session)
        
        if (session) {
          console.log('Redirecionando para dashboard...')
          // Forçar redirecionamento
          window.location.href = '/dashboard'
        } else {
          console.log('Sessão não encontrada, tentando novamente...')
          // Tentar novamente após mais tempo
          setTimeout(async () => {
            const retrySession = await getSession()
            if (retrySession) {
              window.location.href = '/dashboard'
            } else {
              setError('Erro ao criar sessão. Tente novamente.')
              setIsLoading(false)
            }
          }, 1000)
        }
      } else {
        console.log('Resultado inesperado:', result)
        setError('Erro inesperado. Tente novamente.')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Erro durante login:', error)
      setError('Erro ao fazer login. Tente novamente.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            SmartCard Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Faça login para acessar o dashboard
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
                placeholder="Digite seu email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
                placeholder="Digite sua senha"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/register"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Não tem conta? Cadastre-se aqui
            </Link>
          </div>
        </form>

        {/* Debug em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-400 text-center mt-4">
            Loading: {isLoading ? 'Yes' : 'No'} | Error: {error || 'None'}
          </div>
        )}
      </div>
    </div>
  )
}
