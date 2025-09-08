'use client';

import React from 'react';
import { AppBar, TabBar, ProductCard } from '@/components/molecules';
import { Button, Badge, ImageThumb, Text, Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';

// Mock data - em produção viria de uma API
const mockRestaurant = {
  id: '1',
  name: 'Burger King',
  image: '/images/restaurant-hero.jpg',
  rating: 4.5,
  reviewCount: 1250,
  deliveryTime: '25-35 min',
  deliveryFee: 4.99,
  minOrder: 15.00,
  category: 'Fast Food',
  isOpen: true,
  description: 'Os melhores hambúrgueres da cidade com ingredientes frescos e sabor incomparável.',
  address: 'Rua das Flores, 123 - Centro',
  phone: '(11) 99999-9999'
};

const mockTabs = [
  { id: 'promocoes', label: 'Promoções', count: 5 },
  { id: 'burgers', label: 'Hambúrgueres', count: 12 },
  { id: 'acompanhamentos', label: 'Acompanhamentos', count: 8 },
  { id: 'bebidas', label: 'Bebidas', count: 15 },
  { id: 'sobremesas', label: 'Sobremesas', count: 6 }
];

const mockProducts = [
  {
    id: '1',
    name: 'Big King',
    price: 24.90,
    originalPrice: 29.90,
    image: '/images/big-king.jpg',
    category: 'Hambúrgueres',
    rating: 4.8,
    reviewCount: 324,
    discount: 17,
    badge: 'Mais Vendido',
    description: 'Dois hambúrgueres de carne bovina, queijo, alface, cebola, picles e molho especial'
  },
  {
    id: '2',
    name: 'Whopper',
    price: 22.90,
    image: '/images/whopper.jpg',
    category: 'Hambúrgueres',
    rating: 4.6,
    reviewCount: 256,
    isNew: true,
    description: 'Hambúrguer de carne bovina grelhada, tomate, alface, maionese, ketchup, cebola e picles'
  },
  {
    id: '3',
    name: 'Batata Frita Grande',
    price: 8.90,
    image: '/images/batata-frita.jpg',
    category: 'Acompanhamentos',
    rating: 4.4,
    reviewCount: 189,
    description: 'Batatas fritas crocantes e douradas'
  }
];

const mockCoupon = {
  title: '20% OFF',
  description: 'Em pedidos acima de R$ 30',
  code: 'SAVE20',
  validUntil: '2024-12-31',
  backgroundColor: 'bg-gradient-to-r from-red-500 to-red-600'
};



export default function RestaurantPage() {
  const [activeTab, setActiveTab] = React.useState('promocoes');
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearchActive, setIsSearchActive] = React.useState(false);

  const handleFavoriteToggle = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const handleAddToCart = (productId: string) => {
    // Implementar lógica do carrinho
    console.log('Adicionando ao carrinho:', productId);
  };

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'promocoes' 
      ? product.originalPrice || product.discount
      : product.category.toLowerCase().includes(activeTab.toLowerCase());
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App Bar */}
      <AppBar
        title={isSearchActive ? '' : mockRestaurant.name}
        showBack
        showSearch
        showFavorite
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchToggle={setIsSearchActive}
        className="sticky top-0 z-50"
      />

      {/* Hero Section */}
      {!isSearchActive && (
        <div className="relative h-48 bg-gradient-to-b from-gray-900/50 to-transparent">
          <ImageThumb
            src={mockRestaurant.image}
            alt={mockRestaurant.name}
            size="xl"
            variant="square"
            className="w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant={mockRestaurant.isOpen ? 'success' : 'destructive'}
                size="sm"
              >
                {mockRestaurant.isOpen ? 'Aberto' : 'Fechado'}
              </Badge>
              <Text size="sm" className="text-white/90">
                {mockRestaurant.category}
              </Text>
            </div>
            
            <Text size="lg" weight="bold" className="text-white mb-1">
              {mockRestaurant.name}
            </Text>
            
            <div className="flex items-center gap-4 text-sm text-white/90">
              <span>⭐ {mockRestaurant.rating} ({mockRestaurant.reviewCount})</span>
              <span>🕒 {mockRestaurant.deliveryTime}</span>
              <span>🚚 R$ {mockRestaurant.deliveryFee.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Banner */}
      {!isSearchActive && (
        <div className="p-4">
          <Card className={cn(
            'relative overflow-hidden text-white',
            mockCoupon.backgroundColor
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Text size="lg" weight="bold" className="text-white mb-1">
                    {mockCoupon.title}
                  </Text>
                  <Text size="sm" className="text-white/90">
                    {mockCoupon.description}
                  </Text>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  Usar Cupom
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="sticky top-16 z-40 bg-white">
        <TabBar
          tabs={mockTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="underline"
          scrollable
        />
      </div>

      {/* Products List */}
      <div className="p-4">
        {isSearchActive && (
          <Text size="sm" color="muted" className="mb-4">
            {filteredProducts.length} resultados para &quot;{searchQuery}&quot;
          </Text>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              originalPrice={product.originalPrice}
              image={product.image}
              category={product.category}
              rating={product.rating}
              reviewCount={product.reviewCount}
              discount={product.discount}
              badge={product.badge}
              isNew={product.isNew}
              isFavorite={favorites.has(product.id)}
              size="md"
              variant="default"
              onFavoriteClick={() => handleFavoriteToggle(product.id)}
              onAddToCart={() => handleAddToCart(product.id)}
              onClick={() => {
                // Navegar para PDP
                console.log('Navegando para produto:', product.id);
              }}
            />
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Text color="muted" className="mb-2">
              Nenhum produto encontrado
            </Text>
            <Text size="sm" color="muted">
              Tente buscar por outro termo ou categoria
            </Text>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          size="lg"
          className="rounded-full shadow-lg h-14 w-14 p-0"
        >
          🛒
        </Button>
      </div>
    </div>
  );
}