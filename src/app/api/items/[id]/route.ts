import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import pool from '@/lib/db'
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
  isarchived?: boolean
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔄 Iniciando atualização de item...')
    
    const session = await getServerSession(authOptions) as Session | null
    console.log('👤 Sessão:', session?.user?.id ? 'Autenticado' : 'Não autenticado')
    
    if (!session?.user?.id) {
      console.log('❌ Usuário não autenticado')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    const { id } = resolvedParams
    const body = await request.json()
    const { name, description, price, image, isactive, isarchived } = body

    console.log('📊 Dados recebidos:', { id, name, description, price, image, isactive, isarchived })

    // Verificar se o item pertence ao usuário
    console.log('🔍 Verificando permissão do item...')
    const itemResult = await pool.query(
      `SELECT i.id FROM items i
      JOIN categories c ON i.categoryid = c.id
      JOIN stores s ON c.storeid = s.id
      WHERE i.id = $1 AND s.userid = $2`,
      [id, session.user.id]
    )

    console.log('📋 Resultado da verificação:', itemResult.rows.length, 'registros')

    if (itemResult.rows.length === 0) {
      console.log('❌ Item não encontrado ou sem permissão')
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    // Construir update dinamicamente apenas com campos fornecidos
    const updateFields = []
    const updateValues = []
    
    if (name !== undefined) {
      updateFields.push('name = $' + (updateValues.length + 1))
      updateValues.push(name)
    }
    
    if (description !== undefined) {
      updateFields.push('description = $' + (updateValues.length + 1))
      updateValues.push(description)
    }
    
    if (price !== undefined) {
      updateFields.push('price_cents = $' + (updateValues.length + 1))
      updateValues.push(Math.round(parseFloat(price) * 100))
    }
    
    if (image !== undefined) {
      updateFields.push('image = $' + (updateValues.length + 1))
      updateValues.push(image)
    }
    
    if (isactive !== undefined) {
      updateFields.push('isactive = $' + (updateValues.length + 1))
      updateValues.push(isactive)
    }
    
    if (isarchived !== undefined) {
      updateFields.push('isarchived = $' + (updateValues.length + 1))
      updateValues.push(isarchived)
    }
    
    // Sempre atualizar updated_at
    updateFields.push('updated_at = NOW()')
    
    if (updateFields.length === 1) { // Apenas updated_at
      console.log('⚠️ Nenhum campo para atualizar')
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
    }
    
    const updateQuery = `
      UPDATE items SET ${updateFields.join(', ')}
      WHERE id = $${updateValues.length + 1}
      RETURNING id, name, description, price_cents, image, isactive, isarchived, updated_at
    `
    updateValues.push(id)
    
    console.log('📝 Query SQL:', updateQuery)
    console.log('📊 Valores:', updateValues)
    
    const updatedItemResult = await pool.query(updateQuery, updateValues)
    
    if (updatedItemResult.rows.length === 0) {
      console.log('❌ Nenhum item foi atualizado')
      return NextResponse.json({ error: 'Falha ao atualizar item' }, { status: 500 })
    }
    
    const updatedItem = {
      ...updatedItemResult.rows[0],
      price: updatedItemResult.rows[0].price_cents ? updatedItemResult.rows[0].price_cents / 100 : 0
    }

    console.log('✅ Item atualizado com sucesso:', updatedItem)

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('❌ Erro ao atualizar item:', error)
    return NextResponse.json({ 
      error: 'INTERNAL_ERROR', 
      detail: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🗑️ Iniciando exclusão de item...')
    
    const session = await getServerSession(authOptions) as Session | null
    console.log('👤 Sessão:', session?.user?.id ? 'Autenticado' : 'Não autenticado')
    
    if (!session?.user?.id) {
      console.log('❌ Usuário não autenticado')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    const { id } = resolvedParams

    console.log('📊 ID do item para exclusão:', id)

    // Verificar se o item pertence ao usuário
    console.log('🔍 Verificando permissão do item...')
    const itemResult = await pool.query(
      `SELECT i.id FROM items i
      JOIN categories c ON i.categoryid = c.id
      JOIN stores s ON c.storeid = s.id
      WHERE i.id = $1 AND s.userid = $2`,
      [id, session.user.id]
    )

    console.log('📋 Resultado da verificação:', itemResult.rows.length, 'registros')

    if (itemResult.rows.length === 0) {
      console.log('❌ Item não encontrado ou sem permissão')
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
    }

    // Deletar o item
    console.log('🗑️ Executando exclusão...')
    const deleteResult = await pool.query(
      `DELETE FROM items WHERE id = $1`,
      [id]
    )

    console.log('📊 Linhas afetadas pela exclusão:', deleteResult.rowCount)

    if (deleteResult.rowCount === 0) {
      console.log('❌ Nenhum item foi excluído')
      return NextResponse.json({ error: 'Falha ao excluir item' }, { status: 500 })
    }

    console.log('✅ Item excluído com sucesso')
    return NextResponse.json({ message: 'Item excluído com sucesso' })
  } catch (error) {
    console.error('❌ Erro ao excluir item:', error)
    return NextResponse.json({ 
      error: 'INTERNAL_ERROR', 
      detail: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 });
  }
}