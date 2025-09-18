'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/types/store';
import { cn } from '@/lib/utils';

export type SortOption = 'recent' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

interface StoreFiltersProps {
  searchQuery: string;
  selectedCategory: string;
  sortBy: SortOption;
  categories: Category[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onLayoutChange?: (layout: 'grid' | 'list') => void;
  currentLayout?: 'grid' | 'list';
  className?: string;
}

export function StoreFilters({
  searchQuery,
  selectedCategory,
  sortBy,
  categories,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onLayoutChange,
  currentLayout = 'grid',
  className,
}: StoreFiltersProps) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  
  // Update local state when props change
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);
  
  // Close mobile filters when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isMobileFiltersOpen) {
        setIsMobileFiltersOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileFiltersOpen]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearchQuery);
  };
  
  const clearFilters = () => {
    onSearchChange('');
    onCategoryChange('all');
    onSortChange('recent');
    setLocalSearchQuery('');
  };
  
  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || sortBy !== 'recent';
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Desktop Filters */}
      <div className="hidden md:flex items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar produtos..."
              className="pl-10 pr-10"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              onBlur={() => onSearchChange(localSearchQuery)}
            />
            {localSearchQuery && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearchQuery('');
                  onSearchChange('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
        
        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <Select
            value={selectedCategory}
            onValueChange={onCategoryChange}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Sort By */}
          <Select
            value={sortBy}
            onValueChange={(value) => onSortChange(value as SortOption)}
          >
            <SelectTrigger className="w-[180px]">
              <span className="text-muted-foreground">Ordenar por: </span>
              <SelectValue placeholder="Mais recentes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
              <SelectItem value="price-asc">Menor preço</SelectItem>
              <SelectItem value="price-desc">Maior preço</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Layout Toggle */}
          {onLayoutChange && (
            <div className="flex border rounded-md p-1 bg-muted/50">
              <Button
                type="button"
                variant={currentLayout === 'grid' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => onLayoutChange('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={currentLayout === 'list' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => onLayoutChange('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Limpar filtros
              <X className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile Filters */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center gap-2">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar produtos..."
                className="pl-10 pr-10"
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                onBlur={() => onSearchChange(localSearchQuery)}
              />
              {localSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearchQuery('');
                    onSearchChange('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
          
          {/* Mobile Filters Button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileFiltersOpen(!isMobileFiltersOpen);
            }}
            className="shrink-0"
          >
            <Filter className="h-4 w-4" />
          </Button>
          
          {/* Layout Toggle - Mobile */}
          {onLayoutChange && (
            <div className="flex border rounded-md p-1 bg-muted/50">
              <Button
                type="button"
                variant={currentLayout === 'grid' ? 'default' : 'ghost'}
                size="icon"
                className="h-9 w-9"
                onClick={() => onLayoutChange('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={currentLayout === 'list' ? 'default' : 'ghost'}
                size="icon"
                className="h-9 w-9"
                onClick={() => onLayoutChange('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Mobile Filters Panel */}
        {isMobileFiltersOpen && (
          <div 
            className="bg-card p-4 rounded-lg border shadow-lg animate-in fade-in-50 slide-in-from-top-2 z-10 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Filtros</h3>
              <button 
                onClick={() => setIsMobileFiltersOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Categoria
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    onCategoryChange(value);
                    setIsMobileFiltersOpen(false);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Ordenar por
                </label>
                <Select
                  value={sortBy}
                  onValueChange={(value) => {
                    onSortChange(value as SortOption);
                    setIsMobileFiltersOpen(false);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mais recentes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Mais recentes</SelectItem>
                    <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
                    <SelectItem value="price-asc">Menor preço</SelectItem>
                    <SelectItem value="price-desc">Maior preço</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => {
                    clearFilters();
                    setIsMobileFiltersOpen(false);
                  }}
                >
                  Limpar filtros
                  <X className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Active Filters - Mobile */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 text-sm md:hidden">
          {searchQuery && (
            <div className="inline-flex items-center bg-muted px-3 py-1 rounded-full text-sm">
              <span className="mr-1">Busca: {searchQuery}</span>
              <button 
                onClick={() => onSearchChange('')}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {selectedCategory !== 'all' && (
            <div className="inline-flex items-center bg-muted px-3 py-1 rounded-full text-sm">
              <span className="mr-1">
                Categoria: {categories.find(c => c.id === selectedCategory)?.name || ''}
              </span>
              <button 
                onClick={() => onCategoryChange('all')}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {sortBy !== 'recent' && (
            <div className="inline-flex items-center bg-muted px-3 py-1 rounded-full text-sm">
              <span className="mr-1">
                Ordenar: {
                  sortBy === 'name-asc' ? 'A-Z' :
                  sortBy === 'name-desc' ? 'Z-A' :
                  sortBy === 'price-asc' ? 'Menor preço' :
                  sortBy === 'price-desc' ? 'Maior preço' : ''
                }
              </span>
              <button 
                onClick={() => onSortChange('recent')}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
