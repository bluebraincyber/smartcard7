'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

interface Item {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  isactive: boolean
  isarchived: boolean
}

interface ProductEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (productData: Partial<Item>) => Promise<void>
  product: Item | null
}

export default function ProductEditModal({
  isOpen,
  onClose,
  onSave,
  product
}: ProductEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    image: '',
    isactive: true,
    isarchived: false
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        image: product.image || '',
        isactive: product.isactive ?? true,
        isarchived: product.isarchived ?? false
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image: imageUrl }))
  }

  const handleToggleChange = (field: 'isactive' | 'isarchived') => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  // Componente Toggle Switch
  const ToggleSwitch = ({ 
    enabled, 
    onChange, 
    disabled = false 
  }: {
    enabled: boolean
    onChange: () => void
    disabled?: boolean
  }) => {
    return (
      <button
        type="button"
        onClick={() => !disabled && onChange()}
        disabled={disabled}
        className={`
          w-10 h-5 relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${enabled 
            ? 'bg-green-600 hover:bg-green-700' 
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
            w-4 h-4 inline-block rounded-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out
            ${enabled ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    )
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[70]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                      Editar Produto
                    </Dialog.Title>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={onClose}
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Coluna Esquerda - Imagem */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Imagem do Produto</h3>
                        <div className="w-full max-w-sm">
                          <ImageUpload
                            onUpload={handleImageUpload}
                            currentImage={formData.image}
                            type="item"
                            storeid={product?.id || '1'}
                            placeholder="Arraste ou clique para adicionar imagem"
                            variant="medium"
                          />
                        </div>
                      </div>
                      
                      {/* Coluna Direita - Campos */}
                      <div className="space-y-4">
                        {/* Nome do Produto */}
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Nome do Produto
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ex: Pizza Margherita"
                          />
                        </div>

                        {/* Descrição */}
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição
                          </label>
                          <textarea
                            name="description"
                            id="description"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            placeholder="Descreva o produto..."
                          />
                        </div>

                        {/* Preço */}
                        <div>
                          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                            Preço (R$)
                          </label>
                          <input
                            type="number"
                            name="price"
                            id="price"
                            required
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                          />
                        </div>

                        {/* Toggles */}
                        <div className="grid grid-cols-2 gap-4 pt-4">
                          {/* Produto Ativo */}
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Produto Ativo</label>
                              <p className="text-xs text-gray-500">Visível na loja</p>
                            </div>
                            <ToggleSwitch
                              enabled={formData.isactive}
                              onChange={() => handleToggleChange('isactive')}
                            />
                          </div>

                          {/* Produto Disponível */}
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Produto Disponível</label>
                              <p className="text-xs text-gray-500">Em estoque</p>
                            </div>
                            <ToggleSwitch
                              enabled={!formData.isarchived}
                              onChange={() => handleToggleChange('isarchived')}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer com botões */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      disabled={isLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
