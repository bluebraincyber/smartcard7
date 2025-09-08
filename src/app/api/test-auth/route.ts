import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { comparePassword } from '@/lib/password';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    console.log('Testing auth for:', email);
    
    // Buscar usuário
    const { rows } = await sql`
      SELECT id, email, name, password_hash 
      FROM users 
      WHERE email = ${email.toLowerCase()} 
      LIMIT 1
    `;
    
    const user = rows[0];
    console.log('User found:', !!user);
    console.log('Has password hash:', !!user?.password_hash);
    
    if (!user?.password_hash) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found or no password hash',
        debug: { userExists: !!user, hasHash: !!user?.password_hash }
      });
    }

    // Testar bcrypt
    const isValid = await comparePassword(password, user.password_hash);
    
    console.log('Password valid');
    
    return NextResponse.json({
      success: isValid,
      user: isValid ? {
        id: user.id,
        email: user.email,
        name: user.name,
        idType: typeof user.id
      } : null,
      debug: {
        userFound: true,
        hasPasswordHash: true,
        passwordMatch: isValid
      }
    });
    
  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}