'use client';

import Image from 'next/image';
import { ArrowLeft, Edit, Share2, Settings, MoreVertical, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { Store } from '@/types/store';
import { cn } from '@/lib/utils';

interface StoreHeaderProps {
  store: Store;
  onEdit?: () => void;
  onAddProduct?: () => void;
  className?: string;
}

export function StoreHeader({ store, onEdit, onAddProduct, className }: StoreHeaderProps) {
  const router = useRouter();
  
  return (
    <div className={cn("store-header relative overflow-hidden rounded-lg shadow-md", className)}>
      {/* Cover Image */}
      <div 
        className="h-48 md:h-64 bg-cover bg-center bg-no-after relative"
        style={{ 
          backgroundImage: `url(${store.coverImage || '/images/store-cover-placeholder.jpg'})`,
          backgroundColor: store.primaryColor ? `${store.primaryColor}40` : '#3B82F640' // 25% opacity of primary color
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
      </div>
      
      {/* Store Info */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-16">
        <div className="bg-card/90 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-border/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Store Logo */}
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 rounded-lg overflow-hidden border-2 border-background shadow-md flex-shrink-0">
              <Image
                src={store.profileImage || '/images/store-avatar-placeholder.png'}
                alt={store.name}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
              
              {/* Edit Profile Image Button */}
              <button 
                onClick={() => {}}
                className="absolute bottom-0 left-0 right-0 bg-background/80 text-foreground py-1 text-xs font-medium flex items-center justify-center gap-1 hover:bg-background/90 transition-colors"
              >
                <Edit className="h-3 w-3" />
                <span>Editar</span>
              </button>
            </div>
            
            {/* Store Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                  {store.name}
                </h1>
                
                <div className="flex items-center gap-2">
                  {/* Mobile Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="sm:hidden">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={onEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Editar Loja</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onAddProduct}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Novo Produto</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="mr-2 h-4 w-4" />
                        <span>Compartilhar</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {/* Desktop Buttons */}
                  <div className="hidden sm:flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={onEdit}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar Loja
                    </Button>
                    <Button size="sm" onClick={onAddProduct}>
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Produto
                    </Button>
                  </div>
                </div>
              </div>
              
              <p className="mt-1 text-muted-foreground line-clamp-2">
                {store.description || 'Nenhuma descrição fornecida.'}
              </p>
              
              {/* Store Stats */}
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  <span>12 produtos</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>5 categorias</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>4.8 (24 avaliações)</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Store Actions - Mobile */}
          <div className="mt-4 flex sm:hidden items-center justify-between pt-3 border-t border-border/50">
            <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button size="sm" className="flex-1 ml-2" onClick={onAddProduct}>
              <Plus className="mr-2 h-4 w-4" />
              Produto
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock components for missing imports
function Users({ className }: { className?: string }) {
  return (
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
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
