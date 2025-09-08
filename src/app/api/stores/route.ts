// Stores API usando @vercel/postgres
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';


export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET - Listar stores do usuário autenticado
export async function GET() {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    
    // Se não estiver autenticado, retornar lista vazia
    if (!session?.user?.id) {
      return Response.json({ stores: [] });
    }
    
    const userid = Number(session.user.id);
    const { rows } = await sql`
      SELECT 
        s.id,
        s.name,
        s.slug,
        s.description,
        s.active as "isActive",
        s.userid,
        s.created_at as "createdAt",
        s.updated_at as "updatedAt",
        u.name as owner_name, 
        COUNT(c.id) as category_count
      FROM stores s
      LEFT JOIN users u ON s."userid" = u.id
      LEFT JOIN categories c ON c."storeid" = s.id
      WHERE s.userid = ${userid}
      GROUP BY s.id, u.name
      ORDER BY s.created_at DESC
    `;
    
    // Transform the data to include _count object and ensure consistent naming
    const storesWithCount = rows.map(store => ({
      id: store.id,
      name: store.name,
      slug: store.slug,
      description: store.description,
      isActive: store.isActive,
      userid: store.userid,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
      owner_name: store.owner_name,
      _count: {
        categories: parseInt(store.category_count) || 0,
        analytics: 0  // Adicionar analytics count se necessário
      }
    }));
    
    return Response.json({ stores: storesWithCount });
  } catch (error) {
    console.error('Get stores error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

// POST - Criar nova store
export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json({ 
        error: 'Unauthorized - Please login' 
      }, { status: 401 });
    }
    
    const userid = Number(session.user.id);
    const { name, slug, description, whatsapp, address, primaryColor } = await request.json();
    
    if (!name || !slug) {
      return Response.json({ 
        error: 'Nome e slug são obrigatórios' 
      }, { status: 400 });
    }
    
    // Verificar se slug já existe
    const { rows: existing } = await sql`
      SELECT id FROM stores WHERE slug = ${slug}
    `;
    
    if (existing.length > 0) {
      return Response.json({ 
        error: 'Este identificador já está em uso' 
      }, { status: 400 });
    }
    
    // Criar store
    const { rows } = await sql`
      INSERT INTO stores (name, slug, description, "userid", created_at, updated_at)
      VALUES (${name}, ${slug}, ${description || ''}, ${userid}, NOW(), NOW())
      RETURNING *
    `;
    
    return Response.json({ 
      success: true, 
      store: rows[0] 
    });
  } catch (error) {
    console.error('Create store error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
}


