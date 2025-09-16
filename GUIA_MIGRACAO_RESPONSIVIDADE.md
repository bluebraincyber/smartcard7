# 🔄 Guia de Migração - Responsividade SmartCard7

## 📋 Componentes para Atualizar

Esta lista detalha todos os componentes existentes que precisam ser atualizados com as novas implementações responsivas.

---

## 🎯 Prioridade ALTA (Crítico)

### 1. Layout Principal
**Arquivos:** `src/app/layout.tsx`, `src/app/dashboard/layout.tsx`

#### ❌ Antes:
```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  )
}
```

#### ✅ Depois:
```tsx
import { ResponsiveMainLayout } from '@/components/ui/ResponsiveLayout'
import { BottomNavigation } from '@/components/navigation/BottomNavigation'

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <ResponsiveMainLayout
          bottomNav={<BottomNavigation />}
        >
          {children}
        </ResponsiveMainLayout>
      </body>
    </html>
  )
}
```

### 2. Página de Produtos da Loja
**Arquivo:** `src/app/dashboard/store/[id]/page.tsx`

#### Atualizações necessárias:
- [ ] Substituir cards customizados por `ProductCard`
- [ ] Implementar `ProductGrid` com layout adaptável
- [ ] Adicionar bottom navigation
- [ ] Converter modais para `AdaptiveModal`

#### ❌ Código atual:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {products.map(product => (
    <div key={product.id} className="bg-card rounded-lg p-4">
      {/* Card customizado */}
    </div>
  ))}
</div>
```

#### ✅ Código atualizado:
```tsx
<ProductGrid
  products={products}
  onEdit={handleEditProduct}
  onDelete={handleDeleteProduct}
  onView={handleViewProduct}
  layout={isMobileLayout ? 'grid' : layout}
  loading={loading}
/>
```

### 3. Formulário de Nova Loja
**Arquivo:** `src/app/dashboard/store/new/page.tsx` ✅ (Já corrigido)

Status: **CONCLUÍDO** - Arquivo já foi atualizado com correções de sintaxe e classes responsivas.

---

## 🔶 Prioridade MÉDIA (Importante)

### 4. Página de Dashboard Principal
**Arquivo:** `src/app/dashboard/page.tsx`

#### Atualizações necessárias:
- [ ] Implementar `ResponsiveContainer`
- [ ] Adicionar `ResponsiveGrid` para cards de loja
- [ ] Otimizar para mobile com bottom navigation
- [ ] Implementar cards de estatísticas responsivos

### 5. Sidebar de Navegação
**Arquivos:** Componentes de sidebar existentes

#### Atualizações necessárias:
- [ ] Ocultar no mobile (usar `nav-desktop` class)
- [ ] Garantir que não interfere com bottom nav
- [ ] Implementar overlay para mobile (drawer)

### 6. Modais de Edição
**Arquivos:** Modais de edição de produtos, categorias, etc.

#### ❌ Padrão atual:
```tsx
{showModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      {/* Conteúdo */}
    </div>
  </div>
)}
```

#### ✅ Novo padrão:
```tsx
<AdaptiveModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Editar Produto"
  size="lg"
>
  {/* Conteúdo */}
</AdaptiveModal>
```

### 7. Formulários Existentes
**Arquivos:** Todos os formulários da aplicação

#### Componentes a substituir:
- [ ] `<input>` → `<ResponsiveInput>`
- [ ] `<textarea>` → `<ResponsiveTextarea>`
- [ ] `<select>` → `<ResponsiveSelect>`
- [ ] `<button>` → `<ResponsiveButton>`
- [ ] Adicionar `<ResponsiveForm>` wrapper

---

## 🔸 Prioridade BAIXA (Melhorias)

### 8. Página Pública da Loja
**Arquivos:** Páginas públicas das lojas (`/store/[slug]`)

#### Atualizações necessárias:
- [ ] Implementar grid responsivo de produtos
- [ ] Otimizar carrinho para mobile
- [ ] Implementar navigation drawer
- [ ] Adicionar PWA features

### 9. Página de Analytics
**Arquivos:** Páginas de analytics e relatórios

#### Atualizações necessárias:
- [ ] Gráficos responsivos
- [ ] Tabelas com scroll horizontal
- [ ] Cards de métricas empilháveis
- [ ] Filtros adaptáveis

### 10. Configurações
**Arquivos:** Páginas de configurações

#### Atualizações necessárias:
- [ ] Formulários responsivos
- [ ] Tabs adaptáveis
- [ ] Upload de imagens otimizado para mobile

---

## 🛠️ Scripts de Migração

### Script 1: Atualizar Imports
```bash
# Buscar e substituir imports antigos
find src -name "*.tsx" -exec sed -i 's/import { Modal }/import { AdaptiveModal as Modal }/g' {} \;
find src -name "*.tsx" -exec sed -i 's/import { Button }/import { ResponsiveButton as Button }/g' {} \;
```

### Script 2: Identificar Componentes para Migração
```bash
# Encontrar todos os modais customizados
grep -r "fixed inset-0" src --include="*.tsx"

