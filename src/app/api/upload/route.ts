import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync, unlinkSync } from 'fs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    const type = data.get('type') as string // 'store', 'item', 'category'
    const storeid = data.get('storeid') as string

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.' },
        { status: 400 }
      )
    }

    // Validar tamanho (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo: 5MB.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Criar diretório se não existir
    const uploadDir = join(process.cwd(), 'public', 'uploads', type)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${session.user.id}_${storeid}_${timestamp}.${extension}`
    const filepath = join(uploadDir, filename)

    // Salvar arquivo
    await writeFile(filepath, buffer)

    // Retornar URL pública
    const publicUrl = `/uploads/${type}/${filename}`

    return NextResponse.json({
      url: publicUrl,
      filename,
      size: file.size,
      type: file.type
    })
  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Endpoint para deletar imagens
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    const type = searchParams.get('type')

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

    const filepath = join(process.cwd(), 'public', 'uploads', type, filename)
    
    if (existsSync(filepath)) {
      unlinkSync(filepath)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

