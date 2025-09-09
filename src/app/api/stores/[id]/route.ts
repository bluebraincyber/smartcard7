import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import pool from '@/lib/db'
import type { Session } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const toSlug = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params

    const storeResult = await pool.query(
      'SELECT * FROM stores WHERE id = $1 AND userid = $2',
      [resolvedParams.id, session.user.id]
    )
    
    if (storeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }
    
    const store = storeResult.rows[0]
    
    const categoriesResult = await pool.query(
      'SELECT * FROM categories WHERE storeid = $1 ORDER BY id ASC',
      [resolvedParams.id]
    )
    
    const itemsResult = await pool.query(
      'SELECT i.* FROM items i JOIN categories c ON i.categoryid = c.id WHERE c.storeid = $1 ORDER BY c.id ASC',
      [resolvedParams.id]
    )
    
    const storeWithCategories = {
      ...store,
      categories: categoriesResult.rows.map(category => ({
        ...category,
        items: itemsResult.rows
          .filter(item => item.categoryid === category.id)
          .map(item => ({
            ...item,
            price: item.price_cents ? item.price_cents / 100 : 0
          }))
      }))
    }

    return NextResponse.json(storeWithCategories)
  } catch (error) {
    console.error('Erro ao buscar loja:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: (error as Error)?.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('API PATCH chamada')
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    const id = resolvedParams.id
    const body = await request.json()
    console.log('Dados recebidos:', body)

    const existingStoreResult = await pool.query(
      'SELECT * FROM stores WHERE id = $1 AND userid = $2',
      [id, session.user.id]
    )

    if (existingStoreResult.rows.length === 0) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    const setParts = []
    const values = []
    let paramCount = 0

    if (body.name !== undefined) {
      paramCount++
      setParts.push(`name = $${paramCount}`)
      values.push(body.name)
    }

    if (body.description !== undefined) {
      paramCount++
      setParts.push(`description = $${paramCount}`)
      values.push(body.description)
    }

    if (body.whatsapp !== undefined || body.phone !== undefined) {
      paramCount++
      setParts.push(`whatsapp = $${paramCount}`)
      values.push(body.whatsapp || body.phone)
    }

    if (body.address !== undefined) {
      paramCount++
      setParts.push(`address = $${paramCount}`)
      values.push(body.address)
    }

    if (body.isactive !== undefined) {
      paramCount++
      setParts.push(`isactive = $${paramCount}`)
      values.push(body.isactive)
    }

    setParts.push('updated_at = NOW()')

    if (setParts.length === 1) {
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
    }

    paramCount++
    values.push(id)

    const queryText = `UPDATE stores SET ${setParts.join(', ')} WHERE id = $${paramCount} RETURNING *`
    
    console.log('Query:', queryText)
    console.log('Values:', values)
    
    const result = await pool.query(queryText, values)

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Falha ao atualizar loja' }, { status: 500 })
    }

    const updatedStore = result.rows[0]
    console.log('Loja atualizada:', updatedStore)
    return NextResponse.json(updatedStore)
  } catch (error) {
    console.error('Erro PATCH:', error)
    return NextResponse.json({ 
      error: 'INTERNAL_ERROR', 
      detail: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    const id = resolvedParams.id
    const body = await request.json()
    const { name, description, whatsapp, address, isactive } = body

    const existingStoreResult = await pool.query(
      'SELECT * FROM stores WHERE id = $1 AND userid = $2',
      [resolvedParams.id, session.user.id]
    )

    if (existingStoreResult.rows.length === 0) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }
    
    const existingStore = existingStoreResult.rows[0]

    const desired = body.slug ?? body.name ?? existingStore.name ?? ""
    const newSlug = desired ? toSlug(desired) : existingStore.slug

    if (newSlug && newSlug !== existingStore.slug) {
      const slugExistsResult = await pool.query(
        'SELECT id FROM stores WHERE slug = $1',
        [newSlug]
      )
      if (slugExistsResult.rows.length > 0 && slugExistsResult.rows[0].id !== id) {
        return NextResponse.json({ error: "Slug já em uso" }, { status: 409 })
      }
    }

    const updatedStoreResult = await pool.query(
      'UPDATE stores SET name = $1, slug = $2, description = $3, whatsapp = $4, address = $5, isactive = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [name, newSlug, description, whatsapp, address, isactive, id]
    )
    
    const updatedStore = updatedStoreResult.rows[0]

    return NextResponse.json(updatedStore)
  } catch (error) {
    console.error('Erro ao atualizar loja:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: (error as Error)?.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params

    const existingStoreResult = await pool.query(
      'SELECT id FROM stores WHERE id = $1 AND userid = $2',
      [resolvedParams.id, session.user.id]
    )

    if (existingStoreResult.rows.length === 0) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    await pool.query(
      'DELETE FROM items WHERE categoryid IN (SELECT id FROM categories WHERE storeid = $1)',
      [resolvedParams.id]
    )

    await pool.query(
      'DELETE FROM categories WHERE storeid = $1',
      [resolvedParams.id]
    )

    await pool.query(
      'DELETE FROM stores WHERE id = $1',
      [resolvedParams.id]
    )

    return NextResponse.json({ message: 'Loja excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir loja:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: (error as Error)?.message }, { status: 500 });
  }
}