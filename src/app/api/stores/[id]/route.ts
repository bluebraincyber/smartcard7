import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { buildAuthOptions } from '@/lib/auth'
import { sql } from '@vercel/postgres'
import type { Session } from 'next-auth'

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
    const session = await getServerSession(await buildAuthOptions()) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params

    // Buscar loja
    const storeResult = await sql`
      SELECT * FROM stores 
      WHERE id = ${resolvedParams.id} AND "userid" = ${session.user.id}
    `
    
    if (storeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }
    
    const store = storeResult.rows[0]
    
    // Buscar categorias
    const categoriesResult = await sql`
      SELECT * FROM categories 
      WHERE "storeid" = ${resolvedParams.id} 
      ORDER BY "order" ASC
    `
    
    // Buscar itens
    const itemsResult = await sql`
      SELECT i.* FROM items i
      JOIN categories c ON i."categoryId" = c.id
      WHERE c."storeid" = ${resolvedParams.id}
      ORDER BY c."order" ASC, i."order" ASC
    `
    
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
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(await buildAuthOptions()) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    const id = resolvedParams.id
    const body = await request.json()
    const { name, description, whatsapp, address, coverImage, profileImage, primaryColor, isactive } = body

    // Verificar se a loja pertence ao usuário
    const existingStoreResult = await sql`
      SELECT * FROM stores 
      WHERE id = ${resolvedParams.id} AND "userid" = ${session.user.id}
    `

    if (existingStoreResult.rows.length === 0) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }
    
    const existingStore = existingStoreResult.rows[0]

    // decide o slug desejado
    const desired = body.slug ?? body.name ?? existingStore.name ?? ""
    const newSlug = desired ? toSlug(desired) : existingStore.slug

    // só checa unicidade se mudou
    if (newSlug && newSlug !== existingStore.slug) {
      const slugExistsResult = await sql`
        SELECT id FROM stores WHERE slug = ${newSlug}
      `
      if (slugExistsResult.rows.length > 0 && slugExistsResult.rows[0].id !== id) {
        return NextResponse.json({ error: "Slug já em uso" }, { status: 409 })
      }
    }

    const updatedStoreResult = await sql`
      UPDATE stores SET 
        name = ${name},
        slug = ${newSlug},
        description = ${description},
        whatsapp = ${whatsapp},
        address = ${address},
        "primaryColor" = ${primaryColor},
        isactive = ${isactive},
        "coverImage" = ${coverImage},
        "profileImage" = ${profileImage},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    
    const updatedStore = updatedStoreResult.rows[0]

    return NextResponse.json(updatedStore)
  } catch (error) {
    console.error('Erro ao atualizar loja:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH method removed - using dedicated /toggle route instead

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(await buildAuthOptions()) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params

    // Verificar se a loja pertence ao usuário
    const existingStoreResult = await sql`
      SELECT id FROM stores 
      WHERE id = ${resolvedParams.id} AND "userid" = ${session.user.id}
    `

    if (existingStoreResult.rows.length === 0) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 })
    }

    // Primeiro, deletar itens das categorias da loja
    await sql`
      DELETE FROM items WHERE "categoryId" IN (
        SELECT id FROM categories WHERE "storeid" = ${resolvedParams.id}
      )
    `

    // Depois, deletar categorias da loja
    await sql`
      DELETE FROM categories WHERE "storeid" = ${resolvedParams.id}
    `

    // Por fim, deletar a loja
    await sql`
      DELETE FROM stores WHERE id = ${resolvedParams.id}
    `

    return NextResponse.json({ message: 'Loja excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir loja:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

