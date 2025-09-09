// Setup endpoint para criar tabelas no PostgreSQL
import pool from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Verificar se temos uma URL de conexão válida
    if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
      return Response.json({ 
        error: 'Nenhuma URL de banco de dados configurada' 
      }, { status: 500 });
    }
    
    // Criar tabela users (usar password_hash em vez de password)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        emailverified TIMESTAMP,
        image TEXT,
        password_hash TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Criar tabela stores (alinhada ao restante do código)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        whatsapp TEXT,
        address TEXT,
        primary_color TEXT,
        requires_address BOOLEAN DEFAULT FALSE,
        business_type TEXT,
        userid INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        isactive BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Criar tabela categories
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        storeid INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        "order" INTEGER DEFAULT 0,
        isactive BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Criar tabela items
    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        image TEXT,
        categoryId INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        "order" INTEGER DEFAULT 0,
        isactive BOOLEAN DEFAULT TRUE,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    return Response.json({ 
      success: true, 
      message: 'Tabelas criadas/validadas com sucesso'
    });
  } catch (error: any) {
    console.error('Setup error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
}