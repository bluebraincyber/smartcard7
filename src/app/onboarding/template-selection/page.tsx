'use client'

import { useForm } from 'react-hook-form'
import { useOnboarding } from '@/contexts/onboarding-context'
import { Button } from '@/components/ui/button'
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer'
import { FormSelect } from '@/components/forms/form-field'
import { ColorPicker } from '@/components/ui/color-picker'

const TEMPLATES = [
  { id: 'minimal', name: 'Minimalista', description: 'Design limpo e simples' },
  { id: 'modern', name: 'Moderno', description: 'Design contemporâneo com elementos visuais' },
  { id: 'elegant', name: 'Elegante', description: 'Design sofisticado para marcas premium' },
  { id: 'vibrant', name: 'Vibrante', description: 'Cores fortes e elementos dinâmicos' },
]

export default function TemplateSelectionPage() {
  const { nextStep, prevStep, formMethods } = useOnboarding()
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = formMethods

  const selectedTemplate = watch('template.templateId')
  const primaryColor = watch('template.primaryColor')
  const secondaryColor = watch('template.secondaryColor')

  const onSubmit = (data: any) => {
    console.log('Template selected:', data)
    nextStep()
  }

  return (
    <OnboardingContainer
      title="Escolha um Template"
      description="Selecione um template que melhor representa a sua marca."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormSelect
            label="Template"
            id="template"
            error={errors.template?.templateId}
            {...register('template.templateId')}
            options={TEMPLATES.map(t => ({
              value: t.id,
              label: `${t.name} - ${t.description}`,
            }))}
            required
          />

          {selectedTemplate && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cor Primária
                </label>
                <ColorPicker
                  value={primaryColor}
                  onChange={(color) => setValue('template.primaryColor', color)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cor Secundária (opcional)
                </label>
                <ColorPicker
                  value={secondaryColor}
                  onChange={(color) => setValue('template.secondaryColor', color)}
                />
              </div>
              
              <div className="md:col-span-2">
                <div 
                  className="h-40 rounded-lg border p-4 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor || primaryColor} 100%)`,
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}
                >
                  <div className="text-center">
                    <p className="text-lg font-bold">Visualização do Tema</p>
                    <p className="text-sm opacity-90">Sua marca ficará incrível!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={prevStep}>
            Voltar
          </Button>
          <Button type="submit">
            Próximo
          </Button>
        </div>
      </form>
    </OnboardingContainer>
  )
}
