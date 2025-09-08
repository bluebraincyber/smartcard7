import { sql } from "@vercel/postgres";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Hash da senha 'admin123'
    const passwordHash = '$2b$10$9HofpK/k0DZqon62lwMkP.CwtoVeL8EjhiMeqpouQF56ymB4v1Zim';
    
    // Verificar se o usuário já existe
    const { rows: existingUsers } = await sql`
      SELECT id FROM users WHERE email = 'admin@smartcard.local' LIMIT 1
    `;
    
    if (existingUsers.length > 0) {
      return Response.json({ 
        ok: false, 
        message: 'Usuário admin já existe',
        user: { email: 'admin@smartcard.local' }
      });
    }
    
    // Inserir usuário seed
    const { rows } = await sql`
      INSERT INTO users (name, email, password_hash, created_at, updated_at)
      VALUES ('Admin', 'admin@smartcard.local', ${passwordHash}, NOW(), NOW())
      RETURNING id, name, email, created_at
    `;
    
    return Response.json({ 
      ok: true, 
      message: 'Usuário seed criado com sucesso',
      user: rows[0],
      credentials: {
        email: 'admin@smartcard.local',
        password: 'admin123'
      }
    });
  } catch (e: ) {
    return Response.json({ 
      ok: false, 
      error: e.message 
    }, { status: 500 });
  }
}