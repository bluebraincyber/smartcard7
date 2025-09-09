import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import pool from '@/lib/db'
import type { Session } from 'next-auth'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    const { isactive } = await request.json()

    // Verificar se a categoria pertence ao usuário e obter store slug
    const categoryResult = await pool.query(
      'SELECT c.id, s.slug FROM categories c JOIN stores s ON c.storeid = s.id WHERE c.id = $1 AND s.userid = $2',
      [id, session.user.id]
    )

    if (categoryResult.rows.length === 0) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 })
    }

    const storeSlug = categoryResult.rows[0].slug

    // Atualizar categoria
    const updatedCategoryResult = await pool.query(
      'UPDATE categories SET isactive = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [isactive, id]
    )
    
    const updatedCategory = updatedCategoryResult.rows[0]

    // CORREÇÃO: Revalidar cache da página pública
    try {
      revalidatePath(`/${storeSlug}`)
      console.log('📄 Cache revalidado para página pública:', `/${storeSlug}`)
    } catch (revalidateError) {
      console.warn('⚠️ Erro ao revalidar cache da página pública:', revalidateError)
    }

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error)
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error?.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se a categoria pertence ao usuário
    const categoryResult = await pool.query(
      'SELECT c.id FROM categories c JOIN stores s ON c.storeid = s.id WHERE c.id = $1 AND s.userid = $2',
      [id, session.user.id]
    );

    if (categoryResult.rows.length === 0) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    // Deletar categoria (os itens serão deletados automaticamente devido ao CASCADE)
    await pool.query(
      'DELETE FROM categories WHERE id = $1',
      [id]
    );


    return NextResponse.json({ message: 'Categoria excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);

    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error?.message }, { status: 500 });
  }
}