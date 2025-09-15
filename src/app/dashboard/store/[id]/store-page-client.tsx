'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import StoreSelector from '@/components/store/StoreSelector'
import { ArrowLeft, Plus, Edit, Trash2, Eye, ExternalLink, Check, X, Loader2 as LoaderIcon, Pencil, Camera, Upload, Copy, MoreVertical } from 'lucide-react'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import ProductEditModal from '@/components/ui/ProductEditModal'
import ProductCreateModal from '@/components/ui/ProductCreateModal'
import { AdminProductCard } from '@/components/ui/AdminProductCard'
import ImageUpload from '@/components/ImageUpload'

interface Store {
  id: string
  name: string
  slug: string
  description?: string
  whatsapp: string
  address?: string
  primaryColor: string
  isactive: boolean
  image?: string
  coverImage?: string
  profileImage?: string
  categories: Category[]
}

interface Category {
  id: string
  name: string
  isactive: boolean
  items: Item[]
}

interface Item {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  isactive: boolean
  isarchived: boolean
}

interface StorePageClientProps {
  store: Store
}

export default function StorePageClient({ store: initialStore }: StorePageClientProps) {
  const router = useRouter()
  const [store, setStore] = useState<Store>({
    ...initialStore,
    categories: initialStore.categories?.map(category => ({
      ...category,
      items: category.items || []
    })) || []
  })

  // Estados para inline editing
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{
    name: string
    whatsapp: string
    address: string
    description: string
    slug: string
    primaryColor: string
    businessType: string
  }>({
    name: store.name,
    whatsapp: store.whatsapp || '',
    address: store.address || '',
    description: store.description || '',
    slug: store.slug,
    primaryColor: store.primaryColor || '#3B82F6',
    businessType: (store as any).businessType || 'general'
  })
  const [saving, setSaving] = useState(false)
  const [hasMultipleStores, setHasMultipleStores] = useState(false)
  
  // Check if user has multiple stores
  useEffect(() => {
    const checkMultipleStores = async () => {
      try {
        const response = await fetch('/api/stores')
        if (response.ok) {
          const data = await response.json()
          setHasMultipleStores(data.stores?.length > 1 || false)
        }
      } catch (error) {
        console.error('Error checking stores:', error)
      }
    }
    
    checkMultipleStores()
  }, [])
  
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean
    type: 'cover' | 'profile' | null
    currentImage?: string
  }>({ isOpen: false, type: null })
  
  // Estados para validação de slug
  const [slugValidation, setSlugValidation] = useState<{
    isChecking: boolean
    isValid: boolean
    message: string
  }>({ isChecking: false, isValid: true, message: '' })

  // Componente especializado para edição de slug
  const EditableSlugField = () => {
    const isEditing = editingField === 'slug'
    let timeoutId: NodeJS.Timeout

    const handleSlugChange = (value: string) => {
      const formattedSlug = formatSlug(value)
      setEditValues(prev => ({ ...prev, slug: formattedSlug }))
      
      // Debounce da validação
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        if (formattedSlug !== store.slug) {
          checkSlugAvailability(formattedSlug)
        }
      }, 500)
    }

    if (isEditing) {
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="flex items-center flex-1">
              <span className="text-gray-500 text-sm mr-1">/</span>
              <input
                type="text"
                value={editValues.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="minha-loja"
                className={`flex-1 px-2 py-1 text-sm rounded focus:outline-none focus:ring-2 ${
                  slugValidation.isValid 
                    ? 'border border-blue-300 focus:ring-blue-500' 
                    : 'border border-red-300 focus:ring-red-500'
                }`}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && slugValidation.isValid && !slugValidation.isChecking) {
                    saveInlineField('slug')
                  } else if (e.key === 'Escape') {
                    cancelInlineEdit()
                    setSlugValidation({ isChecking: false, isValid: true, message: '' })
                  }
                }}
              />
            </div>
            
            <button
              onClick={() => saveInlineField('slug')}
              disabled={saving || !slugValidation.isValid || slugValidation.isChecking}
              className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
              title="Salvar (Enter)"
            >
              {saving ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </button>
            
            <button
              onClick={() => {
                cancelInlineEdit()
                setSlugValidation({ isChecking: false, isValid: true, message: '' })
              }}
              disabled={saving}
              className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
              title="Cancelar (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Feedback de validação */}
          {(slugValidation.message || slugValidation.isChecking) && (
            <div className={`flex items-center space-x-1 text-xs ${
              slugValidation.isChecking 
                ? 'text-blue-600' 
                : slugValidation.isValid 
                  ? 'text-green-600' 
                  : 'text-red-600'
            }`}>
              {slugValidation.isChecking && <LoaderIcon className="h-3 w-3 animate-spin" />}
              {!slugValidation.isChecking && slugValidation.isValid && <Check className="h-3 w-3" />}
              {!slugValidation.isChecking && !slugValidation.isValid && <X className="h-3 w-3" />}
              <span>{slugValidation.message}</span>
            </div>
          )}
        </div>
      )
    }
    
    return (
      <div 
        className="group flex items-center space-x-2 cursor-pointer hover:bg-blue-50 rounded px-2 py-1 -mx-2 -my-1"
        onClick={() => startInlineEdit('slug')}
      >
        <span className="flex-1 text-sm text-gray-600">
          /<span className="font-medium text-gray-900">{store.slug}</span>
        </span>
        <Pencil className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    )
  }

  // Componente Card Novo Item
  const AddItemCard = ({ categoryId, categoryName }: { categoryId: string, categoryName: string }) => {
    return (
      <div
        onClick={() => setCreateModal({ isOpen: true, categoryId, categoryName })}
        className="group cursor-pointer transition-all duration-200 bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-500 overflow-hidden shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-300/60 hover:-translate-y-0.5"
      >
        {/* HEADER DE MÍDIA — mesma estrutura do AdminProductCard */}
        <div className="relative w-full bg-gray-50 rounded-t-2xl overflow-hidden">
          <div className="relative w-full aspect-square bg-gray-50 flex flex-col items-center justify-center group-hover:bg-blue-50 transition-colors duration-200">
            {/* Círculo com ícone Plus */}
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 group-hover:border-blue-500 group-hover:bg-blue-50 flex items-center justify-center transition-all duration-200 group-hover:scale-105 mb-2">
              <Plus className="h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
            </div>
            
            {/* Botão Adicionar abaixo do ícone */}
            <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 group-hover:bg-blue-100 text-gray-600 group-hover:text-blue-600 text-xs font-medium transition-all duration-200">
              Adicionar
            </div>
          </div>
        </div>

        {/* Conteúdo do card — mesma estrutura do AdminProductCard */}
        <div className="p-3">
          {/* Nome e descrição */}
          <div className="mb-2">
            <h3 className="font-semibold text-gray-700 group-hover:text-blue-600 text-base leading-tight mb-1 transition-colors duration-200">
              Novo Produto
            </h3>
            <p className="text-gray-500 group-hover:text-blue-500 text-xs line-clamp-1 leading-relaxed transition-colors duration-200">
              Clique para adicionar produto
            </p>
          </div>

          {/* Espaço para preço (vazio mas mantém layout) */}
          <div className="mb-3">
            <div className="h-6 flex items-center">
              <span className="text-xs text-gray-400 group-hover:text-blue-400 transition-colors duration-200 italic">
                Configure nome e preço
              </span>
            </div>
          </div>

          {/* Status badge centralizado */}
          <div className="flex items-center justify-center mb-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 group-hover:bg-blue-100 transition-colors duration-200">
              Novo Item
            </span>
          </div>

          {/* Espaço vazio para manter alinhamento com outros cards */}
          <div className="h-8"></div>
        </div>
      </div>
    )
  }

  // Componente Toggle Switch moderno
  const ToggleSwitch = ({ 
    enabled, 
    onChange, 
    disabled = false,
    size = 'sm' 
  }: {
    enabled: boolean
    onChange: (enabled: boolean) => void
    disabled?: boolean
    size?: 'xs' | 'sm' | 'md'
  }) => {
    const sizeClasses = {
      xs: 'w-8 h-4',
      sm: 'w-10 h-5', 
      md: 'w-12 h-6'
    }
    
    const knobClasses = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5'
    }
    
    return (
      <button
        type="button"
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`
          ${sizeClasses[size]} relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${enabled 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-gray-200 hover:bg-gray-300'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        role="switch"
        aria-checked={enabled}
      >
        <span className="sr-only">{enabled ? 'Desativar' : 'Ativar'}</span>
        <span
          className={`
            ${knobClasses[size]} inline-block rounded-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out
            ${enabled 
              ? size === 'xs' ? 'translate-x-4' : size === 'sm' ? 'translate-x-5' : 'translate-x-6'
              : 'translate-x-0'
            }
          `}
        />
      </button>
    )
  }
  const EditableColorField = () => {
    const isEditing = editingField === 'primaryColor'
    
    const colors = [
      '#EF4444', '#F97316', '#F59E0B', '#EAB308', 
      '#84CC16', '#22C55E', '#10B981', '#14B8A6',
      '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
      '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
      '#F43F5E', '#6B7280', '#374151', '#111827'
    ]
    
    if (isEditing) {
      return (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={editValues.primaryColor}
              onChange={(e) => setEditValues(prev => ({ ...prev, primaryColor: e.target.value }))}
              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={editValues.primaryColor}
              onChange={(e) => setEditValues(prev => ({ ...prev, primaryColor: e.target.value }))}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#3B82F6"
            />
            
            <button
              onClick={() => saveInlineField('primaryColor')}
              disabled={saving}
              className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
              title="Salvar"
            >
              {saving ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </button>
            
            <button
              onClick={cancelInlineEdit}
              disabled={saving}
              className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
              title="Cancelar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Paleta de cores pré-definidas */}
          <div className="grid grid-cols-10 gap-1 mt-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setEditValues(prev => ({ ...prev, primaryColor: color }))
                  saveInlineField('primaryColor')
                }}
                className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform ${
                  editValues.primaryColor === color ? 'border-gray-800' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )
    }
    
    return (
      <div 
        className="group flex items-center cursor-pointer hover:bg-blue-50 rounded px-2 py-1 -mx-2 -my-1"
        onClick={() => startInlineEdit('primaryColor')}
      >
        <div 
          className="w-4 h-4 rounded mr-2" 
          style={{ backgroundColor: store.primaryColor }}
        ></div>
        <span className="text-sm text-gray-900 flex-1">{store.primaryColor}</span>
        <Pencil className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    )
  }
  const EditableField = ({ 
    field, 
    value, 
    placeholder, 
    type = 'text',
    multiline = false,
    className = ''
  }: {
    field: string
    value: string
    placeholder: string
    type?: string
    multiline?: boolean
    className?: string
  }) => {
    const isEditing = editingField === field
    
    if (isEditing) {
      return (
        <div className={`flex items-center space-x-2 ${className}`}>
          {multiline ? (
            <textarea
              value={editValues[field as keyof typeof editValues]}
              onChange={(e) => setEditValues(prev => ({ ...prev, [field]: e.target.value }))}
              placeholder={placeholder}
              className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  saveInlineField(field)
                } else if (e.key === 'Escape') {
                  cancelInlineEdit()
                }
              }}
            />
          ) : (
            <input
              type={type}
              value={editValues[field as keyof typeof editValues]}
              onChange={(e) => setEditValues(prev => ({ ...prev, [field]: e.target.value }))}
              placeholder={placeholder}
              className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveInlineField(field)
                } else if (e.key === 'Escape') {
                  cancelInlineEdit()
                }
              }}
            />
          )}
          
          <button
            onClick={() => saveInlineField(field)}
            disabled={saving}
            className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
            title="Salvar (Enter)"
          >
            {saving ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </button>
          
          <button
            onClick={cancelInlineEdit}
            disabled={saving}
            className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
            title="Cancelar (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )
    }
    
    return (
      <div 
        className={`group flex items-center space-x-2 cursor-pointer hover:bg-blue-50 rounded px-2 py-1 -mx-2 -my-1 ${className}`}
        onClick={() => startInlineEdit(field)}
      >
        <span className={`flex-1 ${!value ? 'text-gray-500 italic' : ''}`}>
          {value || placeholder}
        </span>
        <Pencil className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    )
  }

  useEffect(() => {
    fetchStore()
  }, [])

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)
  const [categoryActionsOpen, setCategoryActionsOpen] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    onClose: () => void
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {}, onClose: () => {} })
  const [editModal, setEditModal] = useState<{
    isOpen: boolean
    product: Item | null
  }>({ isOpen: false, product: null })
  const [createModal, setCreateModal] = useState<{
    isOpen: boolean
    categoryId: string
    categoryName: string
  }>({ isOpen: false, categoryId: '', categoryName: '' })

  const fetchStore = async () => {
    try {
      const response = await fetch(`/api/stores/${store.id}`)
      if (response.ok) {
        const data = await response.json()
        setStore(data)
        // Atualizar editValues com os novos dados
        setEditValues({
          name: data.name,
          whatsapp: data.whatsapp || '',
          address: data.address || '',
          description: data.description || '',
          slug: data.slug,
          primaryColor: data.primaryColor || '#3B82F6',
          businessType: (data as any).businessType || 'general'
        })
      }
    } catch (error) {
      console.error('Erro ao recarregar loja:', error)
    }
  }

  // Funções para validação de slug
  const formatSlug = (value: string): string => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const validateSlugFormat = (slug: string): boolean => {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50
  }

  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug === store.slug) {
      setSlugValidation({ isChecking: false, isValid: true, message: '' })
      return true
    }

    if (!validateSlugFormat(slug)) {
      setSlugValidation({ 
        isChecking: false, 
        isValid: false, 
        message: 'URL deve ter 3-50 caracteres, apenas letras, números e hífens' 
      })
      return false
    }

    setSlugValidation({ isChecking: true, isValid: true, message: 'Verificando disponibilidade...' })

    try {
      const response = await fetch(`/api/stores/check-slug?slug=${encodeURIComponent(slug)}`)
      const result = await response.json()
      
      setSlugValidation({
        isChecking: false,
        isValid: result.available,
        message: result.message
      })
      
      return result.available
    } catch (error) {
      console.error('Erro ao verificar slug:', error)
      setSlugValidation({
        isChecking: false,
        isValid: false,
        message: 'Erro ao verificar disponibilidade'
      })
      return false
    }
  }
  const openImageModal = (type: 'cover' | 'profile') => {
    const currentImage = type === 'cover' 
      ? (store.coverImage || store.image) 
      : store.profileImage
    
    setImageModal({
      isOpen: true,
      type,
      currentImage
    })
  }

  const closeImageModal = () => {
    setImageModal({ isOpen: false, type: null })
  }

  const handleImageUpload = async (url: string) => {
    if (!imageModal.type) return

    const fieldName = imageModal.type === 'cover' ? 'coverImage' : 'profileImage'
    
    try {
      const response = await fetch(`/api/stores/${store.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [fieldName]: url
        }),
      })

      if (response.ok) {
        const updatedStore = await response.json()
        setStore(updatedStore)
        closeImageModal()
        console.log(`✅ ${imageModal.type} atualizada com sucesso`)
      }
    } catch (error) {
      console.error('💥 Erro ao atualizar imagem:', error)
    }
  }

  // Função para iniciar edição inline
  const startInlineEdit = (field: string) => {
    setEditingField(field)
  }

  // Função para cancelar edição inline
  const cancelInlineEdit = () => {
    setEditingField(null)
    // Restaurar valores originais
    setEditValues({
      name: store.name,
      whatsapp: store.whatsapp || '',
      address: store.address || '',
      description: store.description || '',
      slug: store.slug,
      primaryColor: store.primaryColor || '#3B82F6',
      businessType: (store as any).businessType || 'general'
    })
  }

  // Função para salvar campo inline
  const saveInlineField = async (field: string) => {
    // Validação especial para slug
    if (field === 'slug') {
      const isValid = await checkSlugAvailability(editValues.slug)
      if (!isValid) {
        return // Não salva se inválido
      }
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/stores/${store.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [field]: editValues[field as keyof typeof editValues]
        }),
      })

      if (response.ok) {
        const updatedStore = await response.json()
        setStore(updatedStore)
        setEditingField(null)
        // Limpar validação de slug
        if (field === 'slug') {
          setSlugValidation({ isChecking: false, isValid: true, message: '' })
        }
        console.log(`✅ Campo ${field} atualizado com sucesso`)
      } else {
        console.error('❌ Erro ao salvar campo:', response.status)
        cancelInlineEdit()
      }
    } catch (error) {
      console.error('💥 Erro ao salvar campo:', error)
      cancelInlineEdit()
    } finally {
      setSaving(false)
    }
  }

  const toggleStoreStatus = async () => {
    try {
      const response = await fetch(`/api/stores/${store.id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isactive: !store.isactive,
        }),
      })

      if (response.ok) {
        setStore({ ...store, isactive: !store.isactive })
      }
    } catch {
      console.error('Erro ao alternar status da loja')
    }
  }

  const toggleCategoryStatus = async (categoryId: string, isactive: boolean) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isactive: !isactive }),
      })

      if (response.ok) {
        fetchStore() // Recarregar dados
      }
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error)
    }
  }

  // Handler para o AdminProductCard - ativar/desativar
  const handleToggleActive = async (itemId: string, isActive: boolean) => {
    try {
      console.log('🔄 Alterando status do item:', itemId, 'para', isActive)
      
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isactive: isActive }),
      })

      if (response.ok) {
        const updatedItem = await response.json()
        console.log('✅ Item atualizado no servidor:', updatedItem)
        
        // Atualizar o estado local imediatamente
        setStore(prevStore => ({
          ...prevStore,
          categories: prevStore.categories.map(category => ({
            ...category,
            items: category.items.map(item => 
              item.id === itemId 
                ? { ...item, isactive: updatedItem.isactive }
                : item
            )
          }))
        }))
        
        console.log('✅ Estado local atualizado')
      } else {
        console.error('❌ Erro na resposta:', response.status)
      }
    } catch (error) {
      console.error('💥 Erro ao atualizar item:', error)
    }
  }

  // Handler para o AdminProductCard - pausar/retomar
  const handleTogglePause = async (itemId: string, isPaused: boolean) => {
    try {
      console.log('🔄 Alterando disponibilidade do item:', itemId, 'para Indisponível:', isPaused)
      
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isarchived: isPaused }),
      })

      if (response.ok) {
        const updatedItem = await response.json()
        console.log('✅ Item atualizado no servidor:', updatedItem)
        
        // Atualizar o estado local imediatamente
        setStore(prevStore => ({
          ...prevStore,
          categories: prevStore.categories.map(category => ({
            ...category,
            items: category.items.map(item => 
              item.id === itemId 
                ? { ...item, isarchived: updatedItem.isarchived }
                : item
            )
          }))
        }))
        
        console.log('✅ Estado local atualizado')
      } else {
        console.error('❌ Erro na resposta:', response.status)
      }
    } catch (error) {
      console.error('💥 Erro ao atualizar disponibilidade:', error)
    }
  }

  // Handler para o AdminProductCard - editar
  const handleEdit = (itemId: string) => {
    const item = store.categories
      .flatMap(cat => cat.items)
      .find(item => item.id === itemId)
    
    if (item) {
      setEditModal({ isOpen: true, product: item })
    }
  }

  // Handler para o AdminProductCard - duplicar
  const handleDuplicate = async (itemId: string) => {
    const item = store.categories
      .flatMap(cat => cat.items)
      .find(item => item.id === itemId)
    
    if (!item) return

    // Encontrar a categoria do item
    const category = store.categories.find(cat => 
      cat.items.some(i => i.id === itemId)
    )
    
    if (!category) return

    try {
      const payload = {
        name: `${item.name} (Cópia)`,
        description: item.description,
        price: item.price,
        image: item.image,
        isactive: item.isactive,
        isarchived: item.isarchived
      }

      const response = await fetch(`/api/stores/${store.id}/categories/${category.id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        console.log('✅ Item duplicado com sucesso')
        fetchStore() // Recarregar dados
      } else {
        console.error('❌ Erro ao duplicar:', response.status)
        const errorText = await response.text()
        console.error('❌ Detalhes do erro:', errorText)
      }
    } catch (error) {
      console.error('💥 Erro ao duplicar item:', error)
    }
  }

  // Handler para o AdminProductCard - excluir
  const handleDelete = async (itemId: string) => {
    const item = store.categories
      .flatMap(cat => cat.items)
      .find(item => item.id === itemId)
    
    if (!item) return

    setConfirmModal({
      isOpen: true,
      title: 'Excluir Item',
      message: `Tem certeza que deseja excluir o item "${item.name}"? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/items/${itemId}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            console.log('✅ Item excluído com sucesso')
            fetchStore() // Recarregar dados
          }
        } catch (error) {
          console.error('Erro ao excluir item:', error)
        }
        setConfirmModal({ ...confirmModal, isOpen: false })
      },
      onClose: () => setConfirmModal({ ...confirmModal, isOpen: false })
    })
  }

  const deleteCategory = async (categoryId: string) => {
    console.log('🗑️ Iniciando exclusão da categoria:', categoryId)
    setDeletingCategoryId(categoryId)
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        console.log('✅ Categoria deletada com sucesso')
        fetchStore() // Recarregar dados
      } else {
        const errorData = await response.json().catch(() => null)
        console.error('❌ Erro da API:', errorData)
      }
    } catch (error) {
      console.error('💥 Erro de rede ao deletar categoria:', error)
    } finally {
      setDeletingCategoryId(null)
    }
  }

  const duplicateCategory = async (categoryId: string) => {
    const categoryToDuplicate = store.categories.find(cat => cat.id === categoryId)
    if (!categoryToDuplicate) return

    try {
      const payload = {
        name: `${categoryToDuplicate.name} (Cópia)`,
        isactive: categoryToDuplicate.isactive
      }

      const response = await fetch(`/api/stores/${store.id}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        console.log('✅ Categoria duplicada com sucesso')
        fetchStore() // Recarregar dados
      } else {
        console.error('❌ Erro ao duplicar categoria:', response.status)
        const errorText = await response.text()
        console.error('❌ Detalhes do erro:', errorText)
      }
    } catch (error) {
      console.error('💥 Erro ao duplicar categoria:', error)
    }
  }

  // Handler para criar novo produto
  const handleCreateProduct = async (productData: {
    name: string
    description: string
    price: number
    image: string
    isactive: boolean
    isarchived: boolean
    categoryId: string
  }) => {
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: productData.name,
          description: productData.description || null,
          price: productData.price,
          image: productData.image || null,
          categoryId: parseInt(productData.categoryId),
          isactive: productData.isactive,
          isarchived: productData.isarchived,
          slug: store.slug
        }),
      })

      if (response.ok) {
        console.log('✅ Item criado com sucesso!')
        fetchStore() // Recarregar dados
      } else {
        const errorData = await response.json()
        console.log('❌ Erro na resposta:', response.status, errorData)
        throw new Error(errorData.error || 'Erro ao criar item')
      }
    } catch (error) {
      console.error('Erro ao criar item:', error)
      throw error
    }
  }

  const deleteStore = async () => {
    if (deleteConfirmText !== store.name) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/stores/${store.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Erro ao deletar loja:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/products"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white/80 hover:bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm border border-gray-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Seleção de Lojas
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/${store.slug}`}
                target="_blank"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white/90 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 backdrop-blur-sm"
              >
                <Eye className="mr-2 h-4 w-4" />
                Visualizar Loja
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="relative mb-8">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg mb-6">
              <div className="w-10 h-10 rounded-full" style={{ backgroundColor: store.primaryColor }}></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-20 rounded-full blur-xl scale-150"></div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            {store.name}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Gerencie categorias, produtos e configurações desta loja
          </p>
        </div>

        {/* Store Images Preview */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 mb-12">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Imagens da Loja</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Como sua loja aparece para os clientes
                </p>
              </div>
            </div>
          </div>
          
          {(store.image || store.coverImage || store.profileImage) ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Imagem de Capa - Editável */}
                {(store.coverImage || store.image) ? (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Imagem de Capa</h4>
                    <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50 group cursor-pointer" onClick={() => openImageModal('cover')}>
                      <img
                        src={store.coverImage || store.image}
                        alt="Imagem de capa da loja"
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay de edição */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                        <div className="bg-white text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center">
                          <Camera className="h-4 w-4 mr-2" />
                          Trocar Imagem
                        </div>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Aparece no topo da sua loja</p>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Imagem de Capa</h4>
                    <div 
                      className="relative aspect-video rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 cursor-pointer transition-colors flex items-center justify-center group"
                      onClick={() => openImageModal('cover')}
                    >
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 font-medium">Adicionar Capa</p>
                        <p className="text-xs text-gray-500">Clique para fazer upload</p>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Aparece no topo da sua loja</p>
                  </div>
                )}
                
                {/* Logo/Perfil - Editável */}
                {store.profileImage ? (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Logo/Perfil</h4>
                    <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50 max-w-[200px] group cursor-pointer" onClick={() => openImageModal('profile')}>
                      <img
                        src={store.profileImage}
                        alt="Logo da loja"
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay de edição */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                        <div className="bg-white text-gray-700 px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center">
                          <Camera className="h-3 w-3 mr-1" />
                          Trocar
                        </div>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Logo da sua empresa</p>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Logo/Perfil</h4>
                    <div 
                      className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 cursor-pointer transition-colors max-w-[200px] flex items-center justify-center group"
                      onClick={() => openImageModal('profile')}
                    >
                      <div className="text-center">
                        <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-600 font-medium">Adicionar Logo</p>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Logo da sua empresa</p>
                  </div>
                )}
                
                {/* Preview Card Combinado */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Preview da Loja</h4>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white max-w-[200px]">
                    {/* Header com capa */}
                    {(store.coverImage || store.image) && (
                      <div className="relative h-20 bg-gray-100">
                        <img
                          src={store.coverImage || store.image}
                          alt="Preview capa"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Conteúdo com logo */}
                    <div className="p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        {store.profileImage && (
                          <img
                            src={store.profileImage}
                            alt="Preview logo"
                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-900 truncate">{store.name}</p>
                          <p className="text-xs text-gray-500 truncate">smartcard.../{store.slug}</p>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded mb-1"></div>
                      <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Como aparece para clientes</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {/* Card Upload Capa */}
                <div 
                  className="relative aspect-video rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all group"
                  onClick={() => openImageModal('cover')}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Upload className="h-10 w-10 text-gray-400 group-hover:text-blue-500 mb-3 transition-colors" />
                    <h4 className="text-lg font-medium text-gray-900 mb-1">Imagem de Capa</h4>
                    <p className="text-sm text-gray-600 text-center px-4">
                      Adicione uma imagem de fundo para sua loja
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Clique para fazer upload</p>
                  </div>
                </div>
                
                {/* Card Upload Logo */}
                <div 
                  className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all group max-w-[300px] mx-auto"
                  onClick={() => openImageModal('profile')}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Camera className="h-10 w-10 text-gray-400 group-hover:text-blue-500 mb-3 transition-colors" />
                    <h4 className="text-lg font-medium text-gray-900 mb-1">Logo/Perfil</h4>
                    <p className="text-sm text-gray-600 text-center px-4">
                      Adicione o logo da sua empresa
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Clique para fazer upload</p>
                  </div>
                </div>
              </div>
              
              {/* Texto explicativo */}
              <div className="text-center mt-6">
                <p className="text-gray-600 text-sm">
                  As imagens ajudam a transmitir profissionalismo e personalidade à sua loja.
                </p>
              </div>
            </div>
          )}
        </div>
        {/* Store Info - Com Inline Editing */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 mb-12">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 pr-4">
                {/* Nome da loja editável */}
                <div className="mb-2">
                  <EditableField
                    field="name"
                    value={store.name}
                    placeholder="Nome da sua loja"
                    className="text-2xl font-bold text-gray-900"
                  />
                </div>
                {/* URL editável */}
                <div className="mt-1">
                  <EditableSlugField />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-medium ${
                    store.isactive ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {store.isactive ? 'Ativa' : 'Inativa'}
                  </span>
                  <ToggleSwitch
                    enabled={store.isactive}
                    onChange={() => toggleStoreStatus()}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">WhatsApp</dt>
                <EditableField
                  field="whatsapp"
                  value={store.whatsapp || ''}
                  placeholder="Clique para adicionar WhatsApp"
                  type="tel"
                />
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Endereço</dt>
                <EditableField
                  field="address"
                  value={store.address || ''}
                  placeholder="Clique para adicionar endereço"
                />
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Cor Principal</dt>
                <EditableColorField />
              </div>
            </div>
            
            {/* Descrição editável */}
            <div className="mt-4">
              <dt className="text-sm font-medium text-gray-500 mb-1">Descrição</dt>
              <EditableField
                field="description"
                value={store.description || ''}
                placeholder="Clique para adicionar uma descrição da sua loja"
                multiline={true}
              />
            </div>
          </div>
        </div>

        {/* Categories Section Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 mb-12">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Categorias e Produtos</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Organize seus produtos em categorias para facilitar a navegação dos clientes
                </p>
              </div>
              <Link
                href={`/dashboard/store/${store.id}/categories`}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Categoria
              </Link>
            </div>
          </div>
        </div>

        {/* Categories and Items */}
        <div className="space-y-8">
          {store.categories.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200">
              <div className="px-6 py-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma categoria criada</h3>
                <p className="text-gray-500 mb-4">
                  Crie categorias para organizar seus produtos e facilitar a navegação dos clientes
                </p>
                <Link
                  href={`/dashboard/store/${store.id}/categories`}
                  className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Categoria
                </Link>
              </div>
            </div>
          ) : (
            store.categories.map((category) => (
            <div key={category.id} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-medium text-gray-900">{category.name}</h2>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-medium ${
                        category.isactive ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {category.isactive ? 'Ativa' : 'Inativa'}
                      </span>
                      <ToggleSwitch
                        enabled={category.isactive}
                        onChange={(enabled) => toggleCategoryStatus(category.id, category.isactive)}
                        size="sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Menu de ações da categoria */}
                    <div className="relative">
                      <button
                        onClick={() => setCategoryActionsOpen(categoryActionsOpen === category.id ? null : category.id)}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        title="Mais ações"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {/* Dropdown de ações */}
                      {categoryActionsOpen === category.id && (
                        <>
                          {/* Overlay para fechar o menu */}
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setCategoryActionsOpen(null)}
                          />
                          
                          {/* Menu dropdown */}
                          <div className="absolute right-0 bottom-full mb-2 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px]">
                            <button
                              onClick={() => {
                                duplicateCategory(category.id)
                                setCategoryActionsOpen(null)
                              }}
                              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Copy className="h-4 w-4" />
                              Duplicar
                            </button>
                            
                            <div className="border-t border-gray-100 my-1" />
                            
                            <button
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Deletar Categoria',
                                  message: `Tem certeza que deseja deletar a categoria "${category.name}"? Esta ação não pode ser desfeita.`,
                                  onConfirm: () => {
                                    deleteCategory(category.id)
                                    setConfirmModal({ ...confirmModal, isOpen: false })
                                  },
                                  onClose: () => setConfirmModal({ ...confirmModal, isOpen: false })
                                })
                                setCategoryActionsOpen(null)
                              }}
                              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Excluir
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-6">
                {category.items?.length === 0 ? (
                  <div className="py-12">
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {/* Card "Novo Item" como único item quando categoria vazia */}
                      <AddItemCard categoryId={category.id} categoryName={category.name} />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {category.items.map((item) => (
                      <AdminProductCard
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        description={item.description}
                        price={item.price || 0}
                        image={item.image}
                        isActive={item.isactive}
                        isPaused={item.isarchived}
                        onToggleActive={handleToggleActive}
                        onTogglePause={handleTogglePause}
                        onEdit={handleEdit}
                        onDuplicate={handleDuplicate}
                        onDelete={handleDelete}
                      />
                    ))}
                    
                    {/* Card "Novo Item" */}
                    <AddItemCard categoryId={category.id} categoryName={category.name} />
                  </div>
                )}
              </div>
            </div>
          ))
          )}
        </div>

        {/* Delete Store Section */}
        <div className="mt-12 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-red-200 p-8">
          <h3 className="text-lg font-medium text-red-900 mb-4">Zona de Perigo</h3>
          <p className="text-sm text-red-700 mb-4">
            Deletar esta loja removerá permanentemente todos os dados, incluindo categorias e itens. Esta ação não pode ser desfeita.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Deletar Loja
          </button>
        </div>
      </div>

      {/* Delete Store Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50" onClick={() => setShowDeleteModal(false)}>
          <div className="relative top-20 mx-auto p-8 border w-96 shadow-xl rounded-3xl bg-white/95 backdrop-blur-sm border border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Deletar Loja</h3>
              <p className="text-sm text-gray-600 mb-4">
                Esta ação não pode ser desfeita. Para confirmar, digite o nome da loja: <strong>{store.name}</strong>
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Digite o nome da loja"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteConfirmText('')
                  }}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={deleteStore}
                  disabled={deleteConfirmText !== store.name || isDeleting}
                  className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 border border-transparent rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isDeleting ? 'Deletando...' : 'Deletar Loja'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />

      {/* Product Edit Modal */}
      <ProductEditModal
        isOpen={editModal.isOpen}
        product={editModal.product}
        onClose={() => setEditModal({ isOpen: false, product: null })}
        onSave={async (productData) => {
          if (editModal.product) {
            try {
              console.log('💾 Salvando produto:', productData)
              
              const response = await fetch(`/api/items/${editModal.product.id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  name: productData.name,
                  description: productData.description,
                  price: productData.price,
                  image: productData.image,
                  isactive: productData.isactive,
                  isarchived: productData.isarchived
                }),
              })
              
              if (response.ok) {
                console.log('✅ Produto salvo com sucesso')
                fetchStore() // Recarregar dados após sucesso
              } else {
                console.error('❌ Erro ao salvar produto:', response.status)
                const errorData = await response.json().catch(() => ({}))
                console.error('Detalhes do erro:', errorData)
              }
            } catch (error) {
              console.error('💥 Erro de rede ao salvar produto:', error)
            }
          }
          setEditModal({ isOpen: false, product: null })
        }}
      />

      {/* Product Create Modal */}
      <ProductCreateModal
        isOpen={createModal.isOpen}
        onClose={() => setCreateModal({ isOpen: false, categoryId: '', categoryName: '' })}
        onSave={handleCreateProduct}
        categoryId={createModal.categoryId}
        categoryName={createModal.categoryName}
        storeId={store.id}
      />

      {/* Modal de Upload de Imagens */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50" onClick={closeImageModal}>
          <div className="relative top-20 mx-auto p-8 border w-full max-w-md shadow-xl rounded-3xl bg-white/95 backdrop-blur-sm border border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {imageModal.type === 'cover' ? 'Imagem de Capa' : 'Logo/Perfil'}
              </h3>
              <p className="text-sm text-gray-600">
                {imageModal.type === 'cover' 
                  ? 'Adicione uma imagem de fundo para sua loja (recomendado: 800x400px)' 
                  : 'Adicione o logo da sua empresa (recomendado: quadrado 400x400px)'}
              </p>
            </div>
            
            <div className="mb-6">
              <ImageUpload
                onUpload={handleImageUpload}
                currentImage={imageModal.currentImage}
                type="store"
                storeid={store.id}
                variant="medium"
                placeholder={imageModal.type === 'cover' ? 'Arraste ou clique para adicionar capa' : 'Arraste ou clique para adicionar logo'}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeImageModal}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
