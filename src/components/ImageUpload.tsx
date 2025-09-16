'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  onUpload: (url: string) => void
  onRemove?: () => void
  currentImage?: string
  type: 'store' | 'item' | 'category'
  storeid: string
  className?: string
  placeholder?: string
  variant?: 'large' | 'medium' | 'small' | 'compact'
}

export default function ImageUpload({
  onUpload,
  onRemove,
  currentImage,
  type,
  storeid,
  className = '',
  placeholder = 'Clique para adicionar uma imagem',
  variant = 'medium'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Definir classes baseadas na variante
  const getVariantClasses = () => {
    switch (variant) {
      case 'large':
        return {
          container: 'w-full aspect-square max-w-sm mx-auto',
          icon: 'h-12 w-12',
          text: 'text-base',
          subtext: 'text-sm'
        }
      case 'medium':
        return {
          container: 'w-full aspect-square max-w-xs mx-auto',
          icon: 'h-8 w-8',
          text: 'text-sm',
          subtext: 'text-xs'
        }
      case 'small':
        return {
          container: 'w-full aspect-square max-w-[120px] mx-auto',
          icon: 'h-6 w-6',
          text: 'text-xs',
          subtext: 'text-xs'
        }
      case 'compact':
        return {
          container: 'w-full aspect-square max-w-[80px] mx-auto',
          icon: 'h-4 w-4',
          text: 'text-xs',
          subtext: 'text-xs'
        }
      default:
        return {
          container: 'w-full aspect-square',
          icon: 'h-8 w-8',
          text: 'text-sm',
          subtext: 'text-xs'
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
        <div className="relative group">
          <div className={`relative ${variantClasses.container} rounded-lg overflow-hidden border-2 border-gray-200`}>
            <Image
              src={currentImage || '/images/placeholder.png'}
              alt="Current product image"
              fill={true}
              className="object-cover"
              priority={true}
            />
            
            {/* Overlay com botões - dentro do container da imagem */}
            <div className={`absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              variant === 'compact' || variant === 'small' ? 'hidden sm:flex' : 'flex'
            }`}>
              <div className="flex space-x-2">
                <button
                  onClick={handleClick}
                  className={`bg-white text-gray-700 rounded text-xs font-medium hover:bg-gray-50 flex items-center shadow-sm ${
                    variant === 'compact' ? 'px-2 py-1' : 'px-3 py-1.5'
                  }`}
                  disabled={uploading}
                  type="button"
                >
                  <Upload className={`${variant === 'compact' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
                  Trocar
                </button>
                <button
                  onClick={handleRemove}
                  className={`bg-brand-blue text-white rounded text-xs font-medium hover:bg-brand-blue/90 flex items-center shadow-sm ${
                    variant === 'compact' ? 'px-2 py-1' : 'px-3 py-1.5'
                  }`}
                  type="button"
                >
                  <X className={`${variant === 'compact' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
                  Remover
                </button>
              </div>
            </div>
          </div>
          
          {/* Indicador mobile para variantes pequenas */}
          {(variant === 'compact' || variant === 'small') && (
            <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs sm:hidden">
              <Upload className="h-2 w-2" />
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
            ${variantClasses.container} border-2 border-dashed rounded-lg cursor-pointer transition-colors
            flex flex-col items-center justify-center space-y-1
            ${dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          {uploading ? (
            <>
              <Loader2 className={`${variantClasses.icon} text-blue-500 animate-spin`} />
              <p className={`${variantClasses.text} text-gray-600`}>Fazendo upload...</p>
            </>
          ) : (
            <>
              <ImageIcon className={`${variantClasses.icon} text-gray-400`} />
              <p className={`${variantClasses.text} text-gray-600 text-center px-2`}>
                {variant === 'compact' ? 'Imagem' : placeholder}
              </p>
              {variant !== 'compact' && (
                <>
                  <p className={`${variantClasses.subtext} text-gray-500 text-center`}>
                    {variant === 'small' ? 'Clique aqui' : 'Arraste e solte ou clique para selecionar'}
                  </p>
                  <p className={`${variantClasses.subtext} text-gray-400 text-center`}>
                    JPEG, PNG ou WebP (máx. 5MB)
                  </p>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
