import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { buildAuthOptions } from '@/lib/auth'
import type { Session } from 'next-auth'
import { sql } from '@vercel/postgres'

export const runtime = 'nodejs'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(await buildAuthOptions()) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const resolvedParams = await params

    // Verificar se a loja pertence ao usuário
    const { rows: stores } = await sql`
      SELECT id, name, slug FROM stores 
      WHERE id = ${resolvedParams.id} AND "userid" = ${session.user.id}
    `

    if (stores.length === 0) {
      return NextResponse.json(
        { error: 'Loja não encontrada' },
        { status: 404 }
      )
    }

    // Buscar analytics básicos diretamente
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const { rows: analytics } = await sql`
      SELECT 
        COUNT(*) as total_views,
        COUNT(DISTINCT DATE(created_at)) as active_days
      FROM analytics 
      WHERE "storeid" = ${resolvedParams.id} 
        AND created_at >= ${startDate.toISOString()}
    `
    
    const analyticsData = {
      totalViews: parseInt(analytics[0]?.total_views || '0'),
      activeDays: parseInt(analytics[0]?.active_days || '0'),
      period: days
    }
    
    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Erro ao buscar analytics da loja:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}