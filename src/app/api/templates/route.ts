import { NextResponse } from 'next/server'
import { getAvailableTemplates } from '@/lib/templates'

export async function GET() {
  try {
    const templates = getAvailableTemplates()
    return NextResponse.json(templates)
  } catch (error) {
    console.error('Erro ao buscar templates:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error?.message }, { status: 500 });
  }
}
