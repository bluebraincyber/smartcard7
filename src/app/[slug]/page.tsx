import { notFound } from 'next/navigation'
import pool from '@/lib/db'
import PublicStorePage from '@/components/PublicStorePage'
import { trackEvent } from '@/lib/analytics'
import { Metadata } from 'next'
import { unstable_noStore as noStore } from "next/cache";

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: {
    slug: string
  }
}

interface StoreRow {
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
}

interface CategoryRow {
  id: string
  name: string
  storeid: string
  active: boolean
}

interface ItemRow {
  id: string
  name: string
  description: string | null
  price: number | null;
  categoryId: string
  imageUrl: string | null; // Adicionado imageUrl
}

interface StoreWithCategories extends StoreRow {
  categories: {
    id: string
    name: string
    storeid: string
    items: ItemRow[]
  }[]
}

async function getStore(slug: string) {
  noStore();

  const { rows: [store] } = await pool.query(
    `SELECT id, name, slug, description, whatsapp, address, primary_color as primaryColor, isactive, requires_address as requiresAddress, business_type as businessType, userid, created_at as createdAt, updated_at as updatedAt FROM stores WHERE slug = $1 LIMIT 1`,
    [slug]
  );

  if (!store) {
    return null;
  }

  const { rows: categories } = await pool.query(
    `SELECT id, name, position FROM categories WHERE storeid = $1 ORDER BY position ASC`, // Revertido para storeid
    [store.id]
  );

  const enrichedCategories = [];
  for (const category of categories) {
    const { rows: items } = await pool.query(
      `SELECT id, name, description, price, COALESCE(isactive, TRUE) AS isactive, COALESCE(isarchived, FALSE) AS isarchived, image_url as imageUrl
         FROM items
        WHERE categoryid = $1
          AND COALESCE(isarchived, FALSE) = FALSE
          AND COALESCE(isactive, TRUE) = TRUE
        ORDER BY name ASC`, // Revertido para categoryid
      [category.id]
    );
    enrichedCategories.push({ ...category, items: items ?? [] });
  }

  return { ...store, categories: enrichedCategories };
}

export default async function StorePage({ params }: { params: { slug: string } }) {
  noStore(); // sem cache
  const store = await getStore(params.slug);

  if (!store) {
    notFound()
  }

  return (
    <PublicStorePage store={store} />
  )
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
