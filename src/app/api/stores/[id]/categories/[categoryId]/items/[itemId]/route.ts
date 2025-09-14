export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import type { Session } from 'next-auth';

type Params = { params: Promise<{ id: string; categoryId: string; itemId: string }> };

// GET item
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id: storeid, categoryId, itemId } = await params;
    const { rows } = await pool.query(
      'SELECT i.* FROM items i WHERE i.id = $1 AND i.categoryid = $2 AND i.storeid = $3 LIMIT 1',
      [itemId, categoryId, storeid]
    );
    if (!rows[0]) return NextResponse.json({ ok: false, error: 'ITEM_NOT_FOUND' }, { status: 404 });
    return NextResponse.json({ ok: true, item: rows[0] });
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// UPDATE item (PATCH method para compatibilidade)
export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });

    const body = await req.json();
    const { name, description, price, image, isactive, isarchived } = body;
    const { id: storeid, categoryId, itemId } = await params;

    // Verificar se o item pertence ao usuário
    const itemResult = await pool.query(
      `SELECT i.id FROM items i
      JOIN categories c ON i.categoryid = c.id
      JOIN stores s ON c.storeid = s.id
      WHERE i.id = $1 AND s.userid = $2`,
      [itemId, session.user.id]
    );

    if (itemResult.rows.length === 0) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    }

    // Construir update dinamicamente apenas com campos fornecidos
    const updateFields = [];
    const updateValues = [];
    
    if (name !== undefined) {
      updateFields.push('name = $' + (updateValues.length + 1));
      updateValues.push(name);
    }
    
    if (description !== undefined) {
      updateFields.push('description = $' + (updateValues.length + 1));
      updateValues.push(description);
    }
    
    if (price !== undefined) {
      updateFields.push('price_cents = $' + (updateValues.length + 1));
      updateValues.push(Math.round(parseFloat(price) * 100));
    }
    
    if (image !== undefined) {
      updateFields.push('image = $' + (updateValues.length + 1));
      updateValues.push(image);
    }
    
    if (isactive !== undefined) {
      updateFields.push('isactive = $' + (updateValues.length + 1));
      updateValues.push(isactive);
    }
    
    if (isarchived !== undefined) {
      updateFields.push('isarchived = $' + (updateValues.length + 1));
      updateValues.push(isarchived);
    }
    
    // Sempre atualizar updated_at
    updateFields.push('updated_at = NOW()');
    
    if (updateFields.length === 1) { // Apenas updated_at
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
    }
    
    const updateQuery = `
      UPDATE items SET ${updateFields.join(', ')}
      WHERE id = $${updateValues.length + 1}
      RETURNING id, name, description, price_cents, image, isactive, isarchived, updated_at
    `;
    updateValues.push(itemId);
    
    const updatedItemResult = await pool.query(updateQuery, updateValues);
    
    if (updatedItemResult.rows.length === 0) {
      return NextResponse.json({ error: 'Falha ao atualizar item' }, { status: 500 });
    }
    
    const updatedItem = {
      ...updatedItemResult.rows[0],
      price: updatedItemResult.rows[0].price_cents ? updatedItemResult.rows[0].price_cents / 100 : 0
    };

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// DELETE item
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });

    const { id: storeid, categoryId, itemId } = await params;
    
    // Verificar se o item pertence ao usuário
    const itemResult = await pool.query(
      `SELECT i.id FROM items i
      JOIN categories c ON i.categoryid = c.id
      JOIN stores s ON c.storeid = s.id
      WHERE i.id = $1 AND s.userid = $2`,
      [itemId, session.user.id]
    );

    if (itemResult.rows.length === 0) {
      return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    }
    
    const result = await pool.query(
      'DELETE FROM items WHERE id = $1 AND categoryid = $2 AND storeid = $3',
      [itemId, categoryId, storeid]
    );
    
    return NextResponse.json({ ok: true, message: 'Item excluído com sucesso' });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
