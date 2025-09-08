import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { buildAuthOptions } from '@/auth'
import { sql } from '@vercel/postgres'
import type { Session } from 'next-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ItemUpdateData {
  name?: string
  description?: string
  price?: number
  image?: string
  isactive?: boolean
  isAvailable?: boolean
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(await buildAuthOptions()) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const { name, description, price, image, isactive, isAvailable } = await request.json()

    // Verificar se o item pertence ao usuário
    const itemResult = await sql`
      SELECT i.id FROM items i
      JOIN categories c ON i."categoryId" = c.id
      JOIN stores s ON c."storeid" = s.id
      WHERE i.id = ${id} AND s."userid" = ${session.user.id}
    `

    if (itemResult.rows.length === 0) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    const updateData: ItemUpdateData = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = price
    if (image !== undefined) updateData.image = image
    if (isactive !== undefined) updateData.isactive = isactive
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable

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
    
    if (updateData.price !== undefined) {
      updateFields.push('price = $' + (updateValues.length + 1))
      updateValues.push(updateData.price)
    }
    
    if (updateData.image !== undefined) {
      updateFields.push('image = $' + (updateValues.length + 1))
      updateValues.push(updateData.image)
    }
    
    if (updateData.isactive !== undefined) {
      updateFields.push('isactive = $' + (updateValues.length + 1))
      updateValues.push(updateData.isactive)
    }
    
    if (updateData.isAvailable !== undefined) {
      updateFields.push('is_available = $' + (updateValues.length + 1))
      updateValues.push(updateData.isAvailable)
    }
    
    updateFields.push('updated_at = NOW()')
    updateValues.push(id)
    
    const updateQuery = `
      UPDATE items SET ${updateFields.join(', ')}
      WHERE id = $${updateValues.length}
      RETURNING *
    `
    
    const updatedItemResult = await sql.query(updateQuery, updateValues)
    const updatedItem = updatedItemResult.rows[0]

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Erro ao atualizar item:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(await buildAuthOptions()) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Verificar se o item pertence ao usuário
    const itemResult = await sql`
      SELECT i.id FROM items i
      JOIN categories c ON i."categoryId" = c.id
      JOIN stores s ON c."storeid" = s.id
      WHERE i.id = ${id} AND s."userid" = ${session.user.id}
    `

    if (itemResult.rows.length === 0) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    // Deletar o item
    await sql`
      DELETE FROM items WHERE id = ${id}
    `

    return NextResponse.json({ message: 'Item excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir item:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}