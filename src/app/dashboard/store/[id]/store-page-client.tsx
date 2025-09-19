'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Eye, ExternalLink, MoreVertical, Copy } from 'lucide-react';
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
    <input type="checkbox" checked={checked} onChange={() => onChange(!checked)} className="sr-only peer" />
    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
  </label>
);

interface AdminProductCardProps {
  product: Product;
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
  onDuplicate: (product: Product) => void;
  onToggleActive: (isActive: boolean) => void;
  onTogglePause: (isPaused: boolean) => void;
}

const AdminProductCard = ({ product, onEdit, onDelete, onDuplicate, onToggleActive }: AdminProductCardProps) => {
  return (
    <div className="relative bg-card/70 backdrop-blur-sm border border-border rounded-lg shadow-sm p-3 flex flex-col h-full">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <ToggleSwitch checked={product.isactive} onChange={onToggleActive} />
          <span className={`text-xs font-medium ${product.isactive ? 'text-success' : 'text-destructive'}`}>
            {product.isactive ? 'Ativo' : 'Inativo'}
          </span>
        </div>
        <button 
          onClick={() => onDelete(product.id)} 
          className="text-destructive hover:text-destructive/80 transition-colors p-1"
          aria-label="Excluir produto"
        >
          <Trash2 size={14} />
        </button>
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
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 h-8 overflow-hidden w-full">
            {product.description}
          </p>
        )}
        <p className="text-base font-semibold text-primary mt-auto">R$ {product.price.toFixed(2)}</p>
      </div>
      
      <div className="mt-3 flex justify-between space-x-2">
        <button
          onClick={() => onEdit(product.id)}
          className="flex-1 flex items-center justify-center px-2 py-1.5 bg-primary/10 text-primary text-xs rounded-md hover:bg-primary/20 transition-colors"
          aria-label="Editar produto"
        >
          <Eye size={12} className="mr-1" />
          <span className="truncate">Editar</span>
        </button>
        <button
          onClick={() => onDuplicate(product)}
          className="flex-1 flex items-center justify-center px-2 py-1.5 bg-muted text-foreground text-xs rounded-md hover:bg-muted/80 transition-colors"
          aria-label="Duplicar produto"
        >
          <Copy size={12} className="mr-1" />
          <span className="truncate">Duplicar</span>
        </button>
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

const StoreManager = ({ store: initialStore }: StoreManagerProps) => {
  const [store, setStore] = useState<Store>(() => ({
    ...initialStore,
    categories: initialStore.categories?.map((category) => ({
      ...category,
      items: category.items || [],
    })) || [],
  }));

  useEffect(() => {
    setStore({
      ...initialStore,
      categories: initialStore.categories?.map((category) => ({
        ...category,
        items: category.items || [],
      })) || [],
    });
  }, [initialStore]);

  const [categoryActionsOpen, setCategoryActionsOpen] = useState<string | null>(null);
  // Removida a variável saving não utilizada

  const toggleCategoryStatus = async (categoryId: string, isactive: boolean) => {
    console.log(`Toggling category ${categoryId} to ${!isactive}`);
    // Implementar lógica de toggle aqui
  };

  const handleDeleteItem = (id: string) => {
    console.log(`Deleting item: ${id}`);
  };

  const handleEditItem = (id: string) => {
    console.log(`Editing item: ${id}`);
  };

  const handleDuplicateItem = async (product: Product) => {
    console.log(`Duplicating product: ${product.name}`);
  };

  const handleToggleProductActive = async (productId: string, categoryId: string, isActive: boolean) => {
    const updatedCategories = store.categories.map((cat) =>
      cat.id === categoryId
        ? {
            ...cat,
            items: cat.items.map((item) =>
              item.id === productId ? { ...item, isactive: isActive } : item
            ),
          }
        : cat
    );
    setStore((prev) => ({ ...prev, categories: updatedCategories }));
  };

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
            setStore(prev => ({ ...prev, coverImage: url }));
            console.log('🖼️ Capa atualizada:', url);
          }}
          onProfileImageUpdate={(url) => {
            setStore(prev => ({ ...prev, profileImage: url }));
            console.log('🖼️ Perfil atualizado:', url);
          }}
          statusPill={
            store.isactive ? (
              <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
                Ativa
              </span>
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
                    <ToggleSwitch
                      checked={category.isactive}
                      onChange={() => toggleCategoryStatus(category.id, category.isactive)}
                    />
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setCategoryActionsOpen(categoryActionsOpen === category.id ? null : category.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
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
                        >
                          <Copy size={16} className="mr-2" /> Duplicar Categoria
                        </button>
                        <button
                          onClick={() => {
                            deleteCategory(category.id);
                            setCategoryActionsOpen(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted/50 rounded-lg flex items-center"
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
                    onToggleActive={(isActive) => handleToggleProductActive(product.id, category.id, isActive)}
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
              >
                <Plus className="mr-2 h-5 w-5" /> Adicionar Nova Categoria
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App({ store }: { store: StoreManagerProps['store'] }) {
  return <StoreManager store={store} />;
}
