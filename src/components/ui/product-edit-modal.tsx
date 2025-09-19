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

  const handleImageRemove = () => {
    setFormData(prev => ({ ...prev, image: '' }))
  }

  const handleToggleChange = (field: 'isactive' | 'isarchived') => {
    const newValue = !formData[field];
    setFormData(prev => ({
      ...prev,
      [field]: newValue
    }));
    
    // Feedback visual para o usuário
    const message = field === 'isactive' 
      ? newValue ? 'Produto ativado' : 'Produto desativado'
      : newValue ? 'Arquivamento ativado' : 'Arquivamento desativado';
    
    // Pode ser substituído por um toast ou notificação mais bonita
    console.log(message);
  }

  // Componente Toggle Switch melhorado
  const ToggleSwitch = ({ 
    enabled, 
    onChange, 
    disabled = false,
    label,
    description
  }: {
    enabled: boolean
    onChange: () => void
    disabled?: boolean
    label: string
    description?: string
  }) => {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled) {
              onChange();
            }
          }}
          disabled={disabled}
          className={`
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${enabled ? 'bg-green-600' : 'bg-gray-200'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          role="switch"
          aria-checked={enabled}
        >
          <span className="sr-only">{enabled ? 'Desativar' : 'Ativar'}</span>
          <span
            className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
              ${enabled ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>
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
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-xl bg-white/95 backdrop-blur-sm text-left align-middle shadow-2xl border border-gray-200 transition-all">
                {/* Header */}
                <div className="px-5 py-3 border-b border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <Dialog.Title as="h3" className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Editar Produto
                    </Dialog.Title>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                      onClick={onClose}
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <div className="p-4 sm:p-5">
                    <div className="space-y-4">
                      {/* Coluna Esquerda - Imagem */}
                      <div>
                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                          <div className="w-full sm:w-auto">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Imagem</h3>
                            <div className="relative w-full">
                              <div className="aspect-square w-full min-w-[180px] sm:min-w-[220px] max-w-[220px] mx-auto">
                                <ImageUpload
                                  onUpload={handleImageUpload}
                                  onRemove={handleImageRemove}
                                  currentImage={formData.image}
                                  type="item"
                                  storeid={product?.id || '1'}
                                  placeholder="Clique para adicionar"
                                  variant="medium"
                                  className="h-full w-full"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 w-full space-y-4">
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
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                placeholder="Ex: Pizza Margherita"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
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
                                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                  placeholder="0.00"
                                />
                              </div>
                              <div className="flex items-end">
                                <div className="w-full">
                                  <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">Disponível</label>
                                    <ToggleSwitch
                                      enabled={!formData.isarchived}
                                      onChange={() => handleToggleChange('isarchived')}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                        {/* Descrição */}
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                          Descrição
                        </label>
                        <textarea
                          name="description"
                          id="description"
                          rows={2}
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
                          placeholder="Descreva o produto..."
                        />
                      </div>

                      {/* Toggles */}
                      <div className="space-y-3 pt-2">
                        <ToggleSwitch
                          enabled={formData.isactive}
                          onChange={() => handleToggleChange('isactive')}
                          label="Produto Ativo"
                          description="Visível na loja"
                        />
                        {formData.isarchived && (
                          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                  Este produto está arquivado. Para torná-lo visível, desative a opção &quot;Arquivado&quot; abaixo.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        <ToggleSwitch
                          enabled={formData.isarchived}
                          onChange={() => handleToggleChange('isarchived')}
                          label="Arquivado"
                          description="Ocultar da lista principal"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer com botões */}
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-200/50 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                      disabled={isLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isLoading ? 'Salvando...' : 'Salvar alterações'}
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
