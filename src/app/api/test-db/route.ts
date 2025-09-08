// Teste simples de conexão com PostgreSQL
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verificar variáveis de ambiente
    const envVars = {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
      DIRECT_URL: process.env.DIRECT_URL ? 'SET' : 'MISSING',
      POSTGRES_URL: process.env.POSTGRES_URL ? 'SET' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV || 'undefined'
    };
    
    return Response.json({ 
      success: true,
      message: 'Teste de conectividade - sem conexão real',
      environment: envVars,
      note: 'Usando @vercel/postgres para conexão com banco de dados'
    });
  } catch (error) {
    console.error('Test error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
}