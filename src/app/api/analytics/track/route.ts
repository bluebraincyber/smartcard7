import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { trackEvent } from '@/lib/analytics'
import logger from '@/lib/logger'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || 'N/A';
  try {
    const body = await request.json()
    logger.debug('Analytics request body:', { body, requestId })
    
    const { storeid, storeId, event, data } = body
    
    // Aceitar tanto storeid quanto storeId para compatibilidade
    const finalStoreId = storeid || storeId
    
    if (!finalStoreId || !event) {
      logger.warn('Parâmetros obrigatórios ausentes para analytics:', { finalStoreId, event, requestId })
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
      logger.warn('Loja não encontrada para analytics:', { storeId: finalStoreId, requestId })
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
      ipAddress,
      requestId
    })

    logger.info('Evento de analytics registrado com sucesso.', { requestId, storeId: finalStoreId, event })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    logger.error('Erro no tracking de analytics:', { error: error.message, stack: error.stack, requestId })
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error?.message }, { status: 500 });
  }
}
