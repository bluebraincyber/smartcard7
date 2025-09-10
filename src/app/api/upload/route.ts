import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import type { Session } from 'next-auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando upload de imagem...')
    
    const session = await getServerSession(authOptions) as Session | null
    console.log('👤 Sessão:', session?.user?.id ? 'Autenticado' : 'Não autenticado')
    
    if (!session?.user?.id) {
      console.log('❌ Usuário não autenticado')
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    let data
    try {
      data = await request.formData()
      console.log('📄 FormData recebido')
    } catch (error) {
      console.error('❌ Erro ao processar FormData:', error)
      return NextResponse.json({ error: 'Erro ao processar formulário' }, { status: 400 })
    }

    const file: File | null = data.get('file') as unknown as File
    const type = data.get('type') as string || 'item'
    const storeid = data.get('storeid') as string || 'default'

    console.log('📊 Dados recebidos:', { 
      hasFile: !!file, 
      fileName: file?.name, 
      fileSize: file?.size, 
      fileType: file?.type, 
      type, 
      storeid 
    })

    if (!file) {
      console.log('❌ Nenhum arquivo enviado')
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Tipo de arquivo não suportado:', file.type)
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.' },
        { status: 400 }
      )
    }

    // Validar tamanho (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      console.log('❌ Arquivo muito grande:', file.size, 'bytes')
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo: 5MB.' },
        { status: 400 }
      )
    }

    console.log('✅ Validações passaram, processando arquivo...')

    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      console.log('📦 Buffer criado:', buffer.length, 'bytes')

      // Criar diretório se não existir
      const uploadDir = join(process.cwd(), 'public', 'uploads', type)
      console.log('📁 Verificando diretório de upload:', uploadDir)
      
      if (!existsSync(uploadDir)) {
        try {
          await mkdir(uploadDir, { recursive: true })
          console.log('✅ Diretório criado com sucesso:', uploadDir)
        } catch (mkdirError) {
          console.error('❌ Erro ao criar diretório:', mkdirError)
          throw new Error(`Erro ao criar diretório: ${mkdirError instanceof Error ? mkdirError.message : 'Erro desconhecido'}`)
        }
      } else {
        console.log('✅ Diretório já existe:', uploadDir)
      }

      // Verificar permissões de escrita
      try {
        const { access, constants } = await import('fs/promises')
        await access(uploadDir, constants.W_OK)
        console.log('✅ Permissões de escrita verificadas')
      } catch (permError) {
        console.error('❌ Sem permissão de escrita:', permError)
        throw new Error('Sem permissão de escrita no diretório de upload')
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now()
      const extension = file.name.split('.').pop()
      const filename = `${session.user.id}_${storeid}_${timestamp}.${extension}`
      const filepath = join(uploadDir, filename)

      // Salvar arquivo fisicamente
      try {
        await writeFile(filepath, buffer)
        console.log('💾 Arquivo salvo com sucesso:', filepath)
        
        // Verificar se o arquivo foi realmente criado
        if (!existsSync(filepath)) {
          throw new Error('Arquivo não foi criado no sistema de arquivos')
        }
        
        console.log('✅ Arquivo verificado no sistema de arquivos')
      } catch (writeError) {
        console.error('❌ Erro ao escrever arquivo:', writeError)
        throw new Error(`Erro ao salvar arquivo: ${writeError instanceof Error ? writeError.message : 'Erro desconhecido'}`)
      }

      // Retornar URL pública através da API de imagens
      const publicUrl = `/api/uploads/${type}/${filename}`
      console.log('🎉 Upload concluído com sucesso:', publicUrl)

      return NextResponse.json({
        url: publicUrl,
        filename,
        size: file.size,
        type: file.type
      })

    } catch (fileError) {
      console.error('❌ Erro ao processar arquivo:', fileError)
      
      // Fallback: retornar placeholder image válida
      const placeholderUrl = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Imagem+do+Produto'
      console.log('🔄 Usando placeholder:', placeholderUrl)
      
      return NextResponse.json({
        url: placeholderUrl,
        filename: 'placeholder.png',
        size: file.size,
        type: file.type,
        fallback: true
      })
    }

  } catch (error) {
    console.error('❌ Erro geral no upload:', error)
    
    // Fallback final
    const placeholderUrl = 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Erro+Upload'
    return NextResponse.json({
      url: placeholderUrl,
      filename: 'error-placeholder.png',
      size: 0,
      type: 'image/png',
      fallback: true,
      error: 'Upload failed, using placeholder'
    })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Solicitação de exclusão de imagem')
    
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    const type = searchParams.get('type')

    console.log('📊 Parâmetros de exclusão:', { filename, type })

    if (!filename || !type) {
      return NextResponse.json(
        { error: 'Parâmetros filename e type são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o arquivo pertence ao usuário
    if (!filename.startsWith(session.user.id)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    try {
      const { unlinkSync } = await import('fs')
      const filepath = join(process.cwd(), 'public', 'uploads', type, filename)
      
      if (existsSync(filepath)) {
        unlinkSync(filepath)
        console.log('✅ Arquivo excluído:', filepath)
      }
    } catch (deleteError) {
      console.warn('⚠️ Erro ao excluir arquivo físico:', deleteError)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Erro ao deletar arquivo:', error)
    return NextResponse.json({ 
      error: 'INTERNAL_ERROR', 
      detail: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 })
  }
}