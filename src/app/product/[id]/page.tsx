'use client';

import React from 'react';
import { AppBar, Price, QuantityStepper } from '@/components/molecules';
import { Button, Badge, ImageThumb, Text, Card, CardContent, Chip, Divider } from '@/components/ui';
import { cn } from '@/lib/utils';

// Mock data - em produção viria de uma API
const mockProduct = {
  id: '1',
  name: 'Big King',
  price: 24.90,
  originalPrice: 29.90,
  images: [
    '/images/big-king-1.jpg',
    '/images/big-king-2.jpg',
    '/images/big-king-3.jpg'
  ],
  category: 'Hambúrgueres',
  rating: 4.8,
  reviewCount: 324,
  discount: 17,
  badge: 'Mais Vendido',
  description: 'Dois hambúrgueres de carne bovina grelhados na chama, queijo derretido, alface fresca, cebola, picles crocantes e nosso molho especial Big King em um pão com gergelim.',
  ingredients: ['Pão com gergelim', 'Carne bovina (2x)', 'Queijo cheddar', 'Alface', 'Cebola', 'Picles', 'Molho Big King'],
  nutritionalInfo: {
    calories: 650,
    protein: 35,
    carbs: 45,
    fat: 38,
    sodium: 1200
  },
  allergens: ['Glúten', 'Leite', 'Soja'],
  preparationTime: '8-12 min',
  restaurant: {
    id: '1',
    name: 'Burger King Centro'
  }
};

const mockCustomizations = [
  {
    id: 'size',
    name: 'Tamanho',
    required: true,
    type: 'single' as const,
    options: [
      { id: 'small', name: 'Pequeno', price: 0, selected: false },
      { id: 'medium', name: 'Médio', price: 3.00, selected: true },
      { id: 'large', name: 'Grande', price: 6.00, selected: false }
    ]
  },
  {
    id: 'extras',
    name: 'Adicionais',
    required: false,
    type: 'multiple' as const,
    options: [
      { id: 'bacon', name: 'Bacon', price: 4.00, selected: false },
      { id: 'cheese', name: 'Queijo Extra', price: 2.50, selected: false },
      { id: 'egg', name: 'Ovo', price: 3.00, selected: false },
      { id: 'onion-rings', name: 'Anéis de Cebola', price: 3.50, selected: false }
    ]
  },
  {
    id: 'removals',
    name: 'Remover Ingredientes',
    required: false,
    type: 'multiple' as const,
    options: [
      { id: 'no-onion', name: 'Sem Cebola', price: 0, selected: false },
      { id: 'no-pickles', name: 'Sem Picles', price: 0, selected: false },
      { id: 'no-sauce', name: 'Sem Molho', price: 0, selected: false }
    ]
  }
];

