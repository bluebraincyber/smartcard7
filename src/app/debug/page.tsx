import pool from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function TestPage() {
  try {
    // Testar conexão
    const testConnection = await pool.query('SELECT NOW() as current_time');
    
    // Buscar todas as lojas
    const allStores = await pool.query(
      'SELECT id, name, slug, isactive, created_at FROM stores ORDER BY created_at DESC'
    );

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug do Banco de Dados</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Conexão com Banco:</h2>
          <p className="text-green-600">✅ OK - {testConnection.rows[0].current_time}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Lojas Cadastradas ({allStores.rows.length}):</h2>
          {allStores.rows.length === 0 ? (
            <p className="text-red-600">❌ Nenhuma loja encontrada</p>
          ) : (
            <div className="space-y-2">
              {allStores.rows.map((store, index) => (
                <div key={store.id} className="p-3 border rounded">
                  <div className="font-medium">{store.name}</div>
                  <div className="text-sm text-gray-600">
                    Slug: <code className="bg-gray-100 px-1 rounded">{store.slug}</code>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Ativa: {store.isactive ? '✅ Sim' : '❌ Não'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    URL: <a href={`/${store.slug}`} className="text-primary hover:underline">
                      /{store.slug}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <h1 className="text-2xl font-bold mb-4 text-destructive">Erro de Conexão</h1>
        <pre className="bg-destructive/10 border border-destructive/20 p-4 rounded text-sm text-foreground">
          {error.message}
        </pre>
      </div>
    );
  }
}
