import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { buildAuthOptions } from '@/auth'
import { sql } from '@vercel/postgres'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { getTemplateByType } from '@/lib/templates'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(await buildAuthOptions())
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { 
      name, 
      slug, 
      description, 
      whatsapp, 
      address, 
      templateType = 'geral' 
    } = await request.json()

    // Validações básicas
    if (!name || !slug || !whatsapp) {
      return NextResponse.json(
        { error: 'Nome, slug e WhatsApp são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o slug já existe
    const existingStore = await sql`
      SELECT id FROM stores WHERE slug = ${slug}
    `

    if (existingStore.rows.length > 0) {
      return NextResponse.json(
        { error: 'Este nome de loja já está em uso' },
        { status: 400 }
      )
    }

    // Obter template
    const template = getTemplateByType(templateType)

    // Criar loja com configurações do template
    const storeResult = await sql`
      INSERT INTO stores (
        name, slug, description, whatsapp, address, 
        primary_color, requires_address, business_type, "userid",
        created_at, updated_at
      ) VALUES (
        ${name}, ${slug}, ${description}, ${whatsapp}, ${address},
        ${template.storeConfig.primaryColor}, ${template.storeConfig.requiresAddress}, 
        ${template.storeConfig.businessType}, ${session.user.id},
        NOW(), NOW()
      ) RETURNING *
    `
    const store = storeResult.rows[0]

    // Criar categorias e itens do template
    for (const categoryData of template.categories) {
      const categoryResult = await sql`
        INSERT INTO categories (
          name, description, "storeid", "order", created_at, updated_at
        ) VALUES (
          ${categoryData.name}, ${categoryData.description}, 
          ${store.id}, ${template.categories.indexOf(categoryData)},
          NOW(), NOW()
        ) RETURNING *
      `
      const category = categoryResult.rows[0]

      // Criar itens da categoria
      for (const itemData of categoryData.items) {
        await sql`
          INSERT INTO items (
            name, description, price, "categoryId", "order", created_at, updated_at
          ) VALUES (
            ${itemData.name}, ${itemData.description}, ${itemData.price || 0},
            ${category.id}, ${categoryData.items.indexOf(itemData)},
            NOW(), NOW()
          )
        `
      }
    }

    // Buscar loja completa para retornar
    const storeData = await sql`
      SELECT * FROM stores WHERE id = ${store.id}
    `
    
    const categoriesData = await sql`
      SELECT * FROM categories WHERE "storeid" = ${store.id} ORDER BY "order" ASC
    `
    
    const itemsData = await sql`
      SELECT i.* FROM items i
      JOIN categories c ON i."categoryId" = c.id
      WHERE c."storeid" = ${store.id}
      ORDER BY c."order" ASC, i."order" ASC
    `
    
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
    console.error('Erro ao criar loja:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

