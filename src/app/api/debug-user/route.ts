import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    const result = await sql`
      SELECT id, email, name, password_hash, created_at, updated_at
      FROM users 
      WHERE email = ${email.toLowerCase()}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result.rows[0];
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        hasPasswordHash: !!user.password_hash,
        passwordHashLength: user.password_hash?.length || 0,
        created_at: user.created_at,
        updated_at: user.updated_at,
        idType: typeof user.id
      }
    });
  } catch (error) {
    console.error('Debug user error:', error);
    return NextResponse.json({ 
      error: 'Database error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}