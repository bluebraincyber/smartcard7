/**
 * Utilitários para gerenciamento de subdomínios do SmartCard
 */

/**
 * Lista de subdomínios reservados que não podem ser usados como slugs
 */
const RESERVED_SUBDOMAINS = [
  'www',
  'api',
  'admin',
  'dashboard',
  'app',
  'mail',
  'ftp',
  'blog',
  'docs',
  'help',
  'support',
  'status',
  'cdn',
  'assets',
  'static',
  'media',
  'images',
  'files',
  'download',
  'upload',
  'test',
  'dev',
  'staging',
  'prod',
  'production',
  'beta',
  'alpha',
  'demo',
  'preview',
  'sandbox'
]

/**
 * Valida se um slug é válido para uso como subdomínio
 */
export function isValidSlug(slug: string): boolean {
  // Verificar se não está vazio
  if (!slug || slug.trim().length === 0) {
    return false
  }

  // Verificar comprimento (3-63 caracteres)
  if (slug.length < 3 || slug.length > 63) {
    return false
  }

  // Verificar se contém apenas caracteres válidos (letras, números, hífens)
  const validPattern = /^[a-z0-9-]+$/
  if (!validPattern.test(slug)) {
    return false
  }

  // Não pode começar ou terminar com hífen
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return false
  }

  // Não pode ter hífens consecutivos
  if (slug.includes('--')) {
    return false
  }

  // Verificar se não é um subdomínio reservado
  if (RESERVED_SUBDOMAINS.includes(slug.toLowerCase())) {
    return false
  }

  return true
}

/**
 * Normaliza um slug removendo caracteres especiais e convertendo para lowercase
 */
export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    // Remover acentos
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Substituir espaços e caracteres especiais por hífens
    .replace(/[^a-z0-9-]/g, '-')
    // Remover hífens múltiplos
    .replace(/-+/g, '-')
    // Remover hífens do início e fim
    .replace(/^-+|-+$/g, '')
}

/**
 * Gera sugestões de slug baseadas no nome do negócio
 */
export function generateSlugSuggestions(businessName: string): string[] {
  const baseSlug = normalizeSlug(businessName)
  const suggestions: string[] = []

  // Adicionar o slug base se for válido
  if (isValidSlug(baseSlug)) {
    suggestions.push(baseSlug)
  }

  // Gerar variações
  const variations = [
    `${baseSlug}-oficial`,
    `${baseSlug}-store`,
    `${baseSlug}-shop`,
    `${baseSlug}-2024`,
    `${baseSlug}-br`,
    `loja-${baseSlug}`,
    `${baseSlug}-online`
  ]

  variations.forEach(variation => {
    if (isValidSlug(variation) && !suggestions.includes(variation)) {
      suggestions.push(variation)
    }
  })

  return suggestions.slice(0, 5) // Retornar no máximo 5 sugestões
}

/**
 * Extrai o slug do hostname
 */
export function extractSlugFromHostname(hostname: string): string | null {
  if (!hostname.includes('.smartcard.app')) {
    return null
  }

  const parts = hostname.split('.')
  if (parts.length < 3) {
    return null
  }

  const slug = parts[0]
  return isValidSlug(slug) ? slug : null
}

/**
 * Constrói a URL completa do subdomínio
 */
export function buildSubdomainUrl(slug: string, path: string = ''): string {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://smartcard.app'
    : 'http://localhost:3000'
  
  const subdomain = `${slug}.${baseUrl.replace(/^https?:\/\//, '')}`
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  
  return `${protocol}://${subdomain}${path}`
}

/**
 * Verifica se um hostname é um subdomínio válido do SmartCard
 */
export function isSmartCardSubdomain(hostname: string): boolean {
  return hostname.includes('.smartcard.app') && 
         !hostname.startsWith('dashboard.') &&
         !hostname.startsWith('www.')
}
