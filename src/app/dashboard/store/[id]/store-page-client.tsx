'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { ArrowLeft, Plus, Trash2, Eye, ExternalLink, Camera, Upload, MoreVertical, Copy } from 'lucide-react';
import StoreHeader from '@/components/store/StoreHeader';

// Este é um aplicativo React self-contained, em um único arquivo.
// Ele inclui todos os componentes e mocks para uma demonstração totalmente funcional.
// O código depende do CDN do Tailwind CSS para estilização.

// -----------------------------------------------------------
// DADOS MOCK E UTILITIES
// -----------------------------------------------------------

const MOCK_STORE_DATA = {
  id: 'store-123',
  name: 'Loja de Exemplo',
  slug: 'loja-de-exemplo',
  description: 'Uma loja online fictícia para demonstração.',
  whatsapp: '5511999999999',
  address: 'Rua de Exemplo, 123',
  primaryColor: '#3B82F6',
  coverImage: 'https://placehold.co/1200x400/1e40af/ffffff?text=Capa+da+Loja',
  profileImage: 'https://placehold.co/200x200/3B82F6/ffffff?text=Logo',
  isactive: true,
  isarchived: false,
  categories: [
    {
      id: 'cat-1',
      name: 'Eletrônicos',
      description: 'Produtos eletrônicos e gadgets.',
      isactive: true,
      items: [
        {
          id: 'item-1',
          name: 'Smartphone X',
          description: 'Um smartphone de última geração.',
          price: 1500.0,
          image: 'https://placehold.co/600x600/1f2937/ffffff?text=Smartphone+X',
          isactive: true,
          isarchived: false,
        },
        {
          id: 'item-2',
          name: 'Fone de Ouvido Bluetooth',
          description: 'Áudio de alta qualidade e sem fios.',
          price: 250.0,
          image: 'https://placehold.co/600x600/1f2937/ffffff?text=Fone+BT',
          isactive: false,
          isarchived: false,
        },
      ],
    },
    {
      id: 'cat-2',
      name: 'Roupas',
      description: 'Vestuário e acessórios.',
      isactive: true,
      items: [
        {
          id: 'item-3',
          name: 'Camisa Polo',
          description: 'Camisa 100% algodão de alta qualidade.',
          price: 80.0,
          image: 'https://placehold.co/600x600/1f2937/ffffff?text=Camisa+Polo',
          isactive: true,
          isarchived: false,
        },
      ],
    },
  ],
};

interface FetchOptions {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
  [key: string]: unknown;
}

const mockFetch = (url: string, options: FetchOptions = {}) => {
  console.log(`MOCK FETCH: ${options.method || 'GET'} to ${url}`);
  return new Promise<{ ok: boolean; json: () => Promise<any> }>((resolve) => {
    setTimeout(() => {
      let data = MOCK_STORE_DATA;
      if (options.method === 'PATCH' && url.includes('/api/stores/')) {
        const body = JSON.parse(options.body || '{}');
        data = { ...MOCK_STORE_DATA, ...body };
        Object.assign(MOCK_STORE_DATA, data);
      } else if (options.method === 'PATCH' && url.includes('/api/items/')) {
        const id = url.split('/').pop();
        const body = JSON.parse(options.body || '{}');
        MOCK_STORE_DATA.categories.forEach((cat) => {
          cat.items = cat.items.map((item) =>
            item.id === id ? { ...item, ...body } : item
          );
        });
      } else if (options.method === 'POST' && url.includes('/items')) {
        const newItem = { ...JSON.parse(options.body || '{}'), id: `item-${Date.now()}` };
        const categoryId = newItem.categoryId;
        const category = MOCK_STORE_DATA.categories.find((c) => c.id === categoryId);
        if (category) {
          category.items.push(newItem);
        }
      } else if (options.method === 'DELETE' && url.includes('/items/')) {
        const itemId = url.split('/').pop();
        MOCK_STORE_DATA.categories.forEach((cat) => {
          cat.items = cat.items.filter((item) => item.id !== itemId);
        });
      }
      resolve({
        ok: true,
        json: () => Promise.resolve(data),
      });
    }, 500);
  });
};

// -----------------------------------------------------------
// COMPONENTES REFACTORADOS E COMPLETOS
// -----------------------------------------------------------

interface EditableFieldProps {
  field: string;
  value: string;
  placeholder?: string;
  className?: string;
  onSave: (field: string, value: string) => void;
}

