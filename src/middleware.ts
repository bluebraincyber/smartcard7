import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Log para debug
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware:', { pathname, hostname })
  }
  
  // Permitir todas as rotas por enquanto (debug)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
