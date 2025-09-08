// Setup endpoint para criar tabelas no PostgreSQL
import { sql } from '@vercel/postgres';

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
    await sql`
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
    `;

    // Criar tabela stores (alinhada ao restante do código)
    await sql`
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
        "userid" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        isactive BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Criar tabela categories (usar colunas camelCase entre aspas)
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        "storeid" INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        "order" INTEGER DEFAULT 0,
        isactive BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Criar tabela items (usar colunas camelCase entre aspas)
    await sql`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        image TEXT,
        "categoryId" INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        "order" INTEGER DEFAULT 0,
        isactive BOOLEAN DEFAULT TRUE,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Criar tabela analytics (alinhada com src/lib/analytics.ts)
    await sql`
      CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        "storeid" INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        event TEXT NOT NULL,
        data JSONB,
        "userAgent" TEXT,
        ip TEXT,
        timestamp TIMESTAMP DEFAULT NOW(),
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;

    // Migrações idempotentes para alinhar com o código atual (inclusive bancos já existentes)
    // stores: garantir colunas usadas pelo app
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS whatsapp TEXT;`;
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS address TEXT;`;
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS primary_color TEXT;`;
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS requires_address BOOLEAN DEFAULT FALSE;`;
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS business_type TEXT;`;
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS isactive BOOLEAN DEFAULT TRUE;`;
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS "coverImage" TEXT;`;
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS "profileImage" TEXT;`;
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS "primaryColor" TEXT;`;
    // Coluna legacy usada por algumas rotas de listagem/toggle
    await sql`ALTER TABLE stores ADD COLUMN IF NOT EXISTS active BOOLEAN;`;
    // Sincronizar active a partir de isactive quando applicable
    await sql`UPDATE stores SET active = isactive WHERE active IS NULL;`;

    // categories: garantir colunas
    await sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS isactive BOOLEAN DEFAULT TRUE;`;
    await sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;`;

    // items: garantir colunas e migrar dados quando possível
    await sql`ALTER TABLE items ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);`;
    await sql`ALTER TABLE items ADD COLUMN IF NOT EXISTS "categoryId" INTEGER;`;
    await sql`ALTER TABLE items ADD COLUMN IF NOT EXISTS isactive BOOLEAN DEFAULT TRUE;`;
    await sql`ALTER TABLE items ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE;`;
    // Migrar categoryid -> "categoryId" quando aplicável
    await sql`UPDATE items SET "categoryId" = categoryid WHERE "categoryId" IS NULL AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='items' AND column_name='categoryid');`;
    // Migrar price_cents -> price quando aplicável
    await sql`UPDATE items SET price = (price_cents::decimal / 100.0) WHERE price IS NULL AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='items' AND column_name='price_cents') AND price_cents IS NOT NULL;`;

    return Response.json({ 
      success: true, 
      message: 'Tabelas criadas/validadas com sucesso (mutações idempotentes aplicadas)'
    });
  } catch (error: any) {
    console.error('Setup error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
}