# Encontrar grids customizados
grep -r "grid grid-cols" src --include="*.tsx"

# Encontrar formulários
grep -r "<form" src --include="*.tsx"
```

---

## 📝 Template de Migração

### Para Páginas de Listagem:
```tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Search, Filter } from 'lucide-react'

// Novos imports responsivos
import { ResponsiveContainer, ResponsivePageHeader } from '@/components/ui/ResponsiveLayout'
import { ResponsiveInput, ResponsiveButton } from '@/components/ui/ResponsiveForms'
import { ProductGrid } from '@/components/ui/ProductCard'
import { AdaptiveModal } from '@/components/ui/ResponsiveModal'
import { BottomNavigation } from '@/components/navigation/BottomNavigation'
import { useMobileLayout } from '@/hooks/useResponsive'

export default function ResponsivePage() {
  const params = useParams()
  const isMobileLayout = useMobileLayout()
  
  // Estados...
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <ResponsiveContainer size="full" padding="none">
        {/* Header */}
        <div className="space-mobile border-b border-border bg-card">
          <ResponsivePageHeader
            title="Título da Página"
            description="Descrição"
            actions={
              <ResponsiveButton
                onClick={() => setShowModal(true)}
                leftIcon={<Plus className="h-4 w-4" />}
                size={isMobileLayout ? 'sm' : 'md'}
              >
                {isMobileLayout ? 'Novo' : 'Novo Item'}
              </ResponsiveButton>
            }
          />
        </div>

        {/* Busca e Filtros */}
        <div className="space-mobile">
          <ResponsiveInput
            placeholder="Buscar..."
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>

        {/* Grid de Itens */}
        <div className="space-mobile">
          <ProductGrid
            products={items}
            loading={loading}
          />
        </div>

        {/* Modal */}
        <AdaptiveModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Novo Item"
        >
          {/* Conteúdo do modal */}
        </AdaptiveModal>

        {/* Bottom Navigation */}
        <BottomNavigation storeId={params.id} />
      </ResponsiveContainer>
    </div>
  )
}
```

---

## 🧪 Checklist de Testes

### Para cada componente migrado:

#### Mobile (< 768px)
- [ ] Touch targets >= 48x48px
- [ ] Bottom navigation visível e funcional
- [ ] Modais se abrem como drawer
- [ ] Formulários usam font-size >= 16px
- [ ] Grid adapta para 1-2 colunas
- [ ] Espaçamento adequado entre elementos

#### Tablet (768px - 1024px)
- [ ] Layout híbrido funciona corretamente
- [ ] Sidebar pode ser opcional
- [ ] Modais ocupam tamanho apropriado
- [ ] Grid usa 3-4 colunas

#### Desktop (>= 1024px)
- [ ] Sidebar fixa visível
- [ ] Bottom navigation oculta
- [ ] Modais centralizados
- [ ] Grid usa 4-5 colunas
- [ ] Hover states funcionam

### Testes de Funcionalidade
- [ ] Navegação entre páginas
- [ ] Estado ativo na navegação
- [ ] Modais abrem/fecham corretamente
- [ ] Formulários validam adequadamente
- [ ] Loading states aparecem
- [ ] Animações são suaves

---

## 📊 Progresso da Migração

### ✅ Concluído
- [x] Sistema de breakpoints
- [x] Hooks responsivos
- [x] Componentes base (Container, Grid, Forms, Modal)
- [x] Bottom navigation
- [x] CSS utilities
- [x] Documentação

### 🔄 Em Progresso
- [ ] Página de nova loja (corrigida sintaxe)
- [ ] Templates de migração
- [ ] Scripts de automação

### ⏳ Pendente
- [ ] Dashboard principal
- [ ] Páginas de produtos
- [ ] Modais existentes
- [ ] Formulários existentes
- [ ] Sidebar navigation
- [ ] Páginas públicas
- [ ] Analytics
- [ ] Configurações

---

## 🎯 Próximos Passos

1. **Semana 1:** Migrar componentes de prioridade ALTA
2. **Semana 2:** Migrar componentes de prioridade MÉDIA  
3. **Semana 3:** Migrar componentes de prioridade BAIXA
4. **Semana 4:** Testes finais e ajustes

### Meta Final
- [ ] 100% das páginas responsivas
- [ ] Performance mobile score >= 90
- [ ] Acessibilidade score >= 95
- [ ] Zero layout shifts (CLS < 0.1)

---

*Este guia deve ser atualizado conforme os componentes são migrados. Marque os itens como concluídos à medida que implementa as mudanças.*
