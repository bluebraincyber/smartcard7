import { notFound } from 'next/navigation'
import { sql } from '@/lib/db'
import { auth } from '@/auth'
import { authOptions } from '@/lib/authOptions'
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

interface SlugCheckResult {
  available: boolean
  reason?: string
  message: string
}



export default async function EditStorePage({ params }: { params: { id: string } }) {
  // 1. Obter a sessão do usuário NO SERVIDOR
  const session = await auth()
  if (!session?.user?.id) {
    notFound()
  }

  // 2. Buscar os dados da loja USANDO O ID DO USUÁRIO NA CONSULTA
  // ESTA É A CORREÇÃO CRÍTICA DE SEGURANÇA
  try {
    const storeResult = await sql`
      SELECT id, name, slug, description, whatsapp as phone, address, 
             isactive
      FROM stores 
      WHERE id = ${params.id} AND "userid" = ${session.user.id}
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
      phone: storeData.phone,
      address: storeData.address,
      businessType: 'general', // Default value
      requiresAddress: false, // Default value
      isactive: storeData.isactive
    }

    // 4. Somente se a validação passar, renderize a página com os dados da loja
    return <EditStoreClient store={store} />
    
  } catch (error) {
    console.error('Erro ao buscar loja:', error)
    notFound()
  }
}