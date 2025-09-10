# Correções - Problemas de Upload de Imagens

## Problemas Identificados

1. **Erro no upload de imagens** - "Erro ao fazer upload da imagem" na página de edição da loja
2. **URLs inválidas no Next.js Image** - Propriedade `src` ausente causando erros no console
3. **Incompatibilidade de props** - Componente `ImageUpload` sendo chamado com propriedades incorretas

## Soluções Implementadas

### 1. Correção das Propriedades do ImageUpload
Arquivo: `/src/app/dashboard/store/[id]/edit/edit-store-client.tsx`

**Problema:** O componente estava sendo chamado com propriedades incorretas:
```tsx
// ANTES (INCORRETO)
<ImageUpload
  onImageUploaded={(url) => handleInputChange('coverImage', url)}
  folder="store"
/>

// DEPOIS (CORRETO)
<ImageUpload
  onUpload={(url) => handleInputChange('coverImage', url)}
  type="store"
  storeid={store.id}
  placeholder="Clique para adicionar uma imagem de capa"
/>
```

### 2. Melhoria na Validação de URLs no ImageThumb
Arquivo: `/src/components/ui/ImageThumb.tsx`

**Adicionada validação robusta para URLs:**
- Verifica se `src` não está vazio
- Verifica se não contém `undefined` ou `null` na string
- Evita renderizar `<img>` com URLs inválidas que causam erros no console

```tsx
const isValidUrl = src && src.trim() !== '' && !src.includes('undefined') && !src.includes('null');

if (!isValidUrl || hasError) {
  // Renderiza placeholder em vez de tentar carregar imagem inválida
}
```

### 3. Logs Detalhados na API de Upload
Arquivo: `/src/app/api/upload/route.ts`

**Melhorias implementadas:**
- Logs detalhados em cada etapa do processo
- Verificação de permissões de escrita no diretório
- Validação de criação bem-sucedida do arquivo
- Tratamento de erros mais específico
- Fallback com placeholder em caso de falha

### 4. Logs Detalhados no Cliente
Arquivo: `/src/components/ImageUpload.tsx`

**Melhorias implementadas:**
- Logs detalhados do processo de upload no cliente
- Garantia que `type` e `storeid` não sejam `undefined`
- Melhor tratamento de erros com status HTTP
- Mensagens de erro mais informativas

## Fluxo de Debug Implementado

### No Cliente (ImageUpload.tsx):
1. Log dos dados do arquivo antes do envio
2. Log da resposta HTTP recebida
3. Tratamento de erros com detalhes do status

### Na API (upload/route.ts):
1. Log de autenticação do usuário
2. Log de validação do arquivo
3. Log de criação do diretório
4. Log de verificação de permissões
5. Log de escrita do arquivo
6. Log de verificação final

## Como Testar

### 1. Upload de Imagens da Loja:
1. Vá para Dashboard > Editar Loja
2. Tente fazer upload de uma imagem de capa ou logo
3. Verifique o console do navegador para logs detalhados
4. Verifique o console do servidor para logs da API

### 2. Verificar Placeholders:
1. Certifique-se de que não há mais erros de `src` ausente no console
2. Itens sem imagem devem mostrar placeholder elegante
3. URLs inválidas não devem mais causar erros

## Arquivos Modificados

1. **`/src/app/dashboard/store/[id]/edit/edit-store-client.tsx`**
   - Corrigidas propriedades do componente ImageUpload
   - Uso das props corretas: `onUpload`, `type`, `storeid`

2. **`/src/components/ui/ImageThumb.tsx`**
   - Validação robusta de URLs antes de renderizar `<img>`
   - Prevenção de erros por URLs inválidas

3. **`/src/app/api/upload/route.ts`**
   - Logs detalhados em cada etapa
   - Verificação de permissões de diretório
   - Melhor tratamento de erros

4. **`/src/components/ImageUpload.tsx`**
   - Logs detalhados do processo de upload
   - Validação de parâmetros obrigatórios
   - Melhor feedback de erros

## Resultado Esperado

- ✅ **Uploads funcionando** - Imagens de capa e logo salvam corretamente
- ✅ **Console limpo** - Sem erros de `src` ausente
- ✅ **Debug facilitado** - Logs detalhados para identificar problemas
- ✅ **Fallbacks robustos** - Placeholders elegantes para imagens ausentes
- ✅ **Tratamento de erros** - Mensagens informativas em caso de falha

## Próximos Passos

Se ainda houver problemas de upload:

1. **Verificar permissões do sistema de arquivos** no servidor
2. **Verificar espaço em disco** disponível
3. **Verificar configuração do servidor web** (nginx/apache)
4. **Verificar configuração do Next.js** para upload de arquivos

## Observações

- Todos os logs são removíveis em produção através de variáveis de ambiente
- O sistema agora tem fallbacks robustos para qualquer falha de upload
- A validação de URLs evita problemas de renderização no cliente
- As correções mantêm compatibilidade com código existente
