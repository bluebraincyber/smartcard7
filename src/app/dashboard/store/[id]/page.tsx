import { notFound } from 'next/navigation'
import pool from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import StorePageClient from './store-page-client'
import OverflowGuard from '../../OverflowGuard'

interface Store {
  id: string
  name: string
  slug: string
  description?: string
  whatsapp: string
  address?: string
  primaryColor: string
  isactive: boolean
  image?: string
  coverImage?: string
  profileImage?: string
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
  const session = await getServerSession(authOptions) as { user?: { id: string } } | null
  if (!session?.user?.id) {
    notFound()
  }

  // 2. Buscar os dados da loja USANDO O ID DO USUÁRIO NA CONSULTA
  // ESTA É A CORREÇÃO CRÍTICA DE SEGURANÇA
  try {
    // Primeira busca mais simples para evitar erros de tipo
    const storeResult = await pool.query(
      'SELECT * FROM stores WHERE id = $1 AND userid = $2',
      [params.id, session.user.id]
    )

    if (storeResult.rows.length === 0) {
      notFound()
    }

    const storeData = storeResult.rows[0]
    
    // Buscar categorias separadamente
    const categoriesResult = await pool.query(
      'SELECT * FROM categories WHERE storeid = $1 ORDER BY "order" ASC', // Revertido para storeid e "order"
      [params.id]
    )
    
    // Buscar items separadamente - CORRIGIDO: usar nome correto da coluna
    const itemsResult = await pool.query(
      'SELECT i.* FROM items i JOIN categories c ON i.categoryid = c.id WHERE c.storeid = $1', // Revertido para categoryid e storeid
      [params.id]
    )
    
    // Organizar dados
    const categories = categoriesResult.rows.map(cat => ({
      id: cat.id,
      name: cat.name,
      isactive: cat.isactive,
      items: itemsResult.rows
        .filter(item => item.categoryid === cat.id) // Revertido para categoryid
        .map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price_cents ? item.price_cents / 100 : 0, // CORRIGIDO: converter de centavos para reais
          image: item.image,
          isactive: item.isactive,
          isAvailable: item.isAvailable !== false // Default true se undefined
        }))
    }))
    const store: Store = {
      id: storeData.id,
      name: storeData.name,
      slug: storeData.slug,
      description: storeData.description,
      whatsapp: storeData.whatsapp,
      address: storeData.address,
      primaryColor: storeData.primaryColor || storeData.primary_color || '#EA1D2C',
      isactive: storeData.isactive,
      image: storeData.logo,
      coverImage: storeData.coverimage,
      profileImage: storeData.logo,
      categories: categories
    }

    // 4. Somente se a validação passar, renderize a página com os dados da loja
    return (
      <OverflowGuard>
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <StorePageClient store={store} />
        </div>
      </OverflowGuard>
    )
    
  } catch (error) {
    console.error('Erro ao buscar loja:', error)
    notFound()
  }
}

