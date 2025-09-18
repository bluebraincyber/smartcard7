import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'
import DashboardClient from './dashboard-client'
import pool from '@/lib/db'

// Type for the session data we expect
interface UserSession {
  id: string;
  name: string | null;
  email: string | null;
  image?: string | null;
}

interface AuthSession {
  user: UserSession;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions) as AuthSession | null;
  
  if (!session?.user) {
    redirect('/auth/login');
  }
  
  const user = session.user;

  // Get the user's store ID if available
  let storeId = '';
  try {
    const result = await pool.query(
      'SELECT id FROM stores WHERE user_id = $1 LIMIT 1',
      [user.id]
    );
    if (result.rows.length > 0) {
      storeId = result.rows[0].id;
    }
  } catch (error) {
    console.error('Error fetching store ID:', error);
  }
  
  // Prepare the session data for the DashboardClient
  const sessionWithUser = {
    ...session,
    user: {
      ...user,
      id: user.id || '',
      name: user.name || '',
      email: user.email || '',
      storeId,
      image: user.image || null
    }
  };
  
  return <DashboardClient session={sessionWithUser} />
}

