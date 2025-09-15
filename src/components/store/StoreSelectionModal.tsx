'use client';
import { Store } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

interface Store {
  id: string;
  name: string;
  description?: string;
}

interface StoreSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStore: (store: Store) => void;
  stores: Store[];
  loading?: boolean;
}

export function StoreSelectionModal({ 
  isOpen, 
  onClose, 
  onSelectStore, 
  stores, 
  loading = false 
}: StoreSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Selecione uma Loja</CardTitle>
          <CardDescription>
            Escolha a loja que deseja gerenciar os produtos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : stores.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {stores.map((store) => (
                <div 
                  key={store.id}
                  onClick={() => onSelectStore(store)}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Store className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{store.name}</h3>
                      {store.description && (
                        <p className="text-sm text-gray-500 truncate">{store.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">Nenhuma loja encontrada.</p>
              <p className="text-sm text-gray-400 mt-1">Crie uma loja primeiro para começar.</p>
            </div>
          )}
          <div className="flex justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
