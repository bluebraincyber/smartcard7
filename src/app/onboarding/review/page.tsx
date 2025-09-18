'use client'

import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/contexts/onboarding-context'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useOnboardingToast } from '@/hooks/use-onboarding-toast'

export default function ReviewPage() {
  const router = useRouter()
  const { prevStep, formMethods, onSubmit, isSubmitting } = useOnboarding()
  const { showSuccess, showError } = useOnboardingToast()
  
  const { handleSubmit, watch } = formMethods
  
  const formData = watch()

  const handleFormSubmit = async (data: typeof formData) => {
    try {
      await onSubmit(data)
      showSuccess('Configuração concluída com sucesso!', 'Sua loja está pronta para uso.')
    } catch (error) {
      console.error('Error submitting form:', error)
      showError('Erro ao salvar configuração', 'Tente novamente mais tarde.')
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Revisar Informações</h1>
        <p className="text-muted-foreground mt-2">Confira se todas as informações estão corretas antes de finalizar.</p>
      </div>
      <div className="space-y-8">
        {/* Business Info Section */}
        <div className="p-6 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Informações da Empresa</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.push('/onboarding/business-info')}
            >
              Editar
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Nome da Empresa</p>
              <p>{formData.businessInfo?.businessName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p>{formData.businessInfo?.businessEmail}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Telefone</p>
              <p>{formData.businessInfo?.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CNPJ</p>
              <p>{formData.businessInfo?.cnpj}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Endereço</p>
              <p>
                {formData.businessInfo?.address?.street}, {formData.businessInfo?.address?.number}
                {formData.businessInfo?.address?.complement && `, ${formData.businessInfo.address.complement}`}
              </p>
              <p className="mt-1">
                {formData.businessInfo?.address?.neighborhood} - {formData.businessInfo?.address?.city}/{formData.businessInfo?.address?.state}
              </p>
              <p>CEP: {formData.businessInfo?.address?.zipCode}</p>
            </div>
          </div>
        </div>

        {/* Template Section */}
        <div className="p-6 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Template Escolhido</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.push('/onboarding/template-selection')}
            >
              Editar
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Template</p>
              <p>{formData.template?.templateId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cores</p>
              <div className="flex gap-2 items-center mt-1">
                <div 
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: formData.template?.primaryColor }}
                />
                {formData.template?.secondaryColor && (
                  <div 
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: formData.template.secondaryColor }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="p-6 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Produtos</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.push('/onboarding/products')}
            >
              Editar
            </Button>
          </div>
          
          {Array.isArray(formData.products?.products) && formData.products.products.length > 0 ? (
            <div className="space-y-4">
              {formData.products.products.map((product: { name: string; price: number; category?: string; description?: string }, index: number) => (
                <div key={index} className="pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-muted-foreground">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(product.price)}
                    </p>
                  </div>
                  {product.category && (
                    <p className="text-sm text-muted-foreground">
                      {product.category}
                    </p>
                  )}
                  {product.description && (
                    <p className="mt-1 text-sm">{product.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum produto adicionado</p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={prevStep}
            disabled={isSubmitting}
          >
            Voltar
          </Button>
          <Button 
            type="button"
            onClick={handleSubmit(handleFormSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Finalizando...
              </>
            ) : (
              'Finalizar Configuração'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
