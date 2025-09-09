'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import ImageUpload from '@/components/ImageUpload'

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

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Nome do Produto */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nome do Produto
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Descrição
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                      step="0.01"
                      min="0"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>

                  {/* Upload de Imagem */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imagem do Produto
                    </label>
                    <ImageUpload
                      onUpload={handleImageUpload}
                      currentImage={formData.image}
                      type="item"
                      storeid={product?.id || "1"}
                      placeholder="Clique para adicionar uma imagem"
                    />
                  </div>

                  {/* Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex items-center">
                      <input
                        id="isactive"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={formData.isactive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isactive: e.target.checked }))}
                      />
                      <label htmlFor="isactive" className="ml-2 block text-sm text-gray-900">
                        Produto Ativo
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="isArchived"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={formData.isarchived}
                        onChange={(e) => setFormData(prev => ({ ...prev, isarchived: e.target.checked }))}
                      />
                      <label htmlFor="isArchived" className="ml-2 block text-sm text-gray-900">
                        Indisponível
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
