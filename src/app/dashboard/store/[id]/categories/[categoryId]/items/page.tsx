'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Package, X, Upload, Camera, Trash2 } from 'lucide-react'
import { AdminProductCard } from '@/components/ui/admin-product-card'

interface Store {
  id: string
  name: string
  slug: string
}

interface Category {
  id: string
  name: string
}

interface Item {
  id: string
  name: string
  description?: string
  price?: number
  image?: string
  order: number
  isactive: boolean
  isarchived: boolean
}

// Image Upload Component
const ImageUploadField = ({
  value,
  onChange,
  onRemove
}: {
  value: string
  onChange: (url: string) => void
  onRemove: () => void
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem')
      return
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB')
      return
    }

    setUploading(true)
    try {
      // Criar FormData para upload
      const formData = new FormData()
      formData.append('file', file)

      // Simular upload (você deve implementar sua API de upload aqui)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        onChange(data.url)
      } else {
        // Para desenvolvimento, usar URL temporária
        const tempUrl = URL.createObjectURL(file)
        onChange(tempUrl)
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      // Para desenvolvimento, usar URL temporária
      const tempUrl = URL.createObjectURL(file)
      onChange(tempUrl)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  if (value) {
    return (
      <div className="relative group">
        {/* Preview da imagem */}
        <div className="overflow-hidden relative rounded-xl border aspect-video bg-muted dark:bg-gray-800 border-border dark:border-gray-700">
          <img
            src={value}
            alt="Preview"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Overlay com botões ao hover */}
          <div className="flex absolute inset-0 gap-2 justify-center items-center opacity-0 transition-opacity bg-black/50 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg transition-colors bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900"
              title="Trocar imagem"
            >
              <Camera className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="p-2 rounded-lg transition-colors bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900"
              title="Remover imagem"
            >
              <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
            </button>
          </div>
        </div>

        {/* Input escondido */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div
      onDrop={handleDrop}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      className={`
        relative rounded-xl border-2 border-dashed transition-all cursor-pointer
        ${dragActive 
          ? 'border-primary dark:border-blue-500 bg-primary/5 dark:bg-blue-500/10' 
          : 'border-border dark:border-gray-700 hover:border-primary dark:hover:border-blue-500'
        }
      `}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="p-8 text-center">
        {uploading ? (
          <>
            <div className="mx-auto mb-3 w-10 h-10 rounded-full border-2 animate-spin border-primary dark:border-blue-500 border-t-transparent" />
            <p className="text-sm text-muted-foreground dark:text-gray-400">Enviando imagem...</p>
          </>
        ) : (
          <>
            <Upload className="mx-auto mb-3 w-10 h-10 text-muted-foreground dark:text-gray-500" />
            <p className="mb-1 text-sm font-medium text-foreground dark:text-gray-100">
              Clique para enviar ou arraste uma imagem aqui
            </p>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              PNG, JPG ou WEBP até 5MB
            </p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}

// Modal Component
const ProductModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  creating,
  isEditing
}: {
  isOpen: boolean
  onClose: () => void
  formData: { name: string; description: string; price: string; image: string }
  setFormData: React.Dispatch<React.SetStateAction<{ name: string; description: string; price: string; image: string }>>
  onSubmit: (e: React.FormEvent) => void
  creating: boolean
  isEditing: boolean
}) => {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 backdrop-blur-sm transition-opacity bg-black/50 dark:bg-black/70"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex fixed inset-0 z-50 justify-center items-center p-4">
        <div className="w-full max-w-lg bg-card dark:bg-gray-900 rounded-2xl shadow-2xl border border-border dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex flex-shrink-0 justify-between items-center p-6 border-b border-border dark:border-gray-800">
            <h3 className="text-lg font-semibold text-foreground dark:text-gray-100">
              {isEditing ? 'Editar Produto' : 'Novo Produto'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-muted dark:hover:bg-gray-800"
            >
              <X className="w-4 h-4 text-muted-foreground dark:text-gray-400" />
            </button>
          </div>

          {/* Form - Scrollable */}
          <div className="overflow-y-auto flex-1">
            <form id="product-form" onSubmit={onSubmit} className="p-6">
              <div className="space-y-5">
                {/* Nome */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground dark:text-gray-100">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={creating}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-background dark:bg-gray-800 text-foreground dark:text-gray-100 border border-border dark:border-gray-700 focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ex: Coxinha, Pastel..."
                    autoFocus
                  />
                </div>

                {/* Preço */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground dark:text-gray-100">
                    Preço
                  </label>
                  <div className="relative">
                    <div className="flex absolute inset-y-0 left-0 items-center pl-4 pointer-events-none">
                      <span className="text-sm font-medium text-muted-foreground dark:text-gray-400">R$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      disabled={creating}
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="pl-12 w-full px-4 py-2.5 rounded-xl text-sm bg-background dark:bg-gray-800 text-foreground dark:text-gray-100 border border-border dark:border-gray-700 focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="25,00"
                    />
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground dark:text-gray-100">
                    Descrição
                  </label>
                  <textarea
                    rows={3}
                    disabled={creating}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-background dark:bg-gray-800 text-foreground dark:text-gray-100 border border-border dark:border-gray-700 focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Descreva o produto..."
                  />
                </div>

                {/* Imagem */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-foreground dark:text-gray-100">
                    Imagem do Produto
                  </label>
                  <ImageUploadField
                    value={formData.image}
                    onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                    onRemove={() => setFormData(prev => ({ ...prev, image: '' }))}
                  />
                  
                  {/* Campo de URL alternativo */}
                  {!formData.image && (
                    <div className="mt-3">
                      <p className="mb-2 text-xs text-muted-foreground dark:text-gray-400">
                        Ou cole a URL de uma imagem:
                      </p>
                      <input
                        type="url"
                        disabled={creating}
                        value={formData.image}
                        onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                        className="px-3 py-2 w-full text-xs rounded-lg border transition-all bg-background dark:bg-gray-800 text-foreground dark:text-gray-100 border-border dark:border-gray-700 focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Actions - Fixed at bottom */}
          <div className="flex flex-shrink-0 gap-3 justify-end items-center p-6 border-t border-border dark:border-gray-800 bg-card dark:bg-gray-900">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium bg-muted dark:bg-gray-800 text-foreground dark:text-gray-100 rounded-xl hover:bg-muted/80 dark:hover:bg-gray-700 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="product-form"
              disabled={creating || !formData.name.trim()}
              className="px-6 py-2.5 text-sm font-medium bg-primary dark:bg-blue-600 text-primary-foreground dark:text-white rounded-xl hover:bg-primary/90 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center gap-2"
            >
              {creating && (
                <span className="inline-block w-4 h-4 rounded-full border-2 animate-spin border-primary-foreground border-t-transparent" />
              )}
              {creating ? 'Salvando...' : (isEditing ? 'Atualizar Produto' : 'Criar Produto')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function ItemsPage() {
  const params = useParams()
  const [store, setStore] = useState<Store | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({ message: '', type: 'success', visible: false })
  const [confirm, setConfirm] = useState<{ open: boolean; id: string | null; name: string }>({ open: false, id: null, name: '' })
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: ''
  })

  // Normaliza preço vindo do input (aceita vírgula) e evita NaN
  const normalizePrice = (value: string): number | null => {
    if (!value) return null
    const trimmed = value.trim().replace(/\s+/g, '')
    if (trimmed === '') return null
    // troca vírgula por ponto e remove prefixos tipo R$
    const sanitized = trimmed.replace(/^R\$\s*/i, '').replace(/\./g, '').replace(',', '.')
    const num = Number(sanitized)
    return Number.isFinite(num) ? num : null
  }

  const fetchData = useCallback(async () => {
    try {
      const [storeResponse, categoryResponse, itemsResponse] = await Promise.all([
        fetch(`/api/stores/${params.id}`),
        fetch(`/api/stores/${params.id}/categories/${params.categoryId}`),
        fetch(`/api/stores/${params.id}/categories/${params.categoryId}/items`)
      ])

      if (storeResponse.ok) {
        const storeData = await storeResponse.json()
        setStore(storeData)
      }

      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json()
        setCategory(categoryData)
      }

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json()
        setItems(itemsData)
      }
    } catch {
      console.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [params.id, params.categoryId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: ''
    })
    setEditingItem(null)
    setModalOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setCreating(true)
    try {
      const normalized = normalizePrice(formData.price)
      const payload: {
        name: string;
        description: string | null;
        image: string | null;
        price?: number;
      } = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        image: formData.image.trim() || null
      }
      // Só enviar price quando houver valor válido (evita null -> NaN no backend)
      if (normalized !== null) payload.price = normalized

      const url = editingItem
        ? `/api/stores/${params.id}/categories/${params.categoryId}/items/${editingItem.id}`
        : `/api/stores/${params.id}/categories/${params.categoryId}/items`
      
      const method = editingItem ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        // Recarregar lista para garantir consistência
        await fetchData()
        // Feedback e fechar modal
        setToast({ message: editingItem ? 'Produto atualizado com sucesso' : 'Produto criado com sucesso', type: 'success', visible: true })
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
        resetForm()
      } else {
        setToast({ message: 'Falha ao salvar produto', type: 'error', visible: true })
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
      }
    } catch (error) {
      console.error('Erro ao salvar item:', error)
      setToast({ message: 'Erro inesperado ao salvar', type: 'error', visible: true })
      setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (item: Item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price ? item.price.toString() : '',
      image: item.image || ''
    })
    setModalOpen(true)
  }

  const openNewModal = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      image: ''
    })
    setModalOpen(true)
  }

  const handleToggleActive = async (itemId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/stores/${params.id}/categories/${params.categoryId}/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isactive: isActive }),
      })

      if (response.ok) {
        setItems(prev => 
          prev.map(item => 
            item.id === itemId ? { ...item, isactive: isActive } : item
          )
        )
      }
    } catch (error) {
      console.error('Erro ao atualizar status do item:', error)
    }
  }

  const handleTogglePause = async (itemId: string, isPaused: boolean) => {
    try {
      const response = await fetch(`/api/stores/${params.id}/categories/${params.categoryId}/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isarchived: isPaused }),
      })

      if (response.ok) {
        setItems(prev => 
          prev.map(item => 
            item.id === itemId ? { ...item, isarchived: isPaused } : item
          )
        )
      }
    } catch (error) {
      console.error('Erro ao pausar/retomar item:', error)
    }
  }

  const handleDuplicate = async (itemId: string) => {
    const itemToDuplicate = items.find(item => item.id === itemId)
    if (!itemToDuplicate) return

    try {
      const payload = {
        name: `${itemToDuplicate.name} (Cópia)`,
        description: itemToDuplicate.description,
        price: itemToDuplicate.price,
        image: itemToDuplicate.image
      }

      const response = await fetch(`/api/stores/${params.id}/categories/${params.categoryId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const newItem = await response.json()
        setItems(prev => [...prev, newItem])
      }
    } catch (error) {
      console.error('Erro ao duplicar item:', error)
    }
  }

  const handleDelete = async (itemId: string) => {
    try {
      const response = await fetch(`/api/stores/${params.id}/categories/${params.categoryId}/items/${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setItems(prev => prev.filter(item => item.id !== itemId))
        setToast({ message: 'Item excluído com sucesso', type: 'success', visible: true })
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 2000)
      }
    } catch (error) {
      console.error('Erro ao excluir item:', error)
      setToast({ message: 'Erro ao excluir item', type: 'error', visible: true })
      setTimeout(() => setToast(t => ({ ...t, visible: false })), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-gray-950">
        <div className="px-4 py-8 mx-auto w-full max-w-screen-2xl sm:px-6 lg:px-8">
          <div className="flex flex-col justify-center items-center h-64">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 animate-spin border-border dark:border-gray-800 border-t-primary dark:border-t-blue-500"></div>
            </div>
            <span className="mt-4 font-medium text-foreground dark:text-gray-100">Carregando produtos...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern disabled to avoid darker banding */}
      {/* <div className="overflow-hidden absolute inset-0 opacity-5 pointer-events-none bg-grid-pattern"></div> */}
      
      <div className="relative px-4 py-8 mx-auto w-full max-w-screen-2xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-6 space-x-4">
            <Link
              href={`/dashboard/store/${params.id}`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl border border-transparent shadow-none transition-colors text-muted-foreground hover:text-foreground bg-background hover:bg-muted/40"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Voltar à Loja
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="rounded-3xl border shadow-lg bg-card border-border">
          <div className="px-6 py-6 border-b sm:px-8 border-border">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {category?.name} - {store?.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Adicione e gerencie os produtos desta categoria
                </p>
              </div>
              <button
                onClick={openNewModal}
                className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-xl shadow-sm bg-primary dark:bg-blue-600 text-primary-foreground dark:text-white hover:bg-primary/90 dark:hover:bg-blue-700 transition-all duration-200"
              >
                <Plus className="mr-2 w-4 h-4" />
                Novo Produto
              </button>
            </div>
          </div>
          
          <div className="p-6 sm:p-8">
            {/* Products Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {items.map((item) => (
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
                  onEdit={() => startEdit(item)}
                  onDuplicate={handleDuplicate}
                  onDelete={() => setConfirm({ open: true, id: item.id, name: item.name })}
                />
              ))}
            </div>

            {/* Empty State */}
            {items.length === 0 && (
              <div className="py-12 text-center">
                <Package className="mx-auto mb-4 w-16 h-16 text-muted-foreground dark:text-gray-500" />
                <h3 className="mb-2 text-lg font-medium text-foreground dark:text-gray-100">Nenhum produto ainda</h3>
                <p className="mb-6 text-sm text-muted-foreground dark:text-gray-400">Adicione seu primeiro produto nesta categoria</p>
                <button
                  onClick={openNewModal}
                  className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-xl shadow-sm transition-all duration-200 bg-primary dark:bg-blue-600 text-primary-foreground dark:text-white hover:bg-primary/90 dark:hover:bg-blue-700"
                >
                  <Plus className="mr-2 w-4 h-4" />
                  Adicionar Produto
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <ProductModal
        isOpen={modalOpen}
        onClose={resetForm}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        creating={creating}
        isEditing={!!editingItem}
      />
      {/* Confirm Delete Dialog */}
      {confirm.open && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px] z-40" onClick={() => setConfirm({ open: false, id: null, name: '' })} />
          <div className="flex fixed inset-0 z-50 justify-center items-center p-4">
            <div className="w-full max-w-md rounded-2xl border shadow-xl bg-card border-border">
              <div className="p-5 border-b border-border">
                <h4 className="text-base font-semibold text-foreground">Confirmar exclusão</h4>
              </div>
              <div className="p-5">
                <p className="text-sm text-muted-foreground">Tem certeza que deseja excluir o item
                  <span className="font-medium text-foreground"> {confirm.name}</span>?
                </p>
              </div>
              <div className="flex gap-3 justify-end px-5 py-4 border-t border-border">
                <button
                  className="px-4 py-2 rounded-xl bg-muted text-foreground hover:bg-muted/80"
                  onClick={() => setConfirm({ open: false, id: null, name: '' })}
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={async () => {
                    if (confirm.id) await handleDelete(confirm.id)
                    setConfirm({ open: false, id: null, name: '' })
                  }}
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Toast */}
      {toast.visible && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl shadow-lg border ${toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-destructive text-destructive-foreground border-destructive/50'}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
