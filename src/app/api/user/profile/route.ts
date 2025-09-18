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
    console.log('Iniciando busca de perfil do usuário...');
    
    // Verificar autenticação
    const session = await auth();
    console.log('Sessão:', session ? 'Encontrada' : 'Não encontrada');
    
    if (!session?.user?.id) {
      console.log('Erro: Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log('ID do usuário da sessão:', session.user.id);
    
    try {
      // Testar conexão com o banco de dados
      await pool.query('SELECT NOW()');
      console.log('Conexão com o banco de dados bem-sucedida');
      
      // Buscar usuário
      const userResult = await pool.query(
        'SELECT id, name, email, created_at FROM users WHERE id = $1',
        [session.user.id]
      );

      console.log('Resultado da consulta:', userResult.rows);

      if (userResult.rows.length === 0) {
        console.log('Erro: Nenhum usuário encontrado com o ID fornecido');
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
      }
      
      const user = userResult.rows[0];
      console.log('Usuário encontrado:', { id: user.id, email: user.email });

      return NextResponse.json(user);
    } catch (dbError) {
      console.error('Erro no banco de dados:', dbError);
      return NextResponse.json(
        { 
          error: 'DATABASE_ERROR', 
          message: dbError.message,
          code: dbError.code,
          detail: dbError.detail
        }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { 
        error: 'INTERNAL_SERVER_ERROR',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, 
      { status: 500 }
    );
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

