import { notFound } from 'next/navigation'
import pool from '@/lib/db'
import PublicStorePage from '@/components/PublicStorePage'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: {
    slug: string
  }
}

async function getStore(slug: string) {
  try {
    console.log('🔍 Buscando loja com slug:', slug)

    // Testar conexão primeiro
    const connectionTest = await pool.query('SELECT NOW()');
    console.log('✅ Conexão com banco OK:', connectionTest.rows[0]);

    // Debug: listar todas as lojas disponíveis
    try {
      const allStoresResult = await pool.query(
        `SELECT slug, name, isactive FROM stores ORDER BY created_at DESC LIMIT 10`
      );
      console.log('🏪 Lojas disponíveis no banco:', allStoresResult.rows);
    } catch (debugError) {
      console.error('❌ Erro ao listar lojas:', debugError);
    }

    // Buscar loja específica
    const storeResult = await pool.query(
      `SELECT id, name, slug, description, whatsapp, address, isactive, created_at, updated_at
       FROM stores 
       WHERE slug = $1
       LIMIT 1`,
      [slug]
    );

    console.log('📊 Resultado da busca:', storeResult.rows.length, 'registros encontrados');

    if (storeResult.rows.length === 0) {
      console.log('❌ Loja não encontrada para slug:', slug);
      return null;
    }

    const store = storeResult.rows[0];
    console.log('✅ Loja encontrada:', store.name, 'Ativa:', store.isactive);

    // Verificar se está ativa
    if (!store.isactive) {
      console.log('⚠️ Loja inativa:', store.name);
      return null;
    }

    // Buscar categorias simples primeiro
    const categoriesResult = await pool.query(
      `SELECT id, name, storeid FROM categories WHERE storeid = $1 ORDER BY id ASC`,
      [store.id]
    );

    console.log('📂 Categorias encontradas:', categoriesResult.rows.length);

    // Para cada categoria, buscar items
    const categories = [];
    for (const category of categoriesResult.rows) {
      try {
        const itemsResult = await pool.query(
          `SELECT id, name, description, price_cents, image, isactive, isarchived
           FROM items
           WHERE categoryid = $1 AND isactive = true AND isarchived = false
           ORDER BY name ASC`,
          [category.id]
        );

        const items = itemsResult.rows.map(item => ({
          id: String(item.id),
          name: item.name,
          description: item.description || null,
          price: item.price_cents ? Number(item.price_cents) / 100 : 0,
          categoryId: String(category.id),
          imageUrl: item.image || null,
          isactive: item.isactive,
          isarchived: item.isarchived
        }));

        categories.push({
          id: String(category.id),
          name: category.name,
          storeid: String(category.storeid),
          items: items
        });

        console.log(`📁 Categoria ${category.name}: ${items.length} itens`);
      } catch (itemError) {
        console.error(`❌ Erro ao buscar itens da categoria ${category.name}:`, itemError);
        categories.push({
          id: String(category.id),
          name: category.name,
          storeid: String(category.storeid),
          items: []
        });
      }
    }

    const finalStore = {
      id: String(store.id),
      name: store.name,
      slug: store.slug,
      description: store.description || null,
      whatsapp: store.whatsapp || '',
      address: store.address || null,
      primaryColor: '#EA1D2C',
      coverImage: null,
      profileImage: null,
      categories: categories
    };

    console.log('🏪 Loja final preparada:', finalStore.name, 'com', categories.length, 'categorias');
    return finalStore;

  } catch (error) {
    console.error('❌ Erro geral ao buscar loja:', error);
    console.error('❌ Stack:', error.stack);
    return null;
  }
}

export default async function StorePage({ params }: { params: { slug: string } }) {
  try {
    console.log('🚀 Iniciando página pública para slug:', params.slug);
    
    const store = await getStore(params.slug);

    if (!store) {
      console.log('🚫 Loja não encontrada, redirecionando para 404');
      notFound();
    }

    console.log('🎉 Renderizando página para:', store.name);
    return <PublicStorePage store={store} />;
    
  } catch (error) {
    console.error('❌ Erro crítico na página:', error);
    console.error('❌ Stack:', error.stack);
    notFound();
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const store = await getStore(params.slug);

    if (!store) {
      return {
        title: 'Loja não encontrada - SmartCard',
        description: 'A loja que você está procurando não foi encontrada.'
      };
    }

    return {
      title: `${store.name} - SmartCard`,
      description: store.description || `Conheça ${store.name} - Faça seu pedido pelo WhatsApp!`,
      openGraph: {
        title: `${store.name} - Cartão Digital`,
        description: store.description || `Conheça ${store.name}`,
        type: 'website',
        siteName: 'SmartCard',
        locale: 'pt_BR'
      }
    };
  } catch (error) {
    console.error('Erro ao gerar metadata:', error);
    return {
      title: 'SmartCard',
      description: 'Cartão digital inteligente'
    };
  }
}
