import pool from '@/lib/db';

// Templates disponíveis com suas configurações
const templates = {
  'barbearia': {
    name: 'Barbearia',
    categories: [
      { name: 'Cortes', order: 1 },
      { name: 'Barba', order: 2 },
      { name: 'Tratamentos', order: 3 }
    ],
    items: [
      { categoryName: 'Cortes', name: 'Corte Masculino', description: 'Corte tradicional masculino', price: 25.00 },
      { categoryName: 'Cortes', name: 'Corte + Barba', description: 'Corte masculino com acabamento de barba', price: 35.00 },
      { categoryName: 'Barba', name: 'Barba Completa', description: 'Barba feita com navalha', price: 20.00 },
      { categoryName: 'Tratamentos', name: 'Hidratação Capilar', description: 'Tratamento hidratante para cabelos', price: 40.00 }
    ]
  },
  'restaurante': {
    name: 'Restaurante',
    categories: [
      { name: 'Entradas', order: 1 },
      { name: 'Pratos Principais', order: 2 },
      { name: 'Sobremesas', order: 3 },
      { name: 'Bebidas', order: 4 }
    ],
    items: [
      { categoryName: 'Entradas', name: 'Bruschetta', description: 'Pão italiano com tomate e manjericão', price: 18.00 },
      { categoryName: 'Pratos Principais', name: 'Lasanha Bolonhesa', description: 'Lasanha tradicional com molho bolonhesa', price: 35.00 },
      { categoryName: 'Sobremesas', name: 'Tiramisu', description: 'Sobremesa italiana com café', price: 15.00 },
      { categoryName: 'Bebidas', name: 'Refrigerante', description: 'Lata 350ml', price: 6.00 }
    ]
  },
  'loja': {
    name: 'Loja Geral',
    categories: [
      { name: 'Produtos', order: 1 },
      { name: 'Serviços', order: 2 }
    ],
    items: [
      { categoryName: 'Produtos', name: 'Produto Exemplo', description: 'Descrição do produto', price: 10.00 },
      { categoryName: 'Serviços', name: 'Serviço Exemplo', description: 'Descrição do serviço', price: 50.00 }
    ]
  }
};

export const businessTemplates = {
  async applyTemplateToStore(storeId: string, templateId: string, userId: string) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      console.log(`Iniciando aplicação do template ${templateId} à loja ${storeId}`);
      
      // Verificar se a loja pertence ao usuário
      const storeResult = await client.query(
        'SELECT id, name FROM stores WHERE id = $1 AND userid = $2',
        [storeId, userId]
      );

      if (storeResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return { success: false, error: 'Loja não encontrada ou sem permissão' };
      }

      const store = storeResult.rows[0];
      console.log(`Loja encontrada: ${store.name}`);

      // Verificar se o template existe
      const template = templates[templateId as keyof typeof templates];
      if (!template) {
        await client.query('ROLLBACK');
        return { success: false, error: 'Template não encontrado' };
      }

      console.log(`Template encontrado: ${template.name}`);

      // Limpar categorias e itens existentes da loja
      console.log('Limpando categorias e itens existentes...');
      await client.query('DELETE FROM items WHERE storeid = $1', [storeId]);
      await client.query('DELETE FROM categories WHERE storeid = $1', [storeId]);

      // Criar categorias do template
      console.log('Criando categorias...');
      const categoryMap = new Map();
      
      for (const category of template.categories) {
        const categoryResult = await client.query(
          `INSERT INTO categories (name, storeid, "order", created_at, updated_at) 
           VALUES ($1, $2, $3, NOW(), NOW()) 
           RETURNING id, name`,
          [category.name, storeId, category.order]
        );
        
        const createdCategory = categoryResult.rows[0];
        categoryMap.set(category.name, createdCategory.id);
        console.log(`Categoria criada: ${createdCategory.name} (ID: ${createdCategory.id})`);
      }

      // Criar itens do template
      console.log('Criando itens...');
      for (const item of template.items) {
        const categoryId = categoryMap.get(item.categoryName);
        if (!categoryId) {
          console.warn(`Categoria não encontrada para item: ${item.name}`);
          continue;
        }

        const priceCents = Math.round(item.price * 100);
        
        await client.query(
          `INSERT INTO items (name, description, price_cents, categoryid, storeid, isactive, isarchived, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, true, false, NOW(), NOW())`,
          [item.name, item.description, priceCents, categoryId, storeId]
        );
        
        console.log(`Item criado: ${item.name} - R$ ${item.price}`);
      }

      // Confirmar transação
      await client.query('COMMIT');
      
      console.log(`Template ${templateId} aplicado com sucesso à loja ${storeId}`);
      
      return {
        success: true,
        store: {
          id: store.id,
          name: store.name,
          template: template.name,
          categoriesCreated: template.categories.length,
          itemsCreated: template.items.length
        }
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao aplicar template:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno ao aplicar template'
      };
    } finally {
      client.release();
    }
  },

  // Método para listar templates disponíveis
  getAvailableTemplates() {
    return Object.entries(templates).map(([id, template]) => ({
      id,
      name: template.name,
      categoriesCount: template.categories.length,
      itemsCount: template.items.length
    }));
  }
};
