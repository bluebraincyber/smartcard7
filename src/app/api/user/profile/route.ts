import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sql } from '@vercel/postgres'
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

     const userResult = await sql`
       SELECT id, name, email, created_at
       FROM users 
       WHERE id = ${session.user.id}
     `

     if (userResult.rows.length === 0) {
       return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
     }
    
     const user = userResult.rows[0]

     return NextResponse.json(user)
  } catch (error) {
     console.error('Erro ao buscar perfil:', error)
     return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
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
     const userResult = await sql`
       SELECT id, name, email, password_hash FROM users 
       WHERE id = ${session.user.id}
     `

     if (userResult.rows.length === 0) {
       return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
     }
    
     const user = userResult.rows[0]

     // Verificar se o email já está em uso por outro usuário
     if (email !== user.email) {
       const existingUserResult = await sql`
         SELECT id FROM users WHERE email = ${email}
       `

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
       updatedUserResult = await sql`
         UPDATE users 
         SET name = ${updateData.name}, email = ${updateData.email}, password_hash = ${updateData.password}, updated_at = NOW()
         WHERE id = ${session.user.id}
         RETURNING id, name, email, created_at
       `
     } else {
       updatedUserResult = await sql`
         UPDATE users 
         SET name = ${updateData.name}, email = ${updateData.email}, updated_at = NOW()
         WHERE id = ${session.user.id}
         RETURNING id, name, email, created_at
       `
     }
    
     const updatedUser = updatedUserResult.rows[0]

     return NextResponse.json(updatedUser)
  } catch (error) {
     console.error('Erro ao atualizar perfil:', error)
     return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

