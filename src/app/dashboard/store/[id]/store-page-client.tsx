'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Plus, Trash2, Edit, ExternalLink, MoreVertical, Copy, Eye, Upload, X } from 'lucide-react';
import Image from 'next/image';
import StoreHeader from '@/components/store/StoreHeader';

// -----------------------------------------------------------
// TIPOS
// -----------------------------------------------------------

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isactive: boolean;
  isarchived?: boolean;
  categoryId?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  isactive: boolean;
  items: Product[];
}

interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  whatsapp: string;
  address?: string;
  primaryColor: string;
  isactive: boolean;
  image?: string;
  coverImage?: string;
  profileImage?: string;
  categories: Category[];
}

interface StoreManagerProps {
  store: Store;
}

// -----------------------------------------------------------
// COMPONENTES
// -----------------------------------------------------------

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleSwitch = ({ checked, onChange }: ToggleSwitchProps) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
  </label>
);

interface AdminProductCardProps {
  product: Product;
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
  onDuplicate: (product: Product) => void;
  onToggleActive?: () => void;
  onTogglePause?: (isPaused: boolean) => void;
}

const AdminProductCard: React.FC<AdminProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
  onTogglePause,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div className="relative bg-card/70 backdrop-blur-sm border border-border rounded-lg shadow-sm p-3 flex flex-col h-full">
      {/* Status Indicator */}
      <div
        className={`absolute top-2 left-2 w-3 h-3 rounded-full ${product.isactive ? 'bg-green-500' : 'bg-red-500'} border-2 border-background`}
        title={product.isactive ? 'Ativo' : 'Inativo'}
      />

      <div className="absolute top-2 right-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted/50 transition-colors"
          aria-label="Opções do produto"
          type="button"
        >
          <MoreVertical size={16} />
        </button>

        {isMenuOpen && (
          <div
            className="absolute right-0 mt-1 w-40 bg-card border border-border rounded-md shadow-lg z-10 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                onEdit(product.id);
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-muted/50 flex items-center"
              type="button"
            >
              <Edit size={14} className="mr-2" />
              Editar
            </button>
            <button
              onClick={() => {
                onDuplicate(product);
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-muted/50 flex items-center"
              type="button"
            >
              <Copy size={14} className="mr-2" />
              Duplicar
            </button>
            <button
              onClick={() => {
                onDelete(product.id);
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center"
              type="button"
            >
              <Trash2 size={14} className="mr-2" />
              Excluir
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center text-center flex-grow">
        <div className="relative w-16 h-16 rounded-full overflow-hidden mb-2 border-2 border-primary">
          <Image
            src={product.image || '/images/placeholder.png'}
            alt={product.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '/images/placeholder.png';
            }}
          />
        </div>

        <h3 className="text-sm font-bold line-clamp-1 mb-1 w-full">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 h-8 overflow-hidden w-full">{product.description}</p>
        )}
      </div>

      {/* Price at the bottom */}
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-base font-semibold text-primary text-center">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(product.price)}
        </p>
      </div>
    </div>
  );
};

interface AddItemCardProps {
  onClick: () => void;
}

const AddItemCard = ({ onClick }: AddItemCardProps) => (
  <div
    className="relative bg-card/70 backdrop-blur-sm border-2 border-dashed border-border/60 rounded-lg shadow-sm p-3 flex flex-col items-center justify-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all h-full min-h-[200px] group"
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && onClick()}
  >
    <div className="flex flex-col items-center justify-center text-center p-2">
      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
        <Plus size={24} className="group-hover:scale-110 transition-transform" />
      </div>
      <h3 className="text-sm font-medium text-foreground">Adicionar Produto</h3>
      <p className="text-xs text-muted-foreground mt-1">Clique para criar</p>
    </div>
  </div>
);

// -----------------------------------------------------------
// COMPONENTE PRINCIPAL
// -----------------------------------------------------------

