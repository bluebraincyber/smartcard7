import { NextRequest, NextResponse } from 'next/server'
import { trackEvent } from '@/lib/analytics'
import logger from '@/lib/logger'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || 'N/A';
  try {
    const { storeid, event, data } = await request.json()
    logger.debug('Analytics API request body:', { storeid, event, data, requestId });

    if (!storeid || !event) {
      logger.warn('Parâmetros obrigatórios ausentes na API de analytics:', { storeid, event, requestId });
      return NextResponse.json(
        { error: 'storeid e event são obrigatórios' },
        { status: 400 }
      )
    }

    // Obter informações da requisição
    const userAgent = request.headers.get('user-agent') || undefined
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : 
                     request.headers.get('x-real-ip') || 
                     undefined

    await trackEvent({
      storeid,
      event,
      data,
      userAgent,
      ipAddress,
      requestId
    })

    logger.info('Evento de analytics registrado com sucesso via API.', { storeid, event, requestId });
    return NextResponse.json({ success: true })
  } catch (error: any) {
    logger.error('Erro ao registrar evento via API de analytics:', { error: error.message, stack: error.stack, requestId });
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error?.message }, { status: 500 });
  }
}
