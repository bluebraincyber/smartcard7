export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { auth } from '@/auth';

type Params = { params: { id: string; categoryId: string; itemId: string } };

// GET item
export async function GET(_req: Request, { params }: Params) {
  const { id: storeid, categoryId, itemId } = params;
  const { rows } = await sql`
    select i.* 
    from items i 
    where i.id = ${itemId} and i."categoryId" = ${categoryId} and i."storeid" = ${storeid} 
    limit 1
  `;
  if (!rows[0]) return NextResponse.json({ ok: false, error: 'ITEM_NOT_FOUND' }, { status: 404 });
  return NextResponse.json({ ok: true, item: rows[0] });
}

// UPDATE item
export async function PUT(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });

  const body = await req.json();
  const { name, price, featured, active } = body ?? {};
  const { id: storeid, categoryId, itemId } = params;

  const { rows } = await sql`
    update items 
       set name = coalesce(${name}, name), 
           price = coalesce(${price}, price), 
           featured = coalesce(${featured}, featured), 
           active = coalesce(${active}, active), 
           updated_at = now() 
     where id = ${itemId} and "categoryId" = ${categoryId} and "storeid" = ${storeid} 
     returning *
  `;
  if (!rows[0]) return NextResponse.json({ ok: false, error: 'ITEM_NOT_FOUND' }, { status: 404 });
  return NextResponse.json({ ok: true, item: rows[0] });
}

// DELETE item
export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });

  const { id: storeid, categoryId, itemId } = params;
  const result = await sql`
    delete from items where id = ${itemId} and "categoryId" = ${categoryId} and "storeid" = ${storeid}
  `;
  return NextResponse.json({ ok: true });
}