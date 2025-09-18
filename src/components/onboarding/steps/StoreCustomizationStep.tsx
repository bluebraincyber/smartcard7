'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ImageIcon, Palette, Image as ImageIcon2, User } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'

interface StoreCustomizationStepProps {
  initialData?: {
    primaryColor: string
    coverImage?: string
    profileImage?: string
    logoImage?: string
  }
  onDataChange: (data: {
    primaryColor: string
    coverImage?: string
    profileImage?: string
    logoImage?: string
    coverImageFile?: File
    profileImageFile?: File
    logoImageFile?: File
    isValid: boolean
  }) => void
}

export function StoreCustomizationStep({ 
  initialData, 
  onDataChange 
}: StoreCustomizationStepProps) {
  const [formData, setFormData] = useState({
    primaryColor: initialData?.primaryColor || '#3b82f6',
    coverImage: initialData?.coverImage || '',
    profileImage: initialData?.profileImage || '',
    logoImage: initialData?.logoImage || '',
    showColorPicker: false,
    activeTab: 'cover' as 'cover' | 'profile' | 'logo'
  })

  // Arquivos para upload
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [logoImageFile, setLogoImageFile] = useState<File | null>(null)

  // Notificar mudanças no formulário
  useEffect(() => {
    const isValid = true // Esta etapa é sempre válida, pois tem valores padrão
    
    onDataChange({
      primaryColor: formData.primaryColor,
      coverImage: formData.coverImage,
      profileImage: formData.profileImage,
      logoImage: formData.logoImage,
      coverImageFile: coverImageFile || undefined,
      profileImageFile: profileImageFile || undefined,
      logoImageFile: logoImageFile || undefined,
      isValid
    })
  }, [formData, coverImageFile, profileImageFile, logoImageFile])

  // Configuração do dropzone para upload de imagens
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const reader = new FileReader()
      
      reader.onload = () => {
        const imageUrl = reader.result as string
        
        if (formData.activeTab === 'cover') {
          setFormData(prev => ({ ...prev, coverImage: imageUrl }))
          setCoverImageFile(file)
        } else if (formData.activeTab === 'profile') {
          setFormData(prev => ({ ...prev, profileImage: imageUrl }))
          setProfileImageFile(file)
        } else {
          setFormData(prev => ({ ...prev, logoImage: imageUrl }))
          setLogoImageFile(file)
        }
      }
      
      reader.readAsDataURL(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1
  })

  const removeImage = () => {
    if (formData.activeTab === 'cover') {
      setFormData(prev => ({ ...prev, coverImage: '' }))
      setCoverImageFile(null)
    } else if (formData.activeTab === 'profile') {
      setFormData(prev => ({ ...prev, profileImage: '' }))
      setProfileImageFile(null)
    } else {
      setFormData(prev => ({ ...prev, logoImage: '' }))
      setLogoImageFile(null)
    }
  }

  const getActiveImage = () => {
    if (formData.activeTab === 'cover') return formData.coverImage
    if (formData.activeTab === 'profile') return formData.profileImage
    return formData.logoImage
  }

  const hasActiveImage = Boolean(getActiveImage())

  return (
    <div className="space-y-8">
      {/* Seletor de abas */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, activeTab: 'cover' }))}
            className={cn(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              formData.activeTab === 'cover'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground'
            )}
          >
            <div className="flex items-center">
              <ImageIcon2 className="mr-2 h-4 w-4" />
              Capa
            </div>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, activeTab: 'profile' }))}
            className={cn(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              formData.activeTab === 'profile'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground'
            )}
          >
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Foto de Perfil
            </div>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, activeTab: 'logo' }))}
            className={cn(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              formData.activeTab === 'logo'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-muted-foreground hover:text-foreground'
            )}
          >
            <div className="flex items-center">
              <ImageIcon2 className="mr-2 h-4 w-4" />
              Logo
            </div>
          </button>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Preview */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-medium mb-4">Prévia</h3>
          
          <div 
            className="relative rounded-xl overflow-hidden border border-border bg-card shadow-sm"
            style={{
              // Altura baseada no tipo de imagem
              height: formData.activeTab === 'cover' ? '240px' : '200px',
              backgroundColor: formData.primaryColor + '20' // Adiciona transparência
            }}
          >
            {/* Capa */}
            {formData.activeTab === 'cover' ? (
              <div className="relative w-full h-full">
                {formData.coverImage ? (
                  <>
                    <img 
                      src={formData.coverImage} 
                      alt="Capa da loja"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                      <div className="flex items-center">
                        {formData.profileImage && (
                          <div className="relative w-16 h-16 rounded-full border-2 border-white overflow-hidden mr-4">
                            <img 
                              src={formData.profileImage} 
                              alt="Perfil da loja"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h2 className="text-xl font-bold text-white">Nome da Loja</h2>
                          <p className="text-white/80 text-sm">Descrição da loja</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted/30">
                    <div className="text-center p-6">
                      <ImageIcon2 className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        {isDragActive 
                          ? 'Solte a imagem aqui...' 
                          : 'Nenhuma imagem de capa selecionada'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : formData.activeTab === 'profile' ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="relative">
                  {formData.profileImage ? (
                    <div className="relative w-40 h-40 rounded-full border-4 border-white shadow-lg overflow-hidden">
                      <img 
                        src={formData.profileImage} 
                        alt="Perfil da loja"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-40 h-40 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
                      <div className="text-center">
                        <User className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-xs text-muted-foreground">
                          {isDragActive ? 'Solte a imagem aqui...' : 'Sem foto de perfil'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {formData.logoImage ? (
                  <div className="p-8 bg-white rounded-lg shadow-sm">
                    <img 
                      src={formData.logoImage} 
                      alt="Logo da loja"
                      className="h-24 w-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-border rounded-lg bg-muted/30">
                    <div className="text-center">
                      <ImageIcon2 className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        {isDragActive ? 'Solte o logo aqui...' : 'Nenhum logo selecionado'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Área de upload */}
          <div 
            {...getRootProps()} 
            className={cn(
              'mt-4 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50 hover:bg-muted/30'
            )}
          >
            <input {...getInputProps()} />
            <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              {isDragActive 
                ? 'Solte a imagem aqui...' 
                : `Arraste uma imagem ou clique para ${formData.activeTab === 'cover' ? 'enviar uma capa' : formData.activeTab === 'profile' ? 'enviar uma foto de perfil' : 'enviar um logo'}`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PNG, JPG, WEBP (máx. 5MB)
            </p>
          </div>

          {hasActiveImage && (
            <div className="mt-4">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={removeImage}
              >
                Remover {formData.activeTab === 'cover' ? 'capa' : formData.activeTab === 'profile' ? 'foto de perfil' : 'logo'}
              </Button>
            </div>
          )}
        </div>

        {/* Configurações de cor */}
        <div>
          <h3 className="text-lg font-medium mb-4">Cores da Loja</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="primaryColor">Cor Principal</Label>
              <div className="mt-1 flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-md border border-border cursor-pointer"
                  style={{ backgroundColor: formData.primaryColor }}
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    showColorPicker: !prev.showColorPicker 
                  }))}
                />
                <Input
                  id="primaryColor"
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      primaryColor: e.target.value 
                    }))
                  }
                  className="w-32 font-mono text-sm"
                />
              </div>
              
              {formData.showColorPicker && (
                <div className="mt-4 p-4 border rounded-lg">
                  <HexColorPicker 
                    color={formData.primaryColor} 
                    onChange={(color) => 
                      setFormData(prev => ({ ...prev, primaryColor: color }))
                    } 
                  />
                  <div className="mt-4 flex justify-end">
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="outline"
                      onClick={() => 
                        setFormData(prev => ({ 
                          ...prev, 
                          showColorPicker: false 
                        }))
                      }
                    >
                      OK
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Sugestões de cores:</h4>
              <div className="grid grid-cols-5 gap-2">
                {[
                  '#3b82f6', // blue-500
                  '#8b5cf6', // violet-500
                  '#ec4899', // pink-500
                  '#10b981', // emerald-500
                  '#f59e0b', // amber-500
                  '#ef4444', // red-500
                  '#14b8a6', // teal-500
                  '#8b5cf6', // purple-500
                  '#f97316', // orange-500
                  '#06b6d4'  // cyan-500
                ].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-8 h-8 rounded-md border border-border hover:ring-2 hover:ring-offset-2 hover:ring-primary transition-all"
                    style={{ backgroundColor: color }}
                    onClick={() => 
                      setFormData(prev => ({
                        ...prev,
                        primaryColor: color,
                        showColorPicker: false
                      }))
                    }
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
