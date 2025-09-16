import { getServerSession } from 'next-auth/next'
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
      isactive: store.isactive, // Usar isactive do schema 
      coverImage: store.coverimage,
      profileImage: store.logo,
      // Usar valores do banco se existirem, senão valores padrão
      whatsapp: store.whatsapp || '', 
      address: store.address || '',
      businessType: store.business_type || 'general',
      requiresAddress: store.requires_address || false,
      primaryColor: store.primary_color || '#2563eb',
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
    console.log('🔄 API PATCH chamada')
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      console.log('❌ Usuário não autenticado')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    const id = resolvedParams.id
    const body = await request.json()
    console.log('📊 Dados recebidos no PATCH:', JSON.stringify(body, null, 2))

    const existingStoreResult = await pool.query(
      'SELECT * FROM stores WHERE id = $1 AND userid = $2',
      [id, session.user.id]
    )

    if (existingStoreResult.rows.length === 0) {
      console.log('❌ Loja não encontrada para ID:', id, 'Usuário:', session.user.id)
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    console.log('✅ Loja encontrada:', existingStoreResult.rows[0].name)

    const setParts = []
    const values = []
    let paramCount = 0

    // Apenas campos que existem na tabela stores
    if (body.name !== undefined) {
      paramCount++
      setParts.push(`name = $${paramCount}`)
      values.push(body.name)
      console.log(`📝 Atualizando name: ${body.name}`)
    }

    if (body.description !== undefined) {
      paramCount++
      setParts.push(`description = $${paramCount}`)
      values.push(body.description)
      console.log(`📝 Atualizando description: ${body.description}`)
    }

    if (body.slug !== undefined) {
      paramCount++
      setParts.push(`slug = $${paramCount}`)
      values.push(body.slug)
      console.log(`📝 Atualizando slug: ${body.slug}`)
    }

    if (body.coverImage !== undefined) {
      paramCount++
      setParts.push(`coverimage = $${paramCount}`)
      values.push(body.coverImage)
      console.log(`📝 Atualizando coverimage: ${body.coverImage}`)
    }

    if (body.profileImage !== undefined) {
      paramCount++
      setParts.push(`logo = $${paramCount}`)
      values.push(body.profileImage)
      console.log(`📝 Atualizando logo: ${body.profileImage}`)
    }

    if (body.isactive !== undefined) {
      paramCount++
      setParts.push(`isactive = ${paramCount}`)
      values.push(body.isactive)
      console.log(`📝 Atualizando isactive: ${body.isactive}`)
    }

    if (body.whatsapp !== undefined || body.phone !== undefined) {
      paramCount++
      setParts.push(`whatsapp = $${paramCount}`)
      values.push(body.whatsapp || body.phone)
      console.log(`📝 Atualizando whatsapp: ${body.whatsapp || body.phone}`)
    }

    if (body.address !== undefined) {
      paramCount++
      setParts.push(`address = $${paramCount}`)
      values.push(body.address)
      console.log(`📝 Atualizando address: ${body.address}`)
    }

    if (body.businessType !== undefined) {
      paramCount++
      setParts.push(`business_type = $${paramCount}`)
      values.push(body.businessType)
      console.log(`📝 Atualizando business_type: ${body.businessType}`)
    }

    if (body.requiresAddress !== undefined) {
      paramCount++
      setParts.push(`requires_address = $${paramCount}`)
      values.push(body.requiresAddress)
      console.log(`📝 Atualizando requires_address: ${body.requiresAddress}`)
    }

    setParts.push('updated_at = NOW()')

    if (setParts.length === 1) {
      console.log('❌ Nenhum campo para atualizar')
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
    }

    paramCount++
    values.push(id)

    const queryText = `UPDATE stores SET ${setParts.join(', ')} WHERE id = $${paramCount} RETURNING *`
    
    console.log('🔍 Query SQL:', queryText)
    console.log('🔍 Values:', values)
    
    const result = await pool.query(queryText, values)

    if (result.rows.length === 0) {
      console.log('❌ Falha ao atualizar loja - nenhuma linha afetada')
      return NextResponse.json({ error: 'Falha ao atualizar loja' }, { status: 500 })
    }

    const updatedStore = result.rows[0]
    console.log('✅ Loja atualizada com sucesso:', updatedStore.name)
    console.log('📊 Dados atualizados:', JSON.stringify({
      id: updatedStore.id,
      name: updatedStore.name,
      coverimage: updatedStore.coverimage,
      logo: updatedStore.logo
    }, null, 2))
    
    return NextResponse.json({
      ...updatedStore,
      isactive: updatedStore.isactive,
      coverImage: updatedStore.coverimage,
      profileImage: updatedStore.logo,
      whatsapp: updatedStore.whatsapp || '',
      address: updatedStore.address || '',
      businessType: updatedStore.business_type || 'general',
      requiresAddress: updatedStore.requires_address || false,
      primaryColor: updatedStore.primary_color || '#EA1D2C'
    })
  } catch (error) {
    console.error('❌ Erro PATCH completo:', error)
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json({ 
      error: 'INTERNAL_ERROR', 
      detail: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
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
    const { name, description, slug: bodySlug, isactive } = body

    const existingStoreResult = await pool.query(
      'SELECT * FROM stores WHERE id = $1 AND userid = $2',
      [resolvedParams.id, session.user.id]
    )

    if (existingStoreResult.rows.length === 0) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }
    
    const existingStore = existingStoreResult.rows[0]

    const desired = bodySlug ?? name ?? existingStore.name ?? ""
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
      'UPDATE stores SET name = $1, slug = $2, description = $3, isactive = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [name, newSlug, description, isactive, id]
    )
    
    const updatedStore = updatedStoreResult.rows[0]

    return NextResponse.json({
      ...updatedStore,
      isactive: updatedStore.isactive,
      coverImage: updatedStore.coverimage,
      profileImage: updatedStore.logo,
      whatsapp: '', // Valor padrão
      address: ''   // Valor padrão
    })
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
