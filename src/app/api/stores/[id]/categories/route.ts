import pool from '@/lib/db'
 import type { Session } from 'next-auth'
 import { NextRequest, NextResponse } from 'next/server'
 import { auth } from '@/auth'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth() as Session | null
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = params

    // Verificar se a loja pertence ao usuário
    const storeResult = await pool.query(
      'SELECT id FROM stores WHERE id = $1 AND userid = $2',
      [resolvedParams.id, session.user.id]
    )

    if (storeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Buscar categorias com contagem de itens
    const categoriesResult = await pool.query(
      `SELECT 
        c.*,
        COUNT(i.id) as items_count
      FROM categories c
      LEFT JOIN items i ON c.id = i."categoryId"
      WHERE c.storeid = $1
      GROUP BY c.id
      ORDER BY c."order" ASC`,
      [resolvedParams.id]
    )
    
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
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error?.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth() as Session | null
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = params

    // Verificar se a loja pertence ao usuário
    const storeResult = await pool.query(
      'SELECT id FROM stores WHERE id = $1 AND userid = $2',
      [resolvedParams.id, session.user.id]
    )

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
    const lastCategoryResult = await pool.query(
      'SELECT "order" FROM categories WHERE storeid = $1 ORDER BY "order" DESC LIMIT 1',
      [resolvedParams.id]
    )

    const nextOrder = (lastCategoryResult.rows[0]?.order || 0) + 1

    const categoryResult = await pool.query(
      `INSERT INTO categories (
        name, description, storeid, "order", isactive, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, true, NOW(), NOW()
      ) RETURNING *`,
      [name.trim(), description?.trim() || null, resolvedParams.id, nextOrder]
    )
    
    const category = {
      ...categoryResult.rows[0],
      _count: {
        items: 0
      }
    }

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error?.message }, { status: 500 });
  }
}