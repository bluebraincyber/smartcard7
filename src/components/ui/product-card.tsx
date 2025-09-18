'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Edit, Trash2, Eye, MoreVertical, Package } from 'lucide-react'

export interface Product {
  id: string
  name: string
  price: number
  description?: string
  imageUrl?: string
  category?: string
  inStock: boolean
}

interface ProductCardProps {
  product: Product
  onEdit?: (product: Product) => void | Promise<void>
  onDelete?: (product: Product) => void | Promise<void>
  onView?: (product: Product) => void | Promise<void>
  className?: string
  layout?: 'grid' | 'list'
}

export function ProductCard({ 
  product, 
  onEdit, 
  onDelete, 
  onView,
  className = '',
  layout = 'grid'
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const actionsRef = useRef<HTMLDivElement>(null)

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  if (layout === 'list') {
    return (
      <div className={`
        card-responsive card-hover bg-card border border-border
        p-4 flex items-center gap-4
        ${className}
      `}>
        {/* Image */}
        <div className="relative w-16 h-16 flex-shrink-0">
          {product.imageUrl && !imageError ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 64px, 64px"
              className="img-responsive rounded-lg object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="img-placeholder w-16 h-16 rounded-lg">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          
          {/* Stock indicator */}
          {!product.inStock && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-blue rounded-full" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">
            {product.name}
          </h3>
          {product.category && (
            <p className="text-sm text-muted-foreground">
              {product.category}
            </p>
          )}
          <p className="text-lg font-semibold text-primary">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* Actions */}
        <div className="relative" ref={actionsRef}>
          <button
            onClick={() => setShowActions(!showActions)}
            className="touch-target rounded-lg hover:bg-muted transition-colors duration-200"
            aria-label="Mais opções"
          >
            <MoreVertical className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Actions Menu */}
          {showActions && (
            <div className="
              absolute right-0 top-12 z-10 w-48
              bg-card border border-border rounded-lg shadow-lg
              py-2 fade-in
            ">
              {onView && (
                <button
                  onClick={() => {
                    onView(product)
                    setShowActions(false)
                  }}
                  className="
                    w-full px-4 py-2 text-left text-sm hover:bg-muted
                    transition-colors duration-200 flex items-center gap-2
                  "
                >
                  <Eye className="h-4 w-4" />
                  Visualizar
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => {
                    onEdit(product)
                    setShowActions(false)
                  }}
                  className="
                    w-full px-4 py-2 text-left text-sm hover:bg-muted
                    transition-colors duration-200 flex items-center gap-2
                  "
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => {
                    onDelete(product)
                    setShowActions(false)
                  }}
                  className="
                    w-full px-4 py-2 text-left text-sm hover:bg-brand-blue/10 dark:hover:bg-brand-blue/20
                    transition-colors duration-200 flex items-center gap-2
                    text-brand-blue dark:text-brand-blue/90
                  "
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Grid layout (default)
  return (
    <div className={`
      card-responsive card-hover bg-card border border-border
      overflow-hidden group
      ${className}
    `}>
      {/* Image */}
      <div className="relative aspect-square bg-muted">
        {product.imageUrl && !imageError ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="img-responsive object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="img-placeholder aspect-square">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        
        {/* Stock indicator */}
        {!product.inStock && (
          <div className="absolute top-2 right-2">
            <div className="bg-brand-blue text-white px-2 py-1 rounded-full text-xs font-medium">
              Fora de estoque
            </div>
          </div>
        )}

        {/* Actions overlay - shown on hover/focus */}
        <div className="
          absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
          md:group-hover:opacity-100 transition-opacity duration-200
          flex items-center justify-center gap-2
        ">
          {onView && (
            <button
              onClick={() => onView(product)}
              className="
                touch-target bg-white/90 hover:bg-white rounded-lg
                transition-colors duration-200
              "
              aria-label="Visualizar produto"
            >
              <Eye className="h-5 w-5 text-gray-800" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(product)}
              className="
                touch-target bg-white/90 hover:bg-white rounded-lg
                transition-colors duration-200
              "
              aria-label="Editar produto"
            >
              <Edit className="h-5 w-5 text-gray-800" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(product)}
              className="
                touch-target bg-white/90 hover:bg-white rounded-lg
                transition-colors duration-200
              "
              aria-label="Excluir produto"
            >
              <Trash2 className="h-5 w-5 text-brand-blue" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-foreground line-clamp-2 text-sm sm:text-base">
            {product.name}
          </h3>
          
          {/* Mobile actions button */}
          <div className="md:hidden relative" ref={actionsRef}>
            <button
              onClick={() => setShowActions(!showActions)}
              className="touch-target rounded-lg hover:bg-muted transition-colors duration-200 flex-shrink-0"
              aria-label="Mais opções"
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Mobile Actions Menu */}
            {showActions && (
              <div className="
                absolute right-0 top-12 z-10 w-36
                bg-card border border-border rounded-lg shadow-lg
                py-2 fade-in
              ">
                {onView && (
                  <button
                    onClick={() => {
                      onView(product)
                      setShowActions(false)
                    }}
                    className="
                      w-full px-3 py-2 text-left text-sm hover:bg-muted
                      transition-colors duration-200 flex items-center gap-2
                    "
                  >
                    <Eye className="h-4 w-4" />
                    Ver
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(product)
                      setShowActions(false)
                    }}
                    className="
                      w-full px-3 py-2 text-left text-sm hover:bg-muted
                      transition-colors duration-200 flex items-center gap-2
                    "
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete(product)
                      setShowActions(false)
                    }}
                    className="
                      w-full px-3 py-2 text-left text-sm hover:bg-brand-blue/10 dark:hover:bg-brand-blue/20
                      transition-colors duration-200 flex items-center gap-2
                      text-brand-blue dark:text-brand-blue/90
                    "
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {product.category && (
          <p className="text-xs sm:text-sm text-muted-foreground">
            {product.category}
          </p>
        )}

        {product.description && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <p className="text-lg font-semibold text-primary">
            {formatPrice(product.price)}
          </p>
          
          {!product.inStock && (
            <span className="text-xs text-brand-blue dark:text-brand-blue/90 font-medium">
              Sem estoque
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Grid container for products
interface ProductGridProps {
  products: Product[]
  onEdit?: (product: Product) => void | Promise<void>
  onDelete?: (product: Product) => void | Promise<void>
  onView?: (product: Product) => void | Promise<void>
  layout?: 'grid' | 'list'
  loading?: boolean
  emptyMessage?: string
  className?: string
}

export function ProductGrid({ 
  products, 
  onEdit, 
  onDelete, 
  onView,
  layout = 'grid',
  loading = false,
  emptyMessage = 'Nenhum produto encontrado',
  className = ''
}: ProductGridProps) {
  
  if (loading) {
    return (
      <div className={`
        ${layout === 'grid' 
          ? 'grid-responsive' 
          : 'flex flex-col gap-4'
        }
        ${className}
      `}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card-responsive overflow-hidden">
            {layout === 'grid' ? (
              <>
                <div className="aspect-square loading-placeholder" />
                <div className="p-4 space-y-2">
                  <div className="h-4 loading-placeholder rounded" />
                  <div className="h-3 w-2/3 loading-placeholder rounded" />
                  <div className="h-5 w-1/2 loading-placeholder rounded" />
                </div>
              </>
            ) : (
              <div className="p-4 flex items-center gap-4">
                <div className="w-16 h-16 loading-placeholder rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 loading-placeholder rounded" />
                  <div className="h-3 w-2/3 loading-placeholder rounded" />
                  <div className="h-5 w-1/2 loading-placeholder rounded" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={`
      ${layout === 'grid' 
        ? 'grid-responsive' 
        : 'flex flex-col gap-4'
      }
      ${className}
    `}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          layout={layout}
        />
      ))}
    </div>
  )
}
