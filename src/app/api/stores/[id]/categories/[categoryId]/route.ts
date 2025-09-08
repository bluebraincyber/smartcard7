import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { buildAuthOptions } from '@/lib/auth'
import { sql } from '@vercel/postgres'

export const runtime = 'nodejs'
import type { Session } from 'next-auth'

interface CategoryUpdateData {
  name?: string
  description?: string
  isactive?: boolean
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const session = await getServerSession(await buildAuthOptions()) as Session | null
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

    // Buscar categoria com contagem de itens
    const categoryResult = await sql`
      SELECT 
        c.*,
        COUNT(i.id) as items_count
      FROM categories c
      LEFT JOIN items i ON c.id = i."categoryId"
      WHERE c.id = ${resolvedParams.categoryId} AND c."storeid" = ${resolvedParams.id}
      GROUP BY c.id
    `

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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const session = await getServerSession(await buildAuthOptions()) as Session | null
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
    
    const updatedCategoryResult = await sql.query(updateQuery, updateValues)
    
    // Buscar contagem de itens
    const itemsCountResult = await sql`
      SELECT COUNT(*) as count FROM items WHERE "categoryId" = ${resolvedParams.categoryId}
    `
    
    const updatedCategory = {
      ...updatedCategoryResult.rows[0],
      _count: {
        items: parseInt(itemsCountResult.rows[0].count) || 0
      }
    }

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const session = await getServerSession(await buildAuthOptions()) as Session | null
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

    // Verificar se a categoria existe e contar itens
    const categoryResult = await sql`
      SELECT 
        c.id,
        COUNT(i.id) as items_count
      FROM categories c
      LEFT JOIN items i ON c.id = i."categoryId"
      WHERE c.id = ${resolvedParams.categoryId} AND c."storeid" = ${resolvedParams.id}
      GROUP BY c.id
    `

    if (categoryResult.rows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const itemsCount = parseInt(categoryResult.rows[0].items_count) || 0

    // Check if category has items
    if (itemsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with items. Please delete all items first.' },
        { status: 400 }
      )
    }

    // Deletar a categoria
    await sql`
      DELETE FROM categories WHERE id = ${resolvedParams.categoryId}
    `

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}