# Estratégia de Testes - Smartcard7

## Visão Geral

A estratégia de testes do Smartcard7 garante a qualidade, segurança e confiabilidade da plataforma através de uma abordagem em camadas: testes unitários, de integração e end-to-end (E2E). O foco está nos fluxos críticos de negócio e na prevenção de vazamentos entre tenants.

## Arquitetura de Testes

### Pirâmide de Testes
```
        E2E (10%)
      Integration (20%)
    Unit Tests (70%)
```

### Stack de Ferramentas
- **Vitest**: Testes unitários e de integração (rápido, compatível com Vite)
- **Playwright**: Testes E2E multi-browser
- **Testing Library**: Testes de componentes React
- **MSW**: Mock de APIs para testes isolados

## Configuração do Ambiente de Testes

### Instalação e Setup
```bash
# Instalar dependências de teste
pnpm install -D vitest @vitejs/plugin-react jsdom
pnpm install -D @testing-library/react @testing-library/jest-dom
pnpm install -D playwright msw

# Instalar browsers do Playwright
pnpm exec playwright install

# Configurar banco de teste
createdb smartcard7_test
psql $POSTGRES_TEST_URL -f sql/01_tables.sql
psql $POSTGRES_TEST_URL -f sql/02_indexes.sql
```

### Configuração do Vitest
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'e2e'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'public/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Setup Global de Testes
```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { server } from './mocks/server';

// Configurar MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock de variáveis de ambiente
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.POSTGRES_URL = 'postgresql://test:test@localhost:5432/smartcard7_test';
```

## Testes Unitários

### Utilitários e Funções Pure
```typescript
// tests/unit/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatPrice, priceToHumanReadable } from '@/lib/utils';

describe('Utilitários de Preço', () => {
  it('deve converter centavos para reais formatados', () => {
    expect(formatPrice(2490)).toBe('R$ 24,90');
    expect(formatPrice(0)).toBe('R$ 0,00');
    expect(formatPrice(999999)).toBe('R$ 9.999,99');
  });

  it('deve lidar com valores extremos', () => {
    expect(formatPrice(-100)).toBe('R$ 0,00'); // Valores negativos = 0
    expect(formatPrice(1)).toBe('R$ 0,01');
    expect(formatPrice(10)).toBe('R$ 0,10');
  });

  it('deve converter string de preço para centavos', () => {
    expect(priceToHumanReadable('24.90')).toBe(2490);
    expect(priceToHumanReadable('0')).toBe(0);
    expect(priceToHumanReadable('99.99')).toBe(9999);
  });
});
```

### Validação de Schemas
```typescript
// tests/unit/validation.test.ts
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { createItemSchema, createStoreSchema } from '@/lib/validation';

describe('Validação de Schemas', () => {
  describe('createItemSchema', () => {
    it('deve aceitar dados válidos', () => {
      const validItem = {
        name: 'Hambúrguer Artesanal',
        price: '18.50',
        description: 'Delicioso hambúrguer',
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
      };

      expect(() => createItemSchema.parse(validItem)).not.toThrow();
    });

    it('deve rejeitar nome muito curto', () => {
      const invalidItem = {
        name: 'AB', // Muito curto
        price: '18.50',
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
      };

      expect(() => createItemSchema.parse(invalidItem)).toThrow();
    });

    it('deve rejeitar preço inválido', () => {
      const invalidItem = {
        name: 'Hambúrguer Artesanal',
        price: 'preço inválido',
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
      };

      expect(() => createItemSchema.parse(invalidItem)).toThrow();
    });
  });
});
```

