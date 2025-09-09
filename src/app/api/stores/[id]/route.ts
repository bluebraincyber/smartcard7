import { auth } from '@/auth'
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
    const session = await auth() as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params

    // Buscar loja
    const storeResult = await pool.query(
      'SELECT * FROM stores WHERE id = $1 AND userid = $2',
      [resolvedParams.id, session.user.id]
    )
    
    if (storeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }
    
    const store = storeResult.rows[0]
    
    // Buscar categorias
    const categoriesResult = await pool.query(
      'SELECT * FROM categories WHERE storeid = $1 ORDER BY "order" ASC',
      [resolvedParams.id]
    )
    
    // Buscar itens
    const itemsResult = await pool.query(
      'SELECT i.* FROM items i JOIN categories c ON i."categoryId" = c.id WHERE c.storeid = $1 ORDER BY c."order" ASC, i."order" ASC',
      [resolvedParams.id]
    )
    
    // Montar estrutura completa
    const storeWithCategories = {
      ...store,
      categories: categoriesResult.rows.map(category => ({
        ...category,
        items: itemsResult.rows.filter(item => item.categoryId === category.id)
      }))
    }

    return NextResponse.json(storeWithCategories)
  } catch (error) {
    console.error('Erro ao buscar loja:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: (error as Error)?.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth() as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    const id = resolvedParams.id
    const body = await request.json()
    const { name, description, whatsapp, address, coverImage, profileImage, primaryColor, isactive } = body

    // Verificar se a loja pertence ao usuário
    const existingStoreResult = await pool.query(
      'SELECT * FROM stores WHERE id = $1 AND userid = $2',
      [resolvedParams.id, session.user.id]
    )

    if (existingStoreResult.rows.length === 0) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }
    
    const existingStore = existingStoreResult.rows[0]

    // decide o slug desejado
    const desired = body.slug ?? body.name ?? existingStore.name ?? ""
    const newSlug = desired ? toSlug(desired) : existingStore.slug

    // só checa unicidade se mudou
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
      `UPDATE stores SET 
        name = $1,
        slug = $2,
        description = $3,
        whatsapp = $4,
        address = $5,
        "primaryColor" = $6,
        isactive = $7,
        "coverImage" = $8,
        "profileImage" = $9,
        updated_at = NOW()
      WHERE id = $10
      RETURNING *`,
      [name, newSlug, description, whatsapp, address, primaryColor, isactive, coverImage, profileImage, id]
    )
    
    const updatedStore = updatedStoreResult.rows[0]

    return NextResponse.json(updatedStore)
  } catch (error) {
    console.error('Erro ao atualizar loja:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: (error as Error)?.message }, { status: 500 });
  }
}

// PATCH method removed - using dedicated /toggle route instead

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth() as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params

    // Verificar se a loja pertence ao usuário
    const existingStoreResult = await pool.query(
      'SELECT id FROM stores WHERE id = $1 AND userid = $2',
      [resolvedParams.id, session.user.id]
    )

    if (existingStoreResult.rows.length === 0) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    // Primeiro, deletar itens das categorias da loja
    await pool.query(
      'DELETE FROM items WHERE "categoryId" IN (SELECT id FROM categories WHERE storeid = $1)',
      [resolvedParams.id]
    )

    // Depois, deletar categorias da loja
    await pool.query(
      'DELETE FROM categories WHERE storeid = $1',
      [resolvedParams.id]
    )

    // Por fim, deletar a loja
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

