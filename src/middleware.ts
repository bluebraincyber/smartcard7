import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Log para debug
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware:', { pathname, hostname })
  }
  
  // Permitir que rotas de API e arquivos estáticos passem sem processamento
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }
  
  // Permitir rotas de autenticação sem verificação
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next()
  }
  
  // Verificar se é um subdomínio do SmartCard
  const isSubdomain = hostname.includes('.smartcard.app') && !hostname.startsWith('dashboard.')
  
  // Se for um subdomínio, extrair o slug
  if (isSubdomain) {
    const slug = hostname.split('.')[0]
    
    // Reescrever para a página do store
    if (pathname === '/') {
      return NextResponse.rewrite(new URL(`/${slug}`, request.url))
    }
    
    // Para outras rotas no subdomínio, manter como está
    return NextResponse.next()
  }
  
  // Proteção de rotas do dashboard
  if (pathname.startsWith('/dashboard')) {
    try {
      const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET 
      })
      
      if (!token) {
        // Criar URL de redirecionamento com callback
        const url = new URL('/auth/login', request.url)
        url.searchParams.set('callbackUrl', request.url)
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error('Middleware auth error:', error)
      // Em caso de erro, redirecionar para login
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }
  
  // Redirecionar dashboard.smartcard.app para /dashboard
  if (hostname.startsWith('dashboard.')) {
    return NextResponse.rewrite(new URL(`/dashboard${pathname}`, request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
