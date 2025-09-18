import { z } from 'zod'

// Business Info Schema
export const businessInfoSchema = z.object({
  businessName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  businessEmail: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  address: z.object({
    street: z.string().min(2, 'Endereço inválido'),
    number: z.string().min(1, 'Número é obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, 'Bairro é obrigatório'),
    city: z.string().min(2, 'Cidade é obrigatória'),
    state: z.string().length(2, 'Estado deve ter 2 caracteres'),
    zipCode: z.string().min(8, 'CEP inválido'),
  }),
})

export type BusinessInfo = z.infer<typeof businessInfoSchema>

// Template Selection Schema
export const templateSelectionSchema = z.object({
  templateId: z.string().min(1, 'Selecione um template'),
  primaryColor: z.string().min(1, 'Cor primária é obrigatória'),
  secondaryColor: z.string().optional(),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
})

export type TemplateSelection = z.infer<typeof templateSelectionSchema>

// Product Schema
export const productSchema = z.object({
  products: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(2, 'Nome do produto é obrigatório'),
      description: z.string().optional(),
      price: z.number().min(0, 'Preço não pode ser negativo'),
      category: z.string().min(1, 'Categoria é obrigatória'),
      image: z.string().optional(),
      isActive: z.boolean().default(true),
    })
  ),
})

export type Product = z.infer<typeof productSchema>['products'][number]
export type Products = z.infer<typeof productSchema>

// Onboarding Data (combined schema)
export const onboardingSchema = z.object({
  businessInfo: businessInfoSchema,
  template: templateSelectionSchema,
  products: productSchema,
})

export type OnboardingData = z.infer<typeof onboardingSchema