const EditableField = ({ field, value, placeholder, className, onSave }: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleSave = () => {
    onSave(field, currentValue);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center group">
      {isEditing ? (
        <div className="flex w-full items-center space-x-2">
          <input
            type="text"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            className="flex-1 bg-transparent border-b border-border focus:outline-none focus:border-primary transition-colors text-foreground"
          />
          <button onClick={handleSave} className="text-primary hover:text-primary-dark transition-colors">
            Save
          </button>
          <button onClick={() => setIsEditing(false)} className="text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
        </div>
      ) : (
        <>
          <span className={`${className} cursor-pointer`}>{value || placeholder}</span>
          <button
            onClick={() => setIsEditing(true)}
            className="ml-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Edit
          </button>
        </>
      )}
    </div>
  );
};

interface EditableSlugFieldProps {
  value: string;
  onSave: (value: string) => void;
}

const EditableSlugField = ({ value, onSave }: EditableSlugFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [validation, setValidation] = useState({ isValid: true, message: '', isChecking: false });

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const validateSlugFormat = (slug: string) =>
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 3 && slug.length <= 50;

  const handleSave = async () => {
    setValidation({ ...validation, isChecking: true });
    // Simulando a verificação de disponibilidade do slug
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (validateSlugFormat(currentValue)) {
      setValidation({ isValid: true, message: '', isChecking: false });
      onSave(currentValue);
      setIsEditing(false);
    } else {
      setValidation({
        isValid: false,
        message: 'URL deve ter 3-50 caracteres, ser minúscula, e usar números e hífens.',
        isChecking: false,
      });
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center group">
        <span className="text-sm text-muted-foreground">smartcard.com/</span>
        {isEditing ? (
          <div className="flex-1 flex items-center space-x-2">
            <input
              type="text"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              className="bg-transparent border-b border-border focus:outline-none focus:border-primary transition-colors text-foreground flex-1"
            />
            <button onClick={handleSave} className="text-primary hover:text-primary-dark transition-colors">
              Save
            </button>
            <button onClick={() => setIsEditing(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
          </div>
        ) : (
          <>
            <span className="text-sm text-foreground font-medium cursor-pointer">{value}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="ml-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Edit
            </button>
          </>
        )}
      </div>
      {validation.isChecking && <p className="text-xs text-primary mt-1">Verificando disponibilidade...</p>}
      {!validation.isValid && <p className="text-xs text-destructive mt-1">{validation.message}</p>}
    </div>
  );
};

interface EditableColorFieldProps {
  field: string;
  value: string;
  onSave: (field: string, value: string) => void;
}

const EditableColorField = ({ field, value, onSave }: EditableColorFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [color, setColor] = useState(value);

  useEffect(() => {
    setColor(value);
  }, [value]);

  const handleSave = () => {
    onSave(field, color);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center space-x-2">
      <div
        className="w-8 h-8 rounded-full border border-border cursor-pointer"
        style={{ backgroundColor: value }}
        onClick={() => setIsEditing(true)}
      ></div>
      {isEditing ? (
        <>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer"
          />
          <button onClick={handleSave} className="text-primary hover:text-primary-dark transition-colors">
            Save
          </button>
          <button onClick={() => setIsEditing(false)} className="text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
        </>
      ) : (
        <span className="text-sm font-medium text-foreground">{value}</span>
      )}
    </div>
  );
};

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onClose }: ConfirmationModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-2xl p-6 shadow-2xl w-full max-w-sm border border-border">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{message}</p>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-foreground bg-muted hover:bg-muted-dark transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl text-sm font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 transition-colors">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

interface ProductCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'id'>) => void;
  categories: Category[];
}

const ProductCreateModal = ({ isOpen, onClose, onSubmit, categories }: ProductCreateModalProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | string>(0);
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setPrice(0);
      setDescription('');
      setSelectedImage(null);
      setSelectedCategoryId(categories[0]?.id || '');
    }
  }, [isOpen, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      price: typeof price === 'string' ? parseFloat(price) : price,
      description,
      image: selectedImage || undefined,
      categoryId: selectedCategoryId,
      isactive: true,
      isarchived: false,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-2xl w-full max-w-md border border-border">
        <h3 className="text-lg font-bold mb-4">Create New Product</h3>
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-foreground">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-border bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/50"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Price</span>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-border bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/50"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-border bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/50"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Image URL</span>
            <input
              type="url"
              value={selectedImage || ''}
              onChange={(e) => setSelectedImage(e.target.value)}
              className="mt-1 block w-full rounded-md border-border bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/50"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Category</span>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-border bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/50"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-foreground bg-muted hover:bg-muted-dark transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors"
          >
            Create Product
          </button>
        </div>
      </form>
    </div>
  );
};

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSubmit: (product: Product) => void;
}

