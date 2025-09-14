import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { businessTemplates } from '@/lib/businessTemplates';
import pool from '@/lib/db';
import type { Session } from 'next-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    console.log('=== INICIANDO APLICAÇÃO DE TEMPLATE ===');
    console.log('Store ID:', params.id);
    
    const session = await getServerSession(authOptions) as Session | null;
    console.log('Sessão encontrada:', !!session);
    console.log('User ID:', session?.user?.id);

    if (!session || !session.user || !session.user.id) {
      console.log('ERRO: Sessão inválida');
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Body recebido:', body);
    const { templateId } = body;

    if (!params.id || !templateId) {
      console.log('ERRO: Parâmetros ausentes');
      return NextResponse.json({ message: 'ID da loja ou ID do template ausente' }, { status: 400 });
    }

    console.log(`Aplicando template '${templateId}' à loja '${params.id}'`);
    
    // Lógica para aplicar o template
    const result = await businessTemplates.applyTemplateToStore(params.id, templateId, session.user.id);
    
    console.log('Resultado da aplicação:', result);

    if (result.success) {
      console.log('=== TEMPLATE APLICADO COM SUCESSO ===');
      return NextResponse.json({ 
        message: 'Template aplicado com sucesso', 
        store: result.store 
      });
    } else {
      console.error('ERRO na aplicação do template:', result.error);
      return NextResponse.json({ 
        message: result.error || 'Falha ao aplicar template. Tente novamente.' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('=== ERRO INESPERADO ===');
    console.error('Erro completo:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
    
    return NextResponse.json({ 
      message: 'Erro interno do servidor. Tente novamente.' 
    }, { status: 500 });
  }
}
