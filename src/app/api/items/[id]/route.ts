import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { authOptions } from '@/lib/authOptions'
import pool from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ItemUpdateData {
  name?: string
  description?: string
  price?: number
  image?: string
  isactive?: boolean
  isarchived?: boolean
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth() as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const { name, description, price, image, isactive, isarchived } = await request.json()

    console.log('🔄 Atualizando item:', id, 'com dados:', { name, description, price, image, isactive, isarchived })

    // Verificar se o item pertence ao usuário - CORRIGIDO: usar nomes corretos das colunas
    const itemResult = await pool.query(
      `SELECT i.id FROM items i
      JOIN categories c ON i.categoryid = c.id
      JOIN stores s ON c.storeid = s.id
      WHERE i.id = $1 AND s.userid = $2`, // Revertido para categoryid e storeid
      [id, session.user.id]
    )

    if (itemResult.rows.length === 0) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    const updateData: ItemUpdateData = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = price
    if (image !== undefined) updateData.image = image
    if (isactive !== undefined) updateData.isactive = isactive
    if (isarchived !== undefined) updateData.isarchived = isarchived

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
      // Adicionar price_cents também
      updateFields.push('price_cents = $' + (updateValues.length + 1))
      updateValues.push(Math.round(updateData.price * 100))
    }
    
    if (updateData.image !== undefined) {
      updateFields.push('image = $' + (updateValues.length + 1))
      updateValues.push(updateData.image)
    }
    
    if (updateData.isactive !== undefined) {
      updateFields.push('isactive = $' + (updateValues.length + 1))
      updateValues.push(updateData.isactive)
    }
    
    if (updateData.isarchived !== undefined) {
      updateFields.push('isarchived = $' + (updateValues.length + 1))
      updateValues.push(updateData.isarchived)
    }
    
    updateFields.push('updated_at = NOW()')
    
    const updateQuery = `
      UPDATE items SET ${updateFields.join(', ')}
      WHERE id = $${updateValues.length + 1}
      RETURNING *
    `
    updateValues.push(id)
    
    console.log('📝 Query SQL:', updateQuery)
    console.log('📊 Valores:', updateValues)
    
    const updatedItemResult = await pool.query(updateQuery, updateValues)
    const updatedItem = updatedItemResult.rows[0]

    console.log('✅ Item atualizado:', updatedItem)

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('❌ Erro ao atualizar item:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error instanceof Error ? error.message : 'Erro desconhecido' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth() as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Verificar se o item pertence ao usuário - CORRIGIDO: usar nomes corretos das colunas
    const itemResult = await pool.query(
      `SELECT i.id FROM items i
      JOIN categories c ON i.categoryid = c.id
      JOIN stores s ON c.storeid = s.id
      WHERE i.id = $1 AND s.userid = $2`, // Revertido para categoryid e storeid
      [id, session.user.id]
    )

    if (itemResult.rows.length === 0) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    // Deletar o item
    await pool.query(
      `DELETE FROM items WHERE id = $1`,
      [id]
    )

    return NextResponse.json({ message: 'Item excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir item:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error instanceof Error ? error.message : 'Erro desconhecido' }, { status: 500 });
  }
}
