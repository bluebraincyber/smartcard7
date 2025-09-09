import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@vercel/postgres'
import type { Session } from 'next-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('Iniciando DELETE para categoria:', id)
    const session = await auth() as Session | null
    console.log('Sessão obtida:', session?.user?.id)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const { isactive } = await request.json()

    // Verificar se a categoria pertence ao usuário
    console.log('Verificando se a categoria pertence ao usuário...')
    const categoryResult = await sql`
      SELECT c.id FROM categories c
      JOIN stores s ON c."storeid" = s.id
      WHERE c.id = ${id} AND s."userid" = ${session.user.id}
    `

    if (categoryResult.rows.length === 0) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 })
    }

    // Atualizar categoria
    const updatedCategoryResult = await sql`
      UPDATE categories 
      SET isactive = ${isactive}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, name, description, "storeid", isactive, created_at, updated_at
    `
    
    const updatedCategory = updatedCategoryResult.rows[0]

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`DELETE /api/categories/${id} - Requisição recebida.`);

    const session = await auth() as Session | null;
    console.log('Sessão obtida:', session?.user?.id);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se a categoria pertence ao usuário
    console.log('Verificando se a categoria pertence ao usuário...');
    const categoryResult = await sql`
      SELECT c.id FROM categories c
      JOIN stores s ON c."storeid" = s.id
      WHERE c.id = ${id} AND s."userid" = ${session.user.id}
    `;

    if (categoryResult.rows.length === 0) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    // Deletar categoria (os itens serão deletados automaticamente devido ao CASCADE)
    console.log('Deletando categoria...');
    await sql`
      DELETE FROM categories WHERE id = ${id}
    `;

    console.log('Categoria excluída com sucesso.');
    return NextResponse.json({ message: 'Categoria excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    console.error('Stack Trace:', (error as Error).stack);
    console.error('Detalhes do Erro:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}