const ProductEditModal = ({ isOpen, onClose, product, onSubmit }: ProductEditModalProps) => {
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState<number | string>(product?.price || 0);
  const [description, setDescription] = useState(product?.description || '');
  const [image, setImage] = useState(product?.image || '');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price);
      setDescription(product.description || '');
      setImage(product.image || '');
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    onSubmit({
      ...product,
      name,
      price: typeof price === 'string' ? parseFloat(price) : price,
      description,
      image,
    });
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-2xl w-full max-w-md border border-border">
        <h3 className="text-lg font-bold mb-4">Edit Product</h3>
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-foreground">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-border bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/50"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Price</span>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-border bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/50"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-border bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/50"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Image URL</span>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="mt-1 block w-full rounded-md border-border bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/50"
            />
          </label>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-foreground bg-muted hover:bg-muted-dark transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

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
    <div className="relative bg-card/70 backdrop-blur-sm border border-border rounded-xl shadow-md p-4 flex flex-col items-center text-center">
      <div className="w-full flex justify-end mb-2">
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-medium ${product.isactive ? 'text-success' : 'text-destructive'}`}>
            {product.isactive ? 'Active' : 'Inactive'}
          </span>
          <ToggleSwitch checked={product.isactive} onChange={onToggleActive} />
          <button onClick={() => onDelete(product.id)} className="text-destructive hover:text-destructive/80 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-primary">
        <img
          src={product.image || 'https://placehold.co/100x100/1f2937/ffffff?text=Product'}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-md font-bold mb-1">{product.name}</h3>
      <p className="text-sm text-muted-foreground">{product.description}</p>
      <p className="text-lg font-semibold text-primary mt-2">R$ {product.price.toFixed(2)}</p>
      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => onEdit(product.id)}
          className="flex items-center px-3 py-1 bg-primary text-white text-xs rounded-full hover:bg-primary-dark transition-colors"
        >
          <Eye size={12} className="mr-1" /> Edit
        </button>
        <button
          onClick={() => onDuplicate(product)}
          className="flex items-center px-3 py-1 bg-muted text-foreground text-xs rounded-full hover:bg-muted/80 transition-colors"
        >
          <Copy size={12} className="mr-1" /> Duplicate
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
    className="relative bg-card/70 backdrop-blur-sm border-2 border-dashed border-border rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group min-h-[250px]"
    onClick={onClick}
  >
    <div className="text-primary group-hover:scale-110 transition-transform mb-2">
      <Plus size={48} />
    </div>
    <h3 className="text-md font-bold text-foreground">Add New Product</h3>
  </div>
);

interface ImageUploadProps {
  isOpen: boolean;
  onUpload: (url: string) => void;
  onClose: () => void;
}

const ImageUpload = ({ isOpen, onUpload, onClose }: ImageUploadProps) => {
  const [url, setUrl] = useState('');

  const handleUpload = () => {
    if (url) {
      onUpload(url);
      setUrl(''); // Reset the URL after upload
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-2xl p-6 shadow-2xl w-full max-w-sm border border-border">
        <h3 className="text-lg font-bold mb-4">Upload Image</h3>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter image URL"
          className="w-full rounded-md border-border bg-background py-2 px-3 text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary/50"
        />
        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-foreground bg-muted hover:bg-muted-dark transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------
// MAIN APPLICATION COMPONENT
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

const StoreManager = ({ store: initialStore }: StoreManagerProps) => {
  const [store, setStore] = useState<Store>(() => ({
    ...initialStore,
    categories: initialStore.categories?.map((category) => ({
      ...category,
      items: category.items || [],
    })) || [],
  }));

  // Update local state if initialStore changes
  useEffect(() => {
    setStore({
      ...initialStore,
      categories: initialStore.categories?.map((category) => ({
        ...category,
        items: category.items || [],
      })) || [],
    });
  }, [initialStore]);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onClose: () => {},
  });

  // New state to manage the delete store input
  const [isDeletingStore, setIsDeletingStore] = useState(false);

  // New state for category actions dropdown
  const [categoryActionsOpen, setCategoryActionsOpen] = useState<string | null>(null);

  const [editModal, setEditModal] = useState<{ isOpen: boolean; product: Product | null }>({
    isOpen: false,
    product: null,
  });

  const [createModal, setCreateModal] = useState<{ isOpen: boolean; categoryId: string | null }>({
    isOpen: false,
    categoryId: null,
  });

  const [imageModal, setImageModal] = useState<{ isOpen: boolean; type: 'cover' | 'profile' | null; currentImage: string | null }>({
    isOpen: false,
    type: null,
    currentImage: null,
  });

  const [saving, setSaving] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Generic save handler with optimistic updates
  const saveField = useCallback(
    async <K extends keyof Store>(key: K, value: Store[K]) => {
      const previousStore = store;

      setStore((prev) => ({ ...prev, [key]: value }));
      setSaving(true);

      try {
        await mockFetch(`/api/stores/${store.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [key]: value }),
        });
      } catch (err) {
        setStore(previousStore);
        console.error('Failed to save field:', err);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [store]
  );

  // Factory function to create save handlers for specific fields
  const makeSaver = useCallback(
    <K extends keyof Store>(key: K) =>
      (value: Store[K]) =>
        saveField(key, value),
    [saveField]
  );

  // Named handlers for better readability
  const handleSaveName = useCallback((name: string) => makeSaver('name')(name), [makeSaver]);
  const handleSaveSlug = useCallback((slug: string) => makeSaver('slug')(slug), [makeSaver]);
  const handleSaveDescription = useCallback((description: string) => makeSaver('description')(description), [makeSaver]);
  const handleSave = useCallback(
    (field: string, value: string) => {
      // Generic handler used by EditableField etc.
      (makeSaver(field as keyof Store)(value as any) as Promise<void>).catch(() => {});
    },
    [makeSaver]
  );

  // Toggle store status
  const toggleStoreStatus = useCallback(async () => {
    const newStatus = !store.isactive;
    await saveField('isactive', newStatus);
  }, [saveField, store.isactive]);

  const fetchStore = async () => {
    console.log('Fetching store data...');
    const response = await mockFetch(`/api/stores/${store.id}`);
    if (response.ok) {
      const data = await response.json();
      setStore(data);
    }
  };

  // Delete store handler
  const handleDeleteStore = useCallback(async () => {
    try {
      await mockFetch(`/api/stores/${store.id}`, {
        method: 'DELETE',
      });
      // Redirect or handle success as needed
      console.log('Store deleted');
    } catch (error) {
      console.error('Failed to delete store:', error);
      throw error;
    }
  }, [store.id]);

  // Duplicate store handler
  const handleDuplicateStore = useCallback(async () => {
    try {
      const response = await mockFetch(`/api/stores/${store.id}/duplicate`, {
        method: 'POST',
      });
      const newStore = await response.json();
      // Handle success (e.g., redirect to new store)
      return newStore;
    } catch (error) {
      console.error('Failed to duplicate store:', error);
      throw error;
    }
  }, [store.id]);

  const toggleCategoryStatus = async (categoryId: string, isactive: boolean) => {
    setSaving(true);
    await mockFetch(`/api/categories/${categoryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isactive: !isactive }),
    });
    await fetchStore();
    setSaving(false);
  };

  const handleDeleteItem = (id: string) => {
    const item = store.categories.flatMap((cat) => cat.items).find((item) => item.id === id);
    if (!item) return;

    setConfirmModal({
      isOpen: true,
      title: 'Delete Item',
      message: `Are you sure you want to delete "${item.name}"? This cannot be undone.`,
      onConfirm: async () => {
        setSaving(true);
        await mockFetch(`/api/items/${id}`, { method: 'DELETE' });
        await fetchStore();
        setSaving(false);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
      onClose: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
    });
  };

  const handleEditItem = (id: string) => {
    const item = store.categories.flatMap((cat) => cat.items).find((item) => item.id === id);
    if (item) {
      setEditModal({ isOpen: true, product: item });
    }
  };

  const handleCreateProduct = async (productData: Omit<Product, 'id'>) => {
    setSaving(true);
    await mockFetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    await fetchStore();
    setSaving(false);
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    setSaving(true);
    await mockFetch(`/api/items/${updatedProduct.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProduct),
    });
    await fetchStore();
    setSaving(false);
  };

  const handleDuplicateItem = async (product: Product) => {
    setSaving(true);
    const category = store.categories.find((cat) => cat.items.some((i) => i.id === product.id));
    if (!category) {
      setSaving(false);
      return;
    }

    await mockFetch(`/api/stores/${store.id}/categories/${category.id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...product,
        name: `${product.name} (Copy)`,
        id: undefined, // Novo ID será gerado pelo mock
      }),
    });
    await fetchStore();
    setSaving(false);
  };

  const handleToggleProductActive = async (productId: string, categoryId: string, isActive: boolean) => {
    // Atualiza o estado local para feedback imediato
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

    // Chamada ao mockFetch para persistência
    try {
      setSaving(true);
      await mockFetch(`/api/items/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isactive: isActive }),
      });
    } catch (error) {
      console.error('Failed to update product active status:', error);
    } finally {
      setSaving(false);
    }
  };

  const duplicateCategory = (id: string) => {
    console.log(`Duplicando categoria com ID: ${id}`);
    // Implemente a lógica para duplicar categoria conforme a necessidade
  };

  const deleteCategory = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Categoria',
      message: 'Tem certeza de que deseja excluir esta categoria e todos os seus produtos? Esta ação é irreversível.',
      onConfirm: async () => {
        console.log(`Confirmado. Excluindo categoria com ID: ${id}`);
        // Implemente a lógica para exclusão da categoria na API
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        await fetchStore();
      },
      onClose: () => setConfirmModal((prev) => ({ ...prev, isOpen: false })),
    });
  };

  const openImageModal = (type: 'cover' | 'profile') => {
    const currentImage = type === 'cover' ? store.coverImage || store.image || null : store.profileImage || null;
    setImageModal({ isOpen: true, type, currentImage });
  };

  const closeImageModal = () => {
    setImageModal({ isOpen: false, type: null, currentImage: null });
  };

  const handleImageUpload = async (url: string) => {
    if (!imageModal.type) return;

    const fieldName = imageModal.type === 'cover' ? 'coverImage' : 'profileImage';
    await makeSaver(fieldName as keyof Store)(url);
    closeImageModal();
  };

  return (
    <div className="min-h-screen bg-background">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .bg-grid-pattern {
              background-image: linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
              background-size: 20px 20px;
            }
            .dark .bg-grid-pattern {
              background-image: linear-gradient(to right, #2f343a 1px, transparent 1px), linear-gradient(to bottom, #2f343a 1px, transparent 1px);
            }
          `,
        }}
      />
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-[0.02]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StoreHeader
          name={store.name}
          description={store.description}
          coverImage={store.coverImage}
          profileImage={store.profileImage}
          slugUrl={store.slug ? `https://smartcard.com/${store.slug}` : null}
          primaryColor={store.primaryColor}
          showSearch={false}
          accent="none"
          variant="stacked"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <AddItemCard onClick={() => setCreateModal({ isOpen: true, categoryId: category.id })} />
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

        {/* Modals */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onClose={confirmModal.onClose}
        />

        <ProductEditModal
          isOpen={editModal.isOpen}
          product={editModal.product}
          onClose={() => setEditModal({ isOpen: false, product: null })}
          onSubmit={handleUpdateProduct}
        />

        <ProductCreateModal
          isOpen={createModal.isOpen}
          onClose={() => setCreateModal({ isOpen: false, categoryId: null })}
          onSubmit={handleCreateProduct}
          categories={store.categories}
        />

        <ImageUpload isOpen={imageModal.isOpen} onUpload={handleImageUpload} onClose={closeImageModal} />

        {/* Delete Store Section */}
        <div className="mt-12 p-6 bg-destructive/10 rounded-3xl border border-destructive/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-destructive">Excluir Loja</h3>
              <p className="mt-1 text-sm text-destructive/80">
                Esta ação é irreversível. Todos os dados da loja serão permanentemente excluídos.
              </p>
            </div>
            <button
              onClick={() => setIsDeletingStore(true)}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-xl text-sm font-medium hover:bg-destructive/90 transition-colors"
            >
              Excluir Loja
            </button>
          </div>
          {isDeletingStore && (
            <div className="mt-4 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
              <p className="text-sm text-destructive/80 mb-2">
                Para confirmar, digite o nome da loja: <strong>{store.name}</strong>
              </p>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg bg-background text-foreground border border-border"
                onChange={(e) => {
                  if (e.target.value === store.name) {
                    setIsDeletingStore(false);
                    setConfirmModal({
                      isOpen: true,
                      title: 'Confirm Deletion',
                      message: `Tem certeza absoluta de que deseja excluir "${store.name}"?`,
                      onConfirm: () => {
                        console.log('Excluindo loja...');
                        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                        handleDeleteStore();
                      },
                      onClose: () => {
                        console.log('Exclusão cancelada');
                        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                      },
                    });
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App({ store }: { store: StoreManagerProps['store'] }) {
  return <StoreManager store={store} />;
}