import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import pool from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { getTemplateByType } from '@/lib/templates'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const requestBody = await request.json();
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
      return NextResponse.json(
        { error: 'Nome, slug e WhatsApp são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o slug já existe
    const existingStore = await pool.query(
      'SELECT id FROM stores WHERE slug = $1',
      [slug]
    )

    if (existingStore.rows.length > 0) {
      return NextResponse.json(
        { error: 'Este nome de loja já está em uso' },
        { status: 400 }
      )
    }

    // Obter template
    const template = getTemplateByType(templateType)

    // Criar loja com configurações do template
    const storeResult = await pool.query(
      `INSERT INTO stores (
        name, slug, description, whatsapp, address, 
        primary_color, requires_address, business_type, "userid",
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, 
        $8, $9,
        NOW(), NOW()
      ) RETURNING *`,
      [name, slug, description, whatsapp, address,
        template.storeConfig.primaryColor, template.storeConfig.requiresAddress, 
        template.storeConfig.businessType, session.user.id]
    )
    const store = storeResult.rows[0]

    // Criar categorias e itens do template
    for (const categoryData of template.categories) {
      const categoryResult = await pool.query(
        `INSERT INTO categories (
          name, description, "storeid", "order", created_at, updated_at
        ) VALUES (
          $1, $2, 
          $3, $4,
          NOW(), NOW()
        ) RETURNING *`,
        [categoryData.name, categoryData.description, 
          store.id, template.categories.indexOf(categoryData)]
      )
      const category = categoryResult.rows[0]

      // Criar itens da categoria
      for (const itemData of categoryData.items) {
        await pool.query(
          `INSERT INTO items (
            name, description, price, "categoryId", "order", created_at, updated_at
          ) VALUES (
            $1, $2, $3,
            $4, $5,
            NOW(), NOW()
          )`,
          [itemData.name, itemData.description, itemData.price || 0,
            category.id, categoryData.items.indexOf(itemData)]
        )
      }
    }

    // Buscar loja completa para retornar
    const storeData = await pool.query(
      'SELECT * FROM stores WHERE id = $1',
      [store.id]
    )
    
    const categoriesData = await pool.query(
      'SELECT * FROM categories WHERE "storeid" = $1 ORDER BY "order" ASC',
      [store.id]
    )
    
    const itemsData = await pool.query(
      `SELECT i.* FROM items i
      JOIN categories c ON i."categoryId" = c.id
      WHERE c."storeid" = $1
      ORDER BY c."order" ASC, i."order" ASC`,
      [store.id]
    )
    
    // Montar estrutura completa
    const completeStore = {
      ...storeData.rows[0],
      categories: categoriesData.rows.map(category => ({
        ...category,
        items: itemsData.rows.filter(item => item.categoryId === category.id)
      }))
    }

    return NextResponse.json(completeStore, { status: 201 })
  } catch (error) {
    console.error('Erro detalhado ao criar loja:', {
      error,
      requestBody,
      session: session?.user,
      templateType
    });
    return NextResponse.json({ 
      error: 'INTERNAL_ERROR', 
      detail: (error as Error)?.message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error)?.stack : undefined
    }, { status: 500 });
  }
}

