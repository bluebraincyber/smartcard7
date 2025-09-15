'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Plus, Store } from 'lucide-react';
import StoresToolbar from '@/components/store/StoresToolbar';
import StoreCard from '@/components/store/StoreCard';

type StoreStatus = 'active' | 'archived';

export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  url: string;
  status: 'active' | 'archived';
  categories: number;
  products: number;
  views30d?: number;
  updatedAt?: string;
  _count: {
    categories: number;
    products: number;
    analytics: number;
  };
}

export default function MyStoresPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'az' | 'views'>('recent');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stores');
      if (response.ok) {
        const data = await response.json();
        const mappedStores = (data.stores || []).map((store: any) => ({
          ...store,
          isActive: store.isActive ?? store.isactive ?? true,
          status: (store.isActive ?? store.isactive ?? true) ? 'active' : 'archived',
          url: `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/${store.slug}`,
          categories: store._count?.categories || 0,
          products: store._count?.products || 0,
          _count: {
            categories: store._count?.categories || 0,
            products: store._count?.products || 0,
            analytics: store._count?.analytics || 0,
          },
        }));
        setStores(mappedStores);
      } else {
        setError('Failed to fetch stores');
      }
    } catch (error) {
      setError('Failed to fetch stores');
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Filter and sort stores
  const filteredStores = useMemo(() => {
    let filtered = stores;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(store => 
        store.name.toLowerCase().includes(query) ||
        store.slug.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(store => store.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'az':
          return a.name.localeCompare(b.name);
        case 'views':
          return (b.views30d || 0) - (a.views30d || 0);
        case 'recent':
        default:
          if (!a.updatedAt || !b.updatedAt) return 0;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    // Group by status
    const activeStores = filtered.filter(store => store.status === 'active');
    const archivedStores = filtered.filter(store => store.status === 'archived');

    return { activeStores, archivedStores };
  }, [stores, searchQuery, statusFilter, sortBy]);

  const handleToggleStatus = useCallback(async (storeId: string, status: 'active' | 'archived') => {
    try {
      const response = await fetch(`/api/stores/${storeId}/toggle`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar o status da loja');
      }

      const updatedStore = await response.json();

      setStores((prevStores: Store[]) =>
        prevStores.map(store =>
          store.id === storeId 
            ? { 
                ...store, 
                isActive: updatedStore.isActive,
                status: updatedStore.isActive ? 'active' : 'archived',
                updatedAt: updatedStore.updatedAt
              } 
            : store
        )
      );
    } catch (err) {
      setError('Falha ao atualizar o status da loja');
      console.error('Erro ao atualizar status da loja:', err);
    }
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterStatus = (status: 'all' | 'active' | 'archived') => {
    setStatusFilter(status);
  };

  const handleSort = (sort: 'recent' | 'az' | 'views') => {
    setSortBy(sort);
  };

  const handleCreateStore = () => {
    router.push('/dashboard/store/new');
  };

  const handleEditStore = (storeId: string) => {
    router.push(`/dashboard/store/${storeId}/edit`);
  };

  const handleViewProducts = (storeId: string) => {
    router.push(`/dashboard/store/${storeId}`);
  };

  const handleViewAnalytics = (storeId: string) => {
    router.push(`/dashboard/analytics?storeId=${storeId}`);
  };

  if (!isClient) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Minhas Lojas</h1>
      </div>

      <StoresToolbar
        searchQuery={searchQuery}
        onSearch={handleSearch}
        statusFilter={statusFilter}
        onFilterStatus={handleFilterStatus}
        sortBy={sortBy}
        onSort={handleSort}
        onCreateStore={handleCreateStore}
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-12">
          <Store className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Nenhuma loja criada
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Comece criando sua primeira loja digital
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/store/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Loja
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8 mt-6">
          {/* Active Stores Section */}
          {filteredStores.activeStores.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Lojas Ativas</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {filteredStores.activeStores.length} loja{filteredStores.activeStores.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredStores.activeStores.map((store) => (
                  <StoreCard
                    key={store.id}
                    store={{
                      id: store.id,
                      name: store.name,
                      slug: store.slug,
                      url: store.url,
                      status: store.status,
                      categories: store.categories,
                      products: store.products,
                      views30d: store.views30d,
                      updatedAt: store.updatedAt
                    }}
                    onToggleStatus={handleToggleStatus}
                    onEdit={handleEditStore}
                    onProducts={handleViewProducts}
                    onAnalytics={handleViewAnalytics}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Archived Stores Section */}
          {filteredStores.archivedStores.length > 0 && (
            <section className="pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Lojas Arquivadas</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {filteredStores.archivedStores.length} loja{filteredStores.archivedStores.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredStores.archivedStores.map((store) => (
                  <StoreCard
                    key={store.id}
                    store={{
                      id: store.id,
                      name: store.name,
                      slug: store.slug,
                      url: store.url,
                      status: store.status,
                      categories: store.categories,
                      products: store.products,
                      views30d: store.views30d,
                      updatedAt: store.updatedAt
                    }}
                    onToggleStatus={handleToggleStatus}
                    onEdit={handleEditStore}
                    onProducts={handleViewProducts}
                    onAnalytics={handleViewAnalytics}
                  />
                ))}
              </div>
            </section>
          )}

          {/* No results message */}
          {filteredStores.activeStores.length === 0 && filteredStores.archivedStores.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {searchQuery 
                  ? `Nenhuma loja encontrada para "${searchQuery}"`
                  : `Nenhuma loja ${statusFilter === 'active' ? 'ativa' : 'arquivada'} encontrada`
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Limpar busca
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
