'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';
import { STORE_CONFIG } from '../store-config';
import { Product, Category } from '@/types/store';

interface UseStorePageProps {
  initialProducts: Product[];
  initialCategories: Category[];
  storeId: string;
}

export function useStorePage({ 
  initialProducts, 
  initialCategories, 
  storeId 
}: UseStorePageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // State for products and categories
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'recent'>('recent');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Debounce search query
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  
  // Update URL with search params
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (debouncedSearchQuery) {
      params.set('q', debouncedSearchQuery);
    } else {
      params.delete('q');
    }
    
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    } else {
      params.delete('category');
    }
    
    if (sortBy !== 'recent') {
      params.set('sort', sortBy);
    } else {
      params.delete('sort');
    }
    
    // Update URL without page reload
    router.replace(`${pathname}?${params.toString()}`);
  }, [debouncedSearchQuery, selectedCategory, sortBy, pathname, router, searchParams]);
  
  // Filter products based on search query and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Filter by search query
      const matchesSearch = 
        product.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      
      // Filter by category
      const matchesCategory = 
        selectedCategory === 'all' || 
        product.categoryId === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, debouncedSearchQuery, selectedCategory]);
  
  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    
    switch (sortBy) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'recent':
      default:
        // Assuming products have a createdAt field, otherwise fall back to the original order
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
    }
  }, [filteredProducts, sortBy]);
  
  // Pagination
  const itemsPerPage = STORE_CONFIG.DEFAULTS.PAGINATION?.ITEMS_PER_PAGE || 12;
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle product CRUD operations
  const handleAddProduct = useCallback(async (newProduct: Omit<Product, 'id'>) => {
    setIsLoading(true);
    try {
      // In a real app, you would call your API here
      const response = await fetch(`/api/stores/${storeId}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao adicionar produto');
      }
      
      const createdProduct = await response.json();
      
      setProducts(prev => [...prev, createdProduct]);
      toast.success('Produto adicionado com sucesso!');
      return true;
    } catch (err) {
      console.error('Error adding product:', err);
      toast.error('Erro ao adicionar produto');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);
  
  const handleUpdateProduct = useCallback(async (updatedProduct: Product) => {
    setIsLoading(true);
    try {
      // In a real app, you would call your API here
      const response = await fetch(`/api/stores/${storeId}/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao atualizar produto');
      }
      
      const data = await response.json();
      
      setProducts(prev => 
        prev.map(p => (p.id === updatedProduct.id ? { ...data } : p))
      );
      toast.success('Produto atualizado com sucesso!');
      return true;
    } catch (err) {
      console.error('Error updating product:', err);
      toast.error('Erro ao atualizar produto');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);
  
  const handleDeleteProduct = useCallback(async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return false;
    }
    
    setIsLoading(true);
    try {
      // In a real app, you would call your API here
      const response = await fetch(`/api/stores/${storeId}/products/${productId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Falha ao excluir produto');
      }
      
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Produto excluído com sucesso!');
      return true;
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Erro ao excluir produto');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);
  
  // Handle category CRUD operations
  const handleAddCategory = useCallback(async (newCategory: Omit<Category, 'id'>) => {
    setIsLoading(true);
    try {
      // In a real app, you would call your API here
      const response = await fetch(`/api/stores/${storeId}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao adicionar categoria');
      }
      
      const createdCategory = await response.json();
      
      setCategories(prev => [...prev, createdCategory]);
      toast.success('Categoria adicionada com sucesso!');
      return createdCategory;
    } catch (err) {
      console.error('Error adding category:', err);
      toast.error('Erro ao adicionar categoria');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);
  
  // Calculate store statistics
  const storeStats = useMemo(() => {
    return {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.isActive).length,
      totalCategories: categories.length,
      totalValue: products.reduce((sum, p) => sum + p.price, 0),
      averagePrice: products.length > 0 
        ? products.reduce((sum, p) => sum + p.price, 0) / products.length 
        : 0,
    };
  }, [products, categories]);
  
  return {
    // State
    products: paginatedProducts,
    categories,
    isLoading,
    error,
    searchQuery,
    selectedCategory,
    sortBy,
    currentPage,
    totalPages,
    storeStats,
    
    // Actions
    setSearchQuery,
    setSelectedCategory,
    setSortBy,
    handlePageChange,
    handleAddProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    handleAddCategory,
  };
}
