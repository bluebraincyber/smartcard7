import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 TESTE SIMPLES: API POST iniciada')
    
    // Teste 1: Resposta básica
    console.log('✅ Teste 1: API respondendo')
    
    const body = await request.json()
    console.log('✅ Teste 2: JSON parseado:', body)
    
    return NextResponse.json({ 
      success: true, 
      message: 'API funcionando!',
      received: body 
    }, { status: 201 })
    
  } catch (error) {
    console.error('💥 ERRO NO TESTE SIMPLES:', error)
    return NextResponse.json({ 
      error: 'TESTE_ERROR', 
      detail: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'API funcionando!' })
}