### Componentes React
```typescript
// tests/unit/components/ProductCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/molecules/ProductCard';

const mockItem = {
  id: 1,
  name: 'Hambúrguer Artesanal',
  description: 'Delicioso hambúrguer',
  price: 'R$ 18,50',
  priceCents: 1850,
  image: '/uploads/item/burger.jpg',
  isFeatured: true,
  isActive: true,
};

describe('ProductCard', () => {
  it('deve renderizar informações do produto', () => {
    render(<ProductCard item={mockItem} />);

    expect(screen.getByText('Hambúrguer Artesanal')).toBeInTheDocument();
    expect(screen.getByText('Delicioso hambúrguer')).toBeInTheDocument();
    expect(screen.getByText('R$ 18,50')).toBeInTheDocument();
  });

  it('deve mostrar badge de destaque quando item for featured', () => {
    render(<ProductCard item={mockItem} />);
    
    expect(screen.getByText('Destaque')).toBeInTheDocument();
  });

  it('deve chamar onEdit quando botão de editar for clicado', () => {
    const mockOnEdit = vi.fn();
    render(<ProductCard item={mockItem} onEdit={mockOnEdit} />);

    const editButton = screen.getByRole('button', { name: /editar/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockItem);
  });
});
```

## Testes de Integração

### API Routes
```typescript
// tests/integration/api/stores.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/stores/route';
import { GET } from '@/app/api/stores/route';
import { pool } from '@/lib/db';

describe('/api/stores', () => {
  beforeEach(async () => {
    // Limpar banco de teste
    await pool.query('TRUNCATE TABLE stores, users CASCADE');
    
    // Inserir usuário de teste
    await pool.query(`
      INSERT INTO users (id, name, email, password_hash)
      VALUES (1, 'Test User', 'test@example.com', 'hashed_password')
    `);
  });

  afterEach(async () => {
    await pool.query('TRUNCATE TABLE stores, users CASCADE');
  });

  describe('POST /api/stores', () => {
    it('deve criar uma nova loja com dados válidos', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'Restaurante Teste',
          slug: 'restaurante-teste',
          description: 'Um restaurante de teste',
        },
      });

      // Mock da sessão
      const mockSession = {
        user: { id: '1', email: 'test@example.com' },
      };

      vi.mock('next-auth', () => ({
        getServerSession: () => Promise.resolve(mockSession),
      }));

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.store.name).toBe('Restaurante Teste');
      expect(data.store.slug).toBe('restaurante-teste');
    });

    it('deve rejeitar slug duplicado', async () => {
      // Inserir loja existente
      await pool.query(`
        INSERT INTO stores (userid, name, slug, description)
        VALUES (1, 'Loja Existente', 'loja-teste', 'Descrição')
      `);

      const { req } = createMocks({
        method: 'POST',
        body: {
          name: 'Nova Loja',
          slug: 'loja-teste', // Slug duplicado
          description: 'Nova descrição',
        },
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/stores', () => {
    it('deve retornar apenas lojas do usuário logado', async () => {
      // Inserir lojas de diferentes usuários
      await pool.query(`
        INSERT INTO users (id, name, email) VALUES (2, 'User 2', 'user2@test.com');
        INSERT INTO stores (userid, name, slug) VALUES 
          (1, 'Loja User 1', 'loja-user-1'),
          (2, 'Loja User 2', 'loja-user-2');
      `);

      const { req } = createMocks({ method: 'GET' });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stores).toHaveLength(1);
      expect(data.stores[0].name).toBe('Loja User 1');
    });
  });
});
```

### Banco de Dados
```typescript
// tests/integration/database/multi-tenant.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { pool } from '@/lib/db';

describe('Isolamento Multi-Tenant', () => {
  let user1Id: number;
  let user2Id: number;
  let store1Id: number;
  let store2Id: number;

  beforeEach(async () => {
    // Criar usuários de teste
    const user1 = await pool.query(`
      INSERT INTO users (name, email) 
      VALUES ('User 1', 'user1@test.com') 
      RETURNING id
    `);
    const user2 = await pool.query(`
      INSERT INTO users (name, email) 
      VALUES ('User 2', 'user2@test.com') 
      RETURNING id
    `);

    user1I