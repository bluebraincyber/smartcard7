import { notFound } from 'next/navigation'
import pool from '@/lib/db'
import PublicStorePage from '@/components/PublicStorePage'
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

async function getStore(slug: string) {
  try {
    noStore();

    console.log('🔍 Buscando loja com slug:', slug)

    // Buscar loja - versão simplificada e robusta
    const storeResult = await pool.query(
      `SELECT id, name, slug, description, whatsapp, address, isactive, userid, created_at, updated_at 
       FROM stores 
       WHERE slug = $1 
       LIMIT 1`,
      [slug]
    );

    console.log('📊 Resultado da busca de loja:', storeResult.rows.length, 'registros')

    if (storeResult.rows.length === 0) {
      console.log('❌ Loja não encontrada para slug:', slug)
      return null;
    }

    const store = storeResult.rows[0];
    console.log('✅ Loja encontrada:', store.name)

    // Verificar se a loja está ativa
    if (!store.isactive) {
      console.log('⚠️ Loja inativa:', store.name)
      return null;
    }

    // Buscar categorias - versão simplificada
    const categoriesResult = await pool.query(
      `SELECT id, name, storeid FROM categories WHERE storeid = $1 ORDER BY id ASC`,
      [store.id]
    );

    console.log('📂 Categorias encontradas:', categoriesResult.rows.length)

    const enrichedCategories = [];
    for (const category of categoriesResult.rows) {
      console.log('🔍 Buscando itens para categoria:', category.name)
      
      try {
        // Buscar itens com tratamento robusto de cada coluna
        const itemsResult = await pool.query(
          `SELECT 
            id, 
            name, 
            COALESCE(description, '') as description,
            COALESCE(price_cents, 0) as price_cents,
            COALESCE(image, '') as image,
            COALESCE(isactive, true) as isactive,
            COALESCE(isarchived, false) as isarchived
           FROM items
           WHERE categoryid = $1
           ORDER BY name ASC`,
          [category.id]
        );

        console.log(`📦 Itens encontrados para ${category.name}:`, itemsResult.rows.length)

        // Log detalhado dos itens para debug
        if (itemsResult.rows.length > 0) {
          console.log(`🔍 Primeiro item da categoria ${category.name}:`, JSON.stringify(itemsResult.rows[0], null, 2))
        }

        // Converter itens para formato esperado pelo frontend com tratamento robusto
        const formattedItems = itemsResult.rows
          .filter(item => {
            const isArchived = item.isarchived === true
            const isActive = item.isactive !== false
            console.log(`📋 Item ${item.name}: archived=${isArchived}, active=${isActive}`)
            return !isArchived && isActive
          })
          .map(item => {
            const formattedItem = {
              id: String(item.id),
              name: String(item.name || ''),
              description: item.description || null,
              price: item.price_cents ? Number(item.price_cents) / 100 : 0,
              categoryId: String(category.id),
              imageUrl: item.image || null,
              isactive: item.isactive !== false,
              isarchived: item.isarchived === true
            };
            console.log(`✅ Item formatado:`, JSON.stringify(formattedItem, null, 2))
            return formattedItem;
          });

        enrichedCategories.push({ 
          ...category, 
          items: formattedItems 
        });

      } catch (itemError) {
        console.error(`❌ Erro ao buscar itens para categoria ${category.name}:`, itemError)
        // Continuar com categoria vazia em caso de erro
        enrichedCategories.push({ 
          ...category, 
          items: [] 
        });
      }
    }

    const finalStore = { 
      ...store, 
      primaryColor: '#EA1D2C', // Valor padrão
      categories: enrichedCategories 
    };

    console.log('🏪 Loja completa preparada:', finalStore.name, 'com', enrichedCategories.length, 'categorias')
    console.log('📊 Resumo das categorias:', enrichedCategories.map(cat => ({ 
      name: cat.name, 
      itemCount: cat.items.length 
    })))
    
    return finalStore;

  } catch (error) {
    console.error('❌ Erro ao buscar loja:', error)
    console.error('❌ Stack trace:', error.stack)
    return null;
  }
}

export default async function StorePage({ params }: { params: { slug: string } }) {
  try {
    noStore();
    
    console.log('🚀 Carregando página pública para slug:', params.slug)
    
    const store = await getStore(params.slug);

    if (!store) {
      console.log('🚫 Redirecionando para 404 - loja não encontrada')
      notFound()
    }

    console.log('🎉 Renderizando página pública para:', store.name)
    console.log('🔍 Store data antes de passar para componente:', JSON.stringify({
      name: store.name,
      categoriesCount: store.categories.length,
      totalItems: store.categories.reduce((sum, cat) => sum + cat.items.length, 0)
    }, null, 2))
    
    return <PublicStorePage store={store} />
    
  } catch (error) {
    console.error('❌ Erro crítico na página pública:', error)
    console.error('❌ Stack trace:', error.stack)
    notFound()
  }
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
      openGraph: {
        title: `${store.name} - Cartão Digital`,
        description,
        type: 'website',
        siteName: 'SmartCard',
        locale: 'pt_BR'
      }
    }
  } catch (error) {
    console.error('Erro ao gerar metadata:', error)
    return {
      title: `${params.slug} - SmartCard`,
      description: 'Cartão digital inteligente para seu negócio'
    }
  }
}