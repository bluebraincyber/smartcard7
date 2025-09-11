import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { getGlobalAnalytics } from '@/lib/analytics'
import type { Session } from 'next-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const analytics = await getGlobalAnalytics([session.user.id])
    
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Erro ao buscar analytics:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error?.message }, { status: 500 });
  }
}


