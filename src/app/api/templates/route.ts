import { NextResponse } from 'next/server'
import { businessTemplates } from '@/lib/businessTemplates'

export async function GET() {
  try {
    const templates = businessTemplates.getAvailableTemplates()
    return NextResponse.json(templates)
  } catch (error) {
    console.error('Erro ao buscar templates:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
