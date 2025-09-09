import { NextResponse } from "next/server";
import pool from '@/lib/db';
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import type { Session } from 'next-auth'

export const runtime = "nodejs";

/**
 * Alterna o status (isactive) da loja.
 * Corrigido para usar os nomes corretos das colunas do schema.
 */
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔄 Iniciando toggle de loja...')

    // Sessão obrigatória
    const session = await getServerSession(authOptions) as Session | null;
    console.log('👤 Sessão:', session?.user?.id ? 'Autenticado' : 'Não autenticado')
    
    if (!session?.user?.id) {
      console.log('❌ Usuário não autenticado')
      return NextResponse.json({ error: "Unauthorized - Please login" }, { status: 401 });
    }

    // Aguardar params corretamente
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const storeid = Number(id);
    const userid = Number(session.user.id);

    console.log('📊 Dados recebidos:', { storeid, userid })

    if (!storeid || Number.isNaN(storeid)) {
      console.log('❌ Store ID inválido:', id)
      return NextResponse.json({ error: "Invalid store ID" }, { status: 400 });
    }

    // Garante que a loja pertence ao usuário e pega estado atual
    // CORRIGIDO: usar nome correto da coluna 'isactive'
    const storeRes = await pool.query(
      'SELECT id, isactive FROM stores WHERE id = $1 AND userid = $2 LIMIT 1',
      [storeid, userid]
    );

    console.log('🔍 Resultado da busca de loja:', storeRes.rows)

    if (storeRes.rowCount === 0) {
      console.log('❌ Loja não encontrada ou sem permissão')
      return NextResponse.json({ 
        error: "Store not found or you don't have permission" 
      }, { status: 404 });
    }

    const currentActive: boolean = storeRes.rows[0].isactive;
    const nextActive = !currentActive;

    console.log('🔄 Toggle:', { currentActive, nextActive })

    // Alterna o isactive - CORRIGIDO: usar nome correto da coluna
    const updateRes = await pool.query(
      `UPDATE stores 
       SET isactive = $1, updated_at = NOW() 
       WHERE id = $2 AND userid = $3 
       RETURNING id, name, slug, description, isactive, userid, created_at, updated_at`,
      [nextActive, storeid, userid]
    );

    console.log('✅ Loja atualizada:', updateRes.rows[0])

    // Retornar formato compatível com frontend
    const updatedStore = {
      ...updateRes.rows[0],
      isActive: updateRes.rows[0].isactive, // Manter isActive para compatibilidade
      createdAt: updateRes.rows[0].created_at,
      updatedAt: updateRes.rows[0].updated_at
    };

    console.log('✅ Resposta sendo enviada:', updatedStore)

    return NextResponse.json(updatedStore, { status: 200 });
  } catch (err: any) {
    console.error("❌ Toggle store error:", err);
    return NextResponse.json({ 
      error: 'INTERNAL_ERROR', 
      detail: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// Opcional: também aceitar POST para compatibilidade
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  return PATCH(req, ctx);
}