import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import pool from '@/lib/db'
import { getTemplateByType } from '@/lib/templates'
import type { Session } from 'next-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth() as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const storeId = resolvedParams?.id
    if (!storeId) {
      return NextResponse.json(
        { error: 'ID da loja é obrigatório' },
        { status: 400 }
      )
    }
    const { templateId } = await request.json()

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se a loja existe e pertence ao usuário
    const { rows: stores } = await pool.query(
      'SELECT id, name, slug FROM stores WHERE id = $1 AND userid = $2',
      [storeId, session.user.id]
    )

    if (stores.length === 0) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      )
    }

    // Buscar o template
    const template = getTemplateByType(templateId)
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se a loja já tem categorias/itens
    const { rows: existingCategoriesResult } = await pool.query(
      'SELECT COUNT(*) as count FROM categories WHERE storeid = $1',
      [storeId]
    )
    const existingCategories = parseInt(existingCategoriesResult[0].count)

    const { rows: existingItemsResult } = await pool.query(
      'SELECT COUNT(*) as count FROM items i JOIN categories c ON i.categoryId = c.id WHERE c.storeid = $1',
      [storeId]
    )
    const existingItems = parseInt(existingItemsResult[0].count)

    // Se já existem dados, perguntar se quer sobrescrever
    if (existingCategories > 0 || existingItems > 0) {
      // Por enquanto, vamos limpar os dados existentes
      await pool.query(
        'DELETE FROM items WHERE categoryId IN (SELECT id FROM categories WHERE storeid = $1)',
        [storeId]
      )
      
      await pool.query(
        'DELETE FROM categories WHERE storeid = $1',
        [storeId]
      )
    }

    // Aplicar configurações da loja do template
    await pool.query(
      `UPDATE stores 
      SET primary_color = $1,
          requires_address = $2,
          business_type = $3,
          updated_at = NOW()
      WHERE id = $4`,
      [template.storeConfig.primaryColor, template.storeConfig.requiresAddress, template.storeConfig.businessType, storeId]
    )

    // Criar categorias e itens do template
    for (const categoryData of template.categories) {
      const { rows: categoryResult } = await pool.query(
        'INSERT INTO categories (name, description, storeid, isactive, created_at, updated_at) VALUES ($1, $2, $3, true, NOW(), NOW()) RETURNING id',
        [categoryData.name, categoryData.description, storeId]
      )
      const categoryId = categoryResult[0].id

      // Criar itens da categoria
      for (const itemData of categoryData.items) {
        await pool.query(
          'INSERT INTO items (name, description, price, categoryId, isactive, created_at, updated_at) VALUES ($1, $2, $3, $4, true, NOW(), NOW())',
          [itemData.name, itemData.description, itemData.price, categoryId]
        )
      }
    }

    return NextResponse.json({
      message: 'Template aplicado com sucesso',
      categoriesCreated: template.categories.length,
      itemsCreated: template.categories.reduce((total, cat) => total + cat.items.length, 0)
    })

  } catch (error) {
    console.error('Erro ao aplicar template:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}