import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import pool from '@/lib/db'
import type { Session } from 'next-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Template básico para loja
const getBasicTemplate = () => ({
  storeConfig: {
    primaryColor: '#EA1D2C',
    businessType: 'geral'
  },
  categories: [
    {
      name: 'Produtos',
      description: 'Produtos principais',
      items: [
        {
          name: 'Produto Exemplo',
          description: 'Descrição do produto exemplo',
          price: 10.00
        }
      ]
    }
  ]
})

export async function POST(request: NextRequest) {
  try {
    console.log('🏪 Iniciando criação de loja com template...')
    
    const session = await getServerSession(authOptions) as Session | null
    console.log('👤 Sessão:', session?.user?.id ? 'Autenticado' : 'Não autenticado')
    
    if (!session?.user?.id) {
      console.log('❌ Usuário não autenticado')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const requestBody = await request.json();
    console.log('📊 Dados recebidos:', requestBody)
    
    const { 
      name, 
      slug, 
      description, 
      whatsapp, 
      address, 
      templateType = 'geral' 
    } = requestBody;

    // Validações básicas
    if (!name || !slug || !whatsapp) {
      console.log('❌ Dados obrigatórios ausentes')
      return NextResponse.json(
        { error: 'Nome, slug e WhatsApp são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o slug já existe
    console.log('🔍 Verificando se slug já existe...')
    const existingStore = await pool.query(
      'SELECT id FROM stores WHERE slug = $1',
      [slug]
    )

    if (existingStore.rows.length > 0) {
      console.log('❌ Slug já existe:', slug)
      return NextResponse.json(
        { error: 'Este nome de loja já está em uso' },
        { status: 400 }
      )
    }

    // Obter template básico
    const template = getBasicTemplate()
    console.log('📋 Template carregado:', template.categories.length, 'categorias')

    // Criar loja - CORRIGIDO: usar colunas corretas do schema
    console.log('💾 Criando loja no banco...')
    const storeResult = await pool.query(
      `INSERT INTO stores (
        name, slug, description, whatsapp, address, 
        userid, isactive, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, true, NOW(), NOW()
      ) RETURNING *`,
      [name, slug, description || '', whatsapp, address || '', session.user.id]
    )
    const store = storeResult.rows[0]
    console.log('✅ Loja criada:', store.id)

    // Criar categorias e itens do template
    console.log('📂 Criando categorias...')
    for (const [index, categoryData] of template.categories.entries()) {
      const categoryResult = await pool.query(
        `INSERT INTO categories (
          name, storeid, created_at, updated_at
        ) VALUES (
          $1, $2, NOW(), NOW()
        ) RETURNING *`,
        [categoryData.name, store.id]
      )
      const category = categoryResult.rows[0]
      console.log('✅ Categoria criada:', category.name)

      // Criar itens da categoria - CORRIGIDO: usar nomes corretos das colunas
      console.log('📦 Criando itens para categoria:', category.name)
      for (const itemData of categoryData.items) {
        const priceInCents = Math.round((itemData.price || 0) * 100)
        
        await pool.query(
          `INSERT INTO items (
            name, description, price_cents, categoryid, storeid,
            isactive, isarchived, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, true, false, NOW(), NOW()
          )`,
          [
            itemData.name, 
            itemData.description || '', 
            priceInCents,
            category.id, 
            store.id
          ]
        )
      }
      console.log('✅ Itens criados para categoria:', category.name)
    }

    // Buscar loja completa para retornar - CORRIGIDO: usar estrutura correta
    console.log('📊 Buscando loja completa...')
    const storeData = await pool.query(
      'SELECT * FROM stores WHERE id = $1',
      [store.id]
    )
    
    const categoriesData = await pool.query(
      'SELECT * FROM categories WHERE storeid = $1 ORDER BY id ASC',
      [store.id]
    )
    
    const itemsData = await pool.query(
      `SELECT i.* FROM items i
      JOIN categories c ON i.categoryid = c.id
      WHERE c.storeid = $1
      ORDER BY c.id ASC, i.id ASC`,
      [store.id]
    )
    
    // Montar estrutura completa
    const completeStore = {
      ...storeData.rows[0],
      categories: categoriesData.rows.map(category => ({
        ...category,
        items: itemsData.rows
          .filter(item => item.categoryid === category.id)
          .map(item => ({
            ...item,
            price: item.price_cents ? item.price_cents / 100 : 0
          }))
      }))
    }

    console.log('🎉 Loja criada com sucesso:', completeStore.name)
    return NextResponse.json(completeStore, { status: 201 })
  } catch (error) {
    console.error('❌ Erro detalhado ao criar loja:', error)
    return NextResponse.json({ 
      error: 'INTERNAL_ERROR', 
      detail: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}