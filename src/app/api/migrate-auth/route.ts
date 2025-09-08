// Migração para adicionar password_hash e corrigir estrutura de auth
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Adicionar coluna password_hash se não existir
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password_hash TEXT,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `;

    // Garantir índice único no email
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users (email)
    `;

    // Verificar se a migração foi bem-sucedida
    const { rows } = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name IN ('password_hash', 'created_at', 'updated_at')
    `;
    
    console.log('Colunas adicionadas:', rows.map(r => r.column_name));

    return Response.json({ 
      success: true, 
      message: 'Migração de autenticação concluída com sucesso' 
    });
  } catch (error) {
    console.error('Migration error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
}