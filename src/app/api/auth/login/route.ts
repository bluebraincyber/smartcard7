// Login endpoint usando @vercel/postgres
import { sql } from '@vercel/postgres';
import { comparePassword } from '@/lib/password';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return Response.json({ 
        error: 'Email e senha são obrigatórios' 
      }, { status: 400 });
    }
    
    // Buscar usuário por email usando password_hash
    const { rows } = await sql`
      SELECT id, name, email, password_hash 
      FROM users 
      WHERE email = ${email.toLowerCase().trim()}
    `;
    
    if (rows.length === 0) {
      return Response.json({ 
        error: 'Usuário não encontrado' 
      }, { status: 401 });
    }
    
    const user = rows[0];
    
    // Verificar senha (se existir)
    if (user.password_hash) {
      const isValidPassword = await comparePassword(password, user.password_hash)
      if (!isValidPassword) {
        return Response.json({ 
          error: 'Senha incorreta' 
        }, { status: 401 });
      }
    }
    
    // Retornar dados do usuário (sem senha)
    const { password_hash: __, ...userData } = user;
    return Response.json({ 
      success: true, 
      user: userData 
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}