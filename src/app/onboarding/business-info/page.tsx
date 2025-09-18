'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useOnboarding } from '@/contexts/onboarding-context'
import { businessInfoSchema } from '../types'
import { Button } from '@/components/ui/button'
import { FormInput, FormSelect } from '@/components/forms/form-field'
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer'
import { BR_STATES } from '@/lib/constants'

export default function BusinessInfoPage() {
  const { nextStep, prevStep, formMethods } = useOnboarding()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = formMethods

  const onSubmit = (data: any) => {
    console.log('Business info submitted:', data)
    nextStep()
  }

  return (
    <OnboardingContainer
      title="Informações da Empresa"
      description="Preencha os dados da sua empresa para continuar."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Nome da Empresa"
            id="businessName"
            error={errors.businessInfo?.businessName}
            {...register('businessInfo.businessName')}
            required
          />
          
          <FormInput
            label="Email"
            id="email"
            type="email"
            error={errors.businessInfo?.businessEmail}
            {...register('businessInfo.businessEmail')}
            required
          />
          
          <FormInput
            label="Telefone"
            id="phone"
            type="tel"
            error={errors.businessInfo?.phone}
            {...register('businessInfo.phone')}
            required
          />
          
          <FormInput
            label="CNPJ"
            id="cnpj"
            error={errors.businessInfo?.cnpj}
            {...register('businessInfo.cnpj')}
            required
          />
          
          <FormInput
            label="CEP"
            id="zipCode"
            error={errors.businessInfo?.address?.zipCode}
            {...register('businessInfo.address.zipCode')}
            required
          />
          
          <FormInput
            label="Rua"
            id="street"
            error={errors.businessInfo?.address?.street}
            {...register('businessInfo.address.street')}
            required
          />
          
          <FormInput
            label="Número"
            id="number"
            error={errors.businessInfo?.address?.number}
            {...register('businessInfo.address.number')}
            required
          />
          
          <FormInput
            label="Complemento"
            id="complement"
            error={errors.businessInfo?.address?.complement}
            {...register('businessInfo.address.complement')}
          />
          
          <FormInput
            label="Bairro"
            id="neighborhood"
            error={errors.businessInfo?.address?.neighborhood}
            {...register('businessInfo.address.neighborhood')}
            required
          />
          
          <FormInput
            label="Cidade"
            id="city"
            error={errors.businessInfo?.address?.city}
            {...register('businessInfo.address.city')}
            required
          />
          
          <FormSelect
            label="Estado"
            id="state"
            error={errors.businessInfo?.address?.state}
            {...register('businessInfo.address.state')}
            options={BR_STATES.map(state => ({
              value: state.uf,
              label: state.name,
            }))}
            required
          />
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
