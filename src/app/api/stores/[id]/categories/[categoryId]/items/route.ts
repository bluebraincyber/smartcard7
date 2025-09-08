import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@vercel/postgres'

export const runtime = 'nodejs'
import type { Session } from 'next-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
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

    // Verificar se a categoria existe
    const categoryResult = await sql`
      SELECT id FROM categories 
      WHERE id = ${resolvedParams.categoryId} AND "storeid" = ${resolvedParams.id}
    `

    if (categoryResult.rows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Buscar itens da categoria
    const itemsResult = await sql`
      SELECT * FROM items 
      WHERE "categoryId" = ${resolvedParams.categoryId}
      ORDER BY "order" ASC
    `
    
    const items = itemsResult.rows

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
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

    // Verificar se a categoria existe
    const categoryResult = await sql`
      SELECT id FROM categories 
      WHERE id = ${resolvedParams.categoryId} AND "storeid" = ${resolvedParams.id}
    `

    if (categoryResult.rows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, price, image } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Item name is required' },
        { status: 400 }
      )
    }

    // Obter o próximo número de ordem
    const lastItemResult = await sql`
      SELECT "order" FROM items 
      WHERE "categoryId" = ${resolvedParams.categoryId}
      ORDER BY "order" DESC
      LIMIT 1
    `

    const nextOrder = (lastItemResult.rows[0]?.order || 0) + 1

    // Criar o item
    const itemResult = await sql`
      INSERT INTO items (
        name, description, price, image, "categoryId", "order", 
        isactive, is_available, created_at, updated_at
      ) VALUES (
        ${name.trim()}, 
        ${description?.trim() || null}, 
        ${price ? parseFloat(price) : null}, 
        ${image?.trim() || null}, 
        ${resolvedParams.categoryId}, 
        ${nextOrder}, 
        ${true}, 
        ${true}, 
        NOW(), 
        NOW()
      )
      RETURNING *
    `
    
    const item = itemResult.rows[0]

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}