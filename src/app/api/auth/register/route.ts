// app/api/auth/register/route.ts
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/password';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'INVALID_INPUT' }, { status: 400 });
    }

    const hash = await hashPassword(password);

    await pool.query(
      `INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO UPDATE 
        SET name = EXCLUDED.name, 
            password_hash = EXCLUDED.password_hash, 
            updated_at = NOW()`,
      [name ?? null, email.toLowerCase(), hash]
    );

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    console.error('register error', e);
    return NextResponse.json({ error: 'INTERNAL_ERROR', detail: e?.message }, { status: 500 });
  }
}

