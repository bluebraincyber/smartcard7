'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

interface ProductCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (productData: {
    name: string
    description: string
    price: number
    image: string
    isactive: boolean
    isarchived: boolean
    categoryId: string
  }) => Promise<void>
  categoryId: string
  categoryName: string
  storeId: string
}

export default function ProductCreateModal({
  isOpen,
  onClose,
  onSave,
  categoryId,
  categoryName,
  storeId
}: ProductCreateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    isactive: true,
    isavailable: true
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.price) {
      alert('Nome e preço são obrigatórios')
      return
    }

    setIsLoading(true)
    
    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price.replace(',', '.')),
        image: formData.image.trim(),
        isactive: formData.isactive,
        isarchived: !formData.isavailable,
        categoryId: categoryId
      })
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        image: '',
        isactive: true,
        isavailable: true
      })
      
      onClose()
    } catch (error) {
      console.error('Erro ao criar produto:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image: imageUrl }))
  }

  const handleImageRemove = () => {
    setFormData(prev => ({ ...prev, image: '' }))
  }

  const handleToggleChange = (field: 'isactive' | 'isavailable') => {
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
                      Criar Produto - {categoryName}
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
                            onRemove={handleImageRemove}
                            currentImage={formData.image}
                            type="item"
                            storeid={storeId}
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
                            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
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
                              enabled={formData.isavailable}
                              onChange={() => handleToggleChange('isavailable')}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer com botões */}
                  <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200/50 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                      disabled={isLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 border border-transparent rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {isLoading ? 'Criando...' : 'Criar Produto'}
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