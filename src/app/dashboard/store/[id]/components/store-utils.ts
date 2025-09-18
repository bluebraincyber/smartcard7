import { Item, Category } from '@/types/store';

/**
 * Formata um valor numérico para moeda brasileira (BRL)
 * @param value Valor numérico a ser formatado
 * @returns String formatada como moeda brasileira
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Gera um placeholder para imagens usando o serviço placeholder.com
 * @param width Largura da imagem
 * @param height Altura da imagem
 * @param text Texto a ser exibido no placeholder
 * @returns URL da imagem de placeholder
 */
export const getImagePlaceholder = (
  width: number = 300,
  height: number = 200,
  text: string = 'Sem imagem'
): string => {
  const encodedText = encodeURIComponent(text);
  return `https://via.placeholder.com/${width}x${height}?text=${encodedText}`;
};

/**
 * Filtra produtos com base em uma consulta de busca
 * @param products Lista de produtos
 * @param query Termo de busca
 * @returns Lista de produtos filtrados
 */
export const filterProductsByQuery = (products: Item[], query: string): Item[] => {
  if (!query.trim()) return products;
  
  const searchTerm = query.toLowerCase().trim();
  return products.filter(
    product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.categoryId.toLowerCase().includes(searchTerm)
  );
};

/**
 * Filtra produtos por categoria
 * @param products Lista de produtos
 * @param categoryId ID da categoria (ou 'all' para todas)
 * @returns Lista de produtos filtrados por categoria
 */
export const filterProductsByCategory = (
  products: Item[],
  categoryId: string
): Item[] => {
  if (categoryId === 'all') return products;
  return products.filter(product => product.categoryId === categoryId);
};

/**
 * Ordena produtos com base em uma estratégia de ordenação
 * @param products Lista de produtos
 * @param sortBy Estratégia de ordenação (ex: 'name-asc', 'price-desc')
 * @returns Lista de produtos ordenada
 */
export const sortProducts = (products: Item[], sortBy: string): Item[] => {
  const [field, direction] = sortBy.split('-') as [keyof Item, 'asc' | 'desc'];
  
  return [...products].sort((a, b) => {
    let valueA = a[field];
    let valueB = b[field];

    // Tratar valores undefined
    if (valueA === undefined) return direction === 'asc' ? -1 : 1;
    if (valueB === undefined) return direction === 'asc' ? 1 : -1;

    // Converter para string para comparação segura
    valueA = String(valueA).toLowerCase();
    valueB = String(valueB).toLowerCase();

    if (valueA < valueB) return direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Valida se um arquivo é uma imagem
 * @param file Arquivo a ser validado
 * @returns true se for uma imagem, false caso contrário
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Valida o tamanho de um arquivo
 * @param file Arquivo a ser validado
 * @param maxSize Tamanho máximo em MB
 * @returns true se o tamanho for válido, false caso contrário
 */
export const validateFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  const maxSize = maxSizeMB * 1024 * 1024; // Converter para bytes
  return file.size <= maxSize;
};

/**
 * Converte um arquivo para base64
 * @param file Arquivo a ser convertido
 * @returns Promise com a string base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Obtém o nome da categoria pelo ID
 * @param categories Lista de categorias
 * @param categoryId ID da categoria
 * @returns Nome da categoria ou 'Sem categoria' se não encontrada
 */
export const getCategoryName = (
  categories: Category[],
  categoryId: string
): string => {
  const category = categories.find(cat => cat.id === categoryId);
  return category?.name || 'Sem categoria';
};

/**
 * Gera um ID único
 * @returns String com ID único
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
