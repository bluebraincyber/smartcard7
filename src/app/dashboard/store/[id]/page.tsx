import { notFound } from 'next/navigation'
import { sql } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import StorePageClient from './store-page-client'

interface Store {
  id: string
  name: string
  slug: string
  description?: string
  whatsapp: string
  address?: string
  primaryColor: string
  isactive: boolean
  categories: Category[]
}

interface Category {
  id: string
  name: string
  isactive: boolean
  items: Item[]
}

interface Item {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  isactive: boolean
  isAvailable: boolean
}



export default async function StorePage({ params }: { params: { id: string } }) {
  // 1. Obter a sessão do usuário NO SERVIDOR
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    notFound()
  }

  // 2. Buscar os dados da loja USANDO O ID DO USUÁRIO NA CONSULTA
  // ESTA É A CORREÇÃO CRÍTICA DE SEGURANÇA
  try {
    const storeResult = await sql`
      SELECT s.*, 
             json_agg(
               json_build_object(
                 'id', c.id,
                 'name', c.name,
                 'isactive', c.isactive,
                 'items', c.items
               ) ORDER BY c.name
             ) FILTER (WHERE c.id IS NOT NULL) as categories
      FROM stores s
      LEFT JOIN (
        SELECT c.id, c.name, c.isactive, c.storeid,
               json_agg(
                 json_build_object(
                   'id', i.id,
                   'name', i.name,
                   'description', i.description,
                   'price', i.price,
                   'image', i.image,
                   'isactive', i.isactive,
                   'isAvailable', true
                 ) ORDER BY i.name
               ) FILTER (WHERE i.id IS NOT NULL) as items
        FROM categories c
        LEFT JOIN items i ON c.id = i.categoryid
        GROUP BY c.id, c.name, c.isactive, c.storeid
      ) c ON s.id = c.storeid
      WHERE s.id = ${params.id} AND s."userid" = ${session.user.id}
      GROUP BY s.id, s.name, s.slug, s.description, s.whatsapp, s.address, s.primary_color, s.isactive
    `

    // 3. Se a consulta não retornar NADA, significa que a loja não existe OU não pertence a este usuário
    if (storeResult.rowCount === 0) {
      notFound()
    }

    const storeData = storeResult.rows[0]
    const store: Store = {
      id: storeData.id,
      name: storeData.name,
      slug: storeData.slug,
      description: storeData.description,
      whatsapp: storeData.whatsapp,
      address: storeData.address,
      primaryColor: storeData.primary_color,
      isactive: storeData.isactive,
      categories: storeData.categories || []
    }

    // 4. Somente se a validação passar, renderize a página com os dados da loja
    return <StorePageClient store={store} />
    
  } catch (error) {
    console.error('Erro ao buscar loja:', error)
    notFound()
  }
}

