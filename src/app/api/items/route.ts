import type { Session } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import pool from '@/lib/db'
import { revalidatePath } from "next/cache";

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando criação de item...')
    
    const session = await getServerSession(authOptions) as Session | null
    console.log('👤 Sessão do usuário:', session?.user?.id ? 'Autenticado' : 'Não autenticado')
    
    if (!session?.user?.id) {
      console.log('❌ Usuário não autenticado')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('📥 Dados recebidos:', body)
    
    const { name, description, price, image, categoryId, slug } = body

    console.log('🔍 Validando dados:')
    console.log('  - name:', name, 'tipo:', typeof name, 'trim:', name?.trim())
    console.log('  - price:', price, 'tipo:', typeof price, 'parseFloat:', parseFloat(price), 'isNaN:', isNaN(parseFloat(price)))
    console.log('  - categoryId:', categoryId, 'tipo:', typeof categoryId, 'parseInt:', parseInt(categoryId), 'isNaN:', isNaN(parseInt(categoryId)))

    if (!name?.trim()) {
      console.log('❌ Nome do item é obrigatório')
      return NextResponse.json(
        { error: 'Item name is required' },
        { status: 400 }
      )
    }

    if (!price || isNaN(parseFloat(price))) {
      console.log('❌ Preço inválido')
      return NextResponse.json(
        { error: 'Valid price is required' },
        { status: 400 }
      )
    }

    // Converter categoryId para número e validar
    const categoryIdNumber = typeof categoryId === 'string' ? parseInt(categoryId) : categoryId
    console.log('  - categoryId convertido:', categoryIdNumber, 'tipo:', typeof categoryIdNumber)

    if (!categoryIdNumber || isNaN(categoryIdNumber)) {
      console.log('❌ CategoryId inválido após conversão')
      return NextResponse.json(
        { error: 'Valid Category ID is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Verificando se categoria pertence ao usuário...')
    
    // Verificar se a categoria pertence ao usuário e obter storeid
    const categoryResult = await pool.query(
      `SELECT c.id, c.storeid, s.userid 
       FROM categories c 
       JOIN stores s ON c.storeid = s.id 
       WHERE c.id = $1 AND s.userid = $2`,
      [categoryIdNumber, session.user.id]
    )

    console.log('📊 Resultado da busca de categoria:', categoryResult.rows)

    if (categoryResult.rows.length === 0) {
      console.log('❌ Categoria não encontrada ou não autorizada')
      return NextResponse.json({ error: 'Category not found or unauthorized' }, { status: 404 })
    }

    const { storeid } = categoryResult.rows[0]
    console.log('✅ Categoria encontrada, storeid:', storeid)

    // Inserir o item usando os nomes corretos das colunas do schema
    const priceInCents = Math.round(parseFloat(price) * 100)
    console.log('💰 Preço em centavos:', priceInCents)
    
    console.log('💾 Inserindo item no banco...')
    const itemResult = await pool.query(
      `INSERT INTO items (
        name, description, price_cents, image, categoryid, storeid, isfeatured, isarchived, isactive, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, false, false, true, NOW(), NOW()
      ) RETURNING *`,
      [
        name.trim(),
        description?.trim() || null,
        priceInCents,
        image?.trim() || null,
        categoryIdNumber,
        storeid
      ]
    )

    const item = itemResult.rows[0]
    console.log('✅ Item criado com sucesso:', item)

    // Revalidar cache da página pública se slug foi fornecido
    if (slug) {
      try {
        revalidatePath(`/${slug}`)
        console.log('📄 Cache revalidado para:', `/${slug}`)
      } catch (revalidateError) {
        console.warn('⚠️ Erro ao revalidar cache:', revalidateError)
      }
    }

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating item:', error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', detail: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}