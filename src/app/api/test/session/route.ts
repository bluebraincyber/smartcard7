import { auth } from '@/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    
    return Response.json({ 
      ok: true,
      hasSession: !!session,
      session: session ? {
        user: session.user,
        expires: session.expires
      } : null,
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