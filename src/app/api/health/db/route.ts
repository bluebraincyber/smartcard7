import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Teste real de conexão com o banco
    const result = await pool.query('SELECT 1 as test');
    
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
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error?.message }, { status: 500 });
  }
}