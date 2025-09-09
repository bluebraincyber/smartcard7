import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { readFile, stat } from 'fs/promises'
import { existsSync } from 'fs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params
    const pathArray = resolvedParams.path || []
    
    // Construir caminho do arquivo
    const filePath = join(process.cwd(), 'public', 'uploads', ...pathArray)
    
    // Verificar se arquivo existe
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 })
    }

    // Ler arquivo
    const fileBuffer = await readFile(filePath)
    const stats = await stat(filePath)
    
    // Determinar tipo de conteúdo
    const extension = pathArray[pathArray.length - 1]?.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'png':
        contentType = 'image/png'
        break
      case 'webp':
        contentType = 'image/webp'
        break
      case 'gif':
        contentType = 'image/gif'
        break
    }

    // Retornar arquivo com headers apropriados
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache por 1 ano
        'Last-Modified': stats.mtime.toUTCString(),
      },
    })
  } catch (error) {
    console.error('Erro ao servir imagem:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}