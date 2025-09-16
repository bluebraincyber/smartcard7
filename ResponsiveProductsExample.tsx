'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Search, Filter, Grid, List, SlidersHorizontal } from 'lucide-react'

// Import our responsive components
import { ResponsiveContainer, ResponsivePageHeader, ResponsiveCard } from '@/components/ui/ResponsiveLayout'
import { ResponsiveInput, ResponsiveButton } from '@/components/ui/ResponsiveForms'
import { ProductGrid } from '@/components/ui/ProductCard'
import { AdaptiveModal } from '@/components/ui/ResponsiveModal'
import { BottomNavigation } from '@/components/navigation/BottomNavigation'
import { useResponsive, useMobileLayout } from '@/hooks/useResponsive'

// Example product interface
interface Product {
  id: string
  name: string
  price: number
  description?: string
  imageUrl?: string
  category?: string
  inStock: boolean
}

export default function ResponsiveProductsExample() {
  const params = useParams()
  const storeId = params.id as string
  
  // Responsive hooks
  const { isMobile } = useResponsive()
  const isMobileLayout = useMobileLayout()
  
  // State
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)

  // Mock data for demonstration
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Produto Exemplo 1',
        price: 29.99,
        description: 'Descrição do produto exemplo',
        category: 'Categoria A',
        inStock: true,
        imageUrl: '/placeholder-product.jpg'
      },
      {
        id: '2',
        name: 'Produto Exemplo 2',
        price: 45.50,
        description: 'Outra descrição interessante',
        category: 'Categoria B',
        inStock: false,
      },
      // Add more mock products...
    ]

    setTimeout(() => {
      setProducts(mockProducts)
      setLoading(false)
    }, 1000)
  }, [])

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)))

  const handleEditProduct = (product: Product) => {
    console.log('Edit product:', product)
  }

  const handleDeleteProduct = (product: Product) => {
    console.log('Delete product:', product)
  }

  const handleViewProduct = (product: Product) => {
    console.log('View product:', product)
  }

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveContainer size="full" padding="none">
        {/* Header */}
        <div className="space-mobile border-b border-border bg-card">
          <ResponsivePageHeader
            title="Produtos"
            description={`${filteredProducts.length} produtos encontrados`}
            actions={
              <div className="flex items-center gap-2">
                {/* Layout Toggle - Desktop Only */}
                {!isMobileLayout && (
                  <div className="flex bg-muted rounded-lg p-1">
                    <button
                      onClick={() => setLayout('grid')}
                      className={`p-2 rounded transition-colors ${
                        layout === 'grid' 
                          ? 'bg-background shadow-sm text-primary' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      aria-label="Visualização em grid"
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setLayout('list')}
                      className={`p-2 rounded transition-colors ${
                        layout === 'list' 
                          ? 'bg-background shadow-sm text-primary' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      aria-label="Visualização em lista"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Add Product Button */}
                <ResponsiveButton
                  onClick={() => setShowAddProduct(true)}
                  leftIcon={<Plus className="h-4 w-4" />}
                  size={isMobileLayout ? 'sm' : 'md'}
                >
                  {isMobileLayout ? 'Novo' : 'Novo Produto'}
                </ResponsiveButton>
              </div>
            }
          />
        </div>

        {/* Search and Filters */}
        <div className="space-mobile border-b border-border bg-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <ResponsiveInput
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                size={isMobileLayout ? 'md' : 'lg'}
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              {/* Mobile Filter Button */}
              {iMobileLayout ? (
                <ResponsiveButton
                  variant="outline"
                  onClick={() => setShowFilters(true)}
                  leftIcon={<SlidersHorizontal className="h-4 w-4" />}
                  size="md"
                >
                  Filtros
                </ResponsiveButton>
              ) : (
                /* Desktop Filters */
                <div className="flex items-center gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="form-input h-10 text-sm"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {(selectedCategory || searchQuery) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchQuery && (
                <span className="chip">
                  Busca: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="chip">
                  Categoria: {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="space-mobile">
          <ProductGrid
            products={filteredProducts}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onView={handleViewProduct}
            layout={layout}
            loading={loading}
            emptyMessage="Nenhum produto encontrado. Que tal adicionar o primeiro?"
          />
        </div>

        {/* Mobile Filters Modal */}
        <AdaptiveModal
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          title="Filtros"
          drawerPosition="bottom"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setShowFilters(false)
                }}
                className="form-input w-full"
              >
                <option value="">Todas as categorias</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border">
              <ResponsiveButton
                variant="outline"
                onClick={() => {
                  setSelectedCategory('')
                  setShowFilters(false)
                }}
                fullWidth
              >
                Limpar
              </ResponsiveButton>
              <ResponsiveButton
                onClick={() => setShowFilters(false)}
                fullWidth
              >
                Aplicar
              </ResponsiveButton>
            </div>
          </div>
        </AdaptiveModal>

        {/* Add Product Modal */}
        <AdaptiveModal
          isOpen={showAddProduct}
          onClose={() => setShowAddProduct(false)}
          title="Novo Produto"
          size="lg"
        >
          <AddProductForm onClose={() => setShowAddProduct(false)} />
        </AdaptiveModal>

        {/* Bottom Navigation - Mobile Only */}
        <BottomNavigation storeId={storeId} />
      </ResponsiveContainer>
    </div>
  )
}

// Add Product Form Component
function AddProductForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    inStock: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form data:', formData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ResponsiveInput
        label="Nome do Produto"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Digite o nome do produto"
      />

      <ResponsiveInput
        label="Preço"
        type="number"
        required
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        placeholder="0,00"
        hint="Use ponto como separador decimal"
      />

      <ResponsiveInput
        label="Categoria"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        placeholder="Digite a categoria"
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Descrição
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descreva o produto..."
          rows={3}
          className="form-input w-full resize-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="inStock"
          checked={formData.inStock}
          onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary/50"
        />
        <label htmlFor="inStock" className="text-sm text-foreground">
          Produto em estoque
        </label>
      </div>

      <div className="flex gap-2 pt-4">
        <ResponsiveButton
          type="button"
          variant="outline"
          onClick={onClose}
          fullWidth
        >
          Cancelar
        </ResponsiveButton>
        <ResponsiveButton
          type="submit"
          fullWidth
        >
          Salvar Produto
        </ResponsiveButton>
      </div>
    </form>
  )
}
