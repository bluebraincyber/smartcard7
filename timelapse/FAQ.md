# 🚨 FAQ Técnico - Problemas Comuns

## Problemas de Autenticação

### ❌ "auth is not a function"
**Causa**: Mistura de sistemas de autenticação  
**Solução**: 
```typescript
// ❌ Errado
import { auth } from '@/auth'
const session = await auth()

// ✅ Correto
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
const session = await getServerSession(authOptions)
```

### ❌ "Unauthorized" em APIs funcionais
**Causa**: Sessão não sendo passada corretamente  
**Checklist**:
1. Verificar se `authOptions` está importado
2. Confirmar se `session.user.id` existe
3. Validar se middleware está ativo

## Problemas de Database

### ❌ "column does not exist"
**Causa**: Nome de coluna incorreto ou casing  
**Solução**:
```sql
-- ❌ Errado
SELECT isavailable FROM items

-- ✅ Correto  
SELECT "isAvailable" FROM items
```

### ❌ "violates not-null constraint"
**Causa**: Campo obrigatório não sendo enviado  
**Checklist**:
1. Verificar schema da tabela
2. Adicionar campo na query INSERT
3. Validar dados antes da inserção

### ❌ "could not determine data type of parameter"
**Causa**: Uso incorreto de tagged templates  
**Solução**:
```typescript
// ❌ Errado
const result = await sql`SELECT * FROM table WHERE id = ${id}`

// ✅ Correto
const result = await pool.query('SELECT * FROM table WHERE id = $1', [id])
```

## Problemas de Frontend

### ❌ Componente não re-renderiza após mudança
**Causa**: Estado não está sendo atualizado corretamente  
**Solução**:
```typescript
// ❌ Errado - mutação direta
items.push(newItem)
setItems(items)

// ✅ Correto - imutabilidade
setItems(prevItems => [...prevItems, newItem])
```

### ❌ "Cannot read properties of undefined"
**Causa**: Dados não carregados ainda  
**Solução**:
```typescript
// ✅ Sempre usar optional chaining
const categoryName = category?.name || 'Loading...'
```

### ❌ Rota retorna 404
**Causa**: Estrutura de pastas incorreta  
**Checklist**:
1. Verificar se pasta existe
2. Confirmar se `page.tsx` está presente
3. Validar parâmetros dinâmicos `[id]`

## Comandos Úteis para Debug

### Verificar Logs do Servidor
```bash
# Ver logs em tempo real
tail -f /var/log/nextjs.log

# Filtrar erros específicos
grep "Error" /var/log/nextjs.log

# Ver últimas 50 linhas
tail -50 /var/log/nextjs.log
```

### Database Debugging
```sql
-- Verificar estrutura de tabela
\d items

-- Ver últimos registros
SELECT * FROM items ORDER BY created_at DESC LIMIT 5;

-- Verificar constraints
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'items';
```

### Network Debugging (Browser)
1. F12 → Network
2. Filtrar por "Fetch/XHR"
3. Verificar status codes
4. Examinar payload de requests

## Checklist de Troubleshooting

### Antes de Reportar Bug
- [ ] Verificar console do navegador
- [ ] Checar logs do servidor
- [ ] Confirmar se dados existem no banco
- [ ] Testar em incógnito
- [ ] Limpar cache (Ctrl+Shift+R)

### Para Problemas de API
- [ ] Verificar autenticação
- [ ] Validar parâmetros de entrada
- [ ] Confirmar estrutura de dados
- [ ] Testar query SQL isoladamente
- [ ] Verificar headers da requisição

### Para Problemas de UI
- [ ] Verificar estado do componente
- [ ] Confirmar props estão sendo passadas
- [ ] Testar em diferentes navegadores
- [ ] Verificar erros no console
- [ ] Validar CSS/styling

## Códigos de Status HTTP Comuns

| Código | Significado | Ação |
|--------|-------------|------|
| 200 | Sucesso | Verificar dados retornados |
| 400 | Bad Request | Validar parâmetros enviados |
| 401 | Unauthorized | Verificar autenticação |
| 404 | Not Found | Confirmar rota/recurso existe |
| 500 | Server Error | Verificar logs do servidor |

## Problemas Conhecidos e Workarounds

### Toggle de Disponibilidade Lento
**Workaround**: Usar atualização otimista de estado
```typescript
// Atualizar UI imediatamente
setItems(prev => prev.map(item => 
  item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
))

// Depois fazer call para API
updateItemAPI(id, data)
```

### Upload de Imagem Falha
**Checklist**:
1. Verificar tamanho < 5MB
2. Formato aceito (JPEG, PNG, WebP)
3. API de upload funcionando
4. Permissões de pasta uploads/

### Categoria Não Aparece
**Causa Comum**: Cache do navegador ou estado desatualizado  
**Solução**: 
1. Recarregar página
2. Verificar se categoria está ativa
3. Confirmar se pertence ao usuário correto

---
**Última atualização**: 09-09-2025