export default function ProductPage() {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);
  const [customizations, setCustomizations] = React.useState(mockCustomizations);
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [showNutrition, setShowNutrition] = React.useState(false);
  const [specialInstructions, setSpecialInstructions] = React.useState('');

  // Calcular preço total com customizações
  const calculateTotalPrice = () => {
    let total = mockProduct.price;
    
    customizations.forEach(customization => {
      customization.options.forEach(option => {
        if (option.selected) {
          total += option.price;
        }
      });
    });
    
    return total * quantity;
  };

  const handleCustomizationChange = (customizationId: string, optionId: string) => {
    setCustomizations(prev => 
      prev.map(customization => {
        if (customization.id === customizationId) {
          if (customization.type === 'single') {
            // Para seleção única, desmarcar todas e marcar apenas a selecionada
            return {
              ...customization,
              options: customization.options.map(option => ({
                ...option,
                selected: option.id === optionId
              }))
            };
          } else {
            // Para seleção múltipla, alternar o estado da opção
            return {
              ...customization,
              options: customization.options.map(option => 
                option.id === optionId 
                  ? { ...option, selected: !option.selected }
                  : option
              )
            };
          }
        }
        return customization;
      })
    );
  };

  const validateCustomizations = () => {
    const errors: string[] = [];
    
    customizations.forEach(customization => {
      if (customization.required) {
        const hasSelection = customization.options.some(option => option.selected);
        if (!hasSelection) {
          errors.push(`${customization.name} é obrigatório`);
        }
      }
    });
    
    return errors;
  };

  const handleAddToCart = () => {
    const errors = validateCustomizations();
    
    if (errors.length > 0) {
      alert(`Erro: ${errors.join(', ')}`);
      return;
    }
    
    const cartItem = {
      productId: mockProduct.id,
      quantity,
      customizations: customizations.filter(c => 
        c.options.some(o => o.selected)
      ),
      specialInstructions,
      totalPrice: calculateTotalPrice()
    };
    
    console.log('Adicionando ao carrinho:', cartItem);
    // Implementar lógica do carrinho
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App Bar */}
      <AppBar
        title={mockProduct.name}
        showBack
        showFavorite
        isFavorite={isFavorite}
        onFavoriteClick={() => setIsFavorite(!isFavorite)}
        className="sticky top-0 z-50"
      />

      {/* Product Images */}
      <div className="relative">
        <div className="aspect-square bg-white">
          <ImageThumb
            src={mockProduct.images[currentImageIndex]}
            alt={mockProduct.name}
            size="xl"
            variant="square"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Image indicators */}
        {mockProduct.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {mockProduct.images.map((_, index) => (
              <button
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                )}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {mockProduct.badge && (
            <Badge variant="primary" size="sm">{mockProduct.badge}</Badge>
          )}
          {mockProduct.discount && (
            <Badge variant="destructive" size="sm">-{mockProduct.discount}%</Badge>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Product Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Text size="sm" color="muted">{mockProduct.category}</Text>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">⭐</span>
              <Text size="sm">{mockProduct.rating} ({mockProduct.reviewCount})</Text>
            </div>
          </div>
          
          <Text size="xl" weight="bold" className="mb-2">
            {mockProduct.name}
          </Text>
          
          <Text size="sm" color="muted" className="mb-4">
            {mockProduct.description}
          </Text>
          
          <Price
            value={mockProduct.price}
            originalValue={mockProduct.originalPrice}
            size="lg"
          />
        </div>

        <Divider />

        {/* Customizations */}
        <div className="space-y-6">
          {customizations.map((customization) => (
            <div key={customization.id}>
              <div className="flex items-center gap-2 mb-3">
                <Text size="lg" weight="semibold">
                  {customization.name}
                </Text>
                {customization.required && (
                  <Chip size="sm" variant="destructive">Obrigatório</Chip>
                )}
              </div>
              
              <div className="space-y-2">
                {customization.options.map((option) => (
                  <Card
                    key={option.id}
                    className={cn(
                      'cursor-pointer transition-all duration-200',
                      option.selected 
                        ? 'ring-2 ring-red-500 bg-red-50' 
                        : 'hover:bg-gray-50'
                    )}
                    onClick={() => handleCustomizationChange(customization.id, option.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-5 h-5 rounded border-2 flex items-center justify-center',
                            customization.type === 'single' ? 'rounded-full' : 'rounded',
                            option.selected 
                              ? 'bg-red-500 border-red-500' 
                              : 'border-gray-300'
                          )}>
                            {option.selected && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <Text weight="medium">{option.name}</Text>
                        </div>
                        
                        {option.price > 0 && (
                          <Text size="sm" color="muted">
                            +R$ {option.price.toFixed(2)}
                          </Text>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Divider />

        {/* Special Instructions */}
        <div>
          <Text size="lg" weight="semibold" className="mb-3">
            Observações Especiais
          </Text>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="Ex: Sem cebola, ponto da carne bem passado..."
            className="w-full p-3 rounded-lg resize-none bg-gray-100 shadow-inner shadow-lg focus:outline-none"
            rows={3}
            maxLength={200}
          />
          <Text size="xs" color="muted" className="mt-1">
            {specialInstructions.length}/200 caracteres
          </Text>
        </div>

        <Divider />

        {/* Nutritional Info */}
        <div>
          <button
            onClick={() => setShowNutrition(!showNutrition)}
            className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Text weight="semibold">Informações Nutricionais</Text>
            <span className={cn(
              'transform transition-transform',
              showNutrition ? 'rotate-180' : ''
            )}>
              ▼
            </span>
          </button>
          
          {showNutrition && (
            <div className="mt-3 p-3 bg-white rounded-lg border">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Text size="sm" color="muted">Calorias</Text>
                  <Text weight="semibold">{mockProduct.nutritionalInfo.calories} kcal</Text>
                </div>
                <div>
                  <Text size="sm" color="muted">Proteínas</Text>
                  <Text weight="semibold">{mockProduct.nutritionalInfo.protein}g</Text>
                </div>
                <div>
                  <Text size="sm" color="muted">Carboidratos</Text>
                  <Text weight="semibold">{mockProduct.nutritionalInfo.carbs}g</Text>
                </div>
                <div>
                  <Text size="sm" color="muted">Gorduras</Text>
                  <Text weight="semibold">{mockProduct.nutritionalInfo.fat}g</Text>
                </div>
              </div>
              
              <Divider className="my-3" />
              
              <div>
                <Text size="sm" color="muted" className="mb-2">Alérgenos</Text>
                <div className="flex flex-wrap gap-1">
                  {mockProduct.allergens.map((allergen) => (
                    <Chip key={allergen} size="sm" variant="secondary">
                      {allergen}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Text size="sm" color="muted">Quantidade</Text>
            <QuantityStepper
              value={quantity}
              min={1}
              max={10}
              onChange={setQuantity}
              size="md"
            />
          </div>
          
          <div className="text-right">
            <Text size="sm" color="muted">Total</Text>
            <Price
              value={calculateTotalPrice()}
              size="lg"
              variant="prominent"
            />
          </div>
        </div>
        
        <Button
          size="lg"
          className="w-full"
          onClick={handleAddToCart}
        >
          Adicionar ao Carrinho
        </Button>
      </div>
    </div>
  );
}