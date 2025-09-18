'use client';

import { useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Search, Package, ShoppingCart, LayoutGrid, List, Settings } from 'lucide-react';
import Image from 'next/image';

// Components
import { 
  ResponsiveContainer, 
  ResponsivePageHeader,
  ResponsiveCard,
  ResponsiveGrid
} from '@/components/ui/responsive-layout';
import { 
  ResponsiveButton, 
  ResponsiveInput, 
  ResponsiveSelect 
} from '@/components/ui/responsive-forms';
import { ProductGrid } from '@/components/ui/product-card';
import { AdaptiveModal } from '@/components/ui/responsive-modal';
import { useMobileLayout } from '@/hooks/use-media-query';

// Types
import type { Store, Category } from '@/types/store';
import type { Product } from '@/components/ui/product-card';


interface StorePageClientProps {
  store: Store;
}

export default function StorePageClient({ store }: StorePageClientProps) {
  const router = useRouter();
  const params = useParams();
  const isMobileLayout = useMobileLayout();
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get all products with category info
  const products: Product[] = useMemo(() => {
    return store.categories.flatMap(category => 
      category.items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.image,
        category: category.name,
        inStock: item.isAvailable
      }))
    );
  }, [store.categories]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = searchQuery 
        ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        : true;
      
      const matchesCategory = selectedCategory !== 'all' 
        ? product.category === selectedCategory
        : true;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Handlers
  const handleEditProduct = useCallback((product: Product) => {
    router.push(`/dashboard/store/${params.id}/product/${product.id}/edit`);
  }, [params.id, router]);

  const handleDeleteProduct = useCallback(async (product: Product) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        setIsLoading(true);
        // TODO: Implement delete logic
        console.log('Deleting product:', product.id);
        // In a real app, you would await an API call here
        // await deleteProduct(product.id);
      } catch (error) {
        console.error('Error deleting product:', error);
        // In a real app, you might want to show an error toast here
        // toast.error('Falha ao excluir o produto');
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  // Get all items from categories and transform them to match the Product interface
  const products: Product[] = useMemo(() => {
    return store.categories.flatMap(category => 
      category.items.map(item => {
        // Create a new object with only the properties we need
        const product: Product = {
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          imageUrl: item.image,
          category: category.name,
          inStock: item.isAvailable
        };
        return product;
      })
    );
  }, [store.categories]);

  // Render
  return (
    <div className="min-h-screen bg-background">
      {/* Store Header */}
      <StoreHeader 
        store={store}
        productCount={products.length}
        onSettingsClick={() => router.push(`/dashboard/store/${params.id}/edit`)}
        onAddProduct={() => setShowNewProductModal(true)}
      />

      {/* Filters */}
      <StoreFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={store.categories}
        layout={layout}
        onLayoutChange={setLayout}
        isMobileLayout={isMobileLayout}
      />

      {/* Products Grid */}
      <ResponsiveContainer size="xl" padding="md" className="mt-6">
        {filteredProducts.length === 0 ? (
          <EmptyState 
            hasSearch={!!searchQuery || selectedCategory !== 'all'}
            onAddProduct={() => setShowNewProductModal(true)}
          />
        ) : (
          <ProductGrid
            products={filteredProducts}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            layout={isMobileLayout ? 'grid' : layout}
            loading={isLoading}
          />
        )}
      </ResponsiveContainer>

      {/* New Product Modal */}
      <AdaptiveModal
        isOpen={showNewProductModal}
        onClose={() => setShowNewProductModal(false)}
        title="Novo Produto"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Formulário de novo produto será implementado aqui.
          </p>
          <div className="flex justify-end gap-3">
            <ResponsiveButton
              variant="outline"
              onClick={() => setShowNewProductModal(false)}
            >
              Cancelar
            </ResponsiveButton>
            <ResponsiveButton
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Adicionar Produto
            </ResponsiveButton>
          </div>
        </div>
      </AdaptiveModal>
    </div>
  );
}

// Sub-components
const StoreHeader = ({ store, productCount, onSettingsClick, onAddProduct }: any) => (
  <div className="relative">
    <div className="relative h-32 sm:h-48 lg:h-64 bg-gradient-to-r from-primary/20 to-primary/10">
      {store.coverImage && (
        <Image
          src={store.coverImage}
          alt={`${store.name} capa`}
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
    </div>

    <ResponsiveContainer size="xl" padding="md">
      <div className="relative -mt-16 sm:-mt-20">
        <ResponsiveCard padding="lg" className="bg-card/95 backdrop-blur">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 lg:h-32 lg:w-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {store.profileImage ? (
                <Image
                  src={store.profileImage}
                  alt={store.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <ResponsivePageHeader
                title={store.name}
                description={store.description}
                actions={
                  <div className="flex flex-wrap gap-2">
                    <ResponsiveButton
                      variant="outline"
                      size="sm"
                      leftIcon={<Settings className="h-4 w-4" />}
                      onClick={onSettingsClick}
                    >
                      Configurações
                    </ResponsiveButton>
                    <ResponsiveButton
                      variant="primary"
                      size="sm"
                      leftIcon={<Plus className="h-4 w-4" />}
                      onClick={onAddProduct}
                    >
                      Novo Produto
                    </ResponsiveButton>
                  </div>
                }
              />
              
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {productCount} {productCount === 1 ? 'produto' : 'produtos'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {store.categories.length} {store.categories.length === 1 ? 'categoria' : 'categorias'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ResponsiveCard>
      </div>
    </ResponsiveContainer>
  </div>
);

const StoreFilters = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  layout,
  onLayoutChange,
  isMobileLayout,
}: any) => (
  <ResponsiveContainer size="xl" padding="md" className="mt-6">
    <ResponsiveCard padding={isMobileLayout ? 'sm' : 'md'}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <ResponsiveInput
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e: any) => onSearchChange(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              size={isMobileLayout ? 'lg' : 'md'}
            />
          </div>
          
          <div className="flex gap-2">
            <ResponsiveSelect
              value={selectedCategory}
              onChange={(e: any) => onCategoryChange(e.target.value)}
              size={isMobileLayout ? 'lg' : 'md'}
              className="flex-1 sm:flex-none sm:w-48"
              options={[
                { value: 'all', label: 'Todas as categorias' },
                ...categories.map((category: any) => ({
                  value: category.id,
                  label: category.name
                }))
              ]}
            />

            {!isMobileLayout && (
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => onLayoutChange('grid')}
                  className={`p-2 rounded transition-colors ${
                    layout === 'grid' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-label="Visualização em grade"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onLayoutChange('list')}
                  className={`p-2 rounded transition-colors ${
                    layout === 'list' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-label="Visualização em lista"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ResponsiveCard>
  </ResponsiveContainer>
);

const EmptyState = ({ hasSearch, onAddProduct }: any) => (
  <ResponsiveCard padding="lg" className="text-center">
    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
    <h3 className="text-lg font-medium text-foreground mb-2">
      {hasSearch ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
    </h3>
    <p className="text-muted-foreground mb-4">
      {hasSearch 
        ? 'Tente ajustar os filtros de busca.'
        : 'Adicione seu primeiro produto para começar.'}
    </p>
    {!hasSearch && (
      <ResponsiveButton
        variant="primary"
        leftIcon={<Plus className="h-4 w-4" />}
        onClick={onAddProduct}
      >
        Adicionar Produto
      </ResponsiveButton>
    )}
  </ResponsiveCard>
);
