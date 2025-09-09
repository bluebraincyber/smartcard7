import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import pool from '@/lib/db'
import { comparePassword, hashPassword } from '@/lib/password'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface UserUpdateData {
  name: string
  email: string
  password?: string
}

export async function GET() {
  try {
    // util de senha centralizado em src/lib/password.ts (não necessário aqui)
    const session = await auth()
    
     if (!session?.user?.id) {
       return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
     }

     const userResult = await pool.query(
       'SELECT id, name, email, created_at FROM users WHERE id = $1',
       [session.user.id]
     )

     if (userResult.rows.length === 0) {
       return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
     }
    
     const user = userResult.rows[0]

     return NextResponse.json(user)
  } catch (error) {
     console.error('Erro ao buscar perfil:', error)
     return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error?.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
     const { name, email, currentPassword, newPassword } = await request.json()

     // Buscar usuário atual
     const userResult = await pool.query(
       'SELECT id, name, email, password_hash FROM users WHERE id = $1',
       [session.user.id]
     )

     if (userResult.rows.length === 0) {
       return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
     }
    
     const user = userResult.rows[0]

     // Verificar se o email já está em uso por outro usuário
     if (email !== user.email) {
       const existingUserResult = await pool.query(
         'SELECT id FROM users WHERE email = $1',
         [email]
       )

       if (existingUserResult.rows.length > 0) {
         return NextResponse.json({ error: 'Este email já está em uso' }, { status: 400 })
       }
     }

     // Preparar dados para atualização
     const updateData: UserUpdateData = {
       name,
       email
     }

     // Se uma nova senha foi fornecida, validar e atualizar
     if (newPassword) {
       if (!currentPassword) {
         return NextResponse.json({ error: 'Senha atual é obrigatória para alterar a senha' }, { status: 400 })
       }

       // Verificar senha atual
       const isCurrentPasswordValid = await comparePassword(currentPassword, user.password_hash)
       if (!isCurrentPasswordValid) {
         return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })
       }

       // Hash da nova senha
       const hashedNewPassword = await hashPassword(newPassword)
       updateData.password = hashedNewPassword
     }

     // Atualizar usuário
     let updatedUserResult
     if (updateData.password) {
       updatedUserResult = await pool.query(
         `UPDATE users 
         SET name = $1, email = $2, password_hash = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING id, name, email, created_at`,
         [updateData.name, updateData.email, updateData.password, session.user.id]
       )
     } else {
       updatedUserResult = await pool.query(
         `UPDATE users 
         SET name = $1, email = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING id, name, email, created_at`,
         [updateData.name, updateData.email, session.user.id]
       )
     }
    
     const updatedUser = updatedUserResult.rows[0]

     return NextResponse.json(updatedUser)
  } catch (error) {
     console.error('Erro ao atualizar perfil:', error)
     return NextResponse.json({ error: 'INTERNAL_ERROR', detail: error?.message }, { status: 500 });
  }
}

