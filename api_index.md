# API Reference - Smartcard7

## Autenticação Global

Todas as rotas API requerem autenticação via NextAuth.js, exceto as rotas públicas. Headers obrigatórios:

```http
Cookie: next-auth.session-token=<session_token>
```

**Códigos de erro padrão:**
- `401 Unauthorized` - Sessão inválida ou expirada
- `403 Forbidden` - Acesso negado (recurso de outro tenant)
- `500 Internal Server Error` - Erro do servidor

## Autenticação

### NextAuth Routes
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET/POST` | `/api/auth/[...nextauth]` | Callback do NextAuth (login, logout, providers) |
| `POST` | `/api/auth/register` | Registro de novo usuário |
| `POST` | `/api/auth/login` | Login com credenciais |

#### POST /api/auth/register
```json
// Request Body
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "senha123"
}

// Response (201)
{
  "success": true,
  "user": {
    "id": "1",
    "name": "João Silva",
    "email": "joao@exemplo.com"
  }
}

// Errors
400 - Email já cadastrado, senha fraca
422 - Dados de entrada inválidos
```

## Gestão de Lojas

### GET /api/stores
Lista todas as lojas do usuário autenticado.

```json
// Response (200)
{
  "stores": [
    {
      "id": 1,
      "name": "Restaurante do João",
      "slug": "restaurante-joao",
      "description": "Comida caseira",
      "logo": "/uploads/store/logo.jpg",
      "coverImage": "/uploads/store/cover.jpg",
      "isActive": true,
      "whatsapp": "+5511999999999",
      "address": "Rua das Flores, 123",
      "businessType": "restaurant",
      "primaryColor": "#EA1D2C",
      "categoriesCount": 3,
      "itemsCount": 15,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T15:45:00Z"
    }
  ]
}
```

### POST /api/stores
Cria uma nova loja.

```json
// Request Body
{
  "name": "Minha Loja",
  "slug": "minha-loja",
  "description": "Descrição da loja",
  "whatsapp": "+5511999999999",
  "address": "Endereço completo",
  "businessType": "restaurant", // "restaurant" | "retail" | "service"
  "primaryColor": "#EA1D2C"
}

// Response (201)
{
  "success": true,
  "store": {
    "id": 2,
    "name": "Minha Loja",
    "slug": "minha-loja",
    // ... outros campos
  }
}

// Errors
400 - Nome obrigatório, slug já existe
422 - Dados de entrada inválidos
```

### GET /api/stores/{id}
Retorna detalhes completos da loja com categorias e itens.

```json
// Response (200)
{
  "id": 1,
  "name": "Restaurante do João",
  "slug": "restaurante-joao",
  "description": "Comida caseira",
  "logo": "/uploads/store/logo.jpg",
  "coverImage": "/uploads/store/cover.jpg",
  "isActive": true,
  "whatsapp": "+5511999999999",
  "address": "Rua das Flores, 123",
  "businessType": "restaurant",
  "primaryColor": "#EA1D2C",
  "categories": [
    {
      "id": 1,
      "name": "Pratos Principais",
      "description": "Nossos pratos especiais",
      "position": 1,
      "items": [
        {
          "id": 1,
          "name": "Feijoada Completa",
          "description": "Feijoada tradicional com acompanhamentos",
          "price": "R$ 24,90", // Formatado para exibição
          "priceCents": 2490,   // Valor em centavos
          "image": "/uploads/item/feijoada.jpg",
          "isFeatured": true,
          "isActive": true,
          "isArchived": false,
          "createdAt": "2024-01-15T10:30:00Z"
        }
      ]
    }
  ],
  "analytics": {
    "totalViews": 1250,
    "monthlyViews": 320,
    "totalOrders": 45
  }
}

// Errors
404 - Loja não encontrada ou não pertence ao usuário
```

### PATCH /api/stores/{id}
Atualiza campos específicos da loja.

```json
// Request Body (campos opcionais)
{
  "name": "Novo Nome",
  "description": "Nova descrição",
  "isActive": false,
  "primaryColor": "#FF5722"
}

// Response (200)
{
  "success": true,
  "store": {
    // Dados atualizados da loja
  }
}

