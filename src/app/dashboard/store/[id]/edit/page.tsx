import { notFound } from 'next/navigation'
import pool from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import type { Session } from 'next-auth'
import EditStoreClient from './edit-store-client'

interface Store {
  id: string
  name: string
  slug: string
  description?: string
  phone: string
  address?: string
  businessType: string
  requiresAddress: boolean
  isactive: boolean
}

export default async function EditStorePage({ params }: { params: { id: string } }) {
  try {
    // 1. Obter a sessão do usuário NO SERVIDOR
    const session = await getServerSession(authOptions) as Session | null
    if (!session?.user?.id) {
      notFound()
    }

    console.log('📝 Carregando página de edição para store:', params.id)

    // 2. Buscar os dados da loja USANDO O ID DO USUÁRIO NA CONSULTA
    const storeResult = await pool.query(
      `SELECT id, name, slug, description, whatsapp, address, isactive
       FROM stores 
       WHERE id = $1 AND userid = $2`,
      [params.id, session.user.id]
    )

    // 3. Se a consulta não retornar NADA, significa que a loja não existe OU não pertence a este usuário
    if (storeResult.rows.length === 0) {
      console.log('❌ Loja não encontrada ou sem permissão')
      notFound()
    }

    const storeData = storeResult.rows[0]
    const store: Store = {
      id: storeData.id,
      name: storeData.name,
      slug: storeData.slug,
      description: storeData.description || '',
      phone: storeData.whatsapp || '',
      address: storeData.address || '',
      businessType: 'general', // Default value
      requiresAddress: false, // Default value
      isactive: storeData.isactive
    }

    console.log('✅ Dados da loja carregados para edição:', store.name)

    // 4. Somente se a validação passar, renderize a página com os dados da loja
    return <EditStoreClient store={store} />
    
  } catch (error) {
    console.error('❌ Erro ao buscar loja para edição:', error)
    notFound()
  }
}