const StoreManager: React.FC<StoreManagerProps> = ({ store: initialStore }) => {
  const [store, setStore] = useState<Store>(() => ({
    ...initialStore,
    categories:
      initialStore.categories?.map((category) => ({
        ...category,
        items: category.items || [],
      })) || [],
  }));

  useEffect(() => {
    setStore({
      ...initialStore,
      categories:
        initialStore.categories?.map((category) => ({
          ...category,
          items: category.items || [],
        })) || [],
    });
  }, [initialStore]);

  const [categoryActionsOpen, setCategoryActionsOpen] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const toggleCategoryStatus = useCallback(async (categoryId: string, isactive: boolean) => {
    try {
      console.log(`Toggling category ${categoryId} to ${!isactive}`);
      // TODO: Implement category status toggle
    } catch (error) {
      console.error('Error toggling category status:', error);
      // TODO: Show error message to user
    }
  }, []);

  const handleDeleteItem = useCallback((id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      setStore(prev => ({
        ...prev,
        categories: prev.categories.map(category => ({
          ...category,
          items: category.items.filter(item => item.id !== id)
        }))
      }));
      
      // TODO: Add API call to delete the item from the server
      // Example:
      // try {
      //   await fetch(`/api/products/${id}`, { method: 'DELETE' });
      // } catch (error) {
      //   console.error('Error deleting product:', error);
      //   // Optionally revert the state if the API call fails
      //   setStore(prev => ({
      //     ...prev,
      //     categories: initialStore.categories?.map(category => ({
      //       ...category,
      //       items: category.items || []
      //     })) || []
      //   }));
      //   // Show error message to user
      //   alert('Não foi possível excluir o produto. Tente novamente.');
      // }
    }
  }, [initialStore.categories]);

  const handleEditItem = useCallback(
    (id: string) => {
      const productToEdit = store.categories.flatMap((cat) => cat.items).find((item) => item.id === id);

      if (productToEdit) {
        setEditingProduct(productToEdit);
        setIsEditModalOpen(true);
      }
    },
    [store.categories],
  );

  const handleSaveProduct = async (updatedProduct: Product) => {
    try {
      console.log('Saving product:', updatedProduct);
      
      // Here you would typically upload the image to your server if it's a new one
      // and get back the URL to save with the product
      const imageUrl = updatedProduct.image;
      
      if (updatedProduct.image && updatedProduct.image.startsWith('data:image')) {
        // This is a base64 image that needs to be uploaded
        // TODO: Implement actual image upload to your server
        // const formData = new FormData();
        // formData.append('image', updatedProduct.image);
        // const response = await fetch('/api/upload', { method: 'POST', body: formData });
        // const data = await response.json();
        // imageUrl = data.url;
        console.log('Would upload image to server here');
      }

      const finalProduct = {
        ...updatedProduct,
        image: imageUrl
      };

      setStore((prev) => ({
        ...prev,
        categories: prev.categories.map((cat) => ({
          ...cat,
          items: cat.items.map((item) => (item.id === finalProduct.id ? finalProduct : item)),
        })),
      }));

      setIsEditModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      // TODO: Show error message to user
    }
  };

  const handleDuplicateItem = useCallback(async (product: Product) => {
    try {
      console.log(`Duplicating product: ${product.name}`);
      // TODO: Implement duplicate functionality
    } catch (error) {
      console.error('Error duplicating product:', error);
      // TODO: Show error message to user
    }
  }, []);

  const handleToggleProductActive = useCallback(
    (productId: string, categoryId: string, isActive: boolean) => {
      try {
        // Update local state optimistically
        const updatedCategories = store.categories.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                items: cat.items.map((item) => (item.id === productId ? { ...item, isactive: isActive } : item)),
              }
            : cat,
        );

        setStore((prev) => ({ ...prev, categories: updatedCategories }));

        // TODO: Add API call to update product status
      } catch (error) {
        console.error('Error toggling product status:', error);
        // Revert state on error
        setStore((prev) => ({
          ...prev,
          categories:
            initialStore.categories?.map((category) => ({
              ...category,
              items: category.items || [],
            })) || [],
        }));
      }
    },
    [store.categories, initialStore.categories],
  );

  const duplicateCategory = (id: string) => {
    console.log(`Duplicando categoria com ID: ${id}`);
  };

  const deleteCategory = (id: string) => {
    console.log(`Excluindo categoria com ID: ${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StoreHeader
          name={store.name}
          description={store.description}
          coverImage={store.coverImage}
          profileImage={store.profileImage}
          storeId={store.id}
          slugUrl={store.slug ? `https://smartcard.com/${store.slug}` : null}
          primaryColor={store.primaryColor}
          showSearch={false}
          accent="none"
          variant="stacked"
          onCoverImageUpdate={(url) => {
            setStore((prev) => ({ ...prev, coverImage: url }));
            console.log('🖼️ Capa atualizada:', url);
          }}
          onProfileImageUpdate={(url) => {
            setStore((prev) => ({ ...prev, profileImage: url }));
            console.log('🖼️ Perfil atualizado:', url);
          }}
          statusPill={
            store.isactive ? (
              <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">Ativa</span>
            ) : null
          }
          actions={
            <>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Back to dashboard');
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-card/80 hover:bg-card rounded-xl shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm border border-border"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </a>
              <a
                href={`/${store.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-border rounded-xl shadow-sm text-sm font-medium text-foreground bg-card/90 hover:bg-card hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 backdrop-blur-sm"
              >
                <Eye className="mr-2 h-4 w-4" />
                Visualizar Loja
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </>
          }
          className="mb-12"
        />

        {/* Categories and Products Section */}
        <div className="space-y-12">
          {store.categories.map((category) => (
            <div key={category.id} className="bg-card/90 backdrop-blur-sm rounded-3xl shadow-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">{category.name}</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium ${category.isactive ? 'text-success' : 'text-destructive'}`}>
                      {category.isactive ? 'Ativa' : 'Inativa'}
                    </span>
                    <ToggleSwitch checked={category.isactive} onChange={() => toggleCategoryStatus(category.id, category.isactive)} />
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setCategoryActionsOpen(categoryActionsOpen === category.id ? null : category.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      type="button"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {categoryActionsOpen === category.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl z-10">
                        <button
                          onClick={() => {
                            duplicateCategory(category.id);
                            setCategoryActionsOpen(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted/50 rounded-lg flex items-center"
                          type="button"
                        >
                          <Copy size={16} className="mr-2" /> Duplicar Categoria
                        </button>
                        <button
                          onClick={() => {
                            deleteCategory(category.id);
                            setCategoryActionsOpen(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted/50 rounded-lg flex items-center"
                          type="button"
                        >
                          <Trash2 size={16} className="mr-2" /> Excluir Categoria
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {category.items.map((product) => (
                  <AdminProductCard
                    key={product.id}
                    product={product}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                    onDuplicate={handleDuplicateItem}
                    onToggleActive={() => handleToggleProductActive(product.id, category.id, !product.isactive)}
                    onTogglePause={() => {}}
                  />
                ))}
                <AddItemCard onClick={() => console.log('Add new item to category:', category.id)} />
              </div>
            </div>
          ))}
          <div className="bg-card/90 backdrop-blur-sm rounded-3xl shadow-xl border border-border p-6 flex items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group">
            <div className="text-center">
              <button
                onClick={() => console.log('Add new category')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                type="button"
              >
                <Plus className="mr-2 h-5 w-5" /> Adicionar Nova Categoria
              </button>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="bg-background rounded-xl shadow-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingProduct(null);
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              type="button"
              aria-label="Fechar modal de edição"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <h3 className="text-xl font-bold mb-6">Editar Produto</h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Imagem do Produto</label>
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/30 flex-shrink-0">
                    {editingProduct.image ? (
                      <Image
                        src={editingProduct.image}
                        alt={editingProduct.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                        <span className="text-muted-foreground text-2xl">+</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-2">
                      {editingProduct.image ? 'Imagem selecionada' : 'Nenhuma imagem selecionada'}
                    </div>
                    <div className="flex space-x-2">
                      <label className="inline-flex items-center justify-center px-3 py-1.5 border border-border rounded-md text-sm font-medium text-foreground bg-background hover:bg-accent cursor-pointer transition-colors">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setEditingProduct(prev => 
                                  prev ? { ...prev, image: event.target?.result as string } : null
                                );
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <span className="flex items-center">
                          <Upload className="mr-1.5 h-3.5 w-3.5" />
                          {editingProduct.image ? 'Alterar' : 'Adicionar'}
                        </span>
                      </label>
                      {editingProduct.image && (
                        <button
                          type="button"
                          onClick={() => setEditingProduct(prev => prev ? { ...prev, image: '' } : null)}
                          className="px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Formatos: JPG, PNG, GIF. Tamanho máximo: 5MB
                    </p>
                  </div>
                </div>
              </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Nome do Produto</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Descrição</label>
                <textarea
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct((prev) => (prev ? { ...prev, description: e.target.value } : null))}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct((prev) => (prev ? { ...prev, price: parseFloat(e.target.value) || 0 } : null))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-muted-foreground">Status:</span>
                  <ToggleSwitch
                    checked={editingProduct.isactive}
                    onChange={(isActive) => setEditingProduct((prev) => (prev ? { ...prev, isactive: isActive } : null))}
                  />
                  <span className={`text-sm font-medium ${editingProduct.isactive ? 'text-success' : 'text-destructive'}`}>
                    {editingProduct.isactive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <button
                  onClick={() => handleSaveProduct(editingProduct)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  type="button"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC<{ store: StoreManagerProps['store'] }> = ({ store }) => {
  return <StoreManager store={store} />;
};

export default App;
