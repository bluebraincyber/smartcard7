import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@vercel/postgres'

export const runtime = 'nodejs'
import type { Session } from 'next-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth() as Session | null
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params

    // Verificar se a loja pertence ao usuário
    const storeResult = await sql`
      SELECT id FROM stores 
      WHERE id = ${resolvedParams.id} AND "userid" = ${session.user.id}
    `

    if (storeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Buscar categorias com contagem de itens
    const categoriesResult = await sql`
      SELECT 
        c.*,
        COUNT(i.id) as items_count
      FROM categories c
      LEFT JOIN items i ON c.id = i."categoryId"
      WHERE c."storeid" = ${resolvedParams.id}
      GROUP BY c.id
      ORDER BY c."order" ASC
    `
    
    // Formatar resultado para incluir _count
    const categories = categoriesResult.rows.map(category => ({
      ...category,
      _count: {
        items: parseInt(category.items_count) || 0
      }
    }))

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth() as Session | null
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params

    // Verificar se a loja pertence ao usuário
    const storeResult = await sql`
      SELECT id FROM stores 
      WHERE id = ${resolvedParams.id} AND "userid" = ${session.user.id}
    `

    if (storeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Get the next order number
    const lastCategoryResult = await sql`
      SELECT "order" FROM categories 
      WHERE "storeid" = ${resolvedParams.id}
      ORDER BY "order" DESC
      LIMIT 1
    `

    const nextOrder = (lastCategoryResult.rows[0]?.order || 0) + 1

    const categoryResult = await sql`
      INSERT INTO categories (
        name, description, "storeid", "order", isactive, created_at, updated_at
      ) VALUES (
        ${name.trim()}, ${description?.trim() || null}, ${resolvedParams.id}, 
        ${nextOrder}, true, NOW(), NOW()
      ) RETURNING *
    `
    
    const category = {
      ...categoryResult.rows[0],
      _count: {
        items: 0
      }
    }

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}