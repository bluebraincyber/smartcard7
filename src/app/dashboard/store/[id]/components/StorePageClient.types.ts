import { Store } from '@/types/store';

export interface StorePageClientProps {
  /**
   * Dados da loja a serem exibidos
   */
  store: Store;
  
  /**
   * Callback chamado quando os dados da loja são atualizados
   * @param updatedStore Dados atualizados da loja
   */
  onStoreUpdate?: (updatedStore: Store) => void;
  
  /**
   * Indica se a página está em estado de carregamento
   */
  isLoading?: boolean;
  
  /**
   * Mensagem de erro, se houver
   */
  error?: string | null;
  
  /**
   * Classe CSS adicional para personalização
   */
  className?: string;
}

// Exportar tipos adicionais que podem ser úteis para componentes filhos
export * from './store-utils';
export * from './store-texts';
