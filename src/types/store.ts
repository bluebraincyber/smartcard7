export interface BusinessHours {
  dayOfWeek: number; // 0-6 (Domingo a Sábado)
  isOpen: boolean;
  openingTime?: string; // Formato: 'HH:MM'
  closingTime?: string; // Formato: 'HH:MM'
  allDay?: boolean;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  whatsapp: string;
  address?: string;
  primaryColor: string;
  isActive: boolean;
  image?: string;
  coverImage?: string;
  profileImage?: string;
  businessHours?: BusinessHours[];
  timezone?: string; // Ex: 'America/Sao_Paulo'
  categories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  storeId: string;
  items: Item[];
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isActive: boolean;
  isAvailable: boolean;
  categoryId: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

// Types for the store form data
export interface StoreFormData {
  name: string;
  description?: string;
  whatsapp: string;
  address?: string;
  primaryColor: string;
  isActive: boolean;
  coverImage?: File | string;
  profileImage?: File | string;
}

// Types for the category form data
export interface CategoryFormData {
  name: string;
  description?: string;
  isActive: boolean;
}

// Types for the product form data
export interface ProductFormData {
  name: string;
  description?: string;
  price: number | string;
  categoryId: string;
  isActive: boolean;
  isAvailable: boolean;
  image?: File | string;
}

// Types for the store filters
export interface StoreFilters {
  searchQuery: string;
  categoryId: string;
  isActive: boolean;
}

// Types for the store stats
export interface StoreStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalRevenue: number;
}