// Errors
404 - Loja não encontrada
400 - Nenhum campo válido fornecido
```

### PUT /api/stores/{id}/toggle
Alterna status ativo/inativo da loja.

```json
// Request Body
{
  "isActive": false
}

// Response (200)
{
  "success": true,
  "store": {
    "id": 1,
    "isActive": false,
    "updatedAt": "2024-01-20T15:45:00Z"
  }
}
```

### POST /api/stores/check-slug
Verifica disponibilidade de slug.

```json
// Request Body
{
  "slug": "minha-nova-loja"
}

// Response (200)
{
  "available": true,
  "suggestions": ["minha-nova-loja-2", "minha-nova-loja-alt"]
}
```

## Gestão de Categorias

### GET/POST /api/stores/{storeId}/categories
Lista ou cria categorias da loja.

```json
// POST Request Body
{
  "name": "Bebidas",
  "description": "Bebidas geladas e quentes",
  "position": 2
}

// Response (201)
{
  "success": true,
  "category": {
    "id": 3,
    "name": "Bebidas",
    "description": "Bebidas geladas e quentes",
    "position": 2,
    "storeId": 1,
    "itemsCount": 0,
    "createdAt": "2024-01-20T16:00:00Z"
  }
}
```

### GET/PUT/DELETE /api/stores/{storeId}/categories/{categoryId}
Operações CRUD em categoria específica.

```json
// PUT Request Body
{
  "name": "Bebidas Especiais",
  "position": 1
}

// DELETE Response (200)
{
  "success": true,
  "message": "Categoria removida com sucesso"
}

// Errors
404 - Categoria não encontrada ou não pertence à loja
409 - Categoria possui itens (para DELETE)
```

## Gestão de Itens

### POST /api/items
Cria um novo item.

```json
// Request Body
{
  "name": "Hambúrguer Artesanal",
  "description": "Hambúrguer 200g com queijo e bacon",
  "price": "18.50", // String que será convertida para centavos
  "categoryId": 1,
  "image": "/uploads/item/hamburger.jpg",
  "isFeatured": true
}

// Response (201)
{
  "success": true,
  "item": {
    "id": 15,
    "name": "Hambúrguer Artesanal",
    "description": "Hambúrguer 200g com queijo e bacon",
    "price": "R$ 18,50",
    "priceCents": 1850,
    "categoryId": 1,
    "storeId": 1, // Derivado da categoria
    "image": "/uploads/item/hamburger.jpg",
    "isFeatured": true,
    "isActive": true,
    "isArchived": false,
    "createdAt": "2024-01-20T16:30:00Z"
  }
}

// Errors
400 - Nome obrigatório, preço inválido
404 - Categoria não encontrada ou não pertence ao usuário
422 - Dados de entrada inválidos
```

### PATCH /api/items/{id}
Atualiza campos do item.

```json
// Request Body (campos opcionais)
{
  "name": "Hambúrguer Premium",
  "price": "22.00",
  "isActive": false,
  "isFeatured": false
}

// Response (200)
{
  "success": true,
  "item": {
    // Dados atualizados do item
  }
}

// Cache Invalidation
// Automaticamente invalida cache da página pública: /{store_slug}
```

### DELETE /api/items/{id}
Remove item permanentemente.

```json
// Response (200)
{
  "success": true,
  "message": "Item excluído com sucesso"
}

// Soft Delete Alternative
// Para soft delete, use PATCH com { "isArchived": true }
```

## Upload de Arquivos

### POST /api/upload
Upload de imagens com validação.

```http
Content-Type: multipart/form-data

// Form Data
file: [arquivo de imagem]
type: "item" | "store"
storeId: "1" (opcional, para validação adicional)
```

```json
// Response (200)
{
  "success": true,
  "url": "/uploads/item/1642687200000-hamburger.jpg",
  "filename": "1642687200000-hamburger.jpg",
  "size": 245760,
  "type": "image/jpeg",
  "dimensions": {
    "width": 800,
    "height": 600
  }
}

// Errors
400 - Arquivo obrigatório, tipo inválido, tamanho excedido
413 - Arquivo muito grande (> 5MB)
415 - Tipo MIME não suportado (apenas JPEG, PNG, WebP)
```

**Validações de Upload:**
- Tamanho máximo: 5MB
- Tipos aceitos: `image/jpeg`, `image/png`, `image/webp`
- Nomenclatura: `{timestamp}-{original_name}`
- Diretório: `public/uploads/{type}/`

### DELETE /api/upload
Remove arquivo de imagem.

```json
// Query Parameters
?filename=1642687200000-hamburger.jpg&type=item

