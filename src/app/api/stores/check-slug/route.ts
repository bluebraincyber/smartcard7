import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import type { Session } from 'next-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'; // Disable static generation

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { 
          available: false,
          message: 'Slug é obrigatório' 
        },
        { status: 400 }
      )
    }

    // Validar formato do slug
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(slug) || slug.length < 3 || slug.length > 63) {
      return NextResponse.json({
        available: false,
        reason: 'invalid',
        message: 'Slug inválido. Use apenas letras minúsculas, números e hífens (3-63 caracteres).'
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
      { 
        available: false,
        message: 'Erro interno do servidor',
        error: 'INTERNAL_ERROR' 
      },
      { status: 500 }
    )
  }
}