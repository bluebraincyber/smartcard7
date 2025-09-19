'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

type VariantType = 'large' | 'medium' | 'small' | 'compact'

interface VariantClasses {
  container: string
  icon: string
  text: string
  subtext: string
  button: string
}

interface ImageUploadProps {
  onUpload: (url: string) => void
  onRemove?: () => void
  currentImage?: string
  type: 'store' | 'item' | 'category'
  storeid: string
  className?: string
  placeholder?: string
  variant?: VariantType
}

export default function ImageUpload({
  onUpload,
  onRemove,
  currentImage,
  type,
  storeid,
  className = '',
  placeholder = 'Clique para adicionar uma imagem',
  variant = 'medium' as const
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Definir classes baseadas na variante
  const getVariantClasses = (): VariantClasses => {
    switch (variant) {
      case 'large':
        return {
          container: 'w-full aspect-square max-w-sm mx-auto',
          icon: 'h-12 w-12',
          text: 'text-base',
          subtext: 'text-sm',
          button: 'px-4 py-2 text-sm'
        }
      case 'medium':
        return {
          container: 'w-full aspect-square max-w-[180px] sm:max-w-[220px]',
          icon: 'h-8 w-8',
          text: 'text-sm',
          subtext: 'text-xs',
          button: 'px-3 py-1.5 text-xs'
        }
      case 'small':
        return {
          container: 'w-full aspect-square max-w-[100px]',
          icon: 'h-6 w-6',
          text: 'text-xs',
          subtext: 'text-xs',
          button: 'px-2.5 py-1 text-xs'
        }
      case 'compact':
        return {
          container: 'w-full aspect-square max-w-[80px]',
          icon: 'h-4 w-4',
          text: 'text-xs',
          subtext: 'text-[10px]',
          button: 'px-2 py-1 text-xs'
        }
      default:
        return {
          container: 'w-full aspect-square',
          icon: 'h-8 w-8',
          text: 'text-sm',
          subtext: 'text-xs',
          button: 'px-3 py-1.5 text-sm'
        }
    }
  }

  const variantClasses = getVariantClasses()

  const handleFileSelect = async (file: File) => {
    if (!file) return

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de arquivo não suportado. Use JPEG, PNG ou WebP.')
      return
    }

    // Validar tamanho (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('Arquivo muito grande. Tamanho máximo: 5MB.')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type || 'item') // Garantir que type não seja undefined
      formData.append('storeid', storeid || 'default') // Garantir que storeid não seja undefined

      console.log('📤 Enviando upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadType: type || 'item',
        storeId: storeid || 'default'
      })

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      console.log('📡 Resposta do upload:', response.status, response.statusText)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Upload bem-sucedido:', data)
        onUpload(data.url)
      } else {
        const errorText = await response.text()
        console.error('❌ Erro no upload:', response.status, errorText)
        
        try {
          const error = JSON.parse(errorText)
          alert(error.error || `Erro ao fazer upload da imagem (${response.status})`)
        } catch {
          alert(`Erro ao fazer upload da imagem (${response.status}): ${errorText}`)
        }
      }
    } catch (error) {
      console.error('❌ Erro de rede no upload:', error)
      alert('Erro de conexão ao fazer upload da imagem')
    } finally {
      setUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleRemove = async () => {
    if (currentImage && onRemove) {
      // Extrair filename da URL
      const filename = currentImage.split('/').pop()
      if (filename) {
        try {
          await fetch(`/api/upload?filename=${filename}&type=${type}`, {
            method: 'DELETE',
          })
        } catch (error) {
          console.error('Erro ao deletar imagem:', error)
        }
      }
      onRemove()
    }
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileSelect(file)
        }}
        className="hidden"
      />
      
      {currentImage ? (
        <div className="relative group w-full h-full">
          <div className={`relative ${variantClasses.container} rounded-lg overflow-hidden border border-gray-200 shadow-sm`}>
            <Image
              src={currentImage || '/images/placeholder.png'}
              alt="Current product image"
              fill={true}
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 640px) 200px, 280px"
              priority={true}
            />
            
            {/* Overlay com botões - dentro do container da imagem */}
            <div 
              className={`absolute inset-0 flex items-end sm:items-center justify-center bg-gradient-to-t sm:bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 ${
                variant === 'compact' || variant === 'small' ? 'pb-2' : 'pb-3 sm:pb-0'
              }`}
            >
              <div className={`flex flex-col sm:flex-row gap-2 p-2 w-full ${variant === 'medium' || variant === 'large' ? 'sm:px-4' : ''} justify-center`}>
                <button
                  onClick={handleClick}
                  className={`bg-white text-gray-800 rounded-md font-medium hover:bg-gray-50 flex items-center justify-center shadow-sm ${variantClasses.button} transition-colors whitespace-nowrap`}
                  disabled={uploading}
                  type="button"
                >
                  {uploading ? (
                    <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                  ) : (
                    <Upload className="h-3 w-3 mr-1.5" />
                  )}
                  {uploading ? 'Enviando...' : 'Trocar'}
                </button>
                <button
                  onClick={handleRemove}
                  className="bg-red-600 text-white rounded-md font-medium hover:bg-red-700 flex items-center justify-center shadow-sm transition-colors whitespace-nowrap text-xs px-3 py-1.5"
                  type="button"
                >
                  <X className="h-3 w-3 mr-1.5" />
                  Remover
                </button>
              </div>
            </div>
          </div>
          
          {/* Indicador mobile para variantes pequenas */}
          {(variant === 'compact' || variant === 'small') && (
            <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs sm:hidden shadow-sm">
              <Upload className="h-3 w-3" />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            ${variantClasses.container} border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
            flex flex-col items-center justify-center space-y-1.5 p-2
            ${
              dragOver
                ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-100'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
            }
            ${uploading ? 'pointer-events-none' : ''}
            bg-white/50 backdrop-blur-sm
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center space-y-2 p-2 text-center">
              <Loader2 className={`${variantClasses.icon} text-blue-500 animate-spin`} />
              <div className="space-y-0.5">
                <p className={`${variantClasses.text} font-medium text-gray-700`}>Enviando imagem...</p>
                <p className={`${variantClasses.subtext} text-gray-500`}>Aguarde um momento</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-1.5 p-1 text-center">
              <div className="relative">
                <ImageIcon className={`${variantClasses.icon} text-gray-400 mb-1`} />
                {dragOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-50/50 rounded-full">
                    <Upload className="h-4 w-4 text-blue-500" />
                  </div>
                )}
              </div>
              <p className={`${variantClasses.text} font-medium text-gray-700`}>
                {variant === 'compact' ? 'Adicionar imagem' : placeholder}
              </p>
              {variant !== 'compact' && (
                <div className="space-y-0.5">
                  <p className={`${variantClasses.subtext} text-gray-500`}>
                    {variant === 'small' ? 'Clique para selecionar' : 'Arraste e solte uma imagem'}
                  </p>
                  <p className={`${variantClasses.subtext} text-gray-400`}>
                    {variant === 'small' ? 'JPEG, PNG, WebP' : 'Formatos: JPEG, PNG, WebP (máx. 5MB)'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
