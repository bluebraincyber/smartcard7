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
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    console.log('Toggle API called');
    
    // Sessão obrigatória
    const session = await auth();
    console.log('Session:', session);
    
    if (!session?.user?.id) {
      console.log('No session found');
      return NextResponse.json({ error: "Unauthorized - Please login" }, { status: 401 });
    }

    // Em Next 15, params é uma Promise — tem que await
    const { id } = await ctx.params;
    const storeid = Number(id);
    const userid = Number(session.user.id);
    
    console.log('Toggle request:', { storeid, userid });

    if (!storeid || Number.isNaN(storeid)) {
      console.log('Invalid store ID:', id);
      return NextResponse.json({ error: "Invalid store ID" }, { status: 400 });
    }

    // Garante que a loja pertence ao usuário e pega estado atual
    console.log('Querying store with:', { storeid, userid });
    
    const storeRes = await pool.query(
      'SELECT id, active FROM stores WHERE id = $1 AND userid = $2 LIMIT 1',
      [storeid, userid]
    );
    
    console.log('Store query result:', { 
      rowCount: storeRes.rowCount, 
      rows: storeRes.rows 
    });

    if (storeRes.rowCount === 0) {
      console.log('Store not found for user');
      return NextResponse.json({ 
        error: "Store not found or you don't have permission" 
      }, { status: 404 });
    }

    const currentActive: boolean = storeRes.rows[0].active;
    const nextActive = !currentActive;
    
    console.log('Toggling active state:', { currentActive, nextActive });

    // Alterna o active
    const updateRes = await pool.query(
      'UPDATE stores SET active = $1, updated_at = NOW() WHERE id = $2 AND userid = $3 RETURNING id, name, slug, description, active AS "isActive", userid, created_at AS "createdAt", updated_at AS "updatedAt"',
      [nextActive, storeid, userid]
    );

    return NextResponse.json(updateRes.rows[0], { status: 200 });
  } catch (err: any) {
    console.error("Toggle store error:", err);
    return NextResponse.json(
      { error: "Failed to toggle store" },
      { status: 500 }
    );
  }
}

// Opcional: também aceitar POST para compatibilidade
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  return PATCH(req, ctx);
}