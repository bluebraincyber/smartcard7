import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import pool from '@/lib/db'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/login')
  }

  // Buscar lojas do usuário e redirecionar automaticamente
  try {
    const storesResult = await pool.query(
      'SELECT id, name, slug FROM stores WHERE "userid" = $1 AND isactive = true ORDER BY created_at ASC LIMIT 1',
      [session.user.id]
    )
    
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

