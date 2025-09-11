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
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
