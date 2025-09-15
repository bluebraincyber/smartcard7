# Correção: Exibição das Imagens de Capa e Perfil da Loja

## 🚨 **Problema Identificado**

As fotos de capa e perfil da loja não estavam sendo exibidas na página pública devido a:

1. **Campos não buscados no banco**: A query não incluía os campos `logo` e `coverimage`
2. **URLs hardcoded como null**: O código forçava as imagens como `null`
3. **Falta de tratamento de erro**: Sem fallbacks para URLs inválidas
4. **URLs relativas**: Imagens locais precisam ser servidas via API

## 🔧 **Correções Implementadas**

### 1. **Backend - Query SQL Atualizada**

**Arquivo**: `src/app/[slug]/page.tsx`

```sql
-- ANTES
SELECT id, name, slug, description, whatsapp, address, isactive, created_at, updated_at

-- DEPOIS  
SELECT id, name, slug, description, whatsapp, address, logo, coverimage, isactive, created_at, updated_at
```

### 2. **Mapeamento Correto dos Campos**

```tsx
// ANTES - hardcoded como null
const finalStore = {
  // ...
  coverImage: null,
  profileImage: null,
  // ...
}

// DEPOIS - usa os dados do banco
const finalStore = {
  // ...
  coverImage: store.coverimage || null,
  profileImage: store.logo || null,
  // ...
}
```

### 3. **Frontend - Tratamento de URLs e Fallbacks**

**Arquivo**: `src/components/PublicStorePage.tsx`

#### **Imagem de Capa (Cover)**
```tsx
// URL com tratamento para imagens locais
src={store.coverImage.startsWith('/') ? `/api${store.coverImage}` : store.coverImage}

// Handler de erro elegante
onError={(e) => {
  console.error('Erro ao carregar imagem de capa:', store.coverImage)
  e.currentTarget.style.display = 'none'
  e.currentTarget.parentElement?.classList.add('bg-gradient-to-r', 'from-blue-500', 'to-purple-600')
}}
```

#### **Imagem de Perfil (Logo)**
```tsx
// Fallback sempre presente
{store.profileImage ? (
  <Image
    src={store.profileImage.startsWith('/') ? `/api${store.profileImage}` : store.profileImage}
    onError={(e) => {
      // Esconde imagem quebrada e mostra fallback
      e.currentTarget.style.display = 'none'
      const fallback = e.currentTarget.nextElementSibling as HTMLElement
      if (fallback) fallback.style.display = 'flex'
    }}
  />
) : null}

{/* Fallback sempre presente */}
<div 
  className="..."
  style={{ display: store.profileImage ? 'none' : 'flex' }}
>
  {/* Ícone de placeholder */}
</div>
```

### 4. **Sistema de Logs para Debug**

```tsx
console.log('🖼️ Imagens da loja:', { 
  coverImage: store.coverimage, 
  profileImage: store.logo,
  finalCoverImage: finalStore.coverImage,
  finalProfileImage: finalStore.profileImage
});
```

## 🌟 **Benefícios da Correção**

1. **✅ Imagens Funcionais**: Capa e perfil agora carregam corretamente
2. **✅ Fallbacks Elegantes**: Se a imagem falhar, mostra placeholder visual
3. **✅ URLs Locais Suportadas**: Imagens do sistema de upload funcionam via `/api/uploads`
4. **✅ URLs Externas Suportadas**: Imagens de CDN externos também funcionam
5. **✅ Experiência Consistente**: Sempre há algo visual para mostrar
6. **✅ Debug Melhorado**: Logs para identificar problemas de imagem

## 🎯 **Como Funciona Agora**

### **Fluxo de Carregamento de Imagens:**

1. **Query busca** os campos `logo` e `coverimage` do banco
2. **Backend mapeia** os campos para `profileImage` e `coverImage`
3. **Frontend detecta** se a URL é local (começa com `/`) ou externa
4. **URLs locais** são prefixadas com `/api` para serem servidas corretamente
5. **URLs externas** são usadas diretamente
6. **Se erro ocorrer**, fallback visual é mostrado automaticamente

### **Tipos de URL Suportadas:**

- ✅ **Locais**: `/uploads/store/123_logo.png` → `/api/uploads/store/123_logo.png`
- ✅ **Externas**: `https://cdn.exemplo.com/logo.png` → usado diretamente
- ✅ **Vazias/null**: Mostra placeholder elegante

## 🔧 **Sistema de Upload Existente**

O projeto já possui:
- ✅ API de upload: `/api/upload`
- ✅ API de servir imagens: `/api/uploads/[...path]`
- ✅ Validação de tipos: JPEG, PNG, WebP
- ✅ Limite de tamanho: 5MB
- ✅ Organização por tipo: `/uploads/store/`, `/uploads/item/`

## 📊 **Debug e Monitoramento**

Para verificar se as imagens estão carregando:

1. **Console do navegador**: Logs de erro de imagem
2. **Network tab**: Requisições para `/api/uploads/`
3. **Logs do servidor**: Status das queries SQL
4. **Banco de dados**: Verificar se campos `logo` e `coverimage` têm URLs válidas

## ✅ **Status**

**🎉 CORREÇÃO IMPLEMENTADA COM SUCESSO!**

As imagens de capa e perfil agora:
- ✅ São buscadas corretamente do banco de dados
- ✅ Carregam através do sistema de upload existente
- ✅ Têm fallbacks visuais em caso de erro
- ✅ Suportam URLs locais e externas
- ✅ Mantêm a experiência visual consistente

---

*Correção aplicada em: 15/09/2025*  
*Arquivos modificados: `[slug]/page.tsx`, `PublicStorePage.tsx`*  
*Status: ✅ Implementado e testado*
