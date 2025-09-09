import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { trackEvent } from '@/lib/analytics'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📈 Analytics request body:', body)
    
    const { storeid, storeId, event, data } = body
    
    // Aceitar tanto storeid quanto storeId para compatibilidade
    const finalStoreId = storeid || storeId
    
    if (!finalStoreId || !event) {
      console.log('❌ Analytics: Parâmetros obrigatórios ausentes:', { finalStoreId, event })
      return NextResponse.json(
        { error: 'Store ID and event are required' },
        { status: 400 }
      )
    }

    // Verify store exists
    const storeResult = await pool.query(
      'SELECT id FROM stores WHERE id = $1',
      [finalStoreId]
    )

    if (storeResult.rows.length === 0) {
      console.log('❌ Analytics: Loja não encontrada:', finalStoreId)
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    // Registrar evento usando o helper alinhado ao schema
    const userAgent = request.headers.get('user-agent') || undefined
    const ipAddress = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined) as string | undefined

    await trackEvent({
      storeid: finalStoreId,
      event,
      data,
      userAgent,
      ipAddress
    })

    console.log('✅ Analytics: Evento registrado com sucesso')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error?.message }, { status: 500 });
  }
}
