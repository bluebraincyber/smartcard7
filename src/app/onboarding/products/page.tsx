'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useOnboarding } from '@/contexts/onboarding-context'
import { Button } from '@/components/ui/button'
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer'
import { FormInput, FormTextarea } from '@/components/forms/form-field'
import { Plus, Trash2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  image?: string
  isActive: boolean
}

export default function ProductsPage() {
  const { nextStep, prevStep, formMethods } = useOnboarding()
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = formMethods

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products.products',
  })

  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    isActive: true,
  })

  const handleAddProduct = () => {
    append({
      id: uuidv4(),
      ...newProduct,
    })
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      category: '',
      isActive: true,
    })
    setIsAddingProduct(false)
  }

  const onSubmit = (data: any) => {
    console.log('Products submitted:', data)
    nextStep()
  }

  return (
    <OnboardingContainer
      title="Seus Produtos"
      description="Adicione os produtos ou serviços que você oferece."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {fields.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">
                Você ainda não adicionou nenhum produto.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddingProduct(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Produto
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Produtos Adicionados</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddingProduct(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Produto
                </Button>
              </div>
              
              <div className="grid gap-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {field.name || 'Produto sem nome'}
                      </h4>
                      {field.description && (
                        <p className="text-sm text-muted-foreground">
                          {field.description}
                        </p>
                      )}
                      <div className="mt-2 text-sm">
                        <span className="font-medium">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(field.price)}
                        </span>
                        {field.category && (
                          <span className="ml-4 text-muted-foreground">
                            {field.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isAddingProduct && (
            <div className="border rounded-lg p-6 space-y-4">
              <h4 className="font-medium">Adicionar Novo Produto</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Nome do Produto"
                  {...register('newProduct.name')}
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  required
                />
                <FormInput
                  label="Preço"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('newProduct.price', { valueAsNumber: true })}
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
                <FormInput
                  label="Categoria"
                  {...register('newProduct.category')}
                  value={newProduct.category}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, category: e.target.value })
                  }
                  required
                />
                <FormTextarea
                  label="Descrição"
                  className="md:col-span-2"
                  {...register('newProduct.description')}
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingProduct(false)}
                >
                  Cancelar
                </Button>
                <Button type="button" onClick={handleAddProduct}>
                  Adicionar Produto
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={prevStep}>
            Voltar
          </Button>
          <Button 
            type="submit" 
            disabled={fields.length === 0}
          >
            Revisar Informações
          </Button>
        </div>
      </form>
    </OnboardingContainer>
  )
}
