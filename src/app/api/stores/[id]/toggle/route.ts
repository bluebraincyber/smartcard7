// src/app/api/stores/[id]/toggle/route.ts
import { NextResponse } from "next/server";
import pool from '@/lib/db';
import { auth } from "@/auth";

export const runtime = "nodejs";

/**
 * Alterna o status (active) da loja.
 * Compatível com Next 15 (params é Promise — precisa de await).
 */
export async function PATCH(
  _req: Request,
  ctx: { params: { id: string } }
) {
  try {

    
    // Sessão obrigatória
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized - Please login" }, { status: 401 });
    }

    // Em Next 15, params é uma Promise — tem que await
    const { id } = ctx.params;
    const storeid = Number(id);
    const userid = Number(session.user.id);

    if (!storeid || Number.isNaN(storeid)) {
      return NextResponse.json({ error: "Invalid store ID" }, { status: 400 });
    }

    // Garante que a loja pertence ao usuário e pega estado atual
    const storeRes = await pool.query(
      'SELECT id, active FROM stores WHERE id = $1 AND userid = $2 LIMIT 1',
      [storeid, userid]
    );

    if (storeRes.rowCount === 0) {
      return NextResponse.json({ 
        error: "Store not found or you don't have permission" 
      }, { status: 404 });
    }

    const currentActive: boolean = storeRes.rows[0].active;
    const nextActive = !currentActive;

    // Alterna o active
    const updateRes = await pool.query(
      'UPDATE stores SET active = $1, updated_at = NOW() WHERE id = $2 AND userid = $3 RETURNING id, name, slug, description, active AS "isActive", userid, created_at AS "createdAt", updated_at AS "updatedAt"',
      [nextActive, storeid, userid]
    );

    return NextResponse.json(updateRes.rows[0], { status: 200 });
  } catch (err: any) {
    console.error("Toggle store error:", err);
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: err?.message }, { status: 500 });
  }
}

// Opcional: também aceitar POST para compatibilidade
export async function POST(
  req: Request,
  ctx: { params: { id: string } }
) {
  return PATCH(req, ctx);
}