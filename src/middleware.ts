import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logRequest } from './lib/logger';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  logRequest(request, response);
  return response;
}

export const config = {
  matcher: [
    // Exclui explicitamente as rotas da API do NextAuth.js
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
