import { notFound } from 'next/navigation'
import { sql } from '@vercel/postgres'
import PublicStorePage from '@/components/PublicStorePage'
import { trackEvent } from '@/lib/analytics'
import { Metadata } from 'next'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: {
    slug: string
  }
}

interface StoreWithCategories {
  id: string
  name: string
  slug: string
  description: string | null
  whatsapp: string
  address: string | null
  primaryColor: string
  isactive: boolean
  requiresAddress: boolean
  businessType: string
  userid: string
  createdAt: Date
  updatedAt: Date
  categories: {
    id: string
    name: string
    storeid: string
    items: {
      id: string
      name: string
      description: string | null
      price: number | null
      categoryId: string
    }[]
  }[]
}

async function getStore(slug: string): Promise<StoreWithCategories | null> {
  try {
    // Buscar store
    const storeResult = await sql`
      SELECT 
        id, name, slug, description, whatsapp, address, 
        primary_color as "primaryColor", isactive as "isactive", 
        requires_address as "requiresAddress", business_type as "businessType", 
        "userid", created_at as "createdAt", updated_at as "updatedAt"
      FROM stores 
      WHERE slug = ${slug} AND isactive = true
    `

    if (storeResult.rows.length === 0) {
      return null
    }

    const store = storeResult.rows[0]

    // Buscar categorias
    const categoriesResult = await sql`
      SELECT 
        id, name, "storeid"
    FROM categories
    WHERE "storeid" = ${store.id} AND isactive = true
      ORDER BY name ASC
    `

    // Buscar items para cada categoria
    const categories = []
    for (const category of categoriesResult.rows) {
      const itemsResult = await sql`
        SELECT 
          id, name, description, 
          COALESCE(price::numeric, 0) as price, 
          "categoryId"
        FROM items
        WHERE "categoryId" = ${category.id} AND isactive = true
        ORDER BY name ASC
      `
      
      categories.push({
        ...category,
        items: itemsResult.rows
      })
    }

    return {
      ...store,
      categories
    }
  } catch (error) {
    console.error('Error fetching store:', error)
    return null
  }
}

export default async function StorePage({ params }: PageProps) {
  const store = await getStore(params.slug)

  if (!store) {
    notFound()
  }

  // Registrar visita de forma assíncrona (não bloquear renderização)
  trackEvent({
    storeid: store.id,
    event: 'visit'
  }).catch(error => {
    console.error('Erro ao registrar visita:', error)
  })

  return <PublicStorePage store={store} />
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const store = await getStore(params.slug)

    if (!store) {
      return {
        title: 'Loja não encontrada - SmartCard',
        description: 'A loja que você está procurando não foi encontrada.'
      }
    }

    const itemCount = store.categories.reduce((total, category) => total + category.items.length, 0)
    const description = store.description || 
      `Conheça ${store.name} - ${itemCount} produtos disponíveis. Faça seu pedido pelo WhatsApp!`

    return {
      title: `${store.name} - Cartão Digital SmartCard`,
      description,
      keywords: [
        store.name,
        'cartão digital',
        'smartcard',
        'catálogo online',
        'whatsapp',
        store.businessType
      ],
      openGraph: {
        title: `${store.name} - Cartão Digital`,
        description,
        type: 'website',
        siteName: 'SmartCard',
        locale: 'pt_BR'
      },
      twitter: {
        card: 'summary_large_image',
        title: `${store.name} - Cartão Digital`,
        description
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true
        }
      }
    }
  } catch (error) {
    console.error('Erro ao gerar metadata:', error)
    // Fallback metadata se houver erro de conexão durante build
    return {
      title: `${params.slug} - SmartCard`,
      description: 'Cartão digital inteligente para seu negócio'
    }
  }
}

// Removido generateStaticParams para evitar build-time estático
// Agora todas as páginas são renderizadas dinamicamente em runtime

