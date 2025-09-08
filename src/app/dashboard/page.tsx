import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { buildAuthOptions } from '@/auth'
import { sql } from '@vercel/postgres'
import DashboardClient from './dashboard-client'

const authOptions = buildAuthOptions()

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/login')
  }

  // Buscar lojas do usuário e redirecionar automaticamente
  try {
    const storesResult = await sql`
      SELECT id, name, slug FROM stores 
      WHERE "userid" = ${session.user.id} AND isactive = true
      ORDER BY created_at ASC
      LIMIT 1
    `
    
    if (storesResult.rows.length > 0) {
      const firstStore = storesResult.rows[0]
      // Verificar se a loja realmente existe e é válida
      if (firstStore.id && firstStore.name) {
        redirect(`/dashboard/store/${firstStore.id}`)
      }
    }
  } catch (error) {
    console.error('Erro ao buscar lojas:', error)
    // Em caso de erro, continuar para o dashboard normal
  }

  return <DashboardClient session={session} />
}

