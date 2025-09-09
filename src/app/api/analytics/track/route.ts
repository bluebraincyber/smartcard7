import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { trackEvent } from '@/lib/analytics'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { storeId, event, data } = await request.json()

    if (!storeId || !event) {
      return NextResponse.json(
        { error: 'Store ID and event are required' },
        { status: 400 }
      )
    }

    // Verify store exists
    const storeResult = await pool.query(
      'SELECT id FROM stores WHERE id = $1',
      [storeId]
    )

    if (storeResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    // Registrar evento usando o helper alinhado ao schema
    const userAgent = request.headers.get('user-agent') || undefined
    const ipAddress = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined) as string | undefined

    await trackEvent({
      storeid: storeId,
      event,
      data,
      userAgent,
      ipAddress
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error?.message }, { status: 500 });
  }
}
