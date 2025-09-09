import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import pool from '@/lib/db'
import type { Session } from 'next-auth'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string } }
) {
  try {
    const session = await auth() as Session | null
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = params

    // Verificar se a loja pertence ao usuário
    const storeResult = await pool.query(
      'SELECT id FROM stores WHERE id = $1 AND "userid" = $2',
      [resolvedParams.id, session.user.id]
    )

    if (storeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Verificar se a categoria existe
    const categoryResult = await pool.query(
      'SELECT id FROM categories WHERE id = $1 AND "storeid" = $2',
      [resolvedParams.categoryId, resolvedParams.id]
    )

    if (categoryResult.rows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Buscar itens da categoria
    const itemsResult = await pool.query(
      'SELECT * FROM items WHERE "categoryId" = $1 ORDER BY "order" ASC',
      [resolvedParams.categoryId]
    )
    
    const items = itemsResult.rows

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: (error as Error)?.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string } }
) {
  try {
    const session = await auth() as Session | null
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = params

    // Verificar se a loja pertence ao usuário
    const storeResult = await pool.query(
      'SELECT id FROM stores WHERE id = $1 AND "userid" = $2',
      [resolvedParams.id, session.user.id]
    )

    if (storeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Verificar se a categoria existe
    const categoryResult = await pool.query(
      'SELECT id FROM categories WHERE id = $1 AND "storeid" = $2',
      [resolvedParams.categoryId, resolvedParams.id]
    )

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
    const lastItemResult = await pool.query(
      'SELECT "order" FROM items WHERE "categoryId" = $1 ORDER BY "order" DESC LIMIT 1',
      [resolvedParams.categoryId]
    )

    const nextOrder = (lastItemResult.rows[0]?.order || 0) + 1

    // Criar o item
    const itemResult = await pool.query(
      `INSERT INTO items (
        name, description, price, image, "categoryId", "order", 
        isactive, is_available, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
      )
      RETURNING *`,
      [
        name.trim(),
        description?.trim() || null,
        price ? parseFloat(price) : null,
        image?.trim() || null,
        resolvedParams.categoryId,
        nextOrder,
        true,
        true,
      ]
    )
    
    const item = itemResult.rows[0]

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: (error as Error)?.message }, { status: 500 });
  }
}