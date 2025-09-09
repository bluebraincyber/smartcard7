import { getCsrfToken } from 'next-auth/react';


export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Obter token CSRF
    const csrfToken = await getCsrfToken();
    
    return Response.json({ 
      ok: true,
      csrfToken,
      timestamp: new Date().toISOString()
    });
  } catch (e: any) {
    return Response.json({ 
      ok: false, 
      error: e.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}