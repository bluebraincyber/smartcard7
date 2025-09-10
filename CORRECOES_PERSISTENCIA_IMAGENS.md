# Correções - Persistência de Imagens da Loja

## Problemas Identificados

1. **Imagens não persistem** - Uploads funcionam mas não são salvos no banco de dados
2. **Imagens não aparecem na loja pública** - API não retorna as colunas de imagem
3. **Warning Next.js** - Propriedade `sizes` ausente no componente Image
4. **Incompatibilidade de colunas** - `active` vs `isactive` e `logo` vs `profileimage`

## Soluções Implementadas

### 1. Correção da API de Atualização da Loja
Arquivo: `/src/app/api/stores/[id]/route.ts`

**Problemas corrigidos:**
- Adicionado salvamento das imagens no banco de dados
- Corrigido mapeamento de colunas: `logo` (banco) ↔ `profileImage` (frontend)
- Corrigido mapeamento de colunas: `active` (banco) ↔ `isactive` (frontend)
- Adicionado placeholders `$` corretos nas queries SQL

```typescript
// ANTES - Imagens não eram salvas
if (body.isactive !== undefined) {
  paramCount++
  setParts.push(`isactive = $${paramCount}`)
  values.push(body.isactive)
}

// DEPOIS - Imagens são salvas corretamente
if (body.coverImage !== undefined) {
  paramCount++
  setParts.push(`coverimage = $${paramCount}`)
  values.push(body.coverImage)
}

if (body.profileImage !== undefined) {
  paramCount++
  setParts.push(`logo = $${paramCount}`)
  values.push(body.profileImage)
}

if (body.isactive !== undefined) {
  paramCount++
  setParts.push(`active = $${paramCount}`)
  values.push(body.isactive)
}
```

### 2. Correção da API Pública da Loja
Arquivo: `/src/app/[slug]/page.tsx`

**Problemas corrigidos:**
- Adicionado busca das colunas de imagem (`coverimage`, `logo`)
- Mapeamento correto de `active` → `isactive` para compatibilidade
- Exposição das imagens como `coverImage` e `profileImage`

```typescript
// ANTES - Não buscava imagens
const storeResult = await pool.query(
  `SELECT id, name, slug, description, whatsapp, address, isactive, userid, created_at, updated_at 
   FROM stores WHERE slug = $1 LIMIT 1`,
  [slug]
);

// DEPOIS - Busca imagens do banco
const storeResult = await pool.query(
  `SELECT id, name, slug, description, whatsapp, address, active, userid, created_at, updated_at,
          coverimage, logo
   FROM stores WHERE slug = $1 LIMIT 1`,
  [slug]
);

const finalStore = { 
  ...store,
  isactive: store.active,
  coverImage: store.coverimage,
  profileImage: store.logo,
  primaryColor: '#EA1D2C',
  categories: enrichedCategories 
};
```

### 3. Correção do Warning Next.js Image
Arquivo: `/src/components/ImageUpload.tsx`

**Problema:** Warning sobre propriedade `sizes` ausente
**Solução:** Adicionada propriedade `sizes` responsiva

```tsx
// ANTES - Sem sizes
<Image
  src={currentImage}
  alt="Imagem carregada"
  fill
  className="object-cover"
/>

// DEPOIS - Com sizes
<Image
  src={currentImage}
  alt="Imagem carregada"
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### 4. Mapeamento de Dados Consistente

**Estrutura do Banco vs Frontend:**

| Banco de Dados | Frontend | Descrição |
|----------------|----------|-----------|
| `coverimage` | `coverImage` | Imagem de capa da loja |
| `logo` | `profileImage` | Logo/perfil da loja |
| `active` | `isactive` | Status ativo da loja |

## Fluxo de Upload Corrigido

### 1. **Upload da Imagem:**
1. Usuário seleciona imagem no componente `ImageUpload`
2. Arquivo é enviado para `/api/upload`
3. Imagem é salva fisicamente em `/public/uploads/store/`
4. URL é retornada: `/api/uploads/store/filename.ext`

### 2. **Salvamento no Banco:**
1. URL da imagem é armazenada no estado do formulário
2. Ao clicar "Salvar", dados são enviados para `/api/stores/[id]`
3. API agora corretamente salva as URLs no banco de dados
4. Colunas `coverimage` e `logo` são atualizadas

### 3. **Exibição na Loja:**
1. API pública busca imagens do banco (`coverimage`, `logo`)
2. Dados são mapeados para `coverImage` e `profileImage`
3. Componente `PublicStorePage` renderiza as imagens

## Arquivos Modificados

1. **`/src/app/api/stores/[id]/route.ts`**
   - Salvamento de imagens no banco (PATCH)
   - Mapeamento correto de colunas (GET)
   - Correção de placeholders SQL

2. **`/src/app/[slug]/page.tsx`**
   - Busca de imagens na API pública
   - Mapeamento de dados para compatibilidade

3. **`/src/components/ImageUpload.tsx`**
   - Propriedade `sizes` para eliminar warning

## Como Testar

### 1. **Upload e Persistência:**
1. Dashboard > Editar Loja
2. Fazer upload de imagem de capa e logo
3. Clicar "Salvar Alterações"
4. Verificar que as imagens permanecem após refresh

### 2. **Exibição na Loja Pública:**
1. Acessar a URL pública da loja (`/{slug}`)
2. Verificar que as imagens de capa e logo aparecem
3. Confirmar que não há mais erros no console

### 3. **Console Limpo:**
1. Verificar que não há mais warnings de `sizes`
2. Confirmar uploads com status 200 OK
3. Verificar logs de salvamento no banco

## Resultado

- ✅ **Imagens persistem** - Salvamento correto no banco de dados
- ✅ **Exibição na loja** - Imagens aparecem na página pública
- ✅ **Console limpo** - Sem warnings do Next.js Image
- ✅ **Compatibilidade** - Mapeamento correto entre banco e frontend
- ✅ **Upload completo** - Fluxo end-to-end funcionando

## Observações

- As imagens são armazenadas fisicamente em `/public/uploads/store/`
- As URLs são salvas no banco como referências
- O mapeamento de colunas mantém compatibilidade com código existente
- Sistema robusto com fallbacks para imagens ausentes
