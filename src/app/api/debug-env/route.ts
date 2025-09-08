// Endpoint temporário para debug das environment variables
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    DATABASE_URL: process.env.DATABASE_URL ? 'EXISTE' : 'MISSING',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'MISSING',
    AUTH_SECRET: process.env.AUTH_SECRET ? 'EXISTE' : 'MISSING',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'EXISTE' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV || 'MISSING',
    timestamp: new Date().toISOString()
  });
}