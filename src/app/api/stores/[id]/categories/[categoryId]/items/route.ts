import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import pool from '@/lib/db'
import type { Session } from 'next-auth'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    console.log('🚀 GET /api/stores/[id]/categories/[categoryId]/items iniciado')
    
    const session = await getServerSession(authOptions) as Session | null
    if (!session?.user?.email) {
      console.log('❌ Usuário não autenticado')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    console.log('📍 Params resolvidos:', resolvedParams)

    // Verificar se a loja pertence ao usuário
    const storeResult = await pool.query(
      'SELECT id FROM stores WHERE id = $1 AND userid = $2',
      [resolvedParams.id, session.user.id]
    )

    if (storeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Verificar se a categoria existe
    const categoryResult = await pool.query(
      'SELECT id FROM categories WHERE id = $1 AND storeid = $2',
      [resolvedParams.categoryId, resolvedParams.id]
    )

    if (categoryResult.rows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Buscar itens da categoria - usando created_at para ordenação
    const itemsResult = await pool.query(
      'SELECT * FROM items WHERE categoryid = $1 ORDER BY created_at ASC',
      [resolvedParams.categoryId]
    )
    
    const items = itemsResult.rows

    return NextResponse.json(items)
  } catch (error) {
    console.error('💥 Error fetching items:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    console.log('🚀 POST /api/stores/[id]/categories/[categoryId]/items iniciado')
    
    // Teste básico primeiro
    console.log('🔍 Testando conexão básica...')
    
    const resolvedParams = await params
    console.log('📍 Params resolvidos:', resolvedParams)
    
    // Teste de conexão do banco
    const testResult = await pool.query('SELECT NOW() as current_time')
    console.log('✅ Conexão com banco OK:', testResult.rows[0])
    
    const session = await getServerSession(authOptions) as Session | null
    console.log('👤 Sessão encontrada:', !!session)
    console.log('👤 User ID:', session?.user?.id)
    console.log('👤 User Email:', session?.user?.email)
    
    if (!session?.user?.email) {
      console.log('❌ Usuário não autenticado')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Teste simples de query
    console.log('🔍 Testando query de store...')
    const storeResult = await pool.query(
      'SELECT id, name FROM stores WHERE id = $1',
      [resolvedParams.id]
    )
    console.log('🏪 Store encontrada:', storeResult.rows)

    if (storeResult.rows.length === 0) {
      console.log('❌ Loja não encontrada')
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Verificar se a loja pertence ao usuário
    console.log('🔍 Verificando propriedade da loja...')
    const ownershipResult = await pool.query(
      'SELECT id FROM stores WHERE id = $1 AND userid = $2',
      [resolvedParams.id, session.user.id]
    )
    console.log('👤 Ownership result:', ownershipResult.rows)

    if (ownershipResult.rows.length === 0) {
      console.log('❌ Loja não pertence ao usuário')
      return NextResponse.json({ error: 'Store not found or access denied' }, { status: 404 })
    }

    // Verificar se a categoria existe
    console.log('🔍 Verificando categoria...')
    const categoryResult = await pool.query(
      'SELECT id, name FROM categories WHERE id = $1 AND storeid = $2',
      [resolvedParams.categoryId, resolvedParams.id]
    )
    console.log('📁 Category result:', categoryResult.rows)

    if (categoryResult.rows.length === 0) {
      console.log('❌ Categoria não encontrada')
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const body = await request.json()
    console.log('📋 Payload recebido:', body)
    const { name, description, price, image, isactive, isarchived } = body

    if (!name?.trim()) {
      console.log('❌ Nome do item não fornecido')
      return NextResponse.json(
        { error: 'Item name is required' },
        { status: 400 }
      )
    }

    // Primeiro, vamos descobrir a estrutura real da tabela
    console.log('🔍 Verificando estrutura da tabela items...')
    const tableStructure = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns 
       WHERE table_name = 'items' AND table_schema = 'public' 
       ORDER BY ordinal_position`
    )
    console.log('📊 Colunas da tabela items:', tableStructure.rows)

    // Obter o próximo número de posição usando uma coluna que existe
    console.log('🔍 Obtendo próxima posição...')
    
    // Primeiro vamos tentar com id (deve sempre existir)
    const lastItemResult = await pool.query(
      'SELECT id FROM items WHERE categoryid = $1 ORDER BY id DESC LIMIT 1',
      [resolvedParams.categoryId]
    )
    console.log('📊 Last item result:', lastItemResult.rows)

    // Para posição, vamos usar um valor simples baseado no timestamp
    const nextPosition = Date.now() % 1000000 // Número único baseado em timestamp
    console.log('🎯 Next position (timestamp-based):', nextPosition)

    // Preparar dados para inserção
    const insertData = [
      name.trim(),
      description?.trim() || null,
      price ? Math.round(parseFloat(String(price)) * 100) : 0,
      image?.trim() || null,
      parseInt(resolvedParams.categoryId),
      nextPosition,
      true,
      parseInt(resolvedParams.id),
    ]
    console.log('📝 Dados para inserção:', insertData)

    // Criar o item - vamos usar apenas colunas que sabemos que existem
    console.log('💾 Inserindo item no banco...')
    
    // Vamos tentar inserção básica primeiro
    const itemResult = await pool.query(
      `INSERT INTO items (
        name, description, price_cents, image, categoryid, 
        isactive, isarchived, storeid, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
      )
      RETURNING *`,
      [
        name.trim(),
        description?.trim() || null,
        price ? Math.round(parseFloat(String(price)) * 100) : 0,
        image?.trim() || null,
        parseInt(resolvedParams.categoryId),
        isactive !== undefined ? isactive : true, // Usa o valor passado ou padrão true
        isarchived !== undefined ? isarchived : false, // Usa o valor passado ou padrão false
        parseInt(resolvedParams.id),
      ]
    )
    console.log('✅ Item inserido com sucesso:', itemResult.rows[0])
    
    const item = itemResult.rows[0]

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('💥 ERRO COMPLETO:', error)
    console.error('💥 Stack trace:', error instanceof Error ? error.stack : 'No stack')
    console.error('💥 Mensagem:', error instanceof Error ? error.message : 'Unknown error')
    
    return NextResponse.json({ 
      error: 'INTERNAL_ERROR', 
      detail: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined 
    }, { status: 500 });
  }
}
