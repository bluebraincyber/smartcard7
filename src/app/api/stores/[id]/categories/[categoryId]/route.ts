import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import pool from '@/lib/db'
import type { Session } from 'next-auth'


export const runtime = 'nodejs'

interface CategoryUpdateData {
  name?: string
  description?: string
  isactive?: boolean
}

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
      [resolvedParams.id, String(session.user.id)]
    )

    if (storeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Buscar categoria com contagem de itens
    const categoryResult = await pool.query(
      `SELECT 
        c.*,
        COUNT(i.id) as items_count
      FROM categories c
      LEFT JOIN items i ON c.id = i."categoryId"
      WHERE c.id = $1 AND c."storeid" = $2
      GROUP BY c.id`,
      [resolvedParams.categoryId, resolvedParams.id]
    )

    if (categoryResult.rows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    
    const category = {
      ...categoryResult.rows[0],
      _count: {
        items: parseInt(categoryResult.rows[0].items_count) || 0
      }
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function PATCH(
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
    const { name, description, isactive } = body

    const updateData: CategoryUpdateData = {}
    
    if (name !== undefined) {
      if (!name?.trim()) {
        return NextResponse.json(
          { error: 'Category name cannot be empty' },
          { status: 400 }
        )
      }
      updateData.name = name.trim()
    }
    
    if (description !== undefined) {
      updateData.description = description?.trim() || null
    }
    
    if (isactive !== undefined) {
      updateData.isactive = Boolean(isactive)
    }

    // Construir query de update dinamicamente
    const updateFields = []
    const updateValues = []
    
    if (updateData.name !== undefined) {
      updateFields.push('name = $' + (updateValues.length + 1))
      updateValues.push(updateData.name)
    }
    
    if (updateData.description !== undefined) {
      updateFields.push('description = $' + (updateValues.length + 1))
      updateValues.push(updateData.description)
    }
    
    if (updateData.isactive !== undefined) {
      updateFields.push('isactive = $' + (updateValues.length + 1))
      updateValues.push(updateData.isactive)
    }
    
    updateFields.push('updated_at = NOW()')
    updateValues.push(resolvedParams.categoryId)
    
    const updateQuery = `
      UPDATE categories SET ${updateFields.join(', ')}
      WHERE id = $${updateValues.length}
      RETURNING *
    `
    
    const updatedCategoryResult = await pool.query(updateQuery, updateValues)
    
    // Buscar contagem de itens
    const existingItemsCountResult = await pool.query(
      'SELECT COUNT(*) as count FROM items WHERE "categoryId" = $1',
      [resolvedParams.categoryId]
    )
    
    const updatedCategory = {
      ...updatedCategoryResult.rows[0],
      _count: {
        items: parseInt(existingItemsCountResult.rows[0].count) || 0
      }
    }

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(
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

    // Verificar se a categoria existe e contar itens
    const categoryResult = await pool.query(
      `SELECT 
        c.id,
        COUNT(i.id) as items_count
      FROM categories c
      LEFT JOIN items i ON c.id = i."categoryId"
      WHERE c.id = $1 AND c."storeid" = $2
      GROUP BY c.id`,
      [resolvedParams.categoryId, resolvedParams.id]
    )

    if (categoryResult.rows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const itemsCount = parseInt(categoryResult.rows[0].items_count) || 0

    // If there are items, delete them first
    if (itemsCount > 0) {
      await pool.query(
        'DELETE FROM items WHERE "categoryId" = $1',
        [resolvedParams.categoryId]
      )
    }

    // Deletar a categoria
    await pool.query(
      'DELETE FROM categories WHERE id = $1 AND "storeid" = $2',
      [resolvedParams.categoryId, resolvedParams.id]
    )

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}