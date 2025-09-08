import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Teste real de conexão com o banco
    const result = await sql`SELECT 1 as test`;
    
    if (result.rows[0]?.test === 1) {
      return NextResponse.json({ 
        ok: true, 
        status: 'Database connection successful',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ 
        ok: false, 
        status: 'Database query failed' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Database health check failed:', error);
    return NextResponse.json({ 
      ok: false, 
      status: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}