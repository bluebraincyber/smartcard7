import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export const runtime = 'nodejs'
import { isValidSlug, generateSlugSuggestions } from '@/lib/subdomain'

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json()

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o slug é válido
    if (!isValidSlug(slug)) {
      return NextResponse.json({
        available: false,
        reason: 'invalid',
        message: 'Slug inválido. Use apenas letras, números e hífens (3-63 caracteres).'
      })
    }

    // Verificar se já existe no banco
    const existingStoreResult = await pool.query(
      'SELECT id FROM stores WHERE slug = $1',
      [slug]
    )

    if (existingStoreResult.rows.length > 0) {
      return NextResponse.json({
        available: false,
        reason: 'taken',
        message: 'Este slug já está em uso.'
      })
    }

    return NextResponse.json({
      available: true,
      message: 'Slug disponível!'
    })
  } catch (error) {
    console.error('Erro ao verificar slug:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessName = searchParams.get('name')

    if (!businessName) {
      return NextResponse.json(
        { error: 'Nome do negócio é obrigatório' },
        { status: 400 }
      )
    }

    const suggestions = generateSlugSuggestions(businessName)
    
    // Verificar disponibilidade de cada sugestão
    const availableSuggestions = []
    
    for (const suggestion of suggestions) {
      const existingStoreResult = await pool.query(
        'SELECT id FROM stores WHERE slug = $1',
        [suggestion]
      )
      
      if (existingStoreResult.rows.length === 0) {
        availableSuggestions.push(suggestion)
      }
    }

    return NextResponse.json({
      suggestions: availableSuggestions
    })
  } catch (error) {
    console.error('Erro ao gerar sugestões:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
