import { NextRequest, NextResponse } from 'next/server'
import { trackEvent } from '@/lib/analytics'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { storeid, event, data } = await request.json()

    if (!storeid || !event) {
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
      ipAddress
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao registrar evento:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error?.message }, { status: 500 });
  }
}
