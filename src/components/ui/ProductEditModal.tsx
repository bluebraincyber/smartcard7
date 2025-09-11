'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import ImageUpload from '@/components/ImageUpload'
import { Switch } from '@/components/ui/Switch'

interface Item {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  isactive: boolean
  isarchived: boolean // Mudando para isarchived para coincidir com o banco
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
    isarchived: false // Mudando para isarchived
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
        isarchived: product.isarchived ?? false // Mudando para isarchived
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

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: '' }))
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm sm:max-w-2xl transform overflow-hidden rounded-2xl bg-white p-4 sm:p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <Dialog.Title as="h3" className="text-base sm:text-lg font-medium leading-6 text-gray-900">
                    Editar Produto
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Fechar</span>
                    <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    {/* Coluna da Imagem */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Imagem do Produto
                      </label>
                      <ImageUpload
                        onUpload={handleImageUpload}
                        onRemove={handleRemoveImage}
                        currentImage={formData.image}
                        type="item"
                        storeid={product?.id || "1"}
                        placeholder="Clique para adicionar uma imagem"
                      />
                    </div>

                    {/* Coluna dos Campos */}
                    <div className="flex flex-col justify-between gap-4">
                      {/* Nome do Produto */}
                      <div className="mt-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Nome do Produto
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          autoComplete="off"
                          required
                          className="mt-1 block w-full rounded-md bg-gray-100 shadow-inner shadow-[inset_0_2px_4px_0_rgb(0,0,0,0.1),inset_0_4px_8px_0_rgb(0,0,0,0.1)] focus:outline-none sm:text-sm text-gray-900 px-4 py-2"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      {/* Descrição */}
                      <div className="flex-grow">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Descrição
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={4}
                          className="mt-1 block w-full rounded-md bg-gray-100 shadow-inner shadow-[inset_0_2px_4px_0_rgb(0,0,0,0.1),inset_0_4px_8px_0_rgb(0,0,0,0.1)] focus:outline-none sm:text-sm text-gray-900 px-4 py-2"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      {/* Preço */}
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                          Preço (R$)
                        </label>
                        <input
                          type="number"
                          id="price"
                          name="price"
                          min="0"
                          required
                          className="mt-1 block w-full rounded-md bg-gray-100 shadow-inner shadow-[inset_0_2px_4px_0_rgb(0,0,0,0.1),inset_0_4px_8px_0_rgb(0,0,0,0.1)] focus:outline-none sm:text-sm text-gray-900 px-4 py-2"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex flex-wrap justify-start gap-x-6 gap-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isactive"
                        checked={formData.isactive}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isactive: checked }))}
                      />
                      <label htmlFor="isactive" className="text-sm text-gray-900 w-[150px] flex-shrink-0">
                        {formData.isactive ? 'Produto Ativo' : 'Produto Desativado'}
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isArchived"
                        checked={!formData.isarchived}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isarchived: !checked }))}
                      />
                      <label htmlFor="isArchived" className="text-sm text-gray-900 w-[150px] flex-shrink-0">
                        {formData.isarchived ? 'Produto Indisponível' : 'Produto Disponível'}
                      </label>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:space-x-3 sm:gap-0 pt-4 sm:pt-6">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full sm:w-auto order-2 sm:order-1"
                      onClick={onClose}
                      disabled={isLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 w-full sm:w-auto order-1 sm:order-2"
                      disabled={isLoading}
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