// Response (200)
{
  "success": true,
  "message": "Arquivo removido com sucesso"
}

// Errors
400 - Parâmetros obrigatórios
403 - Arquivo não pertence ao usuário
404 - Arquivo não encontrado
```

## Analytics

### GET /api/analytics/summary
Resumo de métricas gerais do usuário.

```json
// Response (200)
{
  "overview": {
    "totalStores": 3,
    "totalItems": 45,
    "totalViews": 12500,
    "totalOrders": 180
  },
  "thisMonth": {
    "newStores": 1,
    "newItems": 8,
    "views": 2300,
    "orders": 42
  },
  "topStores": [
    {
      "id": 1,
      "name": "Restaurante do João",
      "views": 5200,
      "orders": 85
    }
  ]
}
```

### GET /api/stores/{id}/analytics
Analytics específicos da loja.

```json
// Query Parameters (opcionais)
?period=30d&start=2024-01-01&end=2024-01-31

// Response (200)
{
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31",
    "days": 31
  },
  "metrics": {
    "totalViews": 1250,
    "uniqueVisitors": 890,
    "avgSessionDuration": "2m 34s",
    "bounceRate": 0.35,
    "topItems": [
      {
        "id": 1,
        "name": "Feijoada Completa",
        "views": 320,
        "orders": 25
      }
    ],
    "viewsByDay": [
      { "date": "2024-01-01", "views": 45 },
      { "date": "2024-01-02", "views": 52 }
    ]
  }
}
```

## Health Check

### GET /api/health/db
Verifica conectividade com banco de dados.

```json
// Response (200)
{
  "status": "healthy",
  "database": {
    "connected": true,
    "latency": "12ms",
    "version": "PostgreSQL 15.2"
  },
  "timestamp": "2024-01-20T17:00:00Z"
}

// Response (500) - Em caso de erro
{
  "status": "unhealthy",
  "database": {
    "connected": false,
    "error": "Connection timeout"
  },
  "timestamp": "2024-01-20T17:00:00Z"
}
```

## Rate Limiting

| Endpoint | Limite | Janela |
|----------|---------|---------|
| `POST /api/auth/*` | 5 req | 15 min |
| `POST /api/upload` | 10 req | 5 min |
| `POST /api/stores` | 3 req | 1 hora |
| Outros endpoints | 100 req | 15 min |

**Headers de Rate Limit:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642687500
```

## Paginação

Para endpoints que retornam listas, use parâmetros de query:

```http
GET /api/items?page=2&limit=20&sort=createdAt&order=desc
```

```json
// Response com paginação
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": true
  }
}
```

## Webhooks (Futuro)

### POST /api/webhooks/payment
Webhook para processamento de pagamentos.

```json
// Request Body (exemplo)
{
  "event": "payment.completed",
  "data": {
    "paymentId": "pay_123456",
    "storeId": 1,
    "amount": 2490,
    "status": "completed"
  },
  "timestamp": "2024-01-20T17:30:00Z"
}
```

## Códigos de Status HTTP

| Código | Significado | Quando usar |
|--------|-------------|-------------|
| `200` | OK | Operação bem-sucedida |
| `201` | Created | Recurso criado com sucesso |
| `400` | Bad Request | Dados de entrada inválidos |
| `401` | Unauthorized | Não autenticado |
| `403` | Forbidden | Sem permissão para o recurso |
| `404` | Not Found | Recurso não encontrado |
| `409` | Conflict | Conflito (ex: slug duplicado) |
| `413` | Payload Too Large | Arquivo muito grande |
| `415` | Unsupported Media Type | Tipo de arquivo não suportado |
| `422` | Unprocessable Entity | Validação de negócio falhou |
| `429` | Too Many Requests | Rate limit excedido |
| `500` | Internal Server Error | Erro do servidor |

## Versionamento

A API atual é v1 (implícita). Futuras versões serão prefixadas:
- `/api/v2/stores`
- Header: `Accept: application/vnd.smartcard.v2+json`