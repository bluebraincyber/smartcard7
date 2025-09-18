// Textos da página da loja
export const STORE_TEXTS = {
  // Títulos e cabeçalhos
  STORE_HEADER: {
    SETTINGS: 'Configurações',
    SETTINGS_SHORT: 'Config',
    ADD_PRODUCT: 'Novo Produto',
    ADD_PRODUCT_SHORT: 'Produto',
    PRODUCTS: 'produtos',
    PRODUCT: 'produto',
    CATEGORIES: 'categorias',
    CATEGORY: 'categoria',
  },
  
  // Filtros e busca
  FILTERS: {
    SEARCH_PLACEHOLDER: 'Buscar produtos...',
    ALL_CATEGORIES: 'Todas as categorias',
    SEARCH_LABEL: 'Busca',
    CATEGORY_LABEL: 'Categoria',
    CLEAR_FILTERS: 'Limpar filtros',
  },
  
  // Estados vazios
  EMPTY_STATES: {
    NO_PRODUCTS_TITLE: 'Nenhum produto cadastrado',
    NO_PRODUCTS_DESCRIPTION: 'Adicione seu primeiro produto para começar.',
    NO_RESULTS_TITLE: 'Nenhum produto encontrado',
    NO_RESULTS_DESCRIPTION: 'Tente ajustar os filtros de busca.',
    ADD_FIRST_PRODUCT: 'Adicionar Produto',
  },
  
  // Modal de produto
  PRODUCT_MODAL: {
    TITLE_ADD: 'Novo Produto',
    TITLE_EDIT: 'Editar Produto',
    CANCEL: 'Cancelar',
    SAVE: 'Salvar',
    NAME_LABEL: 'Nome do Produto',
    DESCRIPTION_LABEL: 'Descrição',
    PRICE_LABEL: 'Preço',
    CATEGORY_LABEL: 'Categoria',
    IS_ACTIVE_LABEL: 'Ativo',
    IS_AVAILABLE_LABEL: 'Disponível para venda',
    IMAGE_LABEL: 'Imagem do Produto',
    UPLOAD_BUTTON: 'Enviar imagem',
  },
  
  // Mensagens de confirmação
  CONFIRMATION: {
    DELETE_PRODUCT: 'Tem certeza que deseja excluir este produto?',
    DELETE_CATEGORY: 'Tem certeza que deseja excluir esta categoria?',
  },
  
  // Mensagens de erro
  ERRORS: {
    LOADING: 'Erro ao carregar os dados da loja.',
    SAVING: 'Erro ao salvar as alterações.',
    DELETING: 'Erro ao excluir o item.',
  },
  
  // Mensagens de sucesso
  SUCCESS: {
    SAVED: 'Alterações salvas com sucesso!',
    DELETED: 'Item excluído com sucesso!',
  },
};

// Opções de layout
export const LAYOUT_OPTIONS = [
  { value: 'grid', label: 'Grade', icon: 'grid' },
  { value: 'list', label: 'Lista', icon: 'list' },
];

// Ordenação padrão
export const DEFAULT_SORT_OPTIONS = [
  { value: 'name-asc', label: 'Nome (A-Z)' },
  { value: 'name-desc', label: 'Nome (Z-A)' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
  { value: 'recent', label: 'Mais recentes' },
];

// Validação de formulário
export const VALIDATION = {
  REQUIRED: 'Campo obrigatório',
  INVALID_EMAIL: 'E-mail inválido',
  MIN_LENGTH: (length: number) => `Mínimo de ${length} caracteres`,
  MAX_LENGTH: (length: number) => `Máximo de ${length} caracteres`,
  MIN_VALUE: (value: number) => `Valor mínimo: ${value}`,
  MAX_VALUE: (value: number) => `Valor máximo: ${value}`,
};
