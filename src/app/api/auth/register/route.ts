// app/api/auth/register/route.ts
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hashPassword } from '@/lib/password';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'INVALID_INPUT' }, { status: 400 });
    }

    const hash = await hashPassword(password);

    await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name ?? null}, ${email.toLowerCase()}, ${hash})
      ON CONFLICT (email) DO UPDATE 
        SET name = EXCLUDED.name, 
            password_hash = EXCLUDED.password_hash, 
            updated_at = NOW()
    `;

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: ) {
    console.error('register error', e);
    return NextResponse.json({ ok: false, error: 'REGISTER_FAILED' }, { status: 500 });
  }
}

