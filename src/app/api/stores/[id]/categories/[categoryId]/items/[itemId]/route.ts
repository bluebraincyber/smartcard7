export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { auth } from '@/auth';

type Params = { params: { id: string; categoryId: string; itemId: string } };

// GET item
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id: storeid, categoryId, itemId } = params;
    const { rows } = await pool.query(
      'select i.* from items i where i.id = $1 and i."categoryId" = $2 and i."storeid" = $3 limit 1',
      [itemId, categoryId, storeid]
    );
    if (!rows[0]) return NextResponse.json({ ok: false, error: 'ITEM_NOT_FOUND' }, { status: 404 });
    return NextResponse.json({ ok: true, item: rows[0] });
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: (error as Error)?.message }, { status: 500 });
  }
}

// UPDATE item
export async function PUT(req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });

    const body = await req.json();
    const { name, price, featured, active } = body ?? {};
    const { id: storeid, categoryId, itemId } = params;

    const { rows } = await pool.query(
      `update items 
         set name = coalesce($1, name), 
             price = coalesce($2, price), 
             featured = coalesce($3, featured), 
             active = coalesce($4, active), 
             updated_at = now() 
       where id = $5 and "categoryId" = $6 and "storeid" = $7 
       returning *`,
      [name, price, featured, active, itemId, categoryId, storeid]
    );
    if (!rows[0]) return NextResponse.json({ ok: false, error: 'ITEM_NOT_FOUND' }, { status: 404 });
    return NextResponse.json({ ok: true, item: rows[0] });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: (error as Error)?.message }, { status: 500 });
  }
}

// DELETE item
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });

    const { id: storeid, categoryId, itemId } = params;
    const result = await pool.query(
      'delete from items where id = $1 and "categoryId" = $2 and "storeid" = $3',
      [itemId, categoryId, storeid]
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: (error as Error)?.message }, { status: 500 });
  